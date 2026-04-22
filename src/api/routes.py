"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import request, jsonify, Blueprint
from api.models import db, Employee, UserAdmin, Company, WorkRecord, Nomina, Incident, Vacaciones, Schedule
from flask_cors import CORS
from datetime import datetime
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from functools import wraps

api = Blueprint('api', __name__)
CORS(api)

# ─── DECORADORES ───────────────────────────────────────────────

def company_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            identity = get_jwt_identity()
            claims = get_jwt()
            if not identity or claims.get("role") != "company":
                return jsonify({"msg": "Acceso denegado: solo empresas"}), 403
        except Exception as e:
            return jsonify({"msg": str(e)}), 500
        return fn(*args, **kwargs)
    return wrapper


def company_or_manager_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            identity = get_jwt_identity()
            claims = get_jwt()
            if not identity or claims.get("role") not in ["company", "manager"]:
                return jsonify({"msg": "Acceso denegado: solo empresas o managers"}), 403
        except Exception as e:
            return jsonify({"msg": str(e)}), 500
        return fn(*args, **kwargs)
    return wrapper


# ─── ADMIN CRUD ───────────────────────────────────────────────

@api.route("/admin", methods=["GET"])
def get_admins():
    admins = UserAdmin.query.all()
    return jsonify([a.serialize() for a in admins]), 200


@api.route('/admin/<int:admin_id>', methods=['GET'])
def get_admin(admin_id):
    admin = UserAdmin.query.get(admin_id)
    if not admin:
        return jsonify({"msg": "Admin no encontrado"}), 404
    return jsonify(admin.serialize()), 200


@api.route('/admin', methods=['POST'])
def add_admin():
    body = request.get_json()
    if not body:
        return jsonify({"msg": "Body vacío"}), 400
    if not body.get("username") or not body.get("password"):
        return jsonify({"msg": "Faltan username o password"}), 400
    existing = UserAdmin.query.filter_by(username=body["username"]).first()
    if existing:
        return jsonify({"msg": "El username ya existe"}), 400
    new_admin = UserAdmin(username=body["username"], password=body["password"])
    db.session.add(new_admin)
    db.session.commit()
    return jsonify(new_admin.serialize()), 201


@api.route('/admin/<int:admin_id>', methods=['DELETE'])
def delete_admin(admin_id):
    admin = UserAdmin.query.get(admin_id)
    if not admin:
        return jsonify({"msg": "Admin no encontrado"}), 404
    db.session.delete(admin)
    db.session.commit()
    return jsonify({"msg": f"Admin {admin_id} eliminado"}), 200


# ─── COMPANY AUTH & CRUD ───────────────────────────────────────────────

@api.route('/company/login', methods=['POST'])
def login_company():
    data = request.json
    if not data or not data.get("nombre_empresa") or not data.get("password"):
        return jsonify({"msg": "Missing credentials"}), 400
    company = Company.query.filter_by(nombre_empresa=data["nombre_empresa"]).first()
    if not company or company.password != data["password"]:
        return jsonify({"msg": "Invalid credentials"}), 401
    token = create_access_token(identity=str(company.id), additional_claims={"role": "company"})
    return jsonify({"token": token, "role": "company"}), 200


@api.route('/company/signup', methods=['POST'])
def handle_company_signup():
    data = request.json
    try:
        nombre = data.get("nombre_empresa")
        pw = data.get("password")
        reg = data.get("region")
        if not all([nombre, pw, reg]):
            return jsonify({"msg": "Faltan datos requeridos (nombre, password, region)"}), 400
        nueva_empresa = Company(nombre_empresa=nombre, password=pw, region=reg, is_active=True)
        db.session.add(nueva_empresa)
        db.session.commit()
        return jsonify({"msg": "Empresa creada exitosamente"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error interno"}), 500


@api.route('/company/dashboard', methods=['GET'])
@jwt_required()
def get_company_dashboard():
    try:
        company_id = get_jwt_identity()
        claims = get_jwt()
        if claims.get("role") != "company":
            return jsonify({"msg": "Acceso restringido a empresas"}), 403
        company = Company.query.get(company_id)
        if not company:
            return jsonify({"msg": "Empresa no encontrada"}), 404
        return jsonify(company.serialize()), 200
    except Exception as e:
        return jsonify({"msg": str(e)}), 500


@api.route('/companies', methods=['GET'])
@jwt_required()
@company_required
def get_companies():
    companies = Company.query.all()
    return jsonify([c.serialize() for c in companies]), 200


@api.route('/companies/<int:id>', methods=['GET'])
def get_company(id):
    company = Company.query.get(id)
    if not company:
        return jsonify({"msg": "Company not found"}), 404
    return jsonify(company.serialize()), 200


@api.route('/companies', methods=['POST'])
def create_company():
    data = request.json
    if not data:
        return jsonify({"msg": "Body vacío"}), 400
    required_fields = ["nombre_empresa", "password", "region"]
    for field in required_fields:
        if not data.get(field):
            return jsonify({"msg": f"{field} es requerido"}), 400
    new_company = Company(nombre_empresa=data["nombre_empresa"], password=data["password"], region=data["region"], is_active=True)
    db.session.add(new_company)
    db.session.commit()
    return jsonify(new_company.serialize()), 201


@api.route('/companies/<int:id>', methods=['PUT'])
def update_company(id):
    company = Company.query.get(id)
    if not company:
        return jsonify({"msg": "Company not found"}), 404
    data = request.json
    if not data:
        return jsonify({"msg": "Body vacío"}), 400
    company.nombre_empresa = data.get("nombre_empresa", company.nombre_empresa)
    company.region = data.get("region", company.region)
    company.is_active = data.get("is_active", company.is_active)
    if data.get("password"):
        company.password = data["password"]
    db.session.commit()
    return jsonify(company.serialize()), 200


@api.route('/companies/<int:id>', methods=['DELETE'])
def delete_company(id):
    company = Company.query.get(id)
    if not company:
        return jsonify({"msg": "Company not found"}), 404
    db.session.delete(company)
    db.session.commit()
    return jsonify({"msg": f"Company {id} deleted"}), 200


# ─── EMPLOYEE AUTH ───────────────────────────────────────────────

@api.route('/employee/login', methods=['POST'])
def employee_login():
    data = request.json
    if not data:
        return jsonify({"msg": "Body vacío"}), 400
    employee = Employee.query.filter_by(email=data.get("email")).first()
    if not employee or employee.password != data.get("password"):
        return jsonify({"msg": "Credenciales incorrectas"}), 401
    token = create_access_token(identity=str(employee.id), additional_claims={"role": "employee"})
    return jsonify({"token": token, "role": "employee"}), 200


@api.route('/employee/signup', methods=['POST'])
def employee_signup():
    data = request.json
    if not data:
        return jsonify({"msg": "Body vacío"}), 400
    required = ["first_name", "last_name", "email", "password"]
    for field in required:
        if not data.get(field):
            return jsonify({"msg": f"{field} es requerido"}), 400
    if Employee.query.filter_by(email=data["email"]).first():
        return jsonify({"msg": "Email ya registrado"}), 400
    new_employee = Employee(
        first_name=data["first_name"], last_name=data["last_name"],
        email=data["email"], password=data["password"],
        phone=data.get("phone"), position=data.get("position"),
        role="employee", is_active=True
    )
    db.session.add(new_employee)
    db.session.commit()
    return jsonify(new_employee.serialize()), 201


@api.route('/employee/dashboard', methods=['GET'])
@jwt_required()
def get_employee_dashboard():
    employee_id = get_jwt_identity()
    claims = get_jwt()
    if claims.get("role") != "employee":
        return jsonify({"msg": "Acceso restringido a empleados"}), 403
    employee = Employee.query.get(employee_id)
    if not employee:
        return jsonify({"msg": "Empleado no encontrado"}), 404
    return jsonify(employee.serialize()), 200


# ─── EMPLOYEE CRUD (protegido: company o manager) ───────────────────────────────────────────────

@api.route('/employees', methods=['GET'])
@jwt_required()
@company_or_manager_required
def get_employees():
    employees = Employee.query.all()
    return jsonify([e.serialize() for e in employees]), 200


@api.route('/employees/simple', methods=['GET'])
@jwt_required()
@company_or_manager_required
def get_employees_simple():
    employees = Employee.query.all()
    return jsonify([{"id": e.id, "first_name": e.first_name, "last_name": e.last_name} for e in employees]), 200


@api.route('/employees/<int:id>', methods=['GET'])
@jwt_required()
@company_or_manager_required
def get_employee(id):
    employee = Employee.query.get(id)
    if not employee:
        return jsonify({"msg": "Employee not found"}), 404
    return jsonify(employee.serialize()), 200


@api.route('/employees', methods=['POST'])
@jwt_required()
@company_or_manager_required
def create_employee():
    data = request.json
    if not data:
        return jsonify({"msg": "Body vacío"}), 400
    required_fields = ["first_name", "last_name", "email", "password"]
    for field in required_fields:
        if not data.get(field):
            return jsonify({"msg": f"{field} is required"}), 400
    if Employee.query.filter_by(email=data["email"]).first():
        return jsonify({"msg": "Email already exists"}), 400
    new_employee = Employee(
        first_name=data["first_name"], last_name=data["last_name"],
        email=data["email"], phone=data.get("phone"),
        password=data["password"], role=data.get("role", "employee"),
        position=data.get("position"), is_active=True
    )
    db.session.add(new_employee)
    db.session.commit()
    return jsonify(new_employee.serialize()), 201


@api.route('/employees/<int:id>', methods=['PUT'])
@jwt_required()
@company_or_manager_required
def update_employee(id):
    employee = Employee.query.get(id)
    if not employee:
        return jsonify({"msg": "Employee not found"}), 404
    data = request.json
    if not data:
        return jsonify({"msg": "Body vacío"}), 400
    employee.first_name = data.get("first_name", employee.first_name)
    employee.last_name = data.get("last_name", employee.last_name)
    employee.phone = data.get("phone", employee.phone)
    employee.position = data.get("position", employee.position)
    employee.role = data.get("role", employee.role)
    if data.get("password"):
        employee.password = data["password"]
    db.session.commit()
    return jsonify(employee.serialize()), 200


@api.route('/employees/<int:id>', methods=['DELETE'])
@jwt_required()
@company_or_manager_required
def delete_employee(id):
    employee = Employee.query.get(id)
    if not employee:
        return jsonify({"msg": "Employee not found"}), 404
    db.session.delete(employee)
    db.session.commit()
    return jsonify({"msg": "Employee deleted"}), 200


# ─── WORKRECORD CRUD ───────────────────────────────────────────────

@api.route('/work-records', methods=['GET'])
def get_work_records():
    employee_id = request.args.get("employee_id")
    query = WorkRecord.query
    if employee_id:
        query = query.filter_by(employee_id=employee_id)
    records = query.all()
    return jsonify([r.serialize() for r in records]), 200


@api.route('/work-records/<int:id>', methods=['GET'])
def get_work_record(id):
    record = WorkRecord.query.get(id)
    if not record:
        return jsonify({"msg": "Not found"}), 404
    return jsonify(record.serialize()), 200


@api.route('/work-records', methods=['POST'])
def create_work_record():
    data = request.json
    check_in = datetime.fromisoformat(data["check_in"])
    check_out = None
    total_hours = None
    if data.get("check_out"):
        check_out = datetime.fromisoformat(data["check_out"])
        total_seconds = (check_out - check_in).total_seconds()
        hours = int(total_seconds // 3600)
        minutes = int((total_seconds % 3600) // 60)
        total_hours = f"{hours}h {minutes:02d}min"
    new_record = WorkRecord(
        employee_id=data["employee_id"], check_in=check_in,
        check_out=check_out, total_hours=total_hours,
        status=data.get("status", "pending")
    )
    db.session.add(new_record)
    db.session.commit()
    return jsonify(new_record.serialize()), 201


@api.route('/work-records/<int:id>', methods=['PUT'])
def update_work_record(id):
    record = WorkRecord.query.get(id)
    if not record:
        return jsonify({"msg": "Not found"}), 404
    data = request.json
    if data.get("check_in"):
        record.check_in = datetime.fromisoformat(data["check_in"])
    if data.get("check_out"):
        record.check_out = datetime.fromisoformat(data["check_out"])
    if record.check_in and record.check_out:
        total_seconds = (record.check_out - record.check_in).total_seconds()
        hours = int(total_seconds // 3600)
        minutes = int((total_seconds % 3600) // 60)
        record.total_hours = f"{hours}h {minutes:02d}min"
    db.session.commit()
    return jsonify(record.serialize()), 200


@api.route('/work-records/<int:id>', methods=['DELETE'])
def delete_work_record(id):
    record = WorkRecord.query.get(id)
    if not record:
        return jsonify({"msg": "Not found"}), 404
    db.session.delete(record)
    db.session.commit()
    return jsonify({"msg": "Deleted"}), 200


# ─── NOMINAS CRUD ───────────────────────────────────────────────

@api.route('/nominas', methods=['GET'])
def get_nominas():
    nominas = Nomina.query.all()
    return jsonify([n.serialize() for n in nominas]), 200


@api.route('/nominas', methods=['POST'])
def create_nomina():
    data = request.json
    if not data.get("employee_id") or not data.get("month"):
        return jsonify({"msg": "Missing data"}), 400
    new_nomina = Nomina(employee_id=data["employee_id"], month=data["month"], document_url=data.get("document_url"))
    db.session.add(new_nomina)
    db.session.commit()
    return jsonify(new_nomina.serialize()), 201


@api.route('/nominas/<int:id>', methods=['PUT'])
def update_nomina(id):
    nomina = Nomina.query.get(id)
    if not nomina:
        return jsonify({"msg": "Not found"}), 404
    data = request.json
    nomina.month = data.get("month", nomina.month)
    nomina.document_url = data.get("document_url", nomina.document_url)
    db.session.commit()
    return jsonify(nomina.serialize()), 200


@api.route('/nominas/<int:id>', methods=['DELETE'])
def delete_nomina(id):
    nomina = Nomina.query.get(id)
    if not nomina:
        return jsonify({"msg": "Not found"}), 404
    db.session.delete(nomina)
    db.session.commit()
    return jsonify({"msg": "Deleted"}), 200


# ─── HORARIOS CRUD ───────────────────────────────────────────────

def parse_time(t):
    for fmt in ("%H:%M:%S", "%H:%M"):
        try:
            return datetime.strptime(t, fmt)
        except ValueError:
            continue
    raise ValueError(f"Formato de hora inválido: {t}")


@api.route('/employees/<int:employee_id>/horarios', methods=['GET'])
def get_horarios(employee_id):
    employee = Employee.query.get(employee_id)
    if not employee:
        return jsonify({"error": "Empleado no encontrado"}), 404
    schedules = Schedule.query.filter_by(employee_id=employee_id).all()
    return jsonify([s.serialize() for s in schedules]), 200


@api.route('/employees/<int:employee_id>/horarios', methods=['POST'])
def create_horario(employee_id):
    employee = Employee.query.get(employee_id)
    if not employee:
        return jsonify({"error": "Empleado no encontrado"}), 404
    body = request.get_json()
    if not body:
        return jsonify({"error": "Body vacío"}), 400
    day = body.get("day")
    start_time = body.get("start_time")
    end_time = body.get("end_time")
    if not all([day, start_time, end_time]):
        return jsonify({"error": "day, start_time y end_time son obligatorios"}), 422
    new_schedule = Schedule(employee_id=employee_id, day=day, start_time=parse_time(start_time), end_time=parse_time(end_time))
    db.session.add(new_schedule)
    db.session.commit()
    return jsonify(new_schedule.serialize()), 201


@api.route('/horarios/<int:schedule_id>', methods=['PUT'])
def update_horario(schedule_id):
    schedule = Schedule.query.get(schedule_id)
    if not schedule:
        return jsonify({"error": "Horario no encontrado"}), 404
    body = request.get_json()
    if not body:
        return jsonify({"error": "Body vacío"}), 400
    if "day" in body:
        schedule.day = body["day"]
    if "start_time" in body:
        schedule.start_time = parse_time(body["start_time"])
    if "end_time" in body:
        schedule.end_time = parse_time(body["end_time"])
    db.session.commit()
    return jsonify(schedule.serialize()), 200


@api.route('/horarios/<int:schedule_id>', methods=['DELETE'])
def delete_horario(schedule_id):
    schedule = Schedule.query.get(schedule_id)
    if not schedule:
        return jsonify({"error": "Horario no encontrado"}), 404
    db.session.delete(schedule)
    db.session.commit()
    return jsonify({"message": f"Horario {schedule_id} eliminado"}), 200


# ─── INCIDENTS CRUD ───────────────────────────────────────────────

@api.route('/incidents', methods=['GET'])
def get_all_incidents():
    incidents = Incident.query.all()
    return jsonify([i.serialize() for i in incidents]), 200


@api.route('/employees/<int:employee_id>/incidents', methods=['GET'])
def get_incidents(employee_id):
    incidents = Incident.query.filter_by(employee_id=employee_id).all()
    return jsonify([i.serialize() for i in incidents]), 200


@api.route('/employees/<int:employee_id>/incidents/<int:id>', methods=['GET'])
def get_incident(employee_id, id):
    incident = Incident.query.filter_by(id=id, employee_id=employee_id).first()
    if not incident:
        return jsonify({"msg": "Incident not found"}), 404
    return jsonify(incident.serialize()), 200


@api.route('/employees/<int:employee_id>/incidents', methods=['POST'])
def create_incident(employee_id):
    employee = Employee.query.get(employee_id)
    if not employee:
        return jsonify({"msg": "Employee not found"}), 404
    data = request.json
    if not data:
        return jsonify({"msg": "Body vacío"}), 400
    required_fields = ["type", "category"]
    for field in required_fields:
        if not data.get(field):
            return jsonify({"msg": f"{field} is required"}), 400
    new_incident = Incident(
        employee_id=employee_id, type=data["type"],
        status=data.get("status", "PENDING"), category=data["category"],
        admin_comment=data.get("admin_comment")
    )
    db.session.add(new_incident)
    db.session.commit()
    return jsonify(new_incident.serialize()), 201


@api.route('/employees/<int:employee_id>/incidents/<int:id>', methods=['PUT'])
def update_incident(employee_id, id):
    incident = Incident.query.filter_by(id=id, employee_id=employee_id).first()
    if not incident:
        return jsonify({"msg": "Incident not found"}), 404
    data = request.json
    if not data:
        return jsonify({"msg": "Body vacío"}), 400
    incident.type = data.get("type", incident.type)
    incident.status = data.get("status", incident.status)
    incident.category = data.get("category", incident.category)
    incident.admin_comment = data.get("admin_comment", incident.admin_comment)
    db.session.commit()
    return jsonify(incident.serialize()), 200


@api.route('/employees/<int:employee_id>/incidents/<int:id>', methods=['DELETE'])
def delete_incident(employee_id, id):
    incident = Incident.query.filter_by(id=id, employee_id=employee_id).first()
    if not incident:
        return jsonify({"msg": "Incident not found"}), 404
    db.session.delete(incident)
    db.session.commit()
    return jsonify({"msg": f"Incident {id} deleted"}), 200


# ─── VACACIONES CRUD ───────────────────────────────────────────────

@api.route('/vacaciones', methods=['GET'])
def get_all_vacaciones():
    vacaciones = Vacaciones.query.all()
    return jsonify([v.serialize() for v in vacaciones]), 200


@api.route('/employees/<int:employee_id>/vacaciones', methods=['GET'])
def get_vacaciones(employee_id):
    vacaciones = Vacaciones.query.filter_by(employee_id=employee_id).all()
    return jsonify([v.serialize() for v in vacaciones]), 200


@api.route('/employees/<int:employee_id>/vacaciones/<int:id>', methods=['GET'])
def get_vacacion(employee_id, id):
    vacacion = Vacaciones.query.filter_by(id=id, employee_id=employee_id).first()
    if not vacacion:
        return jsonify({"msg": "Vacacion not found"}), 404
    return jsonify(vacacion.serialize()), 200


@api.route('/employees/<int:employee_id>/vacaciones', methods=['POST'])
def create_vacacion(employee_id):
    employee = Employee.query.get(employee_id)
    if not employee:
        return jsonify({"msg": "Employee not found"}), 404
    data = request.json
    if not data:
        return jsonify({"msg": "Body vacío"}), 400
    new_vacacion = Vacaciones(
        employee_id=employee_id, vacations=data.get("vacations"),
        taken_vacations=data.get("taken_vacations"),
        available_vacations=data.get("available_vacations")
    )
    db.session.add(new_vacacion)
    db.session.commit()
    return jsonify(new_vacacion.serialize()), 201


@api.route('/employees/<int:employee_id>/vacaciones/<int:id>', methods=['PUT'])
def update_vacacion(employee_id, id):
    vacacion = Vacaciones.query.filter_by(id=id, employee_id=employee_id).first()
    if not vacacion:
        return jsonify({"msg": "Vacacion not found"}), 404
    data = request.json
    if not data:
        return jsonify({"msg": "Body vacío"}), 400
    vacacion.vacations = data.get("vacations", vacacion.vacations)
    vacacion.taken_vacations = data.get("taken_vacations", vacacion.taken_vacations)
    vacacion.available_vacations = data.get("available_vacations", vacacion.available_vacations)
    db.session.commit()
    return jsonify(vacacion.serialize()), 200


@api.route('/employees/<int:employee_id>/vacaciones/<int:id>', methods=['DELETE'])
def delete_vacacion(employee_id, id):
    vacacion = Vacaciones.query.filter_by(id=id, employee_id=employee_id).first()
    if not vacacion:
        return jsonify({"msg": "Vacacion not found"}), 404
    db.session.delete(vacacion)
    db.session.commit()
    return jsonify({"msg": f"Vacacion {id} deleted"}), 200
