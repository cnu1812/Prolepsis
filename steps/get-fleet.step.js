export const config = { name: 'GetFleet', type: 'api', path: '/fleet', method: 'GET', emits: [] };

export const handler = async (req, { state }) => {
  const activeIds = await state.get('system', 'active_fleet') || [];
  const fleet = [];


  for (const id of activeIds) {
    const ship = await state.get(`mission:${id}`, id);
    if (ship) fleet.push(ship);
  }

  return { status: 200, body: fleet };
};