<script lang="ts">
    import { CONFIG, IS_BROWSER } from './stores/stores';
    import { InitialiseListen } from '@utils/listeners';
    import Visibility from '@providers/Visibility.svelte';
    import Nav from '@components/Nav.svelte';
    import { fade } from 'svelte/transition';
    import Menu from '@components/Menu.svelte';
    import CamHandler from '@components/CamHandler.svelte';

    CONFIG.set({
        fallbackResourceName: 'debug',
        allowEscapeKey: true,
    });

    InitialiseListen();

    const radius = 95;
</script>

<Visibility>
    <div
        class="w-screen h-screen absolute top-0 left-0 radial-background grid place-items-center -z-50"
        transition:fade
    >
        <!-- <div
            transition:fade|global
            style="height: {radius}%;"
            class="absolute aspect-square border-[0.25vh] border-primary/20 rounded-full pointer-events-none -z-50"
        /> -->

        <Nav />
        <Menu />
        <CamHandler {radius} />
    </div>
</Visibility>

{#if import.meta.env.DEV}
    {#if $IS_BROWSER}
        {#await import('./providers/Debug.svelte') then { default: Debug }}
            <Debug />
        {/await}
    {/if}
{/if}

<style>
    .radial-background {
        background: red;
        background: radial-gradient(
            circle,
            rgba(241, 230, 219, 0) 0%,
            rgba(0, 0, 0, 0.42) 40%,
            rgba(0, 0, 0, 0.65) 50%
        );
    }
</style>
