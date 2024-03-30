function listenStream (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: string) {
    let streamId: nkruntime.Stream = {
		mode: 2,
		label: 'Global Chat Room',
};
let presences = nk.streamUserList(streamId);
presences?.forEach(function (p) {
		logger.info('Found user: %s\n', streamId);
});
}