<template>
    <DefaultLayout>
    <div v-if="user" class="profile page-content">
        <img :src="user.picture">
        <h1>{{  user.name }}</h1>
        <p>{{  user.email }}</p>
    </div>
    </DefaultLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
// import navbar from '../components/navbar.vue';
// import sidebar from '../components/sidebar.vue';
import DefaultLayout from '../components/layout.vue';

const user = ref(null);
const router = useRouter();

const getUserInfo = () => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    user.value = JSON.parse(storedUser);
  } else {
    router.push('/');
  }
};

onMounted(() => {
  getUserInfo();
});
</script>

<style scoped>
.page-content {
  padding: 20px;
}
</style>