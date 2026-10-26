// https://nuxt.com/docs/api/configuration/nuxt-config
import { resolveAppUrl } from "./lib/appUrl";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  modules: ["@nuxt/ui", "@vueuse/nuxt", "oxc-nuxt"],
  css: ["~/assets/css/main.css", "~/assets/css/admin.css"],
  components: [{ path: "~/components", pathPrefix: false }],
  // Google Fonts already in app.head — skip @nuxt/fonts (avoids missing nuxt-fonts-global.css)
  ui: { fonts: false },
  // stale Vite/#app-manifest after module swaps
  experimental: { appManifest: false },
  devtools: { enabled: true },

  app: {
    head: {
      htmlAttrs: { lang: "ru" },
      title: "Правда или ложь",
      titleTemplate: "%s · Правда или ложь",
      meta: [
        {
          name: "description",
          content: "Игра «правда или ложь»: свайпай утверждения, собирай звёзды и открывай уровни.",
        },
        { name: "theme-color", content: "#0c9a72", media: "(prefers-color-scheme: light)" },
        { name: "theme-color", content: "#0a1014", media: "(prefers-color-scheme: dark)" },
        { name: "color-scheme", content: "light dark" },
        { name: "format-detection", content: "telephone=no" },
        { property: "og:type", content: "website" },
        { property: "og:locale", content: "ru_RU" },
        { property: "og:site_name", content: "Правда или ложь" },
      ],
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32.png" },
        { rel: "shortcut icon", href: "/favicon.ico" },
        { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Manrope:wght@500;600;700&display=swap",
        },
      ],
      script: [
        {
          innerHTML:
            "(function(){try{var t=localStorage.getItem('tf-theme');if(t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark'}else{document.documentElement.style.colorScheme='light'}}catch(e){}})()",
          tagPosition: "head",
        },
        ...(process.env.NODE_ENV === "production"
          ? [
              {
                key: "yandex-metrika",
                innerHTML: `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,"script","https://mc.yandex.ru/metrika/tag.js?id=113810417","ym");ym(113810417,"init",{ssr:true,webvisor:true,clickmap:true,ecommerce:"dataLayer",referrer:document.referrer,url:location.href,accurateTrackBounce:true,trackLinks:true});`,
                tagPosition: "bodyClose" as const,
              },
            ]
          : []),
      ],
      noscript:
        process.env.NODE_ENV === "production"
          ? [
              {
                key: "yandex-metrika-noscript",
                innerHTML:
                  '<div><img src="https://mc.yandex.ru/watch/113810417" style="position:absolute;left:-9999px;" alt="" /></div>',
                tagPosition: "bodyClose" as const,
              },
            ]
          : [],
    },
  },
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL || "",
    betterAuthSecret: process.env.BETTER_AUTH_SECRET || "",
    adminEmail: process.env.ADMIN_EMAIL || "",
    adminPassword: process.env.ADMIN_PASSWORD || "",
    public: {
      appUrl: resolveAppUrl(),
    },
  },
});
