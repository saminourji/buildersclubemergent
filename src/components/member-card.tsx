import { Profile } from '@/types/database'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

const STAGE_LABELS: Record<string, { label: string; color: string }> = {
  no_idea: { label: 'Exploring', color: 'bg-zinc-100 text-zinc-600' },
  idea: { label: 'Ideating', color: 'bg-blue-50 text-blue-700' },
  prototype: { label: 'Building', color: 'bg-amber-50 text-amber-700' },
  launched: { label: 'Launched', color: 'bg-green-50 text-green-700' },
}

export function MemberCard({ member, isMe }: { member: Profile; isMe?: boolean }) {
  const initials = (member.full_name ?? member.email)
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const stage = member.build_stage ? STAGE_LABELS[member.build_stage] : null

  return (
    <div className="border border-zinc-100 rounded-lg p-4 space-y-3 hover:border-zinc-200 transition-colors">
      <div className="flex items-start gap-3">
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarImage src={member.avatar_url ?? undefined} />
          <AvatarFallback className="bg-zinc-100 text-zinc-700 text-xs font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium truncate">
              {member.full_name ?? 'Anonymous'}
              {isMe && <span className="text-zinc-400 font-normal"> (you)</span>}
            </p>
          </div>
          <p className="text-xs text-zinc-400 truncate">
            {[member.class_year && `'${String(member.class_year).slice(2)}`, member.concentration]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
      </div>

      {member.interest_area && (
        <p className="text-xs text-zinc-500">{member.interest_area}</p>
      )}

      {member.project_name && (
        <div className="flex items-center gap-1.5">
          {member.project_url ? (
            <a
              href={member.project_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-zinc-900 hover:underline truncate"
            >
              {member.project_name} ↗
            </a>
          ) : (
            <p className="text-xs font-medium text-zinc-900 truncate">{member.project_name}</p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        {stage && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stage.color}`}>
            {stage.label}
          </span>
        )}
        <a
          href={`mailto:${member.email}`}
          className="text-xs text-zinc-400 hover:text-zinc-700 ml-auto"
        >
          Contact →
        </a>
      </div>
    </div>
  )
}
