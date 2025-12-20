import random

config = {
    "name": "AgentEconomist",
    "type": "event",
    "subscribes": ["ai.analyze_risk"],
    "emits": ["ai.vote"]
}

async def handler(event, context):
    data = event.get("data", event)
    mid = data.get("missionId")
    cargo = "HIGH_VALUE" if "VESSEL" in mid else "BULK" 

    
    fuel_price_index = random.uniform(0.8, 1.5) 
    risk_score = 0
    reason = "Budget Approved"

    if fuel_price_index > 1.3:
        risk_score = 40 
        reason = "Fuel Prices Spiking - Recommend Slow Steaming"
    
    if "HIGH_VALUE" in cargo:
        risk_score += 10
        reason += " | Priority Cargo"

    context.logger.info(f"💰 ECONOMIST: {risk_score}/100 ({reason})")
    await context.emit({
        "topic": "ai.vote",
        "data": { "missionId": mid, "agent": "ECONOMIST", "score": risk_score, "reason": reason }
    })