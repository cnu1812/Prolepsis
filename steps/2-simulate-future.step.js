import { setTimeout } from 'timers/promises';

export const config = {
  name: 'SimulateFuture',
  type: 'event',
  subscribes: ['mission.tick'], 
  emits: ['ai.analyze_risk', 'mission.tick'],
  
};

export const handler = async (event, { state, emit, logger }) => {
    const { missionId } = event.data || event;
  
    const ship = await state.get(`mission:${missionId}`, missionId);
    if (!ship) return;
  
   
    ship.pathIdx = (ship.pathIdx || 0) + 1;
    if (ship.pathIdx >= ship.path.length) ship.pathIdx = 0;
    const newPos = ship.path[ship.pathIdx];
    await state.set(`mission:${missionId}`, missionId, ship);
  
    logger.info(` PREDICTING FUTURE for ${missionId}...`);
  
    
    if (!ship.adminOverride && Math.random() > 0.5) {
        await emit({
          topic: 'ai.analyze_risk',
          data: { 
              missionId: ship.id, 
              lat: newPos[0], 
              lng: newPos[1], 
              routeName: ship.routeName 
          }
        });
    } else {
        logger.info(`AI SILENCED for ${missionId} (Admin Override Active)`);
    }
    
    await setTimeout(3000); 
    await emit({ topic: 'mission.tick', data: { missionId: ship.id } });
  };