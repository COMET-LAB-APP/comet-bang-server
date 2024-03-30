function leaveFunction(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: string) {
    let streamId: nkruntime.Stream = {
            mode: 2,
            label: 'Global Chat Room',
    };
    nk.streamUserLeave(ctx.userId, ctx.sessionId, streamId);
}