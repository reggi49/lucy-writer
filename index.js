require('dotenv').config({ path: '/root/.openclaw/.env' });

const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require('axios');
const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');
const { createCanvas, loadImage } = require('canvas');

async function executeGemini(args) {
    const { topic, category, targetUrls } = args;

    // ==========================================
    // ⚙️ KONFIGURASI API & ENVIRONMENT
    // ==========================================
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const POLLINATIONS_KEY = process.env.POLLINATIONS_KEY;
    const PEXELS_KEY = process.env.PEXELS_KEY;
    const SECRET_KEY = process.env.SECRET_KEY;

    const API_ENDPOINT = process.env.API_ENDPOINT;
    const OLLAMA_URL = process.env.OLLAMA_URL;

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    console.log(`\n🚀 [START] Lucy v2.2 (Ultimate Workflow) untuk: "${topic}"`);
    console.time("Total-Runtime");

    try {
        // ==========================================
        // 1. TAHAP SCRAPING DATA REFERENSI
        // ==========================================
        const urlList = targetUrls.split(',').map(url => url.trim());
        let combinedCleanText = "";
        let urlReferences = "";

        console.log(`\n🔗 [SCRAPE] Memproses ${urlList.length} sumber...`);
        for (let i = 0; i < urlList.length; i++) {
            try {
                const res = await axios.get(urlList[i], {
                    timeout: 20000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
                        'Accept-Encoding': 'gzip, deflate, br',
                        'Connection': 'keep-alive',
                        'Upgrade-Insecure-Requests': '1',
                        'Sec-Fetch-Dest': 'document',
                        'Sec-Fetch-Mode': 'navigate',
                        'Sec-Fetch-Site': 'none',
                        'Sec-Fetch-User': '?1',
                        'Cache-Control': 'max-age=0'
                    }
                });
                const doc = new JSDOM(res.data, { url: urlList[i] });
                const article = new Readability(doc.window.document).parse();
                if (article) {
                    combinedCleanText += `\n\n--- REF ${i + 1} ---\n${article.textContent}`;
                    urlReferences += `- ${urlList[i]}\n`; 
                }
                console.log(`   ✅ Scrape ${i + 1} Sukses.`);
            } catch (err) { console.error(`   ❌ Scrape ${i + 1} Gagal.`); }
        }

        if (!combinedCleanText) throw new Error("Semua target scraping gagal.");

        console.log(`\n🧠 [AI-TEXT] Memulai proses generasi konten...`);
        let aiResponse;
        let activeModel = "gemini-2.5-flash";

        const textPrompt = `Bertindaklah sebagai tech-blogger profesional. Tugas Anda adalah menulis artikel blog mendalam berdasarkan referensi yang diberikan.

        REFERENSI:
        ${combinedCleanText}

        TOPIK UTAMA (KEYWORD): ${topic}

        ========================
        MODE ANTI-HALUSINASI KETAT
        ========================
        Kamu WAJIB mengikuti langkah ini secara berurutan dalam pikiranmu sebelum menulis:
        1 — EKSTRAK: Ambil SEMUA fakta penting HANYA dari referensi tertulis.
        2 — VALIDASI: Pastikan tidak ada fakta dari luar teks, asumsi, atau angka karangan.
        3 — PENULISAN: Gunakan HANYA daftar fakta tervalidasi. 
        4 — DILARANG menggunakan em-dash (—). Gunakan tanda koma atau titik.
        5 — DILARANG menggunakan kata-kata AI yang "lebay" seperti: "cerdas", "memukau", "revolusioner", "solusi cerdas", "tidak diragukan lagi".
        6 — STORYTELLING: Gunakan kalimat aktif. Bayangkan Anda sedang menjelaskan tutorial ini kepada teman sesama gamer di Discord, bukan menulis jurnal ilmiah.
        7 — VARIASI: Campur kalimat pendek dan panjang agar tidak monoton.
       
        ========================
        ATURAN GAYA (HUMAN NATURAL)
        ========================
        - Gaya bahasa: tech blog Indonesia (seperti Kompas Tekno / Tech in Asia).
        - Variasikan panjang kalimat (kombinasi kalimat pendek dan panjang agar mengalir).
        - Hindari klise AI: DILARANG KERAS menggunakan frasa "Di era digital ini", "Tidak dapat dipungkiri", atau "Kesimpulannya".
        - Gunakan transisi paragraf yang natural, bukan template robot.

        ========================
        ATURAN SEO & STRUKTUR KONTEN
        ========================
        - Gunakan struktur Markdown (##, ###) untuk subjudul.
        - Gunakan **bold** HANYA untuk istilah penting di dalam konten.
        - Keyword "${topic}" WAJIB muncul secara natural di paragraf pertama.
        - TABEL: Jika terdapat data teknis, perbandingan, atau spek, WAJIB sajikan dalam Markdown Table.
        - KODE: Gunakan Markdown Code Fences (\\\`\\\`\\\`bash atau \\\`\\\`\\\`jsx). DILARANG keras menggunakan tag HTML <pre> atau <code>.
        - DILARANG menyertakan kutipan inline seperti [REF 1]. Rangkum data menjadi kalimat utuh.
        - Di akhir CONTENT, buat "## Referensi" dan cantumkan link ini:
        ${urlReferences}

        ========================
        FORMAT OUTPUT MUTLAK (SYSTEM RULES)
        ========================
        1. JANGAN gunakan bintang/bold (**) pada baris TITLE, META_DESC, TAGS, dan IMAGE_PROMPT.
        2. META_DESC WAJIB berupa teks murni (plain text), 1-2 kalimat UTUH yang SELESAI.

        Keluarkan output dengan format persis seperti ini:
        TITLE: [Judul Artikel]
        THUMB_TITLE: [Judul Gambar Sangat Singkat, Maks 40 Karakter]
        META_DESC: [Deskripsi SEO utuh]
        TAGS: [Tag1, Tag2]
        IMAGE_PROMPT: [Deskripsi visual spesifik dalam bahasa Inggris]
        IMAGE_KEYWORD: [Ekstrak 1-3 kata kunci benda utama dalam bahasa Inggris, misal: "ps5 controller", "motherboard", "server room"]
        CONTENT: [Isi artikel Markdown sesuai semua aturan di atas]`;

        try {
            console.log(`   🚀 Layer 1: Mencoba ${activeModel}...`);
            const result = await genAI.getGenerativeModel({ model: activeModel }).generateContent(textPrompt);
            aiResponse = await result.response.text();
            console.log(`   ✅ Layer 1 Sukses: Gemini 2.5 Flash berhasil merangkum.`);
        } catch (error) {
            const errMsg = error.message.toLowerCase();
            if (errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("503") || errMsg.includes("500") || errMsg.includes("demand") || errMsg.includes("unavailable") || errMsg.includes("fetch")) {
                activeModel = "gemini-2.5-flash-lite";
                console.warn(`   ⚠️ Layer 1 Gagal (Server Sibuk/Limit). Menunggu 5 detik ke ${activeModel}...`);
                await new Promise(resolve => setTimeout(resolve, 5000)); // Delay 5 detik

                try {
                    console.log(`   🔄 Layer 2: Mencoba ${activeModel}...`);
                    const resultLite = await genAI.getGenerativeModel({ model: activeModel }).generateContent(textPrompt);
                    aiResponse = await resultLite.response.text();
                    console.log(`   ✅ Layer 2 Sukses: Gemini Lite berhasil merangkum.`);
                } catch (liteError) {
                    console.warn(`   ⚠️ Layer 2 Gagal. Beralih ke Layer 3: Local Ollama (qwen3.5:9b)...`);
                    try {
                        const ollamaRes = await axios.post(OLLAMA_URL, {
                            model: 'qwen3.5:9b',
                            prompt: `TUGAS UTAMA: Ubah teks referensi menjadi artikel blog natural, tajam, dan SEO-friendly. Format: TITLE:, THUMB_TITLE:, META_DESC:, TAGS:, IMAGE_PROMPT:, IMAGE_KEYWORD:, CONTENT:. Topik: "${topic}". Referensi: ${combinedCleanText}`,
                            stream: false,
                            options: { num_ctx: 8192, temperature: 0.7 }
                        }, { timeout: 3000000 });

                        aiResponse = ollamaRes.data.response;
                        console.log(`   ✅ Layer 3 Sukses: Ollama menyelesaikan tugas.`);
                    } catch (ollamaError) {
                        throw new Error(`Semua layer AI gagal. Ollama: ${ollamaError.message}`);
                    }
                }
            } else {
                // Hanya lempar error jika masalahnya ada di konfigurasi (misal: API Key salah)
                throw error;
            }
        }

        // ==========================================
        // 3. PARSING DATA AI & SANITASI KODE
        // ==========================================
        let title = (aiResponse.match(/TITLE:\s*(.*)/i) || [null, topic])[1].trim();
        title = title.replace(/[*#"]/g, '').trim();

        let metaDesc = (aiResponse.match(/META_DESC:\s*(.*)/i) || [null, ""])[1].trim();
        metaDesc = metaDesc.replace(/[*#"]/g, '').trim();

        if (metaDesc.length > 0 && !matchPunctuation(metaDesc.slice(-1))) {
            const words = metaDesc.split(' ');
            words.pop();
            metaDesc = words.join(' ') + '...';
        }

        let tags = (aiResponse.match(/TAGS:\s*(.*)/i) || [null, "AI, Tech"])[1].trim();
        tags = tags.replace(/\*/g, '');

        let visualPrompt = (aiResponse.match(/IMAGE_PROMPT:\s*(.*)/i) || [null, topic])[1].trim();
        let content = (aiResponse.match(/CONTENT:([\s\S]*)/i) || [null, aiResponse])[1].trim();

        content = content.replace(/—/g, ', ');
        content = content.replace(/\[REF\s*\d+\]/gi, '');
        content = content.replace(/<pre>|<\/pre>|<code>|<\/code>/gi, '');
        
        // ==========================================
        // 4. GENERASI GAMBAR (TRIPLE-LAYER FAILOVER)
        // ==========================================
        console.log(`\n🎨 [IMAGE-ENGINE] Memulai pencarian visual (Target: 1400x700)...`);
        let imageBase64;
        let imageKeyword = (aiResponse.match(/IMAGE_KEYWORD:\s*(.*)/i) || [null, "technology device"])[1].trim();
        const thumbTitle = (aiResponse.match(/THUMB_TITLE:\s*(.*)/i) || [null, title])[1].trim();
        
        try {
            console.log(`   🚀 Layer 1: Pollinations (Flux Schnell)...`);
            imageBase64 = await generateDynamicThumbnail(thumbTitle, imageKeyword);
            console.log(`   ✅ Layer 1 Sukses: Gambar AI berhasil dibuat.`);
        } catch (fluxError) {
            console.warn(`   ⚠️ Layer 1 Gagal: ${fluxError.message}`);
            try {
                console.log(`   🖼️ Layer 2: Pexels Stock Photo...`);
                imageBase64 = await getPexelsImage(topic, PEXELS_KEY); // Perbaikan variabel API Key
                console.log(`   ✅ Layer 2 Sukses: Stok foto berhasil ditarik.`);
            } catch (pexelsError) {
                console.error(`   ⚠️ Layer 2 Gagal: ${pexelsError.message}`);
                console.log(`   ⬜ Layer 3: Memasang 1px Placeholder transparan.`);
                imageBase64 = "data:image/png;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
            }
        }

        // ==========================================
        // 5. PUBLISH KE DATABASE KODEABC
        // ==========================================
        let rawCategory = category ? category.replace(/["']/g, '').trim() : "technology";
        let finalCategoryId = rawCategory;

        const categoryMap = {
            "programming": "635692a2dbac7bb9ad31f00d",
            "technology": "635693c8dbac7bb9ad31f00e",
            "internet of things": "6387239b2b0055b07adc11ec",
            "iot": "6387239b2b0055b07adc11ec",
            "video": "63a1841a2df5e4a9c714422b"
        };

        const catKey = finalCategoryId.toLowerCase();
        if (categoryMap[catKey]) {
            finalCategoryId = categoryMap[catKey];
            console.log(`   🔀 Mengubah nama kategori "${rawCategory}" menjadi ID: ${finalCategoryId}`);
        }
        else if (!finalCategoryId.match(/^[0-9a-fA-F]{24}$/)) {
            console.log(`   ⚠️ Kategori "${rawCategory}" tidak valid/tidak dikenal. Dipaksa masuk ke Technology.`);
            finalCategoryId = "635693c8dbac7bb9ad31f00e";
        }

        const response = await axios.post(API_ENDPOINT, {
            title,
            description: metaDesc,
            content,
            categoryId: finalCategoryId, // <-- Gunakan finalCategoryId yang sudah kebal
            userId: '635def0b6094eb6d770dc213',
            imageBase64,
            tags
        }, {
            headers: { 'Authorization': `Bearer ${SECRET_KEY}` },
            timeout: 60000
        });

        if (response.data.success) console.log(`🎉 [DONE] Artikel "${title}" berhasil terbit!`);

    } catch (error) {
        console.error(`\n🚨 [FATAL ERROR] Prosedur dihentikan: ${error.message}`);
    } finally {
        console.log(`---`);
        console.timeEnd("Total-Runtime");
    }
}

// ==========================================
// 🛠️ HELPER FUNCTIONS
// ==========================================

async function generateFluxImage(prompt, apiKey) {
    const seed = Math.floor(Math.random() * 88888);
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1400&height=700&seed=${seed}&model=flux-schnell&nologo=true`;

    const response = await axios.get(url, {
        responseType: 'arraybuffer',
        headers: { 'Authorization': `Bearer ${apiKey}` },
        timeout: 25000
    });

    return `data:image/jpeg;base64,${Buffer.from(response.data, 'binary').toString('base64')}`;
}

async function getPexelsImage(query, apiKey) {
    if (!apiKey) throw new Error("Pexels API Key tidak tersedia.");

    const searchRes = await axios.get(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`, {
        headers: { 'Authorization': apiKey } // Perbaikan: menggunakan argument apiKey
    });

    if (!searchRes.data.photos || searchRes.data.photos.length === 0) {
        throw new Error("Pexels tidak menemukan gambar yang relevan.");
    }

    const rawUrl = searchRes.data.photos[0].src.original;
    const customSizeUrl = `${rawUrl}?auto=compress&cs=tinysrgb&w=1400&h=700&fit=crop`;

    const imgRes = await axios.get(customSizeUrl, { responseType: 'arraybuffer' });
    return `data:image/jpeg;base64,${Buffer.from(imgRes.data, 'binary').toString('base64')}`;
}

async function addTextOverlay(base64Image, titleText) {
    try {
        if (base64Image.includes("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7")) return base64Image;

        const img = await loadImage(base64Image);
        const canvas = createCanvas(img.width, img.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Overlay Gelap
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // --- LOGIKA DYNAMIC FONT ---
        let fontSize = 70; // Ukuran awal
        if (titleText.length > 60) fontSize = 50; // Jika sangat panjang, kecilkan
        if (titleText.length > 90) fontSize = 40;

        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const maxWidth = canvas.width - 200;
        const lineHeight = fontSize * 1.2; // Jarak baris proporsional

        const words = titleText.split(' ');
        let lines = [];
        let line = '';

        for (let n = 0; n < words.length; n++) {
            let testLine = line + words[n] + ' ';
            let metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && n > 0) {
                lines.push(line);
                line = words[n] + ' ';
            } else {
                line = testLine;
            }
        }
        lines.push(line);

        if (lines.length > 4) {
            lines = lines.slice(0, 4);
            lines[3] = lines[3].trim() + "..."; 
        }

        let startY = (canvas.height / 2) - ((lines.length - 1) * lineHeight) / 2;

        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i].trim(), canvas.width / 2, startY + (i * lineHeight));
        }

        return canvas.toDataURL('image/jpeg', 0.9);
    } catch (error) {
        return base64Image;
    }
}

async function getPollinationsAsset(keyword) {
    const prompt = `A clean, high-quality 3D render, sleek product shot, or technology icon of ${keyword}, minimalist tech aesthetic, isolated on a pure solid white background, highly detailed, centered, bright lighting, no humans, no faces, no people, no text, no watermark --ar 1:1`;    
    const seed = Math.floor(Math.random() * 88888);
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=600&height=600&seed=${seed}&model=flux-schnell&nologo=true`;

    const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 25000 });
    return `data:image/jpeg;base64,${Buffer.from(response.data, 'binary').toString('base64')}`;
}

async function generateDynamicThumbnail(titleText, aiKeyword) {
    try {
        const width = 1400;
        const height = 700;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // ==========================================
        // 1. BACKGROUND WARNA DINAMIS
        // ==========================================
        const palette = ['#A2D2FF', '#BDE0FE', '#CDB4DB', '#FFC8DD', '#FFAFCC', '#FDE2E4', '#E2ECE9', '#B7E4C7', '#95D5B2', '#D8F3DC', '#FAEDCD', '#F4D35E', '#FFD6A5', '#FFADAD', '#EAC4D5', '#DDEDEA', '#C3BEF0', '#F1C0E8', '#E0BBE4', '#F5E6CA', '#90E0EF', '#48CAE4', '#00B4D8', '#CAF0F8', '#ADE8F4', '#B8F2E6', '#AED9E0', '#5E60CE', '#64DFDF', '#80FFDB', '#FEC5BB', '#FCD5CE', '#FAE1DD', '#FFE5D9', '#D8E2DC', '#ECE4DB', '#FFE066', '#FFB703', '#FB8500', '#E76F51', '#2A9D8F', '#264653', '#6D597A', '#B56576', '#EAAC8B', '#84A59D', '#52796F', '#3D405B', '#81B29A', '#F2CC8F'];
        const bgColor = palette[Math.floor(Math.random() * palette.length)];
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);

        // ==========================================
        // 2. TATA LETAK DINAMIS (0=Kiri, 1=Kanan, 2=Tengah)
        // ==========================================
        const layoutMode = Math.floor(Math.random() * 3);
        let circleX, circleY, circleRadius, textX, align, maxWidth;

        if (layoutMode === 0) {
            align = 'left'; textX = 100; maxWidth = 700;
            circleX = width - 350; circleY = height / 2; circleRadius = 250;
        } else if (layoutMode === 1) {
            align = 'right'; textX = width - 100; maxWidth = 700;
            circleX = 350; circleY = height / 2; circleRadius = 250;
        } else {
            align = 'center'; textX = width / 2; maxWidth = 1100;
            circleX = width / 2; circleY = 250; circleRadius = 180;
        }

        // ==========================================
        // 3. GENERATE ASSET VIA POLLINATIONS & DYNAMIC SHAPES
        // ==========================================
        console.log(`   🎨 Meminta Flux AI membuat objek: "${aiKeyword}"...`);
        try {
            const assetBase64 = await getPollinationsAsset(aiKeyword);
            const assetImg = await loadImage(assetBase64);

            // Pilih bentuk secara acak (0 = Lingkaran, 1 = Diamond, 2 = Rounded Rectangle)
            const shapeMode = Math.floor(Math.random() * 3);

            ctx.save();
            ctx.beginPath();

            const size = circleRadius * 1.8; // Ukuran untuk kotak/diamond
            const x = circleX - (size / 2);
            const y = circleY - (size / 2);

            if (shapeMode === 0) {
                // SHAPE 0: LINGKARAN (Classic)
                ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2, true);
            }
            else if (shapeMode === 1) {
                // SHAPE 1: BELAH KETUPAT / DIAMOND (Techy)
                ctx.moveTo(circleX, circleY - circleRadius); // Puncak Atas
                ctx.lineTo(circleX + circleRadius, circleY); // Kanan
                ctx.lineTo(circleX, circleY + circleRadius); // Bawah
                ctx.lineTo(circleX - circleRadius, circleY); // Kiri
            }
            else {
                // SHAPE 2: KOTAK SUDUT MEMBULAT / SQUIRCLE (Modern UI Apple-style)
                const radiusX = 40; // Lengkungan sudut
                ctx.moveTo(x + radiusX, y);
                ctx.lineTo(x + size - radiusX, y);
                ctx.quadraticCurveTo(x + size, y, x + size, y + radiusX);
                ctx.lineTo(x + size, y + size - radiusX);
                ctx.quadraticCurveTo(x + size, y + size, x + size - radiusX, y + size);
                ctx.lineTo(x + radiusX, y + size);
                ctx.quadraticCurveTo(x, y + size, x, y + size - radiusX);
                ctx.lineTo(x, y + radiusX);
                ctx.quadraticCurveTo(x, y, x + radiusX, y);
            }

            ctx.closePath();

            // Terapkan masking
            ctx.clip();

            // Render gambar AI di dalam masking
            ctx.drawImage(assetImg, circleX - circleRadius, circleY - circleRadius, circleRadius * 2, circleRadius * 2);
            ctx.restore();

            // ==========================================
            // Gambar Garis Tepi (Stroke) Sesuai Bentuk Masking
            // ==========================================
            ctx.beginPath();
            if (shapeMode === 0) {
                ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2, true);
            } else if (shapeMode === 1) {
                ctx.moveTo(circleX, circleY - circleRadius);
                ctx.lineTo(circleX + circleRadius, circleY);
                ctx.lineTo(circleX, circleY + circleRadius);
                ctx.lineTo(circleX - circleRadius, circleY);
            } else {
                ctx.moveTo(x + 40, y);
                ctx.lineTo(x + size - 40, y);
                ctx.quadraticCurveTo(x + size, y, x + size, y + 40);
                ctx.lineTo(x + size, y + size - 40);
                ctx.quadraticCurveTo(x + size, y + size, x + size - 40, y + size);
                ctx.lineTo(x + 40, y + size);
                ctx.quadraticCurveTo(x, y + size, x, y + size - 40);
                ctx.lineTo(x, y + 40);
                ctx.quadraticCurveTo(x, y, x + 40, y);
            }
            ctx.closePath();

            // Style garis tepi putih tebal
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 15;
            ctx.stroke();

        } catch (e) {
            console.log(`   ⚠️ Gagal generate objek Pollinations. Error: ${e.message}`);
        }

        // ==========================================
        // 4. RENDER TEKS JUDUL PRESISI
        // ==========================================
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = align;
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)'; // Bayangan hitam transparan 40%
        ctx.shadowBlur = 15;                    // Ketebalan blur
        ctx.shadowOffsetX = 3;                  // Geser sedikit ke kanan
        ctx.shadowOffsetY = 3;                  // Geser sedikit ke bawah

        let fontSize = titleText.length > 60 ? 55 : 65;
        ctx.font = `bold ${fontSize}px sans-serif`;

        const words = titleText.split(' ');
        let lines = [], line = '';

        words.forEach(word => {
            let testLine = line + word + ' ';
            if (ctx.measureText(testLine).width > maxWidth) {
                lines.push(line);
                line = word + ' ';
            } else { line = testLine; }
        });
        lines.push(line);

        const lineHeight = fontSize * 1.3;
        let startY = layoutMode === 2 ? 500 : (height / 2) - ((lines.length - 1) * lineHeight) / 2;

        lines.forEach((l, i) => {
            ctx.fillText(l.trim(), textX, startY + (i * lineHeight));
        });

        return canvas.toDataURL('image/jpeg', 0.9);
    } catch (error) {
        console.error("   ❌ Gagal render dynamic thumbnail:", error.message);
        return null;
    }
}

function matchPunctuation(char) {
    return /[.,?!;:]/.test(char);
}

// ==========================================
// 💻 CLI HANDLER
// ==========================================
if (require.main === module) {
    const args = process.argv.slice(2).reduce((acc, arg, i, arr) => {
        if (arg.startsWith('--')) acc[arg.replace('--', '')] = arr[i + 1];
        return acc;
    }, {});

    if (!args.topic || !args.category || !args.targetUrls) {
        console.log("\n❌ Argumen tidak lengkap! Gunakan: node index.js --topic \"...\" --category \"...\" --targetUrls \"...\"");
        process.exit(1);
    }

    executeGemini(args).catch(err => {
        console.error("Critical Runtime Crash:", err);
        process.exit(1);
    });
}