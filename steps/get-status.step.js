export const config = { 
    name: 'GetStatus', 
    type: 'api', 
    path: '/status', 
    method: 'GET',
    emits: [] 
  };
  
  export const handler = async (req, { state }) => {
    const data = await state.get('missions', 'mission-alpha');
    return { status: 200, body: data || { status: 'WAITING' } };
  };