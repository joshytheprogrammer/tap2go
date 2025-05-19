<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h1 class="text-2xl font-bold mb-6 text-center">Driver Login</h1>
      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label for="identifier" class="block text-sm font-medium text-gray-700">
            License Plate or Email
          </label>
          <UInput
            id="identifier"
            v-model="identifier"
            type="text"
            required
            placeholder="Enter your license plate or email"
            class="mt-1 block w-full"
          />
        </div>

        <div class="mb-6">
          <label for="password" class="block text-sm font-medium text-gray-700">
            Password
          </label>
          <UInput
            id="password"
            v-model="password"
            type="password"
            required
            placeholder="Enter your password"
            class="mt-1 block w-full"
          />
        </div>

        <UButton
          type="submit"
          label="Login"
          color="primary"
          block
          :loading="loading"
        />

        <div v-if="error" class="mt-4 text-red-500 text-sm text-center">
          {{ error }}
        </div>
      </form>

      <p class="mt-6 text-center text-sm text-gray-600">
        Don't have an account?
        <NuxtLink to="/driver/register" class="font-medium text-indigo-600 hover:text-indigo-500">
          Register here
        </NuxtLink>
      </p>

      <p class="mt-2 text-center text-sm text-gray-600">
        Are you a student?
        <NuxtLink to="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
          Login here
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from '#imports';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import {
  query,
  where,
  getDocs,
  collection,
  doc,
  getDoc,
} from 'firebase/firestore';


const auth = useFirebaseAuth();
const db = useFirestore();

const identifier = ref('');
const password = ref('');
const loading = ref(false);
const error = ref(null);

const router = useRouter();
const userStore = useUserStore();
const toast = useToast();

const isEmail = (input) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
};

const handleLogin = async () => {
  loading.value = true;
  error.value = null;
  let emailToLogin = identifier.value;

  try {
    // If identifier is not an email, assume it's a license plate and fetch the email
    if (!isEmail(identifier.value)) {
      const q = query(
        collection(db, 'drivers_users'),
        where('licensePlate', '==', identifier.value.toUpperCase())
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        error.value = 'Invalid license plate or email.';
        loading.value = false;
        return;
      }

      const driverDocData = querySnapshot.docs[0].data();
      emailToLogin = driverDocData.email;
    }

    const userCredential = await signInWithEmailAndPassword(
      auth,
      emailToLogin,
      password.value
    );
    const user = userCredential.user;

    if (user) {
      const driverUserDocRef = doc(db, 'drivers_users', user.uid);
      const driverProfileDocRef = doc(db, 'driversProfile', user.uid);

      const driverUserDocSnap = await getDoc(driverUserDocRef);
      const driverProfileDocSnap = await getDoc(driverProfileDocRef);

      if (driverUserDocSnap.exists() && driverProfileDocSnap.exists()) {
        const driverData = {
          uid: user.uid,
          email: user.email,
          ...driverUserDocSnap.data(),
          ...driverProfileDocSnap.data(),
          role: driverUserDocSnap.data().role || 'driver'
        };

        userStore.setUser(user.uid); // Set auth state (uid, isAuthenticated via cookie/store action)
        userStore.setUserData(driverData); // Set detailed user profile data

        toast.add({
          title: 'Login Successful',
          description: 'Redirecting to dashboard...',
          color: 'green'
        });

        router.push('/driver/dashboard');
      } else {
        error.value = 'Driver data not found. Please contact support.';
        await signOut(auth); 
      }
    } else {
      error.value = 'Login failed. Please check your credentials.';
    }
  } catch (err) {
    console.error('Login error:', err);

    if (
      err.code === 'auth/user-not-found' ||
      err.code === 'auth/wrong-password' ||
      err.code === 'auth/invalid-credential' ||
      err.code === 'auth/invalid-email'
    ) {
      error.value = 'Invalid license plate/email or password.';
    } else {
      error.value = 'An unexpected error occurred. Please try again.';
    }

    console.log(`Failed login attempt for: ${identifier.value}`);
  }

  loading.value = false;
};
</script>

<style scoped>
/* Add any specific styles for the login page here */
</style>
