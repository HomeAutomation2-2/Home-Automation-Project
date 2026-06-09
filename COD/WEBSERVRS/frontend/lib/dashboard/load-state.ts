export type DataState<T> =
  | { status: "loading" }
  | { status: "ok"; data: T }
  | { status: "error"; message: string };

import { ApiError } from "@/lib/types/api";

export function settleState<T>(
  result: PromiseSettledResult<T>,
  fallbackMessage: string,
): DataState<T> {
  if (result.status === "fulfilled") {
    return { status: "ok", data: result.value };
  }
  const reason = result.reason;
  const message =
    reason instanceof ApiError
      ? reason.message
      : reason instanceof Error
        ? reason.message
        : fallbackMessage;
  return { status: "error", message };
}
