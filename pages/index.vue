<template>
  <div class="">
    <AppComingSoon />
    <AppBottom />
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ['auth']
});
</script>