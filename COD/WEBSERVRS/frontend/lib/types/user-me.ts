/** Răspuns GET /users/me — serializare camelCase din entitatea Nest User */
export type UserMe = {
  id: number;
  firstName: string;
  lastName: string;
  cnp: string;
  phone: string;
  isAdmin: boolean;
  isSuspended: boolean;
  isHome: boolean;
  btCodeEpoch: number | null;
  createdAt: string;
};
