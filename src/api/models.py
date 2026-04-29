from sqlalchemy import String, Boolean, DateTime, Text
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Integer, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
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
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=True)
    password: Mapped[str] = mapped_column(String(50), nullable=False)
    region: Mapped[str] = mapped_column(String(100), nullable=False)
    logo_url: Mapped[str] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean(), default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(), default=datetime.utcnow)

    # RELACIONES #
    employees = relationship(
        "Employee", back_populates="company", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"{self.nombre_empresa}"

    def serialize(self):
        return {
            "id": self.id,
            "nombre_empresa": self.nombre_empresa,
            "email": self.email,
            "region": self.region,
            "logo_url": self.logo_url,
            "is_active": self.is_active,
            "created_at": self.created_at.strftime("%d/%m/%Y")
        }


class Employee(db.Model):
    __tablename__ = "employees"

    id: Mapped[int] = mapped_column(primary_key=True)
    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id"), nullable=False)

    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=True)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    profile_image: Mapped[str] = mapped_column(String(255), nullable=True)

    role: Mapped[str] = mapped_column(String(50), default="employee")
    position: Mapped[str] = mapped_column(String(100), nullable=True)

    is_active: Mapped[bool] = mapped_column(Boolean(), default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(), default=datetime.utcnow, onupdate=datetime.utcnow)

    # RELACIONES #
    work_records = relationship(
        "WorkRecord", back_populates="employee", cascade="all, delete")
    nominas = relationship(
        "Nomina", back_populates="employee", cascade="all, delete")
    manager = relationship(
        "Manager", back_populates="employee", uselist=False, cascade="all, delete")
    schedules = relationship(
        "Schedule", back_populates="employee", cascade="all, delete")

    incidents = relationship(
        "Incident", back_populates="employee", cascade="all, delete")
    vacaciones = relationship(
        "Vacaciones", back_populates="employee", cascade="all, delete")
    company = relationship("Company", back_populates="employees")

    def __repr__(self):
        return f"{self.first_name} {self.last_name}"

    def serialize(self):
        actual_role = "manager" if self.manager and self.manager.is_active else self.role
        return {
            "id": self.id,
            "company_id": self.company_id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
            "phone": self.phone,
            "position": self.position,
            "role": actual_role,
            "is_active": self.is_active,
            "profile_image": self.profile_image,
            "nombre_empresa": self.company.nombre_empresa if self.company else "Sin empresa",
            "work_records": [wr.serialize() for wr in self.work_records],
            "nominas": [n.serialize() for n in self.nominas],
            "schedules": [s.serialize() for s in self.schedules],
            "incidents": [i.serialize() for i in self.incidents],
            "vacaciones": [v.serialize() for v in self.vacaciones]
        }


class UserAdmin(db.Model):
    __tablename__ = "user_admin"
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(20), unique=True)
    password: Mapped[str] = mapped_column(String(12), nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"{self.username}"

    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
            "created_at": self.created_at.strftime("%d/%m/%Y")
        }


class WorkRecord(db.Model):
    __tablename__ = "work_records"

    id: Mapped[int] = mapped_column(primary_key=True)

    employee_id: Mapped[int] = mapped_column(
        ForeignKey("employees.id"), nullable=False)

    check_in: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    check_out: Mapped[datetime] = mapped_column(DateTime, nullable=True)

    total_hours: Mapped[str] = mapped_column(String(50), nullable=True)

    status: Mapped[str] = mapped_column(String(50), default="pending")
    location: Mapped[str] = mapped_column(String(120), nullable=True)

    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    # relación #
    employee = relationship("Employee", back_populates="work_records")

    def serialize(self):
        return {
            "id": self.id,
            "employee_id": self.employee_id,
            "employee_name": f"{self.employee.first_name} {self.employee.last_name}",
            "check_in": self.check_in,
            "check_out": self.check_out,
            "total_hours": self.total_hours,
            "status": self.status
        }


class Nomina(db.Model):
    __tablename__ = "nominas"

    id: Mapped[int] = mapped_column(primary_key=True)
    employee_id: Mapped[int] = mapped_column(
        ForeignKey("employees.id"), nullable=False)
    month: Mapped[str] = mapped_column(String(20), nullable=False)
    document_url: Mapped[str] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    # relación #
    employee = relationship("Employee", back_populates="nominas")

    def serialize(self):
        return {
            "id": self.id,
            "month": self.month,
            "document_url": self.document_url,
            "employee_id": self.employee_id,
            "employee_name": f"{self.employee.first_name} {self.employee.last_name}"
        }


class Manager(db.Model):
    __tablename__ = "managers"

    id: Mapped[int] = mapped_column(primary_key=True)

    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=True)
    password: Mapped[str] = mapped_column(String(255), nullable=False)

    position: Mapped[str] = mapped_column(String(100), nullable=True)

    is_active: Mapped[bool] = mapped_column(Boolean(), default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relación con Employee
    employee_id: Mapped[int] = mapped_column(
        ForeignKey("employees.id"), nullable=True)
    employee = relationship("Employee", back_populates="manager")

    def __repr__(self):
        return f"{self.first_name} {self.last_name}"

    def serialize(self):
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
            "phone": self.phone,
            "position": self.position,
            "is_active": self.is_active,
            "employee_id": self.employee_id
        }


class Schedule(db.Model):
    __tablename__ = "schedules"

    id: Mapped[int] = mapped_column(primary_key=True)
    employee_id: Mapped[int] = mapped_column(
        ForeignKey("employees.id"), nullable=False
    )
    day: Mapped[str] = mapped_column(String(20), nullable=False)
    start_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    end_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "employee_id": self.employee_id,
            "day": self.day,
            "start_time": self.start_time.strftime("%H:%M"),
            "end_time": self.end_time.strftime("%H:%M")
        }

    # Relación
    employee = relationship("Employee", back_populates="schedules")

    def __repr__(self):
        return f"Schedule(employee_id={self.employee_id}, day={self.day})"


class Incident(db.Model):
    __tablename__ = "incidents"

    id: Mapped[int] = mapped_column(primary_key=True)
    employee_id: Mapped[int] = mapped_column(
        ForeignKey("employees.id"), nullable=False)

    type: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="PENDING")
    category: Mapped[str] = mapped_column(String(50), nullable=True)
    description: Mapped[str] = mapped_column(
        Text, nullable=False, server_default="Sin descripción detallada")
    admin_comment: Mapped[str] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(), default=datetime.utcnow)

    # Relación
    employee = relationship("Employee", back_populates="incidents")

    def serialize(self):
        return {
            "id": self.id,
            "employee_id": self.employee_id,
            "type": self.type,
            "status": self.status,
            "category": self.category,
            "description": self.description,
            "admin_comment": self.admin_comment,
            "employee_name": f"{self.employee.first_name} {self.employee.last_name}" if self.employee else "Desconocido",
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class Vacaciones(db.Model):
    __tablename__ = "vacaciones"

    id: Mapped[int] = mapped_column(primary_key=True)
    employee_id: Mapped[int] = mapped_column(
        ForeignKey("employees.id"), nullable=False)
    vacations: Mapped[int] = mapped_column(nullable=True)
    taken_vacations: Mapped[int] = mapped_column(nullable=True)
    available_vacations: Mapped[int] = mapped_column(nullable=True)
    start_date: Mapped[datetime] = mapped_column(DateTime(), nullable=True)
    end_date: Mapped[datetime] = mapped_column(DateTime(), nullable=True)
    days_requested: Mapped[int] = mapped_column(nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="pending")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(), default=datetime.utcnow)

    # relación #
    employee = relationship("Employee", back_populates="vacaciones")

    def serialize(self):
        return {
            "id": self.id,
            "employee_id": self.employee_id,
            "vacations": self.vacations,
            "taken_vacations": self.taken_vacations,
            "available_vacations": self.available_vacations,
            "start_date": self.start_date.strftime("%d-%m-%Y") if self.start_date else None,
            "end_date": self.end_date.strftime("%d-%m-%Y") if self.end_date else None,
            "days_requested": self.days_requested,
            "status": self.status,
            "created_at": self.created_at.strftime("%d-%m-%Y")
        }


class Survey(db.Model):
    __tablename__ = "surveys"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean(), default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(), default=datetime.utcnow)

    # Relaciones
    questions = relationship(
        "Question", back_populates="survey", cascade="all, delete-orphan")
    responses = relationship(
        "SurveyResponse", back_populates="survey", cascade="all, delete-orphan")

    def __repr__(self):
        return f"({self.title})"

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "questions": [q.serialize() for q in self.questions]
        }


class Question(db.Model):
    __tablename__ = "questions"

    id: Mapped[int] = mapped_column(primary_key=True)
    survey_id: Mapped[int] = mapped_column(
        ForeignKey("surveys.id"), nullable=False)

    text: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[str] = mapped_column(String(50), default="TEXT")

    survey = relationship("Survey", back_populates="questions")

    def __repr__(self):
        return f"{self.text}"

    def serialize(self):
        return {
            "id": self.id,
            "survey_id": self.survey_id,
            "text": self.text,
            "type": self.type
        }


class SurveyResponse(db.Model):
    __tablename__ = "survey_responses"

    id: Mapped[int] = mapped_column(primary_key=True)
    survey_id: Mapped[int] = mapped_column(
        ForeignKey("surveys.id"), nullable=False)
    employee_id: Mapped[int] = mapped_column(
        ForeignKey("employees.id"), nullable=False)
    submitted_at: Mapped[datetime] = mapped_column(
        DateTime(), default=datetime.utcnow)

    survey = relationship("Survey", back_populates="responses")
    employee = relationship("Employee")
    answers = relationship(
        "SurveyAnswer", back_populates="response", cascade="all, delete-orphan")

    def __repr__(self):
        return f"{self.employee.first_name} {self.employee.last_name}"

    def serialize(self):
        return {
            "id": self.id,
            "survey_id": self.survey_id,
            "employee_id": self.employee_id,
            "submitted_at": self.submitted_at.isoformat() if self.submitted_at else None
        }


class SurveyAnswer(db.Model):
    __tablename__ = "survey_answers"

    id: Mapped[int] = mapped_column(primary_key=True)
    response_id: Mapped[int] = mapped_column(
        ForeignKey("survey_responses.id"), nullable=False)
    question_id: Mapped[int] = mapped_column(
        ForeignKey("questions.id"), nullable=False)

    answer_value: Mapped[str] = mapped_column(Text, nullable=False)

    response = relationship("SurveyResponse", back_populates="answers")
    question = relationship("Question")

    def __repr__(self):
        return f"SurveyAnswer(response_id={self.response_id}, question_id={self.question_id})"

    def serialize(self):
        return {
            "id": self.id,
            "question_id": self.question_id,
            "answer_value": self.answer_value
        }
