
let beforeChannelJoin : nkruntime.RtBeforeHookFunction<nkruntime.EnvelopeChannelJoin> = function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, envelope: nkruntime.EnvelopeChannelJoin) : nkruntime.EnvelopeChannelJoin | void {
  // If the channel join is a DirectMessage type, check to see if the user is friends with the recipient first
  if (envelope.channelJoin.type == nkruntime.ChanType.DirectMessage) {
   
  }
  logger.debug("beforeChannelJoin Type : "  + envelope.channelJoin.type );
  return envelope;
};
