 function getUserById(ctx: nkruntime.Context, logger : nkruntime.Logger, nk: nkruntime.Nakama, payload: any )  {

    // "payload" is bytes sent by the client we'll JSON decode it.
    let json = JSON.parse(payload);
    var userId = json.userId;
    logger.info("payload ", userId)
    let users: nkruntime.User[];
    try {
       users = nk.usersGetId([ userId ]);
    } catch (error) {
        logger.error('Failed to get user: %s', error );
        return;
    }
    // Fetch user from Nakama storage or database
    return JSON.stringify(users);
}
