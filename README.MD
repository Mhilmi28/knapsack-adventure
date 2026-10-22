
# Knapsack Adventure

Game edukasi untuk proyek mata kuliah Strategi Algoritma.
Pemain memilih barang ke dalam tas dengan kapasitas terbatas
untuk mendapatkan profit maksimum.

## Teknologi
- HTML
- CSS
- JavaScript ES Modules

## Cara menjalankan
1. Buka folder proyek di Visual Studio Code.
2. Pasang ekstensi Live Server jika belum tersedia.
3. Klik kanan `index.html`.
4. Pilih **Open with Live Server**.
5. Game akan terbuka di browser.

## Aturan level
- Easy: 10 barang, kapasitas 30 kg.
- Medium: 25 barang, kapasitas 100 kg.
- Hard: 50 barang, kapasitas 100 kg.

Setiap barang mempunyai berat integer dan profit desimal.
Setiap barang hanya boleh dipilih satu kali.

## Algoritma
- Greedy by Profit: mengurutkan barang dari profit terbesar,
  lalu mengambil barang yang masih muat.
- Dynamic Programming: menghitung profit optimal untuk
  membandingkan hasil pilihan pemain dan Greedy.

Greedy by Profit tidak selalu menghasilkan solusi optimal
untuk masalah 0/1 Knapsack.

## Struktur modul
- `items.js`: konfigurasi level dan generator barang.
- `algorithms.js`: Greedy dan Dynamic Programming.
- `game.js`: state dan aturan permainan.
- `main.js`: interaksi antarmuka.
- `style.css`: desain visual.
