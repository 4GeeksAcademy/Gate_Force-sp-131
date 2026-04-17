"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Company
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


# ─── COMPANY CRUD ───────────────────────────────────────────────

@api.route('/companies', methods=['POST'])
def create_company():
    data = request.json
    required_fields = ["nombre_empresa", "password", "region"]
    for field in required_fields:
        if not data.get(field):
            return jsonify({"msg": f"{field} is required"}), 400

    existing = Company.query.filter_by(nombre_empresa=data["nombre_empresa"]).first()
    if existing:
        return jsonify({"msg": "Company already exists"}), 400

    new_company = Company(
        nombre_empresa=data["nombre_empresa"],
        password=data["password"],
        region=data["region"],
        is_active=data.get("is_active", True)
    )
    db.session.add(new_company)
    db.session.commit()
    return jsonify(new_company.serialize()), 201


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


@api.route('/companies/<int:id>', methods=['PUT'])
def update_company(id):
    company = Company.query.get(id)
    if not company:
        return jsonify({"msg": "Company not found"}), 404

    data = request.json
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