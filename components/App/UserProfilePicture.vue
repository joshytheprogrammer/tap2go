<template>
  <div>
    <img
      :src="profilePictureUrl"
      alt="Profile Picture"
      :class="`${widthClass} ${heightClass} rounded-full`"
    />
  </div>
</template>

<script setup>
import { doc, getDoc } from 'firebase/firestore';
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

// State variables for the profile picture
const profilePictureUrl = ref(null);

// Fetch the profile picture URL from Firestore
const fetchProfilePicture = async () => {
  try {
    const docRef = doc(db, 'userProfile', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      profilePictureUrl.value = docSnap.data().profilePicture || 'https://randomuser.me/api/portraits/men/1.jpg';
    } else {
      console.error('No such document!');
    }
  } catch (error) {
    console.error('Error fetching profile picture:', error);
  }
};

// Compute dynamic width and height classes based on props
const widthClass = `w-${props.width}`;
const heightClass = `h-${props.height}`;

onMounted(() => {
  fetchProfilePicture();
});
</script>
