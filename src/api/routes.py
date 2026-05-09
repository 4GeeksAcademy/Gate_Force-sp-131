"""
API Server Routes: Handles Auth, Roles, and HR Operations.
All functions and declarations are in English for professional standards.
"""
from flask import request, jsonify, Blueprint
from api.models import (
    db, Employee, UserAdmin, Company, WorkRecord, Nomina,
    Incident, Vacaciones, Schedule, Survey, Question,
    SurveyResponse, SurveyAnswer, StatusEnum, IncidentTypeEnum, RoleEnum, AuditLog, WellnessCheck,
    ChatMessage, PeerChatMessage
)
from flask_cors import CORS
from datetime import datetime, timedelta
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash
from api.utils import analyze_emotions_with_gemini
from sqlalchemy import cast, String
from api.socket import socketio
from flask_socketio import emit, join_room, leave_room



api = Blueprint('api', __name__)
CORS(api)

# ==========================================
# 1. HELPERS AND DECORATORS
# ==========================================


def role_required(*allowed_roles):
    """
    Decorator to restrict access based on JWT claims.
    Usage: @role_required("ADMIN", "COMPANY")
    """
    def decorator(fn):
        @wraps(fn)
        @jwt_required()
        def wrapper(*args, **kwargs):
            claims = get_jwt()
            user_role = claims.get("role")
            if user_role not in allowed_roles:
                return jsonify({"msg": f"Access denied. Required: {allowed_roles}"}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator


def log_action(user_id, role, action, table=None):
    """Utility to record actions in the AuditLog table."""
    new_log = AuditLog(
        user_id=user_id,
        user_role=role,
        action=action,
        target_table=table
    )
    db.session.add(new_log)
    db.session.commit()

# ==========================================
# 2. AUTHENTICATION (Unified Login)
# ==========================================


@api.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get("email")  # Admin uses username here
    password = data.get("password")

    if not email or not password:
        return jsonify({"msg": "Credentials missing"}), 400

    # 1. Check Admin
    user = UserAdmin.query.filter_by(username=email).first()
    role = "ADMIN"

    # 2. Check Company
    if not user:
        user = Company.query.filter_by(email=email).first()
        role = "COMPANY"

    # 3. Check Employee
    if not user:
        user = Employee.query.filter_by(email=email).first()
        role = "EMPLOYEE"

    # Validate Password — support both hashed (company/employee) and plaintext (admin)
    if not user:
        return jsonify({"msg": "Invalid email/username or password"}), 401
    stored = user.password
    password_ok = (
        stored == password  # plaintext fallback (admin created manually in DB)
        or (stored.startswith("pbkdf2:") or stored.startswith("scrypt:") or stored.startswith("$2"))
        and check_password_hash(stored, password)
    )
    if not password_ok:
        return jsonify({"msg": "Invalid email/username or password"}), 401

    if hasattr(user, 'is_active') and not user.is_active:
        return jsonify({"msg": "This account is inactive"}), 403

    # Create Token with Role Claim
    token = create_access_token(
        identity=str(user.id),
        additional_claims={"role": role}
    )

    return jsonify({
        "token": token,
        "role": role,
        "user": user.serialize()
    }), 200

# ==========================================
# 3. COMPANY MANAGEMENT
# ==========================================


@api.route('/companies', methods=['POST'])
def signup_company():
    """Register a new company (Public or Admin route)"""
    data = request.json
    if Company.query.filter_by(email=data.get("email")).first():
        return jsonify({"msg": "Email already registered"}), 400

    new_company = Company(
        nombre_empresa=data.get("nombre_empresa"),
        email=data.get("email"),
        password=generate_password_hash(data.get("password")),
        region=data.get("region"),
        logo_url=data.get("logo_url")
    )
    db.session.add(new_company)
    db.session.commit()
    return jsonify(new_company.serialize()), 201


@api.route('/companies', methods=['GET'])
@role_required("ADMIN")
def get_all_companies():
    companies = Company.query.all()
    return jsonify([c.serialize() for c in companies]), 200


@api.route('/companies/<int:company_id>/employees', methods=['GET'])
@role_required("ADMIN")
def get_company_employees(company_id):
    employees = Employee.query.filter_by(company_id=company_id).all()
    return jsonify([e.serialize() for e in employees]), 200


@api.route('/companies/<int:company_id>', methods=['PUT'])
@role_required("ADMIN")
def update_company(company_id):
    identity = get_jwt_identity()
    role = get_jwt().get("role")

    company = Company.query.get(company_id)
    if not company:
        return jsonify({"msg": "Company not found"}), 404

    data = request.get_json() or {}

    try:
        if "is_active" in data:
            previous = company.is_active
            company.is_active = bool(data["is_active"])
            if previous != company.is_active:
                action = "Activated" if company.is_active else "Deactivated"
                log_action(identity, role,
                           f"{action} company {company.nombre_empresa}", "companies")

        if "nombre_empresa" in data:
            company.nombre_empresa = data["nombre_empresa"]
        if "region" in data:
            company.region = data["region"]
        if "logo_url" in data:
            company.logo_url = data["logo_url"]

        db.session.commit()
        return jsonify(company.serialize()), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": f"Internal server error: {str(e)}"}), 500


@api.route('/admin/audit-logs', methods=['GET'])
@role_required("ADMIN")
def get_audit_logs():
    logs = (
        AuditLog.query
        .filter(
            ((AuditLog.user_role == "COMPANY") & (AuditLog.target_table == "employees")) |
            ((AuditLog.user_role == "ADMIN")   & (AuditLog.target_table == "companies"))
        )
        .order_by(AuditLog.created_at.desc())
        .limit(300)
        .all()
    )
    result = []
    for log in logs:
        if log.user_role == "ADMIN":
            result.append({
                "id": log.id,
                "company_id": None,
                "company_name": "Admin",
                "company_logo": None,
                "action": log.action,
                "created_at": log.created_at.strftime("%Y-%m-%d %H:%M") if log.created_at else None,
            })
            continue

        try:
            company = Company.query.get(int(log.user_id))
        except Exception:
            company = None
        result.append({
            "id": log.id,
            "company_id": log.user_id,
            "company_name": company.nombre_empresa if company else "Unknown",
            "company_logo": company.logo_url if company else None,
            "action": log.action,
            "created_at": log.created_at.strftime("%Y-%m-%d %H:%M") if log.created_at else None,
        })
    return jsonify(result), 200


@api.route('/company/profile', methods=['PUT'])
@role_required("COMPANY")
def update_company_profile():
    identity = get_jwt_identity()
    data = request.json
    company = Company.query.get(int(identity))
    if not company:
        return jsonify({"msg": "Company not found"}), 404
    if "logo_url" in data:
        company.logo_url = data["logo_url"]
    db.session.commit()
    return jsonify(company.serialize()), 200

# ==========================================
# 4. EMPLOYEE MANAGEMENT
# ==========================================


@api.route('/employees', methods=['POST'])
@role_required("COMPANY", "ADMIN")
def create_employee():
    data = request.json
    identity = get_jwt_identity()
    role = get_jwt().get("role")

    # Validación básica de seguridad: datos obligatorios
    required_fields = ["email", "password", "first_name", "last_name"]
    if not all(field in data for field in required_fields):
        return jsonify({"msg": "Missing required fields"}), 400

    # Determinar a qué empresa pertenece el empleado
    company_id = identity if role == "COMPANY" else data.get("company_id")

    if not company_id:
        return jsonify({"msg": "Company ID is required for admin actions"}), 400

    # Comprobar si el email ya existe (Integridad de datos)
    if Employee.query.filter_by(email=data.get("email")).first():
        return jsonify({"msg": "Email already exists"}), 400

    try:
        new_employee = Employee(
            company_id=company_id,
            first_name=data.get("first_name"),
            last_name=data.get("last_name"),
            email=data.get("email"),
            password=generate_password_hash(
                data.get("password")),  # Seguridad: Hash siempre
            phone=data.get("phone"),
            position=data.get("position"),
            profile_image=data.get("profile_image"),
            is_active=True
        )

        db.session.add(new_employee)
        db.session.commit()  # Guardamos los cambios

        # Registro de auditoría (Log)
        log_action(identity, role,
                   f"Created employee {new_employee.email}", "employees")

        return jsonify(new_employee.serialize()), 201

    except Exception as e:
        db.session.rollback()  # Si algo falla, revertimos para no dejar datos corruptos
        return jsonify({"msg": f"Internal server error: {str(e)}"}), 500


@api.route('/employees', methods=['GET'])
@role_required("COMPANY", "ADMIN")
def get_employees():
    identity = get_jwt_identity()
    role = get_jwt().get("role")

    if role == "ADMIN":
        employees = Employee.query.all()
    else:
        employees = Employee.query.filter_by(
            company_id=identity, is_active=True).all()

    return jsonify([e.serialize() for e in employees]), 200


@api.route('/employees/<int:employee_id>', methods=['GET'])
@jwt_required()
def get_single_employee(employee_id):
    # Solo la empresa dueña o un ADMIN pueden ver al empleado
    identity = get_jwt_identity()
    role = get_jwt().get("role")

    employee = Employee.query.get(employee_id)
    if not employee:
        return jsonify({"msg": "Employee not found"}), 404

    # Seguridad: Evitar que una empresa vea empleados de otra
    if role == "COMPANY" and str(employee.company_id) != str(identity):
        return jsonify({"msg": "Unauthorized"}), 403

    return jsonify(employee.serialize()), 200


@api.route('/employees/<int:employee_id>', methods=['PUT'])
@jwt_required()
def update_employee(employee_id):
    data = request.json
    employee = Employee.query.get(employee_id)

    if not employee:
        return jsonify({"msg": "Employee not found"}), 404

    # Actualizamos campos permitidos
    employee.first_name = data.get("first_name", employee.first_name)
    employee.last_name = data.get("last_name", employee.last_name)
    employee.email = data.get("email", employee.email)
    employee.phone = data.get("phone", employee.phone)
    employee.position = data.get("position", employee.position)
    employee.is_active = data.get("is_active", employee.is_active)
    employee.profile_image = data.get("profile_image", employee.profile_image)

    db.session.commit()
    return jsonify({"msg": "Employee updated", "employee": employee.serialize()}), 200


@api.route('/employees/<int:employee_id>', methods=['DELETE'])
@jwt_required()
def delete_employee(employee_id):
    identity = get_jwt_identity()
    role = get_jwt().get("role")

    employee = Employee.query.get(employee_id)
    if not employee:
        return jsonify({"msg": "Employee not found"}), 404

    # Seguridad: Solo la empresa dueña puede dar de baja
    if role == "COMPANY" and str(employee.company_id) != str(identity):
        return jsonify({"msg": "Unauthorized"}), 403

    # Aplicamos el Borrado Lógico (Desactivación)
    employee.is_active = False
    db.session.commit()

    # Registramos la acción en la auditoría
    log_action(identity, role,
               f"Deactivated employee {employee.email}", "employees")

    return jsonify({"msg": "Employee deactivated successfully"}), 200


@api.route('/employee/my-requests', methods=['GET'])
@jwt_required()
def get_my_requests():
    user_id = get_jwt_identity()

    # Obtenemos ambos tipos de registros
    incidents = Incident.query.filter_by(employee_id=user_id).all()
    vacations = Vacaciones.query.filter_by(employee_id=user_id).all()

    # Unimos las listas serializadas
    # Agregamos una marca manual de 'type' a vacaciones para que el badge funcione
    history = [i.serialize() for i in incidents]

    for v in vacations:
        serialized_v = v.serialize()
        # Marca para facilitar la lógica en React
        serialized_v["is_vacation"] = True
        history.append(serialized_v)

    return jsonify(history), 200
# ==========================================
# 5. WORK RECORDS (TIME TRACKING)
# ==========================================


@api.route('/work-records', methods=['GET'])
@jwt_required()  # Opcional: Validar que sea rol Admin
def get_all_work_records():
    # Traemos todos los registros, ordenados por los más recientes primero
    records = WorkRecord.query.order_by(WorkRecord.check_in.desc()).all()
    return jsonify([r.serialize() for r in records]), 200


@api.route('/work-records/mine', methods=['GET'])
@jwt_required()
def get_my_work_records():
    employee_id = get_jwt_identity()
    records = (
        WorkRecord.query
        .filter_by(employee_id=employee_id)
        .order_by(WorkRecord.check_in.desc())
        .all()
    )
    return jsonify([r.serialize() for r in records]), 200


@api.route('/work-records/status', methods=['GET'])
@jwt_required()
def get_work_status():
    employee_id = get_jwt_identity()
    # Buscamos si hay un registro sin hora de salida
    active_session = WorkRecord.query.filter_by(
        employee_id=employee_id, check_out=None).first()

    return jsonify({
        "is_on_clock": active_session is not None,
        "session": active_session.serialize() if active_session else None
    }), 200

# --- FICHAR ENTRADA ---


@api.route('/work-records/check-in', methods=['POST'])
@jwt_required()
def check_in():
    employee_id = get_jwt_identity()
    data = request.json or {}

    exists = WorkRecord.query.filter_by(
        employee_id=employee_id, check_out=None).first()
    if exists:
        return jsonify({"msg": "Ya tienes un turno activo"}), 400

    new_record = WorkRecord(
        employee_id=employee_id,
        check_in=datetime.utcnow(),
        location=data.get("location")
    )
    db.session.add(new_record)
    db.session.commit()
    return jsonify(new_record.serialize()), 201

# --- FICHAR SALIDA ---


@api.route('/work-records/check-out', methods=['POST'])
@jwt_required()
def check_out():
    employee_id = get_jwt_identity()
    active_session = WorkRecord.query.filter_by(
        employee_id=employee_id, check_out=None).first()

    if not active_session:
        return jsonify({"msg": "No hay turno activo para cerrar"}), 400

    active_session.check_out = datetime.utcnow()

    diferencia = active_session.check_out - active_session.check_in
    active_session.total_hours = round(diferencia.total_seconds() / 3600, 2)
    active_session.status = StatusEnum.APPROVED

    db.session.commit()
    return jsonify(active_session.serialize()), 200

# ==========================================
# 6. PAYROLL, SCHEDULES, INCIDENTS, AND VACATIONS
# ==========================================


@api.route('/payroll/upload', methods=['POST'])
@role_required("COMPANY", "ADMIN")
def upload_payroll():
    data = request.json
    new_slip = Nomina(
        employee_id=data.get("employee_id"),
        month=data.get("month"),
        document_url=data.get("url")
    )
    db.session.add(new_slip)
    db.session.commit()
    return jsonify(new_slip.serialize()), 201

@api.route('/payroll/mine', methods=['GET'])
@role_required("EMPLOYEE")
def get_my_payrolls():
    employee_id = int(get_jwt_identity())
    payrolls = Nomina.query.filter_by(employee_id=employee_id).order_by(Nomina.id.desc()).all()
    return jsonify([p.serialize() for p in payrolls]), 200

@api.route('/employees/<int:employee_id>/schedules', methods=['POST'])
@role_required("COMPANY", "ADMIN")
def set_schedule(employee_id):
    data = request.json
    new_schedule = Schedule(
        employee_id=employee_id,
        day=data.get("day"),
        start_time=datetime.strptime(data.get("start"), "%H:%M"),
        end_time=datetime.strptime(data.get("end"), "%H:%M")
    )
    db.session.add(new_schedule)
    db.session.commit()
    return jsonify(new_schedule.serialize()), 201


@api.route('/my-schedules', methods=['GET'])
@jwt_required()
def get_my_schedules():
    try:
        employee_id = get_jwt_identity()

        # Traemos todos los horarios ordenados
        all_schedules = Schedule.query.filter_by(
            employee_id=employee_id).order_by(Schedule.day).all()

        # Filtro de unicidad: usamos un diccionario para quedarnos solo con uno por día
        unique_schedules = {}
        for s in all_schedules:
            if s.day not in unique_schedules:
                unique_schedules[s.day] = s.serialize()

        # Devolvemos solo los valores únicos convertidos en lista
        return jsonify(list(unique_schedules.values())), 200

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"msg": "Error al cargar horarios"}), 500


@api.route('/incidents/request', methods=['POST'])
@jwt_required()
def request_incident():
    try:
        data = request.json
        employee_id = get_jwt_identity()

        # Forzamos todo a mayúsculas: "PERSONAL" o "LABORAL"
        tipo_final = str(data.get("type", "PERSONAL")).upper()

        new_incident = Incident(
            employee_id=int(employee_id),
            description=data.get("description"),
            type=tipo_final,
            status="PENDING"  # <--- ¡LA MAGIA ESTÁ AQUÍ! En mayúsculas.
        )

        db.session.add(new_incident)
        db.session.commit()

        return jsonify({"msg": "Incidencia reportada con éxito"}), 201

    except Exception as e:
        db.session.rollback()
        print(f"--- ERROR CRÍTICO --- \n {str(e)}")
        return jsonify({"msg": "Error en el servidor", "error": str(e)}), 500


@api.route('/vacations/request', methods=['POST'])
@jwt_required()
def request_vacation():
    try:
        data = request.json
        employee_id = get_jwt_identity()

        # 1. Convertimos los textos en objetos de fecha reales
        start_dt = datetime.strptime(data.get("start_date"), '%Y-%m-%d')
        end_dt = datetime.strptime(data.get("end_date"), '%Y-%m-%d')

        # 2. Calculamos la diferencia de días
        # Sumamos 1 para que incluya tanto el día de inicio como el de fin
        delta = (end_dt - start_dt).days + 1

        if delta <= 0:
            return jsonify({"msg": "La fecha de fin debe ser posterior a la de inicio"}), 400

        # 3. Creamos el registro incluyendo 'days_requested'
        new_request = Vacaciones(
            employee_id=employee_id,
            start_date=start_dt,
            end_date=end_dt,
            days_requested=delta,
            status=StatusEnum.PENDING
        )

        db.session.add(new_request)
        db.session.commit()
        return jsonify({"msg": "Vacation request submitted"}), 201

    except Exception as e:
        db.session.rollback()
        print(f"Error en vacaciones: {str(e)}")
        return jsonify({"msg": "Server error", "error": str(e)}), 500


@api.route('/company/all-requests', methods=['GET'])
@jwt_required()
def get_all_company_requests():
    # Obtenemos absolutamente todo
    incidents = Incident.query.all()
    vacations = Vacaciones.query.all()

    all_requests = []

    # Procesamos incidencias
    for i in incidents:
        item = i.serialize()
        item["is_vacation"] = False
        item["request_type"] = item.get("type", "INCIDENCIA")
        all_requests.append(item)

    # Procesamos vacaciones
    for v in vacations:
        item = v.serialize()
        item["is_vacation"] = True
        item["request_type"] = "VACACIONES"
        all_requests.append(item)

    # Opcional: Podríamos ordenarlas aquí, pero lo haremos en React para mayor flexibilidad
    return jsonify(all_requests), 200


@api.route('/company/resolve-request', methods=['PUT'])
@jwt_required()
def resolve_company_request():
    body = request.get_json()

    # Extraemos los datos que nos envía React
    req_id = body.get("id")
    is_vacation = body.get("is_vacation")
    new_status = body.get("status")  # Llegará como 'APPROVED' o 'REJECTED'

    # Validaciones básicas
    if not req_id or new_status not in ['APPROVED', 'REJECTED']:
        return jsonify({"msg": "Datos inválidos"}), 400

    # Decidimos a qué tabla de la base de datos apuntar
    if is_vacation:
        target = Vacaciones.query.get(req_id)
    else:
        target = Incident.query.get(req_id)

    # Si por alguna razón no existe, avisamos
    if not target:
        return jsonify({"msg": "Solicitud no encontrada"}), 404

    # ¡Aplicamos el veredicto!
    target.status = new_status
    db.session.commit()

    return jsonify({"msg": "Estado actualizado con éxito", "status": new_status}), 200


@api.route('/company/stats', methods=['GET'])
@jwt_required()
def get_company_stats():
    try:
        company_id = get_jwt_identity()

        # 1. Total de empleados de la empresa
        total_employees = Employee.query.filter_by(
            company_id=company_id).count()

        # 2. Solicitudes Pendientes (opcional para el futuro)
        pending_vacations = Vacaciones.query.join(Employee).filter(
            Employee.company_id == company_id,
            Vacaciones.status == 'PENDING'
        ).count()
        pending_incidents = Incident.query.join(Employee).filter(
            Employee.company_id == company_id,
            Incident.status == 'PENDING'
        ).count()
        total_pending = pending_vacations + pending_incidents

        # 3. EL RADAR: Turnos activos (check_out es nulo)
        active_clocks = WorkRecord.query.join(Employee).filter(
            Employee.company_id == company_id,
            WorkRecord.check_out == None  # ¡Aquí está el truco!
        ).count()

        return jsonify({
            "totalEmployees": total_employees,
            "totalPending": total_pending,
            "activeClocks": active_clocks
        }), 200

    except Exception as e:
        print(f"Error cargando estadísticas: {str(e)}")
        return jsonify({"msg": "Error interno del servidor"}), 500


@api.route('/company/surveys', methods=['GET'])
# Use el decorador que corresponda a sus administradores
@role_required("COMPANY", "ADMIN")
def get_company_surveys():
    try:
        # 1. Obtenemos todas las encuestas ordenadas desde la más reciente a la más antigua
        surveys = Survey.query.order_by(Survey.created_at.desc()).all()

        result = []
        for s in surveys:
            # 2. Contamos matemáticamente cuántas respuestas tiene esta encuesta en particular
            response_count = SurveyResponse.query.filter_by(
                survey_id=s.id).count()

            # 3. Empaquetamos los datos agregando el contador
            survey_data = s.serialize()
            survey_data["response_count"] = response_count

            result.append(survey_data)

        return jsonify(result), 200

    except Exception as e:
        print(f"Error obteniendo el historial de encuestas: {str(e)}")
        return jsonify({"msg": "Error interno del servidor obteniendo el historial"}), 500


@api.route('/company/surveys/<int:survey_id>/results', methods=['GET'])
@role_required("COMPANY", "ADMIN")
def get_survey_results(survey_id):
    try:
        # 1. Buscamos la encuesta
        survey = Survey.query.get(survey_id)
        if not survey:
            return jsonify({"msg": "Encuesta no encontrada"}), 404

        # 2. Buscamos todas las respuestas de esa encuesta
        responses = SurveyResponse.query.filter_by(survey_id=survey_id).all()

        # 3. Empaquetamos todo
        results_data = {
            "survey_info": survey.serialize(),
            "responses": []
        }

        for resp in responses:
            # Buscamos el empleado para saber su nombre
            emp = Employee.query.get(resp.employee_id)

            resp_data = resp.serialize()
            resp_data["employee_name"] = f"{emp.first_name} {emp.last_name}" if emp else "Empleado Desconocido"

            results_data["responses"].append(resp_data)

        return jsonify(results_data), 200

    except Exception as e:
        print(f"Error obteniendo resultados de la encuesta: {str(e)}")
        return jsonify({"msg": "Error interno del servidor al cargar resultados"}), 500


@api.route('/company/ai-insights', methods=['GET'])
@role_required("COMPANY", "ADMIN")
def get_ai_insights():
    identity = get_jwt_identity()
    print(f"🔍 Buscando insights para la identidad ID: {identity}")

    try:
        # 1. ¿Existen chequeos en la base de datos sin filtrar? (Para debug)
        total_global = WellnessCheck.query.count()
        print(f"📊 Total de chequeos en toda la DB: {total_global}")

        # 2. Tu consulta con JOIN
        checks = db.session.query(WellnessCheck).join(
            Employee).filter(Employee.company_id == identity).all()

        print(f"✅ Chequeos encontrados para esta empresa: {len(checks)}")

        if not checks:
            return jsonify({
                "average_score": 0,
                "stats": {"joy": 0, "stress": 0, "sadness": 0, "calm": 0},
                "total_checks": 0,
                "history": [],
                "msg": f"No hay datos. (ID Empresa: {identity}, Total DB: {total_global})"
            }), 200

        # ... (Resto de tu lógica de promedios igual) ...
        total = len(checks)
        sums = {"joy": 0, "stress": 0, "sadness": 0, "calm": 0, "score": 0}
        for check in checks:
            sums["joy"] += (check.ai_joy or 0)
            sums["stress"] += (check.ai_stress or 0)
            sums["sadness"] += (check.ai_sadness or 0)
            sums["calm"] += (check.ai_calm or 0)
            sums["score"] += (check.final_wellness_score or 0)

        report = {
            "average_score": round(sums["score"] / total, 2),
            "stats": {
                "joy": round(sums["joy"] / total, 2),
                "stress": round(sums["stress"] / total, 2),
                "sadness": round(sums["sadness"] / total, 2),
                "calm": round(sums["calm"] / total, 2)
            },
            "total_checks": total,
            "history": [c.serialize() for c in checks[-10:]]
        }
        return jsonify(report), 200

    except Exception as e:
        print(f"❌ Error en ai-insights: {str(e)}")
        return jsonify({"msg": "Error interno cargando las recomendaciones"}), 500

# ==========================================
# 7. SURVEY SYSTEM
# ==========================================


@api.route('/surveys', methods=['POST'])
@role_required("COMPANY", "ADMIN")
def create_survey():
    try:
        data = request.json

        # 1. Creamos la encuesta capturando si requiere biometría o no
        new_survey = Survey(
            title=data.get("title"),
            description=data.get("description"),
            requires_biometrics=data.get(
                "requires_biometrics", False)  # ¡NUEVO!
        )
        db.session.add(new_survey)
        db.session.flush()  # Obtenemos el ID de new_survey

        # 2. Añadimos las preguntas
        for q in data.get("questions", []):
            db.session.add(Question(
                survey_id=new_survey.id,
                text=q["text"],
                type=q.get("type", "TEXT")
            ))

        db.session.commit()
        return jsonify({"msg": "Encuesta creada con éxito", "data": new_survey.serialize()}), 201

    except Exception as e:
        db.session.rollback()  # Salvavidas de la base de datos
        print(f"Error creando encuesta: {str(e)}")
        return jsonify({"msg": "Error interno del servidor"}), 500


@api.route('/surveys/pending', methods=['GET'])
@role_required("EMPLOYEE")
def get_pending_surveys():
    try:
        emp_id = get_jwt_identity()
        all_active = Survey.query.filter_by(is_active=True).all()

        # Filtramos las encuestas que este empleado aún no ha respondido
        pending = []
        for s in all_active:
            answered = SurveyResponse.query.filter_by(
                survey_id=s.id, employee_id=emp_id).first()
            if not answered:
                pending.append(s.serialize())

        return jsonify(pending), 200

    except Exception as e:
        print(f"Error obteniendo encuestas pendientes: {str(e)}")
        return jsonify({"msg": "Error interno del servidor"}), 500


@api.route('/surveys/<int:survey_id>/respond', methods=['POST'])
@role_required("EMPLOYEE")
def submit_response(survey_id):
    try:
        data = request.json
        emp_id = get_jwt_identity()
        photo_url = data.get("photo_url")

        # Verificamos que la encuesta exista
        survey = Survey.query.get(survey_id)
        if not survey:
            return jsonify({"msg": "Encuesta no encontrada"}), 404

        # --- LÓGICA DE IA REAL ---
        # Primero llamamos a Gemini con la foto que viene del frontend
        ai_results = None
        if photo_url:
            ai_results = analyze_emotions_with_gemini(photo_url)

        # Si la encuesta requiere biometría pero la IA falló o no hay foto, frenamos aquí
        if survey.requires_biometrics and not ai_results:
            return jsonify({"msg": "El análisis de IA es obligatorio para esta encuesta y ha fallado."}), 400

        # 1. Guardamos la respuesta principal con los datos QUE VIENEN DE LA IA
        # Si no hay IA (encuesta normal), ponemos valores por defecto
        response = SurveyResponse(
            survey_id=survey_id,
            employee_id=emp_id,
            photo_url=photo_url,
            ai_joy=ai_results.get("joy", 0) if ai_results else 0,
            ai_stress=ai_results.get("stress", 0) if ai_results else 0,
            ai_sadness=ai_results.get("sadness", 0) if ai_results else 0,
            ai_calm=ai_results.get("calm", 0) if ai_results else 0,
            final_wellness_score=ai_results.get(
                "score", 0) if ai_results else 0,
            admin_recommendation=ai_results.get(
                "recommendation", "N/A") if ai_results else "Encuesta sin biometría"
        )

        db.session.add(response)
        db.session.flush()

        # 2. Guardamos las respuestas a las preguntas (esto sigue igual)
        for ans in data.get("answers", []):
            q_id = ans.get("question_id") or ans.get("q_id")
            if q_id:
                db.session.add(SurveyAnswer(
                    response_id=response.id,
                    question_id=q_id,
                    answer_value=str(ans.get("value"))
                ))

        db.session.commit()
        return jsonify({
            "msg": "Encuesta procesada con IA real correctamente",
            "ai_summary": ai_results['recommendation'] if ai_results else "Completado"
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"Error procesando la respuesta: {str(e)}")
        return jsonify({"msg": "Error interno al procesar la encuesta con IA"}), 500


@api.route('/approvals/pending', methods=['GET'])
@role_required("COMPANY", "ADMIN")
def get_pending_approvals():
    try:
        identity = int(get_jwt_identity())

        vacations = Vacaciones.query.join(Employee).filter(
            Employee.company_id == identity,
            cast(Vacaciones.status, String) == "PENDING"
        ).all()

        incidents = Incident.query.join(Employee).filter(
            Employee.company_id == identity,
            cast(Incident.status, String) == "PENDING"
        ).all()

        return jsonify({
            "vacations": [v.serialize() for v in vacations],
            "incidents": [i.serialize() for i in incidents]
        }), 200
    except Exception as e:
        print(f"Error obteniendo aprobaciones pendientes: {str(e)}")
        return jsonify({"msg": "Error interno del servidor"}), 500


@api.route('/approvals/<string:req_type>/<int:id>', methods=['PUT'])
@role_required("COMPANY", "ADMIN")
def update_approval_status(req_type, id):
    try:
        data = request.json

        # Forzamos que el estado siempre se convierta a MAYÚSCULAS antes de guardarse
        new_status = data.get("status", "").upper()

        if new_status not in ["APPROVED", "REJECTED", "PENDING"]:
            return jsonify({"msg": "Estado no válido"}), 400

        # Identificamos qué tabla modificar
        if req_type == "vacation":
            item = Vacaciones.query.get(id)
        elif req_type == "incident":
            item = Incident.query.get(id)
        else:
            return jsonify({"msg": "Tipo de solicitud no reconocido"}), 400

        if not item:
            return jsonify({"msg": "Solicitud no encontrada"}), 404

        # Actualizamos y guardamos
        item.status = new_status
        db.session.commit()

        return jsonify({"msg": f"Solicitud actualizada correctamente a {new_status}"}), 200

    except Exception as e:
        db.session.rollback()  # Salvavidas activado
        print(f"Error actualizando el estado de la solicitud: {str(e)}")
        return jsonify({"msg": "Error interno del servidor"}), 500


@api.route('/wellness-check', methods=['POST'])
@role_required("EMPLOYEE")
def wellness_check():
    try:
        data = request.json
        photo_b64 = data.get("photo_url")

        if not photo_b64:
            return jsonify({"msg": "No se ha recibido ninguna imagen"}), 400

        # 1. Llamada a la IA (con el modo simulacro integrado en utils.py)
        analysis = analyze_emotions_with_gemini(photo_b64)

        if not analysis:
            return jsonify({"msg": "Error crítico analizando la imagen"}), 500

        # 2. Creación del registro en la base de datos
        new_check = WellnessCheck(
            employee_id=get_jwt_identity(),
            photo_url=photo_b64,
            ai_joy=analysis['joy'],
            ai_stress=analysis['stress'],
            ai_sadness=analysis['sadness'],
            ai_calm=analysis['calm'],
            final_wellness_score=analysis['score'],
            admin_recommendation=analysis['recommendation']
        )

        # 3. GUARDAR en la base de datos (¡Esto faltaba!)
        db.session.add(new_check)
        db.session.commit()

        # 4. RESPONDER al frontend (¡Esto también faltaba!)
        return jsonify({
            "msg": "Análisis completado",
            "results": {
                "ai_joy": analysis['joy'],
                "ai_stress": analysis['stress'],
                "ai_sadness": analysis['sadness'],
                "ai_calm": analysis['calm'],
                "final_wellness_score": analysis['score'],
                "admin_recommendation": analysis['recommendation']
            }
        }), 201

    except Exception as e:
        db.session.rollback()  # Si algo falla, limpiamos la base de datos
        print(f"Error en wellness_check: {str(e)}")
        return jsonify({"msg": "Error interno del servidor al procesar el chequeo"}), 500


@api.route('/chat/messages', methods=['GET'])
@role_required("COMPANY", "EMPLOYEE")
def get_chat_messages():
    """
    COMPANY: recibe ?employee_id=X para ver la conversación con ese empleado.
    EMPLOYEE: no necesita parámetros, ve su conversación con su empresa.
    """
    from api.models import ChatMessage
    claims = get_jwt()
    role = claims.get("role")
    user_id = int(get_jwt_identity())

    if role == "EMPLOYEE":
        employee = Employee.query.get_or_404(user_id)
        messages = ChatMessage.query.filter_by(
            company_id=employee.company_id,
            employee_id=user_id
        ).order_by(ChatMessage.created_at.asc()).all()

        # Marcar como leídos los mensajes enviados por la empresa
        ChatMessage.query.filter_by(
            company_id=employee.company_id,
            employee_id=user_id,
            sender_role="COMPANY",
            is_read=False
        ).update({"is_read": True})
        db.session.commit()

    elif role == "COMPANY":
        employee_id = request.args.get("employee_id", type=int)
        if not employee_id:
            return jsonify({"msg": "employee_id is required"}), 400
        messages = ChatMessage.query.filter_by(
            company_id=user_id,
            employee_id=employee_id
        ).order_by(ChatMessage.created_at.asc()).all()

        # Marcar como leídos los mensajes enviados por el empleado
        ChatMessage.query.filter_by(
            company_id=user_id,
            employee_id=employee_id,
            sender_role="EMPLOYEE",
            is_read=False
        ).update({"is_read": True})
        db.session.commit()

    return jsonify([m.serialize() for m in messages]), 200


@api.route('/chat/messages', methods=['POST'])
@role_required("COMPANY", "EMPLOYEE")
def send_chat_message():
    """Envía un mensaje. El receptor se deduce del rol del emisor."""
    from api.models import ChatMessage
    claims = get_jwt()
    role = claims.get("role")
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}

    content = (data.get("content") or "").strip()
    if not content:
        return jsonify({"msg": "Message content is required"}), 400

    try:
        if role == "EMPLOYEE":
            employee = Employee.query.get(user_id)
            if not employee:
                return jsonify({"msg": "Employee not found"}), 404
            msg = ChatMessage(
                company_id=employee.company_id,
                employee_id=user_id,
                sender_role="EMPLOYEE",
                content=content,
            )
        elif role == "COMPANY":
            employee_id = data.get("employee_id")
            if not employee_id:
                return jsonify({"msg": "employee_id is required"}), 400
            target = Employee.query.get(int(employee_id))
            if not target or target.company_id != user_id:
                return jsonify({"msg": "Employee not found in your company"}), 404
            msg = ChatMessage(
                company_id=user_id,
                employee_id=int(employee_id),
                sender_role="COMPANY",
                content=content,
            )
        else:
            return jsonify({"msg": f"Unsupported role: {role}"}), 400

        db.session.add(msg)
        db.session.commit()
        return jsonify(msg.serialize()), 201

    except Exception as e:
        db.session.rollback()
        print(f"[chat send error] {type(e).__name__}: {e}", flush=True)
        return jsonify({"msg": f"Internal error: {str(e)}"}), 500


@api.route('/chat/unread-count', methods=['GET'])
@role_required("COMPANY", "EMPLOYEE")
def get_unread_count():
    from api.models import ChatMessage
    from sqlalchemy import func
    claims = get_jwt()
    role = claims.get("role")
    user_id = int(get_jwt_identity())

    if role == "EMPLOYEE":
        employee = Employee.query.get_or_404(user_id)
        count = ChatMessage.query.filter_by(
            company_id=employee.company_id,
            employee_id=user_id,
            sender_role="COMPANY",
            is_read=False
        ).count()
        return jsonify({"unread": count}), 200

    elif role == "COMPANY":
        results = db.session.query(
            ChatMessage.employee_id,
            func.count(ChatMessage.id).label("unread")
        ).filter_by(
            company_id=user_id,
            sender_role="EMPLOYEE",
            is_read=False
        ).group_by(ChatMessage.employee_id).all()
        return jsonify([{"employee_id": r.employee_id, "unread": r.unread} for r in results]), 200


@api.route('/chat/colleagues', methods=['GET'])
@role_required("EMPLOYEE")
def get_colleagues():
    """List of other active employees in the same company."""
    user_id = int(get_jwt_identity())
    me = Employee.query.get(user_id)
    if not me:
        return jsonify({"msg": "Employee not found"}), 404
    colleagues = (
        Employee.query
        .filter(Employee.company_id == me.company_id)
        .filter(Employee.id != user_id)
        .filter(Employee.is_active.is_(True))
        .order_by(Employee.first_name.asc())
        .all()
    )
    return jsonify([e.serialize() for e in colleagues]), 200


@api.route('/chat/peer-messages', methods=['GET'])
@role_required("EMPLOYEE")
def get_peer_messages():
    """Conversation between the logged-in employee and another employee in the same company."""
    user_id = int(get_jwt_identity())
    peer_id = request.args.get("peer_id", type=int)
    if not peer_id:
        return jsonify({"msg": "peer_id is required"}), 400

    me = Employee.query.get(user_id)
    peer = Employee.query.get(peer_id)
    if not me or not peer or me.company_id != peer.company_id:
        return jsonify({"msg": "Peer not found in your company"}), 404

    msgs = (
        PeerChatMessage.query
        .filter(
            ((PeerChatMessage.sender_id == user_id) & (PeerChatMessage.receiver_id == peer_id)) |
            ((PeerChatMessage.sender_id == peer_id) & (PeerChatMessage.receiver_id == user_id))
        )
        .order_by(PeerChatMessage.created_at.asc())
        .all()
    )

    PeerChatMessage.query.filter_by(
        sender_id=peer_id, receiver_id=user_id, is_read=False
    ).update({"is_read": True})
    db.session.commit()

    return jsonify([m.serialize() for m in msgs]), 200


@api.route('/chat/peer-messages', methods=['POST'])
@role_required("EMPLOYEE")
def send_peer_message():
    """Send a direct message to another employee in the same company."""
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}
    content = (data.get("content") or "").strip()
    peer_id = data.get("peer_id")

    if not content:
        return jsonify({"msg": "Message content is required"}), 400
    if not peer_id:
        return jsonify({"msg": "peer_id is required"}), 400

    try:
        me = Employee.query.get(user_id)
        peer = Employee.query.get(int(peer_id))
        if not me or not peer or me.company_id != peer.company_id:
            return jsonify({"msg": "Peer not found in your company"}), 404
        if peer.id == me.id:
            return jsonify({"msg": "Cannot message yourself"}), 400

        msg = PeerChatMessage(
            sender_id=user_id,
            receiver_id=int(peer_id),
            content=content,
        )
        db.session.add(msg)
        db.session.commit()
        return jsonify(msg.serialize()), 201

    except Exception as e:
        db.session.rollback()
        print(f"[peer chat send error] {type(e).__name__}: {e}", flush=True)
        return jsonify({"msg": f"Internal error: {str(e)}"}), 500


@api.route('/chat/peer-unread-count', methods=['GET'])
@role_required("EMPLOYEE")
def peer_unread_count():
    """Map of peer_id -> unread count for the logged-in employee."""
    from sqlalchemy import func
    user_id = int(get_jwt_identity())
    rows = (
        db.session.query(
            PeerChatMessage.sender_id,
            func.count(PeerChatMessage.id).label("unread"),
        )
        .filter(PeerChatMessage.receiver_id == user_id, PeerChatMessage.is_read.is_(False))
        .group_by(PeerChatMessage.sender_id)
        .all()
    )
    return jsonify([{"peer_id": r.sender_id, "unread": r.unread} for r in rows]), 200


@api.route('/hello')
def hello():
    return jsonify({"message": "Hello from Flask!"}), 200


# ==========================================
# SOCKET.IO EVENTS
# ==========================================
from api.socket import socketio



@socketio.on("join_chat")
def handle_join(data):
    room = f"chat_{data['company_id']}_{data['employee_id']}"
    join_room(room)


@socketio.on("send_message")
def handle_send_message(data):
    room = f"chat_{data['company_id']}_{data['employee_id']}"
    emit("new_message", data, to=room)

@api.route('/payroll/employee/<int:employee_id>', methods=['GET'])
@role_required("COMPANY", "ADMIN")
def get_employee_payrolls(employee_id):
    payrolls = Nomina.query.filter_by(employee_id=employee_id).order_by(Nomina.id.desc()).all()
    return jsonify([p.serialize() for p in payrolls]), 200

@api.route('/payroll/<int:payroll_id>', methods=['DELETE'])
@role_required("COMPANY", "ADMIN")
def delete_payroll(payroll_id):
    nomina = Nomina.query.get_or_404(payroll_id)
    db.session.delete(nomina)
    db.session.commit()
    return jsonify({"msg": "Payroll deleted"}), 200