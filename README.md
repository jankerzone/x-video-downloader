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
5.  Link remote: `git remote add origin https://github.com/jankerzone/x-video-downloader.git`
6.  Push: `git push -u origin main`

### Railway.app ⭐ (Recommended)
Railway sangat cocok untuk project ini karena support binary `yt-dlp` secara native.

**Langkah Deploy:**
1.  Login ke [Railway.app](https://railway.app)
2.  Klik **"New Project"** → **"Deploy from GitHub repo"**
3.  Pilih repository `jankerzone/x-video-downloader`
4.  Railway akan otomatis detect `nixpacks.toml` dan install `yt-dlp`
5.  Tunggu build selesai (~2-3 menit)
6.  Klik **"Generate Domain"** untuk mendapatkan URL publik
7.  Done! Aplikasi siap digunakan.

**Catatan:**
- File `nixpacks.toml` sudah dikonfigurasi untuk install `yt-dlp` otomatis
- Free tier Railway memberikan $5 credit/bulan (cukup untuk traffic ringan-sedang)
- Aplikasi akan sleep setelah tidak digunakan (cold start ~5-10 detik)

### Alternatif Lain
- **Render.com**: Free tier tersedia, setup mirip Railway
- **Fly.io**: Free tier generous, perlu konfigurasi Docker
- **VPS (DigitalOcean/Linode)**: Kontrol penuh, mulai dari $4-6/bulan
