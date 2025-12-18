export const config = {
    name: 'StartMission',
    type: 'api',
    path: '/start',
    method: 'POST',
    emits: ['mission.tick'] 
  };
  
  export const handler = async (req, { state, emit, logger }) => {
    logger.info("🚀 INITIATING MASSIVE FLEET DEPLOYMENT");
  
    const ships = [];
    const routeNames = ["Pacific Run", "Atlantic Cross", "Suez Express", "Arctic Circle"];
    
    
    for (let i = 0; i < 5; i++) {
      const id = `VESSEL-${Math.floor(10000 + Math.random() * 90000)}`;
      const route = routeNames[i % routeNames.length];
      
      
      let path = [[20, 0], [25, 5], [30, 10]]; 
      if (route.includes("Pacific")) path = [[34, -118], [35, -120], [36, -125]];
      if (route.includes("Suez")) path = [[19, 72], [20, 70], [21, 68]];
  
      const ship = {
        id,
        status: 'EN_ROUTE',
        routeName: route,
        cargo: i % 2 === 0 ? "LIQUID GAS" : "ELECTRONICS",
        path: path,
        pathIdx: 0,
        logs: ["System Initialized"],
        history: []
      };
  
      
      await state.set(`mission:${id}`, id, ship);
      ships.push(ship);
  
      
      await emit({
        topic: 'mission.tick', 
        data: { missionId: id }
      });
    }
  
    return { status: 200, body: { message: "Fleet Deployed", count: ships.length } };
  };