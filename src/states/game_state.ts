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
  currentTurnPlayerId ?: string | null,
  // current turn of position 
  currentPosition ?: number | null,
  // current action state
  currentActionState ?: ActionState | null,
  // current target 
  currentActionCard ?: ActionCard | null,
}