
"use strict";

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function buildReportHTML(data) {
  const {
    player,
    level,
    capacity,
    items,
    selectedItems,
    manualProfit,
    manualWeight,
    mode,
    greedyResult,
    optimalResult
  } = data;

  const levelName = LEVEL_CONFIG[level].label;
  const manualGap = Math.max(0, optimalResult.totalProfit - manualProfit);
  const greedyGap = Math.max(0, optimalResult.totalProfit - greedyResult.totalProfit);

  const greedyTrace = greedyResult.order.map(item => {
    const taken = greedyResult.selected.some(entry => entry.id === item.id);

    return `<li>Barang #${item.id}: ${taken ? "diambil" : "dilewati"} — berat ${item.weight} kg, profit ${formatMoney(item.profit)}.</li>`;
  }).join("");

  const tableRows = items.map(item => {
    const chosen = selectedItems.some(entry => entry.id === item.id);

    return `
      <tr>
        <td>${item.id}</td>
        <td>${escapeHTML(item.name)}</td>
        <td>${item.weight} kg</td>
        <td>${formatMoney(item.profit)}</td>
        <td>${chosen ? "Ya" : "Tidak"}</td>
      </tr>
    `;
  }).join("");

  return `
    <section class="report-summary">
      <h3>Informasi Sesi</h3>
      <p><strong>Pemain:</strong> ${escapeHTML(player)}</p>
      <p><strong>Level:</strong> ${levelName}</p>
      <p><strong>Jumlah barang:</strong> ${items.length}</p>
      <p><strong>Kapasitas tas:</strong> ${capacity} kg</p>
      <p><strong>Mode saat laporan dibuka:</strong> ${escapeHTML(mode === "manual" ? "Manual" : "Automatic — Greedy by Profit")}</p>
      <p><strong>Isi tas saat ini:</strong> ${selectedItems.length} barang, ${manualWeight} kg, profit ${formatMoney(manualProfit)}</p>
      <p><strong>Profit Greedy:</strong> ${formatMoney(greedyResult.totalProfit)} dari ${greedyResult.selected.length} barang.</p>
      <p><strong>Profit optimal DP:</strong> ${formatMoney(optimalResult.totalProfit)}</p>
      <p><strong>Selisih profit tas saat ini terhadap optimal:</strong> ${formatMoney(manualGap)}</p>
    </section>

    <h3>1. Rumusan Masalah</h3>
    <p>
      Knapsack 0/1 adalah masalah memilih sekumpulan barang agar total berat
      tidak melebihi kapasitas tas dan total profit sebesar mungkin. Setiap
      barang hanya dapat diambil satu kali. Pada game ini berat barang berupa
      bilangan bulat, sedangkan profit dapat berupa bilangan desimal.
    </p>

    <h3>2. Algoritma Greedy by Profit</h3>
    <ol>
      <li>Bangkitkan barang secara acak sesuai level yang dipilih.</li>
      <li>Urutkan barang dari profit terbesar ke terkecil.</li>
      <li>Periksa barang berdasarkan urutan tersebut.</li>
      <li>Ambil barang jika beratnya masih muat; jika tidak, lewati.</li>
      <li>Perbarui total berat dan profit setiap kali barang diproses.</li>
    </ol>
    <p>
      Kompleksitas waktu Greedy adalah O(n log n), karena pengurutan
      membutuhkan O(n log n) dan pemeriksaan barang membutuhkan O(n).
    </p>

    <h3>3. Dynamic Programming</h3>
    <p>
      Dynamic Programming digunakan untuk mencari profit optimal sebagai
      pembanding. DP[i][c] menyimpan profit maksimum dari i barang pertama
      dengan kapasitas c. Untuk setiap barang, algoritma membandingkan
      pilihan mengambil barang dengan tidak mengambilnya.
    </p>
    <p>
      Kompleksitas waktu implementasi tabel dua dimensi adalah O(n × C),
      sedangkan kompleksitas ruangnya juga O(n × C). n adalah jumlah barang
      dan C adalah kapasitas tas.
    </p>

    <h3>4. Hasil Perbandingan</h3>
    <ul>
      <li>Manual: profit ${formatMoney(manualProfit)}, berat ${manualWeight} kg.</li>
      <li>Greedy: profit ${formatMoney(greedyResult.totalProfit)}, berat ${greedyResult.totalWeight} kg.</li>
      <li>Dynamic Programming: profit optimal ${formatMoney(optimalResult.totalProfit)}, berat ${optimalResult.totalWeight} kg.</li>
      <li>Selisih Greedy terhadap optimal: ${formatMoney(greedyGap)}.</li>
    </ul>
    <p>
      Greedy by Profit tidak selalu menghasilkan solusi optimal untuk
      Knapsack 0/1. Dynamic Programming memberikan nilai optimal untuk
      membandingkan hasil pilihan pemain dan hasil Greedy.
    </p>

    <h3>5. Jejak Eksekusi Greedy</h3>
    <p>Daftar pemeriksaan barang berdasarkan profit menurun:</p>
    <ol>${greedyTrace}</ol>

    <h3>6. Data Barang dan Pilihan Pemain</h3>
    <div style="overflow-x:auto">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama</th>
            <th>Berat</th>
            <th>Profit</th>
            <th>Dipilih pemain</th>
          </tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
    </div>

    <h3>7. Parameter Level</h3>
    <ul>
      <li>Easy: 10 barang, kapasitas 30 kg.</li>
      <li>Medium: 25 barang, kapasitas 50 kg.</li>
      <li>Hard: 50 barang, kapasitas 100 kg.</li>
    </ul>

    <h3>8. Kesimpulan</h3>
    <p>
      Game ini menerapkan masalah 0/1 Knapsack melalui pemilihan manual,
      algoritma Greedy by Profit, dan Dynamic Programming. Hasil pengujian
      dapat digunakan untuk mengamati perbedaan antara strategi yang cepat
      dan solusi optimal. Nilai pada laporan mengikuti data acak pada sesi
      yang sedang aktif.
    </p>

    <p><strong>Nama anggota:</strong> __________________________________</p>
    <p><strong>Kelas:</strong> __________________ <strong>Tanggal:</strong> __________________</p>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  const $ = id => document.getElementById(id);

  const accountScreen = $("accountScreen");
  const homeScreen = $("homeScreen");
  const gameScreen = $("gameScreen");

  const STORAGE_PLAYER = "knapsackAdventurePlayer";
  const STORAGE_LEVEL = "knapsackAdventureLevel";

  function showScreen(screen) {
    accountScreen.classList.add("hidden");
    homeScreen.classList.add("hidden");
    gameScreen.classList.add("hidden");

    screen.classList.remove("hidden");
  }

  function getSavedPlayer() {
    return localStorage.getItem(STORAGE_PLAYER) || "";
  }

  function showHome() {
    const player = getSavedPlayer();

    if (!player) {
      showScreen(accountScreen);
      $("accountName").focus();
      return;
    }

    $("homePlayerName").textContent = player;

    const savedLevel = localStorage.getItem(STORAGE_LEVEL) || "easy";
    $("levelSelect").value = LEVEL_CONFIG[savedLevel]
      ? savedLevel
      : "easy";

    showScreen(homeScreen);
  }

  $("accountForm").addEventListener("submit", event => {
    event.preventDefault();

    const name = $("accountName").value.trim();

    if (!name) {
      $("accountName").focus();
      return;
    }

    localStorage.setItem(STORAGE_PLAYER, name);

    if (!localStorage.getItem(STORAGE_LEVEL)) {
      localStorage.setItem(STORAGE_LEVEL, "easy");
    }

    showHome();
  });

  $("levelSelect").addEventListener("change", () => {
    localStorage.setItem(STORAGE_LEVEL, $("levelSelect").value);
  });

  $("playBtn").addEventListener("click", () => {
    const player = getSavedPlayer();
    const level = $("levelSelect").value;

    if (!player) {
      showScreen(accountScreen);
      return;
    }

    if (!LEVEL_CONFIG[level]) {
      return;
    }

    localStorage.setItem(STORAGE_LEVEL, level);

    Game.startNewGame(level, player);
    showScreen(gameScreen);
  });

  function logout() {
    Game.stopAuto();

    localStorage.removeItem(STORAGE_PLAYER);
    localStorage.removeItem(STORAGE_LEVEL);

    $("accountName").value = "";
    showScreen(accountScreen);
  }

  $("logoutHomeBtn").addEventListener("click", logout);
  $("logoutGameBtn").addEventListener("click", logout);

  Game.bindEvents();

  if (getSavedPlayer()) {
    showHome();
  } else {
    showScreen(accountScreen);
  }
});
