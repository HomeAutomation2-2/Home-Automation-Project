import { authStore } from './auth-store.svelte'



async function apiFetch(endpoint: string, options: RequestInit = {}, authenticated: boolean = true): Promise<Response> 
{
    const token = authStore.token
    const url = authStore.server_url

    if (!url) 
        throw new Error('Server URL not set')

    const headers = {
        'Content-Type': 'application/json',
        ...(authenticated && token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    }

    const response = await fetch(`${url}${endpoint}`, {
        ...options,
        headers,
    })

    if (response.status === 401) 
    {
        authStore.logout()
        throw new Error('Session expired')
    }

    return response
}


export const api = {
    get: (endpoint: string) => apiFetch(endpoint),

    post: (endpoint: string, body: unknown) => 
        apiFetch(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
        }),

    publicPost: (endpoint: string, body: unknown) => 
        apiFetch(endpoint, { method: 'POST', body: JSON.stringify(body) }, false),

    patch: (endpoint: string, body: unknown) => 
        apiFetch(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(body),
        }),

    delete: (endpoint: string) => 
        apiFetch(endpoint, { method: 'DELETE' }),
}