import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"


@Entity("rooms")
export class Room 
{
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ length: 100 })
    name!: string
}