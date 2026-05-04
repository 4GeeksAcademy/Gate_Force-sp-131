import enum
from datetime import datetime
from typing import List, Optional
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, DateTime, Text, ForeignKey, Enum, Integer, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship

db = SQLAlchemy()

# ==========================================
# 1. ENUMERACIONES (Unificadas a minúsculas)
# ==========================================


class RoleEnum(enum.Enum):
    ADMIN = "admin"
    COMPANY = "company"
    EMPLOYEE = "employee"


class StatusEnum(enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class IncidentTypeEnum(enum.Enum):
    """Ajustado con mayúscula inicial para coincidir con la DB"""
    MEDICAL = "Medical"
    PERSONAL = "Personal"
    OTHER = "Other"
    LABORAL = "Laboral"

# ==========================================
# 2. AUDITORÍA
# ==========================================


class AuditLog(db.Model):
    __tablename__ = "audit_logs"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, nullable=False)
    user_role: Mapped[str] = mapped_column(String(50), nullable=False)
    action: Mapped[str] = mapped_column(String(255), nullable=False)
    target_table: Mapped[str] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow)

# ==========================================
# 3. ENTIDADES DE AUTENTICACIÓN
# ==========================================


class UserAdmin(db.Model):
    __tablename__ = "user_admin"
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(
        String(50), unique=True, index=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow)

    def serialize(self):
        return {"id": self.id, "username": self.username, "role": "admin"}


class Company(db.Model):
    __tablename__ = "companies"
    id: Mapped[int] = mapped_column(primary_key=True)
    nombre_empresa: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, index=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    region: Mapped[str] = mapped_column(String(100), nullable=False)
    logo_url: Mapped[str] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean(), default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(), default=datetime.utcnow)

    employees = relationship(
        "Employee", back_populates="company", cascade="all, delete-orphan")

    def serialize(self):
        return {
            "id": self.id, "nombre_empresa": self.nombre_empresa, "email": self.email,
            "region": self.region, "logo_url": self.logo_url, "role": "company"
        }


class Employee(db.Model):
    __tablename__ = "employees"
    id: Mapped[int] = mapped_column(primary_key=True)
    company_id: Mapped[int] = mapped_column(ForeignKey(
        "companies.id", ondelete="CASCADE"), index=True)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, index=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=True)
    position: Mapped[str] = mapped_column(String(100), nullable=True)
    profile_image: Mapped[str] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean(), default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(), default=datetime.utcnow)

    company = relationship("Company", back_populates="employees")
    work_records = relationship(
        "WorkRecord", back_populates="employee", cascade="all, delete-orphan")
    nominas = relationship(
        "Nomina", back_populates="employee", cascade="all, delete-orphan")
    schedules = relationship(
        "Schedule", back_populates="employee", cascade="all, delete-orphan")
    incidents = relationship(
        "Incident", back_populates="employee", cascade="all, delete-orphan")
    vacaciones = relationship(
        "Vacaciones", back_populates="employee", cascade="all, delete-orphan")
    survey_responses = relationship(
        "SurveyResponse", back_populates="employee", cascade="all, delete-orphan")
    wellness_checks = relationship(
        "WellnessCheck", back_populates="employee", cascade="all, delete-orphan")

    def serialize(self):
        return {
            "id": self.id,
            "company_id": self.company_id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
            "role": "employee",
            "position": self.position,
            "is_active": self.is_active,
            "phone": self.phone,
            "profile_image": self.profile_image
        }

# ==========================================
# 4. GESTIÓN OPERATIVA
# ==========================================


class WorkRecord(db.Model):
    __tablename__ = "work_records"
    id: Mapped[int] = mapped_column(primary_key=True)
    employee_id: Mapped[int] = mapped_column(ForeignKey(
        "employees.id", ondelete="CASCADE"), index=True)
    check_in: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    check_out: Mapped[Optional[datetime]] = mapped_column(
        DateTime, nullable=True)
    total_hours: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    status: Mapped[StatusEnum] = mapped_column(
        Enum(StatusEnum, name="statusenum"), default=StatusEnum.PENDING)
    location: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)

    employee = relationship("Employee", back_populates="work_records")

    def serialize(self):
        employee_name = f"{self.employee.first_name} {self.employee.last_name}" if self.employee else "Usuario Desconocido"

        return {
            "id": self.id,
            "employee_id": self.employee_id,
            "employee_name": employee_name,
            "check_in": self.check_in.isoformat() + "Z" if self.check_in else None,
            "check_out": self.check_out.isoformat() + "Z" if self.check_out else None,
            "total_hours": self.total_hours,
            "status": self.status.value if hasattr(self.status, 'value') else self.status,
            "location": self.location
        }


class Incident(db.Model):
    __tablename__ = "incidents"
    id: Mapped[int] = mapped_column(primary_key=True)
    employee_id: Mapped[int] = mapped_column(ForeignKey(
        "employees.id", ondelete="CASCADE"), index=True)

    type: Mapped[str] = mapped_column(String(50), nullable=False)

    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[StatusEnum] = mapped_column(
        Enum(StatusEnum, name="statusenum"), default=StatusEnum.PENDING)
    admin_comment: Mapped[Optional[str]] = mapped_column(
        String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(), default=datetime.utcnow)

    employee = relationship("Employee", back_populates="incidents")

    def serialize(self):
        employee_name = f"{self.employee.first_name} {self.employee.last_name}" if self.employee else "Desconocido"

        return {
            "id": self.id,
            "employee_id": self.employee_id,
            "employee_name": employee_name,  # ¡Clave para el Admin!
            "type": self.type,
            "description": self.description,
            "status": self.status.value if hasattr(self.status, 'value') else self.status,
            "created_at": self.created_at.strftime("%Y-%m-%d") if hasattr(self, 'created_at') and self.created_at else None
        }


class Vacaciones(db.Model):
    __tablename__ = "vacaciones"
    id: Mapped[int] = mapped_column(primary_key=True)
    employee_id: Mapped[int] = mapped_column(ForeignKey(
        "employees.id", ondelete="CASCADE"), index=True)
    start_date: Mapped[datetime] = mapped_column(DateTime(), nullable=False)
    end_date: Mapped[datetime] = mapped_column(DateTime(), nullable=False)
    days_requested: Mapped[int] = mapped_column(nullable=False)

    # Unificado: Mismo Enum que el resto del sistema
    status: Mapped[StatusEnum] = mapped_column(
        Enum(StatusEnum, name="statusenum"), default=StatusEnum.PENDING)

    employee = relationship("Employee", back_populates="vacaciones")

    def serialize(self):
        employee_name = f"{self.employee.first_name} {self.employee.last_name}" if self.employee else "Desconocido"

        return {
            "id": self.id,
            "employee_id": self.employee_id,
            "employee_name": employee_name,  # ¡Clave para el Admin!
            "start": self.start_date.strftime("%Y-%m-%d"),
            "end": self.end_date.strftime("%Y-%m-%d"),
            "status": self.status.value if hasattr(self.status, 'value') else self.status
        }

# ==========================================
# 5. NOMINAS, HORARIOS Y ENCUESTAS (Resto del código mantenido)
# ==========================================


class Nomina(db.Model):
    __tablename__ = "nominas"
    id: Mapped[int] = mapped_column(primary_key=True)
    employee_id: Mapped[int] = mapped_column(ForeignKey(
        "employees.id", ondelete="CASCADE"), index=True)
    month: Mapped[str] = mapped_column(String(20), nullable=False)
    document_url: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    employee = relationship("Employee", back_populates="nominas")

    def serialize(self):
        return {"id": self.id, "month": self.month, "url": self.document_url}


class Schedule(db.Model):
    __tablename__ = "schedules"
    id: Mapped[int] = mapped_column(primary_key=True)
    employee_id: Mapped[int] = mapped_column(ForeignKey(
        "employees.id", ondelete="CASCADE"), index=True)
    day: Mapped[str] = mapped_column(String(20), nullable=False)
    start_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    end_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    employee = relationship("Employee", back_populates="schedules")

    def serialize(self):
        return {
            "id": self.id,
            "day": self.day,
            "start_time": self.start_time.strftime("%H:%M"),
            "end_time": self.end_time.strftime("%H:%M"),
            "employee_id": self.employee_id
        }


class Survey(db.Model):
    __tablename__ = "surveys"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean(), default=True)

    # NUEVO: ¿Esta encuesta exige un análisis facial con selfie?
    requires_biometrics: Mapped[bool] = mapped_column(Boolean(), default=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(), default=datetime.utcnow)

    questions = relationship(
        "Question", back_populates="survey", cascade="all, delete-orphan")
    responses = relationship(
        "SurveyResponse", back_populates="survey", cascade="all, delete-orphan")

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "is_active": self.is_active,
            "requires_biometrics": self.requires_biometrics,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S") if self.created_at else None,
            "questions": [q.serialize() for q in self.questions]
        }


class Question(db.Model):
    __tablename__ = "questions"
    id: Mapped[int] = mapped_column(primary_key=True)
    survey_id: Mapped[int] = mapped_column(
        ForeignKey("surveys.id", ondelete="CASCADE"))
    text: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[str] = mapped_column(
        String(50), default="TEXT")  # TEXT, RATING, BOOLEAN

    survey = relationship("Survey", back_populates="questions")

    def serialize(self):
        return {
            "id": self.id,
            "text": self.text,
            "type": self.type
        }


class SurveyResponse(db.Model):
    __tablename__ = "survey_responses"
    id: Mapped[int] = mapped_column(primary_key=True)
    survey_id: Mapped[int] = mapped_column(
        ForeignKey("surveys.id", ondelete="CASCADE"))
    employee_id: Mapped[int] = mapped_column(
        ForeignKey("employees.id", ondelete="CASCADE"))
    submitted_at: Mapped[datetime] = mapped_column(
        DateTime(), default=datetime.utcnow)

    # NUEVO: Integración del Análisis Biométrico (Opcional, por si la encuesta lo requiere)
    photo_url: Mapped[str] = mapped_column(Text, nullable=True)
    ai_joy: Mapped[float] = mapped_column(db.Float, nullable=True)
    ai_stress: Mapped[float] = mapped_column(db.Float, nullable=True)
    ai_sadness: Mapped[float] = mapped_column(db.Float, nullable=True)
    ai_calm: Mapped[float] = mapped_column(db.Float, nullable=True)
    final_wellness_score: Mapped[float] = mapped_column(
        db.Float, nullable=True)
    admin_recommendation: Mapped[str] = mapped_column(
        String(500), nullable=True)

    survey = relationship("Survey", back_populates="responses")
    employee = relationship("Employee", back_populates="survey_responses")
    answers = relationship(
        "SurveyAnswer", back_populates="response", cascade="all, delete-orphan")

    def serialize(self):
        return {
            "id": self.id,
            "survey_id": self.survey_id,
            "employee_id": self.employee_id,
            "submitted_at": self.submitted_at.strftime("%Y-%m-%d %H:%M:%S") if self.submitted_at else None,
            "biometrics": {
                "photo_url": self.photo_url,
                "score": self.final_wellness_score,
                "recommendation": self.admin_recommendation
            },
            "answers": [a.serialize() for a in self.answers]
        }


class SurveyAnswer(db.Model):
    __tablename__ = "survey_answers"
    id: Mapped[int] = mapped_column(primary_key=True)
    response_id: Mapped[int] = mapped_column(
        ForeignKey("survey_responses.id", ondelete="CASCADE"))
    question_id: Mapped[int] = mapped_column(
        ForeignKey("questions.id", ondelete="CASCADE"))
    answer_value: Mapped[str] = mapped_column(Text, nullable=False)

    response = relationship("SurveyResponse", back_populates="answers")

    def serialize(self):
        return {
            "id": self.id,
            "question_id": self.question_id,
            "answer_value": self.answer_value
        }


class WellnessCheck(db.Model):
    __tablename__ = 'wellness_checks'

    id: Mapped[int] = mapped_column(primary_key=True)
    # CORREGIDO: Apunta a "employees.id" (plural) para coincidir con __tablename__
    employee_id: Mapped[int] = mapped_column(ForeignKey(
        'employees.id', ondelete="CASCADE"), index=True)

    # NUEVO: Columnas que faltaban y se usan en serialize
    self_reported_mood: Mapped[Optional[str]
                               ] = mapped_column(String(50), nullable=True)
    survey_comment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Biometría IA
    photo_url: Mapped[str] = mapped_column(Text, nullable=True)
    ai_joy: Mapped[float] = mapped_column(Float, nullable=True)
    ai_stress: Mapped[float] = mapped_column(Float, nullable=True)
    ai_sadness: Mapped[float] = mapped_column(Float, nullable=True)
    ai_calm: Mapped[float] = mapped_column(Float, nullable=True)
    final_wellness_score: Mapped[float] = mapped_column(Float, nullable=True)
    admin_recommendation: Mapped[str] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow)

    # Relación inversa
    employee = relationship("Employee", back_populates="wellness_checks")

    def serialize(self):
        employee_name = f"{self.employee.first_name} {self.employee.last_name}" if self.employee else "Desconocido"
        date_str = self.created_at.strftime(
            "%Y-%m-%d %H:%M:%S") if self.created_at else None

        return {
            "id": self.id,
            "employee_id": self.employee_id,
            "employee_name": employee_name,
            "photo_url": self.photo_url or "",
            "ai_joy": float(self.ai_joy) if self.ai_joy is not None else 0,
            "ai_stress": float(self.ai_stress) if self.ai_stress is not None else 0,
            "ai_sadness": float(self.ai_sadness) if self.ai_sadness is not None else 0,
            "ai_calm": float(self.ai_calm) if self.ai_calm is not None else 0,
            "final_wellness_score": float(self.final_wellness_score) if self.final_wellness_score is not None else 0,
            "admin_recommendation": self.admin_recommendation or "Sin recomendación disponible",
            "created_at": date_str,
            "survey": {
                "mood": self.self_reported_mood,
                "comment": self.survey_comment
            },
            "ai_analysis": {
                "joy": self.ai_joy,
                "stress": self.ai_stress,
                "sadness": self.ai_sadness,
                "calm": self.ai_calm
            },
            "photo_url": self.photo_url,
            "results": {
                "score": self.final_wellness_score,
                "recommendation": self.admin_recommendation
            }
        }
    
class ChatMessage(db.Model):
    __tablename__ = "chat_messages"

    id: Mapped[int] = mapped_column(primary_key=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id", ondelete="CASCADE"), index=True)
    employee_id: Mapped[int] = mapped_column(ForeignKey("employees.id", ondelete="CASCADE"), index=True)
    sender_role: Mapped[str] = mapped_column(String(20), nullable=False)  # "COMPANY" o "EMPLOYEE"
    content: Mapped[str] = mapped_column(Text, nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean(), default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    company = relationship("Company", foreign_keys=[company_id])
    employee = relationship("Employee", foreign_keys=[employee_id])

    def serialize(self):
        return {
            "id": self.id,
            "company_id": self.company_id,
            "employee_id": self.employee_id,
            "sender_role": self.sender_role,
            "content": self.content,
            "is_read": self.is_read,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S")
        }
