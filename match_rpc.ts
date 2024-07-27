
function findOrCreateMatch(context: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama): string {
    const limit = 10
    const isAuthoritative = true;
    const minSize = 0;
    const maxSize = 4;
    const label = "LobbyMatch"
    var matches = nk.matchList(limit, isAuthoritative, label, minSize, maxSize, "");
  
    // If matches exist, sort by match size and return the largest.
    if (matches.length > 0) {
      matches.sort(function (a, b) {
        return a.size >= b.size ? 1 : -1;
      });
      return JSON.stringify({ matchId : matches[0].matchId });
    }
  
    // If no matches exist, create a new one using the "lobby" module and return it's ID.
    var matchId = nk.matchCreate(label, {isPrivate: false });
    return JSON.stringify({ matchId });
  }