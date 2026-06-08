export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: 'general' | 'socio' | 'patrocinio' | 'prensa' | 'otro';
  message: string;
  createdAt: string;
}
