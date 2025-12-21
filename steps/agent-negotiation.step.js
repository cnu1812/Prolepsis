export const config = {
    name: 'AgentNegotiation',
    type: 'event',
    subscribes: ['agent.negotiate'],
    emits: ['system.patch_route', 'ui.comms_log'],
    flows: ['prolepsis-main']
  };
  
  export const handler = async (event, { emit, logger }) => {
    const startTick = performance.now(); 
    
    const payload = event.data || event; 
    const { shipA, shipB } = payload;
    if (!shipA || !shipB) return;
  
    
    const getPriority = (cargo) => {
        if (!cargo) return 1;
        if (cargo.includes("MEDICAL") || cargo.includes("GAS")) return 10;
        if (cargo.includes("ELECTRONICS") || cargo.includes("FOOD")) return 5;
        return 1;
    };
  
    const scoreA = getPriority(shipA.cargo);
    const scoreB = getPriority(shipB.cargo);
  
    let winner, loser, reason;
    
    
    const dialogue = [];
    dialogue.push(`[${shipA.id}]: Requesting right of way. Cargo Priority: ${scoreA}`);
  
    if (scoreA >= scoreB) {
        winner = shipA; loser = shipB;
        dialogue.push(`[${shipB.id}]: Acknowledged. My Priority: ${scoreB}. Yielding.`);
        dialogue.push(`[${shipA.id}]: Proceeding.`);
    } else {
        winner = shipB; loser = shipA;
        dialogue.push(`[${shipB.id}]: Negative. My Priority is HIGHER (${scoreB}).`);
        dialogue.push(`[${shipA.id}]: Copy. Yielding.`);
    }
  
    
    const chatLog = `COMMS: ${dialogue.join(" | ")}`;
    const processingTime = (performance.now() - startTick).toFixed(2); 
  
   
    const telemetry = {
        decision_engine: "SwarmProtocol_v1",
        latency_ms: processingTime,
        ai_confidence: 0.99,
        logic_trace: `Compared Score A (${scoreA}) vs Score B (${scoreB})`
    };
  
    await emit({
        topic: 'system.patch_route',
        data: {
            missionId: loser.id,
            statusUpdate: "YIELDING_WAY", 
            reason: chatLog,
            _telemetry: telemetry 
        }
    });
  
    await emit({
        topic: 'system.patch_route',
        data: {
            missionId: winner.id,
            statusUpdate: "PRIORITY_PASSAGE",
            reason: chatLog,
            _telemetry: telemetry
        }
    });
    
    logger.info(`⚡ [Trace] Negotiation resolved in ${processingTime}ms`);
  };