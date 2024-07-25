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
    import IconImport from '@components/icons/IconImport.svelte';
    import { SendEvent } from '@utils/eventsHandlers';

    $: outfits = $OUTFITS;

    let renameIndex: number = -1;
    let renameLabel: string = '';

    let deleteIndex: number = -1;

    let isAdding: boolean = false;
    let isImporting: boolean = false;
    let newOutfitLabel: string = '';
    let importOutfitId: number;
</script>

{#each outfits as { label, outfit, id }, i}
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
                            OUTFITS.share(id)
                        }}
                        class="btn w-full">{$LOCALE.SHAREOUTFIT_TITLE}</button
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
                                    OUTFITS.edit(outfits[i])
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
                                OUTFITS.delete(id)
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

    {:else if isImporting}
    <div 
    transition:slide
    class="w-full h-full">

        <Wrapper label={$LOCALE.IMPORTOUTFIT_TITLE}>
            <svelte:fragment slot="extra_primary">
                <div

                    class="w-full flex items-center justify-center gap-[0.5vh] h-[3vh]"
                >
                    <input
                        type="number"
                        class="w-full h-[3vh] p-[0.5vh] placeholder-gray-400"
                        placeholder="Outfit Code"
                        bind:value={importOutfitId}
                    />
                    <button
                        on:click={() => {
                            isImporting = false;
                            importOutfitId = null;
                        }}
                        class="btn h-full aspect-square p-[0.5vh]"
                    >
                        <IconCancel />
                    </button>
                    <button
                        on:click={() => {
                            if (importOutfitId > 0) {
                                OUTFITS.import(importOutfitId)
                                isImporting = false;
                                importOutfitId = null;
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

        <button
            transition:slide
            class="btn w-full h-[3vh] flex items-center justify-center gap-[0.5vh] mt-[0.5vh]"
            on:click={() => {
                isImporting = true;
            }}
        >
            <div class="h-[60%] aspect-square grid place-items-center">
                <IconImport />
            </div>

            <p>{$LOCALE.IMPORTOUTFIT_TITLE}</p>
        </button>
    {/if}
</div>
