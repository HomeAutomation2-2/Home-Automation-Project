import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';



@Entity('home_settings')
export class HomeSettings 
{
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'decimal', precision: 3, scale: 2 })
    hysteresis!: number;

    @Column({ name: 'antifreeze_temp', type: 'decimal', precision: 4, scale: 2 })
    antifreezeTemp!: number;

    @Column({ name: "sampling_period" })
    samplingPeriod!: number;

    @Column({ name: "boiler_state", default: false })
    boilerState!: boolean;

    @Column({ name: 'fire_alert_celsius', type: 'decimal', precision: 4, scale: 2, default: 45.00 })
    fireAlertCelsius!: number;
}