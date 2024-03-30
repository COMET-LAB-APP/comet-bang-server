

const rpcHealthCheckId = 'healthcheck';
const getUserId = "getUserNew";
const createCardTypeId = "createCardType";
const joinStreamId = "join";
const leaveStreamId = "leaveStream";
const listenStreamId = "listenStream";
const sendStreamId = "sendStream";

function InitModule(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, initialize : nkruntime.Initializer){
    initialize.registerRpc(rpcHealthCheckId,rpcHealthCheck)
    initialize.registerRpc(getUserId,getUserById)
    initialize.registerRpc(createCardTypeId,createCardType)
    

    // socket init
    initialize.registerRpc(joinStreamId, joinFunction)
    initialize.registerRpc(leaveStreamId, leaveFunction)
    initialize.registerRpc(listenStreamId, listenStream)
    initialize.registerRpc(sendStreamId, sendStream)

    logger.info("JavaScript Module Loaded")
}