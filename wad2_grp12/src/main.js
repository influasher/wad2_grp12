import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import router from './router/index';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const app = createApp(App);
import vue3GoogleLogin from 'vue3-google-login';
const ClientId = '153215005232-85gf7dth05hr76tttovc98b01lbabsn4.apps.googleusercontent.com';

app.use(vue3GoogleLogin, {
    clientId: ClientId,
})

app.use(router);
app.mount('#app');
