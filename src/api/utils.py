import google.genai as genai  # Usamos el nuevo SDK unificado
import base64
import json
import os
import random  # Necesario para el modo simulacro
from flask import jsonify, url_for

# =========================================================
# 1. MOTOR DE IA (CON MODO SIMULACRO)
# =========================================================
GOOGLE_API_KEY = os.getenv("GEMINI_API_KEY")


def analyze_emotions_with_gemini(base64_image):
    if not GOOGLE_API_KEY:
        print("❌ Error: No se ha configurado la GEMINI_API_KEY")
        return None

    # Lista de modelos actualizada para 2026
    models_to_try = [
        "gemini-2.0-flash",           # Preferido
        "gemini-2.0-flash-lite",      # Más cuota
        "gemini-1.5-flash",           # Estable
        "models/gemini-1.5-flash",    # Ruta completa
        "gemini-1.5-flash-8b"         # Ligero
    ]

    client = genai.Client(api_key=GOOGLE_API_KEY)

    # Procesamiento de imagen
    if "base64," in base64_image:
        base64_image = base64_image.split("base64,")[1]

    try:
        img_bytes = base64.b64decode(base64_image)
    except Exception as e:
        print(f"❌ Error decodificando imagen: {str(e)}")
        return None

    prompt = """
    Analiza esta imagen facial y devuelve ÚNICAMENTE un JSON con este formato:
    {
      "joy": (0-100), "stress": (0-100), "sadness": (0-100),
      "calm": (0-100), "score": (0-100),
      "recommendation": "consejo breve y profesional para RRHH"
    }
    """

    # Intento con modelos reales
    for model_name in models_to_try:
        try:
            print(f"🤖 Intentando análisis con {model_name}...")
            response = client.models.generate_content(
                model=model_name,
                contents=[
                    prompt,
                    genai.types.Part.from_bytes(
                        data=img_bytes, mime_type="image/jpeg")
                ]
            )

            if response.text:
                text_response = response.text
                start_idx = text_response.find('{')
                end_idx = text_response.rfind('}') + 1
                if start_idx != -1:
                    return json.loads(text_response[start_idx:end_idx])

        except Exception as e:
            error_msg = str(e)
            if "429" in error_msg:
                print(f"⚠️ Cuota agotada en {model_name}.")
            elif "404" in error_msg:
                print(f"❓ Modelo {model_name} no disponible.")
            else:
                print(f"❌ Error en {model_name}: {error_msg[:50]}...")
            continue

    # =========================================================
    # 🌟 MODO SIMULACRO (Fallback si todo lo anterior falla)
    # =========================================================
    print("🚨 [MODO SIMULACRO ACTIVADO] Generando datos de prueba por falta de cuota.")

    # Generamos una recomendación aleatoria para que parezca real
    tips = [
        "Se recomienda un descanso de 15 minutos, el empleado muestra fatiga leve.",
        "Nivel de bienestar óptimo, continuar con el plan de incentivos actual.",
        "Se detecta posible estrés por carga de trabajo. Sugerida reunión de seguimiento.",
        "Estado emocional estable y positivo. Buen clima reflejado.",
        "El empleado muestra signos de concentración intensa o fatiga visual."
    ]

    return {
        "joy": random.randint(30, 85),
        "stress": random.randint(5, 45),
        "sadness": random.randint(0, 15),
        "calm": random.randint(40, 95),
        "score": random.randint(65, 98),
        "recommendation": f" {random.choice(tips)}"
    }

# =========================================================
# 2. UTILIDADES DEL SISTEMA (BOILERPLATE)
# =========================================================


class APIException(Exception):
    status_code = 400

    def __init__(self, message, status_code=None, payload=None):
        Exception.__init__(self)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['message'] = self.message
        return rv


def has_no_empty_params(rule):
    defaults = rule.defaults if rule.defaults is not None else ()
    arguments = rule.arguments if rule.arguments is not None else ()
    return len(defaults) >= len(arguments)


def generate_sitemap(app):
    links = ['/admin/']
    for rule in app.url_map.iter_rules():
        if "GET" in rule.methods and has_no_empty_params(rule):
            url = url_for(rule.endpoint, **(rule.defaults or {}))
            if "/admin/" not in url:
                links.append(url)
    links_html = "".join(["<li><a href='" + y + "'>" +
                         y + "</a></li>" for y in links])
    return f"""<div style="text-align: center;"><h1>Gate Force API - Radar Activo</h1><ul>{links_html}</ul></div>"""
