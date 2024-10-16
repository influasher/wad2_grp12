<template>
  <!-- <div :class="['sidebar', { 'expanded': isOpen }]" id="sidebar">
    <div class="p-4">
      <h5 class="text-white h4" v-if="isOpen">Sidebar Content</h5>
      <ul class="list-unstyled mt-3">
        <li>
          <a href="#" class="nav-link text-white d-flex align-items-center">
            <i class="bi bi-house"></i>
            <span v-if="isOpen" class="ms-2">Dashboard</span>
          </a>
        </li>
        <li>
          <a href="#" class="nav-link text-white d-flex align-items-center">
            <i class="bi bi-person"></i>
            <span v-if="isOpen" class="ms-2">Profile</span>
          </a>
        </li>
      </ul>
    </div> -->
    <div v-if="isOpen" id="sidebar" class="sidebar expanded">
    <div class="p-4">
      <h5 class="text-white h4">Sidebar Content</h5>
      <ul class="list-unstyled mt-3">
        <li>
          <a href="#" class="nav-link text-white d-flex align-items-center">
            <i class="bi bi-house"></i>
            <span class="ms-2">Dashboard</span>
          </a>
        </li>
        <li>
          <a href="#" class="nav-link text-white d-flex align-items-center">
            <i class="bi bi-person"></i>
            <span class="ms-2">Profile</span>
          </a>
        </li>
      </ul>
    </div>
    <button class="sidebar-toggle-btn" @click="$emit('toggle')">
      <i class="bi-arrow-left-square"></i>
    </button>
</div>
    <div v-else class="sidebar">
        <button class="sidebar-toggle-btn" @click="$emit('toggle')">
      <i class='bi-arrow-right-square'></i>
    </button>
    </div>

    <!-- Toggle Button -->
    
  
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  isOpen: Boolean,
});
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 60px; 
  /* Collapsed width */
  background-color: #343a40;
  z-index: 1000; /* Ensure sidebar is above the navbar */
  transition: all 0.3s ease;
}

.sidebar.expanded {
  width: 250px; 
  /* Expanded width */
}

/* Sidebar Toggle Button */
.sidebar-toggle-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #f8f9fa;
  color: #343a40;
  border: none;
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 5px;
  cursor: pointer;
  transition: right 0.3s ease;
}

.sidebar-toggle-btn i {
  font-size: 20px;
}
</style>

  
  
  