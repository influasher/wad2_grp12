<template>
    <div v-if="user" class="profile">
        <img :src="user.picture">
        <h1>{{  user.name }}</h1>
        <p>{{  user.email }}</p>
        <button @click="logout">
            Logout
        </button>
    </div>
</template>

<script>
import {ref,onMounted} from 'vue';
import {useRouter} from 'vue-router';

export default {
    setup(){
        const user = ref(null);
        const router = useRouter();

        const getUserInfo = () => {
            const storedUser = localStorage.getItem('user');
            if(storedUser){
                user.value = JSON.parse(storedUser)
            }else{
                router.push('/');
            }
        }

        onMounted(() => {
            getUserInfo();
        })

        const logout = () => {
            localStorage.removeItem('user');
            router.push('/');
        }

        return {
            user,
            logout
        }
    }
}
</script>