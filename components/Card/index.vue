<template>
  <div class="w-full min-h-screen p-4">
    <!-- Card Display -->
    <div v-if="cardSerialNumber" class="mt-6 flex justify-center">
      <div class="w-80 h-48 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-4 text-white shadow-lg flex justify-between items-end">
        <span class="text-lg font-semibold">{{ matricNumber }}</span>
        <img src="@/assets/card-chip.svg" alt="Card Chip" class="w-10" />
      </div>
    </div>

    <div v-else class="mt-6 flex flex-col items-center">
      <p class="text-gray-600">No card found</p>
      <button 
        @click="navigateTo('request-card')" 
        class="mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg text-lg font-semibold shadow-md hover:bg-blue-700 transition">
        Add Card
      </button>
    </div>

    <!-- Settings -->
    <div v-if="cardSerialNumber" class="mt-6">
      <h2 class="text-lg font-semibold text-gray-800">Settings</h2>
      <div class="bg-gray-100 p-4 mt-3 rounded-xl flex justify-between items-center shadow">
        <div class="flex items-center space-x-3">
          <div class="text-blue-600 text-2xl">
            <img src="@/assets/deactivate-card-icon.svg" alt="deactivate card icon" class="w-8" />
          </div>
          <p class="text-gray-700 text-sm">Deactivate Card</p>
        </div>
        <input type="checkbox" v-model="isCardDeactivated" class="toggle-checkbox hidden">
        <div @click="toggleSwitch" class="w-12 h-6 flex items-center rounded-full p-1 cursor-pointer"
          :class="{'bg-blue-500': isCardDeactivated, 'bg-gray-500': !isCardDeactivated}">
          <div class="w-5 h-5 bg-white rounded-full shadow-md transform transition-transform"
            :class="{'translate-x-5': isCardDeactivated, 'translate-x-0': !isCardDeactivated}">
          </div>
        </div>
      </div>
    </div>

    <!-- Save Button -->
    <div v-if="cardSerialNumber && !loading" class="mt-6 flex justify-center">
      <button 
        @click="saveCardStatus" 
        class="w-full max-w-xs bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold shadow-md hover:bg-blue-700 transition" >
        Save
      </button>
    </div>
  </div>
</template>

<script setup>
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useUserStore } from '@/store/user';

const db = useFirestore();
const userStore = useUserStore();
const toast = useToast();

const cardSerialNumber = ref(null);
const matricNumber = ref(null);
const isCardDeactivated = ref(false);
const cardStatus = ref('');

const loading = ref(true);

const toggleSwitch = () => {
  isCardDeactivated.value = !isCardDeactivated.value;
};


const saveCardStatus = async () => {
  if (!cardSerialNumber.value) return;
  loading.value = true;

  try {
    const cardDoc = doc(db, 'cards', cardSerialNumber.value.toString());
    await updateDoc(cardDoc, { status: isCardDeactivated.value ? 'inactive' : 'active' });
    toast.add({title: 'Card status updated successfully'});
  } catch (error) {
    console.error('Error updating card status:', error);
    toast.add({
      title: 'Failed to update card status',
      color: 'red',
    });
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  try {
    const userDoc = doc(db, 'users', userStore.getUser.uid);
    const userSnapshot = await getDoc(userDoc);

    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      cardSerialNumber.value = userData.cardSerialNumber || null;
      matricNumber.value = userData.matricNumber || null;

      if (cardSerialNumber.value) {
        const cardDoc = doc(db, 'cards', cardSerialNumber.value.toString());
        const cardSnapshot = await getDoc(cardDoc);

        if (cardSnapshot.exists()) {
          const cardData = cardSnapshot.data();
          cardStatus.value = cardData.status;
          isCardDeactivated.value = cardStatus.value === 'inactive';
        }
      }
    }
  } catch (error) {
    console.error('Error fetching card data:', error);
  } finally {
    loading.value = false;
  }
});
// const saveCardStatus = async () => {
//   if (!cardSerialNumber.value) return;

//   try {
//     // Query the cards collection to find the document with the matching serial number
//     const cardQuery = query(
//       collection(db, 'cards'),
//       where('serialNumber', '==', cardSerialNumber.value)
//     );

//     const querySnapshot = await getDocs(cardQuery);

//     if (!querySnapshot.empty) {
//       const cardDoc = querySnapshot.docs[0]; 
      
//       await updateDoc(cardDoc.ref, { status: isCardDeactivated.value ? 'inactive' : 'active' });

//       toast.add({title: 'Card status updated successfully'});
//     } else {
//       toast.add({
//         title: 'Card not found',
//         color: 'red',
//       });
//     }
//   } catch (error) {
//       console.error('Error updating card status:', error);
      
//       toast.add({
//         title: 'Failed to update card status',
//         color: 'red',
//       });
  // } finally {
  //     loading.value = false;
  // }
// };


// onMounted(async () => {
//   try {
//     const userDoc = doc(db, 'users', userStore.getUser.uid);
//     const userSnapshot = await getDoc(userDoc);

//     if (userSnapshot.exists()) {
//       const userData = userSnapshot.data();
//       cardSerialNumber.value = userData.cardSerialNumber || null;
//       matricNumber.value = userData.matricNumber || null;


//       if (cardSerialNumber.value) {
//         const cardQuery = query(
//           collection(db, 'cards'),
//           where('serialNumber', '==', cardSerialNumber.value)
//         );
        
//         const querySnapshot = await getDocs(cardQuery);
//         const cardDoc = querySnapshot.docs[0]; 
//         const cardSnapshot = await getDoc(cardDoc);

//         if (cardSnapshot.exists()) {
//           const cardData = cardSnapshot.data();
//           cardStatus.value = cardData.status;
//           isCardDeactivated.value = cardStatus.value === 'inactive';
//         }
//       }
//     }
//   } catch (error) {
//     console.error('Error fetching card data:', error);
//   } finally {
//       loading.value = false;
//   }
// });
</script>
