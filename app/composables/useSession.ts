import { createAuthClient } from "better-auth/vue";
import type { ProgressRow } from "../../lib/game/mergeProgress";

type AuthClient = ReturnType<typeof createAuthClient>;
export type AuthSession = NonNullable<Awaited<ReturnType<AuthClient["getSession"]>>["data"]>;

let authClient: AuthClient | null = null;

export function useAuthClient() {
  if (!authClient) {
    const config = useRuntimeConfig();
    authClient = createAuthClient({
      baseURL: import.meta.server ? String(config.public.appUrl) : undefined,
      basePath: "/api/auth",
    });
  }
  return authClient;
}

export function useSession() {
  const client = useAuthClient();
  const session = useState<AuthSession | null>("auth-session", () => null);
  const pending = useState("auth-session-pending", () => true);
  const loaded = useState("auth-session-loaded", () => false);

  async function refresh(opts?: { force?: boolean }) {
    if (loaded.value && !opts?.force) {
      pending.value = false;
      return;
    }
    const blockUi = !loaded.value;
    if (blockUi) {
      pending.value = true;
    }
    try {
      if (import.meta.server) {
        const requestFetch = useRequestFetch();
        const data = await requestFetch<AuthSession | null>("/api/auth/get-session");
        session.value = data ?? null;
      } else {
        const res = await client.getSession();
        session.value = res.data ?? null;
      }
      loaded.value = true;
    } catch (e) {
      console.error("session refresh failed", e);
      session.value = null;
      loaded.value = true;
    } finally {
      pending.value = false;
    }
  }

  function syncGuestProgress() {
    void (async () => {
      try {
        if (!session.value?.user) {
          await refresh({ force: true });
        }
        if (!session.value?.user) {
          return;
        }

        const guest = useGuestProgress();
        const local = await guest.list();
        if (!local.length) {
          return;
        }

        const res = await $fetch<{ progress: ProgressRow[] }>("/api/progress/sync", {
          method: "POST",
          body: { progress: local },
        });
        await guest.replaceAll(res.progress);
      } catch (e) {
        console.error("progress sync failed", e);
      }
    })();
  }

  return { client, session, pending, refresh, syncGuestProgress };
}
