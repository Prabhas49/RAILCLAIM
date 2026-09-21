import { useEffect,useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { PIPELINE_STAGES } from "../data/mock"

export default function Pipeline({onRunningChange,onContinue}:{onRunningChange:(v:boolean)=>void,onContinue:()=>void}){
  const [idx,setIdx]=useState(0)
  const [done,setDone]=useState(false)
  useEffect(()=>{
    onRunningChange(true)
    const t=setInterval(()=>setIdx(i=>{
      if(i>=PIPELINE_STAGES.length-1){clearInterval(t);setDone(true);onRunningChange(false);return i}
      return i+1
    }),700)
    return ()=>clearInterval(t)
  },[])
  return <div className="min-h-screen bg-[#FFFDF8] p-6 md:p-10 max-w-[700px] mx-auto text-center">
    <motion.h1 initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="text-[28px] font-bold text-[#2D2A26]">✨ Working some magic</motion.h1>
    <p className="text-[#8A8580]">Turning voice + photos into an OEM-ready claim</p>
    <div className="bg-white rounded-[24px] p-6 mt-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)] text-left">
      {PIPELINE_STAGES.map((s,i)=>{
        const state=i<idx?"done":i===idx && !done?"active":"pending"
        return <div key={s.id} className="flex gap-4 py-3">
          <div className={`w-9 h-9 rounded-full grid place-items-center shrink-0 font-bold text-sm ${state==="done"?"bg-[#E8F5E9] text-[#2E7D32]":state==="active"?"bg-[#FFF3E0] text-[#EF6C00]":"bg-[#F0EBE3] text-[#B0A9A0]"}`}>
            {state==="done"?"✓":state==="active"?<motion.span animate={{rotate:360}} transition={{repeat:Infinity,duration:1,ease:"linear"}}>◌</motion.span>:i+1}
          </div>
          <div className="flex-1"><p className={`font-semibold text-sm ${state==="pending"?"text-[#B0A9A0]":"text-[#2D2A26]"}`}>{s.label}</p><p className="text-xs text-[#8A8580]">{s.blurb}</p>
            {state==="active"&&<motion.div initial={{width:0}} animate={{width:"100%"}} transition={{duration:0.7}} className="h-1 bg-gradient-to-r from-[#FF8A65] to-[#A78BFA] rounded-full mt-2"/>}
          </div>
          {state==="done"&&<motion.span initial={{scale:0}} animate={{scale:1}} className="text-[#81C784]">✔</motion.span>}
        </div>
      })}
    </div>
    <AnimatePresence>
      {done&&<motion.div initial={{opacity:0,y:10,scale:0.96}} animate={{opacity:1,y:0,scale:1}} className="bg-gradient-to-br from-[#E8F5E9] to-[#E3F2FD] rounded-[24px] p-8 mt-6">
        <p className="text-4xl">🎉</p><p className="font-bold text-[#2D2A26] mt-2">All done! {PIPELINE_STAGES.length} steps complete</p><p className="text-sm text-[#8A8580]">Your draft is ready for a quick review</p>
        <motion.div className="absolute inset-0 pointer-events-none">{Array.from({length:12}).map((_,i)=><motion.span key={i} initial={{y:0,opacity:1}} animate={{y:-80,opacity:0}} transition={{delay:i*0.08,duration:0.8}} className="absolute text-xl" style={{left:`${10+i*7}%`}}>✨</motion.span>)}</motion.div>
        <button onClick={onContinue} className="mt-4 bg-[#2D2A26] text-white rounded-full px-8 py-3 font-semibold">Review draft →</button>
      </motion.div>}
    </AnimatePresence>
    {!done&&<p className="text-xs text-[#B0A9A0] mt-4">~ {PIPELINE_STAGES.length-idx} steps left · takes ~12s</p>}
  </div>
}
