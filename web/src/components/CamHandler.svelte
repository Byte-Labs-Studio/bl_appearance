<script lang="ts">
    import { Send } from '@enums/events';
    import { SendEvent } from '@utils/eventsHandlers';
    import Hexagon from './micro/Hexagon.svelte';
    import IconCaretDown from './icons/IconCaretDown.svelte';
    import IconCaretUp from './icons/IconCaretUp.svelte';
    import { scale } from 'svelte/transition';
    import IconHead from './icons/IconHead.svelte';
    import IconPerson from './icons/IconPerson.svelte';
    import IconShirt from './icons/IconShirt.svelte';
    import IconPants from './icons/IconPants.svelte';
    import IconShoe from './icons/IconShoe.svelte';

    export let radius: number;

    let levels: string[] = ['whole', 'head', 'torso', 'legs', 'shoes'];

    let currentLevel: number = 0;
    let level: string = levels[currentLevel];

    let isMouseDown = false;

    let moveHandler = (e: MouseEvent) => {
        if (!isMouseDown) return;
        let moveX = e.movementX;
        let moveY = e.movementY;
        let x = moveX / 8;
        let y = moveY / 8;
        SendEvent(Send.camMove, { x: x, y: y });
    };

    let scrollHandler = (e: WheelEvent) => {
        console.log(e.deltaY);
        let y = e.deltaY > 0 ? 'down' : 'up';
        SendEvent(Send.camZoom, y);
    };

    function setLevel(type: 'up' | 'down') {
        if (type === 'down') {
            currentLevel = (currentLevel + 1) % levels.length;
        } else {
            currentLevel = (currentLevel - 1 + levels.length) % levels.length;
        }

        level = levels[currentLevel];

        SendEvent(Send.camSection, level);
    }
</script>

<svelte:window
    on:mousemove={moveHandler}
    on:mouseup={() => (isMouseDown = false)}
/>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
    style="height: {radius}%;"
    class={`aspect-square border-[0.25vh]  border-primary/20 transition-transform duration-150 rounded-full cursor-grab active:cursor-grabbing absolute -z-10 left-1/2 -translate-x-1/2 -translate-y-1/2 top-1/2`}
    on:mousedown={() => (isMouseDown = true)}
    on:wheel={scrollHandler}
>
    <div
        class="absolute left-0 top-1/2 -translate-x-1/2 h-fit w-[5vh] flex flex-col items-center justify-center"
    >
        <button
            on:click={() => setLevel('up')}
            class="w-full active:scale-95 h-full grid place-items-center hover:scale-105 duration-150 cursor-pointer"
        >
            <Hexagon active={false} strokeWidth="1vh" />
            <div class="w-[2vh] h-fit absolute grid place-items-center">
                <IconCaretUp />
            </div>
        </button>

        <div
            class="w-[6vh] absolute translate-x-[85%] h-full grid place-items-center cursor-default"
        >
            <Hexagon active={false} />
            {#key level}
                <div
                    transition:scale={{ duration: 100 }}
                    class="w-full h-full absolute grid place-items-center"
                >
                    {#if level === 'whole'}
                        <IconPerson />
                    {:else if level === 'head'}
                        <IconHead />
                    {:else if level === 'torso'}
                        <IconShirt />
                    {:else if level === 'legs'}
                        <IconPants />
                    {:else if level === 'shoes'}
                        <IconShoe />
                    {/if}
                </div>
            {/key}
        </div>

        <button
            on:click={() => setLevel('down')}
            class="w-full overflow-hidden active:scale-95 h-full grid place-items-center hover:scale-105 duration-150 cursor-pointer"
        >
            <Hexagon active={false} strokeWidth="1vh" />
            <div class="w-[2vh] h-fit absolute grid place-items-center">
                <IconCaretDown />
            </div>
        </button>
    </div>
</div>
