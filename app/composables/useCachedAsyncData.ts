import type { AsyncDataOptions } from '#app';

export function useCachedAsyncData<ResT>(
  key: MaybeRefOrGetter<string>,
  handler: () => Promise<ResT>,
  options?: AsyncDataOptions<ResT>
) {
  let shouldRevalidate = false;

  const result = useAsyncData(key, handler, {
    ...options,
    getCachedData(k, nuxtApp, ctx) {
      if (ctx.cause !== 'initial') {
        return undefined;
      }
      const cached = nuxtApp.payload.data[k] ?? nuxtApp.static.data[k];
      // Hydration already has SSR data — don't fire a second request.
      // Soft navigations reuse payload and refresh in the background.
      if (cached !== undefined && !nuxtApp.isHydrating) {
        shouldRevalidate = true;
      }
      return cached;
    }
  });

  onMounted(() => {
    if (shouldRevalidate) void result.refresh();
  });

  return result;
}
