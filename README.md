# Sobat Stemanika - Website Sekolah



## Fitur Utama

### Untuk Guest 
- Melihat informasi sekolah
- Register dan login menggunakan NIS dan passwor

### Untuk Siswa
- Melihat informasi sekolah (termasuk jurusan)
- Melihat informasi ekstrakurikuler
- Memilih ekstrakurikuler
- Memilih ketos dan waketos saat pemilihan
- Membaca informasi jadwal pelajaran
- Mengubah dan menghapus data pribadi

### Untuk Admin
- admin
- @#$a3!399
- Menyediakan informasi sekolah
- Menyediakan dan mengubah informasi dan logo ekstrakurikuler
- Menambahkan ekstrakurikuler dan kontak center
- Menyediakan link ujian
- Menyediakan informasi jadwal pelajaran

## Teknologi yang Digunakan

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: Session-based dengan bcrypt
- **File Upload**: Multer
- **Styling**: Custom CSS dengan Font Awesome icons

## Instalasi dan Setup

### Prerequisites
- Node.js (versi 14 atau lebih baru)
- MySQL (versi 8.0 atau lebih baru)
- Git

### Langkah-langkah Instalasi

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd stemanika-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup Database**
   - Buat database MySQL baru dengan nama `sobat_stemanika`
   - Database dan tabel akan dibuat otomatis saat menjalankan aplikasi

4. **Konfigurasi Database**
   - Edit file `server.js` pada bagian database connection:
   ```javascript
   const db = mysql.createConnection({
       host: 'localhost',
       user: 'root',           
       password: '',           
       database: 'sobat_stemanika'
   });
   ```

5. **Jalankan aplikasi**
   ```bash
   npm start
   ```
   
   Atau untuk development dengan auto-reload:
   ```bash
   npm run dev
   ```

6. **Akses website**
   - Buka browser dan kunjungi `http://localhost:3000`

## Struktur Database

### Tabel Users
- `id` - Primary key
- `nis` - Nomor Induk Siswa (unique)
- `password` - Password terenkripsi
- `nama` - Nama lengkap
- `email` - Email
- `role` - Role user (admin/siswa/guest)
- `jurusan` - Jurusan siswa (RPL, TKJ, TSM, TKR, TKL, DPIB, TPM)
- `kelas` - Kelas siswa
- `created_at` - Timestamp pembuatan

### Tabel School Info
- `id` - Primary key
- `nama_sekolah` - Nama sekolah
- `alamat` - Alamat sekolah
- `telepon` - Nomor telepon
- `email` - Email sekolah
- `website` - Website sekolah
- `deskripsi` - Deskripsi sekolah
- `jurusan` - Jurusan yang tersedia (RPL, TKJ, TSM, TKR, TKL, DPIB, TPM)
- `updated_at` - Timestamp update

### Tabel Eskul
- `id` - Primary key
- `nama_eskul` - Nama ekstrakurikuler
- `deskripsi` - Deskripsi ekstrakurikuler
- `logo` - Path file logo
- `kontak_center` - Kontak center ekstrakurikuler
- `created_at` - Timestamp pembuatan

### Tabel Eskul Pilihan
- `id` - Primary key
- `user_id` - Foreign key ke users
- `eskul_id` - Foreign key ke eskul
- `status` - Status pilihan (pending/approved/rejected)
- `created_at` - Timestamp pembuatan

### Tabel Kandidat
- `id` - Primary key
- `nama` - Nama kandidat
- `nis` - NIS kandidat
- `posisi` - Posisi (ketos/waketos)
- `visi` - Visi kandidat
- `misi` - Misi kandidat
- `foto` - Path file foto
- `created_at` - Timestamp pembuatan

### Tabel Pemilihan
- `id` - Primary key
- `user_id` - Foreign key ke users
- `kandidat_id` - Foreign key ke kandidat
- `created_at` - Timestamp pemilihan

### Tabel Jadwal
- `id` - Primary key
- `hari` - Hari pelajaran
- `jam_mulai` - Jam mulai pelajaran
- `jam_selesai` - Jam selesai pelajaran
- `mata_pelajaran` - Nama mata pelajaran
- `guru` - Nama guru
- `kelas` - Kelas
- `jurusan` - Jurusan
- `created_at` - Timestamp pembuatan

### Tabel Ujian
- `id` - Primary key
- `nama_ujian` - Nama ujian
- `link_ujian` - Link ujian
- `deskripsi` - Deskripsi ujian
- `tanggal_mulai` - Tanggal mulai ujian
- `tanggal_selesai` - Tanggal selesai ujian
- `created_at` - Timestamp pembuatan

## Akun Default

### Admin
- **NIS**: admin
- **Password**: 123456

### Siswa
- Daftar sebagai siswa baru melalui form registrasi
- Gunakan NIS dan password yang didaftarkan

## API Endpoints

### Authentication
- `POST /api/register` - Register user baru
- `POST /api/login` - Login user
- `POST /api/logout` - Logout user
- `GET /api/user` - Get user info

### School Info
- `GET /api/school-info` - Get informasi sekolah
- `PUT /api/school-info` - Update informasi sekolah (admin only)

### Extracurricular
- `GET /api/eskul` - Get daftar ekstrakurikuler
- `POST /api/eskul` - Tambah ekstrakurikuler (admin only)
- `PUT /api/eskul/:id` - Update ekstrakurikuler (admin only)
- `DELETE /api/eskul/:id` - Hapus ekstrakurikuler (admin only)
- `POST /api/eskul/pilih` - Pilih ekstrakurikuler (siswa only)
- `GET /api/eskul/pilihan` - Get pilihan ekstrakurikuler siswa

### Election
- `GET /api/kandidat` - Get daftar kandidat
- `POST /api/kandidat` - Tambah kandidat (admin only)
- `POST /api/pemilihan` - Vote kandidat (siswa only)
- `GET /api/pemilihan/hasil` - Get hasil pemilihan

### Schedule
- `GET /api/jadwal` - Get jadwal pelajaran
- `POST /api/jadwal` - Tambah jadwal (admin only)
- `PUT /api/jadwal/:id` - Update jadwal (admin only)
- `DELETE /api/jadwal/:id` - Hapus jadwal (admin only)

### Exam
- `GET /api/ujian` - Get daftar ujian
- `POST /api/ujian` - Tambah ujian (admin only)
- `PUT /api/ujian/:id` - Update ujian (admin only)
- `DELETE /api/ujian/:id` - Hapus ujian (admin only)

### Profile
- `GET /api/profile` - Get profil user
- `PUT /api/profile` - Update profil user
- `DELETE /api/profile` - Hapus akun user


## Fitur Keamanan

- Password dienkripsi menggunakan bcrypt
- Session-based authentication
- Role-based access control
- Input validation
- SQL injection protection

## Deployment

### Local Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## Troubleshooting

### Database Connection Error
- Pastikan MySQL server berjalan
- Periksa konfigurasi database di `server.js`
- Pastikan database `sobat_stemanika` sudah dibuat

### Port Already in Use
- Ganti port di `server.js` atau
- Matikan aplikasi yang menggunakan port 3000

### File Upload Error
- Pastikan folder `public/uploads/` sudah dibuat
- Periksa permission folder

## Kontribusi

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Sobat Stemanika - info@stemanika.sch.id

---

## **Langkah Diagnosis & Solusi**

### 1. **Pastikan Login Berhasil**
- Setelah submit login, cek di Network (F12) → klik request `/api/login`:
  - **Status harus 200** dan response harus ada data user.
  - Jika status 401, berarti login gagal (NIS/password salah atau hash tidak cocok).

### 2. **Cek Cookie/Session**
- Setelah login, di tab Network → klik request `/api/login` → tab Cookies.
- Harus ada cookie session (misal: `connect.sid`).
- Jika tidak ada, kemungkinan masalah di backend (CORS, session config).

### 3. **Cek Konfigurasi Session di server.js**
Pastikan session di-setup seperti ini:
```js
const session = require('express-session');
app.use(session({
    secret: 'sobat-stemanika-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } 
}));
```
- Jika development pakai HTTP, **cookie.secure harus false**.

### 4. **Cek CORS**
Jika frontend dan backend beda origin/port, tambahkan:
```js
<code_block_to_apply_changes_from>
```
Dan di fetch JS:
```js
fetch('/api/login', {
  method: 'POST',
  credentials: 'include', 
  ...
});
```

### 5. **Restart Server Setelah Update**
- Setelah update database atau kode, restart server Node.js.

---

## **Kesimpulan**
- **401 pada `/api/user`** artinya session login tidak ada/valid.
- Pastikan login berhasil, session/cookie tersimpan, dan backend mengizinkan session.

---

**Jika ingin bantuan lebih detail:**
- Lampirkan response body dari `/api/login` (bukan hanya status code).
- Lampirkan log error dari terminal/server.
- Lampirkan konfigurasi session dan CORS di server.js.

Saya siap bantu cek step by step sampai login dan session Anda berhasil!
