# Social Video Downloader (X & Instagram)

A simple web application to download high-quality videos from X (Twitter) and Instagram.

## 🚀 Features

- **High Quality Video Download**: Gets the best available resolution.
- **Multi-Platform**: Supports X (Twitter) and Instagram (Reels/Videos).
- **Ad-Free**: Direct video link extraction.
- **Video Preview**: Play video before downloading.
- **Modern UI**: Clean and responsive interface.

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express
- **Core**: `yt-dlp` (for video data extraction)

## 📋 Prerequisites

Before running this application, ensure you have installed:

1.  **Node.js**: [Download Node.js](https://nodejs.org/)
2.  **yt-dlp**: Command-line tool for downloading videos.
    - **macOS**: `brew install yt-dlp`
    - **Windows**: `winget install yt-dlp` or download binary from [GitHub yt-dlp](https://github.com/yt-dlp/yt-dlp).
    - **Linux**: `sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && sudo chmod a+rx /usr/local/bin/yt-dlp`

> **Important Note**: This app is configured to use cookies (if provided in `cookies.txt`) to access content. This is often required for age-restricted X content or some Instagram videos.

## 📦 Installation

1.  **Clone repository** (or download zip):
    ```bash
    git clone https://github.com/username/social_downloader.git
    cd social_downloader
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

4.  **(Optional) Setup Cookies**:
    - Export cookies from your browser for X.com and Instagram.com using an extension like "Get cookies.txt LOCALLY".
    - Save as `cookies.txt` in the project root folder.

5.  **Run server**:
    ```bash
    node server.js
    ```

6.  Open browser and access `http://localhost:3000`.

## ☁️ Deployment

### Render.com ⭐ (Recommended)
Render.com is great for this project with free tier **permanent** and `yt-dlp` binary support.

**Deploy Steps:**
1.  Login to [Render.com](https://render.com)
2.  Click **"New +"** → **"Web Service"**
3.  Connect GitHub and select repository.
4.  Render will automatically detect `render.yaml` and setup everything.
5.  Or manual setup:
    - **Name**: `social-video-downloader`
    - **Environment**: `Node`
    - **Build Command**: 
      ```bash
      curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /opt/render/project/src/yt-dlp && chmod a+rx /opt/render/project/src/yt-dlp && npm install
      ```
    - **Start Command**: `node server.js`

## 📝 License
ISC