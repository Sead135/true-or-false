/** Public app URL from env, else localhost for local scripts/dev. */
export function resolveAppUrl() {
  return process.env.NUXT_PUBLIC_APP_URL || "http://localhost:3000"
}
