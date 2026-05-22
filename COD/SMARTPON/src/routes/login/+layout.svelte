<script lang="ts">
    import { LoginController } from '@controllers/login.controller.svelte';
    import { setContext } from 'svelte';


    let { children } = $props()

    const login_controller = new LoginController()
    setContext("login-controller", login_controller)
</script>


{@render children()}