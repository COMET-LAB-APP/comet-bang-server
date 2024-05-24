


const matchInit = function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, params: {[key: string]: string}): {state: nkruntime.MatchState, tickRate: number, label: string} {
  // Determine if the match should be private based on the passed in params
  const isPrivate = params.isPrivate === "true";  

  // Define the match state
  const state: State = {
    players: {},
    isPrivate,
    playerCount: 0,
    requiredPlayerCount: 2,
    gameState: GameState.WaitingForPlayers,
    emptyTicks: 0,
    joinsInProgress : 0
  };
  
     // Update the match label to surface important information for players who are searching for a match
    const label = JSON.stringify({ isPrivate: state.isPrivate.toString(), playerCount: state.playerCount, requiredPlayerCount: state.requiredPlayerCount });
    
    return {
      state: state,
        tickRate: 1, // 1 tick per second = 1 MatchLoop func invocations per second
        label: label
      };
 } 


 const matchJoinAttempt: nkruntime.MatchJoinAttemptFunction<nkruntime.MatchState> = function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: nkruntime.MatchState, presence: nkruntime.Presence, metadata: {[key: string]: any}) {
  // Check if it's a user attempting to rejoin after a disconnect.
  logger.info(`state: ${state}`)
  // New player attempting to connect.
  state.joinsInProgress++;
  return {
      state,
      accept: true,
  }
}

  const matchJoin = function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: nkruntime.MatchState, presences: nkruntime.Presence[]) : { state: nkruntime.MatchState } | null {
    for (const presence of presences) {
      state.players[presence.userId] = {presence, isReady : false};
      state.playerCount++;
    };
    
    
    // If the match is full then update the state
    if (state.playerCount === state.requiredPlayerCount) {
      state.gameState = GameState.WaitingForPlayersReady;
    }
  
    // Update the match label
    const label = JSON.stringify({ isPrivate: state.isPrivate.toString(), playerCount: state.playerCount, requiredPlayerCount: state.requiredPlayerCount });
    dispatcher.matchLabelUpdate(label);
  
    return {
        state
    };
  }

  
  const matchLeave = function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: nkruntime.MatchState, presences: nkruntime.Presence[]) : { state: nkruntime.MatchState } | null {
    presences.forEach(function (presence) {
    delete(state.players[presence.userId]);
    state.playerCount--;
  });
  
    return {
      state
    };
  }
  
  const matchLoop = function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: nkruntime.MatchState, messages: nkruntime.MatchMessage[]) : { state: nkruntime.MatchState} | null {
    // If the match is empty, increment the empty ticks
    
    logger.info("start match loop " + state.emptyTicks)
    if (state.playerCount === 0) {
      state.emptyTicks++;
    } else {
      state.emptyTicks = 0;
    }
 
    // If the match has been empty for too long, end it
    if (state.emptyTicks >= 100) {
      return null;
    }

    // TODO: here need to create loop for game play 
  
    return {
      state
    };
  } 

  let matchTerminate: nkruntime.MatchTerminateFunction = function(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: nkruntime.MatchState, graceSeconds: number) {
    return { state };
  }
  
  let matchSignal: nkruntime.MatchSignalFunction = function(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number,  state: nkruntime.MatchState) {
    return { state };
  }
  
  const OnRegisterMatchmakerMatched: nkruntime.MatchmakerMatchedFunction = function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, matches: nkruntime.MatchmakerResult[]) {
    // Create a public match and return it's match ID
    var matchId = nk.matchCreate("LobbyMatch", {"invited": matches, isPrivate: false });
    logger.debug(`Created LobbyMatch with ID: ${matchId}`);
  
    return matchId;
  };
  
