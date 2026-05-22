<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import AccessButton from "@components/access-button.svelte";
    import ErrorBanner from "@components/error-banner.svelte";
    import LocationSelector from "@components/location-selector.svelte";
    import TopbarAccess from "@components/topbar-access.svelte";
    import AccesDirection from "@components/acces-direction.svelte";
    import { bluetoothService } from "@services/bluetooth-service";
    import { Preferences } from "@capacitor/preferences";

    
    let has_server_connection = $state(false)
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
     * Trigger access request based on the state of the door button.
     * @param action
     */
    async function sendAccessRequest(action: 'lock' | 'unlock') 
    {
        try {
            const response = await bluetoothService.sendAccessRequest({
                code: 'placeholder_code',
                action
            })

            if (response.request_status === 'success') 
            {
                door_state = response.door_status === 'unlocked' ? 2 : 0
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
     * Try connecting to the ESP, first in silent mode then with a dialog.
     */
    async function tryConnect() 
    {
        const connected = await bluetoothService.connectSilent()
        
        if (connected) 
        {
            has_EPS_connection = true
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
    }


    /**
     * Check the Bluetooth availability, then try connect and keep checking the connection
     * every 2.5 seconds.
    */
    onMount(async () => 
    {
        is_bluetooth_available = await bluetoothService.isAvailable()

        if (!is_bluetooth_available) return

        await tryConnect()

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
    {#if !has_EPS_connection}
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
                <LocationSelector />
            {:else}
                <AccesDirection />
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
</style>