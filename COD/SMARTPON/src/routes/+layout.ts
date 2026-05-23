import { authStore } from "@services/auth-store.svelte";
import { userStore } from "@services/user-profile";



export const prerender = true;
export const ssr = false;


export const load = async () => 
{
    await authStore.init()
    await userStore.init()
};