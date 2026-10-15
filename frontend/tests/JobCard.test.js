import { afterEach, describe, expect, it, vi } from 'vitest'
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import JobCard from '../src/components/JobCard.vue'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))
vi.mock('vue-router', () => ({ useRouter: () => ({ push }) }))

enableAutoUnmount(afterEach)
afterEach(() => push.mockReset())

const details = {
  full_description: 'Construire une application Vue',
  wages: '3200.00',
  working_time: '35 h',
  advantages: null,
  diploma_needed: null,
}

function mountCard({ applied = false, appliedStatus = 200, detailsStatus = 200, sessionStatus = 200 } = {}) {
  const fetchMock = vi.fn(async url => {
    if (url === '/api/ads/42/applied') {
      return { ok: appliedStatus === 200, status: appliedStatus, json: async () => ({ applied }) }
    }
    if (url === '/api/ads/42/details') {
      return { ok: detailsStatus === 200, status: detailsStatus, json: async () => details }
    }
    if (url === '/api/me') {
      return { ok: sessionStatus === 200, status: sessionStatus }
    }
    throw new Error(`Requête inattendue : ${url}`)
  })
  vi.stubGlobal('fetch', fetchMock)

  const wrapper = mount(JobCard, {
    props: {
      id: 42,
      title: 'Développeur Vue',
      name_company: 'Alpha',
      place: 'Nancy',
      one_sentence_description: 'Rejoignez notre équipe',
    },
  })
  return { wrapper, fetchMock }
}

describe('JobCard', () => {
  it('affiche les informations de l’annonce et attend la vérification avant de permettre de postuler', async () => {
    const { wrapper } = mountCard()
    expect(wrapper.get('h2').text()).toBe('Développeur Vue')
    expect(wrapper.text()).toContain('Alpha')
    expect(wrapper.text()).toContain('Nancy')
    expect(wrapper.text()).toContain('Rejoignez notre équipe')
    expect(wrapper.get('button').element.disabled).toBe(true)

    await flushPromises()
    expect(wrapper.get('button').text()).toBe('Apply')
    expect(wrapper.get('button').element.disabled).toBe(false)
  })

  it('charge les détails une seule fois puis les réutilise après fermeture', async () => {
    const { wrapper, fetchMock } = mountCard()
    await flushPromises()
    const toggle = wrapper.get('button[aria-expanded]')

    await toggle.trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain(details.full_description)
    expect(toggle.attributes('aria-expanded')).toBe('true')

    await toggle.trigger('click')
    expect(wrapper.text()).not.toContain(details.full_description)
    expect(toggle.attributes('aria-expanded')).toBe('false')

    await toggle.trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain(details.full_description)
    expect(fetchMock.mock.calls.filter(([url]) => url === '/api/ads/42/details')).toHaveLength(1)
  })

  it('remplace le bouton pour une annonce à laquelle on a déjà postulé', async () => {
    const { wrapper } = mountCard({ applied: true })
    await flushPromises()

    expect(wrapper.text()).toContain('Déjà postulé')
    expect(wrapper.findAll('button').map(button => button.text())).toEqual(['Learn more'])
    expect(push).not.toHaveBeenCalled()
  })

  it('désactive la candidature quand sa vérification échoue', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { wrapper, fetchMock } = mountCard({ appliedStatus: 500 })
    await flushPromises()

    expect(wrapper.get('button').text()).toBe('Indisponible')
    expect(wrapper.get('button').element.disabled).toBe(true)
    await wrapper.get('button').trigger('click')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(push).not.toHaveBeenCalled()
  })

  it('redirige un visiteur vers la connexion lorsqu’il veut postuler', async () => {
    const { wrapper } = mountCard({ appliedStatus: 401, sessionStatus: 401 })
    await flushPromises()
    expect(wrapper.get('button').element.disabled).toBe(false)

    await wrapper.get('button').trigger('click')
    await flushPromises()
    expect(push).toHaveBeenCalledExactlyOnceWith('/login')
  })

  it('affiche une alerte lorsque les détails ne peuvent pas être chargés', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { wrapper } = mountCard({ detailsStatus: 500 })
    await flushPromises()

    await wrapper.get('button[aria-expanded]').trigger('click')
    await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toBe("Impossible de charger les détails de l'annonce.")
    expect(wrapper.get('button[aria-expanded]').element.disabled).toBe(false)
    expect(wrapper.get('button[aria-expanded]').attributes('aria-expanded')).toBe('false')
  })
})
