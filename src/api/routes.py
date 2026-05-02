"""
API Server Routes: Handles Auth, Roles, and HR Operations.
All functions and declarations are in English for professional standards.
"""
from flask import request, jsonify, Blueprint
from api.models import (
    db, Employee, UserAdmin, Company, WorkRecord, Nomina,
    Incident, Vacaciones, Schedule, Survey, Question,
    SurveyResponse, SurveyAnswer, StatusEnum, IncidentTypeEnum, RoleEnum, AuditLog
)
from flask_cors import CORS
from datetime import datetime
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash

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

    # Validate Password and Status
    if not user or not check_password_hash(user.password, password):
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

    # Validamos que no esté trabajando ya
    exists = WorkRecord.query.filter_by(
        employee_id=employee_id, check_out=None).first()
    if exists:
        return jsonify({"msg": "Ya tienes un turno activo"}), 400

    new_record = WorkRecord(
        employee_id=employee_id,
        check_in=datetime.utcnow()
        # status="PENDING" se asigna solo por el default de su modelo
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

    # 1. Marcamos la salida
    active_session.check_out = datetime.utcnow()

    # 2. Calculamos las horas totales automáticamente
    diferencia = active_session.check_out - active_session.check_in
    horas_totales = diferencia.total_seconds() / 3600
    active_session.total_hours = round(
        horas_totales, 2)  # Redondeamos a 2 decimales

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
        total_employees = Employee.query.filter_by(company_id=company_id).count()

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
            WorkRecord.check_out == None # ¡Aquí está el truco!
        ).count()

        return jsonify({
            "totalEmployees": total_employees,
            "totalPending": total_pending,
            "activeClocks": active_clocks
        }), 200

    except Exception as e:
        print(f"Error cargando estadísticas: {str(e)}")
        return jsonify({"msg": "Error interno del servidor"}), 500

# ==========================================
# 7. SURVEY SYSTEM
# ==========================================


@api.route('/surveys', methods=['POST'])
@role_required("COMPANY", "ADMIN")
def create_survey():
    data = request.json
    new_survey = Survey(
        title=data.get("title"),
        description=data.get("description")
    )
    db.session.add(new_survey)
    db.session.flush()

    for q in data.get("questions", []):
        db.session.add(Question(survey_id=new_survey.id,
                       text=q["text"], type=q.get("type", "TEXT")))

    db.session.commit()
    return jsonify(new_survey.serialize()), 201


@api.route('/surveys/pending', methods=['GET'])
@role_required("EMPLOYEE")
def get_pending_surveys():
    emp_id = get_jwt_identity()
    all_active = Survey.query.filter_by(is_active=True).all()
    # Filter surveys not answered by this employee
    pending = [s.serialize() for s in all_active if not SurveyResponse.query.filter_by(
        survey_id=s.id, employee_id=emp_id).first()]
    return jsonify(pending), 200


@api.route('/surveys/<int:survey_id>/respond', methods=['POST'])
@role_required("EMPLOYEE")
def submit_response(survey_id):
    data = request.json
    emp_id = get_jwt_identity()

    response = SurveyResponse(survey_id=survey_id, employee_id=emp_id)
    db.session.add(response)
    db.session.flush()

    for ans in data.get("answers", []):
        db.session.add(SurveyAnswer(response_id=response.id,
                       question_id=ans["q_id"], answer_value=str(ans["value"])))

    db.session.commit()
    return jsonify({"msg": "Survey submitted"}), 201


@api.route('/approvals/pending', methods=['GET'])
@role_required("COMPANY", "ADMIN")
def get_pending_approvals():
    identity = get_jwt_identity()

    # 1. Para Vacaciones: Si falló "pending", intenta con "PENDING"
    vacations = Vacaciones.query.join(Employee).filter(
        Employee.company_id == identity,
        Vacaciones.status == "PENDING"
    ).all()

    # 2. Para Incidencias: Mantenga minúsculas (que dijo que funcionó)
    incidents = Incident.query.join(Employee).filter(
        Employee.company_id == identity,
        Incident.status == "pending"
    ).all()

    return jsonify({
        "vacations": [v.serialize() for v in vacations],
        "incidents": [i.serialize() for i in incidents]
    }), 200


@api.route('/approvals/<string:type>/<int:id>', methods=['PUT'])
@role_required("COMPANY", "ADMIN")
def update_approval_status(type, id):
    data = request.json  # Esperamos {"status": "APPROVED" o "REJECTED"}
    new_status = data.get("status")

    if type == "vacation":
        item = Vacaciones.query.get(id)
    else:
        item = Incident.query.get(id)

    if not item:
        return jsonify({"msg": "Request not found"}), 404

    item.status = new_status
    db.session.commit()

    return jsonify({"msg": f"{type.capitalize()} {new_status.lower()} successfully"}), 200
