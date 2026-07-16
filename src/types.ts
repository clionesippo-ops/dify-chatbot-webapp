export type Role = 'user' | 'assistant';

export interface Message {
  id: string;
  role: Role;
  content: string;
}

export type BotId = 'chat' | 'kondate';

export interface BotOption {
  id: BotId;
  label: string;
}

export const BOTS: BotOption[] = [
  { id: 'chat', label: 'AIチャット' },
  { id: 'kondate', label: '献立相談' },
];
