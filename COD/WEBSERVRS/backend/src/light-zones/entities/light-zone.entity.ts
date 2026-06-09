import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";



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

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    last_changed_at!: Date;
}