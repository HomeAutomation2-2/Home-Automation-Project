import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';


@Entity('access_events')
export class AccessEvent {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'user_id', type: "int", nullable: true })
    userId!: number | null;

    @Column({ length: 10 })
    direction!: 'in' | 'out';

    @CreateDateColumn({ name: 'occurred_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    occurredAt!: Date;
}