export type BuildStage = 'no_idea' | 'idea' | 'prototype' | 'launched'
export type SlotType = 'announcement' | 'speaker' | 'demo'
export type Audience = 'all' | 'verified' | 'unverified'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  class_year: number | null
  concentration: string | null
  interest_area: string[]
  custom_avatar_url: string | null
  build_stage: BuildStage | null
  project_name: string | null
  project_url: string | null
  resource_preferences: string[]
  checkin_count: number
  is_verified: boolean
  is_admin: boolean
  onboarding_complete: boolean
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  title: string
  description: string | null
  event_date: string
  qr_token: string
  checkin_open: boolean
  created_by: string | null
  created_at: string
}

export interface CheckIn {
  id: string
  member_id: string
  event_id: string
  checked_in_at: string
}

export interface AgendaSlot {
  id: string
  event_id: string
  slot_type: SlotType
  title: string
  description: string | null
  presenter_name: string | null
  presenter_id: string | null
  slot_order: number
  approved: boolean
  created_at: string
}

export interface EmailBlast {
  id: string
  subject: string
  body: string
  audience: Audience
  sent_by: string | null
  sent_at: string
  recipient_count: number
}
