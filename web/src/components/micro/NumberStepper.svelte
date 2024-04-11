<script lang="ts">
    import IconCaretLeft from '@components/icons/IconCaretLeft.svelte';
    import IconCaretRight from '@components/icons/IconCaretRight.svelte';
    import IconLock from '@components/icons/IconLock.svelte';
    import { IS_VALID } from '@stores/appearance';
    import { createEventDispatcher, onMount } from 'svelte';
    import { scale } from 'svelte/transition';
    const dispatch = createEventDispatcher();

    export let value: number = 0;
    export let total: number = 0;
    export let none: boolean = false;
    export let blacklist: number[] = null;

    export let isBlacklisted: boolean = false;

    $: {
        if (blacklist || blacklist === null) {
            checkBlacklist();
        }
    }

    function checkBlacklist() {
        if (!blacklist) {
            isBlacklisted = false;
        } else {
            console.log('blacklist', blacklist?.includes(value),  blacklist);
            isBlacklisted = blacklist?.includes(value);
        }

        IS_VALID.set(!isBlacklisted);
    }

    function increment() {
        if (value < total) {
            value += 1;
        } else if (value === total) {
            if (none === false) {
                value = 0;
            } else {
                value = -1;
            }
        }

        checkBlacklist();

        dispatch('increment');
        dispatch('change', value);
    }

    function decrement() {
        if (value > 0) {
            value -= 1;
        } else if (value === 0 && none === false) {
            value = total;
        } else if (value === 0 && none === true) {
            value = -1;
        } else if (value === -1) {
            value = total;
        }

        checkBlacklist();

        dispatch('decrement');
        dispatch('change', value);
    }
</script>

<div class="flex w-full h-[3vh] justify-center items-center gap-[0.5vh]">
    <button
        disabled={total === 0 || total === 1}
        on:click={decrement}
        class="btn h-full aspect-square grid place-items-center"
    >
        <IconCaretLeft />
    </button>

    <input
        disabled={total === 0 || total === 1}
        type="number"
        class="w-full relative h-full"
        bind:value
    />

    {#if isBlacklisted}
        <div
            transition:scale
            class="absolute opacity-75 grid place-items-center h-[2vh] -translate-y-[3vh] animate-pulse"
        >
            <IconLock />
        </div>
    {/if}

    <button
        disabled={total === 0 || total === 1}
        on:click={increment}
        class="btn h-full aspect-square grid place-items-center"
    >
        <IconCaretRight />
    </button>
</div>
