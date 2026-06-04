export type DeviceBindingStatusDto = {
    bound: boolean;
    device_label: string | null;
    last_sync: string | null;
};

export type InitiateDeviceBindingDto = {
    pairing_token: string;
    expires_at: string;
};
