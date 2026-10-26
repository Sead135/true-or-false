export function resolveAppUrl() {
  return process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000';
}
