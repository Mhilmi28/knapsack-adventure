
"use strict";

const Game = (() => {
  let items = [];
  let selectedIds = new Set();
  let capacity = 30;
  let level = "easy";
  let player = "Petualang";
  let mode = "manual";
  let finished = false;
  let locked = false;
  let autoTimer = null;
  let autoRunId = 0;
  let autoOrder = [];
  let autoIndex = 0;
  let toastTimer = null;

  const $ = id => document.getElementById(id);

  function getSelectedItems() {
    return items.filter(item => selectedIds.has(item.id));
  }

  function getTotals() {
    const selected = getSelectedItems();

    return {
      count: selected.length,
      weight: selected.reduce((sum, item) => sum + item.weight, 0),
      profit: selected.reduce((sum, item) => sum + item.profit, 0)
    };
  }

  function getBestResult() {
    return solveKnapsackDP(items, capacity);
  }

  function notify(message) {
    const toast = $("toast");
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2400);
  }

  function setStatus(message) {
    $("gameStatus").textContent = message;
  }

  function updateModeUI() {
    $("manualBtn").classList.toggle("active", mode === "manual");
    $("autoBtn").classList.toggle("active", mode === "auto");

    $("modeLabel").textContent =
      mode === "manual" ? "Manual" : "Automatic — Greedy by Profit";

    $("inventoryHint").textContent =
      mode === "manual"
        ? "Klik barang untuk memasukkan atau mengeluarkannya dari tas."
        : "Greedy memeriksa barang berdasarkan profit terbesar.";
  }

  function renderInventory() {
    const grid = $("itemGrid");
    const filter = $("filterSelect").value;
    const sort = $("sortSelect").value;

    let visibleItems = [...items];

    if (filter === "available") {
      visibleItems = visibleItems.filter(
        item => !selectedIds.has(item.id)
      );
    } else if (filter === "selected") {
      visibleItems = visibleItems.filter(
        item => selectedIds.has(item.id)
      );
    }

    if (sort === "profit") {
      visibleItems.sort(
        (a, b) => b.profit - a.profit || a.id - b.id
      );
    } else if (sort === "weight") {
      visibleItems.sort(
        (a, b) => a.weight - b.weight || a.id - b.id
      );
    } else {
      visibleItems.sort((a, b) => a.id - b.id);
    }

    grid.replaceChildren();

    if (visibleItems.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-bag";
      empty.textContent = "Tidak ada barang pada filter ini.";
      grid.appendChild(empty);
      return;
    }

    for (const item of visibleItems) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "item-card";

      if (selectedIds.has(item.id)) {
        button.classList.add("selected");
      }

      button.disabled = locked || finished || mode !== "manual";
      button.setAttribute("aria-pressed", String(selectedIds.has(item.id)));

      const id = document.createElement("span");
      id.className = "item-id";
      id.textContent = `BARANG #${item.id}`;

      const icon = document.createElement("span");
      icon.className = "item-icon";
      icon.textContent = item.icon;

      const weight = document.createElement("span");
      weight.className = "item-stat";
      weight.textContent = `⚖️ ${item.weight} kg`;

      const profit = document.createElement("span");
      profit.className = "item-stat";
      profit.textContent = `🪙 ${formatMoney(item.profit)}`;

      button.append(id, icon, weight, profit);
      button.addEventListener("click", () => toggleItem(item.id));

      grid.appendChild(button);
    }
  }

  function renderBag() {
    const container = $("bagItems");
    const chosen = getSelectedItems();

    container.replaceChildren();
    $("bagCountLabel").textContent =
      `${chosen.length} barang dipilih`;

    if (chosen.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-bag";
      empty.textContent = "🎒 Ransel masih kosong. Pilih barang dari daftar.";
      container.appendChild(empty);
      return;
    }

    for (const item of chosen) {
      const card = document.createElement("div");
      card.className = "bag-item";

      const icon = document.createElement("span");
      icon.className = "item-icon";
      icon.textContent = item.icon;

      const weight = document.createElement("span");
      weight.className = "item-stat";
      weight.textContent = `${item.weight} kg`;

      const profit = document.createElement("span");
      profit.className = "item-stat";
      profit.textContent = `🪙 ${formatMoney(item.profit)}`;

      card.append(icon, weight, profit);

      if (mode === "manual" && !locked && !finished) {
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "remove-btn";
        remove.textContent = "×";
        remove.title = `Keluarkan barang #${item.id}`;
        remove.setAttribute(
          "aria-label",
          `Keluarkan barang nomor ${item.id}`
        );
        remove.addEventListener("click", () => toggleItem(item.id));
        card.appendChild(remove);
      }

      container.appendChild(card);
    }
  }

  function renderSummary() {
    const totals = getTotals();

    $("weightTotal").textContent = totals.weight;
    $("profitTotal").textContent = formatMoney(totals.profit);
    $("remainingWeight").textContent = capacity - totals.weight;

    const percent = capacity > 0
      ? (totals.weight / capacity) * 100
      : 0;

    $("weightBar").style.width = `${Math.min(100, percent)}%`;
    $("itemCountLabel").textContent = `${items.length} barang tersedia`;
  }

  function render() {
    updateModeUI();
    renderInventory();
    renderBag();
    renderSummary();
  }

  function resetTrophy() {
    $("trophyIcon").textContent = "🏆";
    $("trophyTitle").textContent = "Trophy belum diperoleh";
    $("trophyDescription").textContent =
      "Selesaikan permainan untuk melihat hasil.";
  }

  function toggleItem(id) {
    if (locked || finished || mode !== "manual") return;

    const item = items.find(entry => entry.id === id);
    if (!item) return;

    if (selectedIds.has(id)) {
      selectedIds.delete(id);
    } else {
      const totals = getTotals();

      if (totals.weight + item.weight > capacity) {
        notify("⚖️ Barang tidak bisa dimasukkan: kapasitas tas terlampaui.");
        return;
      }

      selectedIds.add(id);
    }

    resetTrophy();
    render();
    setStatus("Isi ransel diperbarui.");
  }

  function stopAuto() {
    autoRunId++;
    if (autoTimer !== null) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
    locked = false;
  }

  function startNewGame(selectedLevel, playerName) {
    stopAuto();

    level = selectedLevel;
    player = playerName;
    capacity = LEVEL_CONFIG[level].capacity;
    items = generateItems(level);
    selectedIds = new Set();
    mode = "manual";
    finished = false;
    locked = false;
    autoOrder = [];
    autoIndex = 0;

    $("playerLabel").textContent = player;
    $("levelLabel").textContent = LEVEL_CONFIG[level].label;
    $("capacityLabel").textContent = `${capacity} kg`;

    resetTrophy();
    render();
    setStatus("Petualangan dimulai! Pilih barang dengan cermat.");
  }

  function switchToManual() {
    if (autoTimer !== null) {
      stopAuto();
      mode = "manual";
      finished = false;
      resetTrophy();
      render();
      setStatus("Mode Manual aktif. Barang yang sudah masuk tas tetap dipertahankan.");
      return;
    }

    if (finished) {
      finished = false;
      locked = false;
      resetTrophy();
    }

    mode = "manual";
    render();
    setStatus("Mode Manual aktif. Pilih barang untuk melanjutkan.");
  }

  function startAutomatic() {
    if (autoTimer !== null) {
      notify("Proses Automatic sedang berjalan.");
      return;
    }

    if (finished) {
      notify("Tekan Reset Tas atau mulai permainan baru.");
      return;
    }

    mode = "auto";
    selectedIds = new Set();
    locked = true;
    autoOrder = [...items].sort(
      (a, b) => b.profit - a.profit || a.weight - b.weight
    );
    autoIndex = 0;

    const thisRun = ++autoRunId;

    render();
    setStatus("Greedy mulai memeriksa barang...");

    autoTimer = setInterval(() => {
      if (thisRun !== autoRunId) return;

      if (autoIndex >= autoOrder.length) {
        clearInterval(autoTimer);
        autoTimer = null;
        locked = false;
        finished = true;

        render();
        awardTrophy();
        return;
      }

      const item = autoOrder[autoIndex];
      autoIndex++;

      const totals = getTotals();

      if (totals.weight + item.weight <= capacity) {
        selectedIds.add(item.id);
        setStatus(
          `Greedy mengambil barang #${item.id} — profit ${formatMoney(item.profit)}.`
        );
      } else {
        setStatus(
          `Greedy melewati barang #${item.id}: beratnya tidak muat pada sisa kapasitas.`
        );
      }

      render();
    }, 480);
  }

  function calculateTrophy(profit, optimalProfit) {
    const ratio = optimalProfit > 0
      ? Math.min(1, profit / optimalProfit)
      : 1;

    if (Math.abs(profit - optimalProfit) < 0.005) {
      return {
        icon: "🏆",
        title: "Trophy Emas",
        message: "Profit optimal tercapai!",
        ratio,
        optimal: true
      };
    }

    if (ratio >= 0.9) {
      return {
        icon: "🥇",
        title: "Trophy Emas",
        message: "Hampir optimal! Profitmu sangat dekat dengan maksimum.",
        ratio,
        optimal: false
      };
    }

    if (ratio >= 0.75) {
      return {
        icon: "🥈",
        title: "Trophy Perak",
        message: "Hasilmu sudah mendekati profit optimal.",
        ratio,
        optimal: false
      };
    }

    if (ratio >= 0.5) {
      return {
        icon: "🥉",
        title: "Trophy Perunggu",
        message: "Bagus! Masih ada peluang meningkatkan profit.",
        ratio,
        optimal: false
      };
    }

    return {
      icon: "🎖️",
      title: "Trophy Petualang",
      message: "Coba strategi lain untuk meningkatkan profit.",
      ratio,
      optimal: false
    };
  }

  function awardTrophy() {
    const totals = getTotals();
    const best = getBestResult();
    const trophy = calculateTrophy(totals.profit, best.totalProfit);
    const percent = Math.round(trophy.ratio * 100);

    $("trophyIcon").textContent = trophy.icon;
    $("trophyTitle").textContent = trophy.title;
    $("trophyDescription").textContent =
      `${trophy.message} ${percent}% dari profit optimal.`;

    setStatus(
      `${trophy.icon} ${trophy.title}: profit ${formatMoney(totals.profit)} dari optimal ${formatMoney(best.totalProfit)} (${percent}%).`
    );

    notify(`${trophy.icon} ${trophy.title}! ${percent}% dari optimal.`);
  }

  function finishGame() {
    if (locked || finished) return;

    finished = true;
    locked = true;
    render();
    awardTrophy();
  }

  function resetBag() {
    // Reset aman: menghentikan interval Automatic dan membatalkan sesi lamanya.
    stopAuto();

    selectedIds = new Set();
    finished = false;
    locked = false;
    mode = "manual";

    resetTrophy();
    render();
    setStatus("Tas direset. Pilih barang lagi!");
    notify("Tas berhasil direset.");
  }

  function openReport() {
    $("reportContent").innerHTML = buildReportHTML({
      player,
      level,
      capacity,
      items,
      selectedItems: getSelectedItems(),
      manualProfit: getTotals().profit,
      manualWeight: getTotals().weight,
      mode,
      greedyResult: greedyByProfit(items, capacity),
      optimalResult: getBestResult()
    });

    $("reportModal").classList.remove("hidden");
  }

  function closeReport() {
    $("reportModal").classList.add("hidden");
  }

  function printReport() {
    const report = $("reportContent").innerHTML;
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      notify("Izinkan pop-up browser untuk mencetak laporan.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>Laporan Knapsack Adventure</title>
        <style>
          body { font: 14px/1.65 Arial, sans-serif; max-width: 850px; margin: 30px auto; padding: 0 20px; color: #222; }
          h1, h2, h3 { color: #205b3d; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ccc; padding: 7px; text-align: left; }
          @media print { body { margin: 12mm auto; } }
        </style>
      </head>
      <body>
        <h1>Laporan Knapsack Adventure</h1>
        ${report}
        <h3>Identitas Kelompok</h3>
        <p>Nama anggota: ___________________________________</p>
        <p>Kelas: _____________________ Tanggal: _____________________</p>
        <script>window.onload = () => window.print();<\/script>
      </body>
      </html>
    `);

    printWindow.document.close();
  }

  function bindEvents() {
    $("manualBtn").addEventListener("click", switchToManual);
    $("autoBtn").addEventListener("click", startAutomatic);
    $("resetBtn").addEventListener("click", resetBag);
    $("finishBtn").addEventListener("click", finishGame);

    $("filterSelect").addEventListener("change", renderInventory);
    $("sortSelect").addEventListener("change", renderInventory);

    $("reportBtn").addEventListener("click", openReport);
    $("closeReportBtn").addEventListener("click", closeReport);
    $("closeReportBottomBtn").addEventListener("click", closeReport);
    $("printReportBtn").addEventListener("click", printReport);

    $("reportModal").addEventListener("click", event => {
      if (event.target === $("reportModal")) closeReport();
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") closeReport();
    });
  }

  return {
    bindEvents,
    startNewGame,
    stopAuto
  };
})();
