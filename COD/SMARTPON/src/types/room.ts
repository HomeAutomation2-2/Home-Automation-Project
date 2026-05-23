export type Room = {
    id: number
    name: string
    is_heating: boolean
    offset_value: number
    current_temp: number
    temp_program_id: number|null 
}


export type RoomForTempDisplay = {
    id: number
    name: string
    is_heating: boolean
    offset_value: number
    current_temp: number
    target_temp: number
    next_temp: number
    next_temp_time: string
    program_name: string
    temp_program_id: number|null 
}