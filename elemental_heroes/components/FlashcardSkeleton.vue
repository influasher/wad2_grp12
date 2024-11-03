<template>
    <div class="flashcard-skeleton">
      <div class="placeholder-glow w-100 h-100">
        <div class="placeholder skeleton-rect"></div>
      </div>
    </div>
  </template>
  
  <style scoped>
  .flashcard-skeleton {
    height: 300px; /* Adjust this value based on your needs */
    width: 100%;
  }
  
  .skeleton-rect {
    width: 100%;
    height: 100%;
    border-radius: 8px;
  }
  </style>