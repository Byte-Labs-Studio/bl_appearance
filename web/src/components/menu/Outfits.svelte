<script lang="ts">
    import Wrapper from '@components/micro/Wrapper.svelte';
    import Dropdown from '@components/micro/Dropdown.svelte';
    import { Send } from '@enums/events';
    import Divider from '@components/micro/Divider.svelte';
    import { OUTFITS, LOCALE } from '@stores/appearance';
    import IconCancel from '@components/icons/IconCancel.svelte';
    import IconCheck from '@components/icons/IconCheck.svelte';
    import { slide } from 'svelte/transition';
    import IconPlus from '@components/icons/IconPlus.svelte';
    import { SendEvent } from '@utils/eventsHandlers';

    $: outfits = $OUTFITS;

    let renameIndex: number = -1;
    let renameLabel: string = '';

    let deleteIndex: number = -1;

    let isAdding: boolean = false;
    let newOutfitLabel: string = '';
</script>

{#each outfits as { label, outfit }, i}
    <Wrapper {label}>
        <svelte:fragment slot="extra_primary">
            <Dropdown display="Options">
                <div
                    class="w-full flex items-center justify-center gap-[0.5vh] h-[3vh]"
                >
                    <button
                        on:click={() => {
                            OUTFITS.use(outfit)
                        }}
                        class="btn w-full">{$LOCALE.USE_TITLE}</button
                    >
                    <button
                        on:click={() => {
                            renameIndex = i;
                            renameLabel = label;
                        }}
                        class="btn w-full">{$LOCALE.EDIT_TITLE}</button
                    >
                    <button
                        on:click={() => {
                            deleteIndex = i;
                        }}
                        class="btn h-full aspect-square p-[0.5vh]"
                    >
                        <IconCancel />
                    </button>
                </div>

                {#if renameIndex === i}
                    <div
                        transition:slide
                        class="w-full flex items-center justify-center gap-[0.5vh] h-[3vh]"
                    >
                        <input
                            type="text"
                            class="w-full h-[3vh] p-[0.5vh]"
                            bind:value={renameLabel}
                        />
                        <button
                            on:click={() => {
                                renameIndex = -1;
                            }}
                            class="btn h-full aspect-square p-[0.5vh]"
                        >
                            <IconCancel />
                        </button>
                        <button
                            on:click={() => {
                                if (renameLabel.length > 0) {
                                    outfits[i].label = renameLabel;
                                    renameIndex = -1;
                                    // EditOutfit({
                                    // 				renameLabel,
                                    // 				outfit,
                                    // 				id,
                                    // 			})
                                }
                            }}
                            class="btn h-full aspect-square p-[0.5vh]"
                        >
                            <IconCheck />
                        </button>
                    </div>
                {/if}

                {#if deleteIndex === i}
                    <div
                        transition:slide
                        class="flex items-center justify-center gap-[0.5vh] w-full h-full"
                    >
                        <button
                            class="btn w-full h-full"
                            on:click={() => (deleteIndex = -1)}>{$LOCALE.CANCEL_TITLE}</button
                        >

                        <button
                            class="btn w-full h-full"
                            on:click={() => {
                                // RemoveOutfit
                            }}>{$LOCALE.CONFIRMREM_SUBTITLE}</button
                        >
                    </div>
                {/if}
            </Dropdown>
        </svelte:fragment>

        <Divider />
    </Wrapper>
{:else}
    <Wrapper label={$LOCALE.NO_OUTFITS} />
{/each}

<div class="w-full h-fit grid place-items-centyer">
    {#if isAdding}
    <div 
    transition:slide
    class="w-full h-full">

        <Wrapper label={$LOCALE.NEWOUTFIT_TITLE}>
            <svelte:fragment slot="extra_primary">
                <div

                    class="w-full flex items-center justify-center gap-[0.5vh] h-[3vh]"
                >
                    <input
                        type="text"
                        class="w-full h-[3vh] p-[0.5vh]"
                        bind:value={newOutfitLabel}
                    />
                    <button
                        on:click={() => {
                            isAdding = false;
                            newOutfitLabel = '';
                        }}
                        class="btn h-full aspect-square p-[0.5vh]"
                    >
                        <IconCancel />
                    </button>
                    <button
                        on:click={() => {
                            if (newOutfitLabel.length > 0) {
                                OUTFITS.save(newOutfitLabel)
                                isAdding = false;
                                newOutfitLabel = '';
                            }
                        }}
                        class="btn h-full aspect-square p-[0.5vh]"
                    >
                        <IconCheck />
                    </button>
                </div>
            </svelte:fragment>
        </Wrapper>
                
    </div>
    {:else}
        <button
            transition:slide
            class="btn w-full h-[3vh] flex items-center justify-center gap-[0.5vh]"
            on:click={() => {
                isAdding = true;
            }}
        >
            <div class="h-[60%] aspect-square grid place-items-center">
                <IconPlus />
            </div>

            <p>{$LOCALE.ADDOUTFIT_TITLE}</p>
        </button>
    {/if}
</div>
