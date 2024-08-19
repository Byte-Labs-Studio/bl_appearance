<script lang="ts">
    import { APPEARANCE, TATTOOS, LOCALE } from '@stores/appearance';
    import type { TDLCTattoo, TTattooEntry } from '@typings/apperance';
    import Wrapper from '@components/micro/Wrapper.svelte';
    import IconPlus from '@components/icons/IconPlus.svelte';
    import Stepper from '@components/micro/Stepper.svelte';
    import { slide } from 'svelte/transition';
    import Dropdown from '@components/micro/Dropdown.svelte';
    import Divider from '@components/micro/Divider.svelte';
    import Slider from '@components/micro/Slider.svelte';
    import IconCancel from '@components/icons/IconCancel.svelte';
    import { randomID } from '@utils/misc';

    let deleteOptionIndex: number = null;

    $: options = $TATTOOS || [];

    $: playerTattoos = $APPEARANCE.tattoos || [];

    let indexFocus: number = 0;
    let dlcSearch: string = '';
    let dlcSearchList: TDLCTattoo[] = [];

    let tattooSearch: string = '';
    let tattooSearchList: TTattooEntry[] = [];

    $: {
        if (playerTattoos.length !== 0 && playerTattoos[indexFocus]) {
            const { zoneIndex, dlcIndex } = playerTattoos[indexFocus];
            const dlcs = options[zoneIndex].dlcs;
            const tattoos = dlcs[dlcIndex].tattoos;

            if (dlcSearch.length > 0) {
                if (dlcs !== null) {
                    dlcSearchList = dlcs.filter(dlc =>
                        dlc.label
                            .toLowerCase()
                            .includes(dlcSearch.toLowerCase()),
                    );
                }
            } else {
                dlcSearchList = dlcs;
            }

            if (tattooSearch.length > 0) {
                tattooSearchList = tattoos.filter(tattoo =>
                    tattoo.label
                        .toLowerCase()
                        .includes(tattooSearch.toLowerCase()),
                );
            } else {
                tattooSearchList = tattoos;
            }
        }
    }

    function addTattooRow() {
        const newTattoo = {
            zoneIndex: 0,
            dlcIndex: 0,
            tattoo: null,
            id: randomID(),
        };
        // get the first valid tattoo in the list
        // get dlc with tattoos
        const dlcWithTattoos = options[0].dlcs.findIndex(
            dlc => dlc.tattoos.length > 0,
        );

        if (dlcWithTattoos !== -1) {
            newTattoo.dlcIndex = dlcWithTattoos;
            newTattoo.tattoo = options[0].dlcs[dlcWithTattoos].tattoos[0];
            newTattoo.tattoo.opacity = 0.1
        }

        playerTattoos = [...playerTattoos, newTattoo];

        TATTOOS.setPlayerTattoos(playerTattoos);
    }

    function removeTattooRow(index: number) {
        playerTattoos = playerTattoos.filter((_, i) => i !== index);
        deleteOptionIndex = null;
        
        TATTOOS.setPlayerTattoos(playerTattoos);
    }

    function changeZoneIndex(playerTattoosIndex: number, newZoneIndex: number) {
        playerTattoos[playerTattoosIndex].zoneIndex = newZoneIndex;
        playerTattoos[playerTattoosIndex].dlcIndex = 0;
        
        const dlcTattoos = options[newZoneIndex].dlcs[0]?.tattoos;

        if (dlcTattoos?.length > 0) {
            playerTattoos[playerTattoosIndex].tattoo = dlcTattoos[0];
        } else {
            playerTattoos[playerTattoosIndex].tattoo = null;
        }

        TATTOOS.setPlayerTattoos(playerTattoos);
    }

    function changeDLCIndex(playerTattoosIndex: number, newDLCIndex: number) {
        let playerTattoo = playerTattoos[playerTattoosIndex];
        let { zoneIndex } = playerTattoo;

        playerTattoos[playerTattoosIndex].dlcIndex = newDLCIndex;

        const dlcTattoos = options[zoneIndex].dlcs[newDLCIndex]?.tattoos;

        if (dlcTattoos?.length > 0) {
            playerTattoos[playerTattoosIndex].tattoo = dlcTattoos[0];
        } else {
            playerTattoos[playerTattoosIndex].tattoo = null;
        }

        TATTOOS.setPlayerTattoos(playerTattoos);
    }

    function changeSelected(playerTattoosIndex: number, index: number) {
        let playerTattoo = playerTattoos[playerTattoosIndex];
        let { zoneIndex, dlcIndex } = playerTattoo;

        const tattoo = options[zoneIndex].dlcs[dlcIndex].tattoos[index];
        if (!tattoo) return;

        playerTattoos[playerTattoosIndex].tattoo = tattoo;

        TATTOOS.setPlayerTattoos(playerTattoos);
    }

    function changeOpacity(playerTattoosIndex: number, opacity: number) {
        let playerTattoo = playerTattoos[playerTattoosIndex]

        if (!playerTattoo) return;

        playerTattoo.opacity = opacity
        TATTOOS.setPlayerTattoos(playerTattoos);
    }
</script>

{#each playerTattoos as { zoneIndex, dlcIndex, tattoo, id }, i (id)}
    {@const zone = options[zoneIndex]}
    {@const dlcList = zone.dlcs}
    {@const dlc = dlcList[dlcIndex]}
    {@const tattoos = dlc.tattoos || []}

    {#key i}
        <div class="w-full h-fit" transition:slide|global>
            <Wrapper label={`Tattoo ${i + 1}`}>
                <svelte:fragment slot="extra_primary-start"
                    >{$LOCALE.ZONE_TITLE}</svelte:fragment
                >
                <svelte:fragment slot="extra_primary-end"
                    >{$LOCALE.TOTAL_SUBTITLE}: {options.length}</svelte:fragment
                >
                <svelte:fragment slot="extra_primary">
                    <Stepper
                        list={options}
                        on:change={({ detail }) => changeZoneIndex(i, detail)}
                        index={zoneIndex}
                        display={zone.label}
                    />
                </svelte:fragment>

                <svelte:fragment slot="extra_secondary-start"
                    >DLC</svelte:fragment
                >
                <svelte:fragment slot="extra_secondary-end"
                    >{$LOCALE.TOTAL_SUBTITLE}: {dlcList.length}</svelte:fragment
                >
                <svelte:fragment slot="extra_secondary">
                    <Stepper
                        list={dlcList}
                        on:change={({ detail }) => changeDLCIndex(i, detail)}
                        index={dlcIndex}
                        display={dlc.label}
                    />
                </svelte:fragment>
                <svelte:fragment slot="extra_tertiary">
                    <Dropdown
                        on:click={() => {
                            dlcSearch = '';
                            indexFocus = i;
                        }}
                        display={$LOCALE.DLCOPT_TITLE}
                    >
                        <input
                            type="text"
                            class="w-full h-[3vh] p-[0.5vh]"
                            bind:value={dlcSearch}
                            placeholder="Search for a DLC..."
                        />
                        {#each dlcSearchList as { label, dlcIndex }}
                            <button
                                on:click={() => {
                                    changeDLCIndex(i, dlcIndex);
                                }}
                                class="w-full h-[3vh] flex items-center justify-start gap-[0.5vh] btn p-[0.5vh] font-semibold"
                            >
                                <p>{label}</p>
                            </button>
                        {/each}
                    </Dropdown>

                    {#if tattoos.length > 0}
                        <div
                            transition:slide
                            class="flex flex-col items-center justify-center w-full"
                        >
                            <span
                                class="opacity-75 w-full flex items-center justify-between gap-[0.5vh]"
                            >
                                <p>{$LOCALE.TATTOO_TITLE}</p>

                                <p>
                                    {$LOCALE.TOTAL_SUBTITLE}: {dlc.tattoos
                                        .length}
                                </p>
                            </span>

                            <Stepper
                                list={dlc.tattoos}
                                on:change={({ detail }) =>
                                    changeSelected(i, detail)}
                                display={tattoo.label}
                            />
                        </div>

                        <div
                            transition:slide
                            class="flex flex-col items-center justify-center w-full mt-2"
                        >
                            <Dropdown
                                on:click={() => {
                                    tattooSearch = '';
                                    indexFocus = i;
                                }}
                                display={$LOCALE.TATTOOPTIONS_SUBTITLE}
                            >
                                <input
                                    type="text"
                                    class="w-full h-[3vh] p-[0.5vh]"
                                    bind:value={tattooSearch}
                                    placeholder={$LOCALE.SEARCHTATTOO_SUBTITLE}
                                />
                                {#each tattooSearchList as { label, hash }}
                                    <button
                                        on:click={() => {
                                            const index = dlc.tattoos.findIndex(
                                                tattoo => tattoo.hash === hash,
                                            );
                                            changeSelected(i, index);
                                        }}
                                        class="w-full h-[3vh] flex items-center justify-start gap-[0.5vh] btn p-[0.5vh] font-semibold"
                                    >
                                        <p>{label}</p>
                                    </button>
                                {/each}
                            </Dropdown>
                        </div>

                        <div
                        transition:slide
                        class="flex flex-col items-center justify-center w-full mt-2"
                    >
                        <span
                            class="opacity-75 w-full flex items-center justify-between gap-[0.5vh]"
                        >
                        <p>{$LOCALE.TATTOO_OPACITY}</p>
                        </span>
                        <Slider
                            bind:value={tattoo.opacity}
                            min={0.1}
                            max={1.0}
                            step={0.1}
                            on:change={({ detail: opacity }) => {
                                changeOpacity(i, opacity)
                            }}
                        />
                    </div>
                    {/if}
                </svelte:fragment>

                <svelte:fragment slot="extra_quaternary">
                    <div class="w-full h-[3vh] grid place-items-center">
                        {#if deleteOptionIndex == i}
                            <div
                                transition:slide={{ delay: 500 }}
                                class="flex items-center justify-center gap-[0.5vh] w-full h-full"
                            >
                                <button
                                    class="btn w-full h-full"
                                    on:click={() => (deleteOptionIndex = null)}
                                    >{$LOCALE.CANCEL_TITLE}</button
                                >

                                <button
                                    class="btn w-full h-full"
                                    on:click={() => {
                                        setTimeout(() => {
                                            removeTattooRow(deleteOptionIndex);
                                        }, 500);
                                    }}>{$LOCALE.CONFIRMREM_SUBTITLE}</button
                                >
                            </div>
                        {:else}
                            <button
                                transition:slide={{ delay: 500 }}
                                class="btn w-full h-[3vh] flex items-center justify-center gap-[0.5vh]"
                                on:click={() => (deleteOptionIndex = i)}
                            >
                                <div
                                    class="h-[40%] aspect-square grid place-items-center"
                                >
                                    <IconCancel />
                                </div>

                                <p>{$LOCALE.REMOVETATTOO_TITLE}</p></button
                            >
                        {/if}
                    </div>
                </svelte:fragment>
            </Wrapper>

            <Divider class="my-[1vh]" />
        </div>
    {/key}
{:else}
    <Wrapper label={$LOCALE.NO_TATTOOS}></Wrapper>
{/each}

<button
    class="btn w-full h-[3vh] flex items-center justify-center gap-[0.5vh]"
    on:click={addTattooRow}
>
    <div class="h-[60%] aspect-square grid place-items-center">
        <IconPlus />
    </div>

    <p>{$LOCALE.ADDTATTOO_TITLE}</p>
</button>
