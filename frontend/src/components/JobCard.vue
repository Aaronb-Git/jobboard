<script setup lang="ts">
import { ref } from 'vue'

const afficherDetails = ref(false)

defineProps<{
  id: number
  title: string
  name_company: string
  one_sentence_description: string | null
  full_description: string | null
  wages: number | null
  place: string | null
  working_time: string | null
  advantages: string | null
  diploma_needed: string | null
}>()

</script>



<template>
    <article class="bg-white rounded-xl border border-gray-200 shadow-sm p-6 w-3/5 mx-auto my-5">

        <div class="flex justify-between items-start">
            <div>
                <h2 class="font-bold text-xl">{{ title }}</h2>
                <p class="text-gray-600">{{ name_company }}</p>
            </div>

            <button class="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700">
                Apply
            </button>
        </div>

        <p v-if="place" class="mt-3">
            Localisation : {{ place }}
        </p>

        <p v-if="one_sentence_description" class="mt-2">
            {{ one_sentence_description }}
        </p>

        

        <div v-if="afficherDetails" class="mt-4 border-t border-gray-200 pt-4">

            

            <p v-if="full_description" class="mb-3 whitespace-pre-line">
                {{ full_description }}
            </p>

            <p v-if="wages" class="mb-2">
                <strong>Salaire : </strong>{{ wages }} €
            </p>

            <p v-if="working_time" class="mb-2">
                <strong>Temps de travail : </strong> {{ working_time }}
            </p>

            <p v-if="advantages" class="mb-2">
                <strong>Avantages : </strong> {{ advantages }}
            </p>

            <p v-if="diploma_needed" class="mb-2">
                <strong>Diplôme demandé : </strong> {{ diploma_needed }}
            </p>

            
        </div>

        <button
            @click="afficherDetails = !afficherDetails"
            class="text-blue-600 font-medium hover:underline mt-4"
            :aria-expanded="afficherDetails"
        >
            {{ afficherDetails ? "Show less" : "Learn more" }}
        </button>

    </article>
</template>
