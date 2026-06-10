/** POST /users/register */
export type CreateUserRequest = {
  firstName: string;
  lastName: string;
  cnp: string;
  phone: string;
  password_plaintext: string;
  isAdmin: boolean;
};

/** GET /users/:id (admin) — snake_case din users.service */
export type AdminUserDetail = {
  first_name: string;
  last_name: string;
  phone: string;
  cnp: string;
  is_home: boolean;
  is_admin: boolean;
  is_suspended: boolean;
};

/** PATCH /users/:id */
export type UpdateUserRequest = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  isAdmin?: boolean;
  password_plaintext?: string;
};

/** PATCH /users/:id/suspend */
export type SuspendUserResponse = {
  message: string;
  is_suspended: boolean;
};
