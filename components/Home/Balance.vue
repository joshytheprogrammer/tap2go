<template>
  <section class="flex justify-center w-full items-center text-center pt-12 pb-8">
    <div class="space-y-1.5">
      <p class="text-slate-500 text-sm">Available Balance</p>
      <h2 class="text-2xl font-bold">
        {{ 
          new Intl.NumberFormat('en-NG', {style: 'currency', currency: 'NGN'}).format(userStore.getBalance)
        }}
      </h2>
      <p>
        <NuxtLink class="text-base font-semibold  cursor-pointer text-primary-700 underline underline-offset-4" @click="toggleModal()">Fund Account</NuxtLink>
      </p>
    </div>
    <UModal v-model="isOpen">
      <AppMakePayment @close-modal="isOpen = false" />
    </UModal>
  </section>
</template>

<script setup>
import { doc, onSnapshot } from 'firebase/firestore'; // Import `doc` instead of `collection` and `query`
import { useUserStore } from "~/stores/user"; // Import the user store

const db = useFirestore(); // Firestore instance
const userStore = useUserStore(); // User store
const isOpen = ref(false); // Reactive state for the modal

// Toggle modal state
const toggleModal = () => {
  isOpen.value = !isOpen.value;
};

const userDocRef = doc(db, 'users', userStore.getUser); 

const unsubscribe = onSnapshot(userDocRef, (userSnapshot) => {
  if (userSnapshot.exists()) { 
    const userData = userSnapshot.data(); // Get user data
    userStore.setUserBalance(userData.balance); 
  } else {
    console.log('No such document!');
  }
});

onUnmounted(() => {
  unsubscribe();
});
</script>

<style lang="scss" scoped>

</style>