export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export type LoginRequest = {
  phone_number: string;
  password_plaintext: string;
};

export type LoginResponse = {
  token: string;
};
