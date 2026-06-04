/** Element din GET /users/presence */
export type UserPresenceItem = {
  /** Folosit doar pentru rutare/API — nu afișa în UI */
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  is_admin: boolean;
  is_home: boolean;
  is_suspended: boolean;
  last_access_event: string;
};
