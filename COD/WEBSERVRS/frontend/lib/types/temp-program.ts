import type { Period } from "./period";

export type TempProgram = {
  id: number;
  name: string;
  schedule: Period[];
};
