<script lang="ts">
    import { onMount } from 'svelte';
    import { fade, fly, scale } from 'svelte/transition';
    import Divider from './micro/Divider.svelte';
    import { SELECTED_TAB, LOCALE } from '@stores/appearance';

    let showContent: boolean = false;

    onMount(() => {
        setTimeout(() => {
            showContent = true;
        }, 1250);

        const unsubscribe = SELECTED_TAB.subscribe(async tab => {
            if (tab?.icon) {
                const res = await import(`./icons/${tab.icon}.svelte`);
                icon = res.default;
            }
        });

        return () => {
            unsubscribe();
        };
    });

    let icon = null;

    function getIconComponent() {
        return icon;
    }
</script>

{#if $SELECTED_TAB}
    {@const { id, label, icon, src } = $SELECTED_TAB}
    <div
        class="w-[40vh] h-screen right-0 top-0 absolute flex flex-col items-end justify-start pr-[2vh] pt-[2vh]"
    >
        <span
            out:fade
            class="flex scale-x items-center justify-center uppercase font-bold text-[3vh] whitespace-nowrap w-full"
        >
            <p class="w-full flex items-center justify-end">
                {#key id}
                    <p class="absolute" transition:fly={{ x: 100 }}>
                        {label} &#8205;
                    </p>
                {/key}
            </p>
            <p class="text-accent">{$LOCALE.MENU_TITLE}</p>

            <div class="w-[10vh] h-[3vh] grid place-items-center pl-[1vh]">
                {#key id}
                    <div transition:fly={{ x: 50 }} class="absolute">
                        {#if icon}
                            <svelte:component this={getIconComponent()} />
                        {/if}
                    </div>
                {/key}
            </div>
        </span>

        <Divider />

        <div class="w-full h-full grid place-items-center">
            {#if showContent}
                {#key id}
                    <div
                        transition:fly|global={{ x: 100, duration: 500 }}
                        class="flex flex-col items-center justify-start w-full h-[90%] absolute gap-[1vh] overflow-auto pr-[1vh]"
                    >
                        {#await import(`./menu/${src}.svelte`) then { default: Menu }}
                            <Menu />
                        {/await}
                    </div>
                {/key}
            {/if}
        </div>
    </div>
{/if}

<style>
    .scale-x {
        animation: scale-x 1s forwards cubic-bezier(0.19, 1, 0.22, 1);
        animation-delay: 1s;
        opacity: 0;
    }

    @keyframes scale-x {
        0% {
            opacity: 1;
            transform: scaleX(0);
        }
        100% {
            opacity: 1;
            transform: scaleX(1);
        }
    }
</style>
