import { useUserStore } from "~/stores/user";

export default defineNuxtRouteMiddleware((to, from) => {
  const userStore = useUserStore();

  const authenticated = userStore.isAuthenticated;
  const userRole = userStore.getRole; // Assuming role is stored in user object

  // Driver routes
  if (to.path.startsWith('/driver')) {
    if (!authenticated) {
      // Not authenticated, trying to access any driver page
      if (to.path !== '/driver/login' && to.path !== '/driver/register') {
        return navigateTo('/driver/login');
      }
    } else if (userRole !== 'driver') {
      // Authenticated but not a driver, trying to access any driver page
      // Redirect to student home or a generic access denied page
      return navigateTo('/');
    } else {
      // Authenticated driver
      if (to.path === '/driver/login' || to.path === '/driver/register') {
        // Authenticated driver trying to access driver login/register
        return navigateTo('/driver/dashboard'); // Or driver home
      }
    }
  }
  // Student/General routes
  else { // Path does not start with /driver
    if (authenticated) {
      if (userRole === 'driver') {
        // Authenticated driver trying to access any non-driver page.
        // Redirect them to their dashboard.
        return navigateTo('/driver/dashboard');
      } else { // Authenticated non-driver (e.g., student)
        if (to.path === '/login' || to.path === '/register') {
          // Authenticated student trying to access student login/register pages.
          return navigateTo('/'); // Redirect to student home
        }
        // Authenticated student accessing other general pages: allow.
      }
    } else { // Not authenticated
      // Not authenticated, trying to access a protected student page.
      // A protected student page is any page not /login, /register.
      // The check !to.path.startsWith('/driver') is implicit due to the outer else.
      if (to.path !== '/login' && to.path !== '/register') {
        return navigateTo('/login');
      }
      // If not authenticated and trying to access /login or /register: allow.
    }
  }
});
