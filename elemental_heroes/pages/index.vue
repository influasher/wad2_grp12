<!-- pages/index.vue -->
<template>
    <div class="home-page">
        <!-- Top Section -->
        <div class="mb-5">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="section-title">My Notes</h2>
                <button class="btn btn-primary">Upload Notes</button>
            </div>

            <div class="row g-4">
                <div class="col-md-4" v-for="note in ['Upload Notes', 'OG Chem', 'Thermodynamics']" :key="note">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">{{ note }}</h5>
                            <p class="card-text text-muted">Last modified: 2 days ago</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Shared Flashcards Section -->
        <div class="mb-5">
            <h2 class="section-title">Shared Flashcards</h2>
            <div class="row g-4">
                <div class="col-md-4" v-for="deck in ['OG Chem', 'Thermodynamics']" :key="deck">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">{{ deck }}</h5>
                            <p class="card-text text-muted">32 cards</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>


    </div>
</template>

<script setup>
//for supabase queries
</script>