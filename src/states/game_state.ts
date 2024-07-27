interface GameState extends nkruntime.MatchState{
  players: { [userId: string]: PlayerState },
  playerCount: number,
  requiredPlayerCount: number,
  isPrivate: boolean,
  gameState: GameStateEnum,
  emptyTicks: number,
  joinsInProgress: number
}