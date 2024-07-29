<script lang="ts">
    import { Send } from '@enums/events';
    import { SendEvent } from '@utils/eventsHandlers';
    import Hexagon from './micro/Hexagon.svelte';
    import IconCaretDown from './icons/IconCaretDown.svelte';
    import IconCaretUp from './icons/IconCaretUp.svelte';
    import { scale } from 'svelte/transition';
    import IconWholeBody from './icons/IconWholeBody.svelte';
    import IconHead from './icons/IconHead.svelte';
    import IconUpper from './icons/IconUpper.svelte';
    import IconLower from './icons/IconLower.svelte';
    import IconFeet from './icons/IconFeet.svelte';

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
            transition:scale|global={{ delay: 1000 }}
            on:click={() => setLevel('up')}
            class="w-full active:scale-95 h-full grid place-items-center hover:scale-105 duration-150 cursor-pointer"
        >
            <Hexagon active={false} strokeWidth="1vh" />
            <div class="w-[2vh] h-fit absolute grid place-items-center">
                <IconCaretUp />
            </div>
        </button>

        <div
        transition:scale|global={{ delay: 1100 }}
            class="w-[6vh] absolute translate-x-[85%] h-full grid place-items-center cursor-default"
        >
            <Hexagon active={false} />
            {#key level}
                <div
                    transition:scale={{ duration: 100 }}
                    class="w-full h-full absolute grid place-items-center"
                >
                    {#if level === 'whole'}
                        <IconWholeBody />
                    {:else if level === 'head'}
                        <IconHead />
                    {:else if level === 'torso'}
                        <IconUpper />
                    {:else if level === 'legs'}
                        <IconLower />
                    {:else if level === 'shoes'}
                        <IconFeet />
                    {/if}
                </div>
            {/key}
        </div>

        <button
        transition:scale|global={{ delay: 1050 }}
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
