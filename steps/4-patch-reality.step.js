export const config = {
    name: 'PatchReality',
    type: 'event',
    subscribes: ['system.patch_route'],
    emits: []
  };
  
  export const handler = async (event, { state, logger }) => {
    const data = event.data || event;
    const { missionId, requireApproval, statusUpdate, reason } = data;
  
    const missionKey = `mission:${missionId}`;
    const ship = await state.get(missionKey, missionId);
  
    if (!ship) return;
    
    
    const locked = ['QUARANTINED', 'REROUTED_MANUAL', 'REROUTED', 'REROUTING_CONFIRMED', 'AWAITING_ORDERS'];
    if (locked.includes(ship.status)) return;
  
    
    if (!ship.history) ship.history = [];
    ship.history.push({
        timestamp: Date.now(),
        status: ship.status,
        log: ship.logs[ship.logs.length - 1] || "System OK"
    });
    if (ship.history.length > 20) ship.history.shift();
  
    
    if (statusUpdate) {
      
      if (ship.status !== statusUpdate) {
          ship.status = statusUpdate;
          if (reason) ship.logs.push(`🤖 AI OP: ${reason}`);
      }
      await state.set(missionKey, missionId, ship);
      return;
    }
  
    
    if (requireApproval) {
      ship.status = 'AWAITING_ORDERS';
      ship.logs.push(`⚠️ ALERT: ${data.reason}`);
      ship.logs.push(`❓ PENDING ADMIN AUTHORIZATION...`);
      
      await state.set('approvals', missionId, { patchData: { ...data, requireApproval: false } });
      await state.set(missionKey, missionId, ship);
      return;
    }
  
    
    ship.status = 'REROUTED'; 
    ship.routeName = data.newRouteName;
    ship.path = data.newPath; 
    ship.logs.push(`⚡ CRITICAL ACTION: ${data.reason}`);
    
    await state.set(missionKey, missionId, ship);
  };