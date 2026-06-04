import { IsNotEmpty } from 'class-validator';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';



@Entity('devices')
export class Device 
{
    @PrimaryGeneratedColumn()
    id!: number;

    @IsNotEmpty()
    @Column({ length: 45 })
    ip!: string;

    @CreateDateColumn({ name: 'last_seen', type: 'timestamp' })
    lastSeen!: Date;
}