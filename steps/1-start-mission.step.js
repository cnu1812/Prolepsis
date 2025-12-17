import { v4 as uuidv4 } from 'uuid';

export const config = {
  name: 'StartMission',
  type: 'api',
  path: '/start',
  method: 'POST',
  emits: ['simulation.start']
};

const ROUTES = {
  'PACIFIC': { name: 'Pacific Run', path: [[34, -118], [21, -157], [35, 139]] }, 
  'ATLANTIC': { name: 'Atlantic Cross', path: [[40, -74], [35, -40], [51, -0.1]] },
  'SUEZ': { name: 'Suez Express', path: [[19, 72], [12, 45], [30, 32], [37, 23]] },
  'CAPE': { name: 'Cape Route', path: [[-22, -43], [-34, 18], [19, 72]] },
  'ARCTIC': { name: 'Arctic Circle', path: [[64, -21], [70, 20], [68, 33]] },
  'INDIAN': { name: 'Indian Ocean Loop', path: [[-31, 115], [-10, 80], [10, 60]] } // New Route!
};

const SHIP_TYPES = ['TANKER', 'CARGO', 'FRIGATE', 'ICEBREAKER', 'CONTAINER', 'LIVESTOCK'];
const CARGO_TYPES = ['CRUDE OIL', 'SEMICONDUCTORS', 'LIQUID GAS', 'GRAIN', 'MEDICAL SUPPLIES', 'TITANIUM'];

export const handler = async (req, { state, emit, logger }) => {
  const fleetSize = 40; 
  const missions = [];

  logger.info(` INITIATING MASSIVE FLEET DEPLOYMENT: ${fleetSize} VESSELS`);

  for (let i = 0; i < fleetSize; i++) {
    const missionId = `VESSEL-${Math.floor(Math.random() * 90000) + 10000}`; // 5 digit ID
    const routeKeys = Object.keys(ROUTES);
    const randomKey = routeKeys[Math.floor(Math.random() * routeKeys.length)];
    const selectedRoute = ROUTES[randomKey];
    const type = SHIP_TYPES[Math.floor(Math.random() * SHIP_TYPES.length)];
    const cargo = CARGO_TYPES[Math.floor(Math.random() * CARGO_TYPES.length)];

    const missionData = {
      id: missionId,
      type: type,
      cargo: cargo,
      crew: Math.floor(Math.random() * 50) + 10,
      status: 'IN_TRANSIT',
      routeName: selectedRoute.name,
      path: selectedRoute.path,
      history: [], 
      logs: [`System Initialized: Class ${type} | ${cargo}`],
      timestamp: Date.now()
    };

    await state.set(`mission:${missionId}`, missionId, missionData);
    missions.push(missionId);

    setTimeout(() => {
        emit({ topic: 'simulation.start', data: { missionId, routeName: selectedRoute.name } });
    }, i * 150); 
  }

  await state.set('system', 'active_fleet', missions);
  return { status: 200, body: { message: `Deployed ${fleetSize} vessels.` } };
};