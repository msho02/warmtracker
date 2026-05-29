import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export const STATUS_LABELS: Record<string, string> = {
  not_started: 'Não iniciado',
  warming: 'Em aquecimento',
  paused: 'Pausado',
  completed: 'Concluído',
  problem: 'Problema encontrado',
  in_progress: 'Em andamento',
}

export const STATUS_COLORS: Record<string, string> = {
  not_started: 'bg-zinc-100 text-zinc-600 border-zinc-200',
  warming: 'bg-blue-50 text-blue-700 border-blue-200',
  paused: 'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  problem: 'bg-red-50 text-red-700 border-red-200',
  in_progress: 'bg-violet-50 text-violet-700 border-violet-200',
}

export const STATUS_DOT: Record<string, string> = {
  not_started: 'bg-zinc-400',
  warming: 'bg-blue-500',
  paused: 'bg-amber-500',
  completed: 'bg-emerald-500',
  problem: 'bg-red-500',
  in_progress: 'bg-violet-500',
}

export const PLATFORM_ICONS: Record<string, string> = {
  whatsapp: 'whatsapp',
  instagram: 'instagram',
  tiktok: 'tiktok',
  telegram: 'telegram',
  facebook: 'facebook',
  twitter: 'twitter',
  youtube: 'youtube',
  linkedin: 'linkedin',
  discord: 'discord',
  default: 'default',
}

export const PLATFORM_ICON_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  telegram: 'Telegram',
  facebook: 'Facebook',
  twitter: 'Twitter / X',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
  discord: 'Discord',
  default: 'Outros',
}
