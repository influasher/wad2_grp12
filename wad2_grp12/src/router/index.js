import {createRouter, createWebHistory} from 'vue-router';
import Profile from '../views/profile.vue';
import Login from '../views/login.vue';

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