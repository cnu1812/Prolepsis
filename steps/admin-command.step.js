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
  
  logger.info(` ADMIN RECEIVED: ${JSON.stringify(req.body)}`);

  const { missionId, action, payload, reason, password } = req.body;

  
  const securePass = process.env.ADMIN_PASSWORD || 'admin123';
  if (password !== securePass) {
    logger.error(`PASSWORD FAIL: Expected '${securePass}', got '${password}'`);
    return { status: 401, body: { error: "WRONG PASSWORD" } };
  }

  
  if (action === 'TEST_ALERT') {
      logger.info("EXECUTING SMS TEST...");
      
      
      await emit({
          topic: 'system.patch_route',
          data: {
              missionId: "SYSTEM_TEST",
              requireApproval: true,
              reason: "MANUAL TEST",
              isAdminTrigger: true 
          }
      });
      return { status: 200, body: { success: true, message: "SMS SENT" } };
  }

  
  const ship = await state.get(`mission:${missionId}`, missionId);
  
  if (!ship) {
      logger.error(` SHIP NOT FOUND: ${missionId}`);
      return { status: 404, body: { error: "Ship not found" } };
  }

  ship.adminOverride = true; 
  
  if (action === 'FORCE_REROUTE') {
      ship.status = 'REROUTED_MANUAL';
      ship.routeName = payload.routeName;
      ship.path = payload.path;
      ship.pathIdx = 0;
      logger.info(` REROUTED ${missionId} to ${payload.routeName}`);
  } 
  
  if (action === 'SET_STATUS') {
      ship.status = payload.status;
      if (payload.status === 'OPTIMIZING_SPEED') ship.adminOverride = false;
      logger.info(`STATUS UPDATED ${missionId} to ${payload.status}`);
  }

  await state.set(`mission:${missionId}`, missionId, ship);
  return { status: 200, body: { success: true, message: "COMMAND DONE" } };
};