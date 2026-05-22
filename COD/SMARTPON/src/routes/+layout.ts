import { authStore } from "@services/auth-store.svelte";



export const prerender = true;
export const ssr = false;


export const load = async () => 
{
    await authStore.init();
};