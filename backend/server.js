db.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to MySQL database');
    createTables();
});


function createTables() {
    
    const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nis VARCHAR(20) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            nama VARCHAR(100) NOT NULL,
            email VARCHAR(100),
            role ENUM('admin', 'siswa', 'guest') DEFAULT 'guest',
            jurusan VARCHAR(50),
            kelas VARCHAR(10),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    
    const createSchoolInfoTable = `
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
        )
    `;

    
    const createEskulTable = `
        CREATE TABLE IF NOT EXISTS eskul (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nama_eskul VARCHAR(100) NOT NULL,
            deskripsi TEXT,
            logo VARCHAR(255),
            kontak_center VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    
    const createEskulPilihanTable = `
        CREATE TABLE IF NOT EXISTS eskul_pilihan (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            eskul_id INT,
            status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (eskul_id) REFERENCES eskul(id) ON DELETE CASCADE
        )
    `;

    
    const createKandidatTable = `
        CREATE TABLE IF NOT EXISTS kandidat (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nama VARCHAR(100) NOT NULL,
            nis VARCHAR(20) NOT NULL,
            posisi ENUM('ketos', 'waketos') NOT NULL,
            visi TEXT,
            misi TEXT,
            foto VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    
    const createPemilihanTable = `
        CREATE TABLE IF NOT EXISTS pemilihan (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            kandidat_id INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (kandidat_id) REFERENCES kandidat(id) ON DELETE CASCADE
        )
    `;

    
    const createJadwalTable = `
        CREATE TABLE IF NOT EXISTS jadwal (
            id INT AUTO_INCREMENT PRIMARY KEY,
            hari ENUM('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu') NOT NULL,
            jam_mulai TIME NOT NULL,
            jam_selesai TIME NOT NULL,
            mata_pelajaran VARCHAR(100) NOT NULL,
            guru VARCHAR(100),
            kelas VARCHAR(10),
            jurusan VARCHAR(50),
            gambar VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;


    const createUjianTable = `
        CREATE TABLE IF NOT EXISTS ujian (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nama_ujian VARCHAR(100) NOT NULL,
            link_ujian TEXT NOT NULL,
            deskripsi TEXT,
            tanggal_mulai DATETIME,
            tanggal_selesai DATETIME,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;


    db.query(createUsersTable);
    db.query(createSchoolInfoTable);
    db.query(createEskulTable);
    db.query(createEskulPilihanTable);
    db.query(createKandidatTable);
    db.query(createPemilihanTable);
    db.query(createJadwalTable);
    db.query(createUjianTable);


    const defaultPassword = bcrypt.hashSync('123456', 10);
    const insertAdmin = `
        INSERT IGNORE INTO users (nis, password, nama, role) 
        VALUES ('admin', '${defaultPassword}', 'Administrator', 'admin')
    `;
    db.query(insertAdmin);


    const insertSchoolInfo = `
        INSERT IGNORE INTO school_info (nama_sekolah, alamat, telepon, email, website, deskripsi, jurusan) 
        VALUES ('Sobat Stemanika', 'Jl. Pendidikan No. 123', '021-1234567', 'info@stemanika.sch.id', 'www.stemanika.sch.id', 'Sekolah Menengah Kejuruan yang berkomitmen untuk menghasilkan lulusan berkualitas', 'RPL, TKJ, TSM, TKR, TKL, DPIB, TPM')
    `;
    db.query(insertSchoolInfo);
}


const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
require('dotenv').config({ path: path.join(__dirname, '..', 'config.env') });

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve frontend static files from the sibling `public` folder
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));
app.use(session({
    secret: 'sobat-stemanika-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } 
}));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sobat_stemanika'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to MySQL database');
    createTables();
});


function createTables() {
    
    const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nis VARCHAR(20) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            nama VARCHAR(100) NOT NULL,
            email VARCHAR(100),
            role ENUM('admin', 'siswa', 'guest') DEFAULT 'guest',
            jurusan VARCHAR(50),
            kelas VARCHAR(10),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    
    const createSchoolInfoTable = `
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
        )
    `;

    
    const createEskulTable = `
        CREATE TABLE IF NOT EXISTS eskul (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nama_eskul VARCHAR(100) NOT NULL,
            deskripsi TEXT,
            logo VARCHAR(255),
            kontak_center VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    
    const createEskulPilihanTable = `
        CREATE TABLE IF NOT EXISTS eskul_pilihan (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            eskul_id INT,
            status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (eskul_id) REFERENCES eskul(id) ON DELETE CASCADE
        )
    `;

    
    const createKandidatTable = `
        CREATE TABLE IF NOT EXISTS kandidat (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nama VARCHAR(100) NOT NULL,
            nis VARCHAR(20) NOT NULL,
            posisi ENUM('ketos', 'waketos') NOT NULL,
            visi TEXT,
            misi TEXT,
            foto VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    
    const createPemilihanTable = `
        CREATE TABLE IF NOT EXISTS pemilihan (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            kandidat_id INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (kandidat_id) REFERENCES kandidat(id) ON DELETE CASCADE
        )
    `;

    
    const createJadwalTable = `
        CREATE TABLE IF NOT EXISTS jadwal (
            id INT AUTO_INCREMENT PRIMARY KEY,
            hari ENUM('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu') NOT NULL,
            jam_mulai TIME NOT NULL,
            jam_selesai TIME NOT NULL,
            mata_pelajaran VARCHAR(100) NOT NULL,
            guru VARCHAR(100),
            kelas VARCHAR(10),
            jurusan VARCHAR(50),
            gambar VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;


    const createUjianTable = `
        CREATE TABLE IF NOT EXISTS ujian (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nama_ujian VARCHAR(100) NOT NULL,
            link_ujian TEXT NOT NULL,
            deskripsi TEXT,
            tanggal_mulai DATETIME,
            tanggal_selesai DATETIME,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;


    db.query(createUsersTable);
    db.query(createSchoolInfoTable);
    db.query(createEskulTable);
    db.query(createEskulPilihanTable);
    db.query(createKandidatTable);
    db.query(createPemilihanTable);
    db.query(createJadwalTable);
    db.query(createUjianTable);


    const defaultPassword = bcrypt.hashSync('123456', 10);
    const insertAdmin = `
        INSERT IGNORE INTO users (nis, password, nama, role) 
        VALUES ('admin', '${defaultPassword}', 'Administrator', 'admin')
    `;
    db.query(insertAdmin);


    const insertSchoolInfo = `
        INSERT IGNORE INTO school_info (nama_sekolah, alamat, telepon, email, website, deskripsi, jurusan) 
        VALUES ('Sobat Stemanika', 'Jl. Pendidikan No. 123', '021-1234567', 'info@stemanika.sch.id', 'www.stemanika.sch.id', 'Sekolah Menengah Kejuruan yang berkomitmen untuk menghasilkan lulusan berkualitas', 'RPL, TKJ, TSM, TKR, TKL, DPIB, TPM')
    `;
    db.query(insertSchoolInfo);
}


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'public', 'uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });


function requireAuth(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
}

function requireAdmin(req, res, next) {
    if (req.session.user && req.session.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Admin access required' });
    }
}


app.post('/api/register', async (req, res) => {
    const { nis, password, nama, email, jurusan, kelas } = req.body;
    
    try {
        const hashedPassword = bcrypt.hashSync(password, 10);
        const query = `
            INSERT INTO users (nis, password, nama, email, role, jurusan, kelas)
            VALUES (?, ?, ?, ?, 'siswa', ?, ?)
        `;
        
        db.query(query, [nis, hashedPassword, nama, email, jurusan, kelas], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ error: 'NIS sudah terdaftar' });
                }
                return res.status(500).json({ error: 'Error registering user' });
            }
            
            const user = { id: result.insertId, nis, nama, role: 'siswa' };
            req.session.user = user;
            
            req.session.save((err) => {
                if (err) {
                    return res.status(500).json({ error: 'Error saving session' });
                }
                res.json({ message: 'Registration successful', user: req.session.user });
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/login', (req, res) => {
    const { nis, password } = req.body;
    db.query('SELECT * FROM users WHERE nis = ?', [nis], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (results.length === 0) return res.status(401).json({ error: 'NIS tidak ditemukan' });
        const user = results[0];
        const isValidPassword = bcrypt.compareSync(password, user.password);
        if (!isValidPassword) return res.status(401).json({ error: 'Password salah' });
        let role = user.role; // Ambil role dari database
        req.session.user = { id: user.id, nis: user.nis, nama: user.nama, role };
        res.json({ message: 'Login successful', user: req.session.user });
    });
});

app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ message: 'Logout successful' });
});

app.get('/api/user', (req, res) => {
    if (req.session.user) {
        res.json({ user: req.session.user });
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});


app.get('/api/school-info', (req, res) => {
    const query = 'SELECT * FROM school_info ORDER BY id DESC LIMIT 1';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results[0] || {});
    });
});

app.put('/api/school-info', requireAdmin, (req, res) => {
    const { nama_sekolah, alamat, telepon, email, website, deskripsi, jurusan } = req.body;
    const query = `
        UPDATE school_info SET 
        nama_sekolah = ?, alamat = ?, telepon = ?, email = ?, 
        website = ?, deskripsi = ?, jurusan = ?
        WHERE id = (SELECT id FROM (SELECT id FROM school_info ORDER BY id DESC LIMIT 1) AS temp)
    `;
    db.query(query, [nama_sekolah, alamat, telepon, email, website, deskripsi, jurusan], (err, result) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ message: 'School info updated successfully' });
    });
});


app.get('/api/eskul', (req, res) => {
    const query = 'SELECT * FROM eskul ORDER BY nama_eskul';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

app.post('/api/eskul', requireAdmin, upload.single('logo'), (req, res) => {
    const { nama_eskul, deskripsi, kontak_center } = req.body;
    const logo = req.file ? `/uploads/${req.file.filename}` : null;
    
    const query = 'INSERT INTO eskul (nama_eskul, deskripsi, logo, kontak_center) VALUES (?, ?, ?, ?)';
    db.query(query, [nama_eskul, deskripsi, logo, kontak_center], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'Extracurricular added successfully', id: result.insertId });
    });
});

app.put('/api/eskul/:id', requireAdmin, upload.single('logo'), (req, res) => {
    const { id } = req.params;
    const { nama_eskul, deskripsi, kontak_center } = req.body;
    const logo = req.file ? `/uploads/${req.file.filename}` : req.body.logo;
    
    const query = 'UPDATE eskul SET nama_eskul = ?, deskripsi = ?, logo = ?, kontak_center = ? WHERE id = ?';
    db.query(query, [nama_eskul, deskripsi, logo, kontak_center, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'Extracurricular updated successfully' });
    });
});

app.delete('/api/eskul/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    
    const query = 'DELETE FROM eskul WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'Extracurricular deleted successfully' });
    });
});


app.post('/api/eskul/pilih', requireAuth, (req, res) => {
    const { eskul_id } = req.body;
    const user_id = req.session.user.id;
    
+    
    const checkQuery = 'SELECT * FROM eskul_pilihan WHERE user_id = ? AND eskul_id = ?';
    db.query(checkQuery, [user_id, eskul_id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (results.length > 0) {
            return res.status(400).json({ error: 'Anda sudah memilih eskul ini' });
        }
        
        const insertQuery = 'INSERT INTO eskul_pilihan (user_id, eskul_id) VALUES (?, ?)';
        db.query(insertQuery, [user_id, eskul_id], (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({ message: 'Extracurricular choice saved successfully' });
        });
    });
});

app.get('/api/eskul/pilihan', requireAuth, (req, res) => {
    const user_id = req.session.user.id;
    
+    const query = `
        SELECT ep.*, e.nama_eskul, e.deskripsi, e.logo 
        FROM eskul_pilihan ep 
        JOIN eskul e ON ep.eskul_id = e.id 
        WHERE ep.user_id = ?
    `;
    
+    db.query(query, [user_id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});


app.get('/api/kandidat', (req, res) => {
    const query = 'SELECT * FROM kandidat ORDER BY posisi, nama';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

app.post('/api/kandidat', requireAdmin, upload.single('foto'), (req, res) => {
    const { nama, nis, posisi, visi, misi } = req.body;
    const foto = req.file ? `/uploads/${req.file.filename}` : null;
    
    const query = 'INSERT INTO kandidat (nama, nis, posisi, visi, misi, foto) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(query, [nama, nis, posisi, visi, misi, foto], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'Candidate added successfully', id: result.insertId });
    });
});

app.post('/api/pemilihan', requireAuth, (req, res) => {
    const { kandidat_id } = req.body;
    const user_id = req.session.user.id;
    
+
    const checkQuery = 'SELECT * FROM pemilihan WHERE user_id = ?';
    db.query(checkQuery, [user_id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
+        if (results.length > 0) {
            return res.status(400).json({ error: 'Anda sudah memilih' });
        }
        
+        const insertQuery = 'INSERT INTO pemilihan (user_id, kandidat_id) VALUES (?, ?)';
        db.query(insertQuery, [user_id, kandidat_id], (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({ message: 'Vote recorded successfully' });
        });
    });
});

app.get('/api/pemilihan/hasil', (req, res) => {
    const query = `
        SELECT k.*, COUNT(p.id) as jumlah_suara 
        FROM kandidat k 
        LEFT JOIN pemilihan p ON k.id = p.kandidat_id 
        GROUP BY k.id 
        ORDER BY k.posisi, jumlah_suara DESC
    `;
    
+    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});


app.delete('/api/kandidat/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM kandidat WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'Candidate deleted successfully' });
    });
});


app.get('/api/jadwal/all', requireAdmin, (req, res) => {
    const query = 'SELECT * FROM jadwal ORDER BY kelas, jurusan, hari, jam_mulai';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

app.get('/api/jadwal', (req, res) => {
    const { kelas, jurusan } = req.query;
    let query = 'SELECT * FROM jadwal';
    let params = [];
    if (kelas && jurusan) {
        query += ' WHERE kelas = ? AND jurusan = ?';
        params = [kelas, jurusan];
    }
    query += ' ORDER BY FIELD(hari, "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"), jam_mulai';
    db.query(query, params, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

app.post('/api/jadwal', requireAdmin, upload.single('jadwal_gambar'), (req, res) => {
    const { hari, jam_mulai, jam_selesai, mata_pelajaran, guru, kelas, jurusan } = req.body;
    const gambar = req.file ? `/uploads/${req.file.filename}` : null;
    const query = 'INSERT INTO jadwal (hari, jam_mulai, jam_selesai, mata_pelajaran, guru, kelas, jurusan, gambar) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [hari, jam_mulai, jam_selesai, mata_pelajaran, guru, kelas, jurusan, gambar], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'Schedule added successfully', id: result.insertId });
    });
});

app.put('/api/jadwal/:id', requireAdmin, upload.single('jadwal_gambar'), (req, res) => {
    const { id } = req.params;
    const { hari, jam_mulai, jam_selesai, mata_pelajaran, guru, kelas, jurusan } = req.body;
    const gambar = req.file ? `/uploads/${req.file.filename}` : req.body.current_gambar;
    const query = 'UPDATE jadwal SET hari = ?, jam_mulai = ?, jam_selesai = ?, mata_pelajaran = ?, guru = ?, kelas = ?, jurusan = ?, gambar = ? WHERE id = ?';
    db.query(query, [hari, jam_mulai, jam_selesai, mata_pelajaran, guru, kelas, jurusan, gambar, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'Schedule updated successfully' });
    });
});

app.post('/api/jadwal/upload', requireAdmin, upload.single('jadwal_gambar'), (req, res) => {
    const { kelas, jurusan } = req.body;
    const gambar = req.file ? `/uploads/${req.file.filename}` : null;
+    
    const query = 'INSERT INTO jadwal (kelas, jurusan, gambar) VALUES (?, ?, ?)';
    db.query(query, [kelas, jurusan, gambar], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'Jadwal uploaded successfully', id: result.insertId });
    });
});

app.delete('/api/jadwal/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
+    
    const query = 'DELETE FROM jadwal WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'Schedule deleted successfully' });
    });
});


app.get('/api/ujian', (req, res) => {
    const query = 'SELECT * FROM ujian ORDER BY tanggal_mulai DESC';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

app.post('/api/ujian', requireAdmin, (req, res) => {
    const { nama_ujian, link_ujian, deskripsi, tanggal_mulai, tanggal_selesai } = req.body;
    
    const query = 'INSERT INTO ujian (nama_ujian, link_ujian, deskripsi, tanggal_mulai, tanggal_selesai) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [nama_ujian, link_ujian, deskripsi, tanggal_mulai, tanggal_selesai], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'Exam link added successfully', id: result.insertId });
    });
});

app.put('/api/ujian/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const { nama_ujian, link_ujian, deskripsi, tanggal_mulai, tanggal_selesai } = req.body;
    
    const query = 'UPDATE ujian SET nama_ujian = ?, link_ujian = ?, deskripsi = ?, tanggal_mulai = ?, tanggal_selesai = ? WHERE id = ?';
    db.query(query, [nama_ujian, link_ujian, deskripsi, tanggal_mulai, tanggal_selesai, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'Exam link updated successfully' });
    });
});

app.delete('/api/ujian/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    
    const query = 'DELETE FROM ujian WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'Exam link deleted successfully' });
    });
});


app.get('/api/profile', requireAuth, (req, res) => {
    const user_id = req.session.user.id;
+    
+    const query = 'SELECT id, nis, nama, email, role, jurusan, kelas FROM users WHERE id = ?';
    db.query(query, [user_id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results[0]);
    });
});

app.put('/api/profile', requireAuth, (req, res) => {
    const user_id = req.session.user.id;
    const { nama, email, jurusan, kelas } = req.body;
    
+    const query = 'UPDATE users SET nama = ?, email = ?, jurusan = ?, kelas = ? WHERE id = ?';
    db.query(query, [nama, email, jurusan, kelas, user_id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'Profile updated successfully' });
    });
});

app.delete('/api/profile', requireAuth, (req, res) => {
    const user_id = req.session.user.id;
    
+    const query = 'DELETE FROM users WHERE id = ?';
    db.query(query, [user_id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        req.session.destroy();
        res.json({ message: 'Account deleted successfully' });
    });
});


app.post('/api/ikuti-eskul', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'siswa') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  const userId = req.session.user.id;
  const { eskul_id } = req.body;
+
  const [cek] = await db.query('SELECT * FROM eskul_pilihan WHERE user_id=? AND eskul_id=?', [userId, eskul_id]);
  if (cek) return res.status(400).json({ error: 'Sudah memilih eskul ini' });
  await db.query('INSERT INTO eskul_pilihan (user_id, eskul_id, status) VALUES (?, ?, ?)', [userId, eskul_id, 'pending']);
  res.json({ success: true });
});


app.get('/api/pemilihan/rekap', (req, res) => {
  
+  res.json({  });
});


app.get('/api/pemilihan', (req, res) => {

+  res.json([ ]);
});


app.get('/api/profil-sekolah', (req, res) => {
  db.query('SELECT * FROM profil_sekolah LIMIT 1', (err, results) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(results[0] || {});
  });
});


app.put('/api/profil-sekolah', requireAdmin, (req, res) => {
  const { visi, misi } = req.body;
  db.query('UPDATE profil_sekolah SET visi=?, misi=? WHERE id=1', [visi, misi], (err) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ success: true });
  });
});


app.get('/api/programs', requireAdmin, (req, res) => {
  db.query('SELECT * FROM programs', (err, results) => {
    if (err) {
      console.error('DB error:', err);
            return res.status(500).json({ error: 'DB error' });
    }
    res.json(results);
  });
});


app.post('/api/programs', requireAdmin, (req, res) => {
  const { nama, deskripsi, icon } = req.body;
  db.query('INSERT INTO programs (nama, deskripsi, icon) VALUES (?, ?, ?)', [nama, deskripsi, icon], (err, result) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ success: true, id: result.insertId });
  });
});


app.put('/api/programs/:id', requireAdmin, (req, res) => {
  const { nama, deskripsi, icon } = req.body;
  db.query('UPDATE programs SET nama=?, deskripsi=?, icon=? WHERE id=?', [nama, deskripsi, icon, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ success: true });
  });
});


app.delete('/api/programs/:id', requireAdmin, (req, res) => {
  db.query('DELETE FROM programs WHERE id=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ success: true });
  });
});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to access Sobat Stemanika`);
});
