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
</script>