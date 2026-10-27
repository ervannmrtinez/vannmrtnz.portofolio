# VannMrtnz Portfolio — Full Source

Portfolio monochrome hitam/abu-abu dengan HTML, CSS, JavaScript, dashboard admin tersembunyi, Supabase Auth + database, dan backend Flask opsional.

## Struktur
- `public/index.html` — halaman utama + modal admin
- `public/style.css` — seluruh desain responsif
- `public/script.js` — interaksi, koneksi Supabase, CRUD proyek
- `supabase/supabase-schema.sql` — tabel dan Row Level Security (RLS)
- `backend/app.py` — API Flask opsional (health check)
- `backend/requirements.txt` — dependensi Flask
- `backend/Procfile` — perintah server Gunicorn
- `vercel.json` — header keamanan untuk hosting statis
- `.gitignore` — file yang tidak perlu di-commit

## A. Konfigurasi Supabase (dibutuhkan agar admin online berfungsi)
1. Buat project di https://supabase.com.
2. Buka **SQL Editor**, jalankan seluruh isi `supabase/supabase-schema.sql`.
3. Buka **Project Settings → API** (atau Connect), salin Project URL dan publishable/anon key.
4. Buka `public/script.js`, isi `CONFIG.supabaseUrl` dan `CONFIG.supabaseAnonKey`. Hanya gunakan publishable/anon key; jangan pernah masukkan `service_role` key ke frontend.
5. Buka **Authentication → Users** dan buat user admin dengan email + password kuat. Jika opsi pendaftaran publik aktif, matikan sign-up publik di pengaturan Auth setelah akun admin dibuat.
6. Salin UUID user admin dari Authentication → Users.
7. Di SQL Editor jalankan perintah berikut dengan UUID asli:
   `insert into public.admin_users (user_id) values ('UUID-ADMIN-ASLI');`
8. Pastikan email admin sudah terkonfirmasi bila pengaturan Supabase mensyaratkannya.
9. Deploy ulang website. Admin login menggunakan email dan password yang dibuat di Supabase.

### Cara membuka panel admin
Tap logo `VannMrtnz.` sebanyak 5 kali dalam waktu sekitar 1,4 detik di HP, atau gunakan klik logo 5 kali. Ini hanya cara menyembunyikan panel dari navigasi biasa, bukan mekanisme keamanan. Keamanan operasi tambah/edit/hapus dipaksakan oleh Supabase Auth + RLS.

### Fitur dashboard
- Tambah project: judul, kategori, deskripsi, link, URL gambar.
- Edit judul, deskripsi, kategori, link, dan URL gambar.
- Hapus project.
- Project publik dibaca dari database.
- Dashboard panel scrollable dan responsif.

Catatan gambar: input saat ini menerima URL gambar publik. Upload file langsung belum diimplementasikan; untuk itu perlu menambahkan Supabase Storage bucket dan policies.

## B. Deploy frontend ke Vercel lewat HP Android
1. Download ZIP dan ekstrak di HP.
2. Buat repository GitHub baru, misalnya `vannmrtnz-portfolio`.
3. Upload **isi folder `public/` ke root repository** (agar `index.html`, `style.css`, dan `script.js` berada di root), bersama `vercel.json`. Folder `supabase/` boleh ikut di-upload untuk dokumentasi SQL.
4. Buka https://vercel.com, login dengan GitHub, pilih **Add New → Project**, lalu import repository.
5. Framework Preset pilih **Other**. Build Command kosongkan. Output Directory isi `public` jika folder `public/` tetap ada di root repo.
   - Rekomendasi paling mudah: upload isi folder `public/` ke root repo; biarkan Output Directory kosong.
6. Tekan Deploy dan buka URL yang diberikan Vercel.

## C. Backend Python Flask (opsional)
Frontend ini tidak memerlukan Flask untuk CRUD karena operasi proyek dilakukan lewat Supabase JS client dan dilindungi RLS. `backend/app.py` adalah API health-check opsional; jangan menganggapnya sebagai backend CRUD/admin.

Untuk menjalankan lokal:
```bash
cd backend
pip install -r requirements.txt
python app.py
```
Tes `http://127.0.0.1:5000/api/health`.

Untuk hosting terpisah seperti Render:
- Buat web service dari repository.
- Root Directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `gunicorn app:app`
- Tambahkan `FRONTEND_ORIGINS` dengan URL website Vercel bila ingin membatasi CORS.

## Personalisasi
Edit bagian `CONFIG.profile` di `public/script.js` untuk Instagram, email, GitHub, WhatsApp, dan LinkedIn. Ganti URL placeholder dengan alamat akun asli sebelum publikasi.

## Catatan keamanan
- Jangan pernah commit `.env`, password, atau Supabase `service_role` key.
- Jangan gunakan kredensial contoh untuk produksi.
- Sembunyikan panel admin bukan pengganti autentikasi; database RLS adalah kontrol akses yang sebenarnya.
