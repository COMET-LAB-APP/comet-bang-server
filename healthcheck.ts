function rpcHealthCheck(ctx: nkruntime.Context, logger : nkruntime.Logger, nk: nkruntime.Nakama, payload: string ) {
    logger.info("Health Start ")
    return JSON.stringify({success: true,user : "santa"});
}