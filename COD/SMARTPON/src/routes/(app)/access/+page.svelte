<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import AccessButton from "@components/access-button.svelte";
    import ErrorBanner from "@components/error-banner.svelte";
    import LocationSelector from "@components/location-selector.svelte";
    import TopbarAccess from "@components/topbar-access.svelte";
    import AccesDirection from "@components/acces-direction.svelte";
    import { bluetoothService } from "@services/bluetooth-service";
    import { Preferences } from "@capacitor/preferences";
    import { accessService } from "@services/access-service";
    import { authStore } from "@services/auth-store.svelte";
    import { api } from "@services/api";

    
    let loading = $state(true)
    let loading_message = $state("Loading...")

    let has_server_connection = $state(true)
    let has_EPS_connection = $state(false)
    let door_state = $state(0)
    let is_bluetooth_available = $state(true)
    let polling: ReturnType<typeof setInterval>
    let is_door_locked: boolean|undefined = $derived.by( () => 
    {
        if (!has_EPS_connection) return undefined

        if (door_state === 3) return undefined
        
        return door_state !== 2
    })

    let direction = $state(authStore.is_home ? 1 : 0) // 0 = coming, 1 = leaving
    let direction_initialized = false
    let location = $state(authStore.is_home ? 0 : 1) // 0 = away, 1 = home
    let location_initialized = false
    let skip_direction_effect = false
    let skip_location_effect = false

    $effect( () => 
    {
        direction
        
        if (!direction_initialized) 
        { 
            direction_initialized = true
            return 
        }

        if (skip_direction_effect)
        { 
            skip_direction_effect = false
            return 
        }

        accessService.correctEvent(direction === 0 ? 'in' : 'out')
        
        skip_location_effect = true
        location = direction === 0 ? 0 : 1
    })

    $effect( () => 
    {
        location

        if (!location_initialized) 
        { 
            location_initialized = true
            return 
        }

        if (skip_location_effect)
        { 
            skip_location_effect = false
            return 
        }

        api.patch('/users/me/location', { is_home: location === 0 })
        authStore.setIsHome(location === 0)
    })



    /**
     * Trigger access request based on the state of the door button.
     * @param action
     */
    async function sendAccessRequest(action: 'lock' | 'unlock') 
    {
        try {
            console.log(`trying to trigger door ${action} with token ${authStore.bt_code}`)
            
            const response = await bluetoothService.sendAccessRequest({
                code: authStore.bt_code,
                action
            })

            if (response.request_status === 'success') 
            {
                door_state = response.door_status === 'unlocked' ? 2 : 0

                if (action === 'unlock') 
                {
                    // what the user is about to do = inverse of current state
                    const defaultDirection: 'in' | 'out' = authStore.is_home ? 'out' : 'in'
                    
                    skip_direction_effect = true
                    direction = defaultDirection === 'in' ? 0 : 1

                    console.log(`default direction: ${defaultDirection}`)
                    console.log(`direction: ${direction}`)

                    await accessService.saveEvent(defaultDirection)
                    // authStore.is_home is now flipped by saveEvent
                } 
                else 
                {
                    const isHome = direction === 0
                    
                    skip_location_effect = true
                    location = isHome ? 0 : 1

                    authStore.setIsHome(isHome)
                    accessService.updateLastEventId(null)
                }
            }
            else 
            {
                door_state = 3
            }
        } 
        catch(e) {
            door_state = 3
        }
    }


    /**
     * Watch the state of the door button for changes.
    */
    $effect( () => 
    {
        if (door_state === 1 || door_state === 4) 
        {
            sendAccessRequest(door_state === 1 ? 'unlock' : 'lock')
        }
    })


    /**
     * Try connecting to the ESP, first in silent mode then with a dialog.
     */
    async function tryConnect() 
    {
        const connected = await bluetoothService.connectSilent()
        
        if (connected) 
        {
            has_EPS_connection = true
            loading = false
            return
        }

        const saved = await Preferences.get({ key: 'ble_device_id' })

        if (!saved.value) 
        {
            try {
                await bluetoothService.connectWithDialog()
                has_EPS_connection = true
            } 
            catch(e) {
                has_EPS_connection = false
            }
        } 
        else 
        {
            has_EPS_connection = false
        }

        loading = false
    }


    /**
     * Check the Bluetooth availability, then try connect and keep checking the connection
     * every 2.5 seconds.
    */
    onMount(async () => 
    {
        loading_message = "Checking BT availability..."
        is_bluetooth_available = await bluetoothService.isAvailable()
        
        if (!is_bluetooth_available) 
        {
            loading = false;
            return
        }

        loading_message = "Connecting to lock..."
        await tryConnect()
        await accessService.syncPendingEvents()

        polling = setInterval(async () => 
        {
            if (!bluetoothService.isConnected()) 
            {
                await tryConnect()
            }
        }, 2500)
    })


    /**
     * Disconnect from Bluetooth on page unload.
    */
    onDestroy(async () => 
    {
        clearInterval(polling)
        await bluetoothService.disconnect()
    })
</script>




<TopbarAccess 
    is_locked={is_door_locked}
/>

{#if !has_server_connection}
    <ErrorBanner 
        message="Can’t contact to server. Functionality is limited."
    />
{/if}


<div class="wrapper">
    {#if loading}
        <div class="while-loading">
            <span>{loading_message}</span>
            <div class="spinner"></div>
        </div>
    {:else if !has_EPS_connection}
        <div class="error-message">
            <span class="title">Door connection failed!</span>
            <div class="error-info">
                <span>The app cannot connect to the door.</span>
                <span>This can happen if your device is not in range of the door. You can try getting closer. Connection will be retried in </span>
            </div>
        </div>
    {:else if is_bluetooth_available}
        <div class="date-time">
            <span class="time">15:33</span>
            <span class="date">28 Apr 2026</span>
        </div>

        <div class="access-button-wrapper">
            <AccessButton bind:state={door_state}/>
        </div>
        
        <div class="indicator-wrapper">
            <span>You are now:</span>
            {#if door_state !== 2}
                <LocationSelector 
                    bind:location={location}
                />
            {:else}
                <AccesDirection 
                    bind:direction={direction} 
                />
            {/if}
        </div>
    {:else}
        <div class="error-message">
            <span class="title">BT unavailable!</span>
            <div class="error-info">
                <span>The app cannot access Bluetooth.</span>
                <span>This can happen if your device does not have a module, it is disabled or the app does not have the required permissions.</span>
            </div>
        </div>
    {/if}
</div>


<style>
    .wrapper {
        display: flex;
        flex-direction: column;
		justify-content: space-evenly;
        flex: 1;
    }
    .date-time {
        display: flex;
        flex-direction: column;
        color: var(--text-secondary);
        align-items: center;

        & .time { font-size: 4rem; }

        & .date { font-size: 1.15rem; }
    }

    .access-button-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 15%;
    }

    .indicator-wrapper {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 0 15%;

        & span {
            text-align: center;
            color: var(--text-secondary);
        }
    }

    .error-message {
        display: flex;
        flex-direction: column;
        gap: 32px;
        padding: 0 24px;

        & .title {
            font-size: 2rem;
            font-weight: 500;
            text-align: center;
        }
    }

    .error-info {
        display: flex;
        flex-direction: column;
        gap: 8px;
        text-align: center;
        color: var(--text-secondary);
    }

    .while-loading {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-size: large;

        & .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid var(--text-primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 20px auto;
        }
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
</style>