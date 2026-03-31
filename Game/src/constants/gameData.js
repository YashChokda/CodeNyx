const ENTITIES = [
  'Team Selection',
  'Budget Allocation',
  'Product Strategy',
  'Marketing Strategy',
  'Market Position',
  'Team Management',
  'Expansion Decision',
];

const CHOICES = {
  'Team Selection': ['Skilled', 'Unskilled'],
  'Budget Allocation': ['High Spending', 'Balanced', 'Low Spending'],
  'Product Strategy': ['High Quality', 'Medium Quality', 'Low Quality'],
  'Marketing Strategy': ['Celebrity', 'Social Media', 'Influencer', 'No Marketing'],
  'Market Position': ['Competitive Pricing', 'Premium Branding'],
  'Team Management': ['Train Team', 'Hire More', 'Do Nothing'],
  'Expansion Decision': ['Expand', 'Stay Local'],
};

const STEP_POSITIONS = [
  [80, 480],
  [200, 480],
  [320, 480],
  [440, 480],
  [560, 480],
  [680, 480],
  [800, 480],
];

const COLORS = {
  SKY: 'rgb(100, 200, 255)',
  CLOUD: 'rgb(255, 255, 255)',
  GRASS: 'rgb(76, 175, 80)',
  GRASS_DARK: 'rgb(56, 142, 60)',
  DIRT: 'rgb(139, 69, 19)',
  TEXT: 'rgb(20, 40, 80)',
};

export { ENTITIES, CHOICES, STEP_POSITIONS, COLORS };
