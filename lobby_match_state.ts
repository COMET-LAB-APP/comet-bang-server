interface State extends nkruntime.MatchState{
  players: { [userId: string]: PlayerState },
  playerCount: number,
  requiredPlayerCount: number,
  isPrivate: boolean,
  gameState: GameState,
  emptyTicks: number,
  joinsInProgress: number
}

interface PlayerState {
  presence: nkruntime.Presence,
  isReady: boolean,
  position ?: number,
  charactor ?: Charactor,
  role ?: Role,
}


enum GameState { WaitingForPlayers, WaitingForPlayersReady, InitialGame , InProgress , EndGame, }


enum ActionState { EffectPhase, DrawPhase, MainPhase, AttackPhase , SecondPhase, EndPhase}


// retrive data from databse 
interface Role {
  id: number,
  name: string,
  description ?: string,
}

interface Charactor {
  id: number,
  name: string,
  description ?: string,
}