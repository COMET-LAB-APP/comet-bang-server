function sendStream (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: string) {
    let streamId: nkruntime.Stream = {
        mode: 2,
        label: 'Global Chat Room',
    };
    // const payload = {"some": "data"};
    nk.streamSend(streamId, payload);
}