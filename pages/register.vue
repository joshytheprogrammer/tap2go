<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
      <h1 class="text-2xl font-bold mb-6 text-center">Register</h1>

      <UTabs :items="tabItems" v-model="selectedTab" />

      <div class="mt-6">
        <div v-if="selectedTab === 0"> <!-- Student Register -->
          <form @submit.prevent="handleStudentRegister">
            <div class="block py-2 gap-4">
              <div class="mb-4">
                <label for="student-name" class="block text-sm font-medium text-gray-700">Full Name</label>
                <UInput
                  id="student-name"
                  v-model="studentName"
                  type="text"
                  required
                  placeholder="Enter your full name"
                  class="mt-1 block w-full"
                />
              </div>
              <div class="mb-4">
                <label for="student-matric" class="block text-sm font-medium text-gray-700">Matric Number</label>
                <UInput
                  id="student-matric"
                  v-model="studentMatricNumber"
                  type="text"
                  required
                  placeholder="e.g., U20XX/XXXXXX"
                  class="mt-1 block w-full"
                />
              </div>
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
               <div class="mb-4">
                <label for="student-cardSerial" class="block text-sm font-medium text-gray-700">Card Serial Number</label>
                <UInput
                  id="student-cardSerial"
                  v-model="studentCardSerialNumber"
                  type="text"
                  required
                  placeholder="Enter card serial number"
                  class="mt-1 block w-full"
                />
              </div>
              <div class="mb-4">
                <label for="student-password" class="block text-sm font-medium text-gray-700">Password</label>
                <UInput
                  id="student-password"
                  v-model="studentPassword"
                  type="password"
                  required
                  placeholder="Create a password"
                  class="mt-1 block w-full"
                />
              </div>
              <div class="mb-4">
                <label for="student-confirmPassword" class="block text-sm font-medium text-gray-700">Confirm Password</label>
                <UInput
                  id="student-confirmPassword"
                  v-model="studentConfirmPassword"
                  type="password"
                  required
                  placeholder="Confirm your password"
                  class="mt-1 block w-full"
                />
              </div>
            </div>
            <UButton type="submit" label="Register as Student" color="primary" block class="mt-6" :loading="studentLoading" />
            <div v-if="studentError" class="mt-4 text-red-500 text-sm text-center">
              {{ studentError }}
            </div>
          </form>
          <p class="mt-6 text-center text-sm text-gray-600">
            Already have a student account? 
            <NuxtLink to="/login" class="font-medium text-indigo-600 hover:text-indigo-500">Login here</NuxtLink>
          </p>
        </div>

        <div v-if="selectedTab === 1"> <!-- Driver Register -->
          <form @submit.prevent="handleDriverRegister">
            <div class="py-2 block gap-4">
              <div class="mb-4">
                <label for="driver-name" class="block text-sm font-medium text-gray-700">Full Name</label>
                <UInput
                  id="driver-name"
                  v-model="driverName"
                  type="text"
                  required
                  placeholder="Enter your full name"
                  class="block w-full"
                />
              </div>
              <div class="mb-4">
                <label for="driver-licensePlate" class="block text-sm font-medium text-gray-700">License Plate</label>
                <UInput
                  id="driver-licensePlate"
                  v-model="driverLicensePlate"
                  type="text"
                  required
                  placeholder="e.g., ABC123XYZ"
                  class="mt-1 block w-full"
                />
              </div>
              <div class="mb-4">
                <label for="driver-email" class="block text-sm font-medium text-gray-700">Email</label>
                <UInput
                  id="driver-email"
                  v-model="driverEmail"
                  type="email"
                  required
                  placeholder="Enter your email"
                  class="mt-1 block w-full"
                />
              </div>
              <div class="mb-4">
                <label for="driver-phoneNumber" class="block text-sm font-medium text-gray-700">Phone Number</label>
                <UInput
                  id="driver-phoneNumber"
                  v-model="driverPhoneNumber"
                  type="tel"
                  required
                  placeholder="Enter your phone number"
                  class="mt-1 block w-full"
                />
              </div>
              <div class="mb-4">
                <label for="driver-password" class="block text-sm font-medium text-gray-700">Password</label>
                <UInput
                  id="driver-password"
                  v-model="driverPassword"
                  type="password"
                  required
                  placeholder="Create a password"
                  class="mt-1 block w-full"
                />
              </div>
              <div class="mb-4">
                <label for="driver-confirmPassword" class="block text-sm font-medium text-gray-700">Confirm Password</label>
                <UInput
                  id="driver-confirmPassword"
                  v-model="driverConfirmPassword"
                  type="password"
                  required
                  placeholder="Confirm your password"
                  class="mt-1 block w-full"
                />
              </div>
            </div>
            <UButton type="submit" label="Register as Driver" color="primary" block class="mt-6" :loading="driverLoading" />
            <div v-if="driverError" class="mt-4 text-red-500 text-sm text-center">
              {{ driverError }}
            </div>
          </form>
          <p class="mt-6 text-center text-sm text-gray-600">
            Already have a driver account? 
            <NuxtLink to="/driver/login" class="font-medium text-indigo-600 hover:text-indigo-500">Login here</NuxtLink>
          </p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
 // Not directly used but good practice
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';

const router = useRouter();
const toast = useToast();
const firebaseAuth = useFirebaseAuth(); // Initialize Firebase Auth

const selectedTab = ref(0); // 0 for Student, 1 for Driver
const tabItems = [
  { label: 'Student' },
  { label: 'Driver' }
];

// Student registration refs
const studentName = ref('');
const studentMatricNumber = ref('');
const studentEmail = ref('');
const studentCardSerialNumber = ref('');
const studentPassword = ref('');
const studentConfirmPassword = ref('');
const studentLoading = ref(false);
const studentError = ref(null);

// Driver registration refs
const driverName = ref('');
const driverLicensePlate = ref('');
const driverEmail = ref('');
const driverPhoneNumber = ref('');
const driverPassword = ref('');
const driverConfirmPassword = ref('');
const driverLoading = ref(false);
const driverError = ref(null);

// Validation function for student matric number (from your example)
function validateStudentMatric(matric) {
  const matricRegex = /^\d{2}[A-Za-z]{2}\d{6}$/; // e.g., 22CH032034
  const cleanedMatric = matric.replace(/\s+/g, ''); // Remove all spaces
  return matricRegex.test(cleanedMatric);
}

// Validation function for student email (from your example)
function validateStudentEmail(email) {
  return email.endsWith('cu.edu.ng');
}

const handleStudentRegister = async () => {
  studentLoading.value = true;
  studentError.value = null;

  if (studentPassword.value !== studentConfirmPassword.value) {
    studentError.value = 'Passwords do not match.';
    studentLoading.value = false;
    return;
  }

  if (!validateStudentMatric(studentMatricNumber.value)) {
    studentError.value = 'Invalid matric number. Expected format: e.g., 22CH032034. Please check your input.';
    // Consider updating the input placeholder to match this format.
    studentLoading.value = false;
    return;
  }

  if (!validateStudentEmail(studentEmail.value)) {
    studentError.value = 'Invalid email. Student email must be a valid CU email (e.g., example@stu.cu.edu.ng).';
    studentLoading.value = false;
    return;
  }

  try {
    // Step 1: Create user with Firebase Authentication
    const credential = await createUserWithEmailAndPassword(firebaseAuth, studentEmail.value, studentPassword.value);

    if (credential && credential.user) {
      // Step 2: Call your custom backend to store additional student details
      // Note: Password is not sent here; it's managed by Firebase.
      // Your backend should be adapted to receive 'uid' instead of 'password'.
      await $fetch('/api/auth/register', {
        method: 'POST',
        body: {
          uid: credential.user.uid, // Firebase User ID
          name: studentName.value,
          matricNumber: studentMatricNumber.value.toUpperCase(),
          email: studentEmail.value, // Email is part of Firebase auth but can be stored for convenience
          cardSerialNumber: studentCardSerialNumber.value,
        },
      });

      // Step 3: Send email verification
      await sendEmailVerification(credential.user);

      toast.add({ title: 'Registration Successful!', description: 'A verification email has been sent. Please check your inbox and verify your email before logging in.', color: 'green', timeout: 7000 });
      router.push('/login'); // Redirect to login page
    } else {
      // This case should ideally not be reached if createUserWithEmailAndPassword throws an error for failures
      studentError.value = 'Student registration failed during user creation.';
    }

  } catch (err) {
    console.error('Student Registration error:', err);
    if (err.code) { // Firebase specific errors
      switch (err.code) {
        case 'auth/email-already-in-use':
          studentError.value = 'This email address is already registered.';
          break;
        case 'auth/weak-password':
          studentError.value = 'The password is too weak. It should be at least 6 characters long.';
          break;
        default:
          studentError.value = err.message || 'An error occurred during registration.';
      }
    } else if (err.data && err.data.message) { // Error from your $fetch call
      studentError.value = `Backend Error: ${err.data.message}`;
    } else if (err.message) {
      studentError.value = err.message;
    } else {
      studentError.value = 'An unexpected error occurred. Please try again.';
    }
  }
  studentLoading.value = false;
};

const handleDriverRegister = async () => {
  driverLoading.value = true;
  driverError.value = null;

  if (driverPassword.value !== driverConfirmPassword.value) {
    driverError.value = 'Passwords do not match.';
    driverLoading.value = false;
    return;
  }

  try {
    const response = await $fetch('/api/auth/driver/register', { // New driver registration endpoint
      method: 'POST',
      body: {
        name: driverName.value,
        licensePlate: driverLicensePlate.value.toUpperCase(),
        email: driverEmail.value,
        phoneNumber: driverPhoneNumber.value,
        password: driverPassword.value,
      },
    });

    if (response.statusCode === 201) {
      toast.add({ title: 'Driver Registration Successful', description: 'Please login to continue.', color: 'green' });
      // Redirect to the main login page, then user can select driver tab, or directly to driver login if preferred
      router.push('/login'); 
      // Alternatively, to go directly to the driver-specific login page (if you keep it separate):
      // router.push('/driver/login'); 
    } else {
      driverError.value = response.body.message || 'Driver registration failed. Please try again.';
    }
  } catch (err) {
    console.error('Driver Registration error:', err);
    if (err.data && err.data.body && err.data.body.message) {
        driverError.value = err.data.body.message;
    } else if (err.message) {
        driverError.value = err.message;
    } else {
        driverError.value = 'An unexpected error occurred. Please try again.';
    }
  }
  driverLoading.value = false;
};

</script>

<style scoped>
/* Add any specific styles for the registration page here */
</style>