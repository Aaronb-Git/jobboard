<script setup lang="ts">
import { ref } from 'vue'
import {useRoute} from 'vue-router'

const message = ref('')
const feedback = ref('')
const route =useRoute()

async function submitApplication(){
    const appli = {
        message : message.value
    }
    const adId = route.params.id
    
    const response = await fetch(`/api/ads/${adId}/applications`, {
        method : 'POST',
        headers : {
            'Content-Type': 'application/json',
        },
        body : JSON.stringify(appli)
    })
    const data = await response.json()

    feedback.value = data.message;
}
</script>
<template>
    <h1>Postule pour l'annonce</h1>
    <form @submit.prevent="submitApplication">
        <textarea v-model="message"></textarea>
        <p>{{ feedback }}</p>
        <button type="submit" class="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-300 cursor-pointer">
            Envoyer ma candidature
            </button>
    </form>
    </template>