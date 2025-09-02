fetch('/api/user')
  .then(res => res.json())
  .then(data => {
    if (!data.user || data.user.role !== 'admin') {
      window.location.href = '/';
    } else {
      document.getElementById('adminName').textContent = data.user.nama || 'Administrator';
    }
  })
  .catch(() => window.location.href = '/');


const links = document.querySelectorAll('.sidebar-link');
const section = document.getElementById('adminSection');

links.forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    links.forEach(l => l.classList.remove('active'));
    this.classList.add('active');
    const sec = this.getAttribute('data-section');
    localStorage.setItem('admin_last_section', sec); // simpan section terakhir
    loadSection(sec);
  });
});


window.addEventListener('DOMContentLoaded', function() {
  const lastSection = localStorage.getItem('admin_last_section') || 'school-info';
  
  links.forEach(l => {
    if (l.getAttribute('data-section') === lastSection) l.classList.add('active');
    else l.classList.remove('active');
  });
  loadSection(lastSection);
});


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


const logoutBtn = document.getElementById('logoutBtn');
logoutBtn.addEventListener('click', function(e) {
    e.preventDefault();
    showConfirm('Yakin ingin keluar?', async function() {
        await fetch('/api/logout', { method: 'POST' });
        window.location.href = '/';
    });
});

function loadSection(sec) {
  switch(sec) {
    case 'school-info':
      loadSchoolInfoSection();
      break;
    case 'eskul':
      loadEskulSection();
      break;
    case 'election':
      loadElectionSection();
      break;
    case 'schedule':
      loadScheduleSection();
      break;
    case 'exam':
      loadExamSection();
      break;
    default:
      section.innerHTML = `<h2>Selamat Datang di Dashboard Admin</h2>`;
  }
}

async function loadExamSection() {
  const res = await fetch('/api/ujian');
  const ujianList = await res.json();
  let html = `
    <h2>Link Ujian</h2>
    <button class="btn btn-primary" id="addUjianBtn">Tambah Ujian</button>
    <div class="ujian-grid" id="ujianList">
      ${ujianList.map(u => `
        <div class="ujian-card">
          <b>${u.nama_ujian}</b><br>
          <span>${u.deskripsi || ''}</span><br>
          <span class="ujian-tanggal">${formatTanggalUjian(u.tanggal_mulai, u.tanggal_selesai)}</span><br>
          <a href="${u.link_ujian}" target="_blank" class="btn btn-secondary btn-sm">Buka Ujian</a>
          <div style="margin-top:0.7rem;display:flex;gap:0.5rem;justify-content:center;">
            <button class="btn btn-secondary btn-sm" onclick="showEditUjianForm(${u.id})"><i class='fas fa-edit'></i> Edit</button>
            <button class="btn btn-logout btn-sm" onclick="deleteUjian(${u.id})"><i class='fas fa-trash'></i> Hapus</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
  section.innerHTML = html;
  document.getElementById('addUjianBtn').onclick = showAddUjianForm;
}

function showAddUjianForm() {
  section.innerHTML = `
    <h2>Tambah Link Ujian</h2>
    <form id="formAddUjian" style="max-width:500px;margin:auto;background:#fff;color:#23272F;border-radius:16px;box-shadow:0 4px 24px #26324A22;border:2px solid #EFCB68;">
      <div style="display:flex;flex-direction:column;gap:1rem;">
        <label>Nama Ujian
          <input type="text" name="nama_ujian" required style="width:100%;padding:0.5rem;border-radius:6px;border:1px solid #333;background:#222;color:#fff;">
        </label>
        <label>Link Ujian
          <input type="url" name="link_ujian" required style="width:100%;padding:0.5rem;border-radius:6px;border:1px solid #333;background:#222;color:#fff;">
        </label>
        <label>Deskripsi
          <textarea name="deskripsi" rows="2" style="width:100%;padding:0.5rem;border-radius:6px;border:1px solid #333;background:#222;color:#fff;"></textarea>
        </label>
        <label>Tanggal Mulai
          <input type="datetime-local" name="tanggal_mulai" style="width:100%;padding:0.5rem;border-radius:6px;border:1px solid #333;background:#222;color:#fff;">
        </label>
        <label>Tanggal Selesai
          <input type="datetime-local" name="tanggal_selesai" style="width:100%;padding:0.5rem;border-radius:6px;border:1px solid #333;background:#222;color:#fff;">
        </label>
        <div style="display:flex;gap:1rem;justify-content:flex-end;">
          <button type="submit" class="btn btn-primary">Simpan</button>
          <button type="button" class="btn btn-secondary" onclick="loadExamSection()">Batal</button>
        </div>
      </div>
    </form>
  `;
  document.getElementById('formAddUjian').onsubmit = async function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const body = {};
    for (const [key, value] of formData.entries()) {
      body[key] = value;
    }
    await fetch('/api/ujian', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    loadExamSection();
  };
}

function formatTanggalUjian(mulai, selesai) {
  if (!mulai && !selesai) return '';
  const tMulai = mulai ? new Date(mulai) : null;
  const tSelesai = selesai ? new Date(selesai) : null;
  if (tMulai && tSelesai) {
    return `${tMulai.toLocaleString()} - ${tSelesai.toLocaleString()}`;
  } else if (tMulai) {
    return tMulai.toLocaleString();
  } else if (tSelesai) {
    return tSelesai.toLocaleString();
  }
  return '';
}

function loadSchoolInfoSection(editMode = false) {
    section.innerHTML = `<h2>Informasi Sekolah</h2><div id="schoolInfoLoading">Memuat data...</div>`;
    fetch('/api/school-info')
        .then(res => res.json())
        .then(data => {
            const info = data || {};
            if (!editMode) {
                
                section.innerHTML = `
                    <h2>Informasi Sekolah</h2>
                    <div style="max-width:600px;margin:auto;background:#fff;color:#23272F;border-radius:16px;box-shadow:0 4px 24px #26324A22;border:2px solid #EFCB68;">
                        <div class='data-box'>
                            <span class='data-label'>Nama Sekolah:</span>
                            <span class='data-value'>${info.nama_sekolah || '-'}</span>
                        </div>
                        <div class='data-box'>
                            <span class='data-label'>Alamat:</span>
                            <span class='data-value'>${info.alamat || '-'}</span>
                        </div>
                        <div class='data-box'>
                            <span class='data-label'>Kontak/Telepon:</span>
                            <span class='data-value'>${info.telepon || '-'}</span>
                        </div>
                        <div class='data-box'>
                            <span class='data-label'>Email:</span>
                            <span class='data-value'>${info.email || '-'}</span>
                        </div>
                        <div class='data-box'>
                            <span class='data-label'>Website:</span>
                            <span class='data-value'>${info.website || '-'}</span>
                        </div>
                        <div class='data-box'>
                            <span class='data-label'>Deskripsi Sekolah:</span>
                            <span class='data-value'>${info.deskripsi || '-'}</span>
                        </div>
                        <div style="display:flex;gap:1rem;justify-content:flex-end;margin-top:2rem;">
                            <button class="btn btn-primary" id="editSchoolInfoBtn">Edit</button>
                        </div>
                    </div>
                `;
                document.getElementById('editSchoolInfoBtn').onclick = function() {
                    loadSchoolInfoSection(true);
                };
            } else {
                
                section.innerHTML = `
                    <h2>Edit Informasi Sekolah</h2>
                    <form id="formSchoolInfo" style="max-width:500px;margin:auto;background:#fff;color:#23272F;border-radius:16px;box-shadow:0 4px 24px #26324A22;border:2px solid #EFCB68;">
                        <div style="display:flex;flex-direction:column;gap:1rem;">
                            <label>Nama Sekolah
                                <input type="text" name="nama_sekolah" value="${info.nama_sekolah || ''}" required style="width:100%;padding:0.5rem;border-radius:6px;border:1px solid #333;background:#222;color:#fff;">
                            </label>
                            <label>Alamat
                                <textarea name="alamat" rows="2" style="width:100%;padding:0.5rem;border-radius:6px;border:1px solid #333;background:#222;color:#fff;">${info.alamat || ''}</textarea>
                            </label>
                            <label>Kontak/Telepon
                                <input type="text" name="telepon" value="${info.telepon || ''}" style="width:100%;padding:0.5rem;border-radius:6px;border:1px solid #333;background:#222;color:#fff;">
                            </label>
                            <label>Email
                                <input type="email" name="email" value="${info.email || ''}" style="width:100%;padding:0.5rem;border-radius:6px;border:1px solid #333;background:#222;color:#fff;">
                            </label>
                            <label>Website
                                <input type="text" name="website" value="${info.website || ''}" style="width:100%;padding:0.5rem;border-radius:6px;border:1px solid #333;background:#222;color:#fff;">
                            </label>
                            <label>Deskripsi Sekolah
                                <textarea name="deskripsi" rows="3" style="width:100%;padding:0.5rem;border-radius:6px;border:1px solid #333;background:#222;color:#fff;">${info.deskripsi || ''}</textarea>
                            </label>
                            <div style="display:flex;gap:1rem;justify-content:flex-end;">
                                <button type="submit" class="btn btn-primary">Simpan</button>
                                <button type="button" class="btn btn-secondary" id="cancelEditSchoolInfoBtn">Batal</button>
                            </div>
                        </div>
                    </form>
                `;
                document.getElementById('cancelEditSchoolInfoBtn').onclick = function() {
                    loadSchoolInfoSection(false);
                };
                document.getElementById('formSchoolInfo').onsubmit = async function(e) {
                    e.preventDefault();
                    const formData = new FormData(this);
                    const body = {};
                    for (const [key, value] of formData.entries()) {
                        body[key] = value;
                    }
                    const res = await fetch('/api/school-info', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body)
                    });
                    if (res.ok) {
                        alert('Informasi sekolah berhasil disimpan!');
                        loadSchoolInfoSection(false);
                    } else {
                        alert('Gagal menyimpan informasi sekolah');
                    }
                };
            }
        })
        .catch(() => {
            section.innerHTML = '<h2>Informasi Sekolah</h2><p style="color:#FFD600;">Gagal memuat data.</p>';
        });
}

async function loadEskulSection() {
    const res = await fetch('/api/eskul');
    const eskulList = await res.json();
    let html = `
        <h2>Ekstrakurikuler</h2>
        <button class="btn btn-primary" id="addEskulBtn">Tambah Eskul</button>
        <div class="eskul-grid" id="eskulList">
            ${eskulList.map(e => `
                <div class="eskul-card">
                    <div class="eskul-logo">
                        ${e.logo ? `<img src="${e.logo}" alt="Logo ${e.nama_eskul}">` : `<span class="eskul-icon"><i class='fas fa-users'></i></span>`}
                    </div>
                    <div class="eskul-info">
                        <div class="eskul-nama">${e.nama_eskul}</div>
                        <div class="eskul-deskripsi">${e.deskripsi || '-'}</div>
                        <div class="eskul-kontak"><i class="fas fa-phone"></i> ${e.kontak_center || '-'}</div>
                        <div class="eskul-actions" style="margin-top:1rem;display:flex;gap:0.5rem;justify-content:center;">
                            <button class="btn btn-secondary btn-sm" onclick="showEditEskulForm(${e.id})"><i class="fas fa-edit"></i> Edit</button>
                            <button class="btn btn-logout btn-sm" onclick="deleteEskul(${e.id})"><i class="fas fa-trash"></i> Hapus</button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    section.innerHTML = html;
    document.getElementById('addEskulBtn').onclick = showAddEskulForm;
}

function showAddEskulForm() {
    section.innerHTML = `
        <h2>Tambah Ekstrakurikuler</h2>
        <form id="formAddEskul" enctype="multipart/form-data" style="max-width:400px;margin:auto;background:#fff;color:#23272F;border-radius:16px;box-shadow:0 4px 24px #26324A22;border:2px solid #EFCB68;">
            <div style="display:flex;flex-direction:column;gap:1rem;">
                <label>
                    Nama Eskul
                    <input type="text" name="nama_eskul" placeholder="Nama Eskul" required style="width:100%;padding:0.5rem;border-radius:6px;border:1px solid #333;background:#222;color:#fff;">
                </label>
                <label>
                    Deskripsi
                    <textarea name="deskripsi" placeholder="Deskripsi" rows="3" style="width:100%;padding:0.5rem;border-radius:6px;border:1px solid #333;background:#222;color:#fff;"></textarea>
                </label>
                <label>
                    Kontak Center
                    <input type="text" name="kontak_center" placeholder="Kontak Center" style="width:100%;padding:0.5rem;border-radius:6px;border:1px solid #333;background:#222;color:#fff;">
                </label>
                <label>
                    Logo Eskul
                    <input type="file" name="logo" accept="image/*" id="logoInput" style="display:none;">
                    <button type="button" class="btn btn-file" id="customFileBtn">Pilih Logo Eskul</button>
                    <span id="fileNameLabel" style="margin-left:1rem;color:#FFD600;font-size:0.95em;"></span>
                    <div id="logoPreview" style="margin-top:0.5rem;"></div>
                </label>
                <div style="display:flex;gap:1rem;justify-content:flex-end;">
                    <button type="submit" class="btn btn-primary">Simpan</button>
                    <button type="button" class="btn btn-secondary" onclick="loadEskulSection()">Batal</button>
                </div>
            </div>
        </form>
    `;
    
    const logoInput = document.getElementById('logoInput');
    const customFileBtn = document.getElementById('customFileBtn');
    const fileNameLabel = document.getElementById('fileNameLabel');
    const logoPreview = document.getElementById('logoPreview');
    customFileBtn.onclick = function(e) {
        e.preventDefault();
        logoInput.click();
    };
    logoInput.onchange = function() {
        logoPreview.innerHTML = '';
        if (this.files && this.files[0]) {
            fileNameLabel.textContent = this.files[0].name;
            const img = document.createElement('img');
            img.src = URL.createObjectURL(this.files[0]);
            img.style.maxWidth = '120px';
            img.style.maxHeight = '120px';
            img.style.borderRadius = '8px';
            img.style.marginTop = '0.5rem';
            logoPreview.appendChild(img);
        } else {
            fileNameLabel.textContent = '';
        }
    };
    document.getElementById('formAddEskul').onsubmit = async function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const nama = formData.get('nama_eskul');
        if (!nama) {
            alert('Nama Eskul wajib diisi!');
            return;
        }
        await fetch('/api/eskul', { method: 'POST', body: formData });
        loadEskulSection();
    };
}

async function loadScheduleSection() {
    
    const jurusanList = [
        'RPL',
        'TKJ',
        'TSM',
        'TKR',
        'TKL',
        'DPIB',
        'TPM'
    ];
    let jurusan = sessionStorage.getItem('jadwal_jurusan') || jurusanList[0];
    let kelas = sessionStorage.getItem('jadwal_kelas') || 'X';
   
    let html = `
        <h2>Jadwal Pelajaran</h2>
        <button class="btn btn-primary" id="addJadwalBtn">Tambah Jadwal</button>
        <form id="filterJadwalForm" style="margin-bottom:1.5rem;display:flex;gap:1rem;align-items:center;">
            <label>Jurusan:
                <select name="jurusan" id="jadwalJurusan">
                    ${jurusanList.map(j => `<option value="${j}" ${j === jurusan ? 'selected' : ''}>${j}</option>`).join('')}
                </select>
            </label>
            <label>Kelas:
                <select name="kelas" id="jadwalKelas">
                    <option value="X" ${kelas === 'X' ? 'selected' : ''}>X</option>
                    <option value="XI" ${kelas === 'XI' ? 'selected' : ''}>XI</option>
                    <option value="XII" ${kelas === 'XII' ? 'selected' : ''}>XII</option>
                </select>
            </label>
            <button type="submit" class="btn btn-primary">Tampilkan</button>
        </form>
        <div id="jadwalList"></div>
    `;
    section.innerHTML = html;
    document.getElementById('filterJadwalForm').onsubmit = function(e) {
        e.preventDefault();
        jurusan = document.getElementById('jadwalJurusan').value;
        kelas = document.getElementById('jadwalKelas').value;
        sessionStorage.setItem('jadwal_jurusan', jurusan);
        sessionStorage.setItem('jadwal_kelas', kelas);
        renderJadwalList(jurusan, kelas);
    };
    document.getElementById('addJadwalBtn').onclick = showAddJadwalForm;
    renderJadwalList(jurusan, kelas);
}

function showAddJadwalForm() {
    const jurusanList = [
        'RPL', 'TKJ', 'TSM', 'TKR', 'TKL', 'DPIB', 'TPM'
    ];
    section.innerHTML = `
        <h2>Tambah Jadwal Pelajaran</h2>
        <form id="formAddJadwal" enctype="multipart/form-data" style="max-width:400px;margin:auto;background:#fff;color:#23272F;border-radius:16px;box-shadow:0 4px 24px #26324A22;border:2px solid #EFCB68;">
            <div style="display:flex;flex-direction:column;gap:1rem;">
                <label>Kelas
                    <select name="kelas" required style="width:100%;padding:0.5rem;border-radius:6px;border:1px solid #333;background:#222;color:#fff;">
                        <option value="X">X</option>
                        <option value="XI">XI</option>
                        <option value="XII">XII</option>
                    </select>
                </label>
                <label>Jurusan
                    <select name="jurusan" required style="width:100%;padding:0.5rem;border-radius:6px;border:1px solid #333;background:#222;color:#fff;">
                        ${jurusanList.map(j => `<option value="${j}">${j}</option>`).join('')}
                    </select>
                </label>
                <label>File Jadwal (JPG, PNG)
                    <input type="file" name="jadwal_gambar" accept="image/jpeg,image/png" required style="width:100%;padding:0.5rem;border-radius:6px;border:1px solid #333;background:#222;color:#fff;">
                </label>
                <div style="display:flex;gap:1rem;justify-content:flex-end;">
                    <button type="submit" class="btn btn-primary">Simpan</button>
                    <button type="button" class="btn btn-secondary" onclick="loadScheduleSection()">Batal</button>
                </div>
            </div>
        </form>
    `;
    
    document.getElementById('formAddJadwal').onsubmit = async function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const file = formData.get('jadwal_gambar');
        
        if (!file || !(file.type === 'image/jpeg' || file.type === 'image/png')) {
            alert('Hanya file JPG atau PNG yang diperbolehkan!');
            return;
        }
        
        try {
            const response = await fetch('/api/jadwal/upload', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                loadScheduleSection();
            } else {
                alert('Gagal mengupload jadwal');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Terjadi kesalahan saat mengupload');
        }
    };
}



window.showEditJadwalForm = async function(id) {
    
    const res = await fetch(`/api/jadwal?all=1`);
    const jadwalList = await res.json();
    const jadwal = jadwalList.find(j => j.id == id);
    if (!jadwal) {
        alert('Jadwal tidak ditemukan');
        return;
    }
    const jurusanList = [
        'RPL', 'TKJ', 'TSM', 'TKR', 'TKL', 'DPIB', 'TPM'
    ];
    section.innerHTML = `
        <h2>Edit Gambar, Kelas & Jurusan Jadwal</h2>
        <form id="formEditJadwal" enctype="multipart/form-data" style="max-width:400px;margin:auto;background:#fff;color:#23272F;border-radius:16px;box-shadow:0 4px 24px #26324A22;border:2px solid #EFCB68;">
            <div style="display:flex;flex-direction:column;gap:1rem;">
                <label>Gambar Jadwal (JPG, PNG)
                    <input type="file" name="jadwal_gambar" accept="image/jpeg,image/png" id="jadwalGambarInput" style="display:none;">
                    <button type="button" class="btn btn-file" id="customJadwalGambarBtn">Pilih Gambar Baru</button>
                    <span id="jadwalGambarNameLabel" style="margin-left:1rem;color:#FFD600;font-size:0.95em;"></span>
                    <div id="jadwalGambarPreview" style="margin-top:0.5rem;">
                        ${jadwal.gambar ? `<img src="${jadwal.gambar}" alt="Gambar Jadwal" style="max-width:220px;max-height:140px;border-radius:10px;">` : ''}
                    </div>
                    <input type="hidden" name="current_gambar" value="${jadwal.gambar || ''}">
                </label>
                <label>Kelas
                    <select name="kelas" required style="width:100%;padding:0.5rem;border-radius:6px;border:1px solid #333;background:#222;color:#fff;">
                        ${['X','XI','XII'].map(k => `<option value="${k}" ${jadwal.kelas===k?'selected':''}>${k}</option>`).join('')}
                    </select>
                </label>
                <label>Jurusan
                    <select name="jurusan" required style="width:100%;padding:0.5rem;border-radius:6px;border:1px solid #333;background:#222;color:#fff;">
                        ${jurusanList.map(j => `<option value="${j}" ${jadwal.jurusan===j?'selected':''}>${j}</option>`).join('')}
                    </select>
                </label>
                <div style="display:flex;gap:1rem;justify-content:flex-end;">
                    <button type="submit" class="btn btn-primary">Update</button>
                    <button type="button" class="btn btn-secondary" onclick="loadScheduleSection()">Batal</button>
                </div>
            </div>
        </form>
    `;
    
    const jadwalGambarInput = document.getElementById('jadwalGambarInput');
    const customJadwalGambarBtn = document.getElementById('customJadwalGambarBtn');
    const jadwalGambarNameLabel = document.getElementById('jadwalGambarNameLabel');
    const jadwalGambarPreview = document.getElementById('jadwalGambarPreview');
    customJadwalGambarBtn.onclick = function(e) {
        e.preventDefault();
        jadwalGambarInput.click();
    };
    jadwalGambarInput.onchange = function() {
        jadwalGambarPreview.innerHTML = '';
        if (this.files && this.files[0]) {
            jadwalGambarNameLabel.textContent = this.files[0].name;
            const img = document.createElement('img');
            img.src = URL.createObjectURL(this.files[0]);
            img.style.maxWidth = '220px';
            img.style.maxHeight = '140px';
            img.style.borderRadius = '10px';
            img.style.marginTop = '0.5rem';
            jadwalGambarPreview.appendChild(img);
        } else {
            jadwalGambarNameLabel.textContent = '';
        }
    };
    document.getElementById('formEditJadwal').onsubmit = async function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        await fetch(`/api/jadwal/${id}`, { method: 'PUT', body: formData });
        loadScheduleSection();
    };
};


window.deleteJadwal = function(id) {
    showConfirm('Yakin ingin menghapus jadwal ini?', async function() {
        await fetch(`/api/jadwal/${id}`, { method: 'DELETE' });
        loadScheduleSection();
    });
};


async function loadElectionSection() {
    // Fetch kandidat dari backend
    const kandidatRes = await fetch('/api/kandidat');
    const kandidatList = await kandidatRes.json();
    
    let hasilRes, hasilVoting;
    try {
      hasilRes = await fetch('/api/pemilihan/rekap');
      hasilVoting = await hasilRes.json();
    } catch {
      
      const pemilihanRes = await fetch('/api/pemilihan');
      const pemilihanList = await pemilihanRes.json();
      hasilVoting = {};
      kandidatList.forEach(k => {
        hasilVoting[k.id] = pemilihanList.filter(p => p.kandidat_id === k.id).length;
      });
    }
    
    const totalSuara = Object.values(hasilVoting).reduce((a, b) => a + b, 0);
   
    let hasilHtml = `
      <div class="result-box" style="margin-bottom:2rem;">
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr>
              <th style="text-align:left;padding:0.7rem 0;font-weight:700;font-size:1.08rem;color:#EFCB68;">Kandidat</th>
              <th style="text-align:center;color:#EFCB68;">Suara</th>
              <th style="text-align:center;color:#EFCB68;">Persentase</th>
            </tr>
          </thead>
          <tbody>
            ${kandidatList.map(k => {
              const suara = hasilVoting[k.id] || 0;
              const persen = totalSuara ? ((suara/totalSuara)*100).toFixed(1) : 0;
              return `<tr style="border-top:1px solid #EFCB6822;">
                <td style="padding:0.5rem 0;color:#26324A;font-weight:600;">${k.nama}</td>
                <td style="text-align:center;font-weight:700;color:#23272F;">${suara}</td>
                <td style="text-align:center;">
                  <div style='background:#EFCB6822;border-radius:8px;overflow:hidden;position:relative;height:22px;max-width:120px;margin:auto;'>
                    <div style='background:#EFCB68;height:100%;width:${persen}%;position:absolute;left:0;top:0;'></div>
                    <span style='position:relative;z-index:2;color:#23272F;font-weight:700;'>${persen}%</span>
                  </div>
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
        <div style="margin-top:1.2rem;color:#26324A;font-weight:700;font-size:1.08rem;">Total Suara Masuk: ${totalSuara}</div>
      </div>
    `;
    let html = `
        ${hasilHtml}
        <h2>Pemilihan Ketua & Wakil Ketua OSIS</h2>
        <button class="btn btn-primary" id="addKandidatBtn">Tambah Kandidat</button>
        <div class="kandidat-grid" style="margin-top:2rem;">
            ${kandidatList.map((k, idx) => `
                <div class="kandidat-card">
                    <div class="kandidat-nomor">${idx + 1}</div>
                    <div class="kandidat-foto">
                        ${k.foto ? `<img src="${k.foto}" alt="Foto ${k.nama}">` : `<span class="eskul-icon"><i class='fas fa-user'></i></span>`}
                    </div>
                    <div class="kandidat-nama">${k.nama}</div>
                    <div class="kandidat-nis">NIS: ${k.nis}</div>
                    <div class="kandidat-posisi">${k.posisi}</div>
                    <div class="kandidat-visi"><b>Visi:</b> ${k.visi}</div>
                    <div class="kandidat-misi"><b>Misi:</b> ${k.misi}</div>
                    <div class="eskul-actions" style="margin-top:1rem;display:flex;gap:0.5rem;justify-content:center;">
                        <button class="btn btn-secondary btn-sm" onclick="showEditKandidatForm(${k.id})"><i class="fas fa-edit"></i> Edit</button>
                        <button class="btn btn-logout btn-sm" onclick="deleteKandidat(${k.id})"><i class="fas fa-trash"></i> Hapus</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    section.innerHTML = html;
    document.getElementById('addKandidatBtn').onclick = showAddKandidatForm;
}


function showAddKandidatForm() {
    section.innerHTML = `
        <h2>Tambah Kandidat OSIS</h2>
        <form id="formAddKandidat" enctype="multipart/form-data" style="max-width:400px;margin:auto;background:#fff;color:#23272F;border-radius:16px;box-shadow:0 4px 24px #26324A22;border:2px solid #EFCB68;">
            <div style="display:flex;flex-direction:column;gap:1rem;">
                <label>
                    Nama Lengkap
                    <input type="text" name="nama" placeholder="Nama Lengkap" required style="width:100%;padding:0.5rem;border-radius:6px;border:1px solid #333;background:#222;color:#fff;">
                </label>
                <label>
                    NIS
                    <input type="text" name="nis" placeholder="NIS" required style="width:100%;padding:0.5rem;border-radius:6px;border:1px solid #333;background:#222;color:#fff;">
                </label>
                <label>
                    Posisi
                    <select name="posisi" required style="width:100%;padding:0.5rem;border-radius:6px;border:1px solid #333;background:#222;color:#fff;">
                        <option value="ketos">Ketua OSIS</option>
                        <option value="waketos">Wakil Ketua OSIS</option>
                    </select>
                </label>
                <label>
                    Visi
                    <textarea name="visi" placeholder="Visi" rows="2" required style="width:100%;padding:0.5rem;border-radius:6px;border:1px solid #333;background:#222;color:#fff;"></textarea>
                </label>
                <label>
                    Misi
                    <textarea name="misi" placeholder="Misi" rows="3" required style="width:100%;padding:0.5rem;border-radius:6px;border:1px solid #333;background:#222;color:#fff;"></textarea>
                </label>
                <label>
                    Foto Kandidat (opsional)
                    <input type="file" name="foto" accept="image/*" id="fotoInput" style="display:none;">
                    <button type="button" class="btn btn-file" id="customFotoBtn">Pilih Foto</button>
                    <span id="fotoNameLabel" style="margin-left:1rem;color:#FFD600;font-size:0.95em;"></span>
                    <div id="fotoPreview" style="margin-top:0.5rem;"></div>
                </label>
                <div style="display:flex;gap:1rem;justify-content:flex-end;">
                    <button type="submit" class="btn btn-primary">Simpan</button>
                    <button type="button" class="btn btn-secondary" onclick="loadElectionSection()">Batal</button>
                </div>
            </div>
        </form>
    `;
    
    const fotoInput = document.getElementById('fotoInput');
    const customFotoBtn = document.getElementById('customFotoBtn');
    const fotoNameLabel = document.getElementById('fotoNameLabel');
    const fotoPreview = document.getElementById('fotoPreview');
    customFotoBtn.onclick = function(e) {
        e.preventDefault();
        fotoInput.click();
    };
    fotoInput.onchange = function() {
        fotoPreview.innerHTML = '';
        if (this.files && this.files[0]) {
            fotoNameLabel.textContent = this.files[0].name;
            const img = document.createElement('img');
            img.src = URL.createObjectURL(this.files[0]);
            img.style.maxWidth = '120px';
            img.style.maxHeight = '120px';
            img.style.borderRadius = '8px';
            img.style.marginTop = '0.5rem';
            fotoPreview.appendChild(img);
        } else {
            fotoNameLabel.textContent = '';
        }
    };
    document.getElementById('formAddKandidat').onsubmit = async function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        await fetch('/api/kandidat', { method: 'POST', body: formData });
        alert('Kandidat berhasil ditambahkan!');
        loadElectionSection();
    };
}


document.addEventListener('DOMContentLoaded', () => {
  loadSection('school-info');
}); 

window.deleteEskul = function(id) {
    showConfirm('Yakin ingin menghapus eskul ini?', async function() {
        const res = await fetch(`/api/eskul/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (!res.ok) {
            alert(data.error || 'Gagal menghapus eskul');
            return;
        }
        loadEskulSection();
    });
}; 


function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}


window.showEditEskulForm = async function(id) {
    try {
        const res = await fetch(`/api/eskul`);
        const eskulList = await res.json();
        const eskul = eskulList.find(e => e.id == id);
        
        if (!eskul) {
            alert('Eskul tidak ditemukan');
            return;
        }
        
        section.innerHTML = `
            <h2>Edit Ekstrakurikuler</h2>
            <form id="formEditEskul" enctype="multipart/form-data" style="max-width:400px;margin:auto;background:#fff;color:#23272F;border-radius:16px;box-shadow:0 4px 24px #26324A22;border:2px solid #EFCB68;">
                <input type="hidden" name="eskul_id" value="${eskul.id}">
                <div style="display:flex;flex-direction:column;gap:1rem;">
                    <label>
                        Nama Eskul
                        <input type="text" name="nama_eskul" value="${eskul.nama_eskul}" placeholder="Nama Eskul" required style="width:100%;padding:0.5rem;border-radius:6px;border:1px solid #333;background:#222;color:#fff;">
                    </label>
                    <label>
                        Deskripsi
                        <textarea name="deskripsi" placeholder="Deskripsi" rows="3" style="width:100%;padding:0.5rem;border-radius:6px;border:1px solid #333;background:#222;color:#fff;">${eskul.deskripsi || ''}</textarea>
                    </label>
                    <label>
                        Kontak Center
                        <input type="text" name="kontak_center" value="${eskul.kontak_center || ''}" placeholder="Kontak Center" style="width:100%;padding:0.5rem;border-radius:6px;border:1px solid #333;background:#222;color:#fff;">
                    </label>
                    <label>
                        Logo Eskul (Opsional)
                        <input type="file" name="logo" accept="image/*" id="logoInput" style="display:none;">
                        <button type="button" class="btn btn-file" id="customFileBtn">Pilih Logo Baru</button>
                        <span id="fileNameLabel" style="margin-left:1rem;color:#FFD600;font-size:0.95em;"></span>
                        <div id="logoPreview" style="margin-top:0.5rem;">
                            ${eskul.logo ? `<img src="${eskul.logo}" alt="Logo ${eskul.nama_eskul}" style="max-width:120px;max-height:120px;border-radius:8px;">` : ''}
                        </div>
                        <input type="hidden" name="current_logo" value="${eskul.logo || ''}">
                    </label>
                    <div style="display:flex;gap:1rem;justify-content:flex-end;">
                        <button type="submit" class="btn btn-primary">Update</button>
                        <button type="button" class="btn btn-secondary" onclick="loadEskulSection()">Batal</button>
                    </div>
                </div>
            </form>
        `;
        
        
        const logoInput = document.getElementById('logoInput');
        const customFileBtn = document.getElementById('customFileBtn');
        const fileNameLabel = document.getElementById('fileNameLabel');
        const logoPreview = document.getElementById('logoPreview');
        
        customFileBtn.onclick = function(e) {
            e.preventDefault();
            logoInput.click();
        };
        
        logoInput.onchange = function() {
            if (this.files && this.files[0]) {
                fileNameLabel.textContent = this.files[0].name;
                const img = document.createElement('img');
                img.src = URL.createObjectURL(this.files[0]);
                img.style.maxWidth = '120px';
                img.style.maxHeight = '120px';
                img.style.borderRadius = '8px';
                logoPreview.innerHTML = '';
                logoPreview.appendChild(img);
            } else {
                fileNameLabel.textContent = '';
            }
        };
        
        document.getElementById('formEditEskul').onsubmit = async function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const nama = formData.get('nama_eskul');
            if (!nama) {
                alert('Nama Eskul wajib diisi!');
                return;
            }
            
            try {
                const res = await fetch(`/api/eskul/${id}`, { 
                    method: 'PUT', 
                    body: formData 
                });
                const data = await res.json();
                
                if (!res.ok) {
                    alert(data.error || 'Gagal mengupdate eskul');
                    return;
                }
                
                alert('Eskul berhasil diupdate!');
                loadEskulSection();
            } catch (error) {
                alert('Terjadi kesalahan saat mengupdate eskul');
                console.error(error);
            }
        };
        
    } catch (error) {
        alert('Terjadi kesalahan saat memuat data eskul');
        console.error(error);
    }
}; 


window.showEditKandidatForm = async function(id) {
    
    const res = await fetch('/api/kandidat');
    const kandidatList = await res.json();
    const kandidat = kandidatList.find(k => k.id == id);
    if (!kandidat) {
        alert('Kandidat tidak ditemukan');
        return;
    }
    section.innerHTML = `
        <h2>Edit Kandidat OSIS</h2>
        <form id="formEditKandidat" enctype="multipart/form-data" style="max-width:400px;margin:auto;background:#fff;color:#23272F;border-radius:16px;box-shadow:0 4px 24px #26324A22;border:2px solid #EFCB68;">
            <div style="display:flex;flex-direction:column;gap:1rem;">
                <label>Nama Lengkap
                    <input type="text" name="nama" value="${kandidat.nama}" required style="width:100%;padding:0.5rem;border-radius:6px;border:1px solid #333;background:#222;color:#fff;">
                </label>
                <label>NIS
                    <input type="text" name="nis" value="${kandidat.nis}" required style="width:100%;padding:0.5rem;border-radius:6px;border:1px solid #333;background:#222;color:#fff;">
                </label>
                <label>Posisi
                    <select name="posisi" required style="width:100%;padding:0.5rem;border-radius:6px;border:1px solid #333;background:#222;color:#fff;">
                        <option value="ketos" ${kandidat.posisi==='ketos'?'selected':''}>Ketua OSIS</option>
                        <option value="waketos" ${kandidat.posisi==='waketos'?'selected':''}>Wakil Ketua OSIS</option>
                    </select>
                </label>
                <label>Visi
                    <textarea name="visi" required style="width:100%;padding:0.5rem;border-radius:6px;border:1px solid #333;background:#222;color:#fff;">${kandidat.visi||''}</textarea>
                </label>
                <label>Misi
                    <textarea name="misi" required style="width:100%;padding:0.5rem;border-radius:6px;border:1px solid #333;background:#222;color:#fff;">${kandidat.misi||''}</textarea>
                </label>
                <label>Foto Kandidat (opsional)
                    <input type="file" name="foto" accept="image/*" id="fotoInput" style="display:none;">
                    <button type="button" class="btn btn-file" id="customFotoBtn">Pilih Foto Baru</button>
                    <span id="fotoNameLabel" style="margin-left:1rem;color:#FFD600;font-size:0.95em;"></span>
                    <div id="fotoPreview" style="margin-top:0.5rem;">
                        ${kandidat.foto ? `<img src="${kandidat.foto}" alt="Foto ${kandidat.nama}" style="max-width:120px;max-height:120px;border-radius:8px;">` : ''}
                    </div>
                    <input type="hidden" name="current_foto" value="${kandidat.foto || ''}">
                </label>
                <div style="display:flex;gap:1rem;justify-content:flex-end;">
                    <button type="submit" class="btn btn-primary">Update</button>
                    <button type="button" class="btn btn-secondary" onclick="loadElectionSection()">Batal</button>
                </div>
            </div>
        </form>
    `;
    
    const fotoInput = document.getElementById('fotoInput');
    const customFotoBtn = document.getElementById('customFotoBtn');
    const fotoNameLabel = document.getElementById('fotoNameLabel');
    const fotoPreview = document.getElementById('fotoPreview');
    customFotoBtn.onclick = function(e) {
        e.preventDefault();
        fotoInput.click();
    };
    fotoInput.onchange = function() {
        fotoPreview.innerHTML = '';
        if (this.files && this.files[0]) {
            fotoNameLabel.textContent = this.files[0].name;
            const img = document.createElement('img');
            img.src = URL.createObjectURL(this.files[0]);
            img.style.maxWidth = '120px';
            img.style.maxHeight = '120px';
            img.style.borderRadius = '8px';
            img.style.marginTop = '0.5rem';
            fotoPreview.appendChild(img);
        } else {
            fotoNameLabel.textContent = '';
        }
    };
    document.getElementById('formEditKandidat').onsubmit = async function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        await fetch(`/api/kandidat/${id}`, { method: 'PUT', body: formData });
        alert('Kandidat berhasil diupdate!');
        loadElectionSection();
    };
}

window.deleteKandidat = function(id) {
    showConfirm('Yakin ingin menghapus kandidat ini?', async function() {
        await fetch(`/api/kandidat/${id}`, { method: 'DELETE' });
        loadElectionSection();
    });
}; 

async function renderJadwalList(jurusan, kelas) {
    const res = await fetch(`/api/jadwal?jurusan=${encodeURIComponent(jurusan)}&kelas=${encodeURIComponent(kelas)}`);
    const jadwal = await res.json();
    let html = `<div class="jadwal-grid">`;
    html += jadwal.map(j => `
      <div class="jadwal-card">
        ${j.gambar ? `<img src="${j.gambar}" alt="Jadwal Kelas ${j.kelas}" class="jadwal-img">` : ''}
        <div class="jadwal-info">
          <div><b>${j.mata_pelajaran}</b></div>
          <div>Guru: ${j.guru || '-'}</div>
          <div>Kelas: <b>${j.kelas}</b> | Jurusan: <b>${j.jurusan}</b></div>
        </div>
        <div class="eskul-actions" style="margin-top:1rem;display:flex;gap:0.5rem;justify-content:center;">
          <button class="btn btn-secondary btn-sm" onclick="showEditJadwalForm(${j.id})"><i class="fas fa-edit"></i> Edit</button>
          <button class="btn btn-logout btn-sm" onclick="deleteJadwal(${j.id})"><i class="fas fa-trash"></i> Hapus</button>
        </div>
      </div>
    `).join('');
    html += `</div>`;
    document.getElementById('jadwalList').innerHTML = html;
} 

async function showEskulPeserta(eskulId) {
  const res = await fetch(`/api/eskul/${eskulId}/peserta`);
  const peserta = await res.json();
  
} 

window.showEditUjianForm = async function(id) {
  const res = await fetch('/api/ujian');
  const ujianList = await res.json();
  const ujian = ujianList.find(u => u.id == id);
  if (!ujian) {
    alert('Data ujian tidak ditemukan');
    return;
  }
  section.innerHTML = `
    <h2>Edit Link Ujian</h2>
    <form id="formEditUjian" style="max-width:500px;margin:auto;background:#fff;color:#23272F;border-radius:16px;box-shadow:0 4px 24px #26324A22;border:2px solid #EFCB68;">
      <div style="display:flex;flex-direction:column;gap:1rem;">
        <label>Nama Ujian
          <input type="text" name="nama_ujian" value="${ujian.nama_ujian || ''}" required style="width:100%;padding:0.5rem;border-radius:6px;border:1px solid #333;background:#222;color:#fff;">
        </label>
        <label>Link Ujian
          <input type="url" name="link_ujian" value="${ujian.link_ujian || ''}" required style="width:100%;padding:0.5rem;border-radius:6px;border:1px solid #333;background:#222;color:#fff;">
        </label>
        <label>Deskripsi
          <textarea name="deskripsi" rows="2" style="width:100%;padding:0.5rem;border-radius:6px;border:1px solid #333;background:#222;color:#fff;">${ujian.deskripsi || ''}</textarea>
        </label>
        <label>Tanggal Mulai
          <input type="datetime-local" name="tanggal_mulai" value="${ujian.tanggal_mulai ? ujian.tanggal_mulai.substring(0,16) : ''}" style="width:100%;padding:0.5rem;border-radius:6px;border:1px solid #333;background:#222;color:#fff;">
        </label>
        <label>Tanggal Selesai
          <input type="datetime-local" name="tanggal_selesai" value="${ujian.tanggal_selesai ? ujian.tanggal_selesai.substring(0,16) : ''}" style="width:100%;padding:0.5rem;border-radius:6px;border:1px solid #333;background:#222;color:#fff;">
        </label>
        <div style="display:flex;gap:1rem;justify-content:flex-end;">
          <button type="submit" class="btn btn-primary">Update</button>
          <button type="button" class="btn btn-secondary" onclick="loadExamSection()">Batal</button>
        </div>
      </div>
    </form>
  `;
  document.getElementById('formEditUjian').onsubmit = async function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const body = {};
    for (const [key, value] of formData.entries()) {
      body[key] = value;
    }
    await fetch(`/api/ujian/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    loadExamSection();
  };
};

window.deleteUjian = function(id) {
  showConfirm('Yakin ingin menghapus link ujian ini?', async function() {
    await fetch(`/api/ujian/${id}`, { method: 'DELETE' });
    loadExamSection();
  });
};

// Pastikan hanya collapse di mobile
function checkSidebarToggle() {
  if (window.innerWidth <= 900) {
    sidebar.classList.add('collapsed');
    sidebarToggle.style.display = '';
  } else {
    sidebar.classList.remove('collapsed');
    sidebarToggle.style.display = 'none';
  }
}
window.addEventListener('resize', checkSidebarToggle);
document.addEventListener('DOMContentLoaded', checkSidebarToggle);