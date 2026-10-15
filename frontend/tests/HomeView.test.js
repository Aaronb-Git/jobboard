import { afterEach, describe, expect, it, vi } from 'vitest'
import { enableAutoUnmount, flushPromises, shallowMount } from '@vue/test-utils'
import HomeView from '../src/views/HomeView.vue'

enableAutoUnmount(afterEach)

const ads = [
  { id: 1, title: 'Développeur Vue', name_company: 'Alpha', applied: 1 },
  { id: 2, title: 'Développeur Node', name_company: 'Beta', applied: 0 },
  { id: 3, title: 'Développeur TypeScript', name_company: 'Gamma', applied: 0 },
].map(ad => ({ ...ad, place: null, one_sentence_description: null }))

function mountHome({ connected = true, jobs = ads, adsStatus = 200 } = {}) {
  const fetchMock = vi.fn(async url => {
    if (url === '/api/me') {
      return { ok: connected, status: connected ? 200 : 401 }
    }
    if (url === '/api/ads/preview') {
      return { ok: adsStatus === 200, status: adsStatus, json: async () => jobs }
    }
    throw new Error(`Requête inattendue : ${url}`)
  })
  vi.stubGlobal('fetch', fetchMock)

  return shallowMount(HomeView, {
    global: {
      stubs: {
        JobCard: { props: ['title'], template: '<article>{{ title }}</article>' },
      },
    },
  })
}

describe('HomeView', () => {
  it('filtre les annonces postulées et non postulées avec les bons compteurs', async () => {
    const wrapper = mountHome()
    await flushPromises()

    const buttons = wrapper.findAll('button')
    expect(buttons.map(button => button.text())).toEqual([
      'Toutes (3)', 'Déjà postulées (1)', 'Non postulées (2)',
    ])
    expect(wrapper.findAll('article')).toHaveLength(3)

    await buttons[1].trigger('click')
    expect(wrapper.findAll('article').map(card => card.text())).toEqual(['Développeur Vue'])

    await buttons[2].trigger('click')
    expect(wrapper.findAll('article').map(card => card.text())).toEqual([
      'Développeur Node', 'Développeur TypeScript',
    ])

    await buttons[0].trigger('click')
    expect(wrapper.findAll('article')).toHaveLength(3)
  })

  it('affiche toutes les annonces sans filtres pour un visiteur', async () => {
    const wrapper = mountHome({ connected: false })
    await flushPromises()

    expect(wrapper.findAll('article')).toHaveLength(3)
    expect(wrapper.findAll('button')).toHaveLength(0)
  })

  it('affiche un message quand aucune annonce n’est disponible', async () => {
    const wrapper = mountHome({ jobs: [] })
    await flushPromises()

    expect(wrapper.text()).toContain('Aucune annonce disponible.')
    expect(wrapper.findAll('article')).toHaveLength(0)
  })

  it('affiche une erreur quand le chargement des annonces échoue', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const wrapper = mountHome({ adsStatus: 500 })
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toBe('Impossible de charger les annonces.')
    expect(wrapper.text()).not.toContain('Chargement des annonces…')
    expect(wrapper.findAll('article')).toHaveLength(0)
  })
})
