
function joinFunction (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: string) {
    let streamId: nkruntime.Stream = {
            mode: 2,
            label: 'Global Chat Room',
    };
    let hidden = false;
    let persistence = false;
    logger.info("joinFunction  " + ctx.userId + "| Seession " + ctx.sessionId + "| streamId " + streamId )
    nk.streamUserJoin(ctx.userId, "a00f7822-ea40-4536-87a0-704b3767fab7", streamId, hidden, persistence);
}