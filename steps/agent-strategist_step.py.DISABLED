import json
import urllib.request
import os
from dotenv import load_dotenv

load_dotenv()

config = {
    "name": "AgentStrategist",
    "type": "event",
    "subscribes": ["ai.analyze_risk"],
    "emits": ["ai.vote"]
}

GROQ_KEY = os.getenv("GROQ_API_KEY")

async def handler(event, context):
    data = event.get("data", event)
    mid = data.get("missionId")
    route = data.get("routeName", "Unknown")
    
    risk_score = 0
    reason = "Geopolitics Stable"

    if GROQ_KEY and "YOUR_" not in GROQ_KEY:
        try:
            prompt = f"Analyze security risk for cargo ship on route: {route}. Return JSON: {{ 'score': 0-100, 'reason': 'short explanation' }}."
            
            payload = json.dumps({
                "model": "llama-3.1-8b-instant",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.1,
                "response_format": {"type": "json_object"}
            }).encode('utf-8')

            req = urllib.request.Request(
                "https://api.groq.com/openai/v1/chat/completions",
                data=payload,
                headers={"Authorization": f"Bearer {GROQ_KEY}", "Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=3) as res:
                body = json.loads(res.read().decode())
                content = json.loads(body['choices'][0]['message']['content'])
                risk_score = content.get('score', 0)
                reason = content.get('reason', "LLM Analysis")
        except:
            pass
    else:
       
        if "Suez" in route: risk_score = 70; reason = "High Piracy Alert Zone"
    
    context.logger.info(f"⚔️ STRATEGIST: {risk_score}/100 ({reason})")
    await context.emit({
        "topic": "ai.vote",
        "data": { "missionId": mid, "agent": "STRATEGIST", "score": risk_score, "reason": reason }
    })