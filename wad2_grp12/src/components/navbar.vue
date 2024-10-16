<template>
    <nav class="navbar bg-light py-3 border-bottom border-secondary-subtle" :class="{ 'shifted': sidebarOpen }">
      <div class="container-fluid d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center">
          <a class="navbar-brand mx-3" href="#">
            <img src="../assets/images/chemical-8748832_640.webp" alt="Logo" width="30" height="24" class="d-inline-block align-text-top me-2">
            <span>Elemental Heroes</span>
          </a>
          <!-- Search Bar -->
          <form class="d-flex" role="search">
            <input class="form-control me-3" type="search" placeholder="Search" aria-label="Search">
            <button class="btn btn-outline-success" type="submit">Search</button>
          </form>
        </div>
        <div class="d-flex align-items-center">
          <button class="btn btn-primary rounded-pill me-5">Upgrade</button>
          <a href="#" class="d-flex align-items-center link-dark text-decoration-none me-5">
            <img src="../assets/images/trophy.svg" alt="">
          </a>
          <div class="dropdown pe-2">
            <a href="#" class="d-flex align-items-center link-dark text-decoration-none" id="dropdownUser" data-bs-toggle="dropdown" aria-expanded="false">
              <img src="https://via.placeholder.com/40" alt="Profile Picture" class="rounded-circle" width="35" height="35">
            </a>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownUser">
              <li><a class="dropdown-item" href="#">Profile</a></li>
              <li><a class="dropdown-item" href="#">Settings</a></li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item" href="#" @click="logout">Logout</a></li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  </template>
  
  <script setup>
  import { defineProps } from 'vue';
  
  const props = defineProps({
    sidebarOpen: Boolean,  // Get the sidebar state from DefaultLayout
  });
  
  const logout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };
  </script>
  
  <style scoped>
  .navbar {
    position: fixed;
    top: 0;
    left: 0;
    margin-left: 60px;
    width: calc(100% - 60px);
    z-index: 10; /* Lower z-index to ensure sidebar appears above */
    /* width: 100%; */
    transition: 0.3s ease; /* Transition for smooth shifting */
  }
  
  /* Shift the navbar when the sidebar is expanded */
  .shifted {
    margin-left: 250px; /* Shifted position when the sidebar is expanded */
    width: calc(100% - 250px);
    transition: 0.3s ease;
  }
  </style>
  
  
  