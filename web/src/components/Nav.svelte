<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
    import Hexagon from './micro/Hexagon.svelte';
    import { tweened } from 'svelte/motion';
    import { cubicInOut } from 'svelte/easing';
    import { fade, scale } from 'svelte/transition';
    import { SELECTED_TAB, TABS } from '@stores/appearance';
    import IconCancel from './icons/IconCancel.svelte';
    import IconSave from './icons/IconSave.svelte';

    const centerX = -5;

    const degToRad = (deg: number) => {
        return deg * (Math.PI / 180);
    };

    //represents the maximum angle limit for the pie slice.
    let limit = tweened(0);

    const pointIcon = (centerX, centerY, radius, angle, limit) => {
        angle = angle + limit / 2 + limit;
        const radians = degToRad(angle);
        const x = centerX + radius * Math.cos(radians);
        const y = centerY + radius * Math.sin(radians);
        return [x.toPrecision(5), y.toPrecision(5)];
    };

    // the arc length of each slice
    $: pieAngle =
        $limit / ($TABS.length < 4 ? 4 : $TABS.length > 8 ? 8 : $TABS.length);

    // the radius of the inner circle that is cut out
    const innerSize = 120;

    // the radius of the inner circle that is cut out
    const innerRadius = innerSize / 2;

    onMount(() => {
        setTimeout(() => {
            limit.set(90, { duration: 1000, easing: cubicInOut });
        }, 250);
    });
</script>

<nav class=" relative z-[9999 w-fit h-fit rounded-full">
    {#each $TABS as tab, index (tab.id)}
        {@const selected = $SELECTED_TAB?.id === tab.id}
        <button
            on:click={() => {
                if (selected) return;
                SELECTED_TAB.set(tab)}}
            transition:scale|global={{ duration: 750 }}
            class="w-[10vh] h-[10vh] absolute grid place-items-center origin-center overflow-visible cursor-pointer"
            style="left:{pointIcon(
                centerX,
                centerX,
                innerRadius,
                pieAngle * (index + 1) - pieAngle / 2,
                $limit,
            )[0]}vh; top: {pointIcon(
                centerX,
                centerX,
                innerRadius,
                pieAngle * (index + 1) - pieAngle / 2,
                $limit,
            )[1]}vh;"
        >
            <div
                class="w-full h-full absolute grid place-items-center hover:scale-105 duration-150"
            >
                <Hexagon active={selected} />
                <div class="w-full h-full absolute grid place-items-center">
                    {#await import(`./icons/${tab.icon}.svelte`) then { default: Icon }}
                        <Icon />
                    {/await}
                </div>
            </div>
        </button>
    {/each}
</nav>

<div class="absolute left-[2vh] bottom-[2vh] flex flex-col items-center justify-center">
    <button 
    transition:scale|global={{ delay: 1250 }}
    class="w-[5vh] aspect-square grid place-items-center overflow-visible translate-x-[120%] translate-y-[80%]">
        <div
        class="w-full h-full grid place-items-center hover:scale-105 duration-150"
    >
        <Hexagon active={false} variant="error" strokeWidth="1vh" />
        <div class="w-[2vh] h-full absolute grid place-items-center">
            <IconCancel />
        </div>
    </div>
    </button>
    <button 
    transition:scale|global={{ delay: 1000 }}
    class="w-[10vh] aspect-square grid place-items-center overflow-visible">
        <div
        class="w-full h-full grid place-items-center hover:scale-105 duration-150"
    >
        <Hexagon active={false} variant="success" />
        <div class="w-[5vh] h-full absolute grid place-items-center">
            <IconSave />
        </div>
    </div>
    </button>
</div>