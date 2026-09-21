import { useState } from "react"
import { motion } from "framer-motion"
import { ACTIVE_CLAIM, OEM_BY_ID } from "../data/mock"

export default function OemOutput({onContinue}:{onContinue:()=>void}){
  const [done,setDone]=useState<string|null>(null)
  const oem=OEM_BY_ID[ACTIVE_CLAIM.oem]
  return <div className="min-h-screen bg-[#FFFDF8] p-6 md:p-10 max-w-[760px] mx-auto">
    <h1 className="text-[28px] font-bold text-[#2D2A26]">Ready to send 🚀</h1><p className="text-[#8A8580]">Preview for {oem.name} · {oem.portal}</p>
    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="bg-white rounded-[24px] shadow-[0_12px_40px_rgba(0,0,0,0.08)] p-8 mt-6 relative" style={{boxShadow:"0 12px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)"}}>
      <div className="absolute -bottom-2 left-4 right-4 h-4 bg-white rounded-b-[24px] shadow-sm -z-10 opacity-60"/><div className="absolute -bottom-4 left-8 right-8 h-4 bg-white rounded-b-[24px] -z-20 opacity-30"/>
      <p className="text-xs tracking-widest font-bold text-[#B0A9A0]">{oem.legalName.toUpperCase()}</p>
      <h2 className="font-bold text-[#2D2A26] mt-1">Warranty Claim · {ACTIVE_CLAIM.id}</h2><p className="text-sm text-[#8A8580]">{ACTIVE_CLAIM.assetName} · {ACTIVE_CLAIM.depot}</p>
      <div className="grid grid-cols-2 gap-3 mt-6 text-sm">
        <div className="bg-[#FFFBF0] rounded-[16px] p-3"><p className="text-xs text-[#B0A9A0]">Failure</p><p className="font-semibold text-[#2D2A26]">F042 · thermal_overload</p></div>
        <div className="bg-[#FFFBF0] rounded-[16px] p-3"><p className="text-xs text-[#B0A9A0]">Amount</p><p className="font-semibold text-[#2D2A26]">₹{(ACTIVE_CLAIM.amountInr).toLocaleString('en-IN')}</p></div>
        <div className="bg-[#FFFBF0] rounded-[16px] p-3"><p className="text-xs text-[#B0A9A0]">Serial</p><p className="font-semibold text-[#2D2A26]">MB5085-2274-K</p></div>
        <div className="bg-[#FFFBF0] rounded-[16px] p-3"><p className="text-xs text-[#B0A9A0]">Warranty until</p><p className="font-semibold text-[#2D2A26]">2027-03-14 ✅</p></div>
      </div>
      <div className="mt-6 h-px bg-[#FFF3E0]"/><p className="text-xs text-[#B0A9A0] mt-4">3 attachments included · Nameplate, HMI, Context</p>
    </motion.div>
    <div className="grid grid-cols-3 gap-3 mt-6">
      {[
        {id:"pdf",label:"Export PDF",emoji:"📄",grad:"from-[#FF8A65] to-[#FF7043]"},
        {id:"json",label:"Copy JSON",emoji:"⚙️",grad:"from-[#7EC8E3] to-[#81C784]"},
        {id:"oem",label:"Send to OEM",emoji:"📤",grad:"from-[#A78BFA] to-[#7EC8E3]"},
      ].map(b=><motion.button key={b.id} whileTap={{scale:0.96}} onClick={()=>setDone(b.id)} className={`rounded-[20px] p-4 text-white font-semibold bg-gradient-to-br ${b.grad} shadow-md`}>
        <span className="text-xl">{b.emoji}</span><p className="text-sm mt-1">{b.label}</p>
      </motion.button>)}
    </div>
    {done&&<motion.div initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}} className="bg-[#E8F5E9] rounded-[20px] p-4 mt-4 text-center"><p className="font-semibold text-[#2E7D32]">🎉 {done==="oem"?"Sent to "+oem.name+"!":done==="pdf"?"PDF downloaded!":"JSON copied!"} </p></motion.div>}
    <button onClick={onContinue} className="w-full mt-4 bg-white border border-[#F0EBE3] rounded-[20px] py-4 font-semibold text-[#2D2A26]">Back to dashboard</button>
  </div>
}
