<script lang="ts">
    import IconCaretLeft from '@components/icons/IconCaretLeft.svelte';
    import IconCaretRight from '@components/icons/IconCaretRight.svelte';
    import IconLock from '@components/icons/IconLock.svelte';
    import { IS_VALID } from '@stores/appearance';
    import { createEventDispatcher, onMount } from 'svelte';
    import { scale } from 'svelte/transition';
    const dispatch = createEventDispatcher();

    export let list: any[] = [];
    export let index: number = 0;
    export let value: any = list[index];
    export let blacklist: string[] = null;

    export let isBlacklisted: boolean = false;

    export let display: string = '';

    $: total = list.length - 1;

    function checkBlacklist() {
        if (!blacklist) {
            isBlacklisted = false;
        } else {
            isBlacklisted = blacklist?.includes(value);
        }

        IS_VALID.set(!isBlacklisted);
    }

    function increment() {
        if (index < total) {
            index += 1;
        } else if (index === total) {
            index = 0;
        }
        console.log('after', index);

        value = list[index];

        checkBlacklist();

        dispatch('increment');
        dispatch('change', index);
    }

    function decrement() {
        if (index > 0) {
            index -= 1;
        } else if (index === 0) {
            index = total;
        }

        value = list[index];

        checkBlacklist();

        dispatch('decrement');
        dispatch('change', index);
    }
</script>

<div class="flex w-full h-[3vh] justify-center items-center gap-[0.5vh]">
    <button
        disabled={list.length === 0 || list.length === 1}
        on:click={decrement}
        class="btn h-full aspect-square grid place-items-center"
    >
        <IconCaretLeft />
    </button>

    <input
        type="text"
        disabled
        class=" w-full relative h-full"
        value={display}
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
        disabled={list.length === 0 || list.length === 1}
        on:click={increment}
        class="btn h-full aspect-square grid place-items-center"
    >
        <IconCaretRight />
    </button>
</div>
