"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Employee
from api.utils import generate_sitemap, APIException
from flask_cors import CORS

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200


@api.route('/employees', methods=['POST'])
def create_employee():
    data = request.json

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


@api.route('/employees/<int:id>', methods=['PUT'])
def update_employee(id):
    employee = Employee.query.get(id)

    if not employee:
        return jsonify({"msg": "Employee not found"}), 404

    data = request.json

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
