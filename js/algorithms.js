
export function greedyByProfit(items, capacity) {
  const sortedItems = [...items].sort(
    (a, b) => b.profit - a.profit || a.weight - b.weight
  );

  const selectedItems = [];
  const log = [];
  let totalWeight = 0;
  let totalProfit = 0;

  for (const item of sortedItems) {
    const remaining = capacity - totalWeight;

    if (item.weight <= remaining) {
      selectedItems.push(item);
      totalWeight += item.weight;
      totalProfit += item.profit;

      log.push(
        `Barang #${item.id} diambil: berat ${item.weight} kg, ` +
        `profit ${item.profit.toFixed(2)}.`
      );
    } else {
      log.push(
        `Barang #${item.id} dilewati: berat ${item.weight} kg, ` +
        `sisa kapasitas ${remaining} kg.`
      );
    }
  }

  return {
    selectedItems,
    totalWeight,
    totalProfit,
    log
  };
}

export function calculateOptimalProfit(items, capacity) {
  const dp = Array(capacity + 1).fill(0);

  for (const item of items) {
    // Iterasi mundur memastikan setiap barang hanya dipakai sekali.
    for (let c = capacity; c >= item.weight; c--) {
      dp[c] = Math.max(
        dp[c],
        dp[c - item.weight] + item.profit
      );
    }
  }

  return dp[capacity];
}
