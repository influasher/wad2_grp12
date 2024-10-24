<!-- pages/index.vue -->
<template>
  <div class="home-page">
    <!-- Announcements Section -->
    <div class="announcements">
      <h3>Announcements</h3>
      <p>
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Suscipit
        molestias nostrum corporis voluptates quae laborum quos enim, voluptatem
        neque, deserunt adipisci, veritatis nam aspernatur. Eos iste expedita
        facere officiis odio.
      </p>
    </div>

    <!-- Slideshow of recently played -->
    <div class="slideshow">
      <div
        id="carouselExampleAutoplaying"
        class="carousel slide"
        data-bs-ride="carousel"
      >
        <div class="carousel-inner">
          <div class="carousel-item active" data-bs-interval="3000">
            <div class="card text-bg-dark mx-auto">
              <img
                src="../assets/images/chemistry games/Firefly chemistry revision online game 12285 (1).jpg"
                alt="..."
                class="rounded"
              />
              <div
                class="card-img-overlay d-flex flex-column justify-content-end"
              >
                <h3 class="card-title">Game Title</h3>
                <p class="card-text">
                  This is a wider card with supporting text below as a natural
                  lead-in to additional content. This content is a little bit
                  longer.
                </p>
                <button type="button" class="btn btn-primary">Play Game</button>
              </div>
            </div>
          </div>
          <div class="carousel-item active" data-bs-interval="3000">
            <div class="card text-bg-dark mx-auto">
              <img
                src="../assets/images/chemistry games/Firefly chemistry revision online game 5908 (1).jpg"
                alt="..."
                class="rounded"
              />
              <div
                class="card-img-overlay d-flex flex-column justify-content-end"
              >
                <h3 class="card-title">Game Title</h3>
                <p class="card-text">
                  This is a wider card with supporting text below as a natural
                  lead-in to additional content. This content is a little bit
                  longer.
                </p>
                <button type="button" class="btn btn-primary">Play Game</button>
              </div>
            </div>
          </div>
          <div class="carousel-item active" data-bs-interval="3000">
            <div class="card text-bg-dark mx-auto">
              <img
                src="../assets/images/chemistry games/Firefly chemistry revision online game 73535.jpg"
                alt="..."
                class="rounded"
              />
              <div
                class="card-img-overlay d-flex flex-column justify-content-end"
              >
                <h3 class="card-title">Game Title</h3>
                <p class="card-text">
                  This is a wider card with supporting text below as a natural
                  lead-in to additional content. This content is a little bit
                  longer.
                </p>
                <button type="button" class="btn btn-primary">Play Game</button>
              </div>
            </div>
          </div>
        </div>
        <button
          class="carousel-control-prev"
          type="button"
          data-bs-target="#carouselExampleAutoplaying"
          data-bs-slide="prev"
        >
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Previous</span>
        </button>
        <button
          class="carousel-control-next"
          type="button"
          data-bs-target="#carouselExampleAutoplaying"
          data-bs-slide="next"
        >
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Next</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
.home-page {
  display: block;
  justify-content: center;
  align-items: center;
  height: 100vh; /* Full viewport height */
}
.announcements {
  display: block;
  background-color: #f5f5f5;
  max-width: 100%;

  h3 {
    text-align: center;
  }

  p {
    text-align: center;
  }
}

.slideshow {
  justify-content: center;
}

.carousel-item img {
  width: 100%;
  /* height: 260px; */
  display: inline-block;
  position: relative;
  overflow: hidden;
}

.card {
  width: 100%;
  max-height: 500px;
  display: inline-block;
  position: relative;
  overflow: hidden; /*This will crop off image portions that overflow the container*/
}

.card-img-overlay {
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.8) 0%,
    rgba(0, 0, 0, 0.4) 50%,
    transparent 100%
  );
}

.btn {
  background-color: #8b6ef3;
  width: 20%;
}
</style>

<script setup>
//for supabase queries
</script>
