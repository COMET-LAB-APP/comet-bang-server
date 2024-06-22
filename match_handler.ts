const roles: Role[] = [
  { id: 1, name: "Admin", description: "Responsible for managing the system." },
  { id: 2, name: "Editor", description: "Can edit and publish content." },
  { id: 3, name: "Viewer", description: "Can view content but cannot make changes." },
  { id: 4, name: "Contributor", description: "Can contribute new content." },
  { id: 5, name: "Moderator", description: "Can moderate user comments and content." },
  { id: 6, name: "Analyst", description: "Can view and analyze data." },
  { id: 7, name: "Guest", description: "Limited access to view content." }
];

const charactors: Charactor[] = [
  { id: 1, name: "Bear", description: "Bear is responsible for managing the system. As the backbone of the team, Bear ensures that everything runs smoothly and efficiently." },
  { id: 2, name: "Monkey", description: "Monkey can edit and publish content. Agile and creative, Monkey brings fresh ideas and keeps the content engaging and up-to-date." },
  { id: 3, name: "Fox", description: "Fox can view content but cannot make changes. With a keen eye for detail, Fox ensures that all content meets the highest standards of quality." },
  { id: 4, name: "Cat", description: "Cat can contribute new content. Curious and innovative, Cat adds new and exciting content to keep the audience engaged and informed." },
  { id: 5, name: "Cheetar", description: "Cheetar can moderate user comments and content. Fast and vigilant, Cheetar ensures that the community stays positive and respectful by moderating interactions." },
  { id: 6, name: "Bird", description: "Bird can view and analyze data. With a bird's-eye view, Bird provides insightful analysis and helps make data-driven decisions to guide the team." },
  { id: 7, name: "Porcupine", description: "Porcupine has limited access to view content. Though limited in scope, Porcupine's perspective is valuable, offering unique insights from a different angle." }
];

const OpCode = {
  JOIN_GAME: 1,
  READY_GAME: 2,
  START_GAME: 3,
  END_GAME: 4,
  PLAYER_MOVE: 5,
  PLAYER_ATTACK: 6,
  PLAYER_DEFEND: 7,
  PLAYER_CHAT: 8,
  GAME_STATE_UPDATE: 9,
  PING: 10,
  LEAVE_GAME: 11,
};

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
      dispatcher.broadcastMessage(OpCode.JOIN_GAME, JSON.stringify({ gameState:  state.gameState , readyCount: 0 ,  description : "GameState WaitingForPlayersReady"}) )
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
    // check all player ready 
    if (state.gameState == GameState.WaitingForPlayersReady) {
      var isAllReady = true;
      for (const userId in state.players) {
        if (state.players.hasOwnProperty(userId)) {
          const player = state.players[userId];
            if(player.isReady == false){
              isAllReady = false;
            }
            logger.info(`User ${userId} is ${player.isReady ? 'ready' : 'not ready'}.`)
        }
      }
      // if allReady == true it's mean every one confirm ready 
      if(isAllReady){
        state.gameState = GameState.InitialGame;
        // send update to all player update
        dispatcher.broadcastMessage(OpCode.JOIN_GAME, JSON.stringify( { gameState:  state.gameState , description : "GameState InialtGame"}) )
      }
    }

    if (state.gameState == GameState.InitialGame){
      var roleUsedNumbers : number[] = []; 
      var positionUsed : number[] = [];
      var charactorUsed : number[] = [];
      // random Role position and charactor
      for (const userId in state.players) {
        if (state.players.hasOwnProperty(userId)) {
          // Generate a random number between 0 and 6
           var roleRandomNumber = getRandomNumber(0, 6, roleUsedNumbers);
           roleUsedNumbers.push(roleRandomNumber);
           var role  = roles[roleRandomNumber]
           //check role if it's sherrif start position 0
           var postion = 0;
           if(role.id != 1){
             postion = getRandomNumber(1, 6, positionUsed);
             positionUsed.push(postion)
           }

           var charactorNumber = getRandomNumber(0, 6, charactorUsed);
           var charactor = charactors[charactorNumber];
           charactorUsed.push(charactorNumber)
           state.players[userId] = {...state.players[userId], role : role, position : postion, charactor : charactor }
        }
      }
      state.gameState = GameState.InProgress;
      dispatcher.broadcastMessage(OpCode.START_GAME , JSON.stringify(state))
    }
 

    // handle receive messages from clients 
    // TODO: after that create seperate handle receive messages from clients 
    for (const message of messages) {
      switch (message.opCode) {
        case OpCode.READY_GAME:
          let senderId = message.sender.userId;
          logger.info(`message of User ${senderId} is ${message.data}.`)
          // TODO: check data or create interface model to receive data 
          try {   
            let data = JSON.parse(`${message.data}`);
            state.players[senderId] = {...state.players[senderId] , isReady: true }
            logger.info(`message of User ${senderId} is ${data}.`)
          } catch (error) {
            logger.info(`message of User ${senderId} is ${error}.`)
          }
          
      }
    }
    
  
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

  function getRandomNumber(min: number, max: number, usedNumbers: number[]): number {
    var randomNumber: number;
    // Generate a new random number until we find one that has not been used
    do {
      randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (usedNumbers.indexOf(randomNumber) !== -1);
  
    return randomNumber;
  }
  