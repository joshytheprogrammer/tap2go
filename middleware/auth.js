import { useUserStore } from "@/store/user";

export default defineNuxtRouteMiddleware((to, from) => {
  const userStore = useUserStore();

  const authenticated = userStore.isAuthenticated;

  if ((to.path === '/register' || to.path === '/login') && authenticated) {
    // If the user is authenticated and trying to access the login or register page,
    // redirect them to the home page or another authenticated page.
    return navigateTo('/');
  } else if (!authenticated && to.path !== '/login' && to.path !== '/register') {
    // If the user is not authenticated and trying to access a protected page,
    // redirect them to the login page.
    return navigateTo('/login');
  }
});
