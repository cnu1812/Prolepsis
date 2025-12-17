export const config = {
    name: 'ApproveIntervention',
    type: 'api',
    path: '/approve',
    method: 'POST',
    emits: ['system.patch_route']
  };
  
  export const handler = async (req, { state, emit, logger }) => {
    const { missionId, approved, password, reason } = req.body;
  
    
    if (password !== 'admin123') {
      logger.warn(`⛔ DENIED: Incorrect Password for ${missionId}`);
      return { status: 401, body: { error: "WRONG PASSWORD. Try: admin123" } };
    }
  
    
    const proposal = await state.get('approvals', missionId);
    if (!proposal) {
      return { status: 404, body: { error: "Approval request expired or not found." } };
    }
  
    
    if (approved) {
      logger.info(` AUTHORIZED: ${missionId} - Reason: ${reason || 'Admin Action'}`);
      
      await emit({
        topic: 'system.patch_route',
        data: proposal.patchData
      });
  
      await state.set('approvals', missionId, null);
      
      
      const ship = await state.get(`mission:${missionId}`, missionId);
      if (ship) {
          ship.status = 'REROUTING_CONFIRMED';
          await state.set(`mission:${missionId}`, missionId, ship);
      }
  
      return { status: 200, body: { message: "Course Correction Authorized." } };
    } else {
      logger.info(` DENIED: ${missionId} - Reason: ${reason || 'Admin Override'}`);
      await state.set('approvals', missionId, null);
      
      
      const ship = await state.get(`mission:${missionId}`, missionId);
      if (ship) {
          ship.status = 'IN_TRANSIT';
          ship.logs.push(` REROUTE DENIED: ${reason || 'Manual Override'}`);
          await state.set(`mission:${missionId}`, missionId, ship);
      }
      
      return { status: 200, body: { message: "Intervention Cancelled." } };
    }
  };