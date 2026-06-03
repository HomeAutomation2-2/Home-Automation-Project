export type LogType = 'access' | 'lights' | 'boiler'

export type UnifiedLog = {
    id: number
    type: LogType
    message: string
    occurred_at: Date
}