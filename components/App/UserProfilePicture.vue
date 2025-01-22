<template>
  <div>
    <img
      :src="userStore.getProfilePic"
      alt="Profile Picture"
      :class="`${widthClass} ${heightClass} rounded-full`"
    />
  </div>
</template>

<script setup>
import { doc, onSnapshot } from 'firebase/firestore';
import { useUserStore } from '@/store/user';

// Define props for dynamic width and height
const props = defineProps({
  width: {
    type: [String, Number],
    required: true,
  },
  height: {
    type: [String, Number],
    required: true,
  },
});

// Firestore setup
const db = useFirestore();
const userStore = useUserStore();
const uid = userStore.getUser.uid;

// Compute dynamic width and height classes based on props
const widthClass = `w-${props.width}`;
const heightClass = `h-${props.height}`;

// Fetch profile picture URL from Firestore using onSnapshot
const profileDocRef = doc(db, 'userProfile', uid);

const unsubscribe = onSnapshot(profileDocRef, (docSnap) => {
  if (docSnap.exists()) {
    const data = docSnap.data();
    userStore.setUserProfile(data.profilePicture || 'https://randomuser.me/api/portraits/men/1.jpg');
  } else {
    console.log('No such document!');
  }
}, (error) => {
  console.error('Error fetching profile picture:', error);
});

onUnmounted(() => {
  unsubscribe();
});
</script>
