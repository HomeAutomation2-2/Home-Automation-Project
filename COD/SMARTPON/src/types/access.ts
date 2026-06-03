export type DoorAction = "lock" | "unlock"
export type RequestStatus = "success" | "fail"
export type DoorStatus = "locked" | "unlocked"
export type ErrorReason = "invalid_code" | "wrong_action" | null


export interface AccessRequest {
    code: string
    action: DoorAction
}


export interface AccessResponse {
    request_status: RequestStatus
    door_status: DoorStatus
    error_reason: ErrorReason
}