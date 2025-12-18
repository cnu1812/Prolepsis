import urllib.request
import json
import os
from dotenv import load_dotenv

load_dotenv()

config = {
    "name": "AgentMeteorologist",
    "type": "event",
    "subscribes": ["ai.analyze_risk"],
    "emits": ["ai.vote"]
}

WEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")

async def handler(event, context):
    data = event.get("data", event)
    mid = data.get("missionId")
    lat, lng = data.get("lat", 0), data.get("lng", 0)

    
    risk_score = 0 
    reason = "Weather Clear"
    
    
    if WEATHER_API_KEY:
        try:
            url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lng}&appid={WEATHER_API_KEY}&units=metric"
            with urllib.request.urlopen(url, timeout=2) as response:
                if response.getcode() == 200:
                    w = json.loads(response.read().decode())
                    wind = w['wind']['speed'] * 3.6
                    desc = w['weather'][0]['description'].upper()
                    
                    if wind > 80: risk_score = 100; reason = f"HURRICANE FORCE WINDS ({int(wind)}km/h)"
                    elif wind > 50: risk_score = 60; reason = f"Gale Warning ({int(wind)}km/h)"
                    elif "STORM" in desc: risk_score = 80; reason = f"Storm Front: {desc}"
                    else: reason = f"Weather Nominal ({desc})"
        except: pass
    
    
    context.logger.info(f"METEOROLOGIST: {risk_score}/100 ({reason})")
    await context.emit({
        "topic": "ai.vote",
        "data": { "missionId": mid, "agent": "METEOROLOGIST", "score": risk_score, "reason": reason }
    })