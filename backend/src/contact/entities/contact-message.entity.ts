import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export type ContactSubject = 'general' | 'socio' | 'patrocinio' | 'prensa' | 'otro';

@Entity('contact_messages')
export class ContactMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 255 })
  email: string;

  @Column({ type: 'enum', enum: ['general', 'socio', 'patrocinio', 'prensa', 'otro'], default: 'general' })
  subject: ContactSubject;

  @Column({ type: 'text' })
  message: string;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress: string | null;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @Column({ name: 'replied_at', type: 'timestamp', nullable: true })
  repliedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
