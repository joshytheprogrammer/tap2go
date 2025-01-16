<template>
  <div class="">
    <main class="w-full md:max-w-md mx-auto">
      <NuxtPage  />
      <UNotifications />
    </main>
  </div>
</template>

<script setup>
import { useUserStore } from "@/store/user";

useHead({
  htmlAttrs: {
    lang: 'en'
  },
  link: [
    {
      rel: 'icon',
      type: 'image/png',
      href: '/favicon.ico'
    }
  ]
});

const userStore = useUserStore();

</script>