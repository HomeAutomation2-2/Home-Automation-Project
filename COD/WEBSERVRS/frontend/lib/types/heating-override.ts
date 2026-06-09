export type HeatingOverrideStatus = {
  active: boolean;
  program_id?: number;
  duration_minutes?: number | null;
  expires_at?: string | null;
};
