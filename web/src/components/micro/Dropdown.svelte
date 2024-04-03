<script context="module" lang="ts">
</script>

<script lang="ts">
    import IconCaretDown from '@components/icons/IconCaretDown.svelte';
    import IconCaretUp from '@components/icons/IconCaretUp.svelte';
    import { createEventDispatcher } from 'svelte';
    import { scale, slide } from 'svelte/transition';

    const dispatch = createEventDispatcher();

    export let display: string = '';

    let menuOpen: boolean = false;
</script>

<div class="flex flex-col items-center justify-center w-full gap-[0.5vh]">
    <div class="flex items-center justify-center gap-[0.5vh] h-[3vh] w-full">
        <input
            type="text"
            disabled
            class="w-full relative h-full"
            value={display}
        />
        <button
            on:click={() => {
                menuOpen = !menuOpen;
                dispatch('click', menuOpen);
            }}
            class="btn h-full aspect-square grid place-items-center"
        >
            {#key menuOpen}
                <div transition:scale class="grid place-items-center absolute">
                    {#if menuOpen}
                        <IconCaretUp />
                    {:else}
                        <IconCaretDown />
                    {/if}
                </div>
            {/key}
        </button>
    </div>

    {#if menuOpen}
        <div
            transition:slide|global
            class="w-full max-h-[30vh] bg-secondary/50 p-[0.5vh] flex items-center justify-start flex-col overflow-auto gap-[0.5vh]"
        >
            <slot />
        </div>
    {/if}
</div>
