<script lang="ts">
    import Divider from '@components/micro/Divider.svelte';
    import Dropdown from '@components/micro/Dropdown.svelte';
    import NumberStepper from '@components/micro/NumberStepper.svelte';
    import Slider from '@components/micro/Slider.svelte';
    import Stepper from '@components/micro/Stepper.svelte';
    import Wrapper from '@components/micro/Wrapper.svelte';
    import { APPEARANCE, MODELS } from '@stores/appearance';
    import type { THeadBlend } from '@typings/apperance';
    import { onMount } from 'svelte';

    let data: THeadBlend = $APPEARANCE.headBlend;

    let currentPedIndex = $APPEARANCE.modelIndex || 0;

    let currentPed = $MODELS[currentPedIndex];

    $: firstShape = $APPEARANCE.headBlend?.shapeFirst || 0;
    $: secondShape = $APPEARANCE.headBlend?.shapeSecond || 0;
    $: thirdShape = $APPEARANCE.headBlend?.shapeThird || 0;

    $: firstSkin = $APPEARANCE.headBlend?.skinFirst || 0;
    $: secondSkin = $APPEARANCE.headBlend?.skinSecond || 0;
    $: thirdSkin = $APPEARANCE.headBlend?.skinThird || 0;

    onMount(() => {
        updateParents();
    });

    let newData = data;

    function updateParents() {

        if (!(currentPedIndex === 0 || currentPedIndex === 1)) {
            return;
        }

        if (data?.shapeMix == null) {
            return;
        }

        newData = {
            ...data,
            shapeFirst: firstShape,
            shapeSecond: secondShape,
            shapeThird: thirdShape,

            skinFirst: firstSkin,
            skinSecond: secondSkin,
            skinThird: thirdSkin,
            shapeMix: data.shapeMix,
            skinMix: data.skinMix,
        };

        data.shapeFirst = firstShape;
        data.shapeSecond = secondShape;
        data.shapeThird = thirdShape;

        data.skinFirst = firstSkin;
        data.skinSecond = secondSkin;
        data.skinThird = thirdSkin;

        APPEARANCE.setHeadBlend(newData);
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
    <svelte:fragment slot="primary-end">Total: {$MODELS.length}</svelte:fragment>
    <svelte:fragment slot="primary">
        <Stepper
            bind:index={currentPedIndex}
            list={$MODELS}
            on:change={() => {
                console.log('currentPedIndex', currentPedIndex);
                currentPed = $MODELS[currentPedIndex];
                APPEARANCE.setModel(currentPed).then(() => {
                    updateParents();
                });
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
                        APPEARANCE.setModel(currentPed).then(() => {
                            updateParents();
                        });
                    }}
                    class="w-full h-[3vh] flex items-center justify-start gap-[0.5vh] btn p-[0.5vh] font-semibold"
                >
                    <p>{model}</p>
                </button>
            {/each}
        </Dropdown>
    </svelte:fragment>
</Wrapper>

<Divider class="my-[1vh]" />

<Wrapper label="Mother">
    <svelte:fragment slot="primary-start">Face</svelte:fragment>
    <svelte:fragment slot="primary-end">Total: 46</svelte:fragment>
    <svelte:fragment slot="primary">
        <NumberStepper
            value={firstShape}
            total={46}
            none={false}
            on:change={e => {
                firstShape = e.detail;
                updateParents();
            }}
        />
    </svelte:fragment>

    <svelte:fragment slot="secondary-start">Skin</svelte:fragment>
    <svelte:fragment slot="secondary-end">Total: 15</svelte:fragment>
    <svelte:fragment slot="secondary">
        <NumberStepper
            value={firstSkin}
            total={15}
            none={false}
            on:change={e => {
                firstSkin = e.detail;
                updateParents();
            }}
        />
    </svelte:fragment>
</Wrapper>

<Wrapper label="Father">
    <svelte:fragment slot="primary-start">Face</svelte:fragment>
    <svelte:fragment slot="primary-end">Total: 46</svelte:fragment>
    <svelte:fragment slot="primary">
        <NumberStepper
            value={secondShape}
            total={46}
            none={false}
            on:change={e => {
                secondShape = e.detail;
                updateParents();
            }}
        />
    </svelte:fragment>

    <svelte:fragment slot="secondary-start">Skin</svelte:fragment>
    <svelte:fragment slot="secondary-end">Total: 15</svelte:fragment>
    <svelte:fragment slot="secondary">
        <NumberStepper
            value={secondSkin}
            total={15}
            none={false}
            on:change={e => {
                secondSkin = e.detail;
                updateParents();
            }}
        />
    </svelte:fragment>
</Wrapper>

<Wrapper label="Third Parent">
    <svelte:fragment slot="primary-start">Face</svelte:fragment>
    <svelte:fragment slot="primary-end">Total: 46</svelte:fragment>
    <svelte:fragment slot="primary">
        <NumberStepper
            value={thirdShape}
            total={46}
            none={false}
            on:change={e => {
                thirdShape = e.detail;
                updateParents();
            }}
        />
    </svelte:fragment>

    <svelte:fragment slot="secondary-start">Skin</svelte:fragment>
    <svelte:fragment slot="secondary-end">Total: 15</svelte:fragment>
    <svelte:fragment slot="secondary">
        <NumberStepper
            value={thirdSkin}
            total={15}
            none={false}
            on:change={e => {
                thirdSkin = e.detail;
                updateParents();
            }}
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
                on:change={e => {
                    data.shapeMix = e.detail;
                    updateParents();
                }}
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
                        value={(100 - Math.floor(data.shapeMix * 100) || 0) +
                            '%'}
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
            on:change={e => {
                data.thirdMix = e.detail;
                updateParents();
            }}
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
                on:change={e => {
                    data.skinMix = e.detail;
                    updateParents();
                }}
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
