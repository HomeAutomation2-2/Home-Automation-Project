import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { TemperatureProgram } from '../../temperature-programs/entities/temperature-program.entity';

@Entity('heating_overrides')
export class HeatingOverride {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'program_id', type: 'int' })
    programId!: number;

    @ManyToOne(() => TemperatureProgram, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'program_id' })
    program!: TemperatureProgram;

    @Column({ name: 'duration_minutes', type: 'int', nullable: true })
    durationMinutes!: number | null;

    @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
    expiresAt!: Date | null;

    @Column({ name: 'is_active', type: 'boolean', default: true })
    isActive!: boolean;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt!: Date;
}
