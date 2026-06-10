import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AuthSession } from "../../auth-sessions/entities/auth-session.entity";



/**
 * Columns `bt_code_epoch` and `bt_code_epoch` can be nullable for account creation purpose. When the admin creates
 * and account the BT code is not yet generated, but only when the user logs into the account.
 */
@Entity("users")
export class User 
{
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ name: "first_name", length: 100 })
    firstName!: string

    @Column({ name: "last_name", length: 100 })
    lastName!: string

    @Column({ unique: true, length: 13 })
    cnp!: string

    @Column({ unique: true, length: 20 })
    phone!: string

    @Column({ name: "password_hash", length: 255 })
    passwordHash!: string

    @Column({ name: "is_admin", default: false })
    isAdmin!: boolean

    @Column({ name: "is_suspended", default: false })
    isSuspended!: boolean

    @Column({ name: "is_home", default: false })
    isHome!: boolean

    @Column({ name: "is_child", default: false })
    isChild!: boolean

    @Column({ name: "allow_return_after_midnight", default: false })
    allowReturnAfterMidnight!: boolean

    @Column({ name: "bt_code_hash", length: 255, nullable: true })
    btCodeHash!: string

    @Column({ name: "bt_code_epoch", nullable: true })
    btCodeEpoch!: number

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date

    @OneToMany(() => AuthSession, (session) => session.user)
    sessions!: AuthSession[]
}