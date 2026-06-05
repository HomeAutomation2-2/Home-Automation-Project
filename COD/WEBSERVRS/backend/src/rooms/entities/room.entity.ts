import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from "typeorm"
import { LightZone } from "../../light-zones/entities/light-zone.entity"
import { TemperatureProgram } from "../../temperature-programs/entities/temperature-program.entity"



@Entity("rooms")
export class Room 
{
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ length: 100 })
    name!: string

    @Column({ type: "boolean", default: false })
    is_heating!: boolean

    @Column({ type: "decimal", precision: 3, scale: 2, default: 0.0 })
    offset_value!: number

    @Column({ type: "decimal", precision: 4, scale: 2, default: 0.0 })
    current_temp!: number

    @Column({ type: "int", nullable: true })
    temp_program_id!: number|null

    @ManyToOne(() => TemperatureProgram)
    @JoinColumn({ name: "temp_program_id" })
    tempProgram!: TemperatureProgram

    @OneToMany(() => LightZone, (lightZone) => lightZone.room)
    lightZones!: LightZone[]
}