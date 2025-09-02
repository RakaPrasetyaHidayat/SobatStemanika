document.addEventListener('DOMContentLoaded', function() {
  fetch('/api/user')
    .then(res => res.json())
    .then(data => {
      if (!data.user || data.user.role !== 'siswa') {
        window.location.href = '/';
      } else {
        document.getElementById('siswaName').textContent = data.user.nama || 'Siswa';
        window._siswaUser = data.user; 
        loadSiswaDashboard();
      }
    });

  
  var user = window._siswaUser || { nama: 'Siswa' };
  document.getElementById('welcomeName').textContent = user.nama || 'Siswa';
 
  var now = new Date();
  var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('currentDate').textContent = now.toLocaleDateString('id-ID', options);

 
  setTimeout(function() {
    const eskulGrid = document.querySelector('.eskul-grid');
    const leftArrow = document.getElementById('eskulLeftArrow');
    const rightArrow = document.getElementById('eskulRightArrow');
    const dotsContainer = document.getElementById('eskulDots');
    const cardWidth = 340; 
    const cardsPerPage = Math.floor(eskulGrid.offsetWidth / cardWidth) || 1;
    const totalCards = eskulGrid.children.length;
    const totalPages = Math.ceil(totalCards / cardsPerPage);
    let currentPage = 0;

    function scrollToPage(page) {
      currentPage = Math.max(0, Math.min(page, totalPages - 1));
      eskulGrid.scrollTo({ left: currentPage * cardWidth * cardsPerPage, behavior: 'smooth' });
      updateEskulDots(currentPage, totalPages);
    }

    leftArrow.onclick = () => scrollToPage(currentPage - 1);
    rightArrow.onclick = () => scrollToPage(currentPage + 1);

    eskulGrid.onscroll = function() {
      const page = Math.round(eskulGrid.scrollLeft / (cardWidth * cardsPerPage));
      if (page !== currentPage) {
        currentPage = page;
        updateEskulDots(currentPage, totalPages);
      }
    };

    updateEskulDots(currentPage, totalPages);
  }, 800);

  
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      this.classList.add('active');
      const href = this.getAttribute('href');
      if (href && href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });
});

function loadSiswaDashboard() {
  const section = document.getElementById('siswaSection');
  if (section) section.innerHTML = '<div>Memuat data...</div>';

  Promise.all([
    fetch('/api/school-info').then(r => r.json()),
    fetch('/api/eskul').then(r => r.json()),
    fetch('/api/kandidat').then(r => r.json()),
    fetch('/api/ujian').then(r => r.json())
  ]).then(([info, eskulList, kandidatList, ujianList]) => {
    
    const schoolInfoBox = document.getElementById('schoolInfoBox');
    if (schoolInfoBox) {
      schoolInfoBox.innerHTML = `
        <b>${info.nama_sekolah ?? '-'}</b><br>
        ${info.alamat ?? '-'}<br>
        Telp: ${info.telepon ?? '-'} | Email: ${info.email ?? '-'}<br>
        <div style="margin-top:0.5rem;">${info.deskripsi ?? ''}</div>
      `;
    }
    
    document.getElementById('eskulList').innerHTML = eskulList.map(e => `
      <div class="eskul-card">
        <div class="eskul-logo">
          ${e.logo ? `<img src="${e.logo}" alt="Logo ${e.nama_eskul}">` : `<span class="eskul-icon"><i class='fas fa-users'></i></span>`}
        </div>
        <div class="eskul-info">
          <div class="eskul-nama">${e.nama_eskul}</div>
          <div class="eskul-deskripsi">${e.deskripsi || '-'}</div>
          <div class="eskul-kontak"><i class="fas fa-phone"></i> ${e.kontak_center || '-'}</div>
        </div>
      </div>
    `).join('');
   
    document.getElementById('kandidatList').innerHTML = kandidatList.map(k => `
      <div class="kandidat-card siswa-kandidat-card">
        ${k.foto ? `<img src="${k.foto}" class="kandidat-foto-img">` : '<div class="kandidat-foto-placeholder"><i class="fas fa-user"></i></div>'}
        <div class="kandidat-info-block">
          <b>${k.nama}</b> <span class="kandidat-posisi">(${k.posisi})</span><br>
          <span class="kandidat-visi"><b>Visi:</b> ${k.visi}</span><br>
          <span class="kandidat-misi"><b>Misi:</b> ${k.misi}</span>
        </div>
        <button class="btn btn-primary btn-sm" onclick="verifikasiPilihKandidat(${k.id}, '${k.nama.replace(/'/g, "\\'")}')">Pilih</button>
      </div>
    `).join('');
    
    document.getElementById('ujianList').innerHTML = ujianList.map(u => `
      <div class="ujian-card">
        <b>${u.nama_ujian}</b><br>
        <span>${u.deskripsi || ''}</span><br>
        <span class="ujian-tanggal">${formatTanggalUjian(u.tanggal_mulai, u.tanggal_selesai)}</span><br>
        <a href="${u.link_ujian}" target="_blank" class="btn btn-secondary btn-sm">Buka Ujian</a>
      </div>
    `).join('');
    
    renderJadwalSiswa();
  });
}

function renderJadwalSiswa() {
  const user = window._siswaUser;
  if (!user || !user.kelas || !user.jurusan) return;
  
  fetch(`/api/jadwal?kelas=${encodeURIComponent(user.kelas)}&jurusan=${encodeURIComponent(user.jurusan)}`)
    .then(res => res.json())
    .then(jadwalList => {
      const jadwalBox = document.getElementById('jadwalBox');
      if (!jadwalBox) return;
      if (!jadwalList || jadwalList.length === 0) {
        jadwalBox.innerHTML = '<div style="color:#FFD600;">Jadwal pelajaran belum diunggah.</div>';
        return;
      }
      
      const jadwalWithImage = jadwalList.find(j => j.gambar);
      if (jadwalWithImage && jadwalWithImage.gambar) {
        jadwalBox.innerHTML = `<div style="text-align:center;"><img src="${jadwalWithImage.gambar}" alt="Jadwal Pelajaran" style="max-width:100%;border-radius:12px;box-shadow:0 2px 12px #0002;"></div>`;
      } else {
        
        let html = '<table class="jadwal-table"><thead><tr><th>Hari</th><th>Jam</th><th>Mata Pelajaran</th><th>Guru</th></tr></thead><tbody>';
        jadwalList.forEach(j => {
          html += `<tr><td>${j.hari}</td><td>${j.jam_mulai} - ${j.jam_selesai}</td><td>${j.mata_pelajaran}</td><td>${j.guru || '-'}</td></tr>`;
        });
        html += '</tbody></table>';
        jadwalBox.innerHTML = html;
      }
    });
}

function updateEskulDots(currentPage, totalPages) {
  const dots = [];
  for (let i = 0; i < totalPages; i++) {
    dots.push(`<span class="eskul-dot${i === currentPage ? ' active' : ''}"></span>`);
  }
  document.getElementById('eskulDots').innerHTML = dots.join('');
}