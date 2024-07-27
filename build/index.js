"use strict";
var rpcHealthCheckId = 'healthcheck';
var getUserId = "getUserNew";
var createCardTypeId = "createCardType";
var joinStreamId = "join";
var leaveStreamId = "leaveStream";
var listenStreamId = "listenStream";
var sendStreamId = "sendStream";
var rpcIdFindMatch = "findMatchNew";
var lobbyMatchId = "'LobbyMatch'";
var createMatchNew = "createMatchNew";
var channelJoin = "ChannelJoin";
var sendEmailVerifyId = "sendEmailVerify";
var confirmVerifyEmailId = "confirmVerifyEmail";
var checkVerifyEmailId = "checkVerifyEmail";
function InitModule(ctx, logger, nk, initialize) {
    initialize.registerBeforeAuthenticateEmail(registerBeforeAuthenticateEmail);
    initialize.registerAfterAuthenticateEmail(sendVerificationEmailFn);
    initialize.registerMatchmakerMatched(OnRegisterMatchmakerMatched);
    initialize.registerRpc(rpcIdFindMatch, findOrCreateMatch);
    initialize.registerRpc(sendEmailVerifyId, sendVerifyEmailRpc);
    initialize.registerRpc(confirmVerifyEmailId, confirmVerifyEmailRpc);
    initialize.registerRpc(checkVerifyEmailId, checkEmailVerifyRpc);
    initialize.registerRpc(rpcHealthCheckId, rpcHealthCheck);
    initialize.registerRpc(getUserId, getUserById);
    initialize.registerRpc(createCardTypeId, createCardType);
    // socket init
    initialize.registerRpc(joinStreamId, joinFunction);
    initialize.registerRpc(leaveStreamId, leaveFunction);
    initialize.registerRpc(listenStreamId, listenStream);
    initialize.registerRpc(sendStreamId, sendStream);
    initialize.registerRtBefore(channelJoin, beforeChannelJoin);
    initialize.registerRpc(createMatchNew, CreateMatchRpc);
    initialize.registerMatch(lobbyMatchId, {
        matchInit: matchInit,
        matchJoinAttempt: matchJoinAttempt,
        matchJoin: matchJoin,
        matchLeave: matchLeave,
        matchLoop: matchLoop,
        matchSignal: matchSignal,
        matchTerminate: matchTerminate
    });
}
function rpcHealthCheck(ctx, logger, nk, payload) {
    logger.info("Health Start ");
    return JSON.stringify({ success: true, user: "santa" });
}
function getUserById(ctx, logger, nk, payload) {
    // "payload" is bytes sent by the client we'll JSON decode it.
    var json = JSON.parse(payload);
    var userId = json.userId;
    logger.info("payload ", userId);
    var users;
    try {
        users = nk.usersGetId([userId]);
    }
    catch (error) {
        logger.error('Failed to get user: %s', error);
        return;
    }
    // Fetch user from Nakama storage or database
    return JSON.stringify(users);
}
// import { CardType } from './model/card_type_model';
function createCardType(ctx, logger, nk, payload) {
    logger.info("CreatTyope Start " + payload + " wosdgjnpwer");
    var json = JSON.parse(payload);
    // cannot registerRPC with import interface from external file
    // TODO: find solution create model into nkruntime for registerRPC
    logger.info("CreatTyope  " + payload);
    var cardType = {
        id: "Id12345",
        type: json.type
    };
    return JSON.stringify(cardType);
}
function joinFunction(ctx, logger, nk, payload) {
    var streamId = {
        mode: 2,
        label: 'Global Chat Room',
    };
    var hidden = false;
    var persistence = false;
    logger.info("joinFunction  " + ctx.userId + "| Seession " + ctx.sessionId + "| streamId " + streamId);
    nk.streamUserJoin(ctx.userId, "a00f7822-ea40-4536-87a0-704b3767fab7", streamId, hidden, persistence);
}
function leaveFunction(ctx, logger, nk, payload) {
    var streamId = {
        mode: 2,
        label: 'Global Chat Room',
    };
    nk.streamUserLeave(ctx.userId, ctx.sessionId, streamId);
}
function sendStream(ctx, logger, nk, payload) {
    var streamId = {
        mode: 2,
        label: 'Global Chat Room',
    };
    // const payload = {"some": "data"};
    nk.streamSend(streamId, payload);
}
function listenStream(ctx, logger, nk, payload) {
    var streamId = {
        mode: 2,
        label: 'Global Chat Room',
    };
    var presences = nk.streamUserList(streamId);
    presences === null || presences === void 0 ? void 0 : presences.forEach(function (p) {
        logger.info('Found user: %s\n', streamId);
    });
}
var setSessionVars = function (context, logger, nk, payload) {
    payload.account.vars = {
        key: 'key',
        value: 'value',
    };
    return payload;
};
var beforeChannelJoin = function (ctx, logger, nk, envelope) {
    // If the channel join is a DirectMessage type, check to see if the user is friends with the recipient first
    if (envelope.channelJoin.type == 2 /* nkruntime.ChanType.DirectMessage */) {
    }
    logger.debug("beforeChannelJoin Type : " + envelope.channelJoin.type);
    return envelope;
};
var matchInit = function (ctx, logger, nk, params) {
    // Determine if the match should be private based on the passed in params
    var isPrivate = params.isPrivate === "true";
    // Define the match state
    var state = {
        players: {},
        isPrivate: isPrivate,
        playerCount: 0,
        requiredPlayerCount: 2,
        gameState: GameState.WaitingForPlayers,
        emptyTicks: 0,
        joinsInProgress: 0
    };
    // Update the match label to surface important information for players who are searching for a match
    var label = JSON.stringify({ isPrivate: state.isPrivate.toString(), playerCount: state.playerCount, requiredPlayerCount: state.requiredPlayerCount });
    return {
        state: state,
        tickRate: 1, // 1 tick per second = 1 MatchLoop func invocations per second
        label: label
    };
};
var matchJoinAttempt = function (ctx, logger, nk, dispatcher, tick, state, presence, metadata) {
    // Check if it's a user attempting to rejoin after a disconnect.
    logger.info("state: ".concat(state));
    // New player attempting to connect.
    state.joinsInProgress++;
    return {
        state: state,
        accept: true,
    };
};
var matchJoin = function (ctx, logger, nk, dispatcher, tick, state, presences) {
    for (var _i = 0, presences_1 = presences; _i < presences_1.length; _i++) {
        var presence = presences_1[_i];
        state.players[presence.userId] = { presence: presence, isReady: false };
        state.playerCount++;
    }
    ;
    // If the match is full then update the state
    if (state.playerCount === state.requiredPlayerCount) {
        state.gameState = GameState.WaitingForPlayersReady;
    }
    // Update the match label
    var label = JSON.stringify({ isPrivate: state.isPrivate.toString(), playerCount: state.playerCount, requiredPlayerCount: state.requiredPlayerCount });
    dispatcher.matchLabelUpdate(label);
    return {
        state: state
    };
};
var matchLeave = function (ctx, logger, nk, dispatcher, tick, state, presences) {
    presences.forEach(function (presence) {
        delete (state.players[presence.userId]);
        state.playerCount--;
    });
    return {
        state: state
    };
};
var matchLoop = function (ctx, logger, nk, dispatcher, tick, state, messages) {
    // If the match is empty, increment the empty ticks
    logger.info("start match loop " + state.emptyTicks);
    if (state.playerCount === 0) {
        state.emptyTicks++;
    }
    else {
        state.emptyTicks = 0;
    }
    // If the match has been empty for too long, end it
    if (state.emptyTicks >= 100) {
        return null;
    }
    // TODO: here need to create loop for game play 
    return {
        state: state
    };
};
var matchTerminate = function (ctx, logger, nk, dispatcher, tick, state, graceSeconds) {
    return { state: state };
};
var matchSignal = function (ctx, logger, nk, dispatcher, tick, state) {
    return { state: state };
};
var OnRegisterMatchmakerMatched = function (ctx, logger, nk, matches) {
    // Create a public match and return it's match ID
    var matchId = nk.matchCreate("LobbyMatch", { "invited": matches, isPrivate: false });
    logger.debug("Created LobbyMatch with ID: ".concat(matchId));
    return matchId;
};
var CreateMatchRpc = function (ctx, logger, nk, payload) {
    // Assume the match will be public by default
    var isPrivate = false;
    // Get the isPrivate value from the payload if it exists
    if (payload) {
        var data = JSON.parse(payload);
        if (data.isPrivate) {
            isPrivate = data.isPrivate;
        }
    }
    // Create the match and return the match ID to the player
    var matchId = nk.matchCreate("LobbyMatch", { isPrivate: isPrivate });
    return JSON.stringify({ matchId: matchId });
};
var GameState;
(function (GameState) {
    GameState[GameState["WaitingForPlayers"] = 0] = "WaitingForPlayers";
    GameState[GameState["WaitingForPlayersReady"] = 1] = "WaitingForPlayersReady";
    GameState[GameState["InProgress"] = 2] = "InProgress";
})(GameState || (GameState = {}));
var registerBeforeAuthenticateEmail = function (ctx, logger, nk, req) {
    logger.info("login received ".concat(req.username, " ").concat(req.account.email, " ").concat(req.account.password));
    // TODO: handle something while authenticate via email
    return req;
};
var sendVerificationEmailFn = function (ctx, logger, nk, data, req) {
    var baseUrl = "https://3fee-115-84-115-164.ngrok-free.app";
    var apiUrl = "".concat(baseUrl, "/sendVerifyEmail");
    logger.info("login status ".concat(data.created, " received ").concat(apiUrl, " ").concat(ctx.userId, " ").concat(req.username, " ").concat(req.account.email, " ").concat(req.account.password));
    if (data.created) {
        // If this is true, the account was created for the first time.
        // User Third party service to send verification email here.
        var code = generateVerificationCode(6);
        var payload = JSON.stringify({ email: req.account.email, code: code });
        var response = nk.httpRequest(apiUrl, 'post', { 'content-type': 'application/json' }, payload);
        if (response.code > 299) {
            logger.error("API error: ".concat(response.body));
            return JSON.stringify({ error: response.body });
        }
        var storageObjects = [{
                collection: "email_verify",
                key: "authentication_email",
                value: { email: req.account.email, verify: false, code: code },
                userId: ctx.userId,
            }];
        logger.info("login received ".concat(storageObjects, " ").concat(code, " "));
        nk.storageWrite(storageObjects);
        // const dataReponse = JSON.parse(response.body);
        // logger.info(`sendVerificationEmailFn API response: ${dataReponse}`)
        return JSON.stringify({ status: 401, message: "go to verify email" });
    }
    else {
        var keys = [{
                collection: "email_verify",
                key: "authentication_email",
                userId: ctx.userId // assuming you want to fetch data for the current user
            }];
        logger.info("confirmVerifyEmailRpc UserId ".concat(ctx.userId));
        var objects = nk.storageRead(keys);
        if (objects.length === 0) {
            logger.info("not found");
            return JSON.stringify({ success: false, message: "No data found.", status: 404 });
        }
        logger.info("verify is : ".concat(objects[0].value.verify));
        if (objects[0].value.verify == false) {
            var code = generateVerificationCode(6);
            var storageObjects = [{
                    collection: "email_verify",
                    key: "authentication_email",
                    value: { email: req.account.email, verify: false, code: code },
                    userId: ctx.userId,
                }];
            var payload = JSON.stringify({ email: req.account.email, code: code });
            var response = nk.httpRequest(apiUrl, 'post', { 'content-type': 'application/json' }, payload);
            if (response.code > 299) {
                logger.error("API error: ".concat(response.body));
                return JSON.stringify({ error: response.body });
            }
            logger.info("login received ".concat(storageObjects, " ").concat(code, " "));
            nk.storageWrite(storageObjects);
        }
    }
};
function generateVerificationCode(length) {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var result = '';
    for (var i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
function sendVerifyEmailRpc(context, logger, nk, payload) {
    var baseUrl = "https://3fee-115-84-115-164.ngrok-free.app";
    // const apiUrl = "`https://api.restful-api.dev/objects`"
    var apiUrl = "".concat(baseUrl, "/sendVerifyEmail");
    logger.info("login received ".concat(apiUrl));
    var req = JSON.parse(payload);
    var code = generateVerificationCode(6);
    var newpayload = JSON.stringify({ email: req.email, code: code });
    var response = nk.httpRequest(apiUrl, 'post', { 'content-type': 'application/json' }, newpayload);
    if (response.code > 299) {
        logger.error("API error: ".concat(response.body));
        return JSON.stringify({ error: response.body });
    }
    var dataReponse = JSON.parse(response.body);
    logger.info("data API response: ".concat(dataReponse));
    return JSON.stringify({ message: "send successful" });
}
function confirmVerifyEmailRpc(context, logger, nk, payload) {
    var req = JSON.parse(payload);
    var keys = [{
            collection: "email_verify",
            key: "authentication_email",
            userId: context.userId // assuming you want to fetch data for the current user
        }];
    logger.info("confirmVerifyEmailRpc UserId ".concat(context.userId));
    var objects = nk.storageRead(keys);
    if (objects.length === 0) {
        return JSON.stringify({ success: false, message: "No data found.", status: 404 });
    }
    var storageObjects = objects[0];
    var value = storageObjects.value;
    var verifyCode = value.code;
    if (verifyCode === req.code) {
        storageObjects.value = { email: storageObjects.value.email, verify: true, };
        storageObjects.permissionRead = 1;
        storageObjects.permissionWrite = 1;
        // logger.info(`confirmVerifyEmailRpc data: ${storageObjects}`)
        nk.storageWrite([storageObjects]);
        return JSON.stringify({ success: true, message: "Verify Successful", status: 200 });
    }
    else {
        logger.info("Verify Failed ".concat(req.code));
        return JSON.stringify({ success: false, message: "Verify Failed", status: 400 });
    }
}
function checkEmailVerifyRpc(context, logger, nk, payload) {
    var keys = [{
            collection: "email_verify",
            key: "authentication_email",
            userId: context.userId // assuming you want to fetch data for the current user
        }];
    var objects = nk.storageRead(keys);
    if (objects.length === 0) {
        return JSON.stringify({ isVerify: false, message: "No data found.", status: 404 });
    }
    var storageObjects = objects[0];
    if (storageObjects.value.verify === false) {
        return JSON.stringify({ isVerify: false, message: "need to verify email", status: 400 });
    }
    else {
        return JSON.stringify({ isVerify: true, message: "this accounts already verify", status: 200 });
    }
}
function findOrCreateMatch(context, logger, nk) {
    var limit = 10;
    var isAuthoritative = true;
    var minSize = 0;
    var maxSize = 4;
    var label = "LobbyMatch";
    var matches = nk.matchList(limit, isAuthoritative, label, minSize, maxSize, "");
    // If matches exist, sort by match size and return the largest.
    if (matches.length > 0) {
        matches.sort(function (a, b) {
            return a.size >= b.size ? 1 : -1;
        });
        return matches[0].matchId;
    }
    // If no matches exist, create a new one using the "lobby" module and return it's ID.
    var matchId = nk.matchCreate(label, { isPrivate: false });
    return JSON.stringify({ matchId: matchId });
}
