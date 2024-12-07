interface PlayerActionCard {
    cardId ?: number;
    targetId ?: number;
    actionState ?: ActionState
    discardCardIds : [number],
    type ?: PlayerActionType
}
  
enum PlayerActionType {
 skip, defence
}