export type HomeSettings = {
  histerezis: number;
  antifreeze: number;
  sampling_period: number;
  boiler_state: boolean;
  fire_alert_celsius: number;
};

export type UpdateHomeSettingsRequest = {
  histerezis?: number;
  antifreeze?: number;
  sampling_period?: number;
  fire_alert_celsius?: number;
};
