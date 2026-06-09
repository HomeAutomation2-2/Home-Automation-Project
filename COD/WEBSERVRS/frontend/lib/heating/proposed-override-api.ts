/**
 * Heating override API — implemented in NestJS.
 * @see backend/src/heating-override/
 */
export const HEATING_OVERRIDE_ENDPOINTS = {
  status: "GET /heating/override",
  activate: "POST /heating/override",
  deactivate: "DELETE /heating/override",
} as const;

/** @deprecated use HEATING_OVERRIDE_ENDPOINTS */
export const PROPOSED_OVERRIDE_ENDPOINTS = HEATING_OVERRIDE_ENDPOINTS;
