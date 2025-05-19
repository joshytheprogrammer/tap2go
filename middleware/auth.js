import { useUserStore } from "@/store/user";

export default defineNuxtRouteMiddleware((to, from) => {
  const userStore = useUserStore();

  const authenticated = userStore.isAuthenticated;
  const userRole = userStore.user?.role; // Assuming role is stored in user object

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
  else {
    if (authenticated) {
      if (userRole === 'driver' && (to.path === '/login' || to.path === '/register')) {
        // Authenticated driver trying to access student login/register
        return navigateTo('/driver/dashboard'); // Or driver home
      }
      if (userRole !== 'driver' && (to.path === '/login' || to.path === '/register')) {
        // Authenticated student trying to access student login/register
        return navigateTo('/');
      }
    } else {
      // Not authenticated, trying to access a protected student page
      if (to.path !== '/login' && to.path !== '/register' && !to.path.startsWith('/driver')) {
        return navigateTo('/login');
      }
    }
  }
});
