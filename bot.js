const TelegramBot = require('node-telegram-bot-api');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

// Configuration
const token = process.env.BOT_TOKEN;
const webAppUrl = 'https://server.robsan.my.id/x/';
const downloadDir = path.join(__dirname, 'downloads');
const cookiesPath = path.join(__dirname, 'cookies.txt');

// AI Configuration
const AI_API_URL = 'https://ai.sumopod.com/v1/chat/completions';
const AI_API_KEY = process.env.AI_API_KEY;
const AI_MODEL = 'gpt-4o-mini';

// Ensure download directory exists
if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir);
}

// Create bot
const bot = new TelegramBot(token, { polling: true });
console.log('Telegram Bot is starting...');

// Regex to match X/Twitter and Instagram links
const urlRegex = /https?:\/\/(www\.)?(twitter\.com|x\.com|instagram\.com)\/[^\s]+/;

// --- Handle Incoming Messages ---
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    console.log(`[DEBUG] Received from ${chatId}: ${text}`);

    if (!text) return;

    // 1. Handle /start command
    if (text === '/start') {
        return bot.sendMessage(chatId, "👋 Welcome! I am RobSan Social Bot.\n\n🔗 Send me an X/Twitter or Instagram link to download video.\n💬 Or just chat with me, I'm powered by AI!");
    }

    // 2. Handle X/Twitter URLs
    const match = text.match(urlRegex);
    console.log(`[DEBUG] Regex match: ${match ? 'FOUND' : 'NOT FOUND'}`);
    if (match) {
        const fullUrl = match[0];
        console.log(`[DEBUG] Full URL: ${fullUrl}`);
        // Clean URL to fit within Telegram's 64-byte callback_data limit
        const cleanUrl = fullUrl.split('?')[0];
        console.log(`[DEBUG] Clean URL: ${cleanUrl}`);
        const deepLink = `${webAppUrl}?url=${encodeURIComponent(cleanUrl)}`;

        console.log(`[DEBUG] Attempting to send message with buttons...`);
        return bot.sendMessage(chatId, "🎥 *Video Detected!* \n\nChoose an option:", {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '🔗 Watch on Web', url: deepLink },
                        { text: '📥 Send to Chat', callback_data: `dl_${cleanUrl}` }
                    ]
                ]
            }
        }).catch(err => console.error("Telegram API Error:", err.message));
    }

    // 3. Handle General Chat (AI Fallback)
    // Show a typing indicator so user knows we are thinking
    bot.sendChatAction(chatId, 'typing');

    try {
        const aiResponse = await axios.post(AI_API_URL, {
            model: AI_MODEL,
            messages: [
                {
                    role: "system",
                    content: "You are RobSan Social Bot, a sleek Gen Z AI assistant. You are polite, chill, love to joke, and keep things low-key and fun using emojis. Your main gig is helping users download X (Twitter) and Instagram videos.\n\nKey Info:\n1. To download, users just need to drop an X.com or Instagram link.\n2. If a video is over 50MB, tell them you gave them a Web Link because Telegram limits file uploads.\n3. If a download fails, it might be age-restricted or private.\n\nStay helpful, concise, and witty. No cap."
                },
                {
                    role: "user",
                    content: text
                }
            ],
            max_tokens: 300,
            temperature: 0.7
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AI_API_KEY}`
            }
        });

        if (aiResponse.data && aiResponse.data.choices && aiResponse.data.choices.length > 0) {
            const reply = aiResponse.data.choices[0].message.content;
            bot.sendMessage(chatId, reply);
        } else {
            bot.sendMessage(chatId, "I'm not sure what to say to that.");
        }

    } catch (error) {
        console.error("AI API Error:", error.response ? error.response.data : error.message);
        bot.sendMessage(chatId, "Thinking hard... but my brain froze. 🧊 (AI Error)");
    }
});
// --- Handle Button Clicks ---
bot.on('callback_query', async (callbackQuery) => {
    const messageId = callbackQuery.message.message_id;
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    // We only care about "dl_" actions
    if (!data.startsWith('dl_')) return;

    // Acknowledge the button press so the loading circle stops
    bot.answerCallbackQuery(callbackQuery.id);

    // Extract URL (everything after "dl_")
    const videoUrl = data.substring(3);

    // 1. Notify user: Downloading
    bot.editMessageText("⏳ *Processing...* \nDownloading video to server (this may take a moment).", {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'Markdown'
    });

    // Unique filename based on timestamp
    const filename = `video_${Date.now()}.mp4`;
    const filePath = path.join(downloadDir, filename);

    // 2. Execute yt-dlp command
    // -f "best[height<=480][ext=mp4]/best[ext=mp4]" : Limit to 480p for stability
    // --no-part : Write directly to file (saves disk IO)
    // --no-playlist : Ensure single video
    const command = `yt-dlp --cookies "${cookiesPath}" -f "best[height<=480][ext=mp4]/best[ext=mp4]" --no-part --no-playlist -o "${filePath}" "${videoUrl}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Download error: ${error.message}`);
            return bot.editMessageText("❌ *Error:* Could not download video. \nIt might be deleted or unsupported.", {
                chat_id: chatId,
                message_id: messageId,
                parse_mode: 'Markdown'
            });
        }

        // 3. Check file size (Telegram Limit: 50MB = 52428800 bytes)
        fs.stat(filePath, (err, stats) => {
            if (err) {
                console.error("File stat error:", err);
                return;
            }

            const fileSizeInBytes = stats.size;
            const fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);

            if (fileSizeInMegabytes > 49.5) {
                // Too big
                bot.editMessageText(`⚠️ *File Too Large* (${fileSizeInMegabytes.toFixed(1)} MB)\n\nTelegram bots can only upload files under 50MB.\nPlease use the *Watch on Web* link below.`, {
                    chat_id: chatId,
                    message_id: messageId,
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [[{ text: '🔗 Watch on Web', url: `${webAppUrl}?url=${encodeURIComponent(videoUrl)}` }]]
                    }
                });
                // Delete local file
                fs.unlinkSync(filePath);
            } else {
                // 4. Send Video
                bot.editMessageText("🚀 *Launch sequence initiated...* \nUploading to Telegram!", {
                    chat_id: chatId,
                    message_id: messageId,
                    parse_mode: 'Markdown'
                });

                bot.sendVideo(chatId, filePath, {
                    caption: 'Here is your video! 📥\n_Powered by @robsanxbot_',
                    parse_mode: 'Markdown'
                }).then(() => {
                    // Success: Delete file
                    fs.unlinkSync(filePath);
                    // Update the status message to "Done" or delete it? Let's just say Done.
                    bot.editMessageText("✅ *Sent!*", {
                        chat_id: chatId,
                        message_id: messageId,
                        parse_mode: 'Markdown'
                    });
                }).catch((err) => {
                    console.error("Telegram Upload Error:", err);
                    bot.sendMessage(chatId, "❌ Error uploading video to Telegram.");
                    fs.unlinkSync(filePath); // Cleanup even on error
                });
            }
        });
    });
});

bot.on('polling_error', (error) => {
    // Ignore harmless connection resets
    if (error.code !== 'EFATAL') {
        console.log(`[polling_error] ${error.code}: ${error.message}`);
    }
});