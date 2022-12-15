import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import AggregateView from '../views/AggregateView.vue'
import HelpView from '../views/HelpView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    component: AboutView
  },
  {
    path: '/aggregate',
    name: 'aggregate',
    component: AggregateView
  },
  {
    path: '/help',
    name: 'help',
    component: HelpView
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
