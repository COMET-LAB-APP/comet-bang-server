interface ActionBase {
    currentPosition: number,
    currentTurnPlayerId: string,
    turnTime: number,
    currentActionState: ActionState,
    metaData?: {[key: string]: any};
    
}