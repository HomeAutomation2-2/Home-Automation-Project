import { User } from '../database/entities';

export type UserProfileResponse = {
  id: number;
  first_name: string;
  last_name: string;
  cnp: string;
  phone: string;
  is_admin: boolean;
  is_suspended: boolean;
  is_home: boolean;
  bt_code_epoch: number | null;
  created_at: Date;
};

export type UserPresenceResponse = {
  id: number;
  first_name: string;
  last_name: string;
  is_home: boolean;
  is_suspended: boolean;
  last_access_event: string;
};

export function presentUser(user: User): UserProfileResponse {
  return {
    id: user.id,
    first_name: user.firstName,
    last_name: user.lastName,
    cnp: user.cnp,
    phone: user.phone,
    is_admin: user.isAdmin,
    is_suspended: user.isSuspended,
    is_home: user.isHome,
    bt_code_epoch: user.btCodeEpoch,
    created_at: user.createdAt,
  };
}
