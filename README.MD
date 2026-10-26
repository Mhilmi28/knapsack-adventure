
# Knapsack Adventure

Game edukasi untuk mempelajari masalah 0/1 Knapsack menggunakan JavaScript.

## Teknologi
- HTML
- CSS
- JavaScript

## Fitur
- Akun pemain lokal berbasis localStorage
- Level Easy, Medium, dan Hard
- Pemilihan barang secara Manual
- Algoritma Greedy by Profit
- Dynamic Programming untuk profit optimal
- Trophy berdasarkan pencapaian profit
- Laporan algoritma dan cetak PDF

## Konfigurasi Level

| Level | Jumlah barang | Kapasitas |
|---|---:|---:|
| Easy | 10 | 30 kg |
| Medium | 25 | 50 kg |
| Hard | 50 | 100 kg |

## Cara Menjalankan
1. Buka folder proyek di VS Code.
2. Pastikan struktur folder dan nama file sesuai.
3. Jalankan `index.html` menggunakan browser atau ekstensi Live Server.
4. Buat nama akun pemain.
5. Pilih level, lalu mulai bermain.

## Algoritma

### Greedy by Profit
Barang diurutkan berdasarkan profit terbesar terlebih dahulu. Barang
diambil jika masih muat dalam kapasitas tas.

Kompleksitas waktu: O(n log n).

### Dynamic Programming
DP[i][c] menyimpan profit maksimum dari i barang pertama dengan
kapasitas c.

Kompleksitas waktu: O(n × C).
Kompleksitas ruang: O(n × C).

## Catatan
Akun hanya disimpan di browser. Proyek ini belum menggunakan server,
database, autentikasi sungguhan, atau sinkronisasi antarperangkat.

Data barang diacak setiap kali permainan baru dimulai.
