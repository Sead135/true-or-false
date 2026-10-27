import type { AsyncDataOptions } from "#app";

export function useCachedAsyncData<ResT>(
  key: MaybeRefOrGetter<string>,
  handler: () => Promise<ResT>,
  options?: AsyncDataOptions<ResT>,
) {
  let shouldRevalidate = false;

  const result = useAsyncData(key, handler, {
    ...options,
    getCachedData(k, nuxtApp, ctx) {
      if (ctx.cause !== "initial") {
        return undefined;
      }
      const cached = nuxtApp.payload.data[k] ?? nuxtApp.static.data[k];
      if (cached !== undefined && !nuxtApp.isHydrating) {
        shouldRevalidate = true;
      }
      return cached;
    },
  });

  onMounted(() => {
    if (shouldRevalidate) {
      void result.refresh();
      return;
    }
    if (result.data.value == null && !result.pending.value) {
      void result.refresh();
    }
  });

  return result;
}
