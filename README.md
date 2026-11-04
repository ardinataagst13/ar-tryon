# AR Virtual Try-On (Katalog Kacamata & Topi 3D)
> **Tugas Kelompok AR/VR Innovation Project 2026**  
> **Tema:** Membangun Pengalaman Digital Interaktif untuk Menyelesaikan Permasalahan Nyata  
> **Proyek No. 6:** AR Virtual Try-On atau Katalog Produk (WebAR)

---

## 📱 Ringkasan Proyek
Aplikasi **WebAR Virtual Try-On** yang memungkinkan pengguna mencoba kacamata dan topi secara virtual langsung melalui browser smartphone (Chrome/Safari) tanpa perlu install aplikasi native.

### Fitur Utama:
1. **Real-time Face Tracking (WebAR):** Menggunakan library MindAR.js (MediaPipe 468-point FaceMesh) untuk melacak posisi hidung dan kepala secara akurat.
2. **Katalog Produk Interaktif:**
   - Kategori Kacamata (Anchor Batang Hidung).
   - Kategori Topi (Anchor Dahi/Puncak Kepala).
   - Mode Combo (Mencoba kacamata & topi secara bersamaan).
3. **Informasi Produk Lengkap:** Nama barang, harga UMKM, deskripsi, dan badge keaslian.
4. **Fitur Kalibrasi Posisi:** Pengguna dapat menyesuaikan ukuran (*scale*) dan posisi vertikal (*Y-offset*) sesuai bentuk wajah masing-masing.
5. **Fitur Snapshot (Ambil Foto):** Pengguna dapat mengambil foto hasil try-on dan menyimpannya ke galeri ponsel.
6. **Smart Fallback 3D:** Sudah dilengkapi model 3D prosedural otomatis jika aset `.glb` belum diunggah, sehingga aplikasi langsung bisa diuji coba kapan saja.

---

## 📂 Struktur Direktori
```text
ARTryOn/
├── assets/
│   └── models/               <-- Letakkan file 3D kustom kamu di sini (.glb)
│       ├── glasses1.glb
│       ├── glasses2.glb
│       ├── glasses3.glb
│       ├── hat1.glb
│       └── hat2.glb
├── index.html                <-- Tampilan antarmuka (Tailwind CSS)
├── style.css                 <-- Penyesuaian layout kamera & animasi
├── main.js                   <-- Logika WebAR, Three.js, dan interaksi katalog
└── README.md
```

---

## 🎨 Cara Memasang Model 3D Sendiri (.glb)
1. Siapkan file model 3D dalam format `.glb`.
2. Simpan file tersebut ke dalam folder: `assets/models/`
3. Beri nama file sesuai dengan daftar di `main.js`:
   - `glasses1.glb` (Kacamata 1)
   - `glasses2.glb` (Kacamata 2)
   - `glasses3.glb` (Kacamata 3)
   - `hat1.glb` (Topi 1)
   - `hat2.glb` (Topi 2)
*(Jika nama file berbeda, cukup ubah `modelPath` pada array `PRODUCTS` di dalam file `main.js`).*

---

## 🚀 Cara Menjalankan Secara Lokal (Laptop)
Karena aplikasi mengakses kamera, browser membutuhkan server lokal (bukan sekadar `file://`):

### Opsi 1: Menggunakan VS Code Live Server
1. Pasang extension **Live Server** di VS Code.
2. Klik kanan `index.html` -> Pilih **Open with Live Server**.

### Opsi 2: Menggunakan Node.js / NPX
Jalankan perintah berikut di terminal:
```bash
npx serve .
```
Buka browser di `http://localhost:3000`.

---

## 🌐 Cara Hosting Agar Bisa Dibuka di Smartphone (Wajib HTTPS)
Browser smartphone hanya mengizinkan akses kamera jika website menggunakan protokol aman (**HTTPS**).

### Pilihan Paling Mudah: Vercel (Gratis & 1 Menit Selesai)
1. Unggah folder proyek ini ke repositori **GitHub**.
2. Buka [vercel.com](https://vercel.com) dan login dengan akun GitHub.
3. Klik **Add New Project** -> Impor repositori `ARTryOn`.
4. Klik **Deploy**.
5. Kamu akan mendapatkan link HTTPS (contoh: `https://ar-tryon.vercel.app`).
6. Ubah link tersebut menjadi **QR Code** (via [qr-code-generator.com](https://www.qr-code-generator.com/)).
7. Saat presentasi di kelas, dosen dan audiens cukup scan QR Code tersebut dengan kamera HP untuk langsung mencoba!
