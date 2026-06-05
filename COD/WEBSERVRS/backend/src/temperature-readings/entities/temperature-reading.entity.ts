import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Room } from '../../rooms/entities/room.entity';



@Entity('temperature_readings')
export class TemperatureReading 
{
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'loop_id', type: 'int', nullable: true })
    loopId!: number;

    @ManyToOne(() => Room, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'loop_id' })
    room!: Room;

    @Column({ type: 'decimal', precision: 4, scale: 2, transformer: {
        to: (value: number) => value,
        from: (value: string) => parseFloat(value)
    }})
    value!: number;

    @CreateDateColumn({ name: 'occured_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    occuredAt!: Date;
}