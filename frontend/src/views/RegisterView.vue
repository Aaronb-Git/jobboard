<script setup lang="ts">

import { ref } from 'vue'

const nom = ref('')
const prenom = ref('')
const email = ref('')
const password = ref('')

function register(){
    console.log(nom)
    console.log(prenom)
    console.log(email)
    console.log(password)
}


</script>


<template>
    <main class="min-h-screen flex items-center justify-center bg-red-300">
        <form @submit.prevent="register" class="p-8 rounded-xl shadow-lg max-w-full">
            <h1 class="text-2xl font-bold text-center mb-6">Inscription</h1>
            <div class="flex justify-center gap-15 mb-4">
                <input v-model="nom" type="text" placeholder="Nom" required class="p-3 shadow-lg rounded-lg mb-4 bg-red-200">
                <input v-model="prenom" type="text" placeholder="Prenom" required class="p-3 shadow-lg rounded-lg mb-4 bg-red-200">
                <input v-model="email" type="email" placeholder="Adresse e-mail" required class="p-3 shadow-lg rounded-lg mb-4 bg-red-200">
                <input v-model="password" type="password" placeholder="Mot de passe" required class="p-3 shadow-lg rounded-lg mb-4 bg-red-200">
            </div>
            <button type="submit" class="w-full bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700 transition-colors duration-300 cursor-pointer">
            S'inscrire
            </button>
        </form>
    </main>
</template>