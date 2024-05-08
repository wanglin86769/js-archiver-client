import {createRouter, createWebHistory} from 'vue-router';


const routes = [
	{
		path: '/',
		name: 'home',
		component: () => import('./components/Home.vue')
	},
    {
        path: '/pvlist',
        name: 'pvlist',
        component: () => import('./components/PVList.vue'),
    },
    {
        path: '/pvinfo',
        name: 'pvinfo',
        component: () => import('./components/PVInfo.vue'),
    },
	{
		path: '/about',
		name: 'about',
		component: () => import('./components/About.vue')
	},
    {
        path: "/:catchAll(.*)",
        name: 'notfound',
        component: () => import('./components/NotFound.vue')
    },
];

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
    routes: routes
});


export default router;