"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import request, jsonify, Blueprint
from api.models import db, Employee, UserAdmin, Company, WorkRecord, Nomina, Incident, Vacaciones, Schedule
from flask_cors import CORS
from datetime import datetime

api = Blueprint('api', __name__)
CORS(api)

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

    new_admin = UserAdmin(
        username=body["username"],
        password=body["password"]
    )

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


# ─── COMPANY CRUD ───────────────────────────────────────────────

@api.route('/companies', methods=['GET'])
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

    new_company = Company(
        nombre_empresa=data["nombre_empresa"],
        password=data["password"],
        region=data["region"],
        is_active=True
    )

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


# ─── EMPLOYEE CRUD ───────────────────────────────────────────────

@api.route('/employees', methods=['GET'])
def get_employees():
    employees = Employee.query.all()
    return jsonify([e.serialize() for e in employees]), 200


@api.route('/employees/<int:id>', methods=['GET'])
def get_employee(id):
    employee = Employee.query.get(id)

    if not employee:
        return jsonify({"msg": "Employee not found"}), 404

    return jsonify(employee.serialize()), 200


@api.route('/employees', methods=['POST'])
def create_employee():
    data = request.json

    if not data:
        return jsonify({"msg": "Body vacío"}), 400

    required_fields = ["first_name", "last_name", "email", "password"]
    for field in required_fields:
        if not data.get(field):
            return jsonify({"msg": f"{field} is required"}), 400

    existing = Employee.query.filter_by(email=data["email"]).first()
    if existing:
        return jsonify({"msg": "Email already exists"}), 400

    new_employee = Employee(
        first_name=data["first_name"],
        last_name=data["last_name"],
        email=data["email"],
        phone=data.get("phone"),
        password=data["password"],
        role=data.get("role", "employee"),
        position=data.get("position"),
        is_active=True
    )

    db.session.add(new_employee)
    db.session.commit()

    return jsonify(new_employee.serialize()), 201


@api.route('/employees/<int:id>', methods=['PUT'])
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
def delete_employee(id):
    employee = Employee.query.get(id)

    if not employee:
        return jsonify({"msg": "Employee not found"}), 404

    db.session.delete(employee)
    db.session.commit()

    return jsonify({"msg": "Employee deleted"}), 200

# ─── WORKRECORD CRUD ───────────────────────────────────────────────


@api.route('/employees/<int:employee_id>/work-records', methods=['GET'])
def get_work_records(employee_id):
    records = WorkRecord.query.filter_by(employee_id=employee_id).all()
    return jsonify([r.serialize() for r in records]), 200


@api.route('/employees/<int:employee_id>/check-in', methods=['POST'])
def check_in(employee_id):
    employee = Employee.query.get(employee_id)

    if not employee:
        return jsonify({"msg": "Employee not found"}), 404

    open_record = WorkRecord.query.filter_by(
        employee_id=employee_id,
        check_out=None
    ).first()

    if open_record:
        return jsonify({"msg": "Already checked in"}), 400

    new_record = WorkRecord(
        employee_id=employee_id,
        check_in=datetime.utcnow(),
        status="in_progress"
    )

    db.session.add(new_record)
    db.session.commit()

    return jsonify({"msg": "Check-in successful"}), 201


@api.route('/employees/<int:employee_id>/check-out', methods=['PUT'])
def check_out(employee_id):
    record = WorkRecord.query.filter_by(
        employee_id=employee_id,
        check_out=None
    ).first()

    if not record:
        return jsonify({"msg": "No active check-in"}), 404

    record.check_out = datetime.utcnow()

    delta = record.check_out - record.check_in
    record.total_hours = int(delta.total_seconds() / 3600)

    record.status = "completed"

    db.session.commit()

    return jsonify({"msg": "Check-out successful"}), 200


# ─── NOMINAS CRUD ───────────────────────────────────────────────

@api.route('/employees/<int:employee_id>/nominas', methods=['GET'])
def get_nominas(employee_id):
    nominas = Nomina.query.filter_by(employee_id=employee_id).all()
    return jsonify([n.serialize() for n in nominas]), 200


@api.route('/employees/<int:employee_id>/nominas', methods=['POST'])
def create_nomina(employee_id):
    data = request.json

    if not data or not data.get("month"):
        return jsonify({"msg": "Month is required"}), 400

    new_nomina = Nomina(
        employee_id=employee_id,
        month=data["month"],
        document_url=data.get("document_url")
    )

    db.session.add(new_nomina)
    db.session.commit()

    return jsonify(new_nomina.serialize()), 201

# ─── HORARIOS CRUD ───────────────────────────────────────────────


def parse_time(t):
    for fmt in ("%H:%M:%S", "%H:%M"):
        try:
            return datetime.strptime(t, fmt)
        except ValueError:
            continue
    raise ValueError(f"Formato de hora inválido: {t}")


# GET - Todos los horarios de un empleado
@api.route('/employees/<int:employee_id>/horarios', methods=['GET'])
def get_horarios(employee_id):
    employee = Employee.query.get(employee_id)
    if not employee:
        return jsonify({"error": "Empleado no encontrado"}), 404

    schedules = Schedule.query.filter_by(employee_id=employee_id).all()
    return jsonify([s.serialize() for s in schedules]), 200


# POST - Crear horario para un empleado
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

    new_schedule = Schedule(
        employee_id=employee_id,
        day=day,
        start_time=parse_time(start_time),
        end_time=parse_time(end_time)
    )

    db.session.add(new_schedule)
    db.session.commit()
    return jsonify(new_schedule.serialize()), 201


# PUT - Editar un horario
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


# DELETE - Borrar un horario
@api.route('/horarios/<int:schedule_id>', methods=['DELETE'])
def delete_horario(schedule_id):
    schedule = Schedule.query.get(schedule_id)
    if not schedule:
        return jsonify({"error": "Horario no encontrado"}), 404

    db.session.delete(schedule)
    db.session.commit()
    return jsonify({"message": f"Horario {schedule_id} eliminado"}), 200


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
        employee_id=employee_id,
        type=data["type"],
        status=data.get("status", "PENDING"),
        category=data["category"],
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


@api.route('/employees/<int:employee_id>/vacaciones', methods=['GET'])
def get_vacaciones(employee_id):
    vacaciones = Vacaciones.query.filter_by(employee_id=employee_id).all()
    return jsonify([v.serialize() for v in vacaciones]), 200


@api.route('/employees/<int:employee_id>/vacaciones/<int:id>', methods=['GET'])
def get_vacacion(employee_id, id):
    vacacion = Vacaciones.query.filter_by(
        id=id, employee_id=employee_id).first()
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
        employee_id=employee_id,
        vacations=data.get("vacations"),
        taken_vacations=data.get("taken_vacations"),
        available_vacations=data.get("available_vacations")
    )
    db.session.add(new_vacacion)
    db.session.commit()
    return jsonify(new_vacacion.serialize()), 201


@api.route('/employees/<int:employee_id>/vacaciones/<int:id>', methods=['PUT'])
def update_vacacion(employee_id, id):
    vacacion = Vacaciones.query.filter_by(
        id=id, employee_id=employee_id).first()
    if not vacacion:
        return jsonify({"msg": "Vacacion not found"}), 404
    data = request.json
    if not data:
        return jsonify({"msg": "Body vacío"}), 400
    vacacion.vacations = data.get("vacations", vacacion.vacations)
    vacacion.taken_vacations = data.get(
        "taken_vacations", vacacion.taken_vacations)
    vacacion.available_vacations = data.get(
        "available_vacations", vacacion.available_vacations)
    db.session.commit()
    return jsonify(vacacion.serialize()), 200


@api.route('/employees/<int:employee_id>/vacaciones/<int:id>', methods=['DELETE'])
def delete_vacacion(employee_id, id):
    vacacion = Vacaciones.query.filter_by(
        id=id, employee_id=employee_id).first()
    if not vacacion:
        return jsonify({"msg": "Vacacion not found"}), 404
    db.session.delete(vacacion)
    db.session.commit()
    return jsonify({"msg": f"Vacacion {id} deleted"}), 200

# ─── VACACIONES GLOBAL ───────────────────────────────────────────────

@api.route('/vacaciones', methods=['GET'])
def get_all_vacaciones():
    vacaciones = Vacaciones.query.all()
    return jsonify([v.serialize() for v in vacaciones]), 200

@api.route('/employees/simple', methods=['GET'])
def get_employees_simple():
    employees = Employee.query.all()
    return jsonify([{"id": e.id, "first_name": e.first_name, "last_name": e.last_name} for e in employees]), 200