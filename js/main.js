
import { KnapsackGame } from "./game.js";
import { getLevelConfig } from "./items.js";
import { greedyByProfit } from "./algorithms.js";

const $ = id => document.getElementById(id);

const setupPanel = $("setupPanel");
const gamePanel = $("gamePanel");
let game = null;
let autoTimer = null;

function formatProfit(value) {
  return value.toFixed(2);
}

function stopAutoTimer() {
  if (autoTimer !== null) {
    clearInterval(autoTimer);
    autoTimer = null;
  }
}

function setStatus(message) {
  $("statusMessage").textContent = message;
}

function renderGame() {
  if (!game) return;

  const totals = game.getTotals();
  const selectedItems = game.getSelectedItems();

  $("playerLabel").textContent = `👤 Pemain: ${game.playerName}`;
  $("levelLabel").textContent =
    `Level: ${game.level[0].toUpperCase()}${game.level.slice(1)}`;
  $("capacityLabel").textContent = `${game.capacity} kg`;
  $("itemCount").textContent = `${game.items.length} barang`;
  $("totalWeight").textContent = totals.weight;
  $("remainingCapacity").textContent = game.capacity - totals.weight;
  $("totalProfit").textContent = formatProfit(totals.profit);
  $("weightProgress").style.width =
    `${Math.min(100, totals.weight / game.capacity * 100)}%`;

  $("itemsGrid").replaceChildren();

  for (const item of game.items) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "item-card";
    button.classList.toggle(
      "selected",
      game.selectedIds.has(item.id)
    );
    button.disabled = game.finished || game.mode === "auto";

    const icon = document.createElement("span");
    icon.className = "item-icon";
    icon.textContent = item.icon;

    const name = document.createElement("span");
    name.className = "item-name";
    name.textContent = `#${item.id} ${item.name}`;

    const weight = document.createElement("small");
    weight.textContent = `⚖ ${item.weight} kg`;

    const profit = document.createElement("small");
    profit.textContent = `🪙 ${formatProfit(item.profit)}`;

    button.append(icon, name, weight, profit);
    button.addEventListener("click", () => {
      const result = game.toggleItem(item.id);
      setStatus(result.message);
      renderGame();
    });

    $("itemsGrid").append(button);
  }

  $("bagItems").replaceChildren();

  if (selectedItems.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "Tas masih kosong. Pilih barang terlebih dahulu.";
    $("bagItems").append(empty);
  } else {
    for (const item of selectedItems) {
      const card = document.createElement("div");
      card.className = "bag-item";

      const icon = document.createElement("span");
      icon.className = "item-icon";
      icon.textContent = item.icon;

      const name = document.createElement("small");
      name.textContent = `#${item.id}`;

      const weight = document.createElement("small");
      weight.textContent = `${item.weight} kg`;

      const profit = document.createElement("small");
      profit.textContent = `🪙 ${formatProfit(item.profit)}`;

      card.append(icon, name, weight, profit);
      $("bagItems").append(card);
    }
  }

  $("manualButton").disabled = game.finished;
  $("autoButton").disabled = game.finished;
  $("resetButton").disabled = game.finished;
  $("finishButton").disabled = game.finished || game.mode === "auto";
}

function renderAlgorithmLog(lines) {
  const list = $("algorithmLog");
  list.replaceChildren();

  if (lines.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Belum ada algoritma yang dijalankan.";
    list.append(li);
    return;
  }

  for (const line of lines) {
    const li = document.createElement("li");
    li.textContent = line;
    list.append(li);
  }
}

function updateComparison() {
  const totals = game.getTotals();
  const optimal = game.getOptimalProfit();

  $("optimalProfit").textContent = formatProfit(optimal);
  $("profitGap").textContent =
    formatProfit(Math.max(0, optimal - totals.profit));
}

function startGame(level, playerName) {
  stopAutoTimer();

  game = new KnapsackGame(level, playerName);
  setupPanel.hidden = true;
  gamePanel.hidden = false;

  renderAlgorithmLog([]);
  updateComparison();
  renderGame();
  setStatus("Game dimulai! Pilih barang atau jalankan Greedy.");
}

function runAutomaticMode() {
  if (!game || game.finished) return;

  stopAutoTimer();

  const result = greedyByProfit(game.items, game.capacity);
  const sorted = [...game.items].sort(
    (a, b) => b.profit - a.profit || a.weight - b.weight
  );

  game.mode = "auto";
  game.selectedIds.clear();

  let index = 0;
  let currentWeight = 0;
  let currentProfit = 0;
  const logs = [];

  renderGame();
  renderAlgorithmLog([]);
  setStatus("Greedy mulai memeriksa barang berdasarkan profit terbesar...");

  autoTimer = setInterval(() => {
    if (index >= sorted.length) {
      stopAutoTimer();
      game.finished = true;
      renderGame();
      updateComparison();

      const optimal = game.getOptimalProfit();
      const totals = game.getTotals();
      const isOptimal = Math.abs(totals.profit - optimal) < 0.005;

      setStatus(
        `Greedy selesai. Profit ${formatProfit(totals.profit)}. ` +
        (isOptimal
          ? "🏆 Hasil mencapai profit optimal!"
          : `Profit optimal adalah ${formatProfit(optimal)}.`)
      );
      return;
    }

    const item = sorted[index++];
    const remaining = game.capacity - currentWeight;

    if (item.weight <= remaining) {
      game.selectedIds.add(item.id);
      currentWeight += item.weight;
      currentProfit += item.profit;

      logs.push(
        `#${item.id} diambil — berat ${item.weight} kg, ` +
        `profit ${formatProfit(item.profit)}.`
      );
    } else {
      logs.push(
        `#${item.id} dilewati — berat ${item.weight} kg, ` +
        `sisa kapasitas ${remaining} kg.`
      );
    }

    renderGame();
    renderAlgorithmLog(logs);
    updateComparison();

    setStatus(
      `Greedy memeriksa barang ${index}/${sorted.length}. ` +
      `Total berat ${currentWeight} kg, profit ${formatProfit(currentProfit)}.`
    );
  }, 350);
}

$("setupForm").addEventListener("submit", event => {
  event.preventDefault();

  const playerName = $("playerName").value.trim();

  if (!playerName) {
    $("playerName").focus();
    return;
  }

  startGame($("level").value, playerName);
});

$("manualButton").addEventListener("click", () => {
  if (!game || game.finished) return;

  stopAutoTimer();
  game.mode = "manual";
  renderGame();
  setStatus("Mode Manual aktif. Klik barang untuk memilih atau mengeluarkannya.");
});

$("autoButton").addEventListener("click", runAutomaticMode);

$("resetButton").addEventListener("click", () => {
  if (!game || game.finished) return;

  stopAutoTimer();
  game.resetBag();
  renderAlgorithmLog([]);
  renderGame();
  updateComparison();
  setStatus("Tas dikosongkan. Silakan pilih barang lagi.");
});

$("finishButton").addEventListener("click", () => {
  if (!game || game.finished) return;

  const result = game.finishManual();
  if (!result) return;

  renderGame();
  updateComparison();

  if (result.isOptimal) {
    setStatus(
      `🏆 Hebat, ${game.playerName}! Profit ${formatProfit(result.profit)} ` +
      "adalah profit optimal. Kamu mendapatkan Trophy!"
    );
  } else {
    setStatus(
      `Permainan selesai. Profit kamu ${formatProfit(result.profit)}, ` +
      `sedangkan profit optimal ${formatProfit(result.optimalProfit)}. ` +
      "Coba strategi pilihan yang berbeda pada game baru."
    );
  }
});

$("newGameButton").addEventListener("click", () => {
  stopAutoTimer();
  setupPanel.hidden = false;
  gamePanel.hidden = true;
  $("playerName").value = game?.playerName ?? "";
  $("level").value = game?.level ?? "easy";
  $("playerName").focus();
});
