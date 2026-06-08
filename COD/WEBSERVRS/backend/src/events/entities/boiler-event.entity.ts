import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';



@Entity('boiler_events')
export class BoilerEvent {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'new_state', type: "boolean" })
    newState!: boolean;

    @CreateDateColumn({ name: 'occurred_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    occurredAt!: Date;
}