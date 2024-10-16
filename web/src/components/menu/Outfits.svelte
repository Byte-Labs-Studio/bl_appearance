<script lang="ts">
    import Wrapper from '@components/micro/Wrapper.svelte';
    import Dropdown from '@components/micro/Dropdown.svelte';
    import Divider from '@components/micro/Divider.svelte';
    import { OUTFITS, LOCALE, JOBDATA } from '@stores/appearance';
    import IconCancel from '@components/icons/IconCancel.svelte';
    import IconCheck from '@components/icons/IconCheck.svelte';
    import { slide } from 'svelte/transition';
    import IconPlus from '@components/icons/IconPlus.svelte';
    import IconImport from '@components/icons/IconImport.svelte';

    let renameIndex: number = -1;
    let renameLabel: string = '';
    let deleteIndex: number = -1;
    let isAdding: boolean = false;
    let isJobAdding: boolean = false;
    let isImporting: boolean = false;
    let newOutfitLabel: string = '';
    let newOutfitJobRank: number = 0;
    let importOutfitId: number;

    const handleRename = (index: number) => {
        if (renameLabel.length > 0) {
            $OUTFITS[index].label = renameLabel;
            renameIndex = -1;
            OUTFITS.edit($OUTFITS[index]);
        }
    };

    const handleOutfitAction = (
        action: string,
        index: number,
        outfit = null,
    ) => {
        switch (action) {
            case 'use':
                OUTFITS.use(outfit);
                break;
            case 'share':
                OUTFITS.share(index);
                break;
            case 'item':
                OUTFITS.item(outfit, renameLabel);
                break;
            case 'delete':
                OUTFITS.delete(index);
                break;
        }
    };

    const resetNewOutfitFields = () => {
        isAdding = false;
        isJobAdding = false;
        newOutfitLabel = '';
        newOutfitJobRank = 0;
    };

    const resetImportFields = () => {
        isImporting = false;
        importOutfitId = null;
    };
</script>

{#each $OUTFITS as { label, outfit, id, jobname }, i}
    <Wrapper label={jobname ? `${label} | JOB` : label}>
        <svelte:fragment slot="extra_primary">
            <Dropdown display="Options">
                <div
                    class="w-full flex items-center justify-center gap-[0.5vh] h-[3vh]"
                >
                    <button
                        on:click={() => handleOutfitAction('use', outfit)}
                        class="btn w-full">{$LOCALE.USE_TITLE}</button
                    >
                    <button
                        disabled={jobname != null && !$JOBDATA.isBoss}
                        on:click={() => {
                            renameIndex = i;
                            renameLabel = label;
                        }}
                        class="btn w-full">{$LOCALE.EDIT_TITLE}</button
                    >
                    {#if !jobname}
                        <button
                            disabled={jobname != null && !$JOBDATA.isBoss}
                            on:click={() => handleOutfitAction('share', id)}
                            class="btn w-full"
                            >{$LOCALE.SHAREOUTFIT_TITLE}</button
                        >
                    {/if}
                    <button
                        on:click={() => handleOutfitAction('item', outfit)}
                        class="btn w-full">{$LOCALE.ITEMOUTFIT_TITLE}</button
                    >
                    <button
                        disabled={jobname != null && !$JOBDATA.isBoss}
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
                            on:click={() => handleRename(i)}
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
                            on:click={() => (deleteIndex = -1)}
                            >{$LOCALE.CANCEL_TITLE}</button
                        >
                        <button
                            class="btn w-full h-full"
                            on:click={() => handleOutfitAction('delete', id)}
                            >{$LOCALE.CONFIRMREM_SUBTITLE}</button
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

<div class="w-full h-fit grid place-items-center">
    {#if isAdding || isJobAdding}
        <div transition:slide class="w-full h-full">
            <Wrapper label={$LOCALE.NEWOUTFIT_TITLE}>
                <svelte:fragment slot="extra_primary">
                    <div
                        class="w-full flex items-center justify-center gap-[0.5vh] h-[3vh]"
                    >
                        <input
                            type="text"
                            class="w-full h-[3vh] p-[0.5vh]"
                            bind:value={newOutfitLabel}
                            placeholder="Outfit Label"
                        />
                        {#if isJobAdding && $JOBDATA.isBoss}
                            <input
                                type="number"
                                class="w-full h-[3vh] p-[0.5vh]"
                                min="0"
                                bind:value={newOutfitJobRank}
                                placeholder="Job Rank"
                            />
                        {/if}
                        <button
                            on:click={resetNewOutfitFields}
                            class="btn h-full aspect-square p-[0.5vh]"
                        >
                            <IconCancel />
                        </button>
                        <button
                            on:click={() => {
                                if (newOutfitLabel.length > 0) {
                                    OUTFITS.save(
                                        newOutfitLabel,
                                        isJobAdding
                                            ? {
                                                  name: $JOBDATA.name,
                                                  rank: newOutfitJobRank,
                                              }
                                            : null,
                                    );
                                    resetNewOutfitFields();
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
        <div transition:slide class="w-full h-full">
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
                            on:click={resetImportFields}
                            class="btn h-full aspect-square p-[0.5vh]"
                        >
                            <IconCancel />
                        </button>
                        <button
                            on:click={() => {
                                if (importOutfitId > 0) {
                                    OUTFITS.import(importOutfitId);
                                    resetImportFields();
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

        {#if $JOBDATA.isBoss}
            <button
                transition:slide
                class="btn w-full h-[3vh] flex items-center justify-center gap-[0.5vh] mt-[0.5vh]"
                on:click={() => {
                    isJobAdding = true;
                }}
            >
                <div class="h-[60%] aspect-square grid place-items-center">
                    <IconPlus />
                </div>
                <p>{$LOCALE.ADDJOBOUTFIT}</p>
            </button>
        {/if}

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
