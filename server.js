const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Explicitly serve index.html for root path to fix "Cannot GET /"
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/info', (req, res) => {
    const url = req.query.url;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    // Expanded validation for X/Twitter and Instagram URLs
    const urlRegex = /^https?:\/\/(www\.)?(twitter\.com|x\.com|instagram\.com)\/.+/;
    if (!url.match(urlRegex)) {
        return res.status(400).json({ error: 'Invalid URL. Only X (Twitter) and Instagram links are supported.' });
    }

    console.log(`Fetching info for: ${url}`);

    // Use cookies from file to handle sensitive content / age-gated videos
    // Check if cookies.txt exists, otherwise run without cookies
    const fs = require('fs');
    const cookiesPath = path.join(__dirname, 'cookies.txt');
    const cookiesExist = fs.existsSync(cookiesPath);

    const ytDlpArgs = ['-j'];
    if (cookiesExist) {
        ytDlpArgs.push('--cookies', cookiesPath);
    }
    ytDlpArgs.push(url);

    // Check for local binary in Render environment
    const localBinaryPath = path.join(__dirname, 'yt-dlp');
    const binary = fs.existsSync(localBinaryPath) ? localBinaryPath : 'yt-dlp';

    console.log(`Using yt-dlp binary at: ${binary}`);
    const ytDlp = spawn(binary, ytDlpArgs);
    let stdoutData = '';
    let stderrData = '';

    ytDlp.stdout.on('data', (data) => {
        stdoutData += data;
    });

    ytDlp.stderr.on('data', (data) => {
        stderrData += data;
    });

    ytDlp.on('close', (code) => {
        if (code !== 0) {
            console.error(`yt-dlp process exited with code ${code}`);
            console.error(`stderr: ${stderrData}`);
            // Provide a more user-friendly error if possible, but keep details for debugging
            return res.status(500).json({ error: 'Failed to fetch video info. The link might be private or deleted.', details: stderrData });
        }

        try {
            const videoInfo = JSON.parse(stdoutData);

            // Filter for mp4 formats and sort by quality (height)
            // Instagram formats might lack vcodec/acodec info, so we relax the check for it
            const formats = (videoInfo.formats || [])
                .filter(f => (f.ext === 'mp4' || f.video_ext === 'mp4') && f.protocol !== 'm3u8_native')
                .sort((a, b) => (b.height || 0) - (a.height || 0));

            // Fallback logic
            let bestFormat = formats[0];
            let downloadUrl = bestFormat ? bestFormat.url : null;

            // Check root level properties if no format url found
            if (!downloadUrl) {
                if (videoInfo.url && (videoInfo.ext === 'mp4' || videoInfo.video_ext === 'mp4')) {
                    downloadUrl = videoInfo.url;
                } else if (videoInfo.video_url) {
                    downloadUrl = videoInfo.video_url;
                }
            }

            if (!downloadUrl) {
                return res.status(404).json({ error: 'No suitable video format found' });
            }

            res.json({
                title: videoInfo.title || 'Video', // Instagram titles can be null or captions
                thumbnail: videoInfo.thumbnail,
                duration: videoInfo.duration,
                downloadUrl: downloadUrl,
                formats: formats.map(f => ({
                    height: f.height,
                    width: f.width,
                    url: f.url,
                    filesize: f.filesize
                }))
            });

        } catch (e) {
            console.error('Failed to parse yt-dlp output', e);
            res.status(500).json({ error: 'Failed to parse video info' });
        }
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
