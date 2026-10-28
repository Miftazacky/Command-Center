// ==========================================
// 1. KONTROL UI & JAM REAL-TIME GANDA
// ==========================================
function updateJam() {
    const waktu = new Date();
    const witaTime = waktu.toLocaleTimeString('id-ID', { hour12: false, timeZone: 'Asia/Makassar' });
    const utcTime = waktu.toLocaleTimeString('en-GB', { hour12: false, timeZone: 'UTC' });
    const dateStr = waktu.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Makassar' });
    
    document.getElementById('jam_tanggal').innerHTML = 
        `<span class="font-bold text-white">${witaTime} WITA</span> <span class="mx-2 text-slate-600">|</span> <span class="font-bold text-blue-300">${utcTime} UTC</span> <span class="mx-2 text-slate-600">|</span> ${dateStr}`;
}
setInterval(updateJam, 1000);
updateJam();

let sidebarOpen = false;
function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
    const sidebar = document.getElementById('sidebar');
    const arrow = document.getElementById('arrow_icon');
    if (sidebarOpen) {
        sidebar.classList.remove('translate-x-full');
        arrow.classList.add('rotate-180');
    } else {
        sidebar.classList.add('translate-x-full');
        arrow.classList.remove('rotate-180');
    }
}

// ==========================================
// FUNGSI UPDATE UI NOC (STATUS PERANGKAT)
// ==========================================
function updateStatusAlat(idAlat, statusCode, waktuTerakhir) {
    const badge = document.getElementById(`badge-${idAlat}`);
    const badgeText = document.getElementById(`badge-text-${idAlat}`);
    const dot = document.getElementById(`dot-${idAlat}`);
    const ping = document.getElementById(`last-ping-${idAlat}`);
    
    if(!badge) return;

    // Reset kelas bawaan lencana
    badge.className = "mt-4 px-5 py-2 rounded-full border flex items-center justify-center gap-2 transition-all";
    dot.className = "w-2.5 h-2.5 rounded-full";

    let isOnline = (statusCode === 1 || statusCode === "1");

    if (isOnline) {
        // --- JIKA ALAT ONLINE ---
        badge.classList.add("bg-emerald-500/10", "border-emerald-500/30");
        dot.classList.add("bg-emerald-500", "shadow-[0_0_8px_rgba(16,185,129,0.8)]");
        badgeText.className = "text-xs font-bold tracking-widest text-emerald-400";
        
        if(idAlat === 'awos') {
            badgeText.innerText = "ONLINE (3/3)";
            ['04', 'm', '22'].forEach(pt => {
                let l = document.getElementById(`led-awos-${pt}`);
                if(l) l.className = "w-6 h-6 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.7)] transition-all duration-300";
            });
        } else {
            badgeText.innerText = "ONLINE";
            let l = document.getElementById(`led-${idAlat}`);
            let g = document.getElementById(`glow-${idAlat}`);
            if(l) l.className = "w-12 h-12 rounded-full bg-emerald-500 relative z-10 border-2 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all duration-300";
            if(g) g.className = "absolute inset-0 rounded-full blur-md opacity-50 bg-emerald-500 transition-all";
        }
    } else {
        // --- JIKA ALAT OFFLINE ---
        badge.classList.add("bg-rose-500/10", "border-rose-500/30");
        dot.classList.add("bg-rose-500", "animate-pulse");
        badgeText.className = "text-xs font-bold tracking-widest text-rose-400";
        badgeText.innerText = "OFFLINE (DISCONNECT)";

        if(idAlat === 'awos') {
            ['04', 'm', '22'].forEach(pt => {
                let l = document.getElementById(`led-awos-${pt}`);
                if(l) l.className = "w-6 h-6 rounded-full bg-rose-500 animate-pulse shadow-[0_0_15px_rgba(225,29,72,0.7)] transition-all duration-300";
            });
        } else {
            let l = document.getElementById(`led-${idAlat}`);
            let g = document.getElementById(`glow-${idAlat}`);
            if(l) l.className = "w-12 h-12 rounded-full bg-rose-500 relative z-10 border-2 border-rose-400 animate-pulse shadow-[0_0_20px_rgba(225,29,72,0.5)] transition-all duration-300";
            if(g) g.className = "absolute inset-0 rounded-full blur-md opacity-50 bg-rose-500 transition-all animate-pulse";
        }
    }

    if (ping) ping.innerText = waktuTerakhir || "--";
}

function renderArgStatusGrid(dataARG) {
    const container = document.getElementById('arg-status-grid');
    if(!container) return;
    
    container.innerHTML = ''; // Bersihkan loading

    dataARG.forEach(st => {
        let baterai = parseFloat(st.tegangan_baterai);
        let statusWarna = "bg-green-900/40 border-green-500 text-green-400"; // Normal
        let ikonBaterai = '<i class="fas fa-battery-full"></i>';
        let warnaWaktu = "text-slate-400"; // Warna waktu normal
        
        // Logika Status Kritis
        if (baterai < 11.5) {
            statusWarna = "bg-yellow-900/40 border-yellow-500 text-yellow-400 animate-pulse"; // Warning
            ikonBaterai = '<i class="fas fa-battery-quarter text-yellow-500"></i>';
            warnaWaktu = "text-yellow-500/70";
        } else if (isNaN(baterai) || st.waktu_rekam == null) {
            statusWarna = "bg-red-900/40 border-red-500 text-red-500"; // Offline
            ikonBaterai = '<i class="fas fa-battery-empty text-red-500"></i>';
            warnaWaktu = "text-red-400/80";
        }

        // Format Waktu Rekam: Mengubah "2026-09-24T07:57:00+00:00" menjadi "24/09 15:57" (Dikonversi ke WITA)
        let waktuStr = "--/-- --:--";
        if (st.waktu_rekam) {
            try {
                // Buat objek Date dari string ISO 8601 Supabase (sudah mengerti +00:00)
                let d = new Date(st.waktu_rekam); 
                
                // Cek apakah tanggal valid
                if (!isNaN(d.getTime())) {
                    // Ekstrak hari dan bulan (padStart agar selalu 2 digit)
                    let tgl = String(d.getDate()).padStart(2, '0');
                    let bln = String(d.getMonth() + 1).padStart(2, '0');
                    
                    // Ekstrak jam dan menit (otomatis menyesuaikan zona waktu browser lokal / WITA)
                    let jam = String(d.getHours()).padStart(2, '0');
                    let mnt = String(d.getMinutes()).padStart(2, '0');
                    
                    waktuStr = `${tgl}/${bln} ${jam}:${mnt}`;
                } else {
                    waktuStr = "Invalid Date";
                }
            } catch (e) {
                waktuStr = "Parse Error";
            }
        }

        const box = document.createElement('div');
        // PERUBAHAN: Padding lebih besar (p-3 md:p-4) dan efek hover (zoom) yang elegan
        box.className = `p-3 md:p-4 rounded-xl border ${statusWarna} flex flex-col justify-between shadow-sm relative overflow-hidden transition-transform duration-300 hover:scale-105`;
        
        // PERUBAHAN: Teks judul stasiun & tegangan diperbesar agar tidak tenggelam di kotak yang luas
        box.innerHTML = `
            <div class="text-sm md:text-base font-bold truncate mb-2" title="${st.nama_stasiun}">${st.nama_stasiun.replace("ARG ", "")}</div>
            
            <div class="flex justify-between items-end mt-1 pt-3 border-t border-slate-700/50">
                <span class="text-xs font-mono tracking-tight font-semibold" title="Tegangan Baterai">
                    ${ikonBaterai} ${isNaN(baterai) ? '--' : baterai + 'V'}
                </span>
                <span class="text-[10px] font-mono ${warnaWaktu} tracking-tighter" title="Pembaruan Terakhir">
                    <i class="fa-regular fa-clock"></i> ${waktuStr}
                </span>
            </div>
        `;
        container.appendChild(box);
    });
}

function switchView(viewId) {
    // 1. Daftar semua ID halaman
    const views = ['view_noc', 'view_realtime', 'view_arg', 'view_trend_arg', 'view_trend_awos', 'view_trend_aws', 'view_trend_bam', 'view_mppt', 'view_kalibrasi', 'view_lifetime'];
    
    // 2. Sembunyikan semua halaman
    views.forEach(v => {
        let el = document.getElementById(v);
        if (el) {
            el.style.display = 'none'; 
            el.classList.remove('hidden', 'view-hidden');
        }
    });

    // 3. Atur Judul Header
    const titles = { 
        'realtime': 'Live Monitor', 
        'trend_awos': 'Analisis AWOS', 
        'trend_aws': 'Analisis AWS', 
        'trend_bam': 'Analisis BAM', 
        'trend_arg': 'Analisis Tren ARG',
        'arg': 'Jaringan ARG',
        'noc': 'Status Perangkat',
        'kalibrasi': 'Manajemen Kalibrasi',
        'lifetime': 'Usia Pakai Aset',
        'mppt': 'Baterai MPPT AWOS' 
    };
    if (titles[viewId]) {
        document.getElementById('view_title').innerText = titles[viewId];
    }

    // ==========================================
    // PERBAIKAN: LOGIKA PENYOROTAN SIDEBAR
    // ==========================================
    // Tambahkan id tombol grafik tren ke dalam daftar
    const sidebarBtns = [
        'btn-noc', 'btn-realtime', 'btn-arg', 'btn-mppt', 
        'btn-kalibrasi', 'btn-lifetime',
        'btn-trend_awos', 'btn-trend_aws', 'btn-trend_bam', 'btn-trend_arg'
    ];
    
    // Reset semua tombol menjadi warna redup (slate-300)
    sidebarBtns.forEach(btnId => {
        let btn = document.getElementById(btnId);
        if (btn) {
            btn.classList.remove('text-blue-400', 'text-green-400');
            btn.classList.add('text-slate-300');
        }
    });

    // Nyalakan warna hanya pada tombol yang sedang aktif
    let activeBtn = document.getElementById('btn-' + viewId);
    if (activeBtn) {
        activeBtn.classList.remove('text-slate-300');
        // Khusus MPPT warnanya hijau, yang lain biru
        if (viewId === 'mppt') {
            activeBtn.classList.add('text-green-400');
        } else {
            activeBtn.classList.add('text-blue-400');
        }
    }
    // ==========================================

    if (sidebarOpen) toggleSidebar();

    // 4. Inisialisasi Grafik (Jika menu grafik diklik)
    if (viewId.startsWith('trend') && viewId !== 'trend_arg') {
        initCharts(viewId.replace('trend_', ''));
    }

    // 5. Munculkan Halaman yang Dipilih
    let targetView = viewId === 'noc' ? 'view_noc' :
                     viewId === 'arg' ? 'view_arg' : 
                     viewId === 'trend_arg' ? 'view_trend_arg' : 
                     viewId === 'realtime' ? 'view_realtime' : 
                     viewId === 'mppt' ? 'view_mppt' : 
                     'view_' + viewId;
                     
    let el = document.getElementById(targetView);
    if (el) {
        if (targetView === 'view_realtime' || targetView === 'view_noc' || targetView === 'view_mppt' || targetView === 'view_kalibrasi' || targetView === 'view_lifetime') {
            el.style.display = 'flex';
        } else {
            el.style.display = 'block';
        }
    }
    
    // 6. Fix Bug Leaflet Peta ARG
    if (viewId === 'arg' && typeof argMap !== 'undefined') {
        setTimeout(() => { argMap.invalidateSize(); }, 200);
    }
}

function konversiUtcKeWita(tanggal, jam) {
    if (!tanggal || !jam) return "--";
    let formatTanggal = tanggal;
    if (tanggal.includes('/')) {
        let parts = tanggal.split('/');
        formatTanggal = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    const dateObj = new Date(`${formatTanggal}T${jam}Z`); 
    if (isNaN(dateObj)) return `${tanggal}, ${jam}`;
    
    const opsiTanggal = { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Makassar' };
    const opsiJam = { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Makassar' }; 
    
    let strTanggal = dateObj.toLocaleDateString('en-GB', opsiTanggal); 
    let strJam = dateObj.toLocaleTimeString('id-ID', opsiJam).replace(/:/g, '.'); 
    return `${strTanggal}, ${strJam}`;
}

// ==========================================
// 2. KONTROL GRAFIK (LIVE PLOTTING DATA NYATA)
// ==========================================
let chartsInitialized = { awos: false, aws: false, bam: false };
window.myCharts = {}; // Objek global untuk menyimpan instance grafik

async function initCharts(tipe) {
    if (chartsInitialized[tipe]) return;

    // --- Konfigurasi Template Grafik ---
    const config = (label, color) => ({
        type: 'line',
        data: { labels: [], datasets: [{ label: label, data: [], borderColor: color, backgroundColor: color + '20', fill: true, tension: 0.4, pointBackgroundColor: color, pointRadius: 3, borderWidth: 2 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' } }, x: { grid: { display: false }, ticks: { color: '#94a3b8' } } } }
    });

    if (tipe === 'awos') {
        window.myCharts.awos_suhu = new Chart(document.getElementById('chart_awos_suhu'), config('Suhu', '#4ade80'));
        window.myCharts.awos_rh = new Chart(document.getElementById('chart_awos_rh'), config('Kelembapan', '#4ade80'));
        window.myCharts.awos_dew = new Chart(document.getElementById('chart_awos_dew'), config('Dew Point', '#4ade80'));
        window.myCharts.awos_angin = new Chart(document.getElementById('chart_awos_angin'), config('Kec Angin', '#4ade80'));
        window.myCharts.awos_qnh = new Chart(document.getElementById('chart_awos_qnh'), config('QNH', '#4ade80'));
        window.myCharts.awos_hujan = new Chart(document.getElementById('chart_awos_hujan'), config('Hujan', '#4ade80'));
        window.myCharts.awos_vis = new Chart(document.getElementById('chart_awos_vis'), config('Visibility', '#4ade80'));
        window.myCharts.awos_density = new Chart(document.getElementById('chart_awos_density'), config('Density Alt', '#4ade80'));
        
        try {

            const response = await fetch('https://kyizliqcqoeynhoybghv.supabase.co/rest/v1/awos_trend?select=*&order=id.desc&limit=30', {
                headers: {
                    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5aXpsaXFjcW9leW5ob3liZ2h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5NjI1MjIsImV4cCI6MjEwNTUzODUyMn0.BeBqPajbyPmeobAXymCBgvYG5Kud_WkTLUk2xcU0TCo',
                    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5aXpsaXFjcW9leW5ob3liZ2h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5NjI1MjIsImV4cCI6MjEwNTUzODUyMn0.BeBqPajbyPmeobAXymCBgvYG5Kud_WkTLUk2xcU0TCo'
                }
            });
            const dataDB = await response.json();
            dataDB.reverse().forEach(row => {
                let jam = konversiUtcKeWita(row.tanggal_alat, row.jam_alat).split(', ')[1];
                window.myCharts.awos_suhu.data.labels.push(jam); window.myCharts.awos_suhu.data.datasets[0].data.push(row.suhu);
                window.myCharts.awos_rh.data.labels.push(jam); window.myCharts.awos_rh.data.datasets[0].data.push(row.kelembaban);
                window.myCharts.awos_dew.data.labels.push(jam); window.myCharts.awos_dew.data.datasets[0].data.push(row.dewpoint);
                window.myCharts.awos_angin.data.labels.push(jam); window.myCharts.awos_angin.data.datasets[0].data.push(row.kec_angin);
                window.myCharts.awos_qnh.data.labels.push(jam); window.myCharts.awos_qnh.data.datasets[0].data.push(row.qnh);
                window.myCharts.awos_hujan.data.labels.push(jam); window.myCharts.awos_hujan.data.datasets[0].data.push(row.hujan);
                window.myCharts.awos_vis.data.labels.push(jam); window.myCharts.awos_vis.data.datasets[0].data.push(row.visibility);
                window.myCharts.awos_density.data.labels.push(jam); window.myCharts.awos_density.data.datasets[0].data.push(row.density_altitude);
            });
            ['suhu', 'rh', 'dew', 'angin', 'qnh', 'hujan', 'vis', 'density'].forEach(p => window.myCharts[`awos_${p}`].update());
        } catch (error) { console.error("Error AWOS:", error); }
        chartsInitialized.awos = true;
    } 
    else if (tipe === 'aws') {
        window.myCharts.aws_suhu = new Chart(document.getElementById('chart_aws_suhu'), config('Suhu', '#fbbf24'));
        window.myCharts.aws_rh = new Chart(document.getElementById('chart_aws_rh'), config('Kelembapan', '#fbbf24'));
        window.myCharts.aws_dew = new Chart(document.getElementById('chart_aws_dew'), config('Dew Point', '#fbbf24'));
        window.myCharts.aws_angin = new Chart(document.getElementById('chart_aws_angin'), config('Kec Angin', '#fbbf24'));
        window.myCharts.aws_press = new Chart(document.getElementById('chart_aws_press'), config('Tekanan', '#fbbf24'));
        window.myCharts.aws_qnh = new Chart(document.getElementById('chart_aws_qnh'), config('QNH', '#fbbf24'));
        window.myCharts.aws_rain = new Chart(document.getElementById('chart_aws_rain'), config('Hujan', '#fbbf24'));
        window.myCharts.aws_evap = new Chart(document.getElementById('chart_aws_evap'), config('Evaporasi', '#fbbf24'));
        window.myCharts.aws_rad = new Chart(document.getElementById('chart_aws_rad'), config('Radiasi', '#fbbf24'));
        
        try {

            const response = await fetch('https://kyizliqcqoeynhoybghv.supabase.co/rest/v1/aws_trend?select=*&order=id.desc&limit=30', {
                headers: {
                    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5aXpsaXFjcW9leW5ob3liZ2h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5NjI1MjIsImV4cCI6MjEwNTUzODUyMn0.BeBqPajbyPmeobAXymCBgvYG5Kud_WkTLUk2xcU0TCo',
                    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5aXpsaXFjcW9leW5ob3liZ2h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5NjI1MjIsImV4cCI6MjEwNTUzODUyMn0.BeBqPajbyPmeobAXymCBgvYG5Kud_WkTLUk2xcU0TCo'
                }
            });
            const dataDB = await response.json();
            dataDB.reverse().forEach(row => {
                let jam = konversiUtcKeWita(row.tanggal_alat, row.jam_alat).split(', ')[1];
                window.myCharts.aws_suhu.data.labels.push(jam); window.myCharts.aws_suhu.data.datasets[0].data.push(row.suhu);
                window.myCharts.aws_rh.data.labels.push(jam); window.myCharts.aws_rh.data.datasets[0].data.push(row.kelembaban);
                window.myCharts.aws_dew.data.labels.push(jam); window.myCharts.aws_dew.data.datasets[0].data.push(row.dew_point);
                window.myCharts.aws_angin.data.labels.push(jam); window.myCharts.aws_angin.data.datasets[0].data.push(row.kec_angin);
                window.myCharts.aws_press.data.labels.push(jam); window.myCharts.aws_press.data.datasets[0].data.push(row.tekanan);
                window.myCharts.aws_qnh.data.labels.push(jam); window.myCharts.aws_qnh.data.datasets[0].data.push(row.qnh);
                window.myCharts.aws_rain.data.labels.push(jam); window.myCharts.aws_rain.data.datasets[0].data.push(row.hujan);
                window.myCharts.aws_evap.data.labels.push(jam); window.myCharts.aws_evap.data.datasets[0].data.push(row.evaporasi);
                window.myCharts.aws_rad.data.labels.push(jam); window.myCharts.aws_rad.data.datasets[0].data.push(row.radiasi);
            });
            ['suhu', 'rh', 'dew', 'angin', 'press', 'qnh', 'rain', 'evap', 'rad'].forEach(p => window.myCharts[`aws_${p}`].update());
        } catch (error) { console.error("Error AWS:", error); }
        chartsInitialized.aws = true;
    }
    else if (tipe === 'bam') {
        window.myCharts.bam_pm25 = new Chart(document.getElementById('chart_bam_pm25'), config('PM 2.5', '#c084fc'));
        window.myCharts.bam_flow = new Chart(document.getElementById('chart_bam_flow'), config('Flow Rate', '#c084fc'));
        
        try {

            const response = await fetch('https://kyizliqcqoeynhoybghv.supabase.co/rest/v1/bam_trend?select=*&order=id.desc&limit=30', {
                headers: {
                    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5aXpsaXFjcW9leW5ob3liZ2h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5NjI1MjIsImV4cCI6MjEwNTUzODUyMn0.BeBqPajbyPmeobAXymCBgvYG5Kud_WkTLUk2xcU0TCo',
                    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5aXpsaXFjcW9leW5ob3liZ2h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5NjI1MjIsImV4cCI6MjEwNTUzODUyMn0.BeBqPajbyPmeobAXymCBgvYG5Kud_WkTLUk2xcU0TCo'
                }
            });
            const dataDB = await response.json();
            dataDB.reverse().forEach(row => {
                let jam = row.waktu_data ? row.waktu_data.split(' ')[1] : "--"; // Ambil jam dari waktu_data BAM
                window.myCharts.bam_pm25.data.labels.push(jam); window.myCharts.bam_pm25.data.datasets[0].data.push(row.pm25);
                window.myCharts.bam_flow.data.labels.push(jam); window.myCharts.bam_flow.data.datasets[0].data.push(row.flow_rate);
            });
            ['pm25', 'flow'].forEach(p => window.myCharts[`bam_${p}`].update());
        } catch (error) { console.error("Error BAM:", error); }
        chartsInitialized.bam = true;
    }
}

// Fungsi Helper untuk menyuntikkan data baru ke grafik
function updateChartData(chartName, labelWaktu, dataNilai) {
    let chart = window.myCharts[chartName];
    if (!chart) return; // Abaikan jika grafik belum dirender

    // Masukkan data baru
    chart.data.labels.push(labelWaktu);
    chart.data.datasets[0].data.push(parseFloat(dataNilai));

    // Batasi memori maksimal 30 titik (agar browser tidak lemot)
    if (chart.data.labels.length > 30) {
        chart.data.labels.shift(); // Hapus label paling kiri
        chart.data.datasets[0].data.shift(); // Hapus data paling kiri
    }
    chart.update(); // Gambar ulang grafik
}

// ==========================================
// 3. KONTROL AUTO-POLLING SUPABASE (PENGGANTI WEBSOCKET)
// ==========================================
const indikator = document.getElementById('indikator');
const statusKoneksi = document.getElementById('status_koneksi');

const supabaseHeaders = {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5aXpsaXFjcW9leW5ob3liZ2h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5NjI1MjIsImV4cCI6MjEwNTUzODUyMn0.BeBqPajbyPmeobAXymCBgvYG5Kud_WkTLUk2xcU0TCo',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5aXpsaXFjcW9leW5ob3liZ2h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5NjI1MjIsImV4cCI6MjEwNTUzODUyMn0.BeBqPajbyPmeobAXymCBgvYG5Kud_WkTLUk2xcU0TCo'
};

function updateDenganPeringatan(elementId, nilai, batasBahaya, warnaNormal) {
    const elemen = document.getElementById(elementId);
    if(!elemen) return;
    elemen.innerText = nilai;
    elemen.classList.remove(warnaNormal, 'text-red-500', 'animate-pulse');
    if (parseFloat(nilai) >= batasBahaya) elemen.classList.add('text-red-500', 'animate-pulse');
    else elemen.classList.add(warnaNormal);
}

// === TAMBAHAN BARU: FUNGSI DETEKSI BATAS BAWAH (UNTUK VISIBILITY) ===
function updateDenganPeringatanBawah(elementId, nilai, batasBahaya, warnaNormal) {
    const elemen = document.getElementById(elementId);
    if(!elemen) return;
    elemen.innerText = nilai;
    elemen.classList.remove(warnaNormal, 'text-red-500', 'animate-pulse');
    // Menyala merah HANYA jika nilai di bawah atau sama dengan batas bahaya
    if (parseFloat(nilai) <= batasBahaya) elemen.classList.add('text-red-500', 'animate-pulse');
    else elemen.classList.add(warnaNormal);
}

// ==========================================
// FUNGSI HELPER FORMAT WAKTU KESERAGAMAN (BAM & MPPT TANPA DETIK)
// ==========================================
function formatWaktuSeragam(isoString) {
    if (!isoString) return "--";
    let d = new Date(isoString);
    if (isNaN(d.getTime())) d = new Date(isoString.replace(' ', 'T'));
    if (isNaN(d.getTime())) return isoString; 
    
    let tgl = d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Makassar' }); 
    let jam = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Makassar' }).replace(/:/g, '.'); // <-- Detik dihapus di sini
    
    return `${tgl}, ${jam}`;
}

// Fungsi menarik data terbaru (1 baris terakhir) untuk Dashboard Live
async function fetchLiveDashboard() {
    indikator.classList.add('animate-ping'); 
    
    // PERHATIAN: Masukkan API Key Anda di bawah ini
    const localHeaders = {
       "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5aXpsaXFjcW9leW5ob3liZ2h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5NjI1MjIsImV4cCI6MjEwNTUzODUyMn0.BeBqPajbyPmeobAXymCBgvYG5Kud_WkTLUk2xcU0TCo",
       "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5aXpsaXFjcW9leW5ob3liZ2h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5NjI1MjIsImV4cCI6MjEwNTUzODUyMn0.BeBqPajbyPmeobAXymCBgvYG5Kud_WkTLUk2xcU0TCo"
    };
    
    try {
        // ==========================================
        // 1. TARIK AWS DIGITAL (Timeout 1 Jam)
        // ==========================================
        let resAWS = await fetch('https://kyizliqcqoeynhoybghv.supabase.co/rest/v1/aws_trend?select=*&order=id.desc&limit=1', { headers: localHeaders });
        let dataAWS = await resAWS.json();
        if(dataAWS.length > 0) {
            let data = dataAWS[0];
            updateDenganPeringatan("aws_suhu", data.suhu, 35, 'text-blue-400');
            document.getElementById("aws_rh").innerText = data.kelembaban;
            document.getElementById("aws_angin_kec").innerText = data.kec_angin;
            document.getElementById("aws_angin_arah").innerText = data.arah_angin;
            if(document.getElementById("aws_angin_jarum")) document.getElementById("aws_angin_jarum").style.transform = `rotate(${data.arah_angin}deg)`;
            document.getElementById("aws_hujan").innerText = data.hujan;
            document.getElementById("aws_tekanan").innerText = data.tekanan;
            document.getElementById("aws_qnh").innerText = data.qnh;
            document.getElementById("aws_dewpoint").innerText = data.dew_point;
            document.getElementById("aws_evaporasi").innerText = data.evaporasi;
            document.getElementById("aws_radiasi").innerText = data.radiasi;
            
            // Validasi Null & Timeout (1 Jam)
            let isExpiredAWS = false;
            if (data.tanggal_alat && data.jam_alat) {
                let formatTgl = data.tanggal_alat.includes('/') ? data.tanggal_alat.split('/').reverse().join('-') : data.tanggal_alat;
                let dataTimeAWS = new Date(`${formatTgl}T${data.jam_alat}Z`).getTime();
                isExpiredAWS = ((new Date().getTime() - dataTimeAWS) / 3600000) > 1;
            } else isExpiredAWS = true;

            let isNullAWS = (
                data.suhu == null || data.kelembaban == null || data.dew_point == null ||
                data.kec_angin == null || data.arah_angin == null || data.tekanan == null ||
                data.qnh == null || data.hujan == null || data.evaporasi == null || data.radiasi == null
            );

            let finalStatusAWS = (isExpiredAWS || isNullAWS || data.status_alat == 0) ? 0 : 1;
            let waktuAWS = konversiUtcKeWita(data.tanggal_alat, data.jam_alat);
            
            updateStatusAlat('aws', finalStatusAWS, waktuAWS);            
            if(data.tanggal_alat && data.jam_alat) document.getElementById("aws_update").innerText = waktuAWS;
        }

        // ==========================================
        // 2. TARIK AWOS (Cuaca & Sensor Timeout 1 Jam)
        // ==========================================
        let resAWOS = await fetch('https://kyizliqcqoeynhoybghv.supabase.co/rest/v1/awos_trend?select=*&order=id.desc&limit=1', { headers: localHeaders });
        let dataAWOS = await resAWOS.json();
        if(dataAWOS.length > 0) {
            let data = dataAWOS[0];
            updateDenganPeringatan("awos_suhu", data.suhu, 35, 'text-green-300');
            document.getElementById("awos_rh").innerText = data.kelembaban;
            document.getElementById("awos_qnh").innerText = data.qnh;
            document.getElementById("awos_angin_kec").innerText = data.kec_angin;
            document.getElementById("awos_angin_arah").innerText = data.arah_angin;
            if(document.getElementById("awos_angin_jarum")) document.getElementById("awos_angin_jarum").style.transform = `rotate(${data.arah_angin}deg)`;
            document.getElementById("awos_dewpoint").innerText = data.dewpoint;
            let hujan = parseFloat(data.hujan);
            document.getElementById("awos_hujan").innerText = isNaN(hujan) ? data.hujan : hujan.toFixed(2);
            document.getElementById("awos_density").innerText = data.density_altitude;
            
            let vis = parseFloat(data.visibility); 
            let visAkhir = isNaN(vis) ? data.visibility : (vis > 10000 ? 10000 : Math.round(vis));
            updateDenganPeringatanBawah("awos_vis", visAkhir, 5000, 'text-green-300');
            document.getElementById("awos_sky").innerText = data.sky_condition === "" ? "CLEAR" : data.sky_condition;
            document.getElementById("awos_metar").innerText = data.metar;
            
            if(data.tanggal_alat && data.jam_alat) document.getElementById("awos_update").innerText = konversiUtcKeWita(data.tanggal_alat, data.jam_alat);
        }

        // --- Cek Komprehensif Tabel awos_sensors ---
        let resAwosSensors = await fetch('https://kyizliqcqoeynhoybghv.supabase.co/rest/v1/awos_sensors?select=*&order=id.desc&limit=3', { headers: localHeaders });
        let dataAwosSensors = await resAwosSensors.json();
        
        let onlineCount = 0;
        let waktuUpdateAwos = "--";
        
        // Default matikan semua LED dulu
        ['04', 'm', '22'].forEach(pt => {
            let led = document.getElementById(`led-awos-${pt}`);
            if(led) led.className = "w-6 h-6 rounded-full bg-rose-500 animate-pulse shadow-[0_0_15px_rgba(225,29,72,0.7)] transition-all duration-300";
        });

        if (dataAwosSensors.length > 0) {
            dataAwosSensors.forEach(sensor => {
                let code = sensor.sensor_code ? sensor.sensor_code.toLowerCase() : "";
                
                // 1. Cek Timeout 1 Jam
                let isExpired = false;
                if (sensor.created_at) {
                    let dataTime = new Date(sensor.created_at).getTime();
                    isExpired = ((new Date().getTime() - dataTime) / 3600000) > 1;
                } else isExpired = true;

                // 2. Cek Parameter Kosong (Null)
                let isNull = (
                    sensor.wind_speed_kt == null || sensor.wind_dir_deg == null ||
                    sensor.temp_c == null || sensor.dewpoint_c == null ||
                    sensor.rh_persen == null || sensor.qnh_hpa == null || sensor.rain_accum_mm == null
                );
                
                // 3. Pengecualian Visibility Khusus Sensor 04 & 22
                if (code === '04' || code === '22') {
                    if (sensor.visibility_m == null) isNull = true;
                }

                // Nyalakan LED Hijau hanya jika data lengkap & tidak expired
                let led = document.getElementById(`led-awos-${code}`);
                if (led && !isExpired && !isNull) {
                    led.className = "w-6 h-6 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.7)] transition-all duration-300";
                    onlineCount++;
                }

                if (sensor.created_at) waktuUpdateAwos = formatWaktuSeragam(sensor.created_at);
            });
        }
        
        // Logika Lencana AWOS (OFFLINE jika salah satu mati)
        const badgeAwos = document.getElementById('badge-awos');
        const badgeTextAwos = document.getElementById('badge-text-awos');
        const dotAwos = document.getElementById('dot-awos');
        const pingAwos = document.getElementById('last-ping-awos');
        
        if (badgeAwos && badgeTextAwos && dotAwos) {
            badgeAwos.className = "mt-4 px-5 py-2 rounded-full border flex items-center justify-center gap-2 transition-all";
            dotAwos.className = "w-2.5 h-2.5 rounded-full";
            
            if (onlineCount === 3) {
                badgeAwos.classList.add("bg-emerald-500/10", "border-emerald-500/30");
                dotAwos.classList.add("bg-emerald-500", "shadow-[0_0_8px_rgba(16,185,129,0.8)]");
                badgeTextAwos.className = "text-xs font-bold tracking-widest text-emerald-400";
                badgeTextAwos.innerText = `ONLINE (3/3)`;
            } else {
                badgeAwos.classList.add("bg-rose-500/10", "border-rose-500/30");
                dotAwos.classList.add("bg-rose-500", "animate-pulse");
                badgeTextAwos.className = "text-xs font-bold tracking-widest text-rose-400";
                badgeTextAwos.innerText = "OFFLINE (DISCONNECT)";
            }
        }
        if (pingAwos) pingAwos.innerText = waktuUpdateAwos;

        // ==========================================
        // 3. TARIK KUALITAS UDARA BAM (Timeout 2 Jam)
        // ==========================================
        let resBAM = await fetch('https://kyizliqcqoeynhoybghv.supabase.co/rest/v1/bam_trend?select=*&order=id.desc&limit=1', { headers: localHeaders });
        let dataBAM = await resBAM.json();
        if(dataBAM.length > 0) {
            let data = dataBAM[0];
            updateDenganPeringatan("bam_pm25", data.pm25, 100, 'text-purple-400');
            document.getElementById("bam_flow").innerText = data.flow_rate;
            
            // Validasi Null, Anomali, & Timeout (2 Jam)
            let isExpiredBAM = false;
            if (data.created_at) {
                let dataTimeBAM = new Date(data.created_at).getTime();
                isExpiredBAM = ((new Date().getTime() - dataTimeBAM) / 3600000) > 2; // Timeout 2 Jam
            } else isExpiredBAM = true;

            let isNullBAM = (data.pm25 == null || data.flow_rate == null);
            let isAnomalyBAM = (parseFloat(data.pm25) > 10000);

            let finalStatusBAM = (isExpiredBAM || isNullBAM || isAnomalyBAM || data.status_alat == 0) ? 0 : 1;
            
            let waktuBAM = formatWaktuSeragam(data.waktu_data || data.created_at);
            updateStatusAlat('bam', finalStatusBAM, waktuBAM);
            if (data.waktu_data !== undefined) document.getElementById("bam_waktu").innerText = waktuBAM;
        }

        // ==========================================
        // 4. TARIK BATERAI MPPT (Dashboard Bawah)
        // ==========================================
        let resMPPT = await fetch('https://kyizliqcqoeynhoybghv.supabase.co/rest/v1/mppt_data?select=*&order=id.desc&limit=1', { headers: localHeaders });
        let dataMPPTArr = await resMPPT.json();
        if (dataMPPTArr.length > 0) {
            let mpptData = dataMPPTArr[0];
            let socVal = parseFloat(mpptData.mppt_soc);
            let socTextEl = document.getElementById("ribbon_soc_text");
            if (socTextEl) socTextEl.innerText = !isNaN(socVal) ? Math.round(socVal) : "--";
            
            let voltEl = document.getElementById("ribbon_volt");
            if (voltEl) voltEl.innerText = mpptData.mppt_volt !== undefined && mpptData.mppt_volt !== null ? mpptData.mppt_volt : "--";
            
            let bar = document.getElementById("ribbon_soc_bar");
            if (bar) {
                if (!isNaN(socVal)) {
                    bar.style.width = `${socVal}%`;
                    bar.className = "h-full transition-all duration-700 ";
                    if (socVal > 60) bar.classList.add("bg-emerald-500");
                    else if (socVal > 25) bar.classList.add("bg-yellow-400");
                    else bar.classList.add("bg-rose-500", "animate-pulse");
                } else {
                    bar.style.width = "0%";
                    bar.className = "h-full bg-slate-600 transition-all duration-700";
                }
            }

            let modeStr = mpptData.mppt_mode ? mpptData.mppt_mode : "--";
            let modeEl = document.getElementById("ribbon_mode");
            let modeIcon = document.getElementById("ribbon_mode_icon");
            if (modeEl && modeIcon) {
                modeEl.innerText = modeStr;
                if (modeStr.toLowerCase().includes("boost")) {
                    modeEl.className = "text-sm font-bold text-yellow-400 uppercase tracking-wider";
                    modeIcon.className = "fas fa-bolt text-yellow-400 animate-pulse";
                } else if (modeStr.toLowerCase().includes("float")) {
                    modeEl.className = "text-sm font-bold text-emerald-400 uppercase tracking-wider";
                    modeIcon.className = "fas fa-battery-full text-emerald-400";
                } else {
                    modeEl.className = "text-sm font-bold text-slate-300 uppercase tracking-wider";
                    modeIcon.className = "fas fa-battery-half text-slate-500";
                }
            }

            let aiEl = document.getElementById("ribbon_ai");
            if (aiEl) {
                let aiText = mpptData.mppt_prediksi ? mpptData.mppt_prediksi : "Menunggu kalkulasi...";
                aiEl.innerText = aiText;
                if (aiText.toLowerCase().includes("habis") || aiText.toLowerCase().includes("kritis")) {
                    aiEl.className = "text-sm font-bold text-rose-400 z-10 animate-pulse";
                } else if (aiText.toLowerCase().includes("penuh") || aiText.toLowerCase().includes("charging")) {
                    aiEl.className = "text-sm font-bold text-emerald-400 z-10";
                } else {
                    aiEl.className = "text-sm font-bold text-slate-300 z-10";
                }
            }

            let ribbonUpdate = document.getElementById("ribbon_update");
            if (ribbonUpdate) {
                let timeStr = "--";
                if (mpptData.waktu_alat) timeStr = formatWaktuSeragam(mpptData.waktu_alat);
                else if (mpptData.created_at) timeStr = formatWaktuSeragam(mpptData.created_at);
                ribbonUpdate.innerText = timeStr;
            }
        }

        // ==========================================
        // 5. TARIK STATUS JARINGAN ARG KALTIM
        // ==========================================
        const referensiARG = {
            "ARG Ancalong": { lat: 0.44178100, lon: 116.67340000 },
            "ARG Babulu": { lat: -1.53039450, lon: 116.40295040 },
            "ARG Gunung Elai": { lat: 0.13275000, lon: 117.47475000 },
            "ARG Kariangau": { lat: -1.20067400, lon: 116.81837700 },
            "ARG Kotabangun": { lat: -0.25627800, lon: 116.59240000 },
            "ARG Melak": { lat: -0.29808330, lon: 115.78316660 },
            "ARG Muara Badak": { lat: -0.34719400, lon: 117.42670000 },
            "ARG Muara Muntai": { lat: -0.35555000, lon: 116.38861000 },
            "ARG Paser": { lat: -1.90031000, lon: 116.19740000 },
            "ARG Rekayasa IKN": { lat: -0.91021200, lon: 116.83882000 },
            "ARG Samboja": { lat: -1.01347900, lon: 117.08600000 },
            "ARG Sambutan": { lat: -0.55946800, lon: 117.22097400 },
            "ARG Sangatta": { lat: 0.69429900, lon: 117.29501900 },
            "ARG Sangkulirang": { lat: 0.98633000, lon: 117.98147800 },
            "ARG Sebulu": { lat: -0.26875000, lon: 117.00560000 },
            "ARG Talisayan": { lat: 1.58014000, lon: 118.17352000 },
            "ARG Timbau": { lat: -0.44666660, lon: 116.99431660 }
        };

        const daftarStasiun = Object.keys(referensiARG);
        let dataARGGabungan = [];

        const argPromises = daftarStasiun.map(stasiun => {
            return fetch(`https://kyizliqcqoeynhoybghv.supabase.co/rest/v1/arg_trend?select=*&nama_stasiun=eq.${encodeURIComponent(stasiun)}&order=id.desc&limit=1`, { headers: localHeaders })
                .then(res => res.json())
                .then(data => data.length > 0 ? data[0] : null);
        });

        const argResults = await Promise.all(argPromises);

        argResults.forEach((st) => {
            if (st && st.nama_stasiun) {
                dataARGGabungan.push({
                    nama_stasiun: st.nama_stasiun,
                    total_hujan: st.total_hujan,
                    suhu_panel: st.suhu_panel,
                    tegangan_baterai: st.tegangan_baterai,
                    waktu_rekam: st.waktu,
                    koordinat: referensiARG[st.nama_stasiun]
                });
            }
        });

        if(dataARGGabungan.length > 0) {
            updateArgData(dataARGGabungan); 
            processArgTrendData(dataARGGabungan);
            renderArgStatusGrid(dataARGGabungan);
        }

        setTimeout(() => indikator.classList.remove('animate-ping'), 300);
        indikator.classList.replace('bg-red-500', 'bg-green-500');
        statusKoneksi.innerText = "Sistem Online (Cloud)";

    } catch (error) {
        console.error("Gagal sinkronisasi Live Dashboard:", error);
        indikator.classList.replace('bg-green-500', 'bg-red-500');
        statusKoneksi.innerText = "Koneksi Terputus!";
    }
}

// Jalankan tarikan pertama saat web dibuka
fetchLiveDashboard();

// Ulangi penarikan data setiap 15 detik (15000 milidetik)
setInterval(fetchLiveDashboard, 60000);

// ==========================================
// 🌍 LOGIKA DASHBOARD ARG (PETA, KARTU, TABEL)
// ==========================================

let argMap; // Variabel global untuk menampung peta
let argMarkers = {}; // Objek untuk menyimpan titik penanda stasiun

let currentArgSort = { column: 'nama', direction: 'asc' }; // Status urutan saat ini
let latestArgArray = []; // Menyimpan cadangan data terakhir untuk diurutkan ulang

// Fungsi pemicu saat judul kolom tabel diklik
function triggerArgSort(column) {
    if (currentArgSort.column === column) {
        // Jika klik kolom yang sama, balik arahnya (Ascending <-> Descending)
        currentArgSort.direction = currentArgSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        // Jika klik kolom baru, tentukan arah default yang logis
        currentArgSort.column = column;
        // Default: Baterai & Nama dari terkecil. Hujan & Suhu dari terbesar.
        currentArgSort.direction = (column === 'baterai' || column === 'nama') ? 'asc' : 'desc';
    }
    
    // Render ulang layar menggunakan cadangan data terakhir
    if (latestArgArray.length > 0) {
        updateArgData(latestArgArray);
    }
}

// Memaksa background putih bawaan Leaflet menjadi transparan (Bypass Cache)
if (!document.getElementById('hapus-bingkai-leaflet')) {
    let style = document.createElement('style');
    style.id = 'hapus-bingkai-leaflet';
    style.innerHTML = `
        .leaflet-popup-content-wrapper { background: transparent !important; box-shadow: none !important; padding: 0 !important; }
        .leaflet-popup-tip-container { display: none !important; }
        .leaflet-popup-content { margin: 0 !important; width: max-content !important; }
    `;
    document.head.appendChild(style);
}

// 1. Fungsi Switcher Tampilan ARG
function switchArgView(view) {
    // Sembunyikan semua kontainer
    document.getElementById('view-arg-map').classList.add('hidden');
    document.getElementById('view-arg-card').classList.add('hidden');
    document.getElementById('view-arg-table').classList.add('hidden');

    // Reset warna semua tombol menjadi redup
    const btns = ['btn-arg-map', 'btn-arg-card', 'btn-arg-table'];
    btns.forEach(id => {
        let btn = document.getElementById(id);
        btn.classList.remove('bg-blue-600', 'text-white', 'shadow-md');
        btn.classList.add('text-slate-400');
    });

    // Munculkan kontainer yang dipilih & nyalakan tombolnya
    if (view === 'map') {
        document.getElementById('view-arg-map').classList.remove('hidden');
        let btn = document.getElementById('btn-arg-map');
        btn.classList.remove('text-slate-400');
        btn.classList.add('bg-blue-600', 'text-white', 'shadow-md');
        
        // Fix Bug Leaflet: Render ulang peta setelah div dimunculkan dari hidden
        if (argMap) {
            setTimeout(() => { argMap.invalidateSize(); }, 200);
        }
    } 
    else if (view === 'card') {
        document.getElementById('view-arg-card').classList.remove('hidden');
        let btn = document.getElementById('btn-arg-card');
        btn.classList.remove('text-slate-400');
        btn.classList.add('bg-blue-600', 'text-white', 'shadow-md');
    }
    else if (view === 'table') {
        document.getElementById('view-arg-table').classList.remove('hidden');
        let btn = document.getElementById('btn-arg-table');
        btn.classList.remove('text-slate-400');
        btn.classList.add('bg-blue-600', 'text-white', 'shadow-md');
    }
}

// 2. Fungsi Menggambar Peta Awal (Dark Mode)
function initArgMap() {
    // Kordinat tengah Kalimantan Timur [Lat, Lon], Zoom Level 6
    argMap = L.map('map-container').setView([0.5, 116.5], 6);

    // Menggunakan Tile Layer Dark Mode yang elegan
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
        maxZoom: 16
    }).addTo(argMap); // Sesuaikan 'argMap' dengan nama variabel peta Anda
}

// Inisialisasi peta ARG setelah halaman siap
document.addEventListener('DOMContentLoaded', () => {
    initArgMap();
});

// 3. Fungsi Memasukkan Data ARG ke Peta, Kartu, dan Tabel
function updateArgData(argArray) {
    let cardHTML = '';
    let tableHTML = '';

    // Simpan data terbaru ke variabel global
    latestArgArray = argArray; 

    // ALGORITMA PENGURUTAN (SORTING)
    argArray.sort((a, b) => {
        let valA, valB;
        if (currentArgSort.column === 'nama') {
            valA = a.nama_stasiun || ""; valB = b.nama_stasiun || "";
        } else if (currentArgSort.column === 'hujan') {
            valA = parseFloat(a.total_hujan) || 0; valB = parseFloat(b.total_hujan) || 0;
        } else if (currentArgSort.column === 'suhu') {
            valA = parseFloat(a.suhu_panel) || 0; valB = parseFloat(b.suhu_panel) || 0;
        } else if (currentArgSort.column === 'baterai') {
            valA = parseFloat(a.tegangan_baterai) || 0; valB = parseFloat(b.tegangan_baterai) || 0;
        }

        if (valA < valB) return currentArgSort.direction === 'asc' ? -1 : 1;
        if (valA > valB) return currentArgSort.direction === 'asc' ? 1 : -1;
        return 0;
    });

    argArray.forEach(station => {
        let nama = station.nama_stasiun || "Unknown";
        let hujan = parseFloat(station.total_hujan);
        let suhu = parseFloat(station.suhu_panel);
        let bat = parseFloat(station.tegangan_baterai);
        let lat = parseFloat(station.koordinat.lat);
        let lon = parseFloat(station.koordinat.lon);
        
        let waktuRaw = station.waktu_rekam;
        let waktu = waktuRaw ? waktuRaw.replace('T', ' ').replace('.000Z', '') : "-";

        // ==========================================
        // LOGIKA PENGAMAN BARU (Timeout 1 Jam & Null)
        // ==========================================
        let isExpired = false;
        if (waktuRaw) {
            let dataTime = new Date(waktuRaw).getTime();
            isExpired = ((new Date().getTime() - dataTime) / 3600000) > 1;
        } else {
            isExpired = true;
        }

        let isNull = (
            station.tegangan_baterai == null || isNaN(bat) ||
            station.total_hujan == null || isNaN(hujan) ||
            station.suhu_panel == null || isNaN(suhu)
        );

        let isOffline = isExpired || isNull;
        
        // Tampilan angka jika offline/null
        let tampilHujan = (isOffline && isNull) ? '--' : (isNaN(hujan) ? 0 : hujan);
        let tampilSuhu = (isOffline && isNull) ? '--' : (isNaN(suhu) ? 0 : suhu);
        let tampilBat = (isOffline && isNull) ? '--' : (isNaN(bat) ? 0 : bat);

        // ==========================================
        // A. UPDATE PETA (MARKER & POP-UP)
        // ==========================================
        if (!isNaN(lat) && !isNaN(lon)) {
            let markerBg = '';
            let markerBorder = '#1e293b'; // Default border gelap
            let statusCuaca = '';

            if (isOffline) {
                markerBg = '#334155';     // Abu-abu Gelap (Mati/Kosong)
                markerBorder = '#ef4444'; // Garis tepi Merah (Error)
                statusCuaca = 'OFFLINE';
            } else if (hujan === 0) {
                markerBg = '#94a3b8';     // Abu-abu Terang (Cerah)
                statusCuaca = 'Cerah';
            } else if (hujan > 0 && hujan <= 5) {
                markerBg = '#38bdf8';     // Biru Muda
                statusCuaca = 'Hujan Ringan';
            } else if (hujan > 5 && hujan <= 10) {
                markerBg = '#2563eb';     // Biru Tua
                statusCuaca = 'Hujan Sedang';
            } else {
                markerBg = '#ef4444';     // Merah Murni
                statusCuaca = 'Hujan Lebat';
            }

            let customIcon = L.divIcon({
                className: 'custom-arg-marker',
                html: `<div style="width: 12px; height: 12px; background-color: ${markerBg}; border-radius: 50%; border: 2px solid ${markerBorder}; ${isOffline ? 'animation: pulse 2s infinite;' : ''}"></div>`,
                iconSize: [12, 12],
                iconAnchor: [6, 6]
            });

            // Logika Warna Baterai di Pop-up Peta (Batas 11.0V)
            let batColor = isOffline ? '#ef4444' : (bat < 11.0 ? '#eab308' : '#4ade80');
            
            // Pewarnaan teks status di popup (agar teks OFFLINE jadi merah)
            let statusTextColor = isOffline ? '#ef4444' : markerBg;
            
            let popupContent = `
                <div style="background: #1e293b; color: #f8fafc; padding: 14px; border-radius: 8px; border: 1px solid #334155; font-family: sans-serif; min-width: 160px; box-shadow: 0 10px 25px rgba(0,0,0,0.7);">
                    <h4 style="margin: 0 0 8px 0; font-size: 13px; color: ${statusTextColor}; border-bottom: 1px solid #334155; padding-bottom: 6px; text-transform: uppercase; letter-spacing: 1px;">${nama}</h4>
                    <div style="font-size: 12px; margin-bottom: 4px; display: flex; justify-content: space-between;"><span>Status:</span> <b style="color: ${statusTextColor};">${statusCuaca}</b></div>
                    <div style="font-size: 12px; margin-bottom: 4px; display: flex; justify-content: space-between;"><span>Hujan:</span> <b>${tampilHujan} mm</b></div>
                    <div style="font-size: 12px; display: flex; justify-content: space-between;"><span>Baterai:</span> <b style="color: ${batColor};">${tampilBat} V</b></div>
                </div>
            `;

            if (argMarkers[nama]) {
                argMarkers[nama].setLatLng([lat, lon]);
                argMarkers[nama].setIcon(customIcon);
                argMarkers[nama].setPopupContent(popupContent);
            } else {
                argMarkers[nama] = L.marker([lat, lon], { icon: customIcon })
                    .bindPopup(popupContent, { closeButton: false, offset: [0, -5], className: 'popup-arg-dark' })
                    .addTo(argMap);
            }
        }

        // ==========================================
        // B. UPDATE KARTU (CARD VIEW)
        // ==========================================
        let cardBg = '';
        let rainColor = '';
        
        if (isOffline) {
            cardBg = 'bg-red-900/10 border-red-500/30 opacity-70'; // Gelap & pudar jika mati
            rainColor = 'text-red-500/50';
        } else if (hujan > 0) {
            cardBg = 'bg-blue-900/40 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.6)]';
            rainColor = 'text-blue-400 font-extrabold';
        } else {
            cardBg = 'bg-slate-800 border-slate-700 shadow-md hover:border-slate-500';
            rainColor = 'text-slate-300';
        }
        
        // Baterai Kritis < 11.0V (Atau Offline)
        let batClass = isOffline ? 'text-red-500 font-bold' : (bat < 11.0 ? 'text-yellow-400 font-bold animate-pulse' : 'text-slate-400');

        cardHTML += `
            <div class="rounded-xl border ${cardBg} p-4 flex flex-col items-center justify-center transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl cursor-pointer">
                <span class="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2 text-center h-8">${nama}</span>
                <span class="${rainColor} text-3xl font-mono mb-1 transition-colors duration-300">${tampilHujan}</span>
                <span class="text-slate-500 text-[10px] uppercase tracking-widest mb-4">Hujan (mm)</span>
                <div class="w-full flex justify-between text-xs border-t border-slate-700/50 pt-2">
                    <span class="${batClass}"><i class="fa-solid ${isOffline ? 'fa-link-slash' : 'fa-battery-half'} mr-1"></i>${tampilBat}${tampilBat !== '--' ? 'V' : ''}</span>
                    <span class="text-slate-400"><i class="fa-solid fa-solar-panel mr-1"></i>${tampilSuhu}${tampilSuhu !== '--' ? '°C' : ''}</span>
                </div>
            </div>
        `;

        // ==========================================
        // C. UPDATE TABEL (TABLE VIEW)
        // ==========================================
        let trClass = isOffline ? 'bg-red-900/10 text-slate-500' : 'hover:bg-slate-700/50 transition-colors';
        let hujanColClass = isOffline ? 'text-red-500/50' : (hujan > 0 ? 'text-blue-400 font-bold' : 'text-slate-300');
        let batColClass = isOffline ? 'text-red-500' : (bat < 11.0 ? 'text-yellow-400 font-bold' : 'text-slate-300');

        tableHTML += `
            <tr class="${trClass}">
                <td class="px-6 py-3 font-medium ${isOffline ? 'text-red-400/70' : 'text-slate-200'}">${nama} ${isOffline ? '<span class="ml-2 text-[10px] bg-red-900/50 text-red-400 px-2 py-0.5 rounded uppercase">Offline</span>' : ''}</td>
                <td class="px-6 py-3 font-mono ${hujanColClass}">${tampilHujan}</td>
                <td class="px-6 py-3 ${isOffline ? 'text-slate-500' : 'text-slate-300'}">${tampilSuhu}</td>
                <td class="px-6 py-3 font-mono ${batColClass}">${tampilBat}</td>
                <td class="px-6 py-3 text-xs ${isOffline ? 'text-red-400/50' : 'text-slate-400'}">${waktu}</td>
            </tr>
        `;
    });

    document.getElementById('arg-card-container').innerHTML = cardHTML;
    document.getElementById('arg-table-body').innerHTML = tableHTML;
}

let argTrendChart = null;
let argSuhuChart = null;    // Variabel baru untuk Suhu
let argBateraiChart = null; // Variabel baru untuk Baterai
let selectedArgStation = "";

// 1. Inisialisasi Kanvas Chart.js
function initArgTrendChart() {
    // A. Setup Grafik Hujan (Biru)
    const ctxHujan = document.getElementById('chart_arg_hujan').getContext('2d');
    argTrendChart = new Chart(ctxHujan, {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Curah Hujan (mm)', data: [], borderColor: '#38bdf8', backgroundColor: 'rgba(56, 189, 248, 0.15)', borderWidth: 2, pointBackgroundColor: '#0284c7', pointRadius: 3, fill: true, tension: 0.4 }]},
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, grid: { color: '#334155' }, ticks: { color: '#94a3b8' } }, x: { grid: { display: false }, ticks: { color: '#94a3b8' } } }, plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } } }
    });

    // B. Setup Grafik Suhu (Kuning)
    const ctxSuhu = document.getElementById('chart_arg_suhu').getContext('2d');
    argSuhuChart = new Chart(ctxSuhu, {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Suhu Panel (°C)', data: [], borderColor: '#fbbf24', backgroundColor: 'rgba(251, 191, 36, 0.15)', borderWidth: 2, pointBackgroundColor: '#d97706', pointRadius: 3, fill: true, tension: 0.4 }]},
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' } }, x: { grid: { display: false }, ticks: { color: '#94a3b8' } } }, plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } } }
    });

    // C. Setup Grafik Baterai (Hijau)
    const ctxBat = document.getElementById('chart_arg_baterai').getContext('2d');
    argBateraiChart = new Chart(ctxBat, {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Baterai (V)', data: [], borderColor: '#4ade80', backgroundColor: 'rgba(74, 222, 128, 0.15)', borderWidth: 2, pointBackgroundColor: '#16a34a', pointRadius: 3, fill: true, tension: 0.4 }]},
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' } }, x: { grid: { display: false }, ticks: { color: '#94a3b8' } } }, plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } } }
    });
}

// 2. Fungsi Menarik Data dari API Node-RED
function fetchArgChartData(stasiun) {
    // 1. URL diarahkan ke tabel arg_trend dengan filter spesifik nama_stasiun
    let url = `https://kyizliqcqoeynhoybghv.supabase.co/rest/v1/arg_trend?select=*&nama_stasiun=eq.${encodeURIComponent(stasiun)}&order=id.desc&limit=30`;
    
    fetch(url, {
        headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5aXpsaXFjcW9leW5ob3liZ2h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5NjI1MjIsImV4cCI6MjEwNTUzODUyMn0.BeBqPajbyPmeobAXymCBgvYG5Kud_WkTLUk2xcU0TCo',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5aXpsaXFjcW9leW5ob3liZ2h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5NjI1MjIsImV4cCI6MjEwNTUzODUyMn0.BeBqPajbyPmeobAXymCBgvYG5Kud_WkTLUk2xcU0TCo'
        }
    })
    .then(response => response.json())
    .then(dataDB => {
        if (argTrendChart && dataDB.length > 0) {
            dataDB.reverse(); // Balik urutan agar dari terlama ke terbaru (dari kiri ke kanan grafik)
            
            let labels = [];
            let hujan = [];
            let suhu = [];
            let baterai = [];
            
            // 2. Ekstrak data mentah Supabase ke dalam array grafik
            dataDB.forEach(row => {
                // Ambil jam (Misal dari "2026-09-22 10:00:00" menjadi "10:00")
                let jam = row.waktu ? row.waktu.substring(11, 16) : "--";
                labels.push(jam);
                hujan.push(row.total_hujan);
                suhu.push(row.suhu_panel);
                baterai.push(row.tegangan_baterai);
            });

            // Update Data Hujan
            argTrendChart.data.labels = labels;
            argTrendChart.data.datasets[0].data = hujan;
            argTrendChart.update();

            // Update Data Suhu
            if (argSuhuChart) {
                argSuhuChart.data.labels = labels;
                argSuhuChart.data.datasets[0].data = suhu;
                argSuhuChart.update();
            }

            // Update Data Baterai
            if (argBateraiChart) {
                argBateraiChart.data.labels = labels;
                argBateraiChart.data.datasets[0].data = baterai;
                argBateraiChart.update();
            }
        }
    })
    .catch(error => console.error("Gagal terhubung ke API ARG Supabase:", error));
}

// 3. Fungsi Mengisi Dropdown & Memicu Auto-Update Grafik
function processArgTrendData(argArray) {
    let dropdown = document.getElementById('select_arg_station');
    let isDropdownEmpty = dropdown.options.length <= 1;

    // A. Isi dropdown hanya sekali saat web baru dibuka
    if (isDropdownEmpty) {
        dropdown.innerHTML = '<option value="">-- Pilih Stasiun ARG --</option>';
        argArray.forEach(station => {
            if (station.nama_stasiun) {
                let opt = document.createElement('option');
                opt.value = station.nama_stasiun;
                opt.text = station.nama_stasiun;
                dropdown.appendChild(opt);
            }
        });
    }

    // B. Auto-update grafik setiap ada data baru dari socket (jika dropdown sedang dipilih)
    if (selectedArgStation !== "") {
        fetchArgChartData(selectedArgStation);
    }
}

// 4. Sensor saat Operator memilih Dropdown
document.getElementById('select_arg_station').addEventListener('change', function(e) {
    selectedArgStation = e.target.value;
    
    let overlayHujan = document.getElementById('arg_chart_overlay');
    let overlaySuhu = document.getElementById('arg_chart_overlay_suhu');
    let overlayBaterai = document.getElementById('arg_chart_overlay_baterai');

    if (selectedArgStation !== "") {
        // Hilangkan pesan penutup dari KETIGA grafik
        if(overlayHujan) overlayHujan.classList.add('hidden');
        if(overlaySuhu) overlaySuhu.classList.add('hidden');
        if(overlayBaterai) overlayBaterai.classList.add('hidden');
        
        fetchArgChartData(selectedArgStation); // Tarik data dari Database
    } else {
        // Munculkan kembali KETIGA pesan penutup jika stasiun dikosongkan
        if(overlayHujan) overlayHujan.classList.remove('hidden');
        if(overlaySuhu) overlaySuhu.classList.remove('hidden');
        if(overlayBaterai) overlayBaterai.classList.remove('hidden');
    }
});

// 5. Nyalakan grafik saat web pertama dibuka
document.addEventListener('DOMContentLoaded', () => { initArgTrendChart(); });

// ==========================================
// FITUR PREDICTIVE MAINTENANCE (KALIBRASI & LIFETIME)
// ==========================================

// Fungsi Kalkulator Sisa Hari
function hitungSisaHari(tanggalTarget) {
    const hariIni = new Date();
    const target = new Date(tanggalTarget);
    const selisihWaktu = target - hariIni;
    return Math.ceil(selisihWaktu / (1000 * 60 * 60 * 24));
}

// Render Status Indikator Visual
function renderStatusBadge(sisaHari) {
    if (sisaHari > 90) {
        return `<span class="px-3 py-1 bg-green-900/50 text-green-400 border border-green-700 rounded-full text-xs font-bold"><i class="fas fa-check-circle mr-1"></i>Aman (${sisaHari} hari)</span>`;
    } else if (sisaHari > 0 && sisaHari <= 90) {
        return `<span class="px-3 py-1 bg-yellow-900/50 text-yellow-400 border border-yellow-700 rounded-full text-xs font-bold animate-pulse"><i class="fas fa-exclamation-triangle mr-1"></i>Segera (${sisaHari} hari)</span>`;
    } else {
        return `<span class="px-3 py-1 bg-red-900/50 text-red-400 border border-red-700 rounded-full text-xs font-bold animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]"><i class="fas fa-times-circle mr-1"></i>Kritis / Lewat</span>`;
    }
}

// 1. Tarik Data Kalibrasi (Format Kartu Tunggal Terpisah)
async function fetchKalibrasi() {
    try {
        let res = await fetch('https://kyizliqcqoeynhoybghv.supabase.co/rest/v1/kalibrasi_alat?select=*&order=tgl_kalibrasi_next.asc', { headers: supabaseHeaders });
        let data = await res.json();
        
        const container = document.getElementById('kalibrasi-card-container');
        if (!container) return;

        if (data.length === 0) {
            container.innerHTML = '<div class="text-center py-10 text-slate-500 font-bold tracking-wider">BELUM ADA DATA KALIBRASI TERDAFTAR</div>';
            return;
        }

        let html = '';

        // Looping untuk mencetak kartu yang berdiri sendiri-sendiri
        data.forEach(item => {
            let sisaHari = hitungSisaHari(item.tgl_kalibrasi_next);
            
            // Setiap item langsung dibungkus dalam div kartu utuh
            html += `
                <div class="bg-slate-800/80 border-l-4 border-l-blue-500 border border-slate-700 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-transform hover:-translate-y-1 hover:shadow-lg hover:border-slate-500">
                    <div class="flex-1">
                        <div class="flex items-center gap-3 mb-2">
                            <h4 class="font-bold text-blue-300 text-lg tracking-wide">${item.nama_alat}</h4>
                            <span class="text-[9px] bg-slate-900/80 text-slate-300 px-2.5 py-1 rounded font-bold uppercase tracking-widest border border-slate-600"><i class="fas fa-map-marker-alt text-red-400 mr-1"></i>${item.lokasi}</span>
                        </div>
                        <div class="text-xs text-slate-400 mt-2 flex flex-wrap gap-5">
                            <span title="Kalibrasi Terakhir" class="flex items-center"><i class="fas fa-history text-slate-500 mr-2 text-sm"></i>Terakhir: <span class="font-mono text-slate-300 ml-1">${item.tgl_kalibrasi_terakhir}</span></span>
                            <span title="Kalibrasi Berikutnya" class="flex items-center"><i class="fas fa-calendar-check text-blue-400 mr-2 text-sm"></i>Berikutnya: <span class="font-mono font-bold text-white ml-1">${item.tgl_kalibrasi_next}</span></span>
                        </div>
                    </div>
                    <div class="flex flex-row items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-slate-700 pt-4 md:pt-0 mt-3 md:mt-0">
                        ${renderStatusBadge(sisaHari)}
                        <button onclick="bukaModalEdit('kalibrasi', ${item.id}, '${item.nama_alat}')" class="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all border border-slate-500 flex items-center shadow-md">
                            <i class="fas fa-edit mr-2"></i> Update
                        </button>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    } catch (error) { 
        console.error("Error Kalibrasi:", error); 
        let container = document.getElementById('kalibrasi-card-container');
        if(container) container.innerHTML = '<div class="text-center py-10 text-red-400">Gagal memuat data dari server. Periksa koneksi internet Anda.</div>';
    }
}

// 2. Tarik Data Lifetime (Format Akordion per Kategori)
async function fetchLifetime() {
    try {
        let res = await fetch('https://kyizliqcqoeynhoybghv.supabase.co/rest/v1/lifetime_aset?select=*&order=tgl_expired.asc', { headers: supabaseHeaders });
        let data = await res.json();
        
        const container = document.getElementById('lifetime-accordion-container');
        if (!container) return; // Mencegah error jika elemen HTML belum dimuat

        if (data.length === 0) {
            container.innerHTML = '<div class="text-center py-10 text-slate-500 font-bold tracking-wider">BELUM ADA DATA ASET TERDAFTAR</div>';
            return;
        }

        // A. Kelompokkan data berdasarkan 'kategori'
        const groupedData = data.reduce((acc, item) => {
            let kat = item.kategori ? item.kategori.toUpperCase() : 'LAIN-LAIN';
            if (!acc[kat]) acc[kat] = [];
            acc[kat].push(item);
            return acc;
        }, {});

        // B. Palet warna pinggiran kiri
        const borderColors = ['border-l-blue-500', 'border-l-green-500', 'border-l-purple-500', 'border-l-yellow-500', 'border-l-pink-500'];
        let html = '';
        let colorIndex = 0;

        // C. Buat HTML untuk setiap grup
        for (const [kategori, items] of Object.entries(groupedData)) {
            let borderColor = borderColors[colorIndex % borderColors.length];
            let krisisCount = items.filter(i => hitungSisaHari(i.tgl_expired) <= 90).length;
            let peringatan = krisisCount > 0 ? `<span class="ml-3 px-2 py-0.5 bg-red-900/50 text-red-400 rounded text-[10px] font-bold border border-red-700 animate-pulse">${krisisCount} Kritis</span>` : '';

            // Bagian Header Grup
            html += `
            <div class="bg-slate-800 border-l-4 ${borderColor} rounded-r-xl rounded-l-md shadow-lg overflow-hidden transition-all duration-300 border-y border-r border-y-slate-700 border-r-slate-700">
                <button onclick="toggleAccordion('${kategori.replace(/[^a-zA-Z0-9]/g, '-')}')" class="w-full px-5 py-4 flex justify-between items-center bg-slate-800/80 hover:bg-slate-700 transition-colors focus:outline-none">
                    <div class="flex flex-col items-start">
                        <div class="flex items-center">
                            <span class="font-bold text-lg text-white tracking-widest">${kategori}</span>
                            ${peringatan}
                        </div>
                        <span class="text-xs text-slate-400 mt-1">${items.length} Perangkat Terdaftar</span>
                    </div>
                    <div class="bg-slate-900 w-8 h-8 rounded-full flex items-center justify-center border border-slate-700">
                        <i id="icon-${kategori.replace(/[^a-zA-Z0-9]/g, '-')}" class="fas fa-chevron-up text-slate-400 transition-transform duration-300"></i>
                    </div>
                </button>
                
                <!-- Bagian Isi Grup (Daftar Aset) -->
                <div id="body-${kategori.replace(/[^a-zA-Z0-9]/g, '-')}" class="px-5 pb-5 pt-2 space-y-3 block bg-slate-800">
            `;

            // Cetak kartu-kartu kecil di dalam grup
            items.forEach(item => {
                let sisaHari = hitungSisaHari(item.tgl_expired);
                html += `
                    <div class="bg-slate-900/60 border border-slate-700 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-transform hover:-translate-y-1 hover:shadow-md hover:border-slate-500">
                        <div class="flex-1">
                            <h4 class="font-bold text-blue-300 text-base">${item.nama_alat}</h4>
                            <div class="text-xs text-slate-400 mt-2 flex gap-4">
                                <span title="Tanggal Pasang"><i class="fas fa-calendar-alt text-slate-500 mr-1.5"></i>${item.tgl_pasang}</span>
                                <span title="Standar Masa Pakai"><i class="fas fa-stopwatch text-slate-500 mr-1.5"></i>${item.masa_pakai_bulan} Bulan</span>
                            </div>
                        </div>
                        <div class="flex flex-row items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-slate-700 pt-3 md:pt-0 mt-2 md:mt-0">
                            ${renderStatusBadge(sisaHari)}
                            <button onclick="bukaModalEdit('lifetime', ${item.id}, '${item.nama_alat}')" class="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-slate-500 flex items-center shadow-sm">
                                <i class="fas fa-retweet mr-1.5"></i> Ganti
                            </button>
                        </div>
                    </div>
                `;
            });

            html += `</div></div>`;
            colorIndex++;
        }

        container.innerHTML = html;
    } catch (error) { 
        console.error("Error Lifetime:", error); 
        let container = document.getElementById('lifetime-accordion-container');
        if(container) container.innerHTML = '<div class="text-center py-10 text-red-400">Gagal memuat data dari server. Periksa koneksi internet Anda.</div>';
    }
}

// Fungsi Pemicu Buka/Tutup Akordion
function toggleAccordion(id) {
    const body = document.getElementById(`body-${id}`);
    const icon = document.getElementById(`icon-${id}`);
    if(!body || !icon) return; // Baris pengaman ini wajib ada!
    
    if (body.classList.contains('hidden')) {
        body.classList.remove('hidden');
        body.classList.add('block');
        icon.classList.remove('rotate-180'); // Chevron ke atas
    } else {
        body.classList.remove('block');
        body.classList.add('hidden');
        icon.classList.add('rotate-180'); // Chevron ke bawah
    }
}

// 3. Logika Modal (Pop-up) Update
function bukaModalEdit(tipe, id, nama) {
    document.getElementById('modal_edit_aset').classList.remove('hidden');
    document.getElementById('modal_tipe').value = tipe;
    document.getElementById('modal_id').value = id;
    document.getElementById('modal_tanggal').value = new Date().toISOString().split('T')[0]; // Auto isi tanggal hari ini
    
    if(tipe === 'kalibrasi') {
        document.getElementById('modal_title').innerText = `Update Kalibrasi: ${nama}`;
        document.getElementById('modal_hint').innerText = "Masukkan tanggal kalibrasi terbaru. Sistem akan menghitung jadwal berikutnya otomatis.";
    } else {
        document.getElementById('modal_title').innerText = `Ganti Aset: ${nama}`;
        document.getElementById('modal_hint').innerText = "Masukkan tanggal pemasangan aset yang baru. Sistem akan mereset usia pakai otomatis.";
    }
}

function closeModalEdit() {
    document.getElementById('modal_edit_aset').classList.add('hidden');
}

// 4. Logika Simpan (Kirim Pembaruan ke Supabase)
async function simpanPembaruanAset() {
    let tipe = document.getElementById('modal_tipe').value;
    let id = document.getElementById('modal_id').value;
    let tanggalBaru = document.getElementById('modal_tanggal').value;
    
    if(!tanggalBaru) return alert("Pilih tanggal terlebih dahulu!");

    // Konfigurasi Headers khusus untuk proses PATCH (Update Data)
    let patchHeaders = { ...supabaseHeaders, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' };
    
    try {
        if (tipe === 'kalibrasi') {
            // Ambil data interval bulan terlebih dahulu untuk menghitung next date
            let resCek = await fetch(`https://kyizliqcqoeynhoybghv.supabase.co/rest/v1/kalibrasi_alat?id=eq.${id}&select=interval_bulan`, { headers: supabaseHeaders });
            let dataCek = await resCek.json();
            let interval = dataCek[0].interval_bulan;
            
            // Hitung tanggal next
            let nextDate = new Date(tanggalBaru);
            nextDate.setMonth(nextDate.getMonth() + interval);
            let nextDateStr = nextDate.toISOString().split('T')[0];

            // Tembak Update ke Supabase
            await fetch(`https://kyizliqcqoeynhoybghv.supabase.co/rest/v1/kalibrasi_alat?id=eq.${id}`, {
                method: 'PATCH', headers: patchHeaders,
                body: JSON.stringify({ tgl_kalibrasi_terakhir: tanggalBaru, tgl_kalibrasi_next: nextDateStr })
            });
            fetchKalibrasi();
        } 
        else {
            // Ambil data masa pakai bulan untuk menghitung expired date
            let resCek = await fetch(`https://kyizliqcqoeynhoybghv.supabase.co/rest/v1/lifetime_aset?id=eq.${id}&select=masa_pakai_bulan`, { headers: supabaseHeaders });
            let dataCek = await resCek.json();
            let masa = dataCek[0].masa_pakai_bulan;
            
            let expDate = new Date(tanggalBaru);
            expDate.setMonth(expDate.getMonth() + masa);
            let expDateStr = expDate.toISOString().split('T')[0];

            await fetch(`https://kyizliqcqoeynhoybghv.supabase.co/rest/v1/lifetime_aset?id=eq.${id}`, {
                method: 'PATCH', headers: patchHeaders,
                body: JSON.stringify({ tgl_pasang: tanggalBaru, tgl_expired: expDateStr })
            });
            fetchLifetime();
        }
        
        closeModalEdit();
        alert("Data berhasil diperbarui! Logika otomatisasi telah dihitung ulang.");
    } catch (error) {
        console.error("Gagal update data:", error);
        alert("Terjadi kesalahan saat menyimpan ke database.");
    }
}

// Panggil fetch saat pertama load jika halaman diakses
document.addEventListener('DOMContentLoaded', () => {
    fetchKalibrasi();
    fetchLifetime();
});