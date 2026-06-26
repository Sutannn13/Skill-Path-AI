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
- Every experience/project bullet MUST start with a strong action verb and surface real, quantified impact when available (e.g. "Membangun API REST yang melayani 5.000+ request/hari" or "Mengurangi waktu load halaman 40%").
- Writing must be consistent, concise, and complete. No filler, no vague descriptions.
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
