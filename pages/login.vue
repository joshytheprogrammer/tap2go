<template>
  <section class="min-h-screen bg-blue-950 w-full py-8 px-4 text-white ">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <h2 class="my-8 text-center text-2xl font-semibold tracking-tight ">Login to your Account </h2>
    </div>

    <div class="mt-10 w-full sm:mx-auto sm:w-full sm:max-w-sm">
      <form class="space-y-6" @submit.prevent="login">
        <div>
          <label class="block text-sm font-medium leading-6 ">Email</label>
          <div class="mt-2 ">
            <input type="text" autocomplete="email" required class="block w-full rounded-md border-0 p-4 shadow-sm outline-none ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-800 text-black text-xs sm:text-sm sm:leading-6" v-model="user.email" placeholder="Enter your email address">
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium leading-6 ">Password</label>
          <div class="mt-2">
            <input type="password" autocomplete="current-password" required class="block w-full rounded-md border-0 p-4  outline-none shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-800 text-xs text-black sm:text-sm sm:leading-6" v-model="user.password" placeholder="Enter your password">
          </div>
        </div>
        <div>
          <button
            type="submit"
            class="flex w-full justify-center rounded-md bg-primary-800 px-3 py-4 md:py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary-700 dark:bg-primary-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-800"
            v-if="!loading"
          >
            Login
          </button>
          <button
            type="button"
            class="flex w-full justify-center items-center rounded-md bg-primary-800 px-3 py-4 md:py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary-700 dark:bg-primary-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-800 cursor-not-allowed " 
            disabled
            v-else
          >
            <svg
              class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.86 3 7.978l3-2.687z"
              ></path>
            </svg>
            Checking...
          </button>
        </div>
      </form>

      <p class="mt-8 text-center text-sm text-gray-500">
        Don't have an account?
        <NuxtLink to="/register" class="font-semibold leading-6 text-primary-600 hover:text-primary-700">Register</NuxtLink>
      </p>
    </div>
  </section>
</template>

<script setup>
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useUserStore } from "@/store/user";

const userStore = useUserStore();
const firebaseAuth = useFirebaseAuth();
const toast = useToast();

const loading = ref(false);
const validated = ref(false);

const user = reactive({
  email: '',
  password: ''
});

async function login() {
  if (!validatePassword(user.password)) {
    toast.add({ title: 'Invalid password', description: 'Password must be at least 8 characters.', color: 'red' });
    return;
  }

  loading.value = true;

  try {
    const credential = await signInWithEmailAndPassword(firebaseAuth, user.email, user.password);
    await userStore.setUser({ uid: credential.user.uid });
    toast.add({ title: 'Authentication successful' });
    navigateTo('/');
  } catch (error) {
    toast.add({ title: 'An error occurred', description: error.code, color: 'red' });
    console.error(error);
  } finally {
    loading.value = false;
  }
}

function validatePassword(password) {
  return password.length >= 8;
}

</script>