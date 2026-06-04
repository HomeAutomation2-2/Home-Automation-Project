/** Element din GET /users/presence */
export type UserPresenceItem = {
  id: number;
  first_name: string;
  last_name: string;
  is_home: boolean;
  is_suspended: boolean;
  last_access_event: string;
};
