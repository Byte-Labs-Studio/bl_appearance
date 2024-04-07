<script lang="ts">
    import type { TColors } from '@typings/apperance';
    import Dropdown from './Dropdown.svelte';
    import { createEventDispatcher, onMount } from 'svelte';

    const dispatch = createEventDispatcher();

    export let index: number = 0;
    export let value: TColors = null;

    export let colourType: 'hair' | 'eye' | 'makeup' = 'hair';
    export let display: string = '';

    let colours: TColors[] = [];

    onMount(async () => {
        const colourMap = {
            hair: 'HAIR_COLOURS',
            eye: 'EYE_COLOURS',
            makeup: 'MAKEUP_COLOURS',
        };


        if (colourMap.hasOwnProperty(colourType)) {
            colours = await import('./colours').then(
                module => module[colourMap[colourType]],
            );

            if (index === -1) {
                index = 0;
            }
            value = colours[index] || colours[0];
            display = value.label;
        }
    });
</script>

<Dropdown {display}>
    <div class="w-full h-fit grid grid-cols-6">
        {#each colours as { hex }, i (i)}
            <button
                on:click={() => {
                    if (i === index) return;
                    index = i;
                    value = colours[i];
                    display = value.label;
                    dispatch('change', value);
                }}
                class="aspect-square {i === index &&
                    'border-[0.5vh] border-white p-0'} transition-all duration-150 p-[0.5vh]"
            >
                <div
                    style="background-color: {hex};"
                    class="w-full h-full btn"
                ></div>
            </button>
        {/each}
    </div>
</Dropdown>
