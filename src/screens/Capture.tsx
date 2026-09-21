import { useState } from "react"
import { motion } from "framer-motion"

export default function Capture({onAnalyse}:{onAnalyse:()=>void}){
  const [rec,setRec]=useState(false)
  const [photos,setPhotos]=useState(0)
  const steps=[
    {n:1,title:"Tell us what happened",desc:"Tap to record · Tamil, Hindi…",color:"bg-[#FFF3E0]",emoji:"🎙️"},
    {n:2,title:"Snap the evidence",desc:`${photos}/3 photos · nameplate, HMI, context`,color:"bg-[#E8F5E9]",emoji:"📸"},
    {n:3,title:"We’ll do the rest",desc:"AI drafts your OEM claim",color:"bg-[#E3F2FD]",emoji:"✨"},
  ]
  return <div className="min-h-screen bg-[#FFFDF8] p-6 md:p-10 max-w-[900px] mx-auto">
    <h1 className="text-[28px] font-bold text-[#2D2A26]">Capture</h1><p className="text-[#8A8580]">3 friendly steps — takes about a minute</p>
    <div className="grid md:grid-cols-3 gap-4 mt-6">
      {steps.map(s=><motion.div key={s.n} whileHover={{y:-3}} className={`${s.color} rounded-[24px] p-6 border border-white shadow-[0_4px_20px_rgba(0,0,0,0.05)]`}>
        <div className="w-10 h-10 rounded-full bg-white grid place-items-center font-bold text-[#2D2A26] shadow-sm">{s.emoji}</div>
        <p className="text-xs font-bold tracking-widest text-[#B0A9A0] mt-4">STEP {s.n}</p>
        <p className="font-semibold text-[#2D2A26] mt-1">{s.title}</p><p className="text-sm text-[#8A8580] mt-1">{s.desc}</p>
      </motion.div>)}
    </div>
    <div className="bg-white rounded-[24px] p-8 mt-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] text-center">
      <p className="font-semibold text-[#2D2A26]">Voice note</p><p className="text-sm text-[#8A8580]">{rec?"Listening… speak naturally":"Tap the button and describe the fault"}</p>
      <motion.button onClick={()=>setRec(!rec)} animate={rec?{scale:[1,1.05,1]}:{}} transition={rec?{repeat:Infinity,duration:1}: {}} className={`mt-6 w-28 h-28 rounded-full grid place-items-center text-3xl mx-auto shadow-lg ${rec?"bg-[#FF7043] shadow-[0_0_40px_rgba(255,112,67,0.6)]":"bg-[#2D2A26]"}`}>
        <span>{rec?"⏹️":"🎙️"}</span>
      </motion.button>
      {rec&&<motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex justify-center gap-1 mt-4">{Array.from({length:12}).map((_,i)=><motion.div key={i} className="w-1 bg-[#FF8A65] rounded-full" animate={{height:[8, 24+Math.random()*16,8]}} transition={{repeat:Infinity,duration:0.6,delay:i*0.05}}/>)}</motion.div>}
      <p className="text-xs text-[#B0A9A0] mt-3">Rail-jargon tuned · Tamil → English + Japanese</p>
    </div>
    <div className="bg-white rounded-[24px] p-6 mt-4 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
      <p className="font-semibold text-[#2D2A26]">Photos</p>
      <div className="grid grid-cols-3 gap-3 mt-3">
        {[0,1,2].map(i=><motion.button key={i} whileTap={{scale:0.96}} onClick={()=>setPhotos(p=>Math.min(3,p+1))} className={`aspect-square rounded-[20px] border-2 border-dashed grid place-items-center ${i<photos?"bg-[#E8F5E9] border-[#81C784]":"bg-[#FFFBF0] border-[#F0EBE3]"} ${i===1&&photos>=1?"rotate-1":""} ${i===2&&photos>=2?"-rotate-1":""}`}>
          <span className="text-2xl">{i<photos?"✅":"📷"}</span>
        </motion.button>)}
      </div>
      <p className="text-xs text-[#8A8580] mt-2">Tip: angle the nameplate so the serial isn’t glaring ✨</p>
    </div>
    <motion.button whileTap={{scale:0.98}} onClick={onAnalyse} className="w-full mt-6 bg-gradient-to-br from-[#7EC8E3] to-[#A78BFA] text-white rounded-[20px] py-4 font-semibold text-lg shadow-[0_8px_20px_rgba(167,139,250,0.35)]">Analyse with AI ✨</motion.button>
  </div>
}
