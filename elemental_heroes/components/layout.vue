<template>
    <div class="d-flex">
      <!-- Sidebar Component -->
      <Sidebar :isOpen="sidebarOpen" @toggle="toggleSidebar" />
      
      <div class="main-content" :class="{ 'compressed': sidebarOpen }">
        <Navbar :sidebarOpen="sidebarOpen" />
        
        <div class="page-content">
          <slot></slot> <!-- Page-specific content goes here -->
        </div>
      </div>
      <!-- Main Content Area including the Navbar -->
    </div>
  </template>
  
  <script setup>
  import Sidebar from './sidebar.vue';
  import Navbar from './navbar.vue';
  import { ref, onMounted, onUnmounted } from 'vue';
  
  const sidebarOpen = ref(true); // Sidebar is open by default on larger screens
  const isSmallScreen = ref(window.innerWidth <= 768);
  
  // Function to toggle the sidebar
  const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value;
  };
  
  // Function to check screen size and update sidebarOpen
  const checkScreenSize = () => {
    isSmallScreen.value = window.innerWidth <= 768;
  
    // Automatically close sidebar if screen is small
    if (isSmallScreen.value) {
      sidebarOpen.value = false; // Sidebar closed on small screens
    } else {
      sidebarOpen.value = true; // Sidebar open on larger screens
    }
  };
  
  // On mounted, check the screen size initially
  onMounted(() => {
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize); // Listen for window resize events
  });
  
  // On unmounted, remove the event listener
  onUnmounted(() => {
    window.removeEventListener('resize', checkScreenSize);
  });
  </script>
  
  <style scoped>
  .main-content {
    width: calc(100% - 60px); /* Default width when sidebar is collapsed (60px for sidebar) */
    transition: margin-left 0.3s ease;
    padding-top: 70px; /* Padding equivalent to navbar height to avoid overlap */
  }
  
  /* Shift the main content and navbar when the sidebar expands */
  .compressed {
    width: calc(100% - 250px); /* Adjust width when the sidebar is expanded */
    margin-left: 250px;
  }
  
  .page-content {
    padding: 20px;
  }
  </style>
  
  