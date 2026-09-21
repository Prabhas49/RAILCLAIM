import { motion } from "framer-motion"
import { CLAIM_QUEUE, OEM_BY_ID } from "../data/mock"
import type { ViewId } from "../types"

const stats=[
  {emoji:"✨",label:"Ready to send",value:"2",sub:"₹7.2L recoverable",grad:"from-[#FF8A65] to-[#FFB74D]"},
  {emoji:"💬",label:"Needs your touch",value:"2",sub:"waiting for info",grad:"from-[#7EC8E3] to-[#A78BFA]"},
  {emoji:"🚀",label:"With OEM",value:"3",sub:"in review",grad:"from-[#81C784] to-[#4DB6AC]"},
  {emoji:"🎉",label:"Won back",value:"1",sub:"₹6.3L reimbursed",grad:"from-[#F48FB1] to-[#CE93D8]"},
]
export default function Dashboard({onNavigate}:{onNavigate:(v:ViewId)=>void}){
  return <div className="min-h-screen bg-[#FFFDF8] p-6 md:p-10 max-w-[1100px] mx-auto">
    <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}>
      <p className="text-sm text-[#B0A9A0] font-medium">Monday, September 21 · Kochi Muttom</p>
      <h1 className="text-[32px] md:text-[40px] font-bold tracking-tight text-[#2D2A26] mt-1">Good morning, Satoshi 👋</h1>
      <p className="text-[#8A8580] mt-1">Your warranty claims are looking great. 2 ready to ship!</p>
    </motion.div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
      {stats.map((s,i)=><motion.div key={s.label} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.08}} whileHover={{y:-4}} className={`rounded-[24px] p-5 text-white bg-gradient-to-br ${s.grad} shadow-[0_8px_24px_rgba(0,0,0,0.08)]`}>
        <div className="text-2xl">{s.emoji}</div>
        <div className="text-3xl font-bold mt-3">{s.value}</div>
        <div className="text-sm font-semibold opacity-90">{s.label}</div>
        <div className="text-xs opacity-75 mt-1">{s.sub}</div>
      </motion.div>)}
    </div>
    {/* progress */}
    <div className="mt-8 bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] flex items-center gap-6">
      <div className="relative w-24 h-24 shrink-0">
        <svg viewBox="0 0 100 100" className="w-24 h-24 -rotate-90"><circle cx="50" cy="50" r="42" fill="none" stroke="#FFF3E0" strokeWidth="10"/><motion.circle cx="50" cy="50" r="42" fill="none" stroke="#FF8A65" strokeWidth="10" strokeLinecap="round" initial={{pathLength:0}} animate={{pathLength:0.72}} transition={{duration:1.2}} style={{strokeDasharray:"264"}}/></svg>
        <span className="absolute inset-0 grid place-items-center font-bold text-lg text-[#2D2A26]">72%</span>
      </div>
      <div><p className="font-semibold text-[#2D2A26]">Recovery progress</p><p className="text-sm text-[#8A8580]">₹14.2L of ₹19.8L claimed this month — keep going!</p><div className="mt-3 flex gap-2"><button onClick={()=>onNavigate('capture')} className="bg-[#2D2A26] text-white rounded-full px-5 py-2 text-sm font-medium">+ New claim</button><button onClick={()=>onNavigate('audit')} className="bg-[#FFF3E0] rounded-full px-5 py-2 text-sm font-medium text-[#2D2A26]">View activity</button></div></div>
    </div>
    <h2 className="mt-8 font-semibold text-[#2D2A26]">Claims at a glance</h2>
    <div className="flex gap-4 overflow-x-auto pb-4 mt-3 snap-x snap-mandatory scrollbar-none">
      {CLAIM_QUEUE.slice(0,5).map((c,i)=>{
        const oem=OEM_BY_ID[c.oem]
        return <motion.div key={c.id} initial={{opacity:0,x:12}} animate={{opacity:1,x:0}} transition={{delay:i*0.07}} className="min-w-[280px] snap-start bg-white rounded-[20px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-[#FFF3E0]">
          <div className="flex justify-between items-start"><span className="text-xs font-bold tracking-wide bg-[#FFF3E0] rounded-full px-3 py-1">{c.id}</span><span className="text-xs capitalize px-2.5 py-1 rounded-full font-medium" style={{background:c.status==='ready'?'#E8F5E9':c.status==='needs_info'?'#FFF3E0':'#F3E8FF',color:c.status==='ready'?'#2E7D32':c.status==='needs_info'?'#EF6C00':'#6A1B9A'}}>{c.status.replace('_',' ')}</span></div>
          <p className="font-semibold text-[#2D2A26] mt-3 text-sm">{c.assetName}</p><p className="text-xs text-[#8A8580]">{c.depot} · {oem.name}</p>
          <p className="text-lg font-bold text-[#2D2A26] mt-3">₹{(c.amountInr/100000).toFixed(1)}L</p>
          <div className="flex gap-1 mt-2">{Array.from({length:5}).map((_,k)=><span key={k} className={`w-2 h-2 rounded-full ${k < Math.round(c.confidence*5)?'bg-[#81C784]':'bg-[#F0EBE3]'}`}/>)}<span className="text-xs text-[#8A8580] ml-1">{Math.round(c.confidence*100)}% confident</span></div>
        </motion.div>
      })}
    </div>
    {CLAIM_QUEUE.length===0&&<div className="text-center py-16 bg-white rounded-[24px] mt-4"><p className="text-5xl">🌤️</p><p className="font-semibold mt-3">All clear!</p><p className="text-sm text-[#8A8580]">No claims right now. Enjoy the calm.</p></div>}
    <div className="mt-6 flex gap-3">
      <button onClick={()=>onNavigate('capture')} className="flex-1 bg-gradient-to-br from-[#FF8A65] to-[#FF7043] text-white rounded-[20px] py-4 font-semibold shadow-[0_8px_20px_rgba(255,112,67,0.3)]">✨ Capture new claim</button>
      <button onClick={()=>onNavigate('pipeline')} className="flex-1 bg-white rounded-[20px] py-4 font-semibold border border-[#F0EBE3]">See magic →</button>
    </div>
  </div>
}
