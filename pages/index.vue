<template>
  <div class="">
    <AppNavGeneral />
    <!-- <AppComingSoon /> -->
     <div class="bg-gray-100">
      <HomeBalance />
     </div>
    <AppBottom />
  </div>
</template>

<script setup>

definePageMeta({
  middleware: ['auth']
});
</script>