import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type NotificationType = 'child_late_return' | 'temperature_critical';
export type NotificationSeverity = 'warning' | 'critical';

@Entity('notifications')
export class Notification
{
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 50 })
    type!: NotificationType;

    @Column({ length: 20, default: 'warning' })
    severity!: NotificationSeverity;

    @Column({ length: 200 })
    title!: string;

    @Column({ type: 'text' })
    message!: string;

    @Column({ name: 'related_user_id', type: 'int', nullable: true })
    relatedUserId!: number | null;

    @Column({ name: 'related_room_id', type: 'int', nullable: true })
    relatedRoomId!: number | null;

    @Column({ name: 'is_read', default: false })
    isRead!: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;
}
