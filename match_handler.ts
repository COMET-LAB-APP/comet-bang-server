const OpCode = {
  JOIN_GAME: 1,
  READY_GAME: 2,
  START_GAME: 3,
  PLAYER_DRAW: 4,
  PLAYER_TARGET: 5,
  PLAYER_ACTION: 6,
  END_GAME: 7,
  GAME_STATE_UPDATE: 8,
  PING: 9,
  LEAVE_GAME: 10,
};

const MAX_PLAYERS = 7; 
const MIN_PLAYERS = 2;
const BLOOD_AMOUNT = 5;

// set timer constant  
const tickRate = 1;
const maxEmptySec = 30;
const delaybetweenGamesSec = 5;
const turnTimeFastSec = 20;
const turnTimeNormalSec = 30;

const matchInit = function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, params: {[key: string]: string}): {state: nkruntime.MatchState, tickRate: number, label: string} {
  // Determine if the match should be private based on the passed in params
  const isPrivate = params.isPrivate === "true";  

  // Define the match state
  const state: GameState = {
    players: {},
    isPrivate,
    playerCount: 0,
    requiredPlayerCount: MAX_PLAYERS,
    gameState: GameStateEnum.WaitingForPlayers,
    emptyTicks: 0,
    joinsInProgress : 0,
    deadlineRemainingTicks : 0,
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
      state.players[presence.userId] = {presence, isReady : false, isBot: false};
      state.playerCount++;
    };
    
    if (state.playerCount === MIN_PLAYERS){
      // TODO : Add more logic for using add Bots
      addBotsIfNeeded(state,logger);
    }
    
    // If the match is full then update the state
    if (state.playerCount === state.requiredPlayerCount) {
      logger.info(`is Ready call Herre : ${state}`)
      state.gameState = GameStateEnum.WaitingForPlayersReady;
      dispatcher.broadcastMessage(OpCode.READY_GAME, JSON.stringify({ gameState:  state.gameState , readyCount: 0 ,  description : "GameState WaitingForPlayersReady"}) )
    }
  
    // Update the match label
    const label = JSON.stringify({ isPrivate: state.isPrivate.toString(), playerCount: state.playerCount, requiredPlayerCount: state.requiredPlayerCount });
    dispatcher.matchLabelUpdate(label);
  
    return {
        state
    };
  }

  
  const matchLeave = function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: nkruntime.MatchState, presences: nkruntime.Presence[]) : { state: nkruntime.MatchState } | null {
    const isOnlyBot = true;
    presences.forEach(function (presence) {
      logger.info(`matchLeave : ${presence}`)
      // delete(state.players[presence.userId]); // should make this userId offline
      state.playerCount--;
      state.player[presence.userId] = null;
    });
   
    if(haveOnlyBotLeft(state,logger)){
      logger.info("destroy Match ");
      return null;
    }
  
    return {
      state
    };
  }
  
  const matchLoop = function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: nkruntime.MatchState, messages: nkruntime.MatchMessage[]) : { state: nkruntime.MatchState} | null {
    // If the match is empty, increment the empty ticks
    try {
      
    // logger.info("start match loop " + state.emptyTicks + "player count " + state.playerCount)
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
    if (state.gameState == GameStateEnum.WaitingForPlayersReady) {
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
        state.gameState = GameStateEnum.InitialGame;
        // send update to all player update
        dispatcher.broadcastMessage(OpCode.JOIN_GAME, JSON.stringify( { gameState:  state.gameState , description : "GameState InialtGame"}) )
      }
    }
   
    // Game start initial here
    if (state.gameState == GameStateEnum.InitialGame){
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
           var position = 0;
           if(role.id != 1){
             position = getRandomNumber(1, 6, positionUsed);
             positionUsed.push(position)
           }

           var characterNumber = getRandomNumber(0, 6, characterUsed);
           var character = characters[characterNumber];
           characterUsed.push(characterNumber)
           
           // intial cards 
           var cards = generateCards(5,mockCards);
           state.players[userId] = {...state.players[userId], role : role, position : position, character : character,blood: BLOOD_AMOUNT, cards : cards} 
        }
        logger.info(`statePlayer: userId ${userId} ${state.players[userId]}`)
      }
      state.gameState = GameStateEnum.InProgress;
      dispatcher.broadcastMessage(OpCode.START_GAME , JSON.stringify(state))
    }

    // this is starting game 
    if (state.gameState == GameStateEnum.InProgress) {
      // check timer turn count down 
      if (state.deadlineRemainingTicks <= 0) {

        // check next turn
        switch (state.currentActionState) {
          case ActionState.EffectPhase: 
            toDrawPhase(state,dispatcher);
            break;
          case ActionState.DrawPhase: 
            // TO main phase 
            break;
          case ActionState.MainPhase: 
            toEndPhase(state,dispatcher,logger);
            break;
          case ActionState.AttackPhase: 
             break;
          case ActionState.SecondPhase: 
            break;
          case ActionState.EndPhase:
            if(playeShouldDiscardCards(state)){
              // Random discard card 
              const player = state.players[state.currentTurnPlayerId];
              const cardsLeft = removeRandomCards<Card>(player.cards, player.blood - player.cards.length);
              state.players[state.currentTurnPlayerId].cards = cardsLeft;
              // send update current cards 
              state.currentActionState = ActionState.EndTurn;
              const msg : ActionBase = {
                currentPosition: state.currentPosition,
                currentTurnPlayerId: state.currentTurnPlayerId,
                turnTime: Math.floor(state.deadlineRemainingTicks / tickRate),
                currentActionState: state.currentActionState,
                metaData: {
                  playerId: state.currentTurnPlayerId,
                  cards: state.players[state.currentTurnPlayerId].cards
                } 
              }
              dispatcher.broadcastMessage(OpCode.PLAYER_DRAW, JSON.stringify(msg)) ;
            }
            // TODO: delay 

            // TODO: Next Turn 
            nextTurn(state,logger,dispatcher);
            break;
          default:
            // default it does mean currentActionState isnot set init Action State
            nextTurn(state,logger,dispatcher);
            break;
        }
       
      } else {
        // count down timer turn
        state.deadlineRemainingTicks--;
        logger.info(`##T message deadlineRemainingTicks : ${state.deadlineRemainingTicks}  `)
      }
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
        case OpCode.PLAYER_ACTION: 
          // check card it there are target
          //TODO: make sure can be PlayerActionCard

          const playerAction = JSON.parse(`${message.data}`);
          logger.info(`##T PLAYER_ACTION ${playerAction.actionState} ${playerAction.discardCardIds} is ${message.data}.`);
          if (playerAction.cardId != null) {
            if(playerAction.targetId != null){
              // find card with CardId
              const result = getCardById(playerAction.cardId);
              if(result){
                // check card types 
                // global attack move to next player around (clockwise)
                let body = {
                  cards: result[0].damage,
                  targetId : playerAction.targetId,
                  CardTypes : result[0].type,
                }
                dispatcher.broadcastMessage(OpCode.PLAYER_TARGET, JSON.stringify(body))   
              }
            }
            // else if player actions using card without target it does mean not cardType Attack 

          } else if (playerAction.actionState == ActionState.EndPhase ) {

            // player send cardIds for discard
            const player = state.players[state.currentTurnPlayerId];
            let allCards = player.cards as [Card]
            const cardsLeft = allCards.filter((card) => playerAction.discardCardIds.indexOf(card.id) === -1)
            state.players[state.currentTurnPlayerId].cards = cardsLeft;
            logger.info(`##T PLAYER_ACTION discard and cards left ${cardsLeft.length} ${cardsLeft}.`);

            state.currentActionState = ActionState.EndTurn;
            const msg : ActionBase = {
              currentPosition: state.currentPosition,
              currentTurnPlayerId: state.currentTurnPlayerId,
              turnTime: Math.floor(state.deadlineRemainingTicks / tickRate),
              currentActionState: state.currentActionState,
              metaData: {
                playerId: state.currentTurnPlayerId,
                cards: state.players[state.currentTurnPlayerId].cards
              } 
            }
            dispatcher.broadcastMessage(OpCode.PLAYER_DRAW, JSON.stringify(msg));

            // TODO: should delay before Next Turn 
            nextTurn(state,logger,dispatcher)
            
          } else {
            // skip phase
            // emit player draw to next player 
            // skip mainphase or not 
               // server check how many card left > bloodsCount
              if(playeShouldDiscardCards(state)){
                // emit tell player to discard card 
                state.currentActionState = ActionState.EndPhase;
                state.deadlineRemainingTicks = calculateDeadlineTicks(TimerTypeEnum.normal);
 
                let msg : ActionBase = {
                  currentPosition: state.currentPosition,
                  currentTurnPlayerId: state.currentTurnPlayerId,
                  turnTime: Math.floor(state.deadlineRemainingTicks / tickRate),
                  currentActionState: state.currentActionState,
                }

                dispatcher.broadcastMessage(OpCode.PLAYER_DRAW, JSON.stringify(msg))
              }else {
                //next turn
                nextTurn(state,logger,dispatcher);
              }
          }
          break
        
      }
    }
    
  
    }catch(e){
       logger.error(`match loop crash: ${e}`)
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
  
  // calulate turn timer
  function calculateDeadlineTicks(timerType: TimerTypeEnum): number {
    if (timerType === TimerTypeEnum.fast) {
        return turnTimeFastSec * tickRate;
    } else {
        return turnTimeNormalSec * tickRate;
    }
  }

  // convert time milliseconds to seconds
  function msecToSec(n: number): number {
    return Math.floor(n / 1000);
  }

  //TODO: algorithm 
  function isGameEnded() : Boolean {
    // check logic game end
    return false;
  }

  //get Presence by playerId for send Broadcast message 
  function getPrencesByPlayerIds(state: nkruntime.MatchState, playerIds: string[]): nkruntime.Presence[] {
    var presences = [];
    for (const userId in state.players) {
      //check the player includes
      if (state.players.hasOwnProperty(userId) && playerIds.indexOf(userId) !== -1) {
        presences.push(state.players[userId].presence);
      }
    }
    return presences;
  }
  // 
  function isBot(state: nkruntime.MatchState, playerId: string): boolean{
    return state.players[playerId].isBot ?? false
  }

  function playeShouldDiscardCards(state: nkruntime.MatchState): boolean{
    let player = state.players[state.currentTurnPlayerId];
    return player.blood < player.cards.length;
  }

  function nextTurn(state: nkruntime.MatchState,logger: nkruntime.Logger,dispatcher: nkruntime.MatchDispatcher) {
    
    var currentTurnPlayerId = null;
    var currentPosition = null;        
    // inital start first turn
    if (state.currentTurnPlayerId === null) {
      // finding player first position with index 0
      for (const userId in state.players) {
        if (state.players.hasOwnProperty(userId) && state.players[userId].position == 0) {
          currentTurnPlayerId = userId;
          currentPosition = state.players[userId].position;
          logger.info(`##T inital first turn ${userId}`)
        }
      }
    } else {
      // move turn to next player 
      // check position with move around 
      // TODO: should check currentPosition still alive or not
      if(state.currentPosition < (state.requiredPlayerCount - 1) ){
        currentPosition = state.currentPosition + 1;
      } else {
        currentPosition = 0;
      }

      for (const userId in state.players) {
        if (state.players.hasOwnProperty(userId) && state.players[userId].position == currentPosition) {
          // assign currentTurnPlayerId  
          currentTurnPlayerId = userId;
          currentPosition = state.players[userId].position;
        }
      }
    }

    if (currentPosition != null && currentTurnPlayerId != null) {
      state.currentPosition = currentPosition;
      state.currentTurnPlayerId = currentTurnPlayerId;
    }
  
    state.deadlineRemainingTicks = calculateDeadlineTicks(TimerTypeEnum.normal);
    state.currentActionState = ActionState.EffectPhase
    // object json message
    let msg : ActionBase = {
      currentPosition: state.currentPosition,
      currentTurnPlayerId: state.currentTurnPlayerId,
      turnTime:  Math.floor(state.deadlineRemainingTicks / tickRate),
      currentActionState: state.currentActionState,
    }
    logger.info(`##T message current player turn :  ${JSON.stringify(msg)}}`)

    dispatcher.broadcastMessage(OpCode.PLAYER_DRAW, JSON.stringify(msg))
    
    // set time out toDrawPhase
    state.deadlineRemainingTicks = 1;
  }


  function toDrawPhase(state: nkruntime.MatchState, dispatcher: nkruntime.MatchDispatcher) {
    let ishasEffect = false;
    // check effect for tell current what to do
    if (ishasEffect) { 
      // check timeout then random action next phase
      // action in when dinamite , snake ,.. 
    } else {
      // start draw card drawer + ability
      state.currentActionState = ActionState.DrawPhase 
      var cards = generateCards(2, mockCardsAttackAndDefence);

      state.deadlineRemainingTicks = calculateDeadlineTicks(TimerTypeEnum.normal);
      
      let msg : ActionBase = {
        currentPosition: state.currentPosition,
        currentTurnPlayerId: state.currentTurnPlayerId,
        turnTime: Math.floor(state.deadlineRemainingTicks / tickRate),
        currentActionState: state.currentActionState,
        metaData: {
          cards: cards
        } 
      }
      // filter player to specify send data 
      // TODO: handle bot first
      
      if(!isBot(state,state.currentTurnPlayerId)){
        let presences = getPrencesByPlayerIds(state,[state.currentTurnPlayerId]);
        dispatcher.broadcastMessage(OpCode.PLAYER_DRAW, JSON.stringify(msg),presences) // self
      }
      
      
      // add delay and send action to every one 
      // const delayInMilliseconds = 500;
      // setTimeout(() => {
        state.currentActionState = ActionState.MainPhase 
        dispatcher.broadcastMessage(OpCode.PLAYER_DRAW, JSON.stringify({currentActionState: state.currentActionState}))
      // },delayInMilliseconds)
    }
  }
  
  function toEndPhase(state: nkruntime.MatchState, dispatcher: nkruntime.MatchDispatcher,logger: nkruntime.Logger ) {
    state.deadlineRemainingTicks = calculateDeadlineTicks(TimerTypeEnum.normal);
    state.currentActionState = ActionState.EndPhase
    // object json message
    let msg : ActionBase = {
      currentPosition: state.currentPosition,
      currentTurnPlayerId: state.currentTurnPlayerId,
      turnTime: Math.floor(state.deadlineRemainingTicks / tickRate),
      currentActionState : state.currentActionState
    }
    logger.info(`##T toEndPhase :  ${JSON.stringify(msg)}}`)

    dispatcher.broadcastMessage(OpCode.PLAYER_DRAW, JSON.stringify(msg))
  }

  function removeRandomCards<T>(array: T[], count: number): T[] {
    if (count >= array.length) {
      // If the count is greater than or equal to the array length, return an empty array.
      return [];
    }
  
    // Shuffle the array using Fisher-Yates algorithm.
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  
    // Remove the first 'count' items from the shuffled array.
    return array.slice(count);
  }
  
  function getCardById(id: number): Card[] {
    const filteredCards: Card[] = [
      ...mockCards.filter(card => card.id === id),
      ...mockCardsAttackAndDefence.filter(card => card.id === id)
    ];
    return filteredCards;
  }


function haveOnlyBotLeft(state: nkruntime.MatchState,logger: nkruntime.Logger,  ) : boolean  {
  for (const userId in state.players) {
    //check the player includes
    logger.info("user leave check bot ",state.players[userId].isBot);
    if (state.players.hasOwnProperty(userId) && !state.players[userId].isBot) {
  
      return false;
    } 
  }
  return true;
}
/* 
  TimeOut 
  * Effect phase timeout
    - random action before next phase 
  * Draw phase timeout
    - random action before next phase 
  * Main phase 
    - if skip Main phase with timeout
    - then set state Endphase 

  * Attack phase 
    - random action before next phase 
    - know target player A and player B , got hit and next phase to player A 

  * Second phase 
    - cannot use acttack 
    - if timeout send setState endphase to server 
  * Endphase 
    - if player should discard equal true
    - then random discard 
    - next turn
*/