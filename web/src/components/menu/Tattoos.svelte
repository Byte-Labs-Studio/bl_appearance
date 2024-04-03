<script lang="ts">
    import { APPEARANCE, TATTOOS } from '@stores/appearance';
    import type { TDLCTattoo, TTattooEntry } from '@typings/apperance';
    import Wrapper from '@components/micro/Wrapper.svelte';
    import IconPlus from '@components/icons/IconPlus.svelte';
    import Stepper from '@components/micro/Stepper.svelte';
    import { slide } from 'svelte/transition';
    import Dropdown from '@components/micro/Dropdown.svelte';
    import Divider from '@components/micro/Divider.svelte';
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
            const { zoneIndex } = playerTattoos[indexFocus];
            const dlcs = options[zoneIndex].dlcs;
            if (dlcSearch.length > 0) {
                console.log('dlcIndex', playerTattoos[indexFocus]);

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
        }
    }

    $: {
        if (playerTattoos.length !== 0 && playerTattoos[indexFocus]) {
            const { zoneIndex, dlcIndex } = playerTattoos[indexFocus];
            const tattoos = options[zoneIndex].dlcs[dlcIndex].tattoos;

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

        if (dlcWithTattoos) {
            newTattoo.dlcIndex = dlcWithTattoos;
            newTattoo.tattoo = options[0].dlcs[dlcWithTattoos].tattoos[0];
        }

        playerTattoos = [...playerTattoos, newTattoo];
    }

    function removeTattooRow(index: number) {
        playerTattoos = playerTattoos.filter((_, i) => i !== index);
        deleteOptionIndex = null;

        // SetTattoos(playerTattoos)
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

        // SetTattoos(playerTattoos)
    }

    function changeDLCIndex(playerTattoosIndex: number, newDLCIndex: number) {
        let playerTattoo = playerTattoos[playerTattoosIndex];
        let { zoneIndex } = playerTattoo;

        playerTattoos[playerTattoosIndex].dlcIndex = newDLCIndex;

        const dlcTattoos = options[zoneIndex].dlcs[newDLCIndex]?.tattoos;

        console.log('dlcTattoos', dlcTattoos);

        if (dlcTattoos?.length > 0) {
            playerTattoos[playerTattoosIndex].tattoo = dlcTattoos[0];
        } else {
            playerTattoos[playerTattoosIndex].tattoo = null;
        }

        // SetTattoos(playerTattoos)
    }

    function changeSelected(playerTattoosIndex: number, index: number) {
        let playerTattoo = playerTattoos[playerTattoosIndex];
        let { zoneIndex, dlcIndex } = playerTattoo;

        const tattoo = options[zoneIndex].dlcs[dlcIndex].tattoos[index];
        if (!tattoo) return;

        playerTattoos[playerTattoosIndex].tattoo = tattoo;
        // SetTattoos(playerTattoos)
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
                    >Zone</svelte:fragment
                >
                <svelte:fragment slot="extra_primary-end"
                    >Total: {options.length}</svelte:fragment
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
                    >Total: {dlcList.length}</svelte:fragment
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
                        display={'DLC Options'}
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
                                <p>Tattoo</p>

                                <p>
                                    Total: {dlc.tattoos.length}
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
                            class="flex flex-col items-center justify-center w-full"
                        >
                            <Dropdown
                                on:click={() => {
                                    tattooSearch = '';
                                    indexFocus = i;
                                }}
                                display={'Tattoo Options'}
                            >
                                <input
                                    type="text"
                                    class="w-full h-[3vh] p-[0.5vh]"
                                    bind:value={tattooSearch}
                                    placeholder="Search for a Tattoo..."
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
                                    >Cancel</button
                                >

                                <button
                                    class="btn w-full h-full"
                                    on:click={() => {
                                        setTimeout(() => {
                                            removeTattooRow(deleteOptionIndex);
                                        }, 500);
                                    }}>Confirm Remove</button
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

                                <p>Remove Tattoo</p></button
                            >
                        {/if}
                    </div>
                </svelte:fragment>
            </Wrapper>

            <Divider class="my-[1vh]" />
        </div>
    {/key}
{:else}
    <Wrapper label="You have no current Tattoos"></Wrapper>
{/each}

<button
    class="btn w-full h-[3vh] flex items-center justify-center gap-[0.5vh]"
    on:click={addTattooRow}
>
    <div class="h-[60%] aspect-square grid place-items-center">
        <IconPlus />
    </div>

    <p>Add Tattoo</p>
</button>
