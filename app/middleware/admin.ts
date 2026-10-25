import { isElevated } from "../../lib/admin/roles";

export default defineNuxtRouteMiddleware(async () => {
  const { session, refresh } = useSession();
  await refresh();
  if (!session.value?.user || !isElevated(session.value.user.role)) {
    return navigateTo("/");
  }
});
