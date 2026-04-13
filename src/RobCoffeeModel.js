import { useState, useMemo } from "react";

const C = {
  navy: "#1a2332", slate: "#2d3748", charcoal: "#4a5568",
  coral: "#e8604c", coralDk: "#c7432f", coralLt: "#fce8e5",
  teal: "#0ea5a0", tealLt: "#e6f7f6",
  gold: "#f59e0b", goldLt: "#fef3c7",
  green: "#10b981", greenLt: "#ecfdf5",
  red: "#ef4444", redLt: "#fef2f2",
  bg: "#f7f8fb", card: "#fff",
  bdr: "#e2e8f0", bdrDk: "#cbd5e1",
  t1: "#1a2332", t2: "#64748b", t3: "#94a3b8",
};

const fmt = n => { const a=Math.abs(n); const s=n<0?"-":""; if(a>=1e9) return `${s}$${(a/1e9).toFixed(1)}B`; if(a>=1e6) return `${s}$${(a/1e6).toFixed(1)}M`; if(a>=1e3) return `${s}$${(a/1e3).toFixed(0)}K`; return `${s}$${Math.round(a)}`; };
const fmtN = n => Math.round(n).toLocaleString();
const pct = n => `${(n*100).toFixed(1)}%`;
const mo = n => `${n.toFixed(1)} mo`;

function Sl({label,value,onChange,min,max,step=1,display,note}) {
  return (<div style={{marginBottom:11}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:2}}>
      <span style={{fontSize:11.5,fontWeight:500,color:C.t2,fontFamily:"var(--ff)"}}>{label}</span>
      <span style={{fontSize:12.5,fontWeight:700,color:C.navy,fontFamily:"var(--mo)"}}>{display||value}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(parseFloat(e.target.value))}
      style={{width:"100%",accentColor:C.coral,cursor:"pointer",height:5}} />
    <div style={{display:"flex",justifyContent:"space-between",marginTop:1}}>
      <span style={{fontSize:9,color:C.t3,fontFamily:"var(--mo)"}}>{typeof min==='number'&&min}</span>
      <span style={{fontSize:9,color:C.t3,fontFamily:"var(--mo)"}}>{typeof max==='number'&&max}</span>
    </div>
    {note&&<div style={{fontSize:9.5,color:C.teal,marginTop:1,fontStyle:"italic"}}>{note}</div>}
  </div>);
}

function Metric({label,value,sub,color=C.navy,highlight}) {
  return (<div style={{background:highlight?color:C.card,borderRadius:10,padding:"14px 12px",border:`1px solid ${highlight?color:C.bdr}`,textAlign:"center",position:"relative",overflow:"hidden",boxShadow:highlight?`0 2px 12px ${color}22`:"none"}}>
    {!highlight&&<div style={{position:"absolute",top:0,left:0,right:0,height:3,background:color}}/>}
    <div style={{fontSize:22,fontWeight:800,color:highlight?"#fff":color,fontFamily:"var(--ff)",lineHeight:1.1,marginTop:highlight?0:3}}>{value}</div>
    <div style={{fontSize:9.5,fontWeight:600,color:highlight?"rgba(255,255,255,0.85)":C.t2,marginTop:4,textTransform:"uppercase",letterSpacing:"0.05em"}}>{label}</div>
    {sub&&<div style={{fontSize:9,color:highlight?"rgba(255,255,255,0.7)":C.t3,marginTop:2,fontFamily:"var(--mo)"}}>{sub}</div>}
  </div>);
}

function Bar({value,max,color=C.teal,h=14}) {
  return (<div style={{width:"100%",height:h,background:"#edf0f4",borderRadius:h/2,overflow:"hidden"}}>
    <div style={{width:`${Math.min(100,max>0?(value/max)*100:0)}%`,height:"100%",background:color,borderRadius:h/2,transition:"width 0.3s"}}/>
  </div>);
}

function Section({title,sub,children,accent=C.coral}) {
  return (<div style={{marginBottom:8}}>
    <div style={{borderBottom:`2px solid ${accent}`,paddingBottom:5,marginBottom:10}}>
      <h3 style={{fontSize:13,fontWeight:700,color:C.navy,margin:0,textTransform:"uppercase",letterSpacing:"0.05em"}}>{title}</h3>
      {sub&&<p style={{fontSize:10.5,color:C.t2,margin:"2px 0 0"}}>{sub}</p>}
    </div>{children}
  </div>);
}

export default function RobCoffeeModel() {
  // ===== UNIT ECONOMICS INPUTS =====
  const [drinksPerDay, setDrinksPerDay] = useState(200);
  const [avgTicket, setAvgTicket] = useState(5.50);
  const [operatingDays, setOperatingDays] = useState(350);
  const [ingredientCost, setIngredientCost] = useState(1.00);
  const [locationRevShare, setLocationRevShare] = useState(0.15);
  const [ccFeeRate, setCcFeeRate] = useState(0.03);

  // CapEx per kiosk
  const [armCost, setArmCost] = useState(18000);
  const [enclosureCost, setEnclosureCost] = useState(20000);
  const [equipmentCost, setEquipmentCost] = useState(18000);
  const [techHardware, setTechHardware] = useState(5000);
  const [installCost, setInstallCost] = useState(5000);

  // Monthly OpEx per kiosk
  const [maintenanceMo, setMaintenanceMo] = useState(1800);
  const [insuranceMo, setInsuranceMo] = useState(500);
  const [connectivityMo, setConnectivityMo] = useState(200);
  const [powerMo, setPowerMo] = useState(300);

  // Fleet ramp
  const [yr1Units, setYr1Units] = useState(100);
  const [yr2Units, setYr2Units] = useState(500);
  const [yr3Units, setYr3Units] = useState(1000);
  const [attritionRate, setAttritionRate] = useState(0.03);

  // Corp overhead
  const [yr1Overhead, setYr1Overhead] = useState(1200000);
  const [yr2Overhead, setYr2Overhead] = useState(3500000);
  const [yr3Overhead, setYr3Overhead] = useState(5500000);

  const [tab, setTab] = useState("unit");

  const model = useMemo(() => {
    // ===== UNIT ECONOMICS =====
    const capexPerUnit = armCost + enclosureCost + equipmentCost + techHardware + installCost;
    const annualRevPerUnit = drinksPerDay * avgTicket * operatingDays;
    const monthlyRev = annualRevPerUnit / 12;
    const annualCOGS = drinksPerDay * ingredientCost * operatingDays;
    const annualLocShare = annualRevPerUnit * locationRevShare;
    const annualCCFees = annualRevPerUnit * ccFeeRate;
    const annualMaintenance = maintenanceMo * 12;
    const annualInsurance = insuranceMo * 12;
    const annualConnectivity = connectivityMo * 12;
    const annualPower = powerMo * 12;
    const annualOpEx = annualCOGS + annualLocShare + annualCCFees + annualMaintenance + annualInsurance + annualConnectivity + annualPower;
    const annualContrib = annualRevPerUnit - annualOpEx;
    const monthlyContrib = annualContrib / 12;
    const grossMargin = annualContrib / annualRevPerUnit;
    const paybackMonths = monthlyContrib > 0 ? capexPerUnit / monthlyContrib : 999;
    const annualROI = annualContrib / capexPerUnit;
    const ltv3yr = annualContrib * 3 - capexPerUnit;
    const ltvCapexRatio = (annualContrib * 3) / capexPerUnit;

    // ===== FLEET ECONOMICS (3 years, quarterly) =====
    const years = [
      { year: 2027, label: "Year 1", endUnits: yr1Units, newUnits: yr1Units, overhead: yr1Overhead },
      { year: 2028, label: "Year 2", endUnits: yr2Units, newUnits: yr2Units - yr1Units * (1 - attritionRate), overhead: yr2Overhead },
      { year: 2029, label: "Year 3", endUnits: yr3Units, newUnits: yr3Units - yr2Units * (1 - attritionRate), overhead: yr3Overhead },
    ];

    let cumUnits = 0;
    let cumCapex = 0;
    let cumContrib = 0;
    let cumOverhead = 0;
    let cumCashFlow = 0;

    const fleetYears = years.map((y, yi) => {
      const priorUnits = cumUnits;
      const attrited = Math.round(priorUnits * attritionRate);
      const surviving = priorUnits - attrited;
      const targetEnd = y.endUnits;
      const newNeeded = Math.max(0, targetEnd - surviving);
      const replacements = attrited;
      const totalNew = newNeeded + replacements;

      // Phase deployment across 4 quarters
      const qDeploy = [
        Math.round(totalNew * 0.15),
        Math.round(totalNew * 0.25),
        Math.round(totalNew * 0.30),
        totalNew - Math.round(totalNew * 0.15) - Math.round(totalNew * 0.25) - Math.round(totalNew * 0.30),
      ];

      let runningUnits = surviving;
      const quarters = qDeploy.map((qNew, qi) => {
        const qStartUnits = runningUnits;
        runningUnits += qNew;
        const qAvgUnits = (qStartUnits + runningUnits) / 2;
        const qRev = qAvgUnits * (annualRevPerUnit / 4);
        const qOpEx = qAvgUnits * (annualOpEx / 4);
        const qContrib = qRev - qOpEx;
        const qCapex = qNew * capexPerUnit;
        const qOverhead = y.overhead / 4;
        const qEBITDA = qContrib - qOverhead;
        const qCashFlow = qEBITDA - qCapex;
        return { q: yi * 4 + qi + 1, qNew, endUnits: runningUnits, avgUnits: qAvgUnits, rev: qRev, opex: qOpEx, contrib: qContrib, capex: qCapex, overhead: qOverhead, ebitda: qEBITDA, cashFlow: qCashFlow };
      });

      cumUnits = runningUnits;
      const yrRev = quarters.reduce((s, q) => s + q.rev, 0);
      const yrOpEx = quarters.reduce((s, q) => s + q.opex, 0);
      const yrContrib = quarters.reduce((s, q) => s + q.contrib, 0);
      const yrCapex = quarters.reduce((s, q) => s + q.capex, 0);
      const yrOverhead = y.overhead;
      const yrEBITDA = yrContrib - yrOverhead;
      const yrCashFlow = yrEBITDA - yrCapex;

      cumCapex += yrCapex;
      cumContrib += yrContrib;
      cumOverhead += yrOverhead;
      cumCashFlow += yrCashFlow;

      return {
        ...y, totalNew, replacements, attrited, endUnits: cumUnits, quarters,
        rev: yrRev, opex: yrOpEx, contrib: yrContrib, capex: yrCapex, overhead: yrOverhead, ebitda: yrEBITDA, cashFlow: yrCashFlow,
        cumCapex, cumContrib, cumOverhead, cumCashFlow,
        ebitdaMargin: yrRev > 0 ? yrEBITDA / yrRev : 0,
        contribMargin: yrRev > 0 ? yrContrib / yrRev : 0,
      };
    });

    // Steady state (Year 3 annualized at full fleet)
    const ssUnits = yr3Units;
    const ssRev = ssUnits * annualRevPerUnit;
    const ssOpEx = ssUnits * annualOpEx;
    const ssContrib = ssRev - ssOpEx;
    const ssReplacements = Math.round(ssUnits * attritionRate);
    const ssCapex = ssReplacements * capexPerUnit;
    const ssOverhead = yr3Overhead * 1.05;
    const ssEBITDA = ssContrib - ssOverhead;
    const ssCashFlow = ssEBITDA - ssCapex;
    const ssEBITDAMargin = ssRev > 0 ? ssEBITDA / ssRev : 0;

    // TAM
    const tamLow = 15000 * annualRevPerUnit;
    const tamHigh = 50000 * annualRevPerUnit;
    const penetrationYr3 = yr3Units / 15000;

    return {
      capexPerUnit, annualRevPerUnit, monthlyRev, annualCOGS, annualLocShare, annualCCFees,
      annualMaintenance, annualInsurance, annualConnectivity, annualPower, annualOpEx, annualContrib,
      monthlyContrib, grossMargin, paybackMonths, annualROI, ltv3yr, ltvCapexRatio,
      fleetYears, cumCapex, cumContrib, cumOverhead, cumCashFlow,
      ssUnits, ssRev, ssOpEx, ssContrib, ssCapex, ssOverhead, ssEBITDA, ssCashFlow, ssEBITDAMargin,
      tamLow, tamHigh, penetrationYr3,
    };
  }, [drinksPerDay, avgTicket, operatingDays, ingredientCost, locationRevShare, ccFeeRate,
    armCost, enclosureCost, equipmentCost, techHardware, installCost,
    maintenanceMo, insuranceMo, connectivityMo, powerMo,
    yr1Units, yr2Units, yr3Units, attritionRate, yr1Overhead, yr2Overhead, yr3Overhead]);

  const TabBtn = ({k, label}) => (
    <button onClick={()=>setTab(k)} style={{padding:"7px 14px",fontSize:10.5,fontWeight:tab===k?700:500,
      color:tab===k?"#fff":C.t2,background:tab===k?C.navy:"transparent",
      border:`1px solid ${tab===k?C.navy:C.bdr}`,borderRadius:5,cursor:"pointer",
      fontFamily:"var(--ff)",textTransform:"uppercase",letterSpacing:"0.04em",transition:"all 0.15s"}}>{label}</button>
  );

  return (
    <div style={{fontFamily:"var(--ff)",background:C.bg,minHeight:"100vh",padding:"16px 14px",
      "--ff":"'DM Sans',system-ui,sans-serif","--mo":"'DM Mono','SF Mono',monospace"}}>
      <style>{`input[type=range]{-webkit-appearance:none;height:5px;border-radius:3px;background:#e2e8f0;outline:none}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:15px;height:15px;border-radius:50%;background:${C.coral};cursor:pointer;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.2)}
*{box-sizing:border-box}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.fu{animation:fadeUp .3s ease}`}</style>

      {/* HEADER */}
      <div style={{maxWidth:1320,margin:"0 auto 12px"}}>
        <div style={{fontSize:10,fontWeight:700,color:C.coral,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:2}}>RobCoffee | Business Case</div>
        <h1 style={{fontSize:22,fontWeight:800,color:C.navy,margin:0,lineHeight:1.15}}>Autonomous Coffee Kiosk — Financial Model</h1>
        <p style={{fontSize:11.5,color:C.t2,margin:"3px 0 0"}}>Unit economics, fleet build, 3-year P&L, payback analysis, and steady-state profitability.</p>
      </div>

      <div style={{maxWidth:1320,margin:"0 auto",display:"grid",gridTemplateColumns:"280px 1fr",gap:12}}>
        {/* LEFT PANEL — ASSUMPTIONS */}
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{background:C.card,borderRadius:10,padding:14,border:`1px solid ${C.bdr}`}}>
            <Section title="Revenue Drivers" sub="Per kiosk">
              <Sl label="Drinks / Day" value={drinksPerDay} onChange={setDrinksPerDay} min={80} max={400} display={drinksPerDay} note="Airport avg: 250-350 | Mall: 150-250"/>
              <Sl label="Avg Ticket ($)" value={avgTicket} onChange={setAvgTicket} min={3} max={9} step={0.25} display={`$${avgTicket.toFixed(2)}`}/>
              <Sl label="Operating Days / Yr" value={operatingDays} onChange={setOperatingDays} min={250} max={365} display={operatingDays}/>
            </Section>
          </div>
          <div style={{background:C.card,borderRadius:10,padding:14,border:`1px solid ${C.bdr}`}}>
            <Section title="CapEx Per Kiosk" sub="One-time build cost" accent={C.teal}>
              <Sl label="RobCo Arm" value={armCost} onChange={setArmCost} min={12000} max={25000} step={500} display={fmt(armCost)}/>
              <Sl label="Enclosure" value={enclosureCost} onChange={setEnclosureCost} min={10000} max={35000} step={1000} display={fmt(enclosureCost)}/>
              <Sl label="Espresso Equipment" value={equipmentCost} onChange={setEquipmentCost} min={8000} max={30000} step={1000} display={fmt(equipmentCost)}/>
              <Sl label="Tech / POS / NFC" value={techHardware} onChange={setTechHardware} min={2000} max={10000} step={500} display={fmt(techHardware)}/>
              <Sl label="Install / Deploy" value={installCost} onChange={setInstallCost} min={2000} max={15000} step={500} display={fmt(installCost)}/>
            </Section>
          </div>
          <div style={{background:C.card,borderRadius:10,padding:14,border:`1px solid ${C.bdr}`}}>
            <Section title="OpEx Per Kiosk" sub="Variable + fixed monthly" accent={C.gold}>
              <Sl label="Ingredient COGS ($)" value={ingredientCost} onChange={setIngredientCost} min={0.50} max={2.00} step={0.05} display={`$${ingredientCost.toFixed(2)}/drink`}/>
              <Sl label="Location Rev Share" value={locationRevShare} onChange={setLocationRevShare} min={0.05} max={0.30} step={0.01} display={pct(locationRevShare)}/>
              <Sl label="CC Processing" value={ccFeeRate} onChange={setCcFeeRate} min={0.02} max={0.04} step={0.005} display={pct(ccFeeRate)}/>
              <Sl label="Maintenance / Mo" value={maintenanceMo} onChange={setMaintenanceMo} min={500} max={4000} step={100} display={fmt(maintenanceMo)} note="Restocking, cleaning, PM visits"/>
              <Sl label="Insurance / Mo" value={insuranceMo} onChange={setInsuranceMo} min={200} max={1500} step={50} display={fmt(insuranceMo)}/>
              <Sl label="Connectivity / Mo" value={connectivityMo} onChange={setConnectivityMo} min={50} max={500} step={25} display={fmt(connectivityMo)}/>
              <Sl label="Power / Mo" value={powerMo} onChange={setPowerMo} min={100} max={800} step={25} display={fmt(powerMo)}/>
            </Section>
          </div>
          <div style={{background:C.card,borderRadius:10,padding:14,border:`1px solid ${C.bdr}`}}>
            <Section title="Fleet Ramp" sub="Cumulative deployed kiosks" accent={C.navy}>
              <Sl label="Year 1 (2027)" value={yr1Units} onChange={setYr1Units} min={25} max={250} display={yr1Units}/>
              <Sl label="Year 2 (2028)" value={yr2Units} onChange={setYr2Units} min={100} max={1500} display={yr2Units}/>
              <Sl label="Year 3 (2029)" value={yr3Units} onChange={setYr3Units} min={250} max={3000} display={yr3Units}/>
              <Sl label="Annual Attrition" value={attritionRate} onChange={setAttritionRate} min={0.01} max={0.10} step={0.005} display={pct(attritionRate)} note="Units decommissioned/replaced"/>
              <Sl label="Year 1 Corp Overhead" value={yr1Overhead} onChange={setYr1Overhead} min={500000} max={3000000} step={100000} display={fmt(yr1Overhead)}/>
              <Sl label="Year 2 Corp Overhead" value={yr2Overhead} onChange={setYr2Overhead} min={1000000} max={8000000} step={250000} display={fmt(yr2Overhead)}/>
              <Sl label="Year 3 Corp Overhead" value={yr3Overhead} onChange={setYr3Overhead} min={2000000} max={12000000} step={250000} display={fmt(yr3Overhead)}/>
            </Section>
          </div>
        </div>

        {/* RIGHT PANEL — OUTPUTS */}
        <div>
          {/* TABS */}
          <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
            <TabBtn k="unit" label="Unit Economics"/>
            <TabBtn k="fleet" label="Fleet P&L"/>
            <TabBtn k="cash" label="Cash Flow"/>
            <TabBtn k="steady" label="Steady State"/>
            <TabBtn k="risk" label="Risks"/>
          </div>

          {/* HEADLINE METRICS */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:8,marginBottom:12}}>
            <Metric label="CapEx / Kiosk" value={fmt(model.capexPerUnit)} color={C.teal} highlight/>
            <Metric label="Payback" value={mo(model.paybackMonths)} sub="months" color={C.coral} highlight/>
            <Metric label="Contribution / Yr" value={fmt(model.annualContrib)} sub="per kiosk" color={C.green}/>
            <Metric label="Unit Gross Margin" value={pct(model.grossMargin)} color={C.navy}/>
            <Metric label="3-Yr LTV" value={fmt(model.ltv3yr)} sub={`${model.ltvCapexRatio.toFixed(1)}x CapEx`} color={C.navy}/>
            <Metric label="Annual ROI" value={`${(model.annualROI*100).toFixed(0)}%`} sub="per unit" color={model.annualROI>2?C.green:C.gold}/>
            <Metric label="Yr 3 Fleet Rev" value={fmt(model.fleetYears[2]?.rev||0)} sub={`${model.fleetYears[2]?.endUnits||0} kiosks`} color={C.coral}/>
            <Metric label="Yr 3 EBITDA" value={fmt(model.fleetYears[2]?.ebitda||0)} sub={pct(model.fleetYears[2]?.ebitdaMargin||0)} color={model.fleetYears[2]?.ebitda>0?C.green:C.red}/>
          </div>

          {/* TAB CONTENT */}
          {tab==="unit"&&(
            <div className="fu">
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div style={{background:C.card,borderRadius:10,padding:16,border:`1px solid ${C.bdr}`}}>
                  <Section title="Revenue Waterfall" sub="Per kiosk per year">
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                      <tbody>
                        {[
                          ["Drinks / Day", fmtN(drinksPerDay), ""],
                          ["× Avg Ticket", `$${avgTicket.toFixed(2)}`, ""],
                          ["× Operating Days", operatingDays, ""],
                          ["= Annual Revenue", fmt(model.annualRevPerUnit), C.navy],
                          ["Monthly Revenue", fmt(model.monthlyRev), C.t2],
                        ].map(([l,v,c],i)=>(<tr key={i} style={{borderBottom:i===3?`2px solid ${C.navy}`:`1px solid ${C.bdr}`}}>
                          <td style={{padding:"7px 4px",color:c||C.t2,fontWeight:i===3?700:400}}>{l}</td>
                          <td style={{padding:"7px 4px",textAlign:"right",fontFamily:"var(--mo)",fontWeight:i===3?700:400,color:c||C.t1}}>{v}</td>
                        </tr>))}
                      </tbody>
                    </table>
                  </Section>
                </div>
                <div style={{background:C.card,borderRadius:10,padding:16,border:`1px solid ${C.bdr}`}}>
                  <Section title="Cost Structure" sub="Per kiosk per year" accent={C.teal}>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                      <tbody>
                        {[
                          ["Ingredients (COGS)", fmt(model.annualCOGS), pct(model.annualCOGS/model.annualRevPerUnit)],
                          ["Location Rev Share", fmt(model.annualLocShare), pct(locationRevShare)],
                          ["CC Processing", fmt(model.annualCCFees), pct(ccFeeRate)],
                          ["Maintenance", fmt(model.annualMaintenance), ""],
                          ["Insurance", fmt(model.annualInsurance), ""],
                          ["Connectivity", fmt(model.annualConnectivity), ""],
                          ["Power", fmt(model.annualPower), ""],
                          ["= Total OpEx", fmt(model.annualOpEx), pct(model.annualOpEx/model.annualRevPerUnit)],
                          ["= Contribution", fmt(model.annualContrib), pct(model.grossMargin)],
                        ].map(([l,v,p],i)=>{const isBold=i>=7;return(<tr key={i} style={{borderBottom:i===6?`2px solid ${C.teal}`:i===7?`1px solid ${C.bdr}`:`1px solid ${C.bdr}`}}>
                          <td style={{padding:"6px 4px",color:isBold?C.navy:C.t2,fontWeight:isBold?700:400}}>{l}</td>
                          <td style={{padding:"6px 4px",textAlign:"right",fontFamily:"var(--mo)",fontWeight:isBold?700:400,color:i===8?C.green:C.t1}}>{v}</td>
                          <td style={{padding:"6px 4px",textAlign:"right",fontSize:10,color:C.t3}}>{p}</td>
                        </tr>)})}
                      </tbody>
                    </table>
                  </Section>
                </div>
              </div>
              <div style={{background:C.card,borderRadius:10,padding:16,border:`1px solid ${C.bdr}`,marginTop:10}}>
                <Section title="Payback & Return Analysis" sub="Single kiosk investment thesis" accent={C.green}>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:12}}>
                    <div style={{textAlign:"center"}}><div style={{fontSize:28,fontWeight:800,color:C.coral}}>{model.paybackMonths.toFixed(1)}</div><div style={{fontSize:10,color:C.t2}}>Months to Payback</div></div>
                    <div style={{textAlign:"center"}}><div style={{fontSize:28,fontWeight:800,color:C.green}}>{(model.annualROI*100).toFixed(0)}%</div><div style={{fontSize:10,color:C.t2}}>Annual ROI</div></div>
                    <div style={{textAlign:"center"}}><div style={{fontSize:28,fontWeight:800,color:C.navy}}>{model.ltvCapexRatio.toFixed(1)}x</div><div style={{fontSize:10,color:C.t2}}>3-Yr LTV / CapEx</div></div>
                    <div style={{textAlign:"center"}}><div style={{fontSize:28,fontWeight:800,color:C.teal}}>{fmt(model.ltv3yr)}</div><div style={{fontSize:10,color:C.t2}}>3-Yr Net LTV</div></div>
                  </div>
                  <div style={{height:24,display:"flex",gap:2,borderRadius:12,overflow:"hidden"}}>
                    <div style={{width:`${(model.annualCOGS/model.annualRevPerUnit)*100}%`,background:C.red,height:"100%"}} title="COGS"/>
                    <div style={{width:`${locationRevShare*100}%`,background:C.gold,height:"100%"}} title="Location Share"/>
                    <div style={{width:`${((model.annualMaintenance+model.annualInsurance+model.annualConnectivity+model.annualPower+model.annualCCFees)/model.annualRevPerUnit)*100}%`,background:C.charcoal,height:"100%"}} title="Fixed OpEx"/>
                    <div style={{flex:1,background:C.green,height:"100%"}} title="Contribution"/>
                  </div>
                  <div style={{display:"flex",gap:16,marginTop:6,fontSize:10,color:C.t2}}>
                    <span><span style={{display:"inline-block",width:8,height:8,borderRadius:2,background:C.red,marginRight:4}}/>COGS</span>
                    <span><span style={{display:"inline-block",width:8,height:8,borderRadius:2,background:C.gold,marginRight:4}}/>Location</span>
                    <span><span style={{display:"inline-block",width:8,height:8,borderRadius:2,background:C.charcoal,marginRight:4}}/>Fixed OpEx</span>
                    <span><span style={{display:"inline-block",width:8,height:8,borderRadius:2,background:C.green,marginRight:4}}/>Contribution ({pct(model.grossMargin)})</span>
                  </div>
                </Section>
              </div>
            </div>
          )}

          {tab==="fleet"&&(
            <div className="fu" style={{background:C.card,borderRadius:10,padding:16,border:`1px solid ${C.bdr}`}}>
              <Section title="Fleet P&L — 3 Year Build" sub="2027–2029 | RobCo manufactures, owns, operates">
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,marginBottom:12}}>
                  <thead><tr style={{borderBottom:`2px solid ${C.navy}`}}>
                    {["","Year 1 (2027)","Year 2 (2028)","Year 3 (2029)","Cumulative"].map(h=>
                      <th key={h} style={{padding:"7px 6px",textAlign:h?"right":"left",fontSize:10,fontWeight:700,color:C.t2,textTransform:"uppercase"}}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {[
                      {l:"New Kiosks Deployed",vals:model.fleetYears.map(y=>fmtN(y.totalNew)),cum:fmtN(model.fleetYears.reduce((s,y)=>s+y.totalNew,0)),bold:false},
                      {l:"End-of-Year Fleet",vals:model.fleetYears.map(y=>fmtN(y.endUnits)),cum:"—",bold:true},
                      {l:"",vals:["","",""],cum:"",sep:true},
                      {l:"Revenue",vals:model.fleetYears.map(y=>fmt(y.rev)),cum:fmt(model.fleetYears.reduce((s,y)=>s+y.rev,0)),bold:false,color:C.navy},
                      {l:"Operating Expenses",vals:model.fleetYears.map(y=>`(${fmt(y.opex)})`),cum:`(${fmt(model.fleetYears.reduce((s,y)=>s+y.opex,0))})`,bold:false,color:C.red},
                      {l:"Kiosk Contribution",vals:model.fleetYears.map(y=>fmt(y.contrib)),cum:fmt(model.cumContrib),bold:true,color:C.green},
                      {l:"Contribution Margin",vals:model.fleetYears.map(y=>pct(y.contribMargin)),cum:"—",bold:false,color:C.t2},
                      {l:"",vals:["","",""],cum:"",sep:true},
                      {l:"Corporate Overhead",vals:model.fleetYears.map(y=>`(${fmt(y.overhead)})`),cum:`(${fmt(model.cumOverhead)})`,bold:false,color:C.red},
                      {l:"EBITDA",vals:model.fleetYears.map(y=>fmt(y.ebitda)),cum:fmt(model.fleetYears.reduce((s,y)=>s+y.ebitda,0)),bold:true,color:model.fleetYears[2]?.ebitda>0?C.green:C.red},
                      {l:"EBITDA Margin",vals:model.fleetYears.map(y=>pct(y.ebitdaMargin)),cum:"—",bold:false,color:C.t2},
                      {l:"",vals:["","",""],cum:"",sep:true},
                      {l:"Fleet CapEx",vals:model.fleetYears.map(y=>`(${fmt(y.capex)})`),cum:`(${fmt(model.cumCapex)})`,bold:false,color:C.red},
                      {l:"Free Cash Flow",vals:model.fleetYears.map(y=>fmt(y.cashFlow)),cum:fmt(model.cumCashFlow),bold:true,color:model.cumCashFlow>0?C.green:C.red},
                    ].map((r,i)=>(r.sep?<tr key={i}><td colSpan={5} style={{padding:3,borderBottom:`1px solid ${C.bdr}`}}/></tr>:
                      <tr key={i} style={{borderBottom:`1px solid ${r.bold?C.bdrDk:C.bdr}`,background:r.bold?"#f8fafc":"transparent"}}>
                        <td style={{padding:"7px 6px",fontWeight:r.bold?700:400,color:r.color||C.t1,fontSize:r.bold?12:11.5}}>{r.l}</td>
                        {r.vals.map((v,vi)=><td key={vi} style={{padding:"7px 6px",textAlign:"right",fontFamily:"var(--mo)",fontWeight:r.bold?700:400,color:r.color||C.t1}}>{v}</td>)}
                        <td style={{padding:"7px 6px",textAlign:"right",fontFamily:"var(--mo)",fontWeight:700,color:r.color||C.navy,background:r.bold?"#f1f5f9":"transparent"}}>{r.cum}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Fleet bar chart */}
                <div style={{height:140,display:"flex",alignItems:"flex-end",gap:3,padding:"0 20px"}}>
                  {model.fleetYears.flatMap(y=>y.quarters).map((q,i)=>{
                    const maxR=Math.max(...model.fleetYears.flatMap(y=>y.quarters).map(qq=>qq.rev));
                    const h=maxR>0?(q.rev/maxR)*120:0;
                    return(<div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center"}}>
                      <div style={{width:"100%",height:Math.max(2,h),background:q.ebitda>0?C.green:C.coral,borderRadius:"3px 3px 0 0",transition:"height 0.3s"}}/>
                      <div style={{fontSize:8,color:C.t3,marginTop:3}}>Q{q.q}</div>
                    </div>);
                  })}
                </div>
                <div style={{textAlign:"center",fontSize:10,color:C.t3,marginTop:4}}>Quarterly Revenue Build (green = EBITDA positive)</div>
              </Section>
            </div>
          )}

          {tab==="cash"&&(
            <div className="fu">
              <div style={{background:C.card,borderRadius:10,padding:16,border:`1px solid ${C.bdr}`,marginBottom:10}}>
                <Section title="Cumulative Cash Flow" sub="CapEx investment vs. contribution build">
                  {(()=>{
                    let cumCF=0;const pts=model.fleetYears.flatMap(y=>y.quarters).map(q=>{cumCF+=q.cashFlow;return{...q,cumCF};});
                    const maxAbs=Math.max(...pts.map(p=>Math.abs(p.cumCF)),1);
                    const mid=100;
                    return(<div>
                      <div style={{height:200,display:"flex",alignItems:"center",gap:2,position:"relative",padding:"0 10px"}}>
                        <div style={{position:"absolute",left:0,right:0,top:mid,height:1,background:C.bdr}}/>
                        <div style={{position:"absolute",left:10,top:mid-12,fontSize:9,color:C.t3}}>$0</div>
                        {pts.map((p,i)=>{
                          const h=Math.abs(p.cumCF)/maxAbs*90;
                          const isPos=p.cumCF>=0;
                          return(<div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:isPos?"flex-end":"flex-start",position:"relative"}}>
                            <div style={{position:"absolute",width:"100%",height:Math.max(2,h),background:isPos?C.green:C.coral,borderRadius:3,
                              top:isPos?mid-h:mid,transition:"all 0.3s"}}/>
                            <div style={{position:"absolute",top:isPos?mid-h-14:mid+h+2,width:"100%",textAlign:"center",fontSize:8,color:C.t3}}>{fmt(p.cumCF)}</div>
                            <div style={{position:"absolute",top:mid+95,width:"100%",textAlign:"center",fontSize:8,color:C.t3}}>Q{p.q}</div>
                          </div>);
                        })}
                      </div>
                      <div style={{textAlign:"center",fontSize:10,color:C.t2,marginTop:8}}>
                        {cumCF>=0?`Cash flow turns positive by Q${pts.findIndex(p=>p.cumCF>=0)+1}`:`Cumulative investment of ${fmt(Math.abs(cumCF))} through Year 3 — fleet still building`}
                      </div>
                    </div>);
                  })()}
                </Section>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div style={{background:C.card,borderRadius:10,padding:16,border:`1px solid ${C.bdr}`}}>
                  <Section title="Capital Deployment" sub="Where the money goes" accent={C.teal}>
                    {[
                      {l:"Fleet CapEx (kiosks)",v:model.cumCapex,pct:model.cumCapex/(model.cumCapex+model.cumOverhead)},
                      {l:"Corporate Overhead",v:model.cumOverhead,pct:model.cumOverhead/(model.cumCapex+model.cumOverhead)},
                      {l:"Total Investment",v:model.cumCapex+model.cumOverhead,pct:1},
                    ].map((r,i)=>(<div key={i} style={{marginBottom:8}}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
                        <span style={{color:i===2?C.navy:C.t2,fontWeight:i===2?700:400}}>{r.l}</span>
                        <span style={{fontFamily:"var(--mo)",fontWeight:i===2?700:400,color:C.navy}}>{fmt(r.v)}</span>
                      </div>
                      {i<2&&<Bar value={r.pct} max={1} color={i===0?C.teal:C.gold} h={10}/>}
                    </div>))}
                  </Section>
                </div>
                <div style={{background:C.card,borderRadius:10,padding:16,border:`1px solid ${C.bdr}`}}>
                  <Section title="Funding Strategy" sub="How to finance the fleet" accent={C.navy}>
                    <div style={{fontSize:11,lineHeight:1.7,color:C.t2}}>
                      <p style={{margin:"0 0 8px"}}><b style={{color:C.navy}}>Equipment Financing:</b> With {mo(model.paybackMonths)} payback and {pct(model.grossMargin)} contribution margin, the fleet is highly bankable. Equipment lenders will finance 70-80% of CapEx at 6-8% interest against the recurring revenue stream.</p>
                      <p style={{margin:"0 0 8px"}}><b style={{color:C.navy}}>Year 1 equity requirement:</b> {fmt(model.fleetYears[0]?.capex * 0.3 + model.fleetYears[0]?.overhead)} (30% CapEx equity + overhead). Allocable from Series C.</p>
                      <p style={{margin:0}}><b style={{color:C.navy}}>SPV structure:</b> Kiosk fleet can be isolated in an SPV with asset-backed debt, similar to the solar company model referenced in the core RobCo Americas plan.</p>
                    </div>
                  </Section>
                </div>
              </div>
            </div>
          )}

          {tab==="steady"&&(
            <div className="fu">
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:8,marginBottom:12}}>
                <Metric label="Fleet Size" value={fmtN(model.ssUnits)} sub="kiosks" color={C.navy} highlight/>
                <Metric label="Annual Revenue" value={fmt(model.ssRev)} color={C.coral} highlight/>
                <Metric label="EBITDA" value={fmt(model.ssEBITDA)} sub={pct(model.ssEBITDAMargin)} color={C.green} highlight/>
                <Metric label="Free Cash Flow" value={fmt(model.ssCashFlow)} color={C.green} highlight/>
              </div>
              <div style={{background:C.card,borderRadius:10,padding:16,border:`1px solid ${C.bdr}`,marginBottom:10}}>
                <Section title="Steady-State Economics" sub={`Year 3+ at ${fmtN(model.ssUnits)} kiosks — replacement CapEx only`}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                    <tbody>
                      {[
                        ["Fleet Revenue",fmt(model.ssRev),"",false],
                        ["Fleet OpEx",`(${fmt(model.ssOpEx)})`,pct(model.ssOpEx/model.ssRev),false],
                        ["Fleet Contribution",fmt(model.ssContrib),pct(model.ssContrib/model.ssRev),true],
                        ["Corporate Overhead",`(${fmt(model.ssOverhead)})`,pct(model.ssOverhead/model.ssRev),false],
                        ["EBITDA",fmt(model.ssEBITDA),pct(model.ssEBITDAMargin),true],
                        ["Replacement CapEx",`(${fmt(model.ssCapex)})`,`${model.ssReplacements} units`,false],
                        ["Free Cash Flow",fmt(model.ssCashFlow),pct(model.ssCashFlow/model.ssRev),true],
                      ].map(([l,v,p,bold],i)=>(
                        <tr key={i} style={{borderBottom:`${bold?"2":"1"}px solid ${bold?C.navy:C.bdr}`,background:bold?"#f8fafc":"transparent"}}>
                          <td style={{padding:"8px 6px",fontWeight:bold?700:400,color:C.t1}}>{l}</td>
                          <td style={{padding:"8px 6px",textAlign:"right",fontFamily:"var(--mo)",fontWeight:bold?700:400,color:v.includes("(")?C.red:C.navy}}>{v}</td>
                          <td style={{padding:"8px 6px",textAlign:"right",fontSize:10,color:C.t3}}>{p}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Section>
              </div>
              <div style={{background:C.navy,borderRadius:10,padding:16,color:"#fff"}}>
                <div style={{fontSize:14,fontWeight:800,marginBottom:6}}>TAM & Penetration</div>
                <div style={{fontSize:11.5,lineHeight:1.7,opacity:0.9}}>
                  Addressable locations (airports, train stations, hospitals, universities, malls, commercial lobbies): 15,000–50,000 in the US alone. At {fmtN(model.ssUnits)} kiosks, RobCoffee has captured {pct(model.penetrationYr3)} of the low-end TAM — leaving massive runway. At full TAM penetration, the revenue opportunity ranges from {fmt(model.tamLow)} to {fmt(model.tamHigh)}.
                </div>
              </div>
            </div>
          )}

          {tab==="risk"&&(
            <div className="fu" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[
                {title:"Location Acquisition",severity:"HIGH",color:C.coral,desc:"Airport and premium venue concession agreements are competitive, slow to close (6-12 month cycles), and require insurance, health permits, and revenue guarantees. Mitigation: Start with universities and commercial lobbies (shorter cycles, lower rev share), use those as proof points for airport RFPs."},
                {title:"Hardware Reliability",severity:"MEDIUM",color:C.gold,desc:"Espresso equipment failure in an unattended kiosk = lost revenue + brand damage. The arm itself is industrial-grade, but consumer food equipment has different failure modes. Mitigation: Dual-redundant brewing systems, IoT monitoring with predictive maintenance, 4-hour SLA for field service."},
                {title:"Regulatory / Health Code",severity:"MEDIUM",color:C.gold,desc:"Automated food service faces different regulatory frameworks by jurisdiction. FDA, state health departments, and local codes may require specific certifications for unattended food prep. Mitigation: Engage food service regulatory counsel pre-launch. Pilot in permissive jurisdictions first (TX, FL)."},
                {title:"Cannibalization Risk",severity:"LOW",color:C.teal,desc:"Roman may view kiosks as a distraction from core manufacturing RaaS. Mitigation: Position as a brand extension that funds itself, generates press coverage, and demonstrates the platform in consumer-visible environments. The kiosk IS a marketing asset."},
                {title:"Capital Intensity",severity:"MEDIUM",color:C.gold,desc:`${fmt(model.cumCapex)} in fleet CapEx over 3 years competes with core RaaS deployment capital. Mitigation: Equipment financing facility isolates kiosk capital from equity. ${mo(model.paybackMonths)} payback makes the fleet self-funding after the initial tranche.`},
                {title:"Competitive Response",severity:"LOW",color:C.teal,desc:"Existing robotic coffee kiosks (Cafe X, Briggo, Rozum) have struggled to scale. RobCo's advantage: vertically integrated hardware + AI stack, lower unit cost, and the brand halo from industrial deployments. The risk is that a well-funded competitor (e.g., Starbucks + Boston Dynamics) enters."},
              ].map((r,i)=>(
                <div key={i} style={{background:C.card,borderRadius:10,padding:14,border:`1px solid ${C.bdr}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <span style={{fontSize:13,fontWeight:700,color:C.navy}}>{r.title}</span>
                    <span style={{fontSize:9,fontWeight:700,color:r.color,background:r.color+"18",padding:"2px 8px",borderRadius:4}}>{r.severity}</span>
                  </div>
                  <div style={{fontSize:11,lineHeight:1.6,color:C.t2}}>{r.desc}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div style={{maxWidth:1320,margin:"14px auto 0",textAlign:"center"}}>
        <div style={{fontSize:9,color:C.t3,fontFamily:"var(--mo)"}}>RobCoffee | Financial Model v1 | Daniel M. Mohan | April 2026 | Confidential</div>
      </div>
    </div>
  );
}
