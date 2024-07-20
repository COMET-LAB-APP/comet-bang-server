interface PlayerState {
    presence: nkruntime.Presence,
    isReady: boolean,
    position ?: number,
    character ?: Character,
    role ?: Role,
    blood ?: number,
    cards : Card[]
  }