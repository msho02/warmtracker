export type ChecklistItem = {
  id: string
  cardId: string
  text: string
  completed: boolean
  position: number
  createdAt: string
  updatedAt: string
}

export type KanbanCardData = {
  id: string
  columnId: string
  title: string
  description: string | null
  platform: string | null
  priority: string
  accountName: string | null
  username: string | null
  phoneOrIdentifier: string | null
  niche: string | null
  notes: string | null
  tags: string
  dueDate: string | null
  warmupStartDate: string | null
  warmupEndDate: string | null
  position: number
  createdAt: string
  updatedAt: string
  checklistItems: ChecklistItem[]
}

export type KanbanColumnData = {
  id: string
  boardId: string
  title: string
  position: number
  createdAt: string
  updatedAt: string
  cards: KanbanCardData[]
}

export type KanbanBoardData = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  columns: KanbanColumnData[]
}

export type Priority = 'low' | 'medium' | 'high' | 'critical'
export type Platform = 'instagram' | 'whatsapp' | 'telegram' | 'tiktok' | 'facebook' | 'other'

export const PRIORITIES: { value: Priority; label: string; color: string; bg: string }[] = [
  { value: 'low', label: 'Baixa', color: '#16a34a', bg: '#dcfce7' },
  { value: 'medium', label: 'Média', color: '#ca8a04', bg: '#fef9c3' },
  { value: 'high', label: 'Alta', color: '#ea580c', bg: '#ffedd5' },
  { value: 'critical', label: 'Crítica', color: '#dc2626', bg: '#fee2e2' },
]

export const PLATFORMS: { value: Platform; label: string; color: string; bg: string }[] = [
  { value: 'instagram', label: 'Instagram', color: '#9333ea', bg: '#f3e8ff' },
  { value: 'whatsapp', label: 'WhatsApp', color: '#16a34a', bg: '#dcfce7' },
  { value: 'telegram', label: 'Telegram', color: '#0284c7', bg: '#e0f2fe' },
  { value: 'tiktok', label: 'TikTok', color: '#18181b', bg: '#f4f4f5' },
  { value: 'facebook', label: 'Facebook', color: '#1d4ed8', bg: '#dbeafe' },
  { value: 'other', label: 'Outro', color: '#52525b', bg: '#f4f4f5' },
]

export const CHECKLIST_TEMPLATES: Record<string, string[]> = {
  instagram: [
    'Adicionar foto de perfil',
    'Adicionar nome natural',
    'Criar bio simples',
    'Seguir poucos perfis relacionados',
    'Curtir posts de forma leve',
    'Assistir stories',
    'Postar primeiro story',
    'Evitar ações repetitivas no primeiro dia',
  ],
  whatsapp: [
    'Adicionar foto de perfil',
    'Definir nome natural',
    'Criar recado/status',
    'Salvar alguns contatos',
    'Enviar mensagens leves',
    'Entrar em poucos grupos confiáveis',
    'Evitar volume alto de mensagens no início',
  ],
  telegram: [
    'Adicionar nome e foto',
    'Configurar username',
    'Entrar em poucos canais',
    'Interagir manualmente',
    'Evitar entrada em massa em grupos',
    'Observar comportamento da conta',
  ],
}

export const TAG_COLORS = [
  { bg: '#dbeafe', color: '#1d4ed8', label: 'Azul' },
  { bg: '#dcfce7', color: '#16a34a', label: 'Verde' },
  { bg: '#fee2e2', color: '#dc2626', label: 'Vermelho' },
  { bg: '#fef9c3', color: '#ca8a04', label: 'Amarelo' },
  { bg: '#f3e8ff', color: '#9333ea', label: 'Roxo' },
  { bg: '#ffedd5', color: '#ea580c', label: 'Laranja' },
  { bg: '#f4f4f5', color: '#52525b', label: 'Cinza' },
  { bg: '#fce7f3', color: '#be185d', label: 'Rosa' },
]

export type Tag = { label: string; bg: string; color: string }
