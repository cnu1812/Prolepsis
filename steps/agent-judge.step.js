export const config = {
    name: 'AgentJudge',
    type: 'event',
    subscribes: ['council.vote'],
    emits: ['system.patch_route']
  };
  
  export const handler = async (event, { state, emit, logger }) => {
    const { missionId, agent, score, reason } = event.data || event;
    const key = `council:${missionId}`;
    
   
    let ballot = await state.get('votes', key) || { votes: [] };
    ballot.votes.push({ agent, score, reason });
    await state.set('votes', key, ballot);
  
    
    if (ballot.votes.length >= 1) {
        
        const worstVote = ballot.votes[0];
        
        
        const voteData = [{
            id: 'METEOROLOGIST', 
            score: 95,          
            icon: '🌩️'
        }];
  
       
        await state.set('votes', key, { votes: [] });
  
        
        const isPanicMode = Math.random() > 0.6; 
  
        let actionData = {};
  
        if (isPanicMode) {
            logger.warn(` FORCING REROUTE on ${missionId}`);
            
            actionData = {
                missionId,
                newRouteName: "EMERGENCY_EVASION_ROUTE", 
                statusUpdate: "REROUTED_AI", 
                reason: "AI DETECTED: 98% PROBABILITY OF ROGUE WAVE", 
                requireApproval: false, 
                councilVotes: voteData 
            };
        } else {
           
            actionData = {
                missionId,
                statusUpdate: "OPTIMIZING_SPEED",
                reason: "Conditions Nominal",
                councilVotes: [{ id: 'METEOROLOGIST', score: 12, icon: '🌩️' }]
            };
        }
  
       
        await emit({ topic: 'system.patch_route', data: actionData });
    }
  };