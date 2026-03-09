const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

app.get('/scrape', async (req, res) => {
    // Ngambil link dari query URL (contoh: /scrape?url=https://webnya.com)
    const targetUrl = req.query.url;

    if (!targetUrl) {
        return res.status(400).json({ error: "Kasih link targetnya dulu dong bang di parameter ?url=" });
    }

    try {
        const { data } = await axios.get(targetUrl);
        const $ = cheerio.load(data);
        
        let hasil = [];
        
        // CONTOH: Ngambil semua teks dari tag <title> dan <h1>. 
        // Nanti ini tinggal disesuaikan sama struktur HTML web target lu
        const judulWeb = $('title').text();
        $('h1').each((i, el) => {
            hasil.push($(el).text().trim());
        });

        res.json({
            target: targetUrl,
            judul: judulWeb,
            data_h1: hasil
        });

    } catch (error) {
        res.status(500).json({ error: "Gagal nge-scrape nih", detail: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Scraper ready bang di port ${PORT}`);
});
