<script lang="ts">
    import Divider from '@components/micro/Divider.svelte';
    import Dropdown from '@components/micro/Dropdown.svelte';
    import NumberStepper from '@components/micro/NumberStepper.svelte';
    import Slider from '@components/micro/Slider.svelte';
    import Stepper from '@components/micro/Stepper.svelte';
    import Wrapper from '@components/micro/Wrapper.svelte';
    import { APPEARANCE, BLACKLIST, MODELS, IS_VALID } from '@stores/appearance';
    import type { THeadBlend } from '@typings/apperance';
    import { onMount } from 'svelte';

    let data: THeadBlend = $APPEARANCE.headBlend;
    let currentPedIndex = $APPEARANCE.modelIndex || 0;
    let currentPed = $MODELS[currentPedIndex];

    onMount(() => {
        APPEARANCE.setHeadBlend(data);
    });

    function updateParents(key: string, value: number) {
        if (currentPedIndex !== 0 && currentPedIndex !== 1) return;

        data[key] = value;

        APPEARANCE.setHeadBlend(data);
    }

    let modelSearch: string = '';
    let modelList = $MODELS;

    $: {
        if (modelSearch.length > 0) {
            modelList = $MODELS.filter(model =>
                model.toLowerCase().includes(modelSearch.toLowerCase()),
            );
        } else {
            modelList = $MODELS;
        }
    }
</script>

<Wrapper label="Model">
    <svelte:fragment slot="primary-start">Options</svelte:fragment>
    <svelte:fragment slot="primary-end">{$LOCALE.TOTAL_SUBTITLE}: {$MODELS.length}</svelte:fragment
    >
    <svelte:fragment slot="primary">
        <Stepper
            bind:index={currentPedIndex}
            list={$MODELS}
            blacklist={$BLACKLIST.models || null}
            isBlacklisted = {$BLACKLIST.models.includes(currentPed)}
            on:change={() => {
                currentPed = $MODELS[currentPedIndex];
                APPEARANCE.setModel(currentPed);
                IS_VALID.set({ ...$IS_VALID, drawables: true });
            }}
            display={currentPed}
        />
    </svelte:fragment>

    <svelte:fragment slot="extra_primary">
        <Dropdown
            on:click={() => {
                modelSearch = '';
            }}
            display={'Model Options'}
        >
            <input
                type="text"
                class="w-full h-[3vh] p-[0.5vh]"
                bind:value={modelSearch}
                placeholder="Search for a model..."
            />
            {#each modelList as model, i}
                <button
                    on:click={() => {
                        currentPed = model;
                        currentPedIndex = modelList.indexOf(model);
                        IS_VALID.set({...$IS_VALID, models: $BLACKLIST.models ? !$BLACKLIST.models.includes(currentPed): true});
                        APPEARANCE.setModel(currentPed);
                        IS_VALID.set({ ...$IS_VALID, drawables: true });
                    }}
                    class="w-full h-[3vh] flex items-center justify-start gap-[0.5vh] btn p-[0.5vh] font-semibold"
                >
                    <p>{model}</p>
                </button>
            {/each}
        </Dropdown>
    </svelte:fragment>
</Wrapper>

{#if currentPedIndex === 0 || currentPedIndex === 1}
    <Divider class="my-[1vh]" />
    <Wrapper label="Mother">
        <svelte:fragment slot="primary-start">Face</svelte:fragment>
        <svelte:fragment slot="primary-end">{$LOCALE.TOTAL_SUBTITLE}: 46</svelte:fragment>
        <svelte:fragment slot="primary">
            <NumberStepper
                value={data.shapeFirst || 0}
                total={46}
                none={false}
                on:change={e => updateParents('shapeFirst', e.detail)}
            />
        </svelte:fragment>

        <svelte:fragment slot="secondary-start">Skin</svelte:fragment>
        <svelte:fragment slot="secondary-end">{$LOCALE.TOTAL_SUBTITLE}: 15</svelte:fragment>
        <svelte:fragment slot="secondary">
            <NumberStepper
                value={data.skinFirst || 0}
                total={15}
                none={false}
                on:change={e => updateParents('skinFirst', e.detail)}
            />
        </svelte:fragment>
    </Wrapper>

    <Wrapper label="Father">
        <svelte:fragment slot="primary-start">Face</svelte:fragment>
        <svelte:fragment slot="primary-end">{$LOCALE.TOTAL_SUBTITLE}: 46</svelte:fragment>
        <svelte:fragment slot="primary">
            <NumberStepper
                value={data.shapeSecond || 0}
                total={46}
                none={false}
                on:change={e => updateParents('shapeSecond', e.detail)}
            />
        </svelte:fragment>

        <svelte:fragment slot="secondary-start">Skin</svelte:fragment>
        <svelte:fragment slot="secondary-end">{$LOCALE.TOTAL_SUBTITLE}: 15</svelte:fragment>
        <svelte:fragment slot="secondary">
            <NumberStepper
                value={data.skinSecond || 0}
                total={15}
                none={false}
                on:change={e => updateParents('skinSecond', e.detail)}
            />
        </svelte:fragment>
    </Wrapper>

    <Wrapper label="Third Parent">
        <svelte:fragment slot="primary-start">Face</svelte:fragment>
        <svelte:fragment slot="primary-end">{$LOCALE.TOTAL_SUBTITLE}: 46</svelte:fragment>
        <svelte:fragment slot="primary">
            <NumberStepper
                value={data.shapeThird || 0}
                total={46}
                none={false}
                on:change={e => updateParents('shapeThird', e.detail)}
            />
        </svelte:fragment>

        <svelte:fragment slot="secondary-start">Skin</svelte:fragment>
        <svelte:fragment slot="secondary-end">{$LOCALE.TOTAL_SUBTITLE}: 15</svelte:fragment>
        <svelte:fragment slot="secondary">
            <NumberStepper
                value={data.skinThird || 0}
                total={15}
                none={false}
                on:change={e => updateParents('skinThird', e.detail)}
            />
        </svelte:fragment>
    </Wrapper>

    <Wrapper label="Resemblence">
        <svelte:fragment slot="primary-start">Mother</svelte:fragment>
        <svelte:fragment slot="primary-end">Father</svelte:fragment>

        <svelte:fragment slot="primary">
            <div class="w-full h-fit flex flex-col items-center justify-center">
                <Slider
                    min={0}
                    max={1}
                    step={0.01}
                    value={data?.shapeMix || 0}
                    on:change={e => updateParents('shapeMix', e.detail)}
                >
                    <svelte:fragment slot="before">
                        <input
                            type="text"
                            disabled
                            class="w-[6vh] relative h-full text-center"
                            value={(Math.floor(data.shapeMix * 100) || 0) + '%'}
                        />
                    </svelte:fragment>

                    <svelte:fragment slot="after">
                        <input
                            type="text"
                            disabled
                            class="w-[6vh] relative h-full text-center"
                            value={(100 - Math.floor(data.shapeMix * 100) ||
                                0) + '%'}
                        />
                    </svelte:fragment>
                </Slider>
            </div>
        </svelte:fragment>

        <svelte:fragment slot="extra_primary-start">Third</svelte:fragment>
        <svelte:fragment slot="extra_primary">
            <Slider
                min={0}
                max={1}
                step={0.01}
                value={data?.thirdMix || 0}
                on:change={e => updateParents('thirdMix', e.detail)}
            >
                <svelte:fragment slot="after">
                    <input
                        type="text"
                        disabled
                        class="w-[6vh] relative h-full text-center"
                        value={(Math.floor(data.thirdMix * 100) || 0) + '%'}
                    />
                </svelte:fragment>
            </Slider>
        </svelte:fragment>
    </Wrapper>

    <Wrapper label="Skin Mix">
        <svelte:fragment slot="primary-start">Mother</svelte:fragment>
        <svelte:fragment slot="primary-end">Father</svelte:fragment>

        <svelte:fragment slot="primary">
            <div class="w-full h-fit flex flex-col items-center justify-center">
                <Slider
                    min={0}
                    max={1}
                    step={0.01}
                    value={data?.skinMix || 0}
                    on:change={e => updateParents('skinMix', e.detail)}
                >
                    <svelte:fragment slot="before">
                        <input
                            type="text"
                            disabled
                            class="w-[6vh] relative h-full text-center"
                            value={(Math.floor(data.skinMix * 100) || 0) + '%'}
                        />
                    </svelte:fragment>

                    <svelte:fragment slot="after">
                        <input
                            type="text"
                            disabled
                            class="w-[6vh] relative h-full text-center"
                            value={(100 - Math.floor(data.skinMix * 100) || 0) +
                                '%'}
                        />
                    </svelte:fragment>
                </Slider>
            </div>
        </svelte:fragment>
    </Wrapper>
{/if}
