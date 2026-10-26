const YM_ID = 113810417;

declare global {
  interface Window {
    ym?: (...args: unknown[]) => void;
  }
}

export default defineNuxtPlugin(() => {
  if (import.meta.dev) {
    return;
  }

  const router = useRouter();
  let initial = true;
  router.afterEach((to) => {
    if (initial) {
      initial = false;
      return;
    }
    window.ym?.(YM_ID, "hit", to.fullPath);
  });
});
