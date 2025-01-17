<template>
  <div class="">
    <AppNavGeneral />
    
    <div class="bg-gray-100 mb-16">
      <HomeBalance />
      <HomeSummary />
      <HomeRecent />
    </div>
    
    <AppBottom />
  </div>
</template>

<script setup>

definePageMeta({
  middleware: ['auth']
});
</script>