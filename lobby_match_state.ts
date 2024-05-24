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
  isReady: boolean
}

enum GameState { WaitingForPlayers, WaitingForPlayersReady, InProgress }