# Permainan Teka-Teki Angka Klotski

Sebuah permainan puzzle angka geser berfitur lengkap dengan dukungan ukuran grid dari 2x2 hingga 10x10, berbagai mode permainan, dan statistik permainan yang komprehensif.

## Fitur

### Ukuran Kisi
- Mendukung puzzle **2x2** hingga **10x10**
- Desain yang dapat diskalakan dan responsif untuk semua ukuran

### Mode Permainan
1. **Klasik** - Selesaikan teka-teki tanpa batasan
2. **Berbatas Waktu** - Selesaikan teka-teki dalam waktu 60 detik
3. **Langkah Terbatas** - Selesaikan hanya dengan 50 langkah yang diperbolehkan
4. **Mode Zen** - Mode santai dengan papan peringkat untuk waktu terbaik

### Tingkat Kesulitan
- **Mudah** - 50 kali pengocokan
- **Sedang** - 100 kali pengocokan (standar)
- **Sulit** - 200 kali pengocokan
- **Ahli** - 500 kali pengocokan

### Fitur Game
- Penghitung langkah dan pengatur waktu secara real-time
- Kontrol klik untuk bergerak atau tombol panah
- Deteksi kemenangan otomatis
- Papan peringkat lokal (per ukuran grid)
- Pelacakan statistik
- Desain responsif (ramah seluler)
- Pintasan keyboard

### Kontrol Keyboard
- **Tombol Panah** - Pindahkan ubin
- **S** - Alihkan pengaturan
- **R** - Atur ulang permainan saat ini
- **N** - Mulai permainan baru

## Struktur File

```
klotski_number/
├── index.html          # Antarmuka utama game
├── api.php            # API backend PHP
├── css/
│   └── style.css      # Penataan gaya dan animasi game
├── js/
│   ├── game.js        # Logika inti permainan dan kelas KlotskiGame
│   ├── settings.js    # Pengaturan dan kontrol UI
│   └── utils.js       # Fungsi utilitas
├── data/              # Penyimpanan statistik game (dibuat secara otomatis)
└── README.md          # File ini
```

## Aturan Permainan

Tujuannya adalah untuk menyusun ubin bernomor dalam urutan menaik (1-8 untuk 3x3, 1-15 untuk 4x4, dst.) dengan ruang kosong di sudut kanan bawah.

Setiap langkah menggeser ubin yang berdekatan ke ruang kosong. Teka-teki selesai ketika semua angka berurutan dan ruang kosong berada di posisi terakhir.

## Detail Teknis

### Antarmuka Pengguna (JavaScript)
- **Kelas KlotskiGame** - Logika permainan utama
- Pembuatan dan pengacakan teka-teki
- Validasi pemindahan
- Manajemen status permainan
- Pengatur waktu dan pelacakan statistik

### Backend (PHP)
- Validasi pemindahan
- Pembuatan teka-teki dengan pengecekan kemungkinan penyelesaian
- Manajemen statistik
- Pelacakan papan peringkat

### Penyimpanan
- **LocalStorage** - Papan peringkat dan riwayat permainan di sisi klien
- **Berbasis file** - Penyimpanan statistik berbasis PHP opsional

## Statistik yang Dilacak

- Total pertandingan yang dimainkan
- Waktu penyelesaian terbaik
- Jumlah gerakan terbaik
- Waktu penyelesaian rata-rata
- Pergerakan rata-rata
- Riwayat papan peringkat lengkap

## Algoritma Permainan

### Pemeriksaan Keterpecahan
- Menerapkan algoritma penghitungan inversi untuk teka-teki berukuran ganjil
- Menggunakan algoritma posisi kosong untuk teka-teki berukuran genap

Jarak Manhattan
- Menghitung jumlah langkah teoritis minimum yang dibutuhkan
- Digunakan untuk penilaian tingkat kesulitan

### Mengacak Teka-Teki
- Menggunakan algoritma Fisher-Yates
- Memastikan konfigurasi yang valid dan dapat dipecahkan
- Jumlah pengacakan yang dapat disesuaikan untuk berbagai tingkat kesulitan

## Penggunaan

1. Buka `index.html` di peramban web.
2. Pilih ukuran grid yang Anda inginkan (2x2 hingga 10x10)
3. Pilih mode permainan dan tingkat kesulitan
4. Klik "Permainan Baru" untuk memulai.
5. Klik ubin atau gunakan tombol panah untuk bergerak
6. Selesaikan teka-teki untuk menang!

## Kompatibilitas Browser

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Titik Akhir API (PHP)

- `api.php?action=generatePuzzle` - Buat teka-teki baru
- `api.php?action=validateMove` - Validasi perpindahan
- `api.php?action=isSolved` - Periksa apakah teka-teki sudah terpecahkan
- `api.php?action=getStats` - Dapatkan statistik permainan
- `api.php?action=saveResult` - Simpan hasil permainan
- `api.php?action=calculateMinMoves` - Menghitung jumlah langkah minimum

## Peningkatan di Masa Depan

- [ ] Fungsi Undo/Redo
- [ ] Riwayat pemindahan
- [ ] Mode multipemain
- [ ] Gambar teka-teki khusus
- [ ] Efek suara dan musik
- [ ] Prestasi dan lencana
- [ ] Papan peringkat global (berbasis server)
- [ ] Demonstrasi pemecah masalah AI
- [ ] Kustomisasi tema
- [ ] Berbagai bahasa

## Lisensi

Sumber terbuka - Silakan gunakan dan modifikasi!

## Berkontribusi

Jangan ragu untuk mengirimkan pull request dengan perbaikan, perbaikan bug, atau fitur baru.



