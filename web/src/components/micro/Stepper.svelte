<script lang="ts">
    import IconCaretLeft from '@components/icons/IconCaretLeft.svelte';
    import IconCaretRight from '@components/icons/IconCaretRight.svelte';
    import { createEventDispatcher, onMount } from 'svelte';
    const dispatch = createEventDispatcher();

    export let list: any[] = [];
    export let index: number = 0;
    export let value: any = list[index];

    export let display: string = '';

    $: total = list.length - 1;

    function increment() {
        if (index < total) {
            index += 1;
        } else if (index === total) {
            index = 0;
        }
        console.log('after', index);

        value = list[index];

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

    <input type="text" disabled class=" w-full relative h-full" value={display} />

    <button
    disabled={list.length === 0 || list.length === 1}
        on:click={increment}
        class="btn h-full aspect-square grid place-items-center"
    >
        <IconCaretRight />
    </button>
</div>
