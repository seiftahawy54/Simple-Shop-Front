import {createApp} from 'vue'

// Bootstrap framework and icons
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'


import App from './App.vue'
import Vue3Toastify, {ToastContainerOptions} from "vue3-toastify";

const app = createApp(App)

app.use(Vue3Toastify, {
    autoClose: 3000,
} as ToastContainerOptions);
app.mount('#app')
