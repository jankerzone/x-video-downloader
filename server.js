const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());

app.get('/api/info', (req, res) => {
    const url = req.query.url;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    // Basic validation for X.com / Twitter.com URLs
    if (!url.match(/^https?:\/\/(www\.)?(twitter|x)\.com\/.+/)) {
        return res.status(400).json({ error: 'Invalid X/Twitter URL' });
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
            return res.status(500).json({ error: 'Failed to fetch video info', details: stderrData });
        }

        try {
            const videoInfo = JSON.parse(stdoutData);

            // Filter for mp4 formats and sort by quality (height)
            const formats = videoInfo.formats
                .filter(f => f.ext === 'mp4' && f.vcodec !== 'none' && f.acodec !== 'none')
                .sort((a, b) => (b.height || 0) - (a.height || 0));

            const bestFormat = formats[0];

            if (!bestFormat) {
                return res.status(404).json({ error: 'No suitable video format found' });
            }

            res.json({
                title: videoInfo.title,
                thumbnail: videoInfo.thumbnail,
                duration: videoInfo.duration,
                downloadUrl: bestFormat.url,
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
