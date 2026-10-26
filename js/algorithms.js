
"use strict";

/**
 * Greedy by Profit:
 * Prioritas utama adalah profit terbesar, bukan rasio profit/berat.
 */
function greedyByProfit(items, capacity) {
  const sortedItems = [...items].sort(
    (a, b) => b.profit - a.profit || a.weight - b.weight
  );

  const selected = [];
  const skipped = [];
  let totalWeight = 0;
  let totalProfit = 0;

  for (const item of sortedItems) {
    if (totalWeight + item.weight <= capacity) {
      selected.push(item);
      totalWeight += item.weight;
      totalProfit += item.profit;
    } else {
      skipped.push(item);
    }
  }

  return {
    selected,
    skipped,
    totalWeight,
    totalProfit: Number(totalProfit.toFixed(2)),
    order: sortedItems
  };
}

/**
 * Dynamic Programming untuk 0/1 Knapsack.
 * Setiap barang hanya boleh diambil satu kali.
 *
 * Kompleksitas waktu: O(n * C)
 * Kompleksitas ruang: O(n * C)
 *
 * C adalah kapasitas integer.
 */
function solveKnapsackDP(items, capacity) {
  const n = items.length;

  const dp = Array.from(
    { length: n + 1 },
    () => Array(capacity + 1).fill(0)
  );

  for (let i = 1; i <= n; i++) {
    const item = items[i - 1];

    for (let c = 0; c <= capacity; c++) {
      dp[i][c] = dp[i - 1][c];

      if (item.weight <= c) {
        const take =
          dp[i - 1][c - item.weight] + item.profit;

        dp[i][c] = Math.max(dp[i][c], take);
      }
    }
  }

  // Rekonstruksi barang yang membentuk solusi optimal.
  const selected = [];
  let remainingCapacity = capacity;

  for (let i = n; i > 0; i--) {
    if (
      Math.abs(dp[i][remainingCapacity] -
        dp[i - 1][remainingCapacity]) > 1e-8
    ) {
      const item = items[i - 1];

      selected.push(item);
      remainingCapacity -= item.weight;
    }
  }
  selected.reverse();

  return {
    selected,
    totalWeight: selected.reduce(
      (sum, item) => sum + item.weight, 0
    ),
    totalProfit: dp[n][capacity]
  };
}
