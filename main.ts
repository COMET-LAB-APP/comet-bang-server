

const rpcHealthCheckId = 'healthcheck';
const getUserId = "getUserNew";
const createCardTypeId = "createCardType";
const joinStreamId = "join";
const leaveStreamId = "leaveStream";
const listenStreamId = "listenStream";
const sendStreamId = "sendStream";
const rpcIdFindMatch = "findMatchNew";
const lobbyMatchId = "LobbyMatch" 
const createMatchNew = "createMatchNew"
const channelJoin = "ChannelJoin"
const sendEmailVerifyId = "sendEmailVerify"
const confirmVerifyEmailId = "confirmVerifyEmail"
const checkVerifyEmailId = "checkVerifyEmail"

function InitModule(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, initialize : nkruntime.Initializer){
   
    initialize.registerBeforeAuthenticateEmail(registerBeforeAuthenticateEmail)
    initialize.registerAfterAuthenticateEmail(sendVerificationEmailFn)
    initialize.registerMatchmakerMatched(OnRegisterMatchmakerMatched);
    initialize.registerRpc(rpcIdFindMatch, findOrCreateMatch);
    initialize.registerRpc(sendEmailVerifyId,sendVerifyEmailRpc)
    initialize.registerRpc(confirmVerifyEmailId,confirmVerifyEmailRpc)
    initialize.registerRpc(checkVerifyEmailId,checkEmailVerifyRpc)
    
    initialize.registerRpc(rpcHealthCheckId,rpcHealthCheck)
    initialize.registerRpc(getUserId,getUserById)
    initialize.registerRpc(createCardTypeId,createCardType)
    

    // socket init
    initialize.registerRpc(joinStreamId, joinFunction)
    initialize.registerRpc(leaveStreamId, leaveFunction)
    initialize.registerRpc(listenStreamId, listenStream)
    initialize.registerRpc(sendStreamId, sendStream)
    initialize.registerRtBefore(channelJoin, beforeChannelJoin)
    initialize.registerRpc(createMatchNew,CreateMatchRpc)
    initialize.registerMatch(lobbyMatchId, {
        matchInit,
        matchJoinAttempt,
        matchJoin,
        matchLeave,
        matchLoop,
        matchSignal,
        matchTerminate
      });
}