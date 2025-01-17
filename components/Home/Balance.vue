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
      <AppMakePayment />
    </UModal>
  </section>
</template>

<script setup>
import { useUserStore } from "@/store/user";

const userStore = useUserStore();
const isOpen = ref(false);

const toggleModal = () => {
  isOpen.value = !isOpen.value;
};
</script>

<style lang="scss" scoped>

</style>