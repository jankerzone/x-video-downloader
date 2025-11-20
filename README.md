# X Video Downloader

Aplikasi web sederhana untuk mengunduh video dari X (Twitter) dengan kualitas tinggi.

## 🚀 Fitur

- **Download Video Berkualitas Tinggi**: Mendapatkan resolusi terbaik yang tersedia.
- **Tanpa Iklan**: Mengambil link video langsung.
- **Preview Video**: Putar video sebelum mengunduh.
- **UI Modern**: Desain antarmuka yang bersih dan responsif.

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express
- **Core**: `yt-dlp` (untuk ekstraksi data video)

## 📋 Prasyarat

Sebelum menjalankan aplikasi ini, pastikan Anda telah menginstal:

1.  **Node.js**: [Download Node.js](https://nodejs.org/)
2.  **yt-dlp**: Tool command-line untuk mengunduh video.
    - **macOS**: `brew install yt-dlp`
    - **Windows**: `winget install yt-dlp` atau download binary dari [GitHub yt-dlp](https://github.com/yt-dlp/yt-dlp).
    - **Linux**: `sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && sudo chmod a+rx /usr/local/bin/yt-dlp`

> **Catatan Penting**: Aplikasi ini saat ini dikonfigurasi untuk menggunakan cookies dari browser Chrome lokal (`--cookies-from-browser chrome`) untuk mengakses konten. Ini mungkin perlu disesuaikan untuk lingkungan server/hosting.

## 📦 Instalasi

1.  **Clone repository** (atau download zip):
    ```bash
    git clone https://github.com/username/x_workaround.git
    cd x_workaround
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Jalankan server**:
    ```bash
    node server.js
    ```

4.  Buka browser dan akses `http://localhost:3000`.

## ☁️ Deployment

### GitHub
1.  Inisialisasi git: `git init`
2.  Add files: `git add .`
3.  Commit: `git commit -m "Initial commit"`
4.  Buat repository baru di GitHub.
5.  Link remote: `git remote add origin https://github.com/USERNAME/REPO_NAME.git`
6.  Push: `git push -u origin main`

### Vercel (Perhatian!)
Aplikasi ini menggunakan `child_process` untuk memanggil binary `yt-dlp` eksternal. **Ini tidak akan berjalan secara langsung di Vercel Serverless Functions standar** karena:
1.  Binary `yt-dlp` tidak tersedia di environment Vercel secara default.
2.  Flag `--cookies-from-browser chrome` tidak akan berfungsi di server cloud karena tidak ada browser Chrome yang terinstall/login.

**Solusi Alternatif untuk Hosting:**
- Gunakan VPS (DigitalOcean, Linode) atau layanan PaaS yang mendukung Docker/Binary seperti **Railway** atau **Render**.
- Jika tetap ingin di Vercel, Anda perlu mengonfigurasi build step khusus untuk mengunduh binary `yt-dlp` dan menangani cookies secara manual (misalnya lewat file cookies.txt), namun ini memerlukan konfigurasi tingkat lanjut.
