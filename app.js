const $=s=>document.querySelector(s);
const calendarEl=$('#calendar'),monthLabel=$('#monthLabel');
let planStart=new Date(),planWeeks=24,currentMonth=new Date();
function toKey(d){return d.toISOString().slice(0,10)}
function readAll(){return JSON.parse(localStorage.getItem('fitcal.days')||'{}')}
function writeAll(x){localStorage.setItem('fitcal.days',JSON.stringify(x))}
function readDay(d){return readAll()[toKey(d)]||{status:null,note:''}}
function writeDay(d,val){let all=readAll();all[toKey(d)]=val;writeAll(all);render()}
function render(){monthLabel.textContent=currentMonth.getFullYear()+'-'+(currentMonth.getMonth()+1);
 let first=new Date(currentMonth.getFullYear(),currentMonth.getMonth(),1);
 let start=new Date(first);start.setDate(1-((first.getDay()+6)%7));calendarEl.innerHTML='';
 for(let i=0;i<42;i++){let d=new Date(start);d.setDate(start.getDate()+i);
  let el=document.createElement('div');el.className='day';if(d.getMonth()!=currentMonth.getMonth())el.style.opacity=0.3;
  if(isToday(d))el.classList.add('today');el.innerHTML='<div>'+d.getDate()+'</div><div>'+statusIcon(readDay(d).status)+'</div>';
  el.onclick=()=>openPicker(d);calendarEl.appendChild(el)}}
function statusIcon(s){if(s==='success')return'✅';if(s==='fail')return'❌';if(s==='partial')return'🟨';return''}
function isToday(d){let t=new Date();return d.toDateString()==t.toDateString()}
function openPicker(d){let pick=$('#statusPicker');pick.classList.remove('hidden');pick.onclick=(e)=>{let act=e.target.dataset.status;if(!act)return;let day=readDay(d);if(act==='clear')day.status=null;else if(act==='note'){openNote(d);return}else day.status=act;writeDay(d,day);pick.classList.add('hidden')}};
function openNote(d){let m=$('#noteModal');m.classList.remove('hidden');$('#noteTitle').textContent='메모 '+toKey(d);$('#noteText').value=readDay(d).note;$('#saveNote').onclick=()=>{let day=readDay(d);day.note=$('#noteText').value;writeDay(d,day);m.classList.add('hidden')};$('#cancelNote').onclick=()=>m.classList.add('hidden')}
render();