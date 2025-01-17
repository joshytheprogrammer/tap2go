<template>
  <div>
    <AppNavGeneral />
    <AppComingSoon />
    <AppBottom />
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ['auth']
});
</script>