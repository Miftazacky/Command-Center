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
    const led = document.getElementById(`led-${idAlat}`);
    const text = document.getElementById(`status-text-${idAlat}`);
    const ping = document.getElementById(`last-ping-${idAlat}`);
    
    if(!led) return;

    // Reset kelas bawaan
    led.className = "w-4 h-4 rounded-full";
    text.className = "text-2xl font-bold mb-2";

    if (statusCode === 1 || statusCode === "1") {
        led.classList.add("bg-green-500", "shadow-[0_0_15px_rgba(34,197,94,0.7)]"); // Hijau Menyala
        text.classList.add("text-green-400");
        text.innerText = "ONLINE (NORMAL)";
    } else {
        led.classList.add("bg-red-500", "animate-ping"); // Merah Berkedip
        text.classList.add("text-red-500");
        text.innerText = "OFFLINE / ERROR";
    }

    ping.innerText = waktuTerakhir || "--";
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

        // Format Waktu Rekam: Mengubah "2026-09-24 15:00:00" menjadi "24/09 15:00"
        // Format Waktu Rekam: Mengubah "2026-09-24 15:00:00" menjadi "24/09 15:00"
        let waktuStr = "--/-- --:--";
        if (st.waktu_rekam) {
            let parts = st.waktu_rekam.split(' ');
            if(parts.length > 1) {
                let d = parts[0].split('-'); // [2026, 09, 24]
                let t = parts[1].split(':'); // [15, 00, 00]
                waktuStr = `${d[2]}/${d[1]} ${t[0]}:${t[1]}`;
            } else {
                waktuStr = st.waktu_rekam;
            }
        }

        const box = document.createElement('div');
        box.className = `p-2 md:p-3 rounded-lg border ${statusWarna} flex flex-col justify-between shadow-sm relative overflow-hidden`;
        
        // Desain UI Kartu ARG
        box.innerHTML = `
            <div class="text-xs font-bold truncate mb-1" title="${st.nama_stasiun}">${st.nama_stasiun.replace("ARG ", "")}</div>
            
            <div class="flex justify-between items-end mt-1 pt-2 border-t border-slate-700/50">
                <span class="text-[10px] font-mono tracking-tight" title="Tegangan Baterai">
                    ${ikonBaterai} ${isNaN(baterai) ? '--' : baterai + 'V'}
                </span>
                <span class="text-[9px] font-mono ${warnaWaktu} tracking-tighter" title="Pembaruan Terakhir">
                    <i class="fa-regular fa-clock"></i> ${waktuStr}
                </span>
            </div>
        `;
        container.appendChild(box);
    });
}

function switchView(viewId) {
    // 1. Daftar semua ID halaman yang ada di sistem
    const views = ['view_noc', 'view_realtime', 'view_trend_awos', 'view_trend_aws', 'view_trend_bam', 'view_arg', 'view_trend_arg'];
    
    // 2. Sembunyikan semuanya dengan paksa menggunakan Tailwind class 'hidden'
    views.forEach(v => {
        let el = document.getElementById(v);
        if (el) {
            el.classList.add('hidden');
            // Hapus class 'flex' atau 'block' agar tidak tumpang tindih
            el.classList.remove('flex', 'block'); 
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
        'noc': 'Status Perangkat'
    };
    if (titles[viewId]) {
        document.getElementById('view_title').innerText = titles[viewId];
    }

    if (sidebarOpen) toggleSidebar();

    // 4. CEGAH TABRAKAN: Menu ARG menggunakan fungsi grafiknya sendiri (fetch API)
    if (viewId.startsWith('trend') && viewId !== 'trend_arg') {
        initCharts(viewId.replace('trend_', ''));
    }

    // 5. Munculkan Halaman yang Dipilih dengan class yang Tepat
    let targetView = viewId === 'noc' ? 'view_noc' :
                     viewId === 'arg' ? 'view_arg' : 
                     viewId === 'trend_arg' ? 'view_trend_arg' : 
                     viewId === 'realtime' ? 'view_realtime' : 
                     'view_' + viewId;
                     
    let el = document.getElementById(targetView);
    if (el) {
        // Hapus 'hidden' untuk memunculkan elemen
        el.classList.remove('hidden');
        
        // Terapkan class 'flex' untuk halaman Realtime dan NOC (karena layout grid mereka butuh flexbox)
        // Terapkan class 'block' untuk halaman lainnya (seperti map ARG dan Chart)
        if(targetView === 'view_realtime' || targetView === 'view_noc') {
             el.classList.add('flex');
        } else {
             el.classList.add('block');
        }
    }
    
    // 6. Fix Bug Leaflet: Render ulang peta jika menu Peta ARG dibuka
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
    const opsiJam = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Asia/Makassar' };
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

// Fungsi menarik data terbaru (1 baris terakhir) untuk Dashboard Live
async function fetchLiveDashboard() {
    indikator.classList.add('animate-ping'); // Efek kedip saat menarik data
    
    try {
        // 1. Tarik AWS
        let resAWS = await fetch('https://kyizliqcqoeynhoybghv.supabase.co/rest/v1/aws_trend?select=*&order=id.desc&limit=1', { headers: supabaseHeaders });
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
            updateStatusAlat('aws', data.status_alat, konversiUtcKeWita(data.tanggal_alat, data.jam_alat));            
            if(data.tanggal_alat && data.jam_alat) {
                document.getElementById("aws_update").innerText = konversiUtcKeWita(data.tanggal_alat, data.jam_alat);
            }
        }

        // 2. Tarik AWOS
        let resAWOS = await fetch('https://kyizliqcqoeynhoybghv.supabase.co/rest/v1/awos_trend?select=*&order=id.desc&limit=1', { headers: supabaseHeaders });
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
            document.getElementById("awos_vis").innerText = visAkhir;
            
            document.getElementById("awos_sky").innerText = data.sky_condition === "" ? "CLEAR" : data.sky_condition;
            document.getElementById("awos_metar").innerText = data.metar;
            updateStatusAlat('awos', data.status_alat, konversiUtcKeWita(data.tanggal_alat, data.jam_alat));
            if(data.tanggal_alat && data.jam_alat) {
                document.getElementById("awos_update").innerText = konversiUtcKeWita(data.tanggal_alat, data.jam_alat);
            }
        }

        // 3. Tarik BAM
        let resBAM = await fetch('https://kyizliqcqoeynhoybghv.supabase.co/rest/v1/bam_trend?select=*&order=id.desc&limit=1', { headers: supabaseHeaders });
        let dataBAM = await resBAM.json();
        if(dataBAM.length > 0) {
            let data = dataBAM[0];
            updateDenganPeringatan("bam_pm25", data.pm25, 50, 'text-purple-400');
            document.getElementById("bam_flow").innerText = data.flow_rate;
            updateStatusAlat('bam', data.status_alat, data.waktu_data);
            if (data.waktu_data !== undefined) document.getElementById("bam_waktu").innerText = data.waktu_data;
        }

        // 4. Tarik ARG (Mengambil 1 data terbaru per stasiun & Menyuntikkan Koordinat Statis)
        // Kamus stasiun ini sekaligus menghilangkan duplikat "ARG Timbau"
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

        // Tarik data paralel untuk 17 stasiun
        const argPromises = daftarStasiun.map(stasiun => {
            return fetch(`https://kyizliqcqoeynhoybghv.supabase.co/rest/v1/arg_trend?select=*&nama_stasiun=eq.${encodeURIComponent(stasiun)}&order=id.desc&limit=1`, { headers: supabaseHeaders })
                .then(res => res.json())
                .then(data => data.length > 0 ? data[0] : null);
        });

        const argResults = await Promise.all(argPromises);

        // Pasangkan data dari awan dengan koordinat lokal
        argResults.forEach((st) => {
            if (st && st.nama_stasiun) {
                dataARGGabungan.push({
                    nama_stasiun: st.nama_stasiun,
                    total_hujan: st.total_hujan,
                    suhu_panel: st.suhu_panel,
                    tegangan_baterai: st.tegangan_baterai,
                    waktu_rekam: st.waktu,
                    koordinat: referensiARG[st.nama_stasiun] // Suntikkan koordinat dari kamus di atas
                });
            }
        });

        if(dataARGGabungan.length > 0) {
            updateArgData(dataARGGabungan); 
            processArgTrendData(dataARGGabungan);
            renderArgStatusGrid(dataARGGabungan);
        }

        // Indikator Sukses
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
        let hujan = parseFloat(station.total_hujan) || 0;
        let suhu = parseFloat(station.suhu_panel) || 0;
        let bat = parseFloat(station.tegangan_baterai) || 0;
        let lat = parseFloat(station.koordinat.lat);
        let lon = parseFloat(station.koordinat.lon);
        // Sesuaikan nama variabel waktu_rekam dengan output JSON Anda
        let waktu = station.waktu_rekam ? station.waktu_rekam.replace('T', ' ').replace('.000Z', '') : "-";

        // ==========================================
        // ==========================================
        // A. UPDATE PETA (MARKER & POP-UP)
        // ==========================================
        if (!isNaN(lat) && !isNaN(lon)) {
            
            // 1. Logika Indikator Cerdas (Warna & Status)
            let markerColor = '';
            let statusCuaca = '';

            if (hujan === 0) {
                markerColor = '#94a3b8'; // Abu-abu (Cerah)
                statusCuaca = 'Cerah';
            } else if (hujan > 0 && hujan <= 5) {
                markerColor = '#38bdf8'; // Biru Muda (Hujan Ringan)
                statusCuaca = 'Hujan Ringan';
            } else if (hujan > 5 && hujan <= 10) {
                markerColor = '#2563eb'; // Biru Tua (Hujan Sedang)
                statusCuaca = 'Hujan Sedang';
            } else {
                markerColor = '#ef4444'; // Merah (Hujan Lebat)
                statusCuaca = 'Hujan Lebat';
            }

            // 2. Estetika Peta: Custom Icon (Flat & Clean)
            let customIcon = L.divIcon({
                className: 'custom-arg-marker',
                html: `
                    <div style="
                        width: 12px; height: 12px;
                        background-color: ${markerColor};
                        border-radius: 50%;
                        border: 2px solid #1e293b; 
                    "></div>
                `,
                iconSize: [12, 12],
                iconAnchor: [6, 6]
            });

            // 3. Estetika Peta: Pop-up Mini Dashboard (Tanpa Bingkai Putih)
            let batColor = bat < 11.5 ? '#ef4444' : '#4ade80';
            let popupContent = `
                <div style="background: #1e293b; color: #f8fafc; padding: 14px; border-radius: 8px; border: 1px solid #334155; font-family: sans-serif; min-width: 160px; box-shadow: 0 10px 25px rgba(0,0,0,0.7);">
                    <h4 style="margin: 0 0 8px 0; font-size: 13px; color: ${markerColor}; border-bottom: 1px solid #334155; padding-bottom: 6px; text-transform: uppercase; letter-spacing: 1px;">${nama}</h4>
                    <div style="font-size: 12px; margin-bottom: 4px; display: flex; justify-content: space-between;"><span>Status:</span> <b style="color: ${markerColor};">${statusCuaca}</b></div>
                    <div style="font-size: 12px; margin-bottom: 4px; display: flex; justify-content: space-between;"><span>Hujan:</span> <b>${hujan} mm</b></div>
                    <div style="font-size: 12px; display: flex; justify-content: space-between;"><span>Baterai:</span> <b style="color: ${batColor};">${bat} V</b></div>
                </div>
            `;

            // 4. Menerapkan ke Peta
            if (argMarkers[nama]) {
                argMarkers[nama].setLatLng([lat, lon]);
                argMarkers[nama].setIcon(customIcon);
                argMarkers[nama].setPopupContent(popupContent);
            } else {
                argMarkers[nama] = L.marker([lat, lon], { icon: customIcon })
                    .bindPopup(popupContent, {
                        closeButton: false, // Menghilangkan tombol silang bawaan agar lebih rapi
                        offset: [0, -5],
                        className: 'popup-arg-dark'
                    })
                    .addTo(argMap);
            }
        }

        // ==========================================
        // B. UPDATE KARTU (CARD VIEW)
        // ==========================================
        
        // 1. Efek Visual Cerdas (Glow) jika hujan > 0
        let cardBg = hujan > 0 
            ? 'bg-blue-900/40 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.6)]' // Menyala biru terang jika hujan
            : 'bg-slate-800 border-slate-700 shadow-md hover:border-slate-500';      // Gelap elegan jika cerah
            
        let rainColor = hujan > 0 ? 'text-blue-400 font-extrabold' : 'text-slate-300';
        
        // Tambahan Bonus: Baterai berkedip jika kritis
        let batClass = bat < 11.5 ? 'text-red-400 font-bold animate-pulse' : 'text-slate-400';

        // 2. Animasi Kartu (Hover Effects): Menggunakan transform, -translate-y-2, dan duration-300
        cardHTML += `
            <div class="rounded-xl border ${cardBg} p-4 flex flex-col items-center justify-center transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl cursor-pointer">
                <span class="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2 text-center h-8">${nama}</span>
                <span class="${rainColor} text-3xl font-mono mb-1 transition-colors duration-300">${hujan}</span>
                <span class="text-slate-500 text-[10px] uppercase tracking-widest mb-4">Hujan (mm)</span>
                <div class="w-full flex justify-between text-xs border-t border-slate-700/50 pt-2">
                    <span class="${batClass}"><i class="fa-solid fa-battery-half mr-1"></i>${bat}V</span>
                    <span class="text-slate-400"><i class="fa-solid fa-solar-panel mr-1"></i>${suhu}°C</span>
                </div>
            </div>
        `;

        // ==========================================
        // C. UPDATE TABEL (TABLE VIEW)
        // ==========================================
        tableHTML += `
            <tr class="hover:bg-slate-700/50 transition-colors">
                <td class="px-6 py-3 font-medium text-slate-200">${nama}</td>
                <td class="px-6 py-3 font-mono ${hujan > 0 ? 'text-blue-400 font-bold' : 'text-slate-300'}">${hujan}</td>
                <td class="px-6 py-3 text-slate-300">${suhu}</td>
                <td class="px-6 py-3 font-mono ${bat < 11.5 ? 'text-red-400 font-bold' : 'text-slate-300'}">${bat}</td>
                <td class="px-6 py-3 text-xs text-slate-400">${waktu}</td>
            </tr>
        `;
    });

    // Suntikkan HTML yang sudah dirakit ke dalam layar
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