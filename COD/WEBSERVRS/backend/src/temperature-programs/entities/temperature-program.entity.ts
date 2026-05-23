import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';



export interface TimeSlot {
    time: string;
    temp: number | 'off' | 'antifreeze';
}


export interface Period {
    days: number[];
    slots: TimeSlot[];
}


@Entity('temperature_programs')
export class TemperatureProgram 
{
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 100 })
    name!: string;

    @Column({ type: 'jsonb' })
    schedule!: Period[];
}