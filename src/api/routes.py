"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import request, jsonify, Blueprint
from api.models import db, Employee, UserAdmin, Company
from flask_cors import CORS

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
