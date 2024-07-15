const OpCode = {
  JOIN_GAME: 1,
  READY_GAME: 2,
  START_GAME: 3,
  END_GAME: 4,
  PLAYER_DRAW: 5,
  PLAYER_ATTACK: 6,
  PLAYER_DEFEND: 7,
  PLAYER_TARGET: 8,
  GAME_STATE_UPDATE: 9,
  PING: 10,
  LEAVE_GAME: 11,
};

const MAX_PLAYERS = 7; 
const MIN_PLAYERS = 2;
const BLOOD_AMOUNT = 5;

const matchInit = function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, params: {[key: string]: string}): {state: nkruntime.MatchState, tickRate: number, label: string} {
  // Determine if the match should be private based on the passed in params
  const isPrivate = params.isPrivate === "true";  

  // Define the match state
  const state: State = {
    players: {},
    isPrivate,
    playerCount: 0,
    requiredPlayerCount: MAX_PLAYERS,
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
    
    if (state.playerCount === MIN_PLAYERS){
      // TODO : Add more logic for using add Bots
      addBotsIfNeeded(state,logger);
    }
    
    // If the match is full then update the state
    if (state.playerCount === state.requiredPlayerCount) {
      logger.info(`is Ready call Herre : ${state}`)
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
    
    logger.info("start match loop " + state.emptyTicks + "player count " + state.playerCount)
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
      var characterUsed : number[] = [];
      // random Role position and character
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

           var characterNumber = getRandomNumber(0, 6, characterUsed);
           var character = characters[characterNumber];
           characterUsed.push(characterNumber)
           
           // intial cards 
           var cards = generateCards(5,mockCards);
           state.players[userId] = {...state.players[userId], role : role, position : postion, character : character,blood: BLOOD_AMOUNT, cards : cards} 
        }
        logger.info(`statePlayer: userId ${userId} ${state.players[userId]}`)
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
        case OpCode.PLAYER_DRAW : 
         //TODO : implement logic player draw
         break
        case OpCode.PLAYER_ATTACK : 
          //TODO : implement logic player attack
         break;
         case OpCode.PLAYER_DEFEND : 
          //TODO : implement logic player defend
         break;
   
      }
    }
    
  
    return {
      state
    };
  } 

  let matchTerminate: nkruntime.MatchTerminateFunction = function(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: nkruntime.MatchState, graceSeconds: number) {
    state.playerCount--;
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
  
  function addBotsIfNeeded(state: nkruntime.MatchState,  logger: nkruntime.Logger,) {
    while (state.playerCount < MAX_PLAYERS) {
      state.playerCount++;
      const botId = `bot_${state.playerCount}`;
      const botPresence = { userId: botId, sessionId: botId, username: botId, node: "" } as nkruntime.Presence;
      state.players[botId] = { presence: botPresence, isReady : true , isBot: true };
      logger.info(`##bot: ${state.players[botId]}`)
    }
  }
  
  // generate card for start game 
  function generateCards(cardCount : number, cardData: Card[]) : Card[]{
    var randomCards : Card[] = [];
    const min = 0;
    const max = cardData.length - 1;
    for (let i = 0; i < cardCount; i++) {
      var randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
      randomCards.push(cardData[randomNumber])
    }
    return randomCards;
  }