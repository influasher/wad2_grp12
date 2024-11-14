<template>
  <section class="login-section">
    <div class="container-fluid h-custom wrapper">
      <div
        class="row d-flex justify-content-center align-items-center h-100 row-wrapper"
      >
        <div
          class="col-12 col-md-6 col-lg-5 d-flex align-items-center justify-content-center"
        >
          <img
            src="../assets/images/chemical-8748832_640.webp"
            class="responsive-img"
          />
        </div>

        <div
          class="col-12 col-md-6 col-lg-5 d-flex flex-column align-items-center text-center login-register"
        >
          <h1 class="press-start-2p-regular py-4">Elemental Heroes</h1>
          <div
            class="card shadow py-2 px-4"
            style="width: 100%; max-width: 500px"
          >
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
                    <label for="loginPassword" class="form-label"
                      >Password</label
                    >
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
                  <p v-if="loginError" class="error-message">
                    {{ loginError }}
                  </p>
                </form>
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
                  <!-- First Name input -->
                  <div class="mb-4">
                    <label for="firstName" class="form-label">Username</label>
                    <input
                      v-model="firstName"
                      type="text"
                      id="firstName"
                      class="form-control"
                      placeholder="Enter your username"
                      required
                    />
                  </div>

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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
definePageMeta({
  layout: false,
});
import { ref, watchEffect } from "vue";
import { useRouter } from "vue-router";

const client = useSupabaseClient();
const router = useRouter();
const user = useSupabaseUser();

const loginEmail = ref("");
const loginPassword = ref("");
const loginError = ref("");

const firstName = ref("");
const lastName = ref("");
const registerEmail = ref("");
const registerPassword = ref("");
const registerRepeatPassword = ref("");
const signupError = ref("");

watchEffect(() => {
  if (user.value) {
    router.push("/");
  }
});

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
    router.push("/");
  }
};

const handleSignUp = async () => {
  signupError.value = "";

  if (registerPassword.value !== registerRepeatPassword.value) {
    signupError.value = "Passwords do not match.";
    return;
  }

  try {
    const { data, error } = await client.auth.signUp({
      email: registerEmail.value,
      password: registerPassword.value,
      options: {
        data: {
          first_name: firstName.value,
          last_name: lastName.value,
        },
      },
    });

    if (error) {
      signupError.value = error.message;
    } else {
      alert(
        "Registration successful! Please check your email to confirm your account."
      );
      firstName.value = "";
      lastName.value = "";
      registerEmail.value = "";
      registerPassword.value = "";
      registerRepeatPassword.value = "";
    }
  } catch (err) {
    console.error("Sign up error:", err);
    signupError.value = "An unexpected error occurred.";
  }
};
</script>

<style scoped>
.login-section {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  transition: ease 0.3s;
}
.responsive-img {
  max-width: 80%;
  height: auto;
}

@media (max-width: 768px) {
  .responsive-img {
    max-width: 40%;
  }

  .login-register {
    padding-top: 20px;
  }
}

.wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.wrapper::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url("../assets/chem-bg.jpg") no-repeat center center;
  background-size: cover;
  opacity: 0.1;
  z-index: -1;
}

.row-wrapper {
  width: 100%;
}

.login-register {
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: ease 0.3s;
}

.img-fluid {
  max-width: 100%;
  height: auto;
}

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
  width: 100%;
}

.nav {
  width: 100%;
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

.card {
  align-items: center;
  width: 100%;
}

.press-start-2p-regular {
  font-family: "Press Start 2P", serif;
  font-weight: 400;
  font-style: normal;
}
</style>
