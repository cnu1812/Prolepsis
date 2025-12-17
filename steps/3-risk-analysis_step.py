import random
import asyncio
import urllib.request
import urllib.error
import json
import os
from dotenv import load_dotenv

load_dotenv()

config = {
    "name": "RiskAnalysisAI",
    "type": "event",
    "subscribes": ["ai.analyze_risk"],
    "emits": ["system.patch_route"]
}


GROQ_API_KEY = os.getenv("GROQ_API_KEY") 
WEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")

async def handler(event, context):
    data = event.get("data", event)
    mission_id = data.get("missionId")
    route_name = data.get("routeName")
    lat = data.get("lat", 0)
    lng = data.get("lng", 0)
    
    cargo = "LIQUID GAS" if "VESSEL" in mission_id else "General Cargo"
    
   
    weather_desc = "Clear skies"
    wind_speed = 15
    
    if WEATHER_API_KEY:
        try:
            url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lng}&appid={WEATHER_API_KEY}&units=metric"
            with urllib.request.urlopen(url, timeout=2) as response:
                if response.getcode() == 200:
                    w_data = json.loads(response.read().decode())
                    weather_desc = w_data['weather'][0]['description']
                    wind_speed = w_data['wind']['speed'] * 3.6
        except: pass
    
    decision = None
    
    
    if GROQ_API_KEY and "YOUR_GROQ_API_KEY" not in GROQ_API_KEY:
        try:
            prompt = f"""
            Analyze Maritime Risk.
            Ship: {mission_id}, Route: {route_name}, Cargo: {cargo}
            Loc: {lat}, {lng}, Weather: {weather_desc}, Wind: {wind_speed} km/h

            Rules:
            - If wind > 60km/h OR weather severe -> ACTION: REROUTE.
            - If wind 30-60km/h -> ACTION: UPDATE_STATUS (SLOW_STEAMING).
            - Else -> ACTION: UPDATE_STATUS (OPTIMIZING_SPEED).

            Return JSON ONLY: {{"action": "...", "status": "...", "reason": "...", "confidence": 0.9}}
            """
            
            payload = json.dumps({
                "model": "llama-3.1-8b-instant", 
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.1,
                "response_format": {"type": "json_object"} 
            }).encode('utf-8')

            req = urllib.request.Request(
                "https://api.groq.com/openai/v1/chat/completions",
                data=payload,
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json"
                }
            )
            
            with urllib.request.urlopen(req, timeout=5) as response:
                llm_resp = json.loads(response.read().decode())
                content = llm_resp['choices'][0]['message']['content']
                decision = json.loads(content)
                context.logger.info(f"🧠 AI DECISION: {decision['status']} ({decision['reason']})")

        except urllib.error.HTTPError as e:
            
            error_body = e.read().decode()
            context.logger.error(f"❌ GROQ API ERROR ({e.code}): {error_body}")
        except Exception as e:
            context.logger.error(f"❌ LLM SYSTEM ERROR: {str(e)}")

    
    if not decision:
        if wind_speed > 60: 
            decision = {"action": "REROUTE", "status": "EVASION_STORM", "reason": f"Fallback: High winds {wind_speed}km/h"}
        else:
            decision = {"action": "UPDATE_STATUS", "status": "OPTIMIZING_SPEED", "reason": f"Nominal: {weather_desc}"}

    
    if decision.get("action") == "REROUTE":
        new_path = [[lat+5, lng+5], [lat+10, lng+10], [lat+15, lng+5]]
        await context.emit({
            "topic": "system.patch_route",
            "data": {
                "missionId": mission_id,
                "newRouteName": "AI_EVASION_PATH",
                "newPath": new_path,
                "reason": decision.get("reason", "AI Threat Detected"),
                "requireApproval": True
            }
        })
    else:
        await context.emit({
            "topic": "system.patch_route",
            "data": {
                "missionId": mission_id,
                "statusUpdate": decision.get("status", "OPTIMIZING_SPEED"),
                "reason": decision.get("reason", "Operational Adjustment")
            }
        })