const signals = [
  {name:"HEAT", score:61, status:"ELEVATED", trend:"↑ 8%", cls:"elev", text:"Afternoon thermal pressure is increasing.", bars:[28,35,43,37,51,60,68]},
  {name:"WATER", score:68, status:"WATCH", trend:"↑ 6%", cls:"watch", text:"Demand is rising faster than simulated availability.", bars:[62,58,61,54,57,48,43]},
  {name:"AIR", score:54, status:"ELEVATED", trend:"↑ 4%", cls:"elev", text:"Air quality pressure is building in dense zones.", bars:[30,40,34,45,42,50,55]},
  {name:"FLOOD", score:87, status:"HIGH RISK", trend:"→ 0%", cls:"high", text:"Low-lying zones remain highly sensitive to heavy rain.", bars:[48,55,63,58,74,79,84]},
  {name:"MOBILITY", score:77, status:"WATCH", trend:"↑ 9%", cls:"watch", text:"Road pressure is increasing around key corridors.", bars:[31,38,41,49,52,60,71]},
  {name:"WASTE", score:81, status:"HIGH", trend:"↑ 3%", cls:"high", text:"Collection and processing pressure is elevated.", bars:[42,45,50,58,55,67,74]},
  {name:"GREEN COVERAGE", score:63, status:"WATCH", trend:"→ 1%", cls:"watch", text:"Green buffers remain uneven across districts.", bars:[64,62,61,60,63,62,61]},
  {name:"ENERGY", score:74, status:"ELEVATED", trend:"↑ 7%", cls:"elev", text:"Simulated demand is approaching a pressure threshold.", bars:[34,42,48,45,56,63,72]}
];

const risks = {
  water: {
    title:"Water Stress", score:82, badge:"HIGH PRIORITY", cls:"high",
    summary:"Multiple simulated signals are moving in the same direction: demand is rising while rainfall and reservoir availability are declining.",
    factors:[["Water demand","↑ 14%"],["Rainfall","↓ 18%"],["Reservoir availability","↓ 9%"]],
    stage:4
  },
  heat: {
    title:"Extreme Heat", score:76, badge:"ELEVATED", cls:"elev",
    summary:"Increasing temperature pressure is concentrated in dense, low-green-cover zones, with afternoon conditions showing the strongest simulated rise.",
    factors:[["Afternoon temperature","↑ 6%"],["Green cover buffer","↓ 3%"],["Energy demand","↑ 11%"]],
    stage:3
  },
  air: {
    title:"Air Quality", score:64, badge:"WATCH", cls:"watch",
    summary:"Traffic pressure and stagnant conditions are combining into a simulated air-quality warning signal around dense corridors.",
    factors:[["Traffic pressure","↑ 9%"],["Wind dispersion","↓ 12%"],["Road density","↑ 5%"]],
    stage:3
  }
};

function renderSignals(){
  const grid=document.getElementById("signalGrid");
  if(!grid) return;
  grid.innerHTML=signals.map((s,i)=>`
    <article class="signal-card-ui" style="--status:${s.cls==='high'?'var(--red)':s.cls==='elev'?'var(--amber)':s.cls==='watch'?'#d5c36b':'var(--green)'}" data-signal="${i}">
      <div class="signal-top"><span>${s.name}</span><span class="trend">${s.trend}</span></div>
      <div class="signal-score">${s.score}</div>
      <div class="signal-status">${s.status}</div>
      <div class="spark">${s.bars.map(v=>`<i style="height:${v}%"></i>`).join("")}</div>
    </article>`).join("");
  grid.querySelectorAll("[data-signal]").forEach(el=>{
    el.addEventListener("click",()=>openSignal(signals[+el.dataset.signal]));
  });
}

function renderRisks(){
  const list=document.getElementById("riskList");
  if(!list) return;
  list.innerHTML=Object.entries(risks).map(([key,r],i)=>`
    <article class="risk-item ${i===0?'active':''}" data-risk="${key}">
      <div class="risk-item-top"><span class="eyebrow">RISK 0${i+1}</span><span class="risk-badge ${r.cls}">${r.badge}</span></div>
      <h3>${r.title}</h3>
      <p>Risk score ${r.score}/100 · Simulated trend ↑</p>
    </article>`).join("");
  list.querySelectorAll("[data-risk]").forEach(el=>el.addEventListener("click",()=>showRisk(el.dataset.risk)));
  showRisk("water");
}

function showRisk(key){
  const r=risks[key], detail=document.getElementById("riskDetail");
  if(!detail) return;
  document.querySelectorAll(".risk-item").forEach(x=>x.classList.toggle("active",x.dataset.risk===key));
  detail.innerHTML=`
    <div class="detail-head">
      <div><span class="risk-badge ${r.cls}">${r.badge}</span><h3>${r.title}</h3></div>
      <div class="detail-score">${r.score}<small>/100</small></div>
    </div>
    <p>${r.summary}</p>
    <div class="detail-grid">
      <div class="why"><h4>WHY IS THE RISK RISING?</h4>${r.factors.map(f=>`<div class="factor"><span>${f[0]}</span><b>${f[1]}</b></div>`).join("")}</div>
      <div class="why"><h4>WHAT COULD HAPPEN NEXT?</h4><div class="factor"><span>Demand pressure</span><b>↑</b></div><div class="factor"><span>Distribution stress</span><b>↑</b></div><div class="factor"><span>Localized impact</span><b>Possible</b></div></div>
    </div>
    <div class="risk-stage"><h4 class="eyebrow">RISK PROGRESSION</h4>
      <div class="stage-track">${[1,2,3,4,5].map(n=>`<span class="${n<=r.stage?'on':''}"></span>`).join("")}</div>
      <div class="stage-labels"><span>NORMAL</span><span>SIGNAL</span><span>TREND</span><b>WARNING</b><span>CRISIS</span></div>
    </div>`;
}

function openSignal(s){
  const modal=document.getElementById("modal");
  if(!modal) return;
  document.getElementById("modalTitle").textContent=s.name;
  document.getElementById("modalText").textContent=s.text;
  document.getElementById("modalCurrent").textContent=s.score;
  document.getElementById("modalTrend").textContent=s.trend+" trend";
  const pts=s.bars.map((v,i)=>`${i*(100/(s.bars.length-1))},${100-v}`).join(" ");
  document.getElementById("fakeChart").innerHTML=`<svg viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points="${pts}" fill="none" stroke="#20e6f5" stroke-width="1.6" vector-effect="non-scaling-stroke"/></svg>`;
  modal.classList.add("open");modal.setAttribute("aria-hidden","false");
}
function closeModal(){const modal=document.getElementById("modal");if(!modal)return;modal.classList.remove("open");modal.setAttribute("aria-hidden","true")}
const modalCloseBtn=document.getElementById("modalClose");
if(modalCloseBtn) modalCloseBtn.addEventListener("click",closeModal);
const modalBackdropEl=document.getElementById("modalBackdrop");
if(modalBackdropEl) modalBackdropEl.addEventListener("click",closeModal);
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal()});

const zoneData={
  "Central District":[72,"Air Quality","Waste","↑ Rising"],
  "Riverside":[64,"Flood Risk","Mobility","→ Stable"],
  "Industrial Area":[58,"Water Stress","Air Quality","↑ Rising"],
  "University District":[69,"Heat","Mobility","↑ Rising"],
  "Residential East":[76,"Energy","Water","→ Stable"]
};
document.querySelectorAll(".zone").forEach(z=>z.addEventListener("click",()=>{
  const d=zoneData[z.dataset.zone]||zoneData["University District"];
  document.querySelector("#zonePanel h3").textContent=z.dataset.zone;
  document.querySelector(".zone-score strong").textContent=d[0];
  const vals=document.querySelectorAll("#zonePanel .mini-stat b");
  vals[0].textContent=d[1];vals[1].textContent=d[2];vals[2].textContent=d[3];
  document.querySelector("#zonePanel").scrollIntoView({behavior:"smooth",block:"nearest"});
}));

const conditions=[["HEAT","Elevated","↑"],["AIR","Moderate","→"],["FLOOD","Low","→"],["MOBILITY","Watch","↑"],["WATER","Watch","↑"],["ENERGY","Elevated","↑"]];
const conditionGridEl=document.getElementById("conditionGrid");
if(conditionGridEl) conditionGridEl.innerHTML=conditions.map(c=>`<div class="condition"><span>${c[0]}</span><b>${c[1]}</b><small>${c[2]} trend</small></div>`).join("");

const timelineText={
 "08:00":"Morning conditions are currently stable.",
 "13:00":"Peak heat pressure is simulated around early afternoon.",
 "17:00":"Mobility pressure becomes more prominent around key corridors.",
 "21:00":"Most simulated signals begin moving toward stable conditions."
};
document.querySelectorAll(".time").forEach(t=>t.addEventListener("click",()=>{
 document.querySelectorAll(".time").forEach(x=>x.classList.remove("active"));
 t.classList.add("active");
 document.getElementById("timelineOutput").textContent=timelineText[t.dataset.time];
}));

const networkText={
 heat:"Extreme heat can raise water and energy demand, creating secondary infrastructure pressure.",
 water:"Rising water demand is an early signal that can amplify localized supply stress.",
 energy:"Heat-driven energy demand can increase pressure on already-stressed infrastructure.",
 rain:"Heavy rain can rapidly change flood and mobility conditions in low-lying zones.",
 flood:"Flood risk can disrupt roads, which can then increase congestion and travel pressure.",
 traffic:"Traffic pressure can contribute to localized air-quality deterioration."
};
document.querySelectorAll(".node").forEach(n=>n.addEventListener("click",()=>{
 document.querySelectorAll(".node").forEach(x=>x.classList.remove("selected"));
 n.classList.add("selected");
 document.getElementById("networkExplain").textContent=networkText[n.dataset.node];
}));

const menuBtn=document.getElementById("menuBtn");
if(menuBtn){
  menuBtn.addEventListener("click",()=>document.querySelector(".nav").classList.toggle("open"));
}
document.querySelectorAll(".nav a").forEach(a=>a.addEventListener("click",()=>document.querySelector(".nav").classList.remove("open")));

renderSignals();renderRisks();

// CITYPULSE 2.0 — scenario simulator
const scenarioData={
  rain:{title:"Rainfall −20%",score:"72 → 61",cascade:[["RAINFALL","−20%"],["WATER STRESS","+18%"],["ENERGY PRESSURE","+7%"],["CITY RESILIENCE","72 → 61"]]},
  green:{title:"Green coverage +15%",score:"72 → 78",cascade:[["GREEN COVERAGE","+15%"],["URBAN HEAT","−9%"],["ENERGY DEMAND","−5%"],["CITY RESILIENCE","72 → 78"]]},
  heat:{title:"Extreme heat +3°C",score:"72 → 58",cascade:[["TEMPERATURE","+3°C"],["WATER DEMAND","+16%"],["ENERGY PRESSURE","+12%"],["CITY RESILIENCE","72 → 58"]]}
};
document.querySelectorAll(".scenario-btn").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".scenario-btn").forEach(x=>x.classList.remove("active"));
  btn.classList.add("active");
  const s=scenarioData[btn.dataset.scenario];
  document.querySelector(".scenario-result h3").textContent=s.title;
  document.querySelector(".scenario-score strong").textContent=s.score;
  document.getElementById("cascade").innerHTML=s.cascade.map((x,i)=>
    `${i?'<i>↓</i>':''}<div><span>${x[0]}</span><b>${x[1]}</b></div>`).join("");
}));
