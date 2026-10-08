
<script setup lang="ts">
import JobCard from '../components/JobCard.vue'

const jobs = [
    {
        id: 1,
        title: "Développeur Full Stack",
        name_company: "Google",
        one_sentence_description: "Nous recherchons un développeur Full Stack pour rejoindre notre équipe.",
        full_description: "Développement d'applications web avec Vue.js, Node.js et TypeScript.",
        wages: 3500,
        place: "Paris",
        working_time: "35h/semaine",
        advantages: "Télétravail, tickets restaurant, primes",
        diploma_needed: "Bac+3"
    },
    {
        id: 2,
        title: "Administrateur Réseau",
        name_company: "Orange",
        one_sentence_description: "Rejoignez notre équipe pour assurer la gestion de nos infrastructures réseau.",
        full_description: "Configuration des routeurs, gestion des VLAN, maintenance des serveurs et sécurité réseau.",
        wages: 2800,
        place: "Nancy",
        working_time: "39h/semaine",
        advantages: "Mutuelle, tickets restaurant, véhicule de fonction",
        diploma_needed: "Bac+2"
    },
    {
        id: 3,
        title: "Développeur Front-End",
        name_company: "Ubisoft",
        one_sentence_description: "Nous recherchons un développeur Front-End passionné par les interfaces web.",
        full_description: "Création d'interfaces modernes avec Vue.js, TypeScript et Tailwind CSS.",
        wages: 3200,
        place: "Lyon",
        working_time: "35h/semaine",
        advantages: "Télétravail, horaires flexibles, primes",
        diploma_needed: "Bac+3"
    }
]
</script>



<template>
    <main class="py-12">
        <section>
            <h1 class="text-4xl font-bold text-center text-gray-900 mb-4">offre test</h1>
            <p class="text-center">description entreprise</p>
            <JobCard v-for="job in jobs" :key="job.id" v-bind="job" />
        </section>
    </main>
</template>