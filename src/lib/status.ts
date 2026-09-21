import type { ClaimStatus, FieldSource } from '../types'
export const STATUS_BADGE: Record<ClaimStatus,{label:string;className:string}> = {
  draft: {label:'In review',className:'bg-[#FFF7ED] text-[#9A3412] border-[#FFEDD5]'},
  processing: {label:'In review',className:'bg-[#FFF7ED] text-[#9A3412] border-[#FFEDD5]'},
  needs_info: {label:'Needs info',className:'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]'},
  ready: {label:'Ready',className:'bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]'},
  submitted: {label:'Submitted',className:'bg-ink text-white border-ink'},
  reimbursed: {label:'Paid',className:'bg-[#065F46] text-white border-[#065F46]'},
  rejected: {label:'Rejected',className:'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]'},
}
// Backwards compat
export const STATUS_META: Record<ClaimStatus,{label:string;dot:string;text:string}> = {
  draft:{label:'IN_REVIEW',dot:'bg-[#09090B]',text:'text-[#09090B]'},
  processing:{label:'IN_REVIEW',dot:'bg-[#09090B]',text:'text-[#09090B]'},
  needs_info:{label:'RFI',dot:'bg-[#D97706]',text:'text-[#D97706]'},
  ready:{label:'IN_REVIEW',dot:'bg-[#09090B]',text:'text-[#09090B]'},
  submitted:{label:'SUBMITTED',dot:'bg-[#09090B]',text:'text-white'},
  reimbursed:{label:'PAID',dot:'bg-[#16A34A]',text:'text-[#16A34A]'},
  rejected:{label:'REJECTED',dot:'bg-[#DC2626]',text:'text-[#DC2626]'},
}
export const SOURCE_META: Record<FieldSource,{label:string}> = { voice:{label:'voice'}, photo:{label:'photo'}, metadata:{label:'metadata'}, inferred:{label:'inferred'} }
export const ACCENT_META: Record<string,{text:string;bar:string}> = {
  indigo:{text:'text-[#09090B]',bar:'bg-[#09090B]'},
  rose:{text:'text-[#DC2626]',bar:'bg-[#DC2626]'},
  amber:{text:'text-[#D97706]',bar:'bg-[#D97706]'},
  emerald:{text:'text-[#16A34A]',bar:'bg-[#16A34A]'},
  sky:{text:'text-[#09090B]',bar:'bg-[#09090B]'},
}
export const CONFIDENCE_FLOOR=0.75
export function confidenceTone(v:number){ if(v>=0.9) return 'ok'; if(v>=CONFIDENCE_FLOOR) return 'warn'; return 'danger' }
