import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import ProfilView from '../views/ProfilView.vue'
import ApplicationView from '../views/ApplicationView.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/login',
            component: LoginView
        },
        {
            path: '/',
            component: HomeView
        },
        {
            path: '/register',
            component: RegisterView
        },
        {
            path: '/Profil',
            component: ProfilView
        },
        {
            path: '/ads/:id/apply',
            component: ApplicationView
        }

    ]
})

export default router