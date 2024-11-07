<template>
  <section class="login-section">
    <div class="container-fluid h-custom wrapper">
      <div
        class="row d-flex justify-content-center align-items-center h-100 row-wrapper"
      >
        <!-- Optional Image -->
        <div
          class="col-md-9 col-lg-7 col-xl-4 d-flex flex-column align-items-center"
        >
          <img
            src="../assets/images/chemical-8748832_640.webp"
            class="img-fluid"
          />
        </div>

        <!-- Login and Register Forms -->
        <div
          class="col-md-8 col-lg-7 col-xl-4 offset-xl-1 d-flex flex-column align-items-center login-register"
        >
          <!-- Tabs for Login and Register -->
          <ul class="nav nav-pills my-4 d-flex" id="pills-tab" role="tablist">
            <li class="nav-item flex-fill" role="presentation">
              <a
                class="nav-link active text-center"
                id="pills-login-tab"
                data-bs-toggle="pill"
                href="#pills-login"
                role="tab"
                aria-controls="pills-login"
                aria-selected="true"
                >Login</a
              >
            </li>
            <li class="nav-item flex-fill" role="presentation">
              <a
                class="nav-link text-center"
                id="pills-register-tab"
                data-bs-toggle="pill"
                href="#pills-register"
                role="tab"
                aria-controls="pills-register"
                aria-selected="false"
                >Register</a
              >
            </li>
          </ul>
          <!-- End of Tabs -->

          <!-- Tab Content -->
          <div class="tab-content" id="pills-tabContent">
            <!-- Login Form -->
            <div
              class="tab-pane fade show active"
              id="pills-login"
              role="tabpanel"
              aria-labelledby="pills-login-tab"
            >
              <form @submit.prevent="handleSignIn">
                <!-- Email input -->
                <div class="mb-4">
                  <label for="loginEmail" class="form-label">Email</label>
                  <input
                    v-model="loginEmail"
                    type="email"
                    id="loginEmail"
                    class="form-control"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <!-- Password input -->
                <div class="mb-4">
                  <label for="loginPassword" class="form-label">Password</label>
                  <input
                    v-model="loginPassword"
                    type="password"
                    id="loginPassword"
                    class="form-control"
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <!-- Submit button -->
                <button
                  type="submit"
                  class="btn custom-btn btn-block mb-4 w-100"
                >
                  Sign in
                </button>

                <!-- Error Message -->
                <p v-if="loginError" class="error-message">{{ loginError }}</p>
              </form>
              <!-- OR Divider -->
              <!-- <div class="d-flex align-items-center mb-4">
                <hr class="flex-grow-1" />
                <span class="mx-4">OR</span>
                <hr class="flex-grow-1" />
              </div> -->

              <!-- Google Sign-In Button -->
              <!-- <div class="text-center mb-3">
                <button @click="signInWithGoogle" class="btn google-btn w-100">
                  <img
                    src="../assets/images/google.png"
                    alt="Google Logo"
                    class="google-logo"
                  />
                  Sign in with Google
                </button>
              </div> -->
            </div>

            <!-- End of Login Form -->

            <!-- Register Form -->
            <div
              class="tab-pane fade"
              id="pills-register"
              role="tabpanel"
              aria-labelledby="pills-register-tab"
            >
              <form @submit.prevent="handleSignUp">
                <!-- Email input -->
                <div class="mb-4">
                  <label for="registerEmail" class="form-label">Email</label>
                  <input
                    v-model="registerEmail"
                    type="email"
                    id="registerEmail"
                    class="form-control"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <!-- Password input -->
                <div class="mb-4">
                  <label for="registerPassword" class="form-label"
                    >Password</label
                  >
                  <input
                    v-model="registerPassword"
                    type="password"
                    id="registerPassword"
                    class="form-control"
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <!-- Repeat Password input -->
                <div class="mb-4">
                  <label for="registerRepeatPassword" class="form-label"
                    >Repeat password</label
                  >
                  <input
                    v-model="registerRepeatPassword"
                    type="password"
                    id="registerRepeatPassword"
                    class="form-control"
                    placeholder="Repeat your password"
                    required
                  />
                </div>

                <!-- Submit button -->
                <button
                  type="submit"
                  class="btn custom-btn btn-block mb-3 w-100"
                >
                  Sign up
                </button>

                <!-- Error Message -->
                <p v-if="signupError" class="error-message">
                  {{ signupError }}
                </p>
              </form>

              <!-- OR Divider -->
              <!-- <div class="d-flex align-items-center mb-4">
                <hr class="flex-grow-1" />
                <span class="mx-4">OR</span>
                <hr class="flex-grow-1" />
              </div> -->

              <!-- Google Sign-Up Button -->
              <!-- <div class="text-center mb-3">
                <button @click="signInWithGoogle" class="btn google-btn w-100">
                  <img
                    src="../assets/images/google.png"
                    alt="Google Logo"
                    class="google-logo"
                  />
                  Sign up with Google
                </button>
              </div> -->
            </div>
            <!-- End of Register Form -->
          </div>
          <!-- End of Tab Content -->
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
definePageMeta({
  layout: false,
});
import { ref } from "vue";
import { useRouter } from "vue-router";
import { createClient } from "@supabase/supabase-js";
import { useRuntimeConfig } from "#app";

// const config = useRuntimeConfig();
// const supabase = createClient(
//   config.public.supabaseUrl,
//   config.public.supabaseKey
// );

const client = useSupabaseClient();
const router = useRouter();
const user = useSupabaseUser();

// Login form data
const loginEmail = ref("");
const loginPassword = ref("");
const loginError = ref("");

// Signup form data
const registerEmail = ref("");
const registerPassword = ref("");
const registerRepeatPassword = ref("");
const signupError = ref("");

watchEffect(() => {
  if (user.value) {
    router.push("/");
  }
});

// Handle Sign In
const handleSignIn = async () => {
  loginError.value = "";
  const { error } = await client.auth.signInWithPassword({
    email: loginEmail.value,
    password: loginPassword.value,
  });
  if (error) {
    loginError.value = error.message;
  } else {
    console.log(user.value);
    router.push("/"); // Redirect to home page after successful sign-in
  }
};

// Handle Sign Up
const handleSignUp = async () => {
  signupError.value = "";

  if (registerPassword.value !== registerRepeatPassword.value) {
    signupError.value = "Passwords do not match.";
    return;
  }

  const { error } = await client.auth.signUp({
    email: registerEmail.value,
    password: registerPassword.value,
  });

  if (error) {
    signupError.value = error.message;
  } else {
    alert(
      "Registration successful! Please check your email to confirm your account."
    );
    // Optionally redirect or reset form fields
    registerEmail.value = "";
    registerPassword.value = "";
    registerRepeatPassword.value = "";
  }
};
</script>

<style scoped>
/* Ensure the section fills the viewport and centers content */
.login-section {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh; /* Full viewport height */
}

/* Center the main container */
.wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Adjust the row to center its content */
.row-wrapper {
  width: 100%;
}

/* Center the image and forms */
.login-register {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Adjust the image size */
.img-fluid {
  max-width: 100%;
  height: auto;
}

/* Style adjustments */
.form-label {
  text-align: left !important;
  display: block;
  font-size: small;
}

.error-message {
  color: red;
  margin-top: 10px;
}

.tab-content {
  width: 350px;
}

.nav {
  width: 350px;
}

span {
  color: #666;
  font-weight: 500;
}

.custom-btn,
.nav-link.active {
  background-color: var(--unity-purple);
  color: #fff !important;
  border: none;
}

.custom-btn:hover {
  background-color: var(--unity-hover);
}

.nav-link {
  color: #7662f2;
}

.nav-link:hover {
  color: #593fff;
}

/* Styles for Google Sign-In Button */
.google-btn {
  background-color: #fff;
  color: #444;
  border: 1px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  text-decoration: none;
}

.google-btn:hover {
  background-color: #f7f7f7;
}

.google-logo {
  width: 20px;
  height: 20px;
  margin-right: 8px;
}
</style>
