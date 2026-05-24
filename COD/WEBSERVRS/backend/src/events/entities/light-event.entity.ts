import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';



@Entity('light_events')
export class LightEvent {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'zone_id', type: "int", nullable: true })
    zoneId!: number | null;

    @Column({ name: 'user_id', type: "int", nullable: true })
    userId!: number | null;

    @Column({ name: 'new_state', type: "boolean" })
    newState!: boolean;

    @CreateDateColumn({ name: 'occurred_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    occurredAt!: Date;
}