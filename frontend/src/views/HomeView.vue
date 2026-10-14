
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import JobCard from '../components/JobCard.vue'

type Ad = {
  id: number
  title: string
  name_company: string
  one_sentence_description: string | null
  place: string | null
  applied: number
}

type Filtre = 'all' | 'applied' | 'not-applied'

const jobs = ref<Ad[]>([])
const loading = ref(true)
const error = ref('')

const estConnecte = ref(false)
const filtre = ref<Filtre>('all')

// Vérifier si l'utilisateur est connecté
async function verifierConnexion() {
  try {
    const response = await fetch('/api/me', {
      credentials: 'include'
    })

    estConnecte.value = response.ok
  } catch (err) {
    console.error('Erreur de vérification de connexion :', err)
    estConnecte.value = false
  }
}

// Charger les annonces
async function loadAds() {
  loading.value = true
  error.value = ''

  try {
    const response = await fetch('/api/ads/preview', {
      credentials: 'include'
    })

    if (!response.ok) {
      throw new Error('La requête a échoué')
    }

    const ads: Ad[] = await response.json()
    jobs.value = ads
  } catch (err) {
    console.error('Erreur de chargement des annonces :', err)
    error.value = 'Impossible de charger les annonces.'
  } finally {
    loading.value = false
  }
}

// Filtrer les annonces
const annoncesFiltrees = computed(() => {
  if (!estConnecte.value) {
    return jobs.value
  }

  if (filtre.value === 'applied') {
    return jobs.value.filter(job => Number(job.applied) === 1)
  }

  if (filtre.value === 'not-applied') {
    return jobs.value.filter(job => Number(job.applied) === 0)
  }

  return jobs.value
})

// Nombre d'annonces déjà postulées
const totalPostulees = computed(() => {
  return jobs.value.filter(job => Number(job.applied) === 1).length
})

// Nombre d'annonces non postulées
const totalNonPostulees = computed(() => {
  return jobs.value.filter(job => Number(job.applied) === 0).length
})

// Réinitialiser le filtre en cas de déconnexion
watch(estConnecte, (connecte) => {
  if (!connecte) {
    filtre.value = 'all'
  }
})

// Initialisation de la page
onMounted(async () => {
  await verifierConnexion()
  await loadAds()
})
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

      <p
        v-else-if="error"
        role="alert"
        class="text-center text-red-600"
      >
        {{ error }}
      </p>

      <template v-else>

        <!-- Filtres visibles uniquement si connecté -->
        <div
          v-if="estConnecte"
          class="flex flex-wrap justify-center gap-3 my-8"
        >

          <button
            @click="filtre = 'all'"
            :class="[
              'px-5 py-2 rounded-lg font-medium transition cursor-pointer',
              filtre === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            Toutes ({{ jobs.length }})
          </button>

          <button
            @click="filtre = 'applied'"
            :class="[
              'px-5 py-2 rounded-lg font-medium transition cursor-pointer',
              filtre === 'applied'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            Déjà postulées ({{ totalPostulees }})
          </button>

          <button
            @click="filtre = 'not-applied'"
            :class="[
              'px-5 py-2 rounded-lg font-medium transition cursor-pointer',
              filtre === 'not-applied'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            Non postulées ({{ totalNonPostulees }})
          </button>

        </div>

        <!-- Aucune annonce -->
        <p
          v-if="jobs.length === 0"
          class="text-center text-gray-600"
        >
          Aucune annonce disponible.
        </p>

        <!-- Aucun résultat pour le filtre -->
        <p
          v-else-if="annoncesFiltrees.length === 0"
          class="text-center text-gray-600"
        >
          Aucune annonce ne correspond à ce filtre.
        </p>

        <!-- Affichage des annonces -->
        <template v-else>
          <JobCard
            v-for="job in annoncesFiltrees"
            :key="job.id"
            v-bind="job"
          />
        </template>

      </template>
    </section>
  </main>
</template>
