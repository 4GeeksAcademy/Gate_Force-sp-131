"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, UserAdmin
from api.utils import generate_sitemap, APIException
from flask_cors import CORS

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)

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
    
    if not body or "username" not in body or "password" not in body:
        return jsonify({"msg": "Faltan datos requeridos"}), 400

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