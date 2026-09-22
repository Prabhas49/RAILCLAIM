import type { ClaimStatus, FieldSource } from '../types'
export const STATUS_BADGE: Record<ClaimStatus,{label:string;className:string}> = {
  draft: {label:'In review',className:'bg-white/10 text-white border-white/20'},
  processing: {label:'In review',className:'bg-white/10 text-white border-white/20'},
  needs_info: {label:'Needs info',className:'bg-white/10 text-white border-white/20'},
  ready: {label:'Ready',className:'bg-[#261d0d] text-[#FFFFFF] border-[#FFFFFF]/30'},
  submitted: {label:'Submitted',className:'bg-[#141414] text-white border-[#27272a]'},
  reimbursed: {label:'Paid',className:'bg-[#0C271E] text-[#06D6A0] border-[#06D6A0]/30'},
  rejected: {label:'Rejected',className:'bg-[#2B1218] text-[#FF4D6D] border-[#FF4D6D]/30'},
}
// Backwards compat
export const STATUS_META: Record<ClaimStatus,{label:string;dot:string;text:string}> = {
  draft:{label:'IN_REVIEW',dot:'bg-white',text:'text-white'},
  processing:{label:'IN_REVIEW',dot:'bg-white',text:'text-white'},
  needs_info:{label:'RFI',dot:'bg-white',text:'text-white'},
  ready:{label:'IN_REVIEW',dot:'bg-white',text:'text-[#FFFFFF]'},
  submitted:{label:'SUBMITTED',dot:'bg-white',text:'text-white'},
  reimbursed:{label:'PAID',dot:'bg-[#06D6A0]',text:'text-[#06D6A0]'},
  rejected:{label:'REJECTED',dot:'bg-[#FF4D6D]',text:'text-[#FF4D6D]'},
}
export const SOURCE_META: Record<FieldSource,{label:string}> = { voice:{label:'voice'}, photo:{label:'photo'}, metadata:{label:'metadata'}, inferred:{label:'inferred'} }
export const ACCENT_META: Record<string,{text:string;bar:string}> = {
  indigo:{text:'text-[#09090B]',bar:'bg-[#09090B]'},
  rose:{text:'text-[#DC2626]',bar:'bg-[#DC2626]'},
  white:{text:'text-[#FFFFFF]',bar:'bg-[#FFFFFF]'},
  emerald:{text:'text-[#16A34A]',bar:'bg-[#16A34A]'},
  sky:{text:'text-[#09090B]',bar:'bg-[#09090B]'},
}
export const CONFIDENCE_FLOOR=0.75
export function confidenceTone(v:number){ if(v>=0.9) return 'ok'; if(v>=CONFIDENCE_FLOOR) return 'warn'; return 'danger' }
