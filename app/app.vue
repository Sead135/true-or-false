<template>
  <UApp>
    <div :class="isAdminRoute ? undefined : 'page-shell'">
      <NuxtRouteAnnouncer />
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
      <ClientOnly>
        <AchievementToast />
      </ClientOnly>
    </div>
  </UApp>
</template>

<script setup lang="ts">
const route = useRoute();
const isAdminRoute = computed(() => route.path.startsWith("/admin"));

const config = useRuntimeConfig();
const site = config.public.appUrl.replace(/\/$/, "");

const ldJson = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Правда или ложь",
  description: "Игра «правда или ложь»: свайпай утверждения, собирай звёзды и открывай уровни.",
  url: site,
  applicationCategory: "GameApplication",
  operatingSystem: "Web",
  inLanguage: "ru",
  offers: { "@type": "Offer", price: "0", priceCurrency: "RUB" },
});

useHead({
  script: [{ key: "ld-webapp", type: "application/ld+json", innerHTML: ldJson }],
});

const { initTheme } = useTheme();
onMounted(() => initTheme());
</script>
