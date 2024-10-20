<template>
    <div class="container">
        <Sidebar />
        <Navbar />
        <div class="content">
            Testing connection to supabase
                <ul>
                    <li v-for="country in countries" :key="country.id">{{ country.name }}</li>
                </ul>

        </div>
    </div>
</template>

<script setup>
import { useRuntimeConfig } from '#app';
import { createClient } from '@supabase/supabase-js'

const config = useRuntimeConfig()
const supabase = createClient(config.public.supabaseUrl, config.public.supabaseKey)
const countries = ref([])



async function getCountries() {
    const { data } = await supabase.from('countries').select()
    countries.value = data
}

onMounted(() => {
    getCountries()
})
</script>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
    height: 100vh;
}

.content {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 24px;
    /* Adjust the font size as needed */
}
</style>