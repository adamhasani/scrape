const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// Aktifin mode siluman biar ga kena blokir Cloudflare
puppeteer.use(StealthPlugin());

const app = express();
app.use(express.json());

app.get('/generate', async (req, res) => {
    const prompt = req.query.prompt;
    if (!prompt) return res.status(400).json({ error: "Isi prompt-nya dulu woi di ?prompt=" });

    let browser;
    try {
        console.log("Buka browser siluman...");
        // Settingan wajib buat deploy di server gratisan (Render/Koyeb)
        browser = await puppeteer.launch({ 
            headless: true, 
            args: ['--no-sandbox', '--disable-setuid-sandbox'] 
        });
        
        const page = await browser.newPage();
        
        // Contoh: Buka web AI gratisan target lu
        console.log("Otw ke web target...");
        await page.goto('https://namapage-ai-video-gratisan.com', { waitUntil: 'networkidle2' });

        // Ngetik prompt otomatis ke form input webnya
        console.log("Ngetik prompt...");
        await page.type('input[placeholder="Enter your prompt"]', prompt); // Ganti selector input-nya sesuai web target

        // Ngeklik tombol generate
        console.log("Klik tombol generate, tungguin rendering...");
        await page.click('button[type="submit"]'); // Ganti selector tombolnya

        // Nungguin elemen video atau link download muncul (misal nunggu tag <video> keluar)
        await page.waitForSelector('video source', { timeout: 120000 }); // Nunggu maksimal 2 menit

        // Colong link videonya
        const videoUrl = await page.$eval('video source', el => el.src);

        res.json({
            status: "sukses",
            prompt: prompt,
            video_url: videoUrl
        });

    } catch (error) {
        res.status(500).json({ error: "Gagal nembus bang", detail: error.message });
    } finally {
        if (browser) await browser.close();
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Mesin siluman ready di port ${PORT}`);
});
