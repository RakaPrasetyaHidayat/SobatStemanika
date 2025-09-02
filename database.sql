CREATE DATABASE IF NOT EXISTS sobat_stemanika;
USE sobat_stemanika;


CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nama VARCHAR(100),
  username VARCHAR(50) UNIQUE,
  password VARCHAR(255),
  role ENUM('admin','siswa') DEFAULT 'siswa'
);


CREATE TABLE IF NOT EXISTS school_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_sekolah VARCHAR(100) NOT NULL,
    alamat TEXT,
    telepon VARCHAR(20),
    email VARCHAR(100),
    website VARCHAR(100),
    deskripsi TEXT,
    jurusan TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS eskul (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_eskul VARCHAR(100) NOT NULL,
    deskripsi TEXT,
    logo VARCHAR(255),
    kontak_center VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS eskul_pilihan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    eskul_id INT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (eskul_id) REFERENCES eskul(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS kandidat (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nomor_kandidat INT NOT NULL,
    nama VARCHAR(100) NOT NULL,
    nis VARCHAR(20) NOT NULL,
    posisi ENUM('ketua-osis', 'wakil-ketua-osis', 'ketua-mpk', 'wakil-ketua-mpk') NOT NULL,
    visi TEXT,
    misi TEXT,
    foto VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS pemilihan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    kandidat_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (kandidat_id) REFERENCES kandidat(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS jadwal (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hari ENUM('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu') NOT NULL,
    jam_mulai TIME NOT NULL,
    jam_selesai TIME NOT NULL,
    mata_pelajaran VARCHAR(100) NOT NULL,
    guru VARCHAR(100),
    kelas VARCHAR(10),
    jurusan VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS ujian (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_ujian VARCHAR(100) NOT NULL,
    link_ujian TEXT NOT NULL,
    deskripsi TEXT,
    tanggal_mulai DATETIME,
    tanggal_selesai DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS profil_sekolah (
  id INT PRIMARY KEY AUTO_INCREMENT,
  visi TEXT,
  misi TEXT
);


CREATE TABLE IF NOT EXISTS programs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nama VARCHAR(100) NOT NULL,
  deskripsi TEXT,
  icon VARCHAR(50)
);





INSERT INTO programs (nama, deskripsi, icon) VALUES
('RPL', 'Rekayasa Perangkat Lunak', 'fa-code'),
('TKJ', 'Teknik Komputer dan Jaringan', 'fa-network-wired');


SELECT 'Database sobat_stemanika berhasil dibuat!' as status; 


UPDATE users 
SET password = '$2a$12$jeeZRvubh4z2WHtCR0EoC.bde.BVUGHt4cIp.dfLsq6uuMKO8mbE6' 
WHERE nis = 'admin';

SELECT * FROM kandidat ORDER BY nomor_kandidat ASC;