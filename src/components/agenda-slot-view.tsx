import { AgendaSlot, SlotType } from '@/types/database'
import { Badge } from '@/components/ui/badge'

const TYPE_STYLES: Record<SlotType, { label: string; color: string }> = {
  announcement: { label: 'Announcement', color: 'bg-zinc-100 text-zinc-600' },
  speaker: { label: 'Guest Speaker', color: 'bg-purple-50 text-purple-700' },
  demo: { label: 'Demo', color: 'bg-blue-50 text-blue-700' },
}

export function AgendaSlotView({ slot }: { slot: AgendaSlot }) {
  const style = TYPE_STYLES[slot.slot_type]

  return (
    <div className="flex gap-3 py-3 border-b border-zinc-50 last:border-0">
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium h-fit shrink-0 ${style.color}`}>
        {style.label}
      </span>
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{slot.title}</p>
        {slot.presenter_name && (
          <p className="text-xs text-zinc-400">{slot.presenter_name}</p>
        )}
        {slot.description && (
          <p className="text-xs text-zinc-500">{slot.description}</p>
        )}
        {!slot.approved && (
          <Badge variant="secondary" className="text-xs mt-1">Pending approval</Badge>
        )}
      </div>
    </div>
  )
}
