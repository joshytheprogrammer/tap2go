<template>
  <div class="min-h-screen bg-gray-100">
    <AppNavGeneral />
    
    <div class=" mb-16">
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