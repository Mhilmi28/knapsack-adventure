
"use strict";

const LEVEL_CONFIG = Object.freeze({
  easy: {
    label: "Easy",
    itemCount: 10,
    capacity: 30
  },
  medium: {
    label: "Medium",
    itemCount: 25,
    capacity: 50
  },
  hard: {
    label: "Hard",
    itemCount: 50,
    capacity: 100
  }
});

const ITEM_ICONS = [
  "🍓", "🍋", "🍇", "🍫", "⭐",
  "🫐", "🍩", "🍏", "🍒", "🍍",
  "🍪", "🍉", "🧁", "🍬", "🍭",
  "🥥", "🍊", "🌈", "🍥", "🐻"
];

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateItems(level) {
  const config = LEVEL_CONFIG[level];

  if (!config) {
    throw new Error("Level permainan tidak valid.");
  }

  return Array.from({ length: config.itemCount }, (_, index) => ({
    id: index + 1,
    name: `Candy ${index + 1}`,
    icon: ITEM_ICONS[index % ITEM_ICONS.length],
    weight: randomInteger(2, 15),
    profit: Math.round((12 + Math.random() * 83) * 100) / 100
  }));
}

function formatMoney(value) {
  return Number(value).toFixed(2);
}
