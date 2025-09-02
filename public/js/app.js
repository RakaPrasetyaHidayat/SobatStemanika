let currentUser = null;
let currentModal = null;

const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const authButtons = document.getElementById('auth-buttons');
const userMenu = document.getElementById('user-menu');
const userName = document.getElementById('user-name');


document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    checkAuthStatus();
});


function initializeApp() {
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
        // Optional: close menu when link clicked
        navMenu.querySelectorAll('.nav-link').forEach(link => {
          link.addEventListener('click', () => navMenu.classList.remove('active'));
        });
    }

    
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target.id);
        }
    });
}


function setupEventListeners() {
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
}


async function checkAuthStatus() {
    try {
        const response = await fetch('/api/user');
        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            updateUIForLoggedInUser();
        } else {
            updateUIForLoggedOutUser();
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
        updateUIForLoggedOutUser();
    }
}


function updateUIForLoggedInUser() {
    if (authButtons) authButtons.style.display = 'none';
    if (userMenu) {
        userMenu.style.display = 'flex';
        userName.textContent = currentUser.nama;
    }
}


function updateUIForLoggedOutUser() {
    if (authButtons) authButtons.style.display = 'flex';
    if (userMenu) userMenu.style.display = 'none';
    currentUser = null;
}


function showConfirm(message, onYes) {
    const confirmModal = document.getElementById('confirmModal');
    const confirmMessage = document.getElementById('confirmMessage');
    const confirmYesBtn = document.getElementById('confirmYesBtn');
    confirmMessage.textContent = message;
    confirmModal.style.display = 'block';

    confirmYesBtn.onclick = function() {
        closeModal('confirmModal');
        onYes();
    };
}


async function handleLogin(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const loginData = {
        nis: formData.get('nis'),
        password: formData.get('password')
    };
    showConfirm('Apakah Anda yakin ingin login?', async function() {
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });
            const data = await response.json();
            if (response.ok) {
                currentUser = data.user;
                updateUIForLoggedInUser();
                closeModal('loginModal');
                showSuccessMessage('Login berhasil!');
                
                if (currentUser.role === 'admin') {
                    window.location.href = '/admin.html';
                    return;
                }
                if (currentUser.role === 'siswa') {
                    window.location.href = '/siswa.html';
                    return;
                }
              
            } else {
                showErrorMessage(data.error || 'Login gagal');
            }
        } catch (error) {
            console.error('Login error:', error);
            showErrorMessage('Terjadi kesalahan saat login');
        }
    });
}


async function handleRegister(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const registerData = {
        nis: formData.get('nis'),
        password: formData.get('password'),
        nama: formData.get('nama'),
        email: formData.get('email'),
        jurusan: formData.get('jurusan'),
        kelas: formData.get('kelas')
    };

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registerData)
        });

        const data = await response.json();

        if (response.ok) {
            // Close modal and show success message
            closeModal('registerModal');
            showSuccessMessage('Registrasi berhasil! Selamat datang di dashboard siswa.');
            
            // Set current user and update UI
            currentUser = data.user;
            updateUIForLoggedInUser();
            
            // Redirect to student dashboard after a short delay to ensure session is established
            setTimeout(() => {
                window.location.href = '/siswa.html';
            }, 1000);
        } else {
            showErrorMessage(data.error || 'Registrasi gagal');
        }
    } catch (error) {
        console.error('Register error:', error);
        showErrorMessage('Terjadi kesalahan saat registrasi');
    }
}


async function logout() {
    showConfirm('Yakin ingin keluar?', async function() {
        try {
            const response = await fetch('/api/logout', {
                method: 'POST'
            });
            if (response.ok) {
                currentUser = null;
                updateUIForLoggedOutUser();
                showSuccessMessage('Logout berhasil!');
            }
        } catch (error) {
            console.error('Logout error:', error);
            showErrorMessage('Terjadi kesalahan saat logout');
        }
    });
}


function handleContactForm(event) {
    event.preventDefault();
    showSuccessMessage('Pesan berhasil dikirim! Kami akan segera menghubungi Anda.');
    event.target.reset();
}


function showLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
    currentModal = 'loginModal';
}

function showRegisterModal() {
    document.getElementById('registerModal').style.display = 'block';
    currentModal = 'registerModal';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    currentModal = null;
}

function switchModal(fromModal, toModal) {
    closeModal(fromModal);
    document.getElementById(toModal).style.display = 'block';
    currentModal = toModal;
}


function showDashboard() {
    if (!currentUser) {
        showErrorMessage('Anda harus login terlebih dahulu');
        return;
    }

    const dashboardModal = document.getElementById('dashboardModal');
    const dashboardRole = document.getElementById('dashboard-role');
    const dashboardName = document.getElementById('dashboard-name');
    const dashboardMenu = document.getElementById('dashboard-menu');

    dashboardRole.textContent = currentUser.role === 'admin' ? 'Admin' : 'Siswa';
    dashboardName.textContent = currentUser.nama;


    dashboardMenu.innerHTML = generateDashboardMenu(currentUser.role);

    dashboardModal.style.display = 'block';
    currentModal = 'dashboardModal';
}


function generateDashboardMenu(role) {
    if (role === 'admin') {
        return `
            <div class="dashboard-item" onclick="showSchoolInfo()">
                <i class="fas fa-school"></i>
                <h3>Informasi Sekolah</h3>
                <p>Kelola informasi sekolah</p>
            </div>
            <div class="dashboard-item" onclick="showEskulManagement()">
                <i class="fas fa-users"></i>
                <h3>Kelola Eskul</h3>
                <p>Tambah dan edit ekstrakurikuler</p>
            </div>
            <div class="dashboard-item" onclick="showElectionManagement()">
                <i class="fas fa-vote-yea"></i>
                <h3>Pemilihan Ketos</h3>
                <p>Kelola kandidat pemilihan</p>
            </div>
            <div class="dashboard-item" onclick="showScheduleManagement()">
                <i class="fas fa-calendar-alt"></i>
                <h3>Jadwal Pelajaran</h3>
                <p>Kelola jadwal pelajaran</p>
            </div>
            <div class="dashboard-item" onclick="showExamManagement()">
                <i class="fas fa-file-alt"></i>
                <h3>Link Ujian</h3>
                <p>Kelola link ujian</p>
            </div>
        `;
    } else {
        return `
            <div class="dashboard-item" onclick="showSchoolInfo()">
                <i class="fas fa-school"></i>
                <h3>Informasi Sekolah</h3>
                <p>Lihat informasi sekolah</p>
            </div>
            <div class="dashboard-item" onclick="showEskulList()">
                <i class="fas fa-users"></i>
                <h3>Eskul</h3>
                <p>Lihat dan pilih ekstrakurikuler</p>
            </div>
            <div class="dashboard-item" onclick="showElection()">
                <i class="fas fa-vote-yea"></i>
                <h3>Pemilihan Ketos</h3>
                <p>Pilih ketos dan waketos</p>
            </div>
            <div class="dashboard-item" onclick="showSchedule()">
                <i class="fas fa-calendar-alt"></i>
                <h3>Jadwal Pelajaran</h3>
                <p>Lihat jadwal pelajaran</p>
            </div>
            <div class="dashboard-item" onclick="showExams()">
                <i class="fas fa-file-alt"></i>
                <h3>Link Ujian</h3>
                <p>Lihat link ujian</p>
            </div>
            <div class="dashboard-item" onclick="showProfile()">
                <i class="fas fa-user-edit"></i>
                <h3>Profil</h3>
                <p>Edit data pribadi</p>
            </div>
        `;
    }
}


async function showSchoolInfo() {
    try {
        const response = await fetch('/api/school-info');
        const schoolInfo = await response.json();
        
        const content = `
            <div class="modal-content">
                <span class="close" onclick="closeModal('schoolInfoModal')">&times;</span>
                <h2>Informasi Sekolah</h2>
                ${currentUser.role === 'admin' ? `
                    <form id="schoolInfoForm">
                        <div class="form-group">
                            <label>Nama Sekolah</label>
                            <input type="text" name="nama_sekolah" value="${schoolInfo.nama_sekolah || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Alamat</label>
                            <textarea name="alamat" rows="3" required>${schoolInfo.alamat || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label>Telepon</label>
                            <input type="text" name="telepon" value="${schoolInfo.telepon || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" name="email" value="${schoolInfo.email || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Website</label>
                            <input type="url" name="website" value="${schoolInfo.website || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Deskripsi</label>
                            <textarea name="deskripsi" rows="4" required>${schoolInfo.deskripsi || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label>Jurusan</label>
                            <input type="text" name="jurusan" value="${schoolInfo.jurusan || ''}" required>
                        </div>
                        <button type="submit" class="btn btn-primary">Simpan Perubahan</button>
                    </form>
                ` : `
                    <div class="school-info-display">
                        <p><strong>Nama Sekolah:</strong> ${schoolInfo.nama_sekolah || 'Belum diisi'}</p>
                        <p><strong>Alamat:</strong> ${schoolInfo.alamat || 'Belum diisi'}</p>
                        <p><strong>Telepon:</strong> ${schoolInfo.telepon || 'Belum diisi'}</p>
                        <p><strong>Email:</strong> ${schoolInfo.email || 'Belum diisi'}</p>
                        <p><strong>Website:</strong> ${schoolInfo.website || 'Belum diisi'}</p>
                        <p><strong>Deskripsi:</strong> ${schoolInfo.deskripsi || 'Belum diisi'}</p>
                        <p><strong>Jurusan:</strong> ${schoolInfo.jurusan || 'Belum diisi'}</p>
                    </div>
                `}
            </div>
        `;
        
        showCustomModal('schoolInfoModal', content);
        
        if (currentUser.role === 'admin') {
            document.getElementById('schoolInfoForm').addEventListener('submit', handleSchoolInfoUpdate);
        }
    } catch (error) {
        showErrorMessage('Gagal memuat informasi sekolah');
    }
}

async function handleSchoolInfoUpdate(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const schoolData = {
        nama_sekolah: formData.get('nama_sekolah'),
        alamat: formData.get('alamat'),
        telepon: formData.get('telepon'),
        email: formData.get('email'),
        website: formData.get('website'),
        deskripsi: formData.get('deskripsi'),
        jurusan: formData.get('jurusan')
    };

    try {
        const response = await fetch('/api/school-info', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(schoolData)
        });

        if (response.ok) {
            showSuccessMessage('Informasi sekolah berhasil diperbarui');
            closeModal('schoolInfoModal');
        } else {
            showErrorMessage('Gagal memperbarui informasi sekolah');
        }
    } catch (error) {
        showErrorMessage('Terjadi kesalahan');
    }
}

async function showEskulManagement() {
    try {
        const response = await fetch('/api/eskul');
        const eskulList = await response.json();
        
        let content = `
            <div class="modal-content">
                <span class="close" onclick="closeModal('eskulManagementModal')">&times;</span>
                <h2>Kelola Ekstrakurikuler</h2>
                <button class="btn btn-primary" onclick="showAddEskulForm()" style="margin-bottom: 1rem;">
                    <i class="fas fa-plus"></i> Tambah Eskul
                </button>
                <div class="eskul-list">
        `;
        
        eskulList.forEach(eskul => {
            content += `
                <div class="eskul-item">
                    <div class="eskul-info">
                        <h3>${eskul.nama_eskul}</h3>
                        <p>${eskul.deskripsi || 'Tidak ada deskripsi'}</p>
                        <p><strong>Kontak:</strong> ${eskul.kontak_center || 'Tidak ada kontak'}</p>
                    </div>
                    <div class="eskul-actions">
                        <button class="btn btn-secondary" onclick="editEskul(${eskul.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-logout" onclick="deleteEskul(${eskul.id})">
                            <i class="fas fa-trash"></i> Hapus
                        </button>
                    </div>
                </div>
            `;
        });
        
        content += `
                </div>
            </div>
        `;
        
        showCustomModal('eskulManagementModal', content);
    } catch (error) {
        showErrorMessage('Gagal memuat data eskul');
    }
}

function showAddEskulForm() {
    const content = `
        <div class="modal-content">
            <span class="close" onclick="closeModal('addEskulModal')">&times;</span>
            <h2>Tambah Ekstrakurikuler</h2>
            <form id="addEskulForm">
                <div class="form-group">
                    <label>Nama Eskul</label>
                    <input type="text" name="nama_eskul" required>
                </div>
                <div class="form-group">
                    <label>Deskripsi</label>
                    <textarea name="deskripsi" rows="4" required></textarea>
                </div>
                <div class="form-group">
                    <label>Logo (File)</label>
                    <input type="file" name="logo" accept="image/*">
                </div>
                <div class="form-group">
                    <label>Kontak Center</label>
                    <input type="text" name="kontak_center" required>
                </div>
                <button type="submit" class="btn btn-primary">Tambah Eskul</button>
            </form>
        </div>
    `;
    
    showCustomModal('addEskulModal', content);
    document.getElementById('addEskulForm').addEventListener('submit', handleAddEskul);
}

async function handleAddEskul(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    
    try {
        const response = await fetch('/api/eskul', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            showSuccessMessage('Eskul berhasil ditambahkan');
            closeModal('addEskulModal');
            showEskulManagement(); // Refresh the list
        } else {
            showErrorMessage('Gagal menambahkan eskul');
        }
    } catch (error) {
        showErrorMessage('Terjadi kesalahan');
    }
}


async function showEskulList() {
    try {
        const response = await fetch('/api/eskul');
        const eskulList = await response.json();
        
        let content = `
            <div class="modal-content">
                <span class="close" onclick="closeModal('eskulListModal')">&times;</span>
                <h2>Daftar Ekstrakurikuler</h2>
                <div class="eskul-list">
        `;
        
        eskulList.forEach(eskul => {
            content += `
                <div class="eskul-item">
                    <div class="eskul-info">
                        <h3>${eskul.nama_eskul}</h3>
                        <p>${eskul.deskripsi || 'Tidak ada deskripsi'}</p>
                        <p><strong>Kontak:</strong> ${eskul.kontak_center || 'Tidak ada kontak'}</p>
                    </div>
                    <div class="eskul-actions">
                        <button class="btn btn-primary" onclick="pilihEskul(${eskul.id})">
                            <i class="fas fa-check"></i> Pilih Eskul
                        </button>
                    </div>
                </div>
            `;
        });
        
        content += `
                </div>
            </div>
        `;
        
        showCustomModal('eskulListModal', content);
    } catch (error) {
        showErrorMessage('Gagal memuat data eskul');
    }
}

async function pilihEskul(eskulId) {
    try {
        const response = await fetch('/api/eskul/pilih', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ eskul_id: eskulId })
        });

        const data = await response.json();

        if (response.ok) {
            showSuccessMessage('Eskul berhasil dipilih!');
        } else {
            showErrorMessage(data.error || 'Gagal memilih eskul');
        }
    } catch (error) {
        showErrorMessage('Terjadi kesalahan');
    }
}


function showCustomModal(modalId, content) {
    
    const existingModal = document.getElementById(modalId);
    if (existingModal) {
        existingModal.remove();
    }
    
    
    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'modal';
    modal.innerHTML = content;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    currentModal = modalId;
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function showSuccessMessage(message) {
    showMessage(message, 'success');
}

function showErrorMessage(message) {
    showMessage(message, 'error');
}

function showMessage(message, type) {
    
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 3000;
        animation: slideIn 0.3s ease;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
    `;
    
    document.body.appendChild(messageDiv);
    
   
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}


const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .eskul-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        margin-bottom: 1rem;
    }
    
    .eskul-info h3 {
        margin-bottom: 0.5rem;
        color: #1f2937;
    }
    
    .eskul-info p {
        color: #6b7280;
        margin-bottom: 0.25rem;
    }
    
    .eskul-actions {
        display: flex;
        gap: 0.5rem;
    }
    
    .school-info-display p {
        margin-bottom: 1rem;
        padding: 0.5rem;
        background: #f8fafc;
        border-radius: 4px;
    }
`;
document.head.appendChild(style);