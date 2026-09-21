import { useState } from "react"
import { motion } from "framer-motion"
import { CLAIM_FIELDS } from "../data/mock"

export default function Review({onContinue}:{onContinue:()=>void}){
  const [fields,setFields]=useState(CLAIM_FIELDS)
  const [confirmed,setConfirmed]=useState<Set<string>>(new Set())
  return <div className="min-h-screen bg-[#FFFDF8] p-6 md:p-10 max-w-[760px] mx-auto">
    <h1 className="text-[28px] font-bold text-[#2D2A26]">Review your draft</h1><p className="text-[#8A8580]">Tap any field to edit · dots = confidence</p>
    <div className="bg-white rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden mt-6 divide-y divide-[#FFF3E0]">
      {fields.map((f,i)=>{
        const ok=confirmed.has(f.id)
        return <motion.div key={f.id} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:i*0.03}} className={`flex items-center gap-4 p-4 ${f.confidence<0.7?"bg-[#FFF8E1]/60":""}`}>
          <div className="flex-1">
            <p className="text-xs font-bold tracking-widest text-[#B0A9A0]">{f.label.toUpperCase()} {f.oemRequired&&<span className="text-[#FF7043]">• required</span>}</p>
            <input value={f.value} onChange={e=>setFields(fs=>fs.map(x=>x.id===f.id?{...x,value:e.target.value}:x))} className="mt-1 w-full bg-transparent font-medium text-[#2D2A26] outline-none border-b border-transparent focus:border-[#E0D9D0] pb-1"/>
            {f.note&&<p className="text-xs text-[#8A8580] mt-1">💡 {f.note}</p>}
          </div>
          <div className="text-center shrink-0">
            <div className="flex gap-1 justify-center">{Array.from({length:5}).map((_,k)=><span key={k} className={`w-2 h-2 rounded-full ${k < Math.round(f.confidence*5)?(f.confidence>0.8?"bg-[#81C784]":f.confidence>0.6?"bg-[#FFB74D]":"bg-[#EF5350]"):"bg-[#F0EBE3]"}`}/> )}</div>
            <p className="text-[10px] text-[#B0A9A0] mt-1">{Math.round(f.confidence*100)}% · {f.source}</p>
          </div>
          <button onClick={()=>setConfirmed(s=>{const n=new Set(s);n.has(f.id)?n.delete(f.id):n.add(f.id);return n})} className={`w-8 h-8 rounded-full grid place-items-center shrink-0 border-2 ${ok?"bg-[#81C784] border-[#81C784] text-white":"border-[#F0EBE3] text-[#B0A9A0]"}`}>{ok?"✓":"○"}</button>
        </motion.div>
      })}
    </div>
    <button onClick={onContinue} className="w-full mt-6 bg-[#2D2A26] text-white rounded-[20px] py-4 font-semibold shadow-lg">Continue to OEM preview →</button>
  </div>
}
