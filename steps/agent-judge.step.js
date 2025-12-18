export const config = {
    name: 'TheHighCouncil',
    type: 'event',
    subscribes: ['ai.vote'],
    emits: ['system.patch_route']
  };
  
  export const handler = async (event, { state, emit, logger }) => {
    const { missionId, agent, score, reason } = event.data || event;
    const key = `council:${missionId}`;
    
  
    let ballot = await state.get('votes', key) || { votes: [] };
    ballot.votes.push({ agent, score, reason });
    await state.set('votes', key, ballot);
  
    logger.info(`⚖️ JUDGE: Received vote from ${agent} for ${missionId}. Total: ${ballot.votes.length}/3`);
  
    
    if (ballot.votes.length >= 3) {
        
        const totalScore = ballot.votes.reduce((acc, v) => acc + v.score, 0);
        const avgScore = totalScore / 3;
        const worstVote = ballot.votes.sort((a, b) => b.score - a.score)[0];
        
        
        const voteData = ballot.votes.map(v => ({
            id: v.agent,
            score: v.score,
            icon: v.agent === 'METEOROLOGIST' ? '🌩️' : (v.agent === 'ECONOMIST' ? '💰' : '⚔️')
        }));
  
        
        await state.set('votes', key, { votes: [] });
  
        
        let actionData = {};
        const finalReason = `COUNCIL: ${worstVote.agent} flagged ${worstVote.reason}`;
  
        if (avgScore > 60 || worstVote.score > 85) {
            logger.warn(`👩‍⚖️ REROUTE ${missionId}`);
            actionData = {
                missionId,
                newRouteName: "EVASION_PROTOCOL_ALPHA",
                newPath: [[20, 0], [25, 10], [30, 20]], 
                reason: finalReason,
                requireApproval: true,
                councilVotes: voteData 
            };
        } else {
            logger.info(`👩‍⚖️ UPDATE ${missionId}`);
            actionData = {
                missionId,
                statusUpdate: avgScore > 30 ? "SLOW_STEAMING" : "OPTIMIZING_SPEED",
                reason: finalReason,
                councilVotes: voteData 
            };
        }
  
        await emit({ topic: 'system.patch_route', data: actionData });
    }
  };