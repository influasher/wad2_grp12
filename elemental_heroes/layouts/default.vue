<template>
  <div class="wrapper d-flex">
    <!-- Sidebar - Fixed on the left -->
    <nav id="sidebar" :class="{ closed: isSidebarClosed }">
      <div
        class="sidebar-header d-flex align-items-center justify-content-between"
      >
        <a href="/" class="elementalHome">
          <h6 class="px-4 press-start-2p-regular">Elemental Heroes</h6>
        </a>
        <button id="sidebarCollapse" @click="toggleSidebar" class="p-4">
          <img
            src="../assets/images/hamburger.svg"
            alt="Toggle Sidebar"
            width="24"
            height="24"
          />
        </button>
      </div>
      <a href="/" class="sidebarButton">
        <div class="p-3">
          <img src="../assets/images/home-svgrepo-com.svg" width="35" />
          <span v-if="!isSidebarClosed" class="ms-3 press-start-2p-regular"
            >Home</span
          >
        </div>
      </a>
      <a href="/gamelist" class="sidebarButton">
        <div class="p-3">
          <img
            src="../assets/images/gamepad-joystick-svgrepo-com.svg"
            width="35"
          />
          <span v-if="!isSidebarClosed" class="ms-3 press-start-2p-regular"
            >Games</span
          >
        </div>
      </a>
      <a href="/revision" class="sidebarButton">
        <div class="p-3">
          <img src="../assets/images/books-svgrepo-com.svg" width="35" />
          <span v-if="!isSidebarClosed" class="ms-3 press-start-2p-regular"
            >Revision</span
          >
          <!-- </button> -->
        </div>
      </a>
      <a href="/profile" class="sidebarButton">
        <div class="p-3">
          <img src="../assets/images/user-svgrepo-com.svg" width="35" />
          <span v-if="!isSidebarClosed" class="ms-3 press-start-2p-regular"
            >Profile</span
          >
        </div>
      </a>
      <hr class="mx-3" />
      <span
        v-if="!isSidebarClosed"
        class="ms-1 press-start-2p-regular ps-3"
        style="font-size: 11px"
        >Friends</span
      >
      <span v-else style="opacity: 0; font-size: 11px"> Friends</span>
      <div id="friendsList">
        <div v-for="friend in friends" class="sidebarButton">
          <div
            class="p-3"
            data-bs-toggle="tooltip"
            data-bs-placement="bottom"
            :data-bs-title="
              friend.status === 'online' ? 'Online' : 'Last seen 5 minutes ago'
            "
          >
            <div class="position-relative">
              <img :src="friend.avatar" width="35" />
              <span
                class="position-absolute bottom-0 end-0 p-1 border border-light rounded-circle"
                :class="
                  friend.status === 'online' ? 'bg-success' : 'bg-secondary'
                "
                style="opacity: 1"
              >
              </span>
            </div>
            <span v-if="!isSidebarClosed" class="ms-3 press-start-2p-regular">{{
              friend.name
            }}</span>
          </div>
        </div>
      </div>
      <!-- Logout Button -->

      <div class="logout-section">
        <div
          @click="handleSignOut"
          class="sidebarButton"
          style="cursor: pointer"
        >
          <hr />
          <div class="px-3 pb-3 text-center">
            <img src="../assets/images/log-out.svg" width="35" />
            <span v-if="!isSidebarClosed" class="ms-3 press-start-2p-regular"
              >Logout</span
            >
          </div>
        </div>
      </div>
    </nav>

    <!-- Main content wrapper - Takes remaining width -->
    <div class="content-wrapper d-flex flex-column w-100">
      <!-- Main content area -->
      <main class="flex-grow-1">
        <!-- <div class="background_wrap"> -->
        <slot />
        <!-- </div> -->
      </main>
      <footer class="footer mt-auto py-3 bg-light">
        <div class="container-fluid text-center">
          <p class="mb-0">&copy; 2024 Elemental Heroes. All rights reserved.</p>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
const client = useSupabaseClient();
const router = useRouter();

const handleSignOut = async () => {
  try {
    const { error } = await client.auth.signOut();
    if (error) {
      console.error("Sign-out error:", error.message);
    } else {
      router.push("/login"); // Redirect to login page or any desired route after sign-out
    }
  } catch (err) {
    console.error("Unexpected error during sign-out:", err);
  }
};

const isSidebarClosed = ref(false);

function toggleSidebar() {
  isSidebarClosed.value = !isSidebarClosed.value;
}

const friends = ref([
  {
    name: "Asher",
    avatar: "../assets/images/account-avatar-profile-user-12-svgrepo-com.svg",
    status: "online",
  },
  {
    name: "Wesley",
    avatar: "../assets/images/account-avatar-profile-user-13-svgrepo-com.svg",
    status: "offline",
  },
  {
    name: "Selina",
    avatar: "../assets/images/account-avatar-profile-user-4-svgrepo-com.svg",
    status: "online",
  },
  {
    name: "Ryan",
    avatar: "../assets/images/account-avatar-profile-user-6-svgrepo-com.svg",
    status: "offline",
  },
  {
    name: "Daniel",
    avatar: "../assets/images/account-avatar-profile-user-3-svgrepo-com.svg",
    status: "online",
  },
]);

onMounted(() => {
  const tooltipTriggerList = document.querySelectorAll(
    '[data-bs-toggle="tooltip"]'
  );
  tooltipTriggerList.forEach((tooltipTriggerEl) => {
    new bootstrap.Tooltip(tooltipTriggerEl);
  });
});

function checkScreenWidth() {
  isSidebarClosed.value = window.innerWidth <= 768; // Set closed if screen width <= 768px
}

onMounted(() => {
  checkScreenWidth(); // Set initial state based on screen width
  window.addEventListener("resize", checkScreenWidth); // Add listener for window resize
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap");

.press-start-2p-regular {
  font-family: "Press Start 2P", serif;
  font-weight: 400;
  font-style: normal;
}

.wrapper {
  display: flex;
  align-items: stretch;
  width: 100%;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
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

#sidebar {
  display: flex;
  flex-direction: column;
  width: 250px;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  transition: min-width 0.3s ease, max-width 0.3s ease, padding 0.3s ease;
  background: #cecae7;
  color: #1e1e1e;
}

#sidebar.closed {
  width: 70px;
  text-align: center;
}

.elementalHome {
  color: inherit;
  text-decoration: none;
  transition: ease 0.3s;
}

#sidebar .sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #1e1e1e;
  height: 72px;
  position: relative;
  transition: padding 0.3s ease, opacity 0.3s ease;
}

#sidebar .sidebar-header h6 {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  margin: 0;
  padding-top: 10px;
  opacity: 1;
  transition: opacity 0.5s ease;
}

#sidebar.closed .sidebar-header {
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

#sidebar.closed .sidebar-header h6 {
  display: none;
  opacity: 0;
  transition: opacity 0.3s ease 0.1s;
}

#sidebar .sidebar-header button#sidebarCollapse {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: none;
}

#sidebar.closed .sidebar-header button#sidebarCollapse {
  display: block;
  margin: 0 auto;
  left: 0;
}

.sidebarButton {
  color: inherit;
  text-decoration: none;
  display: block;
  width: 100%;
  font-size: 12.5px;
  transition: padding 0.3s ease, opacity 0.3s ease;
}

.sidebarButton:hover {
  background-color: #b2a9ec;
  width: 100%;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.sidebarButton > div {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0;
  transition: padding 0.3s ease;
}

.sidebarButton span {
  opacity: 1;
  transition: opacity 0.3s ease;
}

#sidebar.closed .sidebarButton span {
  opacity: 0;
  transition: opacity 0.3s ease 0.1s;
}

#friendsList {
  overflow-y: auto;
  flex-grow: 1;
}

#friendsList::-webkit-scrollbar {
  width: 8px;
  display: none;
}

#friendsList:hover::-webkit-scrollbar {
  display: block;
}

#friendsList::-webkit-scrollbar-thumb {
  background-color: #b2a9ec;
  border-radius: 4px;
}

#sidebar.closed .logoutButton span {
  opacity: 0;
  transition: opacity 0.3s ease 0.1s;
}

.content-wrapper {
  margin-left: 250px;
  transition: all 0.3s;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

#sidebar.closed + .content-wrapper {
  margin-left: 70px;
}

main {
  min-height: calc(100vh - 142px);
  overflow-y: auto;
  position: relative;
}

footer {
  padding: 10px;
  position: relative;
  bottom: 0;
  width: 100%;
  background-color: #f8f9fa;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.6;
}

footer p {
  margin: 0;
}

@media (max-width: 768px) {
  .content-wrapper {
    margin-left: 70px;
  }

  #sidebar.closed + .content-wrapper {
    margin-left: 70px;
  }

  #sidebar.closed .sidebar-header h6 {
    display: none;
  }
}
</style>
