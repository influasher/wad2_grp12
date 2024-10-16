<script setup>
import { useRouter } from 'vue-router';
import { decodeCredential } from 'vue3-google-login';
      
const callback =(response) => {
        console.log("logged in");
        console.log(response);

        let profile = decodeCredential(response.credential)
        localStorage.setItem('user',JSON.stringify(profile))

        router.push('/profile');
      }

const router = useRouter();

</script>

<template>
  <section>
    <div class="container-fluid h-custom">
      <div class="row d-flex justify-content-center align-items-center h-100">
        <div class="col-md-9 col-lg-7 col-xl-4">
          <img src="../assets/images/chemical-8748832_640.webp"
          class="img-fluid">
        </div>
        <div class="col-md-8 col-lg-7 col-xl-4 offset-xl-1 row justify-content-center">
        
          <!-- Pills Navs (Tabs) -->
          <ul class="nav nav-pills my-4 d-flex" id="pills-tab" role="tablist">
            <li class="nav-item flex-fill" role="presentation">
              <a class="nav-link active text-center" id="pills-login-tab" data-bs-toggle="pill" href="#pills-login" role="tab"
                aria-controls="pills-login" aria-selected="true">Login</a>
            </li>
            <li class="nav-item flex-fill" role="presentation">
              <a class="nav-link text-center" id="pills-register-tab" data-bs-toggle="pill" href="#pills-register" role="tab"
                aria-controls="pills-register" aria-selected="false">Register</a>
            </li>
          </ul>
          <!-- End of Pills Navs -->

          <!-- Pills Content -->
          <div class="tab-content" id="pills-tabContent">
            
            <!-- Login Tab -->
            <div class="tab-pane fade show active" id="pills-login" role="tabpanel" aria-labelledby="pills-login-tab">
              <form>
                <!-- Email input -->
                <div class="mb-4">
                  <label for="loginName" class="form-label">Email</label>
                  <input type="email" id="loginName" class="form-control" placeholder="Enter your email" />
                </div>

                <!-- Password input -->
                <div class="mb-4">
                  <label for="loginPassword" class="form-label">Password</label>
                  <input type="password" id="loginPassword" class="form-control" placeholder="Enter your password" />
                </div>

                <!-- 2 column grid layout for inline checkbox and link -->
                <div class="row mb-4">
                  <div class="col-md-6 d-flex">
                    <!-- Checkbox -->
                    <div class="form-check mb-3 mb-md-0">
                      <input class="form-check-input small-checkbox" type="checkbox" value="" id="loginCheck" />
                      <label class="form-label" for="loginCheck"> Remember me </label>
                    </div>
                  </div>

                  <div class="col-md-6 d-flex justify-content-end form-label">
                    <!-- Simple link -->
                    <a href="#!">Forgot password?</a>
                  </div>
                </div>

                <!-- Submit button -->
                <button type="submit" class="btn custom-btn btn-block mb-4 w-100">Sign in</button>

                <!-- Register buttons -->
                
                
              </form>
              <div class="d-flex align-items-center mb-4">
                  <hr class="flex-grow-1">
                  <span class="mx-4">OR</span>
                  <hr class="flex-grow-1">
              </div>
              <div class="text-center mb-3">
                  <GoogleLogin :callback="callback" class="bg-blue-500 hover:bg-blue-700" />
                </div>
            </div>
            <!-- End of Login Tab -->

            <!-- Register Tab -->
            <div class="tab-pane fade" id="pills-register" role="tabpanel" aria-labelledby="pills-register-tab">
              <form>
                <!-- Email input -->
                <div class="mb-4">
                  <label for="registerEmail" class="form-label">Email</label>
                  <input type="email" id="registerEmail" class="form-control" placeholder="Enter your email" />
                </div>

                <!-- Password input -->
                <div class="mb-4">
                  <label for="registerPassword" class="form-label">Password</label>
                  <input type="password" id="registerPassword" class="form-control" placeholder="Enter your password" />
                </div>

                <!-- Repeat Password input -->
                <div class="mb-4">
                  <label for="registerRepeatPassword" class="form-label">Repeat password</label>
                  <input type="password" id="registerRepeatPassword" class="form-control" placeholder="Repeat your password" />
                </div>

                <!-- Checkbox -->
                <div class="form-check d-flex align-content-center mb-4">
                  <input class="form-check-input me-2 small-checkbox" type="checkbox" value="" id="registerCheck"/>
                  <label class="form-label" for="registerCheck">
                    I have read and agree to the terms
                  </label>
                </div>

                <!-- Submit button -->
                <button type="submit" class="btn custom-btn btn-block mb-3 w-100">Sign up</button>
              </form>
              <div class="d-flex align-items-center mb-4">
                  <hr class="flex-grow-1">
                  <span class="mx-4">OR</span>
                  <hr class="flex-grow-1">
              </div>
              <div class="text-center mb-3">
                  <GoogleLogin :callback="callback" class="bg-blue-500 hover:bg-blue-700" />
                </div>
            </div>
            <!-- End of Register Tab -->

          </div>
          <!-- End of Pills Content -->

        </div>
      </div>
    </div>
  </section>
  

 
</template>

<style scoped>
.login button{
  background-color: aqua;
  color: white;
}

.tab-content {
  height: 400px;
  width: 350px;
}

.nav{
  width: 350px;
}

.form-label {
    text-align: left !important; /* Ensure the label is aligned to the left */
    display: block; /* Ensure it's block-level */
    font-size: small;
      }

  .small-checkbox {
    width: 15px; /* Set desired width */
    height: 15px; /* Set desired height */
    vertical-align: middle;
  }


span {
  color: #666;
  font-weight:500
}

.custom-btn, .nav-link.active {
    background-color: #7662F2 !important; 
    color: #fff !important;              
    border: none;                        
  }

  .custom-btn:hover {
    background-color: #593FFF
  }

  .nav-link{
    color: #7662F2;
  }
  .nav-link:hover {
    color: #593FFF;
  }
</style>
