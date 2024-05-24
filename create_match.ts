
const CreateMatchRpc: nkruntime.RpcFunction = function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: string) {
  // Assume the match will be public by default
  let isPrivate = false;

  // Get the isPrivate value from the payload if it exists
  if (payload) {
    const data = JSON.parse(payload);
    if (data.isPrivate) {
      isPrivate = data.isPrivate;
    }
  }
  
  // Create the match and return the match ID to the player
  const matchId = nk.matchCreate("LobbyMatch", { isPrivate });
  return JSON.stringify({ matchId });
};

