export const config = {
    name: 'AgentNegotiation',
    type: 'event',
    subscribes: ['agent.negotiate'],
    emits: ['system.patch_route', 'ui.comms_log']
  };
  
  export const handler = async (event, { emit, logger }) => {
    
    const payload = event.data || event; 
    const { shipA, shipB } = payload;
  
   
    if (!shipA || !shipB) {
       
        return;
    }
  
   
    const getPriority = (cargo) => {
        if (!cargo) return 1;
        if (cargo.includes("MEDICAL") || cargo.includes("GAS")) return 10;
        if (cargo.includes("ELECTRONICS") || cargo.includes("FOOD")) return 5;
        return 1;
    };
  
    const scoreA = getPriority(shipA.cargo);
    const scoreB = getPriority(shipB.cargo);
  
    let winner, loser;
    
   
    const dialogue = [];
    dialogue.push(`[${shipA.id}]: Unknown vessel, this is ${shipA.id}. Carrying ${shipA.cargo}. Requesting right of way.`);
  
    if (scoreA >= scoreB) {
        winner = shipA; loser = shipB;
        dialogue.push(`[${shipB.id}]: Solid copy. I am hauling ${shipB.cargo} (Low Priority). Adjusting thrusters.`);
        dialogue.push(`[${shipA.id}]: Appreciated, ${shipB.id}. Maintain course. Out.`);
    } else {
        winner = shipB; loser = shipA;
        dialogue.push(`[${shipB.id}]: Negative, ${shipA.id}. I have Priority Cargo (${shipB.cargo}). Maintain distance.`);
        dialogue.push(`[${shipA.id}]: Understood. Slowing speed to 50%. Safe travels.`);
    }
  
   
    logger.info(` NEGOTIATION COMPLETE: ${winner.id} takes lead over ${loser.id}`);
  
   
    const chatLog = `COMMS: ${dialogue.join(" | ")}`;
  
    
    await emit({
        topic: 'system.patch_route',
        data: {
            missionId: loser.id,
            statusUpdate: "YIELDING_WAY", 
            reason: chatLog 
        }
    });
  
    
    await emit({
        topic: 'system.patch_route',
        data: {
            missionId: winner.id,
            statusUpdate: "PRIORITY_PASSAGE",
            reason: chatLog
        }
    });
  };