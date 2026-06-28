// Shared ATS formatting directive injected into every Gemini prompt that
// generates or rewrites CV content. Centralizing the rules here avoids
// duplication across gemini-cv.ts, gemini-improve.ts, and
// gemini-cover-letter.ts, and guarantees a single source of truth for what
// "ATS-friendly" means in this project.

/**
 * Core ATS formatting rules for CV analysis and generation prompts.
 * Insert this block into the INSTRUCTIONS section of the prompt.
 */
export const ATS_FORMAT_DIRECTIVE = `
ATS-FRIENDLY FORMATTING RULES (MANDATORY):
- Single-column layout. NEVER use tables, icons, images, graphics, or dual-column layouts — they break ATS parsing.
- Use clear, standard section headings in this order (skip sections only when the source CV has zero relevant content):
  1. Kontak (nama, HP, email, kota, link portofolio/GitHub/LinkedIn)
  2. Profil Singkat / Ringkasan (2-4 kalimat: status, bidang, pengalaman utama, tujuan posisi)
  3. Pendidikan (jenjang jurusan | universitas (tahun) | IPK)
  4. Pengalaman Kerja (posisi | perusahaan/proyek (rentang waktu), bullet pencapaian)
  5. Proyek Unggulan (nama proyek (tech stack): deskripsi fitur utama + kontribusi)
  6. Keahlian Teknis (Tech Stack: bahasa, framework, database. Tools & Services: git, API, dll.)
  7. Sertifikasi & Penghargaan (sertifikat / juara / HKI (tahun))
  8. Publikasi (sitasi format ilmiah + DOI, jika ada)
  9. Bahasa (bahasa: level (skor jika ada))
- Every experience/project bullet MUST start with a strong action verb and surface real, quantified impact when the source CV has the numbers (e.g. "Membangun API REST yang melayani 5.000+ request/hari" or "Memimpin tim 9 orang, meraih Juara 2"). NEVER invent metrics the source does not contain — keep the bullet qualitative instead.
- Keep every bullet to ONE line. Be concise: a fresh-grad / entry CV should stay around one page. Cut filler, vague phrasing, and repetition.
- Integrate keywords relevant to the target role NATURALLY throughout the CV. Do NOT keyword-stuff.
- Preserve the candidate's original language (Bahasa Indonesia stays Indonesian).
`.trim()

/**
 * ATS rules subset for cover letter prompts — no section structure needed,
 * but the formatting and keyword integration rules still apply.
 */
export const ATS_COVER_LETTER_DIRECTIVE = `
ATS-FRIENDLY COVER LETTER RULES (MANDATORY):
- Single-column, plain text layout. No tables, icons, images, or graphics.
- Professional formal structure: addressee block, greeting, 3-4 body paragraphs, closing, signature.
- Reference concrete skills and achievements from the CV using strong action verbs and quantified results.
- Integrate keywords relevant to the target role naturally — do NOT keyword-stuff.
- Writing must be professional, confident (not arrogant), concise, and free of generic cliches.
- Preserve the candidate's original language (Bahasa Indonesia stays Indonesian).
`.trim()

/**
 * Reference CV structure template. Used in improve prompts to show the
 * model exactly what a well-structured ATS CV looks like.
 */
export const ATS_REFERENCE_TEMPLATE = `
ATS REFERENCE STRUCTURE (use as quality benchmark, adapt to the candidate's real content):
---
NAMA LENGKAP
Kontak: nomor HP | email | kota | link portofolio

PROFIL SINGKAT
2-4 kalimat: status (mhs/fresh grad/pro), bidang, pengalaman utama, dan tujuan posisi.

PENDIDIKAN
Jenjang Jurusan | Universitas (tahun) | IPK

PENGALAMAN KERJA
- Posisi | Perusahaan/Proyek (rentang waktu)
    * Bullet pencapaian (action verb + hasil/angka)
    * Bullet teknologi/dampak

PROYEK UNGGULAN
- Nama Proyek (Tech stack): deskripsi singkat fitur utama + kontribusi.

KEAHLIAN TEKNIS
- Tech Stack: bahasa, framework, database.
- Tools & Services: git, API, dll.

SERTIFIKASI & PENGHARGAAN
- Sertifikat / juara / HKI (tahun).

PUBLIKASI (jika ada)
- Sitasi format ilmiah + DOI.

BAHASA
- Bahasa: level (skor jika ada).
---
`.trim()

/**
 * A concrete, filled-in gold-standard ATS CV. Anonymized (fake identity) but
 * mirrors the structure, tone, and density of a strong one-page Indonesian
 * tech CV: bilingual headings, "Posisi | Perusahaan (rentang)", "IPK: x.x" in
 * detail, "Nama Proyek (Tech stack): deskripsi" + impact bullets, and a
 * publication citation with a DOI. Shown to the model as a worked example so it
 * matches this quality instead of inferring from an empty skeleton.
 */
export const ATS_GOLD_EXAMPLE = `
GOLD EXAMPLE (a strong, real-quality ATS CV — match this density and style, but use ONLY the candidate's own facts):
---
BUDI SANTOSA
Backend Developer
budi.santosa@example.com | +62 812 0000 0000 | Bandung, Jawa Barat | github.com/budisantosa

PROFIL SINGKAT (PROFILE)
Mahasiswa Teknologi Informasi semester 6 dengan pengalaman hands-on di pengembangan full-stack web dan project management. Terbiasa dengan framework modern (Laravel, React) dan terbiasa memimpin tim developer. Mencari peluang magang/profesional untuk memberikan dampak teknis pada produk perusahaan.

PENDIDIKAN (EDUCATION)
S1 Teknologi Informasi | Universitas Contoh Nusantara (2023 - Sekarang)
- IPK: 3.5

PENGALAMAN KERJA (EXPERIENCE)
Fullstack Developer Intern | Connextra Tech (Februari 2026 - Sekarang)
- Mengembangkan sistem event registration end-to-end mencakup dashboard frontend, backend logic, dan manajemen peserta.
- Mendesain schema database PostgreSQL dan migrasi data dari Google Sheets ke penyimpanan form dinamis berbasis JSON.
Project Manager | IT Bootcamp Kampus (Juni 2025)
- Memimpin tim 9 orang membangun aplikasi web "EcoPoint", meraih Juara 2 dan memperoleh sertifikat HKI.

PROYEK UNGGULAN (FEATURED PROJECTS)
Fish Market E-Commerce (Laravel 12): platform transaksi dengan real-time chat dan integrasi payment gateway.
- Membangun sistem laporan PDF otomatis dan low-stock alerts untuk manajemen inventaris multi-produk.
Toko Listrik Online (Laravel, Tailwind CSS, Alpine.js): e-commerce dengan autentikasi multi-role dan checkout terintegrasi.
- Mengintegrasikan asisten AI berbasis LLM untuk membantu pelanggan menemukan produk yang tepat.

KEAHLIAN TEKNIS (TECHNICAL SKILLS)
Tech Stack: PHP (Laravel 12), JavaScript (React.js), TypeScript, Tailwind CSS, MySQL.
Tools & Services: Git/GitHub, Postman API, RESTful API, Payment Gateway.

SERTIFIKASI & PENGHARGAAN (CERTIFICATIONS & AWARDS)
- Hak Kekayaan Intelektual (HKI): Aplikasi "EcoPoint" (2025).
- Juara 2 IT Bootcamp: Kategori Pengembangan Aplikasi Web.

BAHASA (LANGUAGE)
- Bahasa Indonesia: Native.
- Bahasa Inggris: Intermediate (TOEFL ITP 515).

PUBLIKASI ILMIAH (PUBLICATIONS)
- Santosa, B., dkk. (2026). Evaluation of a Campus Education App Using UEQ. JITK, 11(3), 661-668. DOI: https://doi.org/10.0000/example
---
`.trim()
