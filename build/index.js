"use strict";
var rpcHealthCheckId = 'healthcheck';
var getUserId = "getUserNew";
var createCardTypeId = "createCardType";
var joinStreamId = "join";
var leaveStreamId = "leaveStream";
var listenStreamId = "listenStream";
var sendStreamId = "sendStream";
var rpcIdFindMatch = "findMatchNew";
function InitModule(ctx, logger, nk, initialize) {
    initialize.registerBeforeAuthenticateEmail(registerBeforeAuthenticateEmail);
    initialize.registerMatchmakerMatched(OnRegisterMatchmakerMatched);
    initialize.registerRpc(rpcIdFindMatch, findOrCreateMatch);
    // initialize.registerRtBefore;
    // initialize.registerRtAfter;
    initialize.registerRpc(rpcHealthCheckId, rpcHealthCheck);
    initialize.registerRpc(getUserId, getUserById);
    initialize.registerRpc(createCardTypeId, createCardType);
    // socket init
    initialize.registerRpc(joinStreamId, joinFunction);
    initialize.registerRpc(leaveStreamId, leaveFunction);
    initialize.registerRpc(listenStreamId, listenStream);
    initialize.registerRpc(sendStreamId, sendStream);
    initialize.registerRtBefore("ChannelJoin", beforeChannelJoin);
    initialize.registerRpc("createMatchNew", CreateMatchRpc);
    initialize.registerMatch('LobbyMatch', {
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
    // var presence = nk.streamUserList({ mode: 1, subject: ctx.userId });
    // // Just reassigning the context here, as it's used in the streamUserUpdate method
    // var sessionId;
    //  presence.forEach((d) => logger.debug(d.sessionId));
    logger.debug("joinFunction  " + ctx.userId + "| Seession " + ctx.sessionId + "| streamId " + streamId);
    nk.streamUserJoin(ctx.userId, ctx.sessionId, streamId, hidden, persistence);
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
        logger.info('Found user: %s\n', p);
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
        state.players[presence.userId] = { presence: presence };
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
    return {
        state: state
    };
};
var OnRegisterMatchmakerMatched = function (ctx, logger, nk, matches) {
    // Create a public match and return it's match ID
    var matchId = nk.matchCreate("LobbyMatch", { "invited": matches, isPrivate: false });
    logger.debug("Created LobbyMatch with ID: ".concat(matchId));
    return matchId;
};
// function rpcCreateMatch(context: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: string): string {
//     var matchId = nk.matchCreate('pingpong', [payload]);
//     return JSON.stringify({ matchId });
//   }
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
var matchTerminate = function (ctx, logger, nk, dispatcher, tick, state, graceSeconds) {
    return { state: state };
};
var matchSignal = function (ctx, logger, nk, dispatcher, tick, state) {
    return { state: state };
};
var GameState;
(function (GameState) {
    GameState[GameState["WaitingForPlayers"] = 0] = "WaitingForPlayers";
    GameState[GameState["WaitingForPlayersReady"] = 1] = "WaitingForPlayersReady";
    GameState[GameState["InProgress"] = 2] = "InProgress";
})(GameState || (GameState = {}));
var registerBeforeAuthenticateEmail = function (ctx, logger, nk, req) {
    logger.info("login received ".concat(req.username, " ").concat(req.account.email, " ").concat(req.account.password));
    return req;
};
// let rpcFindMatch: nkruntime.RpcFunction = function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: string): string {
//     if (!ctx.userId) {
//         throw Error('No user ID in context');
//     }
//     if (!payload) {
//         throw Error('Expects payload.');
//     }
//     let request;
//     try {
//         request = JSON.parse(payload);
//     } catch (error) {
//         logger.error('Error parsing json message: %q', error);
//         throw error;
//     }
//     if(request.ai) {
//         let matchId = nk.matchCreate(
//             "LobbyMatch", {fast: request.fast, ai: true});
//         let res = { matchIds: [matchId] };
//         return JSON.stringify(res);
//     }
//     let matches: nkruntime.Match[];
//     try {
//         const query = `+label.open:1 +label.fast:${request.fast ? 1 : 0}`;
//         matches = nk.matchList(10, true, null, null, 1, query);
//     } catch (error) {
//         logger.error('Error listing matches: %v', error);
//         throw error;
//     }
//     logger.info("matches length " , matches.length )
//     let matchIds: string[] = [];
//     if (matches.length > 0) {
//         // There are one or more ongoing matches the user could join.
//         matchIds = matches.map(m => m.matchId);
//     } else {
//         // No available matches found, create a new one.
//         try {
//             matchIds.push(nk.matchCreate("LobbyMatch", {fast: request.fast}));
//         } catch (error) {
//             logger.error('Error creating match: %v', error);
//             throw error;
//         }
//     }
//     return JSON.stringify({ matchIds });
// }
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
