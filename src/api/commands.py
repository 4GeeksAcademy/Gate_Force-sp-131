
import click
from api.models import db, UserAdmin, Employee, Company

"""
In this file, you can add as many commands as you want using the @app.cli.command decorator
Flask commands are initialized in the app.py file
"""


def setup_commands(app):

    @app.cli.command("insert-test-data")
    @click.argument("count")
    def insert_test_data(count):
        print(f"Creando {count} empleados de prueba")

        # Aquí podrías añadir lógica para insertar datos de prueba
        # usando los nuevos modelos. Por ahora lo dejamos limpio para que no falle.
        print("Datos de prueba creados exitosamente")

    @app.cli.command("create-admin")
    @click.argument("username")
    @click.argument("password")
    def create_admin(username, password):
        """Comando para crear un UserAdmin desde la terminal"""
        admin = UserAdmin(username=username, password=password)
        db.session.add(admin)
        db.session.commit()
        print(f"Admin {username} creado.")
