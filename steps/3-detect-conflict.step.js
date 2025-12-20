export const config = {
    name: 'DetectConflict',
    type: 'event',
    subscribes: ['mission.tick'], 
    emits: ['agent.negotiate'],
    flows: ['prolepsis-main']
  };
  
  export const handler = async (event, { state, emit, logger }) => {
   
    const payload = event.data || event; 
    const { missionId } = payload;
    if (!missionId) return;
    
   
    const me = await state.get(`mission:${missionId}`, missionId);
    if (!me || !me.path) return;
    const myPos = me.path[me.pathIdx] || [0,0];
  
   
    const registryIds = await state.get('system:registry', 'manifest');
    
    if (!registryIds || !Array.isArray(registryIds)) return; 
    
    const randomIds = registryIds.sort(() => 0.5 - Math.random()).slice(0, 3);
  
    for (const otherId of randomIds) {
        if (otherId === missionId) continue; 
  
        
        const other = await state.get(`mission:${otherId}`, otherId);
        if (!other || !other.path) continue;
  
        const otherPos = other.path[other.pathIdx] || [0,0];
  
        
        const dist = Math.sqrt(Math.pow(myPos[0] - otherPos[0], 2) + Math.pow(myPos[1] - otherPos[1], 2));
  
        
        if (dist < 5.0) {
            const cooldownKey = `cooldown:${missionId}:${other.id}`;
            const recentlyMet = await state.get('negotiations', cooldownKey);
            
            if (!recentlyMet) {
               logger.warn(`⚔️ CONFLICT DETECTED: ${missionId} vs ${other.id} (Dist: ${dist.toFixed(1)})`);
               await state.set('negotiations', cooldownKey, true); 
  
               await emit({
                   topic: 'agent.negotiate',
                   data: { shipA: me, shipB: other }
               });
               return; 
            }
        }
    }
  };