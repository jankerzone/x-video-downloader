document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('urlInput');
    const downloadBtn = document.getElementById('downloadBtn');
    const errorMessage = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    const loader = document.getElementById('loader');
    const resultCard = document.getElementById('result');
    const videoPlayer = document.getElementById('videoPlayer');
    const videoTitle = document.getElementById('videoTitle');
    const videoDuration = document.getElementById('videoDuration');
    const downloadLink = document.getElementById('downloadLink');
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    const formatsContainer = document.getElementById('formatsContainer');

    downloadBtn.addEventListener('click', handleDownload);
    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleDownload();
    });

    async function handleDownload() {
        const url = urlInput.value.trim();

        if (!url) {
            showError('Please enter a valid URL');
            return;
        }

        // Reset state
        hideError();
        resultCard.classList.add('hidden');
        loader.classList.remove('hidden');
        downloadBtn.disabled = true;
        videoPlayer.pause();
        videoPlayer.src = '';

        try {
            const response = await fetch(`api/info?url=${encodeURIComponent(url)}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch video');
            }

            displayResult(data);

        } catch (err) {
            showError(err.message);
        } finally {
            loader.classList.add('hidden');
            downloadBtn.disabled = false;
        }
    }

    function displayResult(data) {
        videoTitle.textContent = data.title || 'Video';
        videoPlayer.src = data.downloadUrl;
        videoPlayer.poster = data.thumbnail || '';

        // Format duration
        if (data.duration) {
            const minutes = Math.floor(data.duration / 60);
            const seconds = Math.floor(data.duration % 60);
            videoDuration.innerHTML = `<i class="fa-regular fa-clock"></i> ${minutes}:${seconds.toString().padStart(2, '0')}`;
        } else {
            videoDuration.innerHTML = '';
        }

        downloadLink.href = data.downloadUrl;

        // Setup copy link button
        copyLinkBtn.onclick = () => {
            navigator.clipboard.writeText(data.downloadUrl);
            const originalText = copyLinkBtn.innerHTML;
            copyLinkBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
            setTimeout(() => {
                copyLinkBtn.innerHTML = originalText;
            }, 2000);
        };

        // Render formats
        formatsContainer.innerHTML = '';
        if (data.formats && data.formats.length > 0) {
            data.formats.forEach(format => {
                const chip = document.createElement('a');
                chip.href = format.url;
                chip.target = '_blank';
                chip.className = 'format-chip';
                chip.textContent = `${format.height}p`;
                formatsContainer.appendChild(chip);
            });
        }

        resultCard.classList.remove('hidden');
    }

    function showError(msg) {
        errorText.textContent = msg;
        errorMessage.classList.remove('hidden');
    }

    function hideError() {
        errorMessage.classList.add('hidden');
    }

    // Check for URL parameter on load
    const urlParams = new URLSearchParams(window.location.search);
    const sharedUrl = urlParams.get('url');
    if (sharedUrl) {
        urlInput.value = sharedUrl;
        // Small delay to ensure UI is ready and provide visual cue
        setTimeout(() => {
            handleDownload();
        }, 500);
    }
});
