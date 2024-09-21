// mocking card data 
const mockCards: Card[] = [
  { id: 1, name: "Quick Slash", type: CardTypes.Attack, damage: 1 },
  { id: 2, name: "Heavy Blow", type: CardTypes.Attack, damage: 2 },
  { id: 3, name: "Light Shield", type: CardTypes.Defense, defense: 1 },
  { id: 4, name: "Iron Wall", type: CardTypes.Defense, defense: 2 },
  { id: 5, name: "Minor Heal", type: CardTypes.Heal, heal: 1 },
  { id: 6, name: "Major Heal", type: CardTypes.Heal, heal: 2 },
  { id: 7, name: "Meteor Strike", type: CardTypes.GlobalAttack, damage: 1 },
  { id: 8, name: "Earth Shatter", type: CardTypes.GlobalAttack, damage: 2 },
  { id: 9, name: "Group Recovery", type: CardTypes.GlobalHeal, heal: 1 },
  { id: 10, name: "Mass Restoration", type: CardTypes.GlobalHeal, heal: 2 },
  { id: 11, name: "Swift Jab", type: CardTypes.Attack, damage: 1 },
  { id: 12, name: "Power Punch", type: CardTypes.Attack, damage: 2 },
  { id: 13, name: "Guard Up", type: CardTypes.Defense, defense: 1 },
  { id: 14, name: "Fortify", type: CardTypes.Defense, defense: 2 },
  { id: 15, name: "First Aid", type: CardTypes.Heal, heal: 1 },
  { id: 16, name: "Rejuvenate", type: CardTypes.Heal, heal: 2 },
  { id: 17, name: "Flame Burst", type: CardTypes.GlobalAttack, damage: 1 },
  { id: 18, name: "Thunderstorm", type: CardTypes.GlobalAttack, damage: 2 },
  { id: 19, name: "Healing Wave", type: CardTypes.GlobalHeal, heal: 1 },
  { id: 20, name: "Life Circle", type: CardTypes.GlobalHeal, heal: 2 }
];

const mockCardsAttackAndDefence: Card[] = [
  { id: 21, name: "Quick Slash", type: CardTypes.Attack, damage: 1 },
  { id: 22, name: "Heavy Blow", type: CardTypes.Attack, damage: 2 },
  { id: 23, name: "Light Shield", type: CardTypes.Defense, defense: 1 },
  { id: 24, name: "Iron Wall", type: CardTypes.Defense, defense: 2 }
];