import {createRouter, createWebHistory} from 'vue-router';
import Profile from '../components/profile.vue';
import Login from '../components/login.vue';

const routes = [
    {
        path:'/',
        name:'Login',
        component: Login
    },
    {
        path:'/profile',
        name: 'Profile',
        component: Profile
    },
];

const router = createRouter({
    history:createWebHistory(),
    routes
})

export default router;