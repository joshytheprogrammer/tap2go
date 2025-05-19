<template>
  <div class="min-h-screen bg-gray-100">
    <AppNavGeneral />
    
    <div class="">
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