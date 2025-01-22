<template>
  <div class="min-h-screen bg-gray-100 ">
    <Settings />
    <AppBottom />
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ['auth']
});
import { ChevronLeftIcon, BellIcon, ChevronRightIcon } from '@heroicons/vue/24/outline';
const hasUnreadNotifications = ref(false);
</script>