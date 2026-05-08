# lucy-writer
Fully autonomous tech-blog writing agent for openclaw. Scrapes web references, generates SEO-friendly articles using a multi-layer LLM failover (Gemini/Ollama), creates dynamic branded thumbnails via Canvas &amp; AI, and publishes automatically via API.

🤖 Lucy Writer (v2.2.0)
Lucy Writer adalah alat otomasi penulisan blog teknologi yang sepenuhnya otonom. Dirancang untuk efisiensi tinggi, Lucy mengekstrak konten dari URL referensi, menyintesisnya menjadi artikel SEO yang natural menggunakan sistem triple-layer failover, menghasilkan thumbnail dinamis dengan desain flat, dan langsung mempublikasikannya ke CMS Anda melalui API.

🚀 Fitur Utama
Smart Scraping: Melewati proteksi anti-bot dasar untuk mengambil data dari sumber referensi.

Triple-Layer LLM Failover: Ketahanan sistem maksimal. Jika API utama sibuk, Lucy beralih ke model cadangan atau lokal.

Dynamic Visuals: Pembuatan thumbnail otomatis menggunakan HTML5 Canvas yang digabungkan dengan AI (Pollinations) atau Stock Photo (Pexels).

Anti-Hallucination: Generasi teks yang berdasar (grounded) hanya pada fakta yang ditemukan di sumber referensi.

Humanized SEO: Gaya bahasa santai ala antusias teknologi di Discord, menghindari klise AI yang kaku.

🛠 Setup & Instalasi
1. Dependensi Sistem
Karena proyek ini menggunakan node-canvas untuk pembuatan gambar, kamu perlu menginstal library grafis di sistemmu.

Untuk pengguna macOS (via Homebrew):

Bash
brew install pkg-config cairo pango libpng jpeg giflib librsvg pixman

2. Instalasi Project
Bash
# Clone repositori
git clone https://github.com/reggi49/lucy-writer.git
cd lucy-writer

# Instal dependensi Node.js
npm install

3. Konfigurasi Environment
Buat file .env di root direktori dan masukkan API key kamu:

Code snippet
GEMINI_API_KEY=your_gemini_key_here
POLLINATIONS_KEY=your_pollinations_key_here
PEXELS_KEY=your_pexels_key_here
SECRET_KEY=your_cms_secret_key_here
API_ENDPOINT=https://yourdomain.com/api/posts/lucy
Ollama_URL=http://localhost:11434/api/generate

🏗 Arsitektur Failover
Lucy Writer dibangun dengan prinsip resiliensi.

Penulisan Teks (Text Engine)
Primary: gemini-2.5-flash (Cepat & cerdas).

Secondary: gemini-2.5-flash-lite (Aktif saat terkena rate limit 429).

Offline Fallback: Local Ollama (Misal: qwen3.5:9b) untuk keadaan tanpa internet/API mati.

Thumbnail (Image Engine)
Layer 1: Kombinasi Dynamic Canvas + Pollinations AI (Flux Model).

Layer 2: Pexels API dengan Overlay Tipografi (Jika AI gagal).

Layer 3: Placeholder Base64 (Mencegah error pada database).

💻 Penggunaan
Jalankan script melalui CLI dengan argumen berikut:

Bash
node index.js --topic "Cara Setup DualSense di PC" --category "tech-tutorial" --targetUrls "https://example.com/ref1,https://example.com/ref2"
Parameter:

--topic: Keyword utama dan konteks judul.

--category: ID kategori pada CMS target Anda.

--targetUrls: Daftar URL referensi (pisahkan dengan koma).

📝 Aturan Konten & SEO
Formatting: Menggunakan Markdown murni (tables untuk spek teknis, code fences untuk kode).

Tone: Menghindari kata-kata "AI-ism" seperti "In this digital era" atau "Crucial".

Security: Scraper menggunakan header Chrome/macOS modern. Parsing dilakukan secara aman via JSDOM tanpa mengeksekusi JavaScript dari sumber.

📄 Lisensi
Distribusi di bawah lisensi MIT. Dibuat oleh Muhamad Reggi.
