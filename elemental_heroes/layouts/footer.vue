<template>
    <footer class="footer">
      <div class="container">
        <div class="row">
          <div class="col text-center">
            <p>&copy; 2024 Elemental Heroes. All rights reserved.</p>
            <nav>
              <a href="/about">About</a> |
              <a href="/contact">Contact</a> |
              <a href="/privacy">Privacy Policy</a>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  </template>
  
  <script setup>
  // No logic needed for basic footer
  </script>
  
  <style scoped>
  .footer {
    background-color: var(--unity-dark);
    color: #fff;
    padding: 1rem 0;
  }
  
  .footer nav a {
    color: #ffffff;
    margin: 0 10px;
    text-decoration: none;
  }
  
  .footer nav a:hover {
    text-decoration: underline;
  }
  </style>
  