<template>
    <div class="d-flex">
      <!-- Sidebar Component -->
            <Sidebar :isOpen="sidebarOpen" @toggle="toggleSidebar" />
      
            <div class="main-content" :class="{ 'compressed': sidebarOpen}">
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

const sidebarOpen = ref(true);
const isSmallScreen = ref(window.innerWidth <= 768);

// Function to toggle the sidebar
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};
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
  