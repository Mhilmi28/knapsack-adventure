
const ITEM_CONFIG = {
  easy: { count: 10, capacity: 30 },
  medium: { count: 25, capacity: 100 },
  hard: { count: 50, capacity: 100 }
};

const ITEM_ICONS = [
  "🍓", "🍋", "🍇", "🍫", "⭐",
  "🫐", "🍩", "🍏", "🍊", "🍭",
  "🌈", "🍒", "🍍", "🍪", "🧁"
];

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getLevelConfig(level) {
  return ITEM_CONFIG[level] ?? ITEM_CONFIG.easy;
}

export function generateItems(level) {
  const config = getLevelConfig(level);

  return Array.from({ length: config.count }, (_, index) => ({
    id: index + 1,
    name: `Barang ${index + 1}`,
    icon: ITEM_ICONS[index % ITEM_ICONS.length],
    weight: randomInteger(2, 15),
    profit: Math.round((12 + Math.random() * 83) * 100) / 100
  }));
}
