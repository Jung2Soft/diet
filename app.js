// Elite Fixed App
const $ = (s)=>document.querySelector(s);
const calendarEl = $('#calendar'); const monthLabel = $('#monthLabel');
const startDateInput = $('#startDate'); const weeksInput = $('#weeks');
const kpiRange = $('#kpiRange'), kpiDone = $('#kpiDone'), kpiFail = $('#kpiFail'), kpiRate = $('#kpiRate');
const sheet = $('#statusPicker'); const noteModal = $('#noteModal'); const noteText = $('#noteText'); const noteTitle = $('#noteTitle'); const helpDialog = $('#helpDialog');
const planDetails = $('#planDetails');
let currentMonth = new Date(); let planStart = new Date(); let planWeeks = 24; let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e)=>{ e.preventDefault(); deferredPrompt = e; const btn = document.getElementById('installBtn'); btn.hidden = false; btn.onclick = async ()=>{ btn.hidden = true; deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; }; });
if ('serviceWorker' in navigator){ navigator.serviceWorker.register('./service-worker.js?v=101').catch(()=>{}); }

(function init(){
  try{
    const saved = JSON.parse(localStorage.getItem('fitcal.settings')||'{}');
    planStart = saved.start ? new Date(saved.start) : new Date(new Date().toDateString());
    planWeeks = saved.weeks || 24;
    startDateInput.valueAsDate = planStart; weeksInput.value = planWeeks;
    currentMonth = new Date(planStart);
  }catch(e){ console.error(e); }
  buildPlanDetails(); showMotivation(); render(); bindGlobal();
})();

function saveSettings(){ localStorage.setItem('fitcal.settings', JSON.stringify({start: toKey(planStart), weeks: planWeeks})); }
function toKey(date){ const d=new Date(date); d.setHours(0,0,0,0); return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10); }
function inPlan(date){ const end=new Date(planStart); end.setDate(end.getDate()+planWeeks*7-1); return date>=planStart && date<=end; }
function weekIndex(date){ const diff=Math.floor((date - planStart)/86400000); if(diff<0) return null; return Math.floor(diff/7)+1; }
function phaseFor(date){ const w=weekIndex(date); if(!w) return null; for(const ph of PHASES){ if(ph.weeks.includes(w)) return ph; } return null; }
function readAll(){ try{return JSON.parse(localStorage.getItem('fitcal.days')||'{}')}catch(e){return {}} }
function writeAll(x){ localStorage.setItem('fitcal.days', JSON.stringify(x)); }
function readDay(date){ const all=readAll(); return all[toKey(date)] || {status:null, note:''}; }
function writeDay(date, data){ const all=readAll(); all[toKey(date)] = data; writeAll(all); updateKPIs(); }

function render(){
  monthLabel.textContent = `${currentMonth.getFullYear()}년 ${currentMonth.getMonth()+1}월`;
  const first = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const startGrid = new Date(first); startGrid.setDate(1 - ((first.getDay()+6)%7));
  calendarEl.innerHTML='';
  for(let i=0;i<42;i++){
    const d = new Date(startGrid); d.setDate(startGrid.getDate()+i);
    const tile = document.createElement('button'); tile.type='button'; tile.className='tile'; tile.setAttribute('aria-label', toKey(d));
    if (d.getMonth() !== currentMonth.getMonth()) tile.classList.add('outside');
    if (isToday(d)) tile.classList.add('today');
    const head=document.createElement('div'); head.className='date'; head.textContent=d.getDate();
    const stEl=document.createElement('div'); stEl.className='status';
    const {status:st, note} = readDay(d);
    stEl.textContent = st==='success'?'✅':st==='fail'?'❌':st==='partial'?'🟨':' ';
    if (st==='success') tile.classList.add('success');
    if (st==='fail') tile.classList.add('fail');
    if (st==='partial') tile.classList.add('partial');
    tile.appendChild(head); tile.appendChild(stEl);
    if (inPlan(d)){ const ph=phaseFor(d); if(ph){ tile.title=`${ph.name} · ${ph.goal}`; } }
    if (note){ const nb=document.createElement('span'); nb.className='chip ghost'; nb.style.position='absolute'; nb.style.bottom='8px'; nb.style.right='8px'; nb.textContent='메모'; tile.appendChild(nb); }
    tile.addEventListener('click',(ev)=>openSheet(ev,d));
    calendarEl.appendChild(tile);
  }
  updateKPIs(); updateRange();
}
function updateRange(){ const end=new Date(planStart); end.setDate(end.getDate()+planWeeks*7-1); kpiRange.textContent=`${toKey(planStart)} ~ ${toKey(end)}`; }
function updateKPIs(){ const all=readAll(); let done=0, fail=0, total=0; const end=new Date(planStart); end.setDate(end.getDate()+planWeeks*7-1); for(let d=new Date(planStart); d<=end; d.setDate(d.getDate()+1)){ const k=toKey(d); if(all[k]?.status){ total++; if(all[k].status==='success') done++; else if(all[k].status==='fail') fail++; } } kpiDone.textContent=String(done); kpiFail.textContent=String(fail); kpiRate.textContent= total? Math.round(done/total*100)+'%':'0%'; }
function isToday(d){ const t=new Date(); return d.getFullYear()===t.getFullYear() && d.getMonth()===t.getMonth() && d.getDate()===t.getDate(); }

// Bottom sheet (hardened for iOS PWA)
function openSheet(ev,date){
  sheet.classList.remove('hidden');
  // Prevent outside-close when tapping inside
  sheet.addEventListener('click', (e)=> e.stopPropagation(), {once:true});
  const onPick = (e)=>{
    const btn = e.target.closest('[data-status]'); if(!btn) return;
    const act = btn.dataset.status; const day=readDay(date);
    if (act==='success') day.status='success';
    else if (act==='partial') day.status='partial';
    else if (act==='fail') day.status='fail';
    else if (act==='clear') day.status=null;
    else if (act==='note'){ openNote(date); closeSheet(); return; }
    writeDay(date,day); closeSheet(); render();
  };
  sheet.querySelector('.sheet-actions').addEventListener('click', onPick, {once:true});
  setTimeout(()=>document.addEventListener('click', onOutside, {once:true, capture:true}), 0);
  function onOutside(e){ if (!sheet.contains(e.target)) closeSheet(); }
}
function closeSheet(){ sheet.classList.add('hidden'); }

// Notes
function openNote(date){
  noteModal.classList.remove('hidden');
  noteTitle.textContent = `메모 · ${toKey(date)}`;
  const d = readDay(date); noteText.value = d.note || '';
  $('#saveNote').onclick = ()=>{ d.note = noteText.value; writeDay(date,d); closeNote(); render(); };
  $('#cancelNote').onclick = ()=> closeNote();
  noteModal.addEventListener('click',(e)=>{ if(e.target===noteModal) closeNote(); }, {once:true});
}
function closeNote(){ noteModal.classList.add('hidden'); }

// Settings & nav
$('#prevMonth').addEventListener('click', ()=>{ currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth()-1, 1); render(); });
$('#nextMonth').addEventListener('click', ()=>{ currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth()+1, 1); render(); });
$('#todayBtn').addEventListener('click', ()=>{ currentMonth = new Date(); render(); });
$('#applyPlan').addEventListener('click', ()=>{ if(startDateInput.value) planStart=new Date(startDateInput.value+'T00:00:00'); planWeeks=Math.max(4,Math.min(52,parseInt(weeksInput.value||'24',10))); saveSettings(); currentMonth=new Date(planStart); render(); });
$('#resetBtn').addEventListener('click', ()=>{ if(confirm('모든 기록을 초기화할까요?')){ localStorage.removeItem('fitcal.days'); render(); } });

// Export / Import
$('#exportBtn').addEventListener('click', ()=>{ const data={meta:{schema:2},settings:JSON.parse(localStorage.getItem('fitcal.settings')||'{}'),days:JSON.parse(localStorage.getItem('fitcal.days')||'{}')}; const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='fitcal-backup.json'; a.click(); URL.revokeObjectURL(a.href); });
$('#importFile').addEventListener('change', (e)=>{ const f=e.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{ try{ const data=JSON.parse(r.result); if(data.settings) localStorage.setItem('fitcal.settings', JSON.stringify(data.settings)); if(data.days) localStorage.setItem('fitcal.days', JSON.stringify(data.days)); const s=JSON.parse(localStorage.getItem('fitcal.settings')); planStart=new Date(s.start); planWeeks=s.weeks||24; startDateInput.valueAsDate=planStart; weeksInput.value=planWeeks; currentMonth=new Date(planStart); render(); alert('복원 완료!'); }catch(e){ alert('복원 실패: JSON 형식 오류'); } }; r.readAsText(f,'utf-8'); });

// Help + misc
function bindGlobal(){ $('#helpBtn').addEventListener('click', ()=> helpDialog.classList.remove('hidden')); $('#closeHelp').addEventListener('click', ()=> helpDialog.classList.add('hidden')); document.addEventListener('keydown',(e)=>{ if(e.key==='Escape'){ helpDialog.classList.add('hidden'); closeNote(); closeSheet(); } }); }
function showMotivation(){ const k=new Date().toISOString().slice(0,10); let seed=0; for(const ch of k) seed += ch.charCodeAt(0); const idx=seed % QUOTES.length; document.getElementById('motivationText').textContent='💬 '+QUOTES[idx]; }
function buildPlanDetails(){ const el=planDetails; el.innerHTML=''; const legend=document.createElement('div'); legend.className='legend'; legend.innerHTML=`<span class="dot phase1"></span> 1개월차 <span class="dot phase2" style="margin-left:10px"></span> 2~3개월차 <span class="dot phase3" style="margin-left:10px"></span> 4개월차 <span class="dot phase4" style="margin-left:10px"></span> 5개월차 <span class="dot phase5" style="margin-left:10px"></span> 6개월차`; el.appendChild(legend); PHASES.forEach(ph=>{ const sec=document.createElement('section'); sec.style.marginTop='10px'; sec.innerHTML=`<h3><span class="dot ${ph.color}"></span> ${ph.name} (W${ph.weeks[0]}~${ph.weeks.slice(-1)[0]})</h3><p><strong>목표:</strong> ${ph.goal}</p><p><strong>식단:</strong><br>${ph.meals.map(m=>'· '+m).join('<br>')}</p><p><strong>운동:</strong> ${ph.workout}</p><p><strong>${ph.expect}</strong></p>`; el.appendChild(sec); }); }
