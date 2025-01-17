<template>
  <div class="bg-gray-100">
    <AppNavGeneral />
    <AppBottom />
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ['auth']
});
</script>