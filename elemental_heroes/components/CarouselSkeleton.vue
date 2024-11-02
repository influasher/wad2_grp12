<!-- components/CarouselSkeleton.vue -->
<template>
  <div class="card text-bg-dark mx-auto skeleton-card">
    <!-- Placeholder for image -->
    <div class="skeleton-img rounded placeholder-glow">
      <span class="placeholder w-100 h-100"></span>
    </div>

    <!-- Overlay content -->
    <div class="card-img-overlay d-flex flex-column justify-content-end"></div>
  </div>
</template>

<style>
/* Remove scoped to ensure styles are applied */
.skeleton-card {
  width: 100%;
  max-height: 70vh;
  position: relative;
  overflow: hidden;
}

.skeleton-img {
  width: 100%;
  aspect-ratio: 16/9;
  position: relative;
}

.skeleton-img .placeholder {
  position: absolute;
  top: 0;
  left: 0;
  margin: 0;
}
.placeholder {
  opacity: 0.6;
}

.placeholder-lg {
  min-height: 2rem;
}
</style>
