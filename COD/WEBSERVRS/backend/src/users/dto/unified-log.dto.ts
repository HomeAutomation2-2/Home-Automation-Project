import { LogType } from "./log-type.dto"



export class UnifiedLog 
{
    id!: number
    type!: LogType
    message!: string
    occurred_at!: Date
}