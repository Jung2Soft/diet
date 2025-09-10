// Simple 6-month calendar tracker with localStorage persistence
const $ = (sel) => document.querySelector(sel);
const calendarEl = $('#calendar');
const monthLabel = $('#monthLabel');
const startDateInput = $('#startDate');
const weeksInput = $('#weeks');
const kpiRange = $('#kpiRange'), kpiDone = $('#kpiDone'), kpiFail = $('#kpiFail'), kpiRate = $('#kpiRate');
const picker = $('#statusPicker');
const noteModal = $('#noteModal');
const noteText = $('#noteText');
const noteTitle = $('#noteTitle');
const motivationText = $('#motivationText');
const planDetails = $('#planDetails');
let currentMonth = new Date();
let planStart = new Date();
let planWeeks = 24;
let openCellKey = null;
let deferredPrompt;

// PWA install
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const btn = document.getElementById('installBtn');
  btn.hidden = false;
  btn.onclick = async () => {
    btn.hidden = true;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
  };
});

// Service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js');
}

// Init defaults
(function init() {
  const saved = JSON.parse(localStorage.getItem('fitcal.settings') || '{}');
  if (saved.start) planStart = new Date(saved.start);
  else {
    // default to today (local timezone)
    const today = new Date();
    planStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }
  planWeeks = saved.weeks || 24;
  startDateInput.valueAsDate = planStart;
  weeksInput.value = planWeeks;
  currentMonth = new Date(planStart);
  buildPlanDetails();
  showMotivation();
  render();
})();

function saveSettings() {
  localStorage.setItem('fitcal.settings', JSON.stringify({ start: planStart.toISOString().slice(0,10), weeks: planWeeks }));
}

function inPlan(date) {
  const end = new Date(planStart);
  end.setDate(end.getDate() + planWeeks*7 - 1);
  return date >= planStart && date <= end;
}

function weekIndex(date) {
  const diffDays = Math.floor((date - planStart)/(1000*60*60*24));
  if (diffDays < 0) return null;
  return Math.floor(diffDays/7) + 1; // Week 1..
}

function phaseFor(date) {
  const w = weekIndex(date);
  if (!w) return null;
  for (const ph of PHASES) {
    if (ph.weeks.includes(w)) return ph;
  }
  return null;
}

function keyOf(date) {
  return date.toISOString().slice(0,10);
}

function readDay(date) {
  const all = JSON.parse(localStorage.getItem('fitcal.days') || '{}');
  return all[keyOf(date)] || { status:null, note:'' };
}

function writeDay(date, data) {
  const all = JSON.parse(localStorage.getItem('fitcal.days') || '{}');
  all[keyOf(date)] = data;
  localStorage.setItem('fitcal.days', JSON.stringify(all));
  updateKPIs();
}

function render() {
  // set month label
  monthLabel.textContent = `${currentMonth.getFullYear()}년 ${currentMonth.getMonth()+1}월`;
  // first day of grid
  const first = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const startGrid = new Date(first);
  startGrid.setDate(1 - ((first.getDay()+6)%7)); // Monday-first grid
  calendarEl.innerHTML = '';

  for (let i=0;i<42;i++){ // 6 rows
    const d = new Date(startGrid);
    d.setDate(startGrid.getDate()+i);
    const dayEl = document.createElement('div');
    dayEl.className = 'day';
    if (d.getMonth() !== currentMonth.getMonth()) dayEl.classList.add('outside');
    if (isToday(d)) dayEl.classList.add('today');

    const dateEl = document.createElement('div');
    dateEl.className = 'date';
    dateEl.textContent = d.getDate();
    dayEl.appendChild(dateEl);

    const statusEl = document.createElement('div');
    statusEl.className = 'status';
    const {status, note} = readDay(d);
    statusEl.textContent = status === 'success' ? '✅' : (status === 'fail' ? '❌' : ' ');
    dayEl.appendChild(statusEl);

    // phase dot
    if (inPlan(d)) {
      const ph = phaseFor(d);
      if (ph) {
        const dot = document.createElement('span');
        dot.className = `phaseDot ${ph.color}`;
        dayEl.appendChild(dot);
        dayEl.title = `${ph.name} · 목표: ${ph.goal}`;
      }
    }

    // note badge
    if (note) {
      const nb = document.createElement('span');
      nb.className = 'badge noteBadge';
      nb.textContent = '메모';
      dayEl.appendChild(nb);
    }

    dayEl.addEventListener('click', (ev) => openPicker(ev, d));
    calendarEl.appendChild(dayEl);
  }

  updateKPIs();
  updateRangeLabel();
}

function updateRangeLabel(){
  const end = new Date(planStart);
  end.setDate(end.getDate() + planWeeks*7 - 1);
  kpiRange.textContent = `${planStart.toISOString().slice(0,10)} ~ ${end.toISOString().slice(0,10)}`;
}

function updateKPIs(){
  const all = JSON.parse(localStorage.getItem('fitcal.days') || '{}');
  let done=0, fail=0, total=0;
  const end = new Date(planStart);
  end.setDate(end.getDate()+planWeeks*7-1);
  for (let d=new Date(planStart); d<=end; d.setDate(d.getDate()+1)){
    const k = keyOf(d);
    if (all[k]?.status) {
      total++;
      if (all[k].status==='success') done++;
      else if (all[k].status==='fail') fail++;
    }
  }
  kpiDone.textContent = String(done);
  kpiFail.textContent = String(fail);
  kpiRate.textContent = total ? Math.round(done/total*100)+'%' : '0%';
}

function isToday(d){
  const t = new Date();
  return d.getFullYear()===t.getFullYear() && d.getMonth()===t.getMonth() && d.getDate()===t.getDate();
}

function openPicker(ev, date){
  openCellKey = keyOf(date);
  picker.style.left = '50%'; // centered
  picker.classList.remove('hidden');
  // auto-hide on outside tap
  setTimeout(()=>{
    document.addEventListener('click', onOutside, {once:true});
  }, 0);
  // Handler for picker buttons
  picker.querySelectorAll('button').forEach(btn=>{
    btn.onclick = (e)=>{
      const act = e.currentTarget.dataset.status;
      const day = readDay(date);
      if (act==='success'){ day.status='success'; writeDay(date, day); }
      else if (act==='fail'){ day.status='fail'; writeDay(date, day); }
      else if (act==='clear'){ day.status=null; writeDay(date, day); }
      else if (act==='note'){ openNote(date); }
      picker.classList.add('hidden');
      render();
    };
  });
}

function onOutside(e){
  if (!picker.contains(e.target)) picker.classList.add('hidden');
}

$('#prevMonth').addEventListener('click', ()=>{
  currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth()-1, 1);
  render();
});
$('#nextMonth').addEventListener('click', ()=>{
  currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth()+1, 1);
  render();
});
$('#todayBtn').addEventListener('click', ()=>{
  currentMonth = new Date();
  render();
});

$('#applyPlan').addEventListener('click', ()=>{
  if (startDateInput.value) planStart = new Date(startDateInput.value+'T00:00:00');
  planWeeks = Math.max(4, Math.min(52, parseInt(weeksInput.value||'24',10)));
  saveSettings();
  currentMonth = new Date(planStart);
  render();
});

// Notes
function openNote(date){
  noteModal.classList.remove('hidden');
  const k = keyOf(date);
  noteTitle.textContent = `메모 · ${k}`;
  const d = readDay(date);
  noteText.value = d.note || '';
  $('#saveNote').onclick = ()=>{
    d.note = noteText.value;
    writeDay(date, d);
    noteModal.classList.add('hidden');
    render();
  };
  $('#cancelNote').onclick = ()=> noteModal.classList.add('hidden');
}

// Export / Import
$('#exportBtn').addEventListener('click', ()=>{
  const data = {
    settings: JSON.parse(localStorage.getItem('fitcal.settings')||'{}'),
    days: JSON.parse(localStorage.getItem('fitcal.days')||'{}')
  };
  const blob = new Blob([JSON.stringify(data,null,2)], {type: 'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'fitcal-backup.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

$('#importFile').addEventListener('change', (e)=>{
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ()=>{
    try{
      const data = JSON.parse(reader.result);
      if (data.settings) localStorage.setItem('fitcal.settings', JSON.stringify(data.settings));
      if (data.days) localStorage.setItem('fitcal.days', JSON.stringify(data.days));
      const s = JSON.parse(localStorage.getItem('fitcal.settings'));
      planStart = new Date(s.start);
      planWeeks = s.weeks || 24;
      startDateInput.valueAsDate = planStart;
      weeksInput.value = planWeeks;
      currentMonth = new Date(planStart);
      render();
      alert('복원 완료!');
    }catch(err){
      alert('복원 실패: 파일 형식이 올바르지 않습니다.');
    }
  };
  reader.readAsText(file, 'utf-8');
});

function showMotivation(){
  // daily stable random by date
  const todayKey = new Date().toISOString().slice(0,10);
  let seed = 0;
  for (const ch of todayKey) seed += ch.charCodeAt(0);
  const idx = seed % QUOTES.length;
  motivationText.textContent = '💬 ' + QUOTES[idx];
}

function buildPlanDetails(){
  const el = planDetails;
  el.innerHTML = '';
  PHASES.forEach(ph=>{
    const div = document.createElement('div');
    div.className = 'phase-block';
    div.innerHTML = `
      <h4><span class="dot ${ph.color}"></span>${ph.name} (W${ph.weeks[0]}~${ph.weeks.slice(-1)[0]})</h4>
      <p><strong>목표:</strong> ${ph.goal}</p>
      <p><strong>식단:</strong><br>${ph.meals.map(m=>'- '+m).join('<br>')}</p>
      <p><strong>운동:</strong> ${ph.workout}</p>
      <p><strong>${ph.expect}</strong></p>
    `;
    el.appendChild(div);
  });
}
