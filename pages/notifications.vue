<template>
  <section class="w-full min-h-screen bg-white">
    <!-- Header -->
    <div class="flex justify-between items-center p-4 border-b border-gray-300">
      <button class="rounded-full p-2 bg-gray-200" @click="$router.go(-1)">
        <ChevronLeftIcon class="size-5" />
      </button>
      <h1 class="text-lg font-semibold">Notifications</h1>
      <span></span>
    </div>

    <!-- Notifications Section -->
    <div class="p-4 space-y-6">
      <div v-if="loading" class="text-center py-4 text-gray-500">
        Loading notifications...
      </div>
      <div v-else-if="error" class="text-center py-4 text-red-500">
        Failed to load notifications. Please try again later.
      </div>
      <div v-else>
        <!-- Today Section -->
        <div v-if="groupedNotifications.today.length">
          <h2 class="text-lg font-semibold text-gray-800 py-4">Today</h2>
          <div class="space-y-3">
            <div
              v-for="notification in groupedNotifications.today"
              :key="notification.id"
              class="flex justify-start items-center space-x-3 p-3 border rounded-lg shadow-sm"
            >
              <div class="text-blue-600 text-2xl" v-if="notification.type == 'financial'">💳</div>
              <div class="text-blue-600 text-2xl" v-if="notification.type == 'message'">📝</div>
              <div class="text-blue-600 text-2xl" v-if="notification.type == 'alert'">🔔</div>
              <p class="text-gray-700 text-sm">{{ notification.message }}</p>
            </div>
          </div>
        </div>

        <!-- This Week Section -->
        <div v-if="groupedNotifications.thisWeek.length">
          <h2 class="text-lg font-semibold text-gray-800 py-4">This Week</h2>
          <div class="space-y-3">
            <div
              v-for="notification in groupedNotifications.thisWeek"
              :key="notification.id"
              class="flex justify-start items-center space-x-3 p-3 border rounded-lg shadow-sm"
            >
              <div class="text-blue-600 text-2xl" v-if="notification.type == 'financial'">💳</div>
              <div class="text-blue-600 text-2xl" v-if="notification.type == 'message'">📝</div>
              <div class="text-blue-600 text-2xl" v-if="notification.type == 'alert'">🔔</div>
              <p class="text-gray-700 text-sm">{{ notification.message }}</p>
            </div>
          </div>
        </div>

        <!-- No Notifications -->
        <div v-if="!groupedNotifications.today.length && !groupedNotifications.thisWeek.length" class="text-center text-gray-500">
          No notifications yet.
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ChevronLeftIcon } from '@heroicons/vue/24/outline';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useUserStore } from '@/store/user';

// Firestore setup
const db = useFirestore();
const userStore = useUserStore();
const uid = userStore.getUser.uid;

// State variables
const notifications = ref([]);
const loading = ref(true);
const error = ref(false);

// Fetch notifications
const unsubscribe = onSnapshot(
  query(collection(db, 'notifications'), where('uid', '==', uid)),
  (snapshot) => {
    const fetchedNotifications = [];
    snapshot.forEach((doc) => {
      fetchedNotifications.push({ id: doc.id, ...doc.data() });
    });

    notifications.value = fetchedNotifications.sort(
      (a, b) => b.createdAt.toDate() - a.createdAt.toDate()
    );
    loading.value = false;
  },
  (err) => {
    console.error(err);
    error.value = true;
    loading.value = false;
  }
);

onUnmounted(() => {
  unsubscribe();
});

// Group notifications
const groupedNotifications = computed(() => {
  const today = [];
  const thisWeek = [];

  notifications.value.forEach((notification) => {
    const createdAt = notification.createdAt.toDate();
    const now = new Date();

    if (createdAt.toDateString() === now.toDateString()) {
      today.push(notification);
    } else if (createdAt > new Date(now.setDate(now.getDate() - 7))) {
      thisWeek.push(notification);
    }
  });

  return { today, thisWeek };
});
</script>
