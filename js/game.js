
import { generateItems, getLevelConfig } from "./items.js";
import {
  greedyByProfit,
  calculateOptimalProfit
} from "./algorithms.js";

export class KnapsackGame {
  constructor(level, playerName) {
    this.playerName = playerName;
    this.level = level;
    this.items = [];
    this.capacity = 0;
    this.selectedIds = new Set();
    this.mode = "manual";
    this.finished = false;

    this.startNewGame(level);
  }

  startNewGame(level = this.level) {
    this.level = level;
    const config = getLevelConfig(level);

    this.capacity = config.capacity;
    this.items = generateItems(level);
    this.selectedIds = new Set();
    this.mode = "manual";
    this.finished = false;
  }

  getSelectedItems() {
    return this.items.filter(item => this.selectedIds.has(item.id));
  }

  getTotals() {
    const selectedItems = this.getSelectedItems();

    return selectedItems.reduce(
      (totals, item) => ({
        weight: totals.weight + item.weight,
        profit: totals.profit + item.profit
      }),
      { weight: 0, profit: 0 }
    );
  }

  toggleItem(id) {
    if (this.finished || this.mode !== "manual") {
      return { success: false, message: "Pilihan tidak dapat diubah." };
    }

    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
      return { success: true, message: "Barang dikeluarkan dari tas." };
    }

    const item = this.items.find(item => item.id === id);

    if (!item) {
      return { success: false, message: "Barang tidak ditemukan." };
    }

    const totals = this.getTotals();

    if (totals.weight + item.weight > this.capacity) {
      return {
        success: false,
        message: "Berat barang melebihi kapasitas tas!"
      };
    }

    this.selectedIds.add(id);

    return { success: true, message: "Barang dimasukkan ke tas." };
  }

  resetBag() {
    if (this.finished) return;

    this.selectedIds.clear();
    this.mode = "manual";
  }

  runGreedy() {
    const result = greedyByProfit(this.items, this.capacity);

    this.selectedIds = new Set(
      result.selectedItems.map(item => item.id)
    );

    this.mode = "auto";
    this.finished = true;

    return result;
  }

  getOptimalProfit() {
    return calculateOptimalProfit(this.items, this.capacity);
  }

  finishManual() {
    if (this.finished) return null;

    this.finished = true;
    const totals = this.getTotals();
    const optimalProfit = this.getOptimalProfit();

    return {
      ...totals,
      optimalProfit,
      isOptimal: Math.abs(totals.profit - optimalProfit) < 0.005
    };
  }
}
