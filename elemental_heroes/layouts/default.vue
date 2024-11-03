<template>
  <div class="wrapper d-flex">
    <!-- Sidebar - Fixed on the left -->
    <nav id="sidebar" :class="{ notActive: isSidebarNotActive }">
      <div
        class="sidebar-header d-flex align-items-center justify-content-between"
      >
        <a href="/" class="elementalHome">
          <h3 class="px-4 press-start-2p-regular fs-6">Elemental Heroes</h3>
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
      <a href="/gamelist" class="sidebarButton">
        <div class="mt-4 p-3">
          <img src="../assets/images/gamepad-joystick-svgrepo-com.svg"
            width="50"
          />
          <span v-if="!isSidebarNotActive" class="ms-2 press-start-2p-regular"
            >Games</span
          >
        </div>
      </a>
      <a href="/revision" class="sidebarButton">
        <div class="p-3">
          <!-- <button type="button" class="btn btn-block"> -->

          <img src="../assets/images/git2-svgrepo-com.svg" width="50" />
          <span v-if="!isSidebarNotActive" class="ms-2 press-start-2p-regular"
            >Revision</span
          >
          <!-- </button> -->
        </div>
      </a>
      <div class="mt-4">
        <!--here we will render the friends dynamicaally-->
      </div>
    </nav>

    <!-- Main content wrapper - Takes remaining width -->
    <div class="content-wrapper d-flex flex-column w-100">
      <Navbar expand="lg" background-color="body-tertiary">
        <Container type="fluid">
          <NavbarBrand>
            <img
              src="/assets/images/chemical-8748832_640.webp"
              alt="Elemental Heroes Logo"
              width="30"
              height="30"
              class="d-inline-block align-top"
            />
          </NavbarBrand>
          <NavbarToggler />
          <!-- <button id="sidebarCollapse" @click="toggleSidebar">Toggle Sidebar</button> -->

          <NavbarCollapse>
            <NavbarNavList margin="e-auto b-2 b-lg-0">
              <NavItem>
                <NavLink active to="/">Home</NavLink>
              </NavItem>
              <NavItem>
                <NavLink active to="profile">Profile</NavLink>
              </NavItem>
              <NavItemDropdown>
                <NavItemDropdownToggle>Dropdown</NavItemDropdownToggle>
                <DropdownMenu>
                  <DropdownItem>Action</DropdownItem>
                  <DropdownItem to="">Another action</DropdownItem>
                  <DropdownItemDivider />
                  <DropdownItem>Something else here</DropdownItem>
                </DropdownMenu>
              </NavItemDropdown>
              <NavItem>
                <NavLink disabled>Disabled</NavLink>
              </NavItem>
            </NavbarNavList>
            <BForm flex role="search">
              <BFormInput margin="e-2" type="search" placeholder="Search" />
              <b-button color="outline-success" type="submit">Search</b-button>
            </BForm>
          </NavbarCollapse>
        </Container>
      </Navbar>

      <!-- Main content area -->
      <main class="flex-grow-1">
        <slot />
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

const isSidebarNotActive = ref(false);

function toggleSidebar() {
  isSidebarNotActive.value = !isSidebarNotActive.value;
}

</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap");

.press-start-2p-regular {
  font-family: "Press Start 2P", serif;
  font-weight: 400;
  font-style: normal;
}

/* Basic structure styling */
.wrapper {
  display: flex;
  align-items: stretch;
}

/* Sidebar styling */
#sidebar {
  min-width: 250px;
  max-width: 250px;
  min-height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  transition: all 0.3s;
  background: #cecae7;
  color: #1e1e1e;

}

.elementalHome {
  color: inherit;
  text-decoration: none;
  transition: ease 0.3s
}

.sidebarButton {
  color: inherit;
  text-decoration: none;
  display: block;
  width: 100%;
  font-size: 12.5px;
}

.sidebarButton:hover {
  background-color: #b2a9ec;
  width: 100%;
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* Content wrapper styling */
.content-wrapper {
  margin-left: 250px;
  transition: all 0.3s;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

#sidebar.notActive + .content-wrapper {
  margin-left: 80px;
}

#sidebar.notActive {
  min-width: 80px;
  max-width: 80px;
  text-align: center;
}

#sidebar .sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #1e1e1e;
  height: 72px;
  position: relative;
}

#sidebar .sidebar-header h3 {
  position: absolute;
  top: 50%;
  /* Center vertically */
  transform: translateY(-50%);
  /* Fine-tune vertical position */
  margin: 0;
  padding-top: 10px;
  transition-delay: 0.3s
  /* Adjust this value to move the text down */
}

#sidebar .sidebar-header button#sidebarCollapse {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: none;
}

/* Update the button styles for notActive state */
#sidebar.notActive .sidebar-header button#sidebarCollapse {
  display: block;
  margin: 0 auto;
  left: 0;
}

#sidebar.notActive .sidebar-header {
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

#sidebar.notActive .sidebar-header h3 {
  display: none;
}

#sidebar.notActive .sidebar-header strong {
  display: block;
}

#sidebar ul li a {
  text-align: left;
}

#sidebar.notActive ul li a {
  padding: 20px 10px;
  text-align: center;
  font-size: 0.85em;
}

#sidebar.notActive ul li a i {
  margin-right: 0;
  display: block;
  font-size: 1.8em;
  margin-bottom: 5px;
}

#sidebar.notActive ul ul a {
  padding: 10px !important;
}

#sidebar.notActive .dropdown-toggle::after {
  top: auto;
  bottom: 10px;
  right: 50%;
  transform: translateX(50%);
}

.navbar {
  position: sticky;
  top: 0;
  z-index: 999;
  height: 72px;
  padding: 0 20px;
  display: flex;
  align-items: center;
}

.navbar .container-fluid {
  height: 100%;
  display: flex;
  align-items: center;
}

main {
  min-height: calc(100vh - 142px); /* 72px header + 70px footer */
  overflow-y: auto;
  position: relative;
  padding-bottom: 20px;
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
}

footer p {
  margin: 0;
}

@media (max-width: 768px) {
  #sidebar {
    margin-left: -250px;
  }

  #sidebar.notActive {
    margin-left: 0;
    min-width: 80px;
    max-width: 80px;
  }

  .content-wrapper {
    margin-left: 0;
  }

  #sidebar.notActive + .content-wrapper {
    margin-left: 80px;
  }

  #sidebar .sidebar-header strong {
    display: none;
  }

  #sidebar.notActive .sidebar-header h3 {
    display: none;
  }

  #sidebar.notActive .sidebar-header strong {
    display: block;
  }

  #sidebar.notActive ul li a {
    padding: 20px 10px;
    font-size: 0.85em;
  }

  #sidebar.notActive ul li a i {
    margin-right: 0;
    display: block;
    font-size: 1.8em;
    margin-bottom: 5px;
  }

  #sidebar.notActive ul ul a {
    padding: 10px !important;
  }

  .dropdown-toggle::after {
    top: auto;
    bottom: 10px;
    right: 50%;
    transform: translateX(50%);
  }
}
</style>
