import dotenv from 'dotenv';
dotenv.config();

export const config = {
    name: 'AdminCommand',
    type: 'api',
    path: '/admin-command',
    method: 'POST',
    emits: ['system.patch_route'] 
  };
  
  export const handler = async (req, { state, emit, logger }) => {
    const { missionId, action, payload, reason, password } = req.body;
  
    const securePass = process.env.ADMIN_PASSWORD || 'admin123'; 
  
    if (password !== securePass) {
      return { status: 401, body: { error: "UNAUTHORIZED: Admin Access Required" } };
    }
  
  
  if (action === 'TEST_ALERT') {
    logger.info(` ADMIN TRIGGERING SMS for ${missionId}`);
    
    await emit({
        topic: 'system.patch_route',
        data: {
            missionId: missionId || "SYSTEM_TEST",
            requireApproval: true,
            reason: "MANUAL ADMIN OVERRIDE TEST",
            newRouteName: "N/A",
            isAdminTrigger: true 
        }
    });
    
    return { status: 200, body: { message: "Test Alert Sent" } };
}
   
  
    const missionKey = `mission:${missionId}`;
    const ship = await state.get(missionKey, missionId);
  
    if (!ship) return { status: 404, body: { error: "Ship not found" } };
  
   
    if (!ship.history) ship.history = [];
    ship.history.push({ timestamp: Date.now(), status: ship.status, log: `ADMIN: ${action}` });
    
    if (action === 'FORCE_REROUTE') {
        ship.status = 'REROUTED_MANUAL';
        ship.routeName = payload.routeName;
        ship.path = payload.path;
    } else if (action === 'SET_STATUS') {
        ship.status = payload.status;
    }
  
    ship.logs.push(`ADMIN CMD: ${action}`);
    await state.set(missionKey, missionId, ship);
  
    return { status: 200, body: { message: "Command Executed" } };
  };