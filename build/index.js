"use strict";
var rpcHealthCheckId = 'healthcheck';
var getUserId = "getUserNew";
var createCardTypeId = "createCardType";
var joinStreamId = "join";
var leaveStreamId = "leaveStream";
var listenStreamId = "listenStream";
var sendStreamId = "sendStream";
function InitModule(ctx, logger, nk, initialize) {
    initialize.registerRpc(rpcHealthCheckId, rpcHealthCheck);
    initialize.registerRpc(getUserId, getUserById);
    initialize.registerRpc(createCardTypeId, createCardType);
    // socket init
    initialize.registerRpc(joinStreamId, joinFunction);
    initialize.registerRpc(leaveStreamId, leaveFunction);
    initialize.registerRpc(listenStreamId, listenStream);
    initialize.registerRpc(sendStreamId, sendStream);
    logger.info("JavaScript Module Loaded");
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
