import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";



@Entity('light_zones')
export class LightZone {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    room_id!: number;

    @Column({ length: 100 })
    name!: string;

    @Column({ default: false })
    is_on!: boolean;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    last_changed_at!: Date;
}