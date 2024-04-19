<script lang="ts">
    import { onMount } from 'svelte';
    import Hexagon from './micro/Hexagon.svelte';
    import { tweened } from 'svelte/motion';
    import { cubicInOut } from 'svelte/easing';
    import { fade, scale } from 'svelte/transition';
    import {
        IS_VALID,
        SELECTED_TAB,
        TABS,
        LOCALE,
        ALLOW_EXIT,
        ORIGINAL_APPEARANCE,
        APPEARANCE,
        TOGGLES,
    } from '@stores/appearance';
    import IconCancel from './icons/IconCancel.svelte';
    import IconSave from './icons/IconSave.svelte';
    import { SendEvent } from '@utils/eventsHandlers';
    import { Send } from '@enums/events';
    import IconLock from './icons/IconLock.svelte';

    const centerX = -5;

    const degToRad = (deg: number) => {
        return deg * (Math.PI / 180);
    };
    let isValid: boolean = true;

    let limit = tweened(0);

    const pointIcon = (centerX, centerY, radius, angle, limit) => {
        angle = angle + limit / 2 + limit;
        const radians = degToRad(angle);
        const x = centerX + radius * Math.cos(radians);
        const y = centerY + radius * Math.sin(radians);
        return [x.toPrecision(5), y.toPrecision(5)];
    };

    $: pieAngle =
        $limit / ($TABS.length < 4 ? 4 : $TABS.length > 8 ? 8 : $TABS.length);
    $: {
        isValid = true;
        for (const key in $IS_VALID) {
            const value = $IS_VALID[key];
            if (!value) {
                isValid = false;
                break;
            }
        }
    }

    const innerSize = 120;

    const innerRadius = innerSize / 2;

    onMount(() => {
        setTimeout(() => {
            limit.set(90, { duration: 1000, easing: cubicInOut });
        }, 250);
    });

    let modal: 'close' | 'save' = null;

    // 'hat',
    //     'mask',
    //     'glasses',
    //     'shirt',
    //     'jacket',
    //     'vest',
    //     'pants',
    //     'shoes',

    const toggleOrder = [
        {
            id: 'hats',
            type: 'props',
        },
        {
            id: 'masks',
            type: 'drawables',
        },
        {
            id: 'glasses',
            type: 'props',
        },
        {
            id: 'shirts',
            type: 'drawables',
        },
        {
            id: 'jackets',
            type: 'drawables',
        },
        {
            id: 'vest',
            type: 'drawables',
        },
        {
            id: 'legs',
            type: 'drawables',
        },
        {
            id: 'shoes',
            type: 'drawables',
        },

    ]
</script>

<nav class=" relative z-[9999 w-fit h-fit rounded-full">
    {#each $TABS as tab, index (tab.id)}
        {@const selected = $SELECTED_TAB?.id === tab.id}
        <button
            on:click={() => {
                if (selected) return;
                SELECTED_TAB.set(tab);
            }}
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

<div
    class="absolute left-[2vh] bottom-[2vh] flex flex-col items-center justify-center"
>
    {#if $ALLOW_EXIT}
        <button
            transition:scale|global={{ delay: 1250 }}
            class="w-[5vh] aspect-square grid place-items-center overflow-visible translate-x-[120%] translate-y-[80%]"
            on:click={() => {
                modal = 'close';
            }}
        >
            <div
                class="w-full h-full grid place-items-center hover:scale-105 duration-150"
            >
                <Hexagon active={false} variant="error" strokeWidth="1vh" />
                <div class="w-[2vh] h-full absolute grid place-items-center">
                    <IconCancel />
                </div>
            </div>
        </button>
    {/if}
    <button
        transition:scale|global={{ delay: 1000 }}
        class="w-[10vh] aspect-square grid place-items-center overflow-visible"
        on:click={() => {
            modal = 'save';
        }}
    >
        <div
            class="w-full h-full grid place-items-center hover:scale-105 duration-150"
        >
            <Hexagon active={false} variant="success" />
            <div class="w-[5vh] h-full absolute grid place-items-center">
                {#if isValid}
                    <IconSave />
                {:else}
                    <IconLock />
                {/if}
            </div>
        </div>
    </button>
</div>

<div class="w-[7vh]  left-[3vh] absolute  h-full flex flex-col gap-[1vh] items-center justify-center -z-30">
    {#each toggleOrder as {id, type}, i}
        {@const toggle = $TOGGLES[id]}
        {@const icon = `Icon${id.charAt(0).toUpperCase() + id.slice(1)}`}
        <button
            on:click={() => {
                const data = $APPEARANCE[type][id];
                if (data) {
                    TOGGLES.toggle(id, !toggle, data)
                }
                
            }}
            transition:scale|global={{ duration: 750 }}
            class="h-[7vh] w-full grid place-items-center origin-center cursor-pointer "
        >
            <div
                class="w-full h-full grid place-items-center  origin-center hover:scale-105 duration-150"
            > 
                <Hexagon active={toggle} />
                <div class="w-2/3 h-fit grid absolute place-items-center fill-white">
                    {#await import(`./icons/${icon}.svelte`) then { default: Icon }}
                        <Icon />
                    {/await}
                </div>
            </div>
        </button>
    {/each}
</div>

{#if modal}
    <div
        transition:fade
        class="absolute w-full h-full grid place-items-center bg-black/50 z-50"
    >
        <div
            transition:scale|global
            class="max-w-[50vh] w-fit min-w-[30vh] h-fit btn drop-shadow gap-[2vh] flex flex-col items-center justify-center p-[0.5vh] px-[2vh]"
        >
            <div class="w-full h-fit grid place-items-center">
                <h1 class="text-[2vh] font-semibold uppercase">
                    {#if isValid || modal === 'close'}
                        {modal === 'close'
                            ? $LOCALE.CLOSE_TITLE
                            : $LOCALE.SAVE_TITLE}
                    {:else}
                        {$LOCALE.LOCKED_TITLE}
                    {/if}
                </h1>
            </div>
            <div class="w-full h-fit grid place-items-center">
                <p class="text-[1.5vh] opacity-75 text-center">
                    {#if isValid || modal === 'close'}
                        {$LOCALE.CLOSE_SUBTITLE}
                        {modal === 'close'
                            ? $LOCALE.CLOSELOSE_SUBTITLE
                            : $LOCALE.SAVEAPPLY_SUBTITLE}
                        {$LOCALE.CLOSE2_SUBTITLE}
                    {:else}
                        {$LOCALE.CANT_SAVE}
                    {/if}
                </p>
            </div>
            <div
                class="w-full h-[5vh] flex items-center justify-center gap-[2vh]"
            >
                <button
                    class="btn w-[10vh] h-[5vh] grid place-items-center"
                    on:click={() => {
                        modal = null;
                    }}
                >
                    <p>
                        {#if isValid || modal === 'close'}
                            {$LOCALE.CANCEL_TITLE}
                        {:else}
                            {$LOCALE.OK_TITLE}
                        {/if}
                    </p>
                </button>
                {#if (isValid || modal === 'close')}
                    <button
                        class="btn w-[10vh] h-[5vh] grid place-items-center"
                        on:click={() => {
                            // SendEvent(Send.close, {
                            //     save: modal === 'save',
                            //     original: modal === 'close' ? $ORIGINAL_APPEARANCE : $APPEARANCE,
                            // });

                            if (modal === 'save') {
                                SendEvent(Send.save, $APPEARANCE);
                            } else {
                                SendEvent(Send.cancel, $ORIGINAL_APPEARANCE);
                            }
                            modal = null;
                        }}
                    >
                        <p>
                            {modal === 'close'
                                ? $LOCALE.CLOSE_TITLE
                                : $LOCALE.SAVE_TITLE}
                        </p>
                    </button>
                {/if}
            </div>
        </div>
    </div>
{/if}

<style>
    .drop-shadow {
        filter: drop-shadow(0 0 0.25vh rgba(0, 0, 0, 1));
    }
</style>
