export const config = {
    name: 'StartMission',
    type: 'api',
    path: '/start',
    method: 'POST',
    emits: ['mission.tick']
  };
  
  export const handler = async (req, { state, emit, logger }) => {
    logger.info(" INITIATING FLEET DEPLOYMENT");
  
  
  
    const ships = [];
    const shipIds = []; 
    const routeNames = ["Pacific Run", "Atlantic Cross", "Suez Express", "Arctic Circle"];
    
    
    for (let i = 0; i < 5; i++) {
      const id = `VESSEL-${Math.floor(10000 + Math.random() * 90000)}`;
      const route = routeNames[i % routeNames.length];
      
      
      let path = [[34, -118], [21, -157], [35, 139]]; 
      if (route.includes("Atlantic")) path = [[40, -74], [35, -40], [51, -0.1]];
      if (route.includes("Suez")) path = [[19, 72], [12, 45], [30, 32], [37, 23]];
      if (route.includes("Arctic")) path = [[64, -21], [70, 20], [68, 33]];
  
      const ship = {
        id,
        status: 'EN_ROUTE',
        routeName: route,
        cargo: i % 2 === 0 ? "LIQUID GAS" : "ELECTRONICS",
        type: "Cargo Freighter",
        path: path,
        pathIdx: 0,
        logs: [`Log 001: System Initialized. Destination: ${route}`],
        history: []
      };
  
      
      await state.set(`mission:${id}`, id, ship);
      ships.push(ship);
      shipIds.push(id); 
  
      
      await emit({ topic: 'mission.tick', data: { missionId: id } });
    }
  
   
    await state.set('system:registry', 'manifest', shipIds);
  
    return { status: 200, body: { message: "Fleet Deployed", count: ships.length } };
  };