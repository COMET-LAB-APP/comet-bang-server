interface State extends nkruntime.MatchState{
  players: { [userId: string]: PlayerState },
  playerCount: number,
  requiredPlayerCount: number,
  isPrivate: boolean,
  gameState: GameState,
  emptyTicks: number,
  joinsInProgress: number
}

interface PlayerState {
  presence: nkruntime.Presence,
  isReady: boolean,
  position ?: number,
  character ?: Character,
  role ?: Role,
  blood ?: number,
  cards : Card[]
}


enum GameState { WaitingForPlayers, WaitingForPlayersReady, InitialGame , InProgress , EndGame, }


enum ActionState { EffectPhase, DrawPhase, MainPhase, AttackPhase , SecondPhase, EndPhase}

enum RoleType { 
  Leader, 
  Good, 
  Bad, 
  Killer 
}

enum CardTypes {
   Attack, Defense, Heal , GlobalAttack , GlobalHeal
}

// retrive data from databse 
interface Role {
  id: number,
  name: string,
  description ?: string,
  type: RoleType
}

interface Character {
  id: number,
  name: string,
  description ?: string,
}

interface Card {
  name : string,
  type : CardTypes,
  damage ?: number,
  heal ?: number,
  defense ?: number,
}

const roles: Role[] = [
  { id: 1, name: "Admin", description: "Responsible for managing the system.", type: RoleType.Leader },
  { id: 2, name: "Editor", description: "Can edit and publish content.", type: RoleType.Good },
  { id: 3, name: "Viewer", description: "Can view content but cannot make changes.", type: RoleType.Good },
  { id: 4, name: "Contributor", description: "Can contribute new content.", type: RoleType.Bad },
  { id: 5, name: "Moderator", description: "Can moderate user comments and content.", type: RoleType.Bad },
  { id: 6, name: "Analyst", description: "Can view and analyze data.", type: RoleType.Good },
  { id: 7, name: "Guest", description: "Limited access to view content.", type: RoleType.Killer }
];

const characters: Character[] = [
  { id: 1, name: "Bear", description: "Bear is responsible for managing the system. As the backbone of the team, Bear ensures that everything runs smoothly and efficiently." },
  { id: 2, name: "Monkey", description: "Monkey can edit and publish content. Agile and creative, Monkey brings fresh ideas and keeps the content engaging and up-to-date." },
  { id: 3, name: "Fox", description: "Fox can view content but cannot make changes. With a keen eye for detail, Fox ensures that all content meets the highest standards of quality." },
  { id: 4, name: "Cat", description: "Cat can contribute new content. Curious and innovative, Cat adds new and exciting content to keep the audience engaged and informed." },
  { id: 5, name: "Cheetar", description: "Cheetar can moderate user comments and content. Fast and vigilant, Cheetar ensures that the community stays positive and respectful by moderating interactions." },
  { id: 6, name: "Bird", description: "Bird can view and analyze data. With a bird's-eye view, Bird provides insightful analysis and helps make data-driven decisions to guide the team." },
  { id: 7, name: "Porcupine", description: "Porcupine has limited access to view content. Though limited in scope, Porcupine's perspective is valuable, offering unique insights from a different angle." }
];

// mocking card data 
const mockCards: Card[] = [
  {
    name: "Quick Slash",
    type: CardTypes.Attack,
    damage: 1
  },
  {
    name: "Heavy Blow",
    type: CardTypes.Attack,
    damage: 2
  },
  {
    name: "Light Shield",
    type: CardTypes.Defense,
    defense: 1
  },
  {
    name: "Iron Wall",
    type: CardTypes.Defense,
    defense: 2
  },
  {
    name: "Minor Heal",
    type: CardTypes.Heal,
    heal: 1
  },
  {
    name: "Major Heal",
    type: CardTypes.Heal,
    heal: 2
  },
  {
    name: "Meteor Strike",
    type: CardTypes.GlobalAttack,
    damage: 1
  },
  {
    name: "Earth Shatter",
    type: CardTypes.GlobalAttack,
    damage: 2
  },
  {
    name: "Group Recovery",
    type: CardTypes.GlobalHeal,
    heal: 1
  },
  {
    name: "Mass Restoration",
    type: CardTypes.GlobalHeal,
    heal: 2
  },
  {
    name: "Swift Jab",
    type: CardTypes.Attack,
    damage: 1
  },
  {
    name: "Power Punch",
    type: CardTypes.Attack,
    damage: 2
  },
  {
    name: "Guard Up",
    type: CardTypes.Defense,
    defense: 1
  },
  {
    name: "Fortify",
    type: CardTypes.Defense,
    defense: 2
  },
  {
    name: "First Aid",
    type: CardTypes.Heal,
    heal: 1
  },
  {
    name: "Rejuvenate",
    type: CardTypes.Heal,
    heal: 2
  },
  {
    name: "Flame Burst",
    type: CardTypes.GlobalAttack,
    damage: 1
  },
  {
    name: "Thunderstorm",
    type: CardTypes.GlobalAttack,
    damage: 2
  },
  {
    name: "Healing Wave",
    type: CardTypes.GlobalHeal,
    heal: 1
  },
  {
    name: "Life Circle",
    type: CardTypes.GlobalHeal,
    heal: 2
  }
];