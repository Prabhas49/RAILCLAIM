import { useState } from "react"
import { motion } from "framer-motion"
import { AUDIT_EVENTS } from "../data/mock"

const dots:Record<string,string>={capture:"bg-[#FFB74D]",ai:"bg-[#A78BFA]",human:"bg-[#81C784]",system:"bg-[#7EC8E3]"}
export default function AuditTrail({onBack}:{onBack:()=>void}){
  const [filter,setFilter]=useState<string>("all")
  const list=filter==="all"?AUDIT_EVENTS:AUDIT_EVENTS.filter(e=>e.kind===filter)
  return <div className="min-h-screen bg-[#FFFDF8] p-6 md:p-10 max-w-[700px] mx-auto">
    <button onClick={onBack} className="text-sm bg-white border border-[#F0EBE3] rounded-full px-4 py-2">← Back</button>
    <h1 className="text-[28px] font-bold text-[#2D2A26] mt-4">Activity</h1><p className="text-[#8A8580]">Every step, traceable & tamper-evident</p>
    <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
      {["all","capture","ai","human","system"].map(k=><button key={k} onClick={()=>setFilter(k)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap capitalize border ${filter===k?"bg-[#2D2A26] text-white border-[#2D2A26]":"bg-white border-[#F0EBE3] text-[#8A8580]"}`}>{k}</button>)}
    </div>
    <div className="relative mt-6 pl-8 border-l-2 border-[#FFF3E0] space-y-4">
      {list.map((e,i)=><motion.div key={e.id} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*0.05}} className="bg-white rounded-[20px] p-4 shadow-[0_4px_16px_rgba(0,0,0,0.05)] relative">
        <span className={`absolute -left-[25px] top-5 w-3 h-3 rounded-full ${dots[e.kind]} ring-4 ring-[#FFFDF8]`}/>
        <div className="flex justify-between items-start"><p className="font-semibold text-sm text-[#2D2A26]">{e.action}</p><span className="text-[10px] font-mono bg-[#FFFBF0] px-2 py-1 rounded-full">{e.hash}</span></div>
        <p className="text-xs text-[#8A8580] mt-1">{e.detail}</p><p className="text-xs text-[#B0A9A0] mt-2">{e.at} · {e.actor} <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] capitalize text-white ${dots[e.kind]}`}>{e.kind}</span></p>
      </motion.div>)}
    </div>
  </div>
}
