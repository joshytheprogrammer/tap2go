<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h1 class="text-2xl font-bold mb-6 text-center">Login</h1>

      <UTabs :items="tabItems" v-model="selectedTab" />

      <div class="mt-6">
        <div v-if="selectedTab === 0"> <!-- Student Login -->
          <form @submit.prevent="handleStudentLogin">
            <div class="mb-4">
              <label for="student-email" class="block text-sm font-medium text-gray-700">Email</label>
              <UInput
                id="student-email"
                v-model="studentEmail"
                type="email"
                required
                placeholder="Enter your email"
                class="mt-1 block w-full"
              />
            </div>
            <div class="mb-6">
              <label for="student-password" class="block text-sm font-medium text-gray-700">Password</label>
              <UInput
                id="student-password"
                v-model="studentPassword"
                type="password"
                required
                placeholder="Enter your password"
                class="mt-1 block w-full"
              />
            </div>
            <UButton type="submit" label="Login as Student" color="primary" block :loading="studentLoading" />
            <div v-if="studentError" class="mt-4 text-red-500 text-sm text-center">
              {{ studentError }}
            </div>
          </form>
          <p class="mt-6 text-center text-sm text-gray-600">
            Don't have a student account? 
            <NuxtLink to="/register" class="font-medium text-indigo-600 hover:text-indigo-500">Register here</NuxtLink>
          </p>
        </div>

        <div v-if="selectedTab === 1"> <!-- Driver Login -->
          <form @submit.prevent="handleDriverLogin">
            <div class="mb-4">
              <label for="driver-identifier" class="block text-sm font-medium text-gray-700">License Plate or Email</label>
              <UInput
                id="driver-identifier"
                v-model="driverIdentifier"
                type="text"
                required
                placeholder="License plate or email"
                class="mt-1 block w-full"
              />
            </div>
            <div class="mb-6">
              <label for="driver-password" class="block text-sm font-medium text-gray-700">Password</label>
              <UInput
                id="driver-password"
                v-model="driverPassword"
                type="password"
                required
                placeholder="Enter your password"
                class="mt-1 block w-full"
              />
            </div>
            <UButton type="submit" label="Login as Driver" color="primary" block :loading="driverLoading" />
            <div v-if="driverError" class="mt-4 text-red-500 text-sm text-center">
              {{ driverError }}
            </div>
          </form>
          <p class="mt-6 text-center text-sm text-gray-600">
            Don't have a driver account? 
            <NuxtLink to="/driver/register" class="font-medium text-indigo-600 hover:text-indigo-500">Register here</NuxtLink>
          </p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { query, where, getDocs, collection, doc, getDoc } from 'firebase/firestore';


const auth = useFirebaseAuth();
const db = useFirestore();

const router = useRouter();
const userStore = useUserStore();
const toast = useToast();

const selectedTab = ref(0); // 0 for Student, 1 for Driver
const tabItems = [
  { label: 'Student' },
  { label: 'Driver' }
];

// Student login refs
const studentEmail = ref('');
const studentPassword = ref('');
const studentLoading = ref(false);
const studentError = ref(null);

// Driver login refs
const driverIdentifier = ref('');
const driverPassword = ref('');
const driverLoading = ref(false);
const driverError = ref(null);

const isEmail = (input) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);

const handleStudentLogin = async () => {
  studentLoading.value = true;
  studentError.value = null;
  try {
    const userCredential = await signInWithEmailAndPassword(auth, studentEmail.value, studentPassword.value);
    const user = userCredential.user;
    if (user) {
      // Fetch student-specific data (users and userProfile collections)
      const userDocRef = doc(db, 'users', user.uid);
      const userProfileRef = doc(db, 'userProfile', user.uid); // Assuming 'userProfile' for students
      const [userDocSnap, userProfileSnap] = await Promise.all([getDoc(userDocRef), getDoc(userProfileRef)]);

      if (userDocSnap.exists()) { // Student must exist in 'users' collection
        const userData = {
          uid: user.uid,
          email: user.email, // Firebase auth email
          ...userDocSnap.data(), // Contains role, matricNumber etc.
          ...(userProfileSnap.exists() ? userProfileSnap.data() : {}), // Contains other profile details
          role: userDocSnap.data().role || 'student' // Default role if not present
        };
        userStore.setUser(user.uid); // Set auth state (uid, isAuthenticated via cookie/store action)
        userStore.setUserData(userData); // Set detailed user profile data
        toast.add({ title: 'Login Successful', description: 'Welcome back!', color: 'green' });
        router.push('/'); // Redirect to student dashboard
      } else {
        studentError.value = 'Student account data not found. Please complete registration or contact support.';
        await auth.signOut(); // Sign out if app-specific DB record is missing
      }
    } else {
      studentError.value = 'Login failed. Please check your credentials.';
    }
  } catch (err) {
    console.error('Student Login error:', err);
    if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
      studentError.value = 'Invalid email or password.';
    } else {
      studentError.value = 'An unexpected error occurred. Please try again.';
    }
  }
  studentLoading.value = false;
};

const handleDriverLogin = async () => {
  driverLoading.value = true;
  driverError.value = null;
  let emailToLogin = driverIdentifier.value;

  try {
    if (!isEmail(driverIdentifier.value)) {
      const q = query(collection(db, 'drivers_users'), where('licensePlate', '==', driverIdentifier.value.toUpperCase()));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        driverError.value = 'Invalid license plate. If you meant to use email, please enter a valid email address.';
        driverLoading.value = false;
        return;
      }
      const driverUserRecord = querySnapshot.docs[0].data();
      if (!driverUserRecord.email) {
          driverError.value = 'Email not found for the provided license plate. Please contact support.';
          driverLoading.value = false;
          return;
      }
      emailToLogin = driverUserRecord.email;
    }

    const userCredential = await signInWithEmailAndPassword(auth, emailToLogin, driverPassword.value);
    const user = userCredential.user;

    if (user) {
      // Fetch driver-specific data (drivers_users and driversProfile collections)
      const driverUserDocRef = doc(db, 'drivers_users', user.uid);
      const driverProfileDocRef = doc(db, 'driversProfile', user.uid); // Assuming 'driversProfile' for drivers
      const [driverUserDocSnap, driverProfileDocSnap] = await Promise.all([getDoc(driverUserDocRef), getDoc(driverProfileDocRef)]);

      if (driverUserDocSnap.exists()) { // Driver must exist in 'drivers_users'
        const driverData = {
          uid: user.uid,
          email: user.email, // Firebase auth email
          ...driverUserDocSnap.data(), // Contains licensePlate, role etc.
          ...(driverProfileDocSnap.exists() ? driverProfileDocSnap.data() : {}), // Contains other profile details
          role: driverUserDocSnap.data().role || 'driver' // Default role if not present
        };
        userStore.setUser(user.uid); // Set auth state (uid, isAuthenticated via cookie/store action)
        userStore.setUserData(driverData); // Set detailed user profile data
        toast.add({ title: 'Login Successful', description: 'Welcome back, Driver!', color: 'green' });
        router.push('/driver/dashboard'); // Redirect to driver dashboard
      } else {
        driverError.value = 'Driver account data not found. Please complete registration or contact support.';
        await auth.signOut(); // Sign out the user as their app-specific data is missing
      }
    } else {
      // This case implies signInWithEmailAndPassword itself didn't throw for bad credentials but returned no user, which is unusual.
      driverError.value = 'Login failed. Please check your credentials.';
    }
  } catch (err) {
    console.error('Driver Login error:', err);
    if (err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/invalid-email') {
      driverError.value = 'Invalid license plate/email or password.';
    } else {
      driverError.value = 'An unexpected error occurred during driver login. Please try again.';
    }
  }
  driverLoading.value = false;
};

// definePageMeta({
//   middleware: ['auth'] // Apply auth middleware to redirect if already logged in
// });

</script>

<style scoped>
/* Add any specific styles for the login page here */
</style>