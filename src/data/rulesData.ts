import { RuleEntry } from '../types';

export const rulesData: RuleEntry[] = [
  {
    id: 'blinded',
    category: 'Conditions',
    name: 'Blinded',
    description: 'A blinded creature can’t see and automatically fails any ability check that requires sight.',
    details: [
      'Attack rolls against the creature have advantage.',
      'The creature’s attack rolls have disadvantage.'
    ]
  },
  {
    id: 'charmed',
    category: 'Conditions',
    name: 'Charmed',
    description: 'A charmed creature can’t attack the charmer or target the charmer with harmful abilities or magical effects.',
    details: [
      'The charmer has advantage on any ability check to interact socially with the creature.'
    ]
  },
  {
    id: 'exhaustion',
    category: 'Conditions',
    name: 'Exhaustion',
    description: 'Some special abilities and environmental hazards can lead to a special condition called exhaustion.',
    details: [
      'Level 1: Disadvantage on ability checks',
      'Level 2: Speed halved',
      'Level 3: Disadvantage on attack rolls and saving throws',
      'Level 4: Hit point maximum halved',
      'Level 5: Speed reduced to 0',
      'Level 6: Death'
    ]
  },
  {
    id: 'grappled',
    category: 'Conditions',
    name: 'Grappled',
    description: 'A grappled creature’s speed becomes 0, and it can’t benefit from any bonus to its speed.',
    details: [
      'The condition ends if the grappler is incapacitated.',
      'The condition ends if an effect removes the grappled creature from the reach of the grappler.'
    ]
  },
  {
    id: 'incapacitated',
    category: 'Conditions',
    name: 'Incapacitated',
    description: 'An incapacitated creature can’t take actions or reactions.'
  },
  {
    id: 'dash',
    category: 'Combat',
    name: 'Dash',
    description: 'When you take the Dash action, you gain extra movement for the current turn.',
    details: ['The increase equals your speed, after applying any modifiers.']
  },
  {
    id: 'disengage',
    category: 'Combat',
    name: 'Disengage',
    description: 'If you take the Disengage action, your movement doesn’t provoke opportunity attacks for the rest of the turn.'
  },
  {
    id: 'dodge',
    category: 'Combat',
    name: 'Dodge',
    description: 'When you take the Dodge action, you focus entirely on avoiding attacks.',
    details: [
      'Until the start of your next turn, any attack roll made against you has disadvantage if you can see the attacker.',
      'You make Dexterity saving throws with advantage.'
    ]
  },
  {
    id: 'help',
    category: 'Combat',
    name: 'Help',
    description: 'You can lend your aid to another creature in the completion of a task.',
    details: [
      'The creature you aid has advantage on the next ability check it makes to perform the task you are helping with.',
      'Alternatively, you can aid a friendly creature in attacking a target within 5 feet of you.'
    ]
  },
  {
    id: 'hide',
    category: 'Combat',
    name: 'Hide',
    description: 'When you take the Hide action, you make a Dexterity (Stealth) check in an attempt to hide.'
  },
  {
    id: 'cover-half',
    category: 'Combat',
    name: 'Half Cover',
    description: 'A target with half cover has a +2 bonus to AC and Dexterity saving throws.',
    details: ['A target has half cover if an obstacle blocks at least half of its body.']
  },
  {
    id: 'cover-three-quarters',
    category: 'Combat',
    name: 'Three-Quarters Cover',
    description: 'A target with three-quarters cover has a +5 bonus to AC and Dexterity saving throws.',
    details: ['A target has three-quarters cover if about three-quarters of it is covered by an obstacle.']
  }
];
