
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import JobCard from '../components/JobCard.vue'

type Ad = {
  id: number
  title: string
  name_company: string
  one_sentence_description: string | null
  full_description: string | null
  wages: string | null
  place: string | null
  working_time: string | null
  advantages: string | null
  diploma_needed: string | null
}

const jobs = ref<Ad[]>([])
const loading = ref(true)
const error = ref('')

async function loadAds() {
  try {
    const response = await fetch('/api/ads')

    if (!response.ok) {
      throw new Error('La requête a échoué')
    }

    const ads: Ad[] = await response.json()
    jobs.value = ads
  } catch {
    error.value = 'Impossible de charger les annonces.'
  } finally {
    loading.value = false
  }
}

onMounted(loadAds)
</script>

<template>
    <main class="py-12">
        <section>
         <h1 class="text-4xl font-bold text-center text-gray-900 mb-4">
  Offres d’emploi
</h1>

<p v-if="loading" class="text-center">
  Chargement des annonces…
</p>

<p v-else-if="error" role="alert" class="text-center">
  {{ error }}
</p>

<p v-else-if="jobs.length === 0" class="text-center">
  Aucune annonce disponible.
</p>

<template v-else>
  <JobCard
    v-for="job in jobs"
    :key="job.id"
    v-bind="job"
  />
</template>
        </section>
    </main>
</template>