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