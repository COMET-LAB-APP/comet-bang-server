interface GameState extends nkruntime.MatchState{
  players: { [userId: string]: PlayerState },
  playerCount: number,
  requiredPlayerCount: number,
  isPrivate: boolean,
  gameState: GameStateEnum,
  emptyTicks: number,
  joinsInProgress: number,
  // timer Turn each turn will set this variable
  deadlineRemainingTicks: number,
  // current turn of player id 
  currentTurnPlayerId ?: string,
  // current turn of position 
  currentPosition ?: number,
  //current action state
  currentActionState ?: ActionState,
}