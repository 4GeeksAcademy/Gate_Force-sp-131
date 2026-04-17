from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Integer, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime

db = SQLAlchemy()


class User(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            # do not serialize the password, its a security breach
        }

    
class Company(db.Model):
    __tablename__ = "companies"

    id: Mapped[int] = mapped_column(primary_key=True)
    nombre_empresa: Mapped[str] = mapped_column(String(150), nullable=False)
    password: Mapped[str] = mapped_column(String(50), nullable=False)
    region: Mapped[str] = mapped_column(String(100), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(), default=datetime.utcnow)

    def serialize(self):
        return {
            "id": self.id,
            "nombre_empresa": self.nombre_empresa,
            "region": self.region,
            "is_active": self.is_active,
            "created_at": self.created_at.strftime("%d/%m/%Y")
        }

class Employee(db.Model):
    __tablename__ = "employees"

    id: Mapped[int] = mapped_column(primary_key=True)

    # Datos personales
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=True)

    # Seguridad
    password: Mapped[str] = mapped_column(String(255), nullable=False)

    # Rol y posición
    role: Mapped[str] = mapped_column(
        String(50), default="employee")  # admin / employee
    position: Mapped[str] = mapped_column(String(100), nullable=True)

    # Estado
    is_active: Mapped[bool] = mapped_column(Boolean(), default=True)

    # Auditoría
    created_at: Mapped[datetime] = mapped_column(
        DateTime(), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(), default=datetime.utcnow, onupdate=datetime.utcnow)

    created_at: Mapped[datetime] = mapped_column(DateTime(), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(),default=datetime.utcnow,onupdate=datetime.utcnow)
            
    def serialize(self):
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
            "phone": self.phone,
            "role": self.role,
            "position": self.position,
            "is_active": self.is_active
        }


            "is_active": self.is_active,
        }
            
class UserAdmin(db.Model):
    __tablename__ = "user_admin"
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(20), unique=True)
    password: Mapped[str] = mapped_column(String(12), nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow)

    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
            "created_at": self.created_at.strftime("%d/%m/%Y")
        }
