type PageSeo = {
  title: string;
  description: string;
  path?: string;
  robots?: string;
  ogType?: "website" | "article";
};

export function usePageSeo(seo: MaybeRefOrGetter<PageSeo>) {
  const config = useRuntimeConfig();
  const site = computed(() => config.public.appUrl.replace(/\/$/, ""));
  const s = computed(() => toValue(seo));

  useSeoMeta({
    title: () => s.value.title,
    description: () => s.value.description,
    ogTitle: () => s.value.title,
    ogDescription: () => s.value.description,
    ogType: () => s.value.ogType || "website",
    ogUrl: () => (s.value.path ? `${site.value}${s.value.path}` : undefined),
    ogLocale: "ru_RU",
    ogSiteName: "Правда или ложь",
    twitterCard: "summary",
    twitterTitle: () => s.value.title,
    twitterDescription: () => s.value.description,
    robots: () => s.value.robots || "index, follow",
  });

  useHead(() => {
    if (!s.value.path) {
      return {};
    }
    return {
      link: [{ rel: "canonical", href: `${site.value}${s.value.path}` }],
    };
  });
}
