<template>
  <div class="">
    <UModal v-model="isOpen">
      <div class="py-12 px-4">
        <div class="flex flex-col justify-center items-center text-center gap-4">
          <h1 class="text-4xl font-semibold text-blue-600">Confirm Logout</h1>
          <p class="text-gray-700">Are you sure you want to logout?</p>
          <div class="flex flex-col gap-4 w-full md:w-2/3 pt-8" >
            <button @click="logout()" class="w-full bg-blue-600 hover:bg-red-700 text-white py-3 rounded-lg text-lg font-semibold shadow-md transition">
              Logout
            </button>
            <button @click="cancel()" class="w-full bg-gray-400 hover:bg-gray-800 text-white py-3 rounded-lg text-lg font-semibold shadow-md transition">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </UModal>

    <button @click="isOpen = true" class="w-full flex justify-between items-center p-4 border-b border-gray-200 cursor-pointer rounded-lg text-gray-700 hover:text-white hover:bg-red-600">
      <p>Logout</p>
      <ChevronRightIcon class="size-5" />
    </button>

  </div>
</template>

<script setup>
import { ChevronRightIcon } from '@heroicons/vue/24/outline'
import {
 signOut
} from 'firebase/auth';
import { useUserStore } from "@/store/user";

const isOpen = ref(false);

const userStore = useUserStore();
const firebaseAuth = useFirebaseAuth();
const toast = useToast();

const logout = async () => {
  await signOut(firebaseAuth);
  toast.add({
    title: 'Signed out successfully',
    description: "We'll miss you",
  });

  await userStore.clearUser();
  navigateTo('/login');

  return;
};

const cancel = () => {
  isOpen.value = !isOpen.value;
};
</script>