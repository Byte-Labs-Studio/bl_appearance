<script lang="ts">
    import ColourDropdown from '@components/micro/ColourDropdown.svelte';
    import NumberStepper from '@components/micro/NumberStepper.svelte';
    import Slider from '@components/micro/Slider.svelte';
    import Wrapper from '@components/micro/Wrapper.svelte';
    import { APPEARANCE } from '@stores/appearance';
    import type { TValue, THeadOverlay, TEyeColor } from '@typings/apperance';

    $: data = $APPEARANCE.headStructure || false;
    let eyeColor = ($APPEARANCE.headOverlay?.EyeColor as TValue) || null;

    $: headOverlay = $APPEARANCE.headOverlay as THeadOverlay;

    $: headOverlayTotal = $APPEARANCE.headOverlayTotal;
</script>

{#if !data}
    <Wrapper label="You can't modify your face" />
{:else}
    {#if data['Nose_Width']}
        <Wrapper label="Nose">
            <svelte:fragment slot="primary-start">Width</svelte:fragment>
            <svelte:fragment slot="primary">
                <Slider
                    bind:value={data['Nose_Width'].value}
                    min={-1.0}
                    max={1.0}
                    step={0.01}
                    on:change={() => {
                        APPEARANCE.setHeadStructure(data['Nose_Width']);
                    }}
                />
            </svelte:fragment>

            <svelte:fragment slot="secondary-start">Peak Height</svelte:fragment
            >

            <svelte:fragment slot="secondary">
                <Slider
                    bind:value={data['Nose_Peak_Height'].value}
                    min={-1.0}
                    max={1.0}
                    step={0.01}
                    on:change={() => {
                        APPEARANCE.setHeadStructure(data['Nose_Peak_Height']);
                    }}
                />
            </svelte:fragment>

            <svelte:fragment slot="tertiary-start">Peak Length</svelte:fragment>

            <svelte:fragment slot="tertiary">
                <Slider
                    bind:value={data['Nose_Peak_Lenght'].value}
                    min={-1.0}
                    max={1.0}
                    step={0.01}
                    on:change={() => {
                        APPEARANCE.setHeadStructure(data['Nose_Peak_Lenght']);
                    }}
                />
            </svelte:fragment>

            <svelte:fragment slot="quaternary-start"
                >Bone Height</svelte:fragment
            >

            <svelte:fragment slot="quaternary">
                <Slider
                    bind:value={data['Nose_Bone_Height'].value}
                    min={-1.0}
                    max={1.0}
                    step={0.01}
                    on:change={() => {
                        APPEARANCE.setHeadStructure(data['Nose_Bone_Height']);
                    }}
                />
            </svelte:fragment>

            <svelte:fragment slot="quinary-start">Peak Lowering</svelte:fragment
            >

            <svelte:fragment slot="quinary">
                <Slider
                    bind:value={data['Nose_Peak_Lowering'].value}
                    min={-1.0}
                    max={1.0}
                    step={0.01}
                    on:change={() => {
                        APPEARANCE.setHeadStructure(data['Nose_Peak_Lowering']);
                    }}
                />
            </svelte:fragment>

            <svelte:fragment slot="senary-start">Bone Twist</svelte:fragment>

            <svelte:fragment slot="senary">
                <Slider
                    bind:value={data['Nose_Bone_Twist'].value}
                    min={-1.0}
                    max={1.0}
                    step={0.01}
                    on:change={() => {
                        APPEARANCE.setHeadStructure(data['Nose_Bone_Twist']);
                    }}
                />
            </svelte:fragment>
        </Wrapper>
    {/if}

    {#if data['EyeBrow_Height']}
        <Wrapper label="Eyebrow">
            <svelte:fragment slot="primary-start">Height</svelte:fragment>

            <svelte:fragment slot="primary">
                <Slider
                    bind:value={data['EyeBrow_Height'].value}
                    min={-1.0}
                    max={1.0}
                    step={0.01}
                    on:change={() => {
                        APPEARANCE.setHeadStructure(data['EyeBrow_Height']);
                    }}
                />
            </svelte:fragment>

            <svelte:fragment slot="secondary-start">Depth</svelte:fragment>

            <svelte:fragment slot="secondary">
                <Slider
                    bind:value={data['EyeBrow_Forward'].value}
                    min={-1.0}
                    max={1.0}
                    step={0.01}
                    on:change={() => {
                        APPEARANCE.setHeadStructure(data['EyeBrow_Forward']);
                    }}
                />
            </svelte:fragment>
        </Wrapper>
    {/if}

    {#if data['Cheeks_Bone_High']}
        <Wrapper label="Cheeks">
            <svelte:fragment slot="primary-start">Bone Height</svelte:fragment>

            <svelte:fragment slot="primary">
                <Slider
                    bind:value={data['Cheeks_Bone_High'].value}
                    min={-1.0}
                    max={1.0}
                    step={0.01}
                    on:change={() => {
                        APPEARANCE.setHeadStructure(data['Cheeks_Bone_High']);
                    }}
                />
            </svelte:fragment>

            <svelte:fragment slot="secondary-start">Bone Width</svelte:fragment>

            <svelte:fragment slot="secondary">
                <Slider
                    bind:value={data['Cheeks_Bone_Width'].value}
                    min={-1.0}
                    max={1.0}
                    step={0.01}
                    on:change={() => {
                        APPEARANCE.setHeadStructure(data['Cheeks_Bone_Width']);
                    }}
                />
            </svelte:fragment>

            <svelte:fragment slot="extra_primary-start">Width</svelte:fragment>
            <svelte:fragment slot="extra_primary">
                <Slider
                    bind:value={data['Cheeks_Width'].value}
                    min={-1.0}
                    max={1.0}
                    step={0.01}
                    on:change={() => {
                        APPEARANCE.setHeadStructure(data['Cheeks_Width']);
                    }}
                />
            </svelte:fragment>
        </Wrapper>

        {#if data['Eyes_Openning']}
            <Wrapper label="Eyes">
                <svelte:fragment slot="primary-start">Squint</svelte:fragment>

                <svelte:fragment slot="primary">
                    <Slider
                        bind:value={data['Eyes_Openning'].value}
                        min={-1.0}
                        max={1.0}
                        step={0.01}
                        on:change={() => {
                            APPEARANCE.setHeadStructure(data['Eyes_Openning']);
                        }}
                    />
                </svelte:fragment>

                <svelte:fragment slot="extra_primary">
                    <div
                        class="flex flex-col items-center justify-center w-full"
                    >
                        <span
                            class="opacity-75 w-full flex items-center justify-end gap-[0.5vh]"
                        >
                            <p>Colour</p>
                        </span>
                        <ColourDropdown
                            bind:index={eyeColor.value}
                            on:change={() => {
                                APPEARANCE.setEyeColor(eyeColor);
                            }}
                        />
                    </div>
                </svelte:fragment>
            </Wrapper>
        {/if}

        {#if data['Lips_Thickness']}
            <Wrapper label="Lips">
                <svelte:fragment slot="primary-start">Thickness</svelte:fragment
                >

                <svelte:fragment slot="primary">
                    <Slider
                        bind:value={data['Lips_Thickness'].value}
                        min={-1.0}
                        max={1.0}
                        step={0.01}
                        on:change={() => {
                            APPEARANCE.setHeadStructure(data['Lips_Thickness']);
                        }}
                    />
                </svelte:fragment>
            </Wrapper>
        {/if}

        {#if data['Jaw_Bone_Width']}
            <Wrapper label="Jaw">
                <svelte:fragment slot="primary-start"
                    >Bone Width</svelte:fragment
                >

                <svelte:fragment slot="primary">
                    <Slider
                        bind:value={data['Jaw_Bone_Width'].value}
                        min={-1.0}
                        max={1.0}
                        step={0.01}
                        on:change={() => {
                            APPEARANCE.setHeadStructure(data['Jaw_Bone_Width']);
                        }}
                    />
                </svelte:fragment>

                <svelte:fragment slot="secondary-start"
                    >Bone Length</svelte:fragment
                >

                <svelte:fragment slot="secondary">
                    <Slider
                        bind:value={data['Jaw_Bone_Back_Lenght'].value}
                        min={-1.0}
                        max={1.0}
                        step={0.01}
                        on:change={() => {
                            APPEARANCE.setHeadStructure(
                                data['Jaw_Bone_Back_Lenght']
                            );
                        }}
                    />
                </svelte:fragment>
            </Wrapper>
        {/if}

        {#if data['Chin_Bone_Lowering']}
            <Wrapper label="Chin">
                <svelte:fragment slot="primary-start"
                    >Bone Lowering</svelte:fragment
                >

                <svelte:fragment slot="primary">
                    <Slider
                        bind:value={data['Chin_Bone_Lowering'].value}
                        min={-1.0}
                        max={1.0}
                        step={0.01}
                        on:change={() => {
                            APPEARANCE.setHeadStructure(data['Chin_Bone_Lowering']);
                        }}
                    />
                </svelte:fragment>

                <svelte:fragment slot="secondary-start"
                    >Bone Length</svelte:fragment
                >

                <svelte:fragment slot="secondary">
                    <Slider
                        bind:value={data['Chin_Bone_Length'].value}
                        min={-1.0}
                        max={1.0}
                        step={0.01}
                        on:change={() => {
                            APPEARANCE.setHeadStructure(data['Chin_Bone_Length']);
                        }}
                    />
                </svelte:fragment>

                <svelte:fragment slot="tertiary-start"
                    >Bone Width</svelte:fragment
                >

                <svelte:fragment slot="tertiary">
                    <Slider
                        bind:value={data['Chin_Bone_Width'].value}
                        min={-1.0}
                        max={1.0}
                        step={0.01}
                        on:change={() => {
                            APPEARANCE.setHeadStructure(data['Chin_Bone_Width']);
                        }}
                    />
                </svelte:fragment>

                <svelte:fragment slot="quaternary-start">Hole</svelte:fragment>

                <svelte:fragment slot="quaternary">
                    <Slider
                        bind:value={data['Chin_Hole'].value}
                        min={-1.0}
                        max={1.0}
                        step={0.01}
                        on:change={() => {
                            APPEARANCE.setHeadStructure(data['Chin_Hole']);
                        }}
                    />
                </svelte:fragment>
            </Wrapper>
        {/if}

        {#if data['Neck_Thikness']}
            <Wrapper label="Jaw">
                <svelte:fragment slot="primary-start">Thickness</svelte:fragment
                >

                <svelte:fragment slot="primary">
                    <Slider
                        bind:value={data['Neck_Thikness'].value}
                        min={-1.0}
                        max={1.0}
                        step={0.01}
                        on:change={() => {
                            APPEARANCE.setHeadStructure(data['Neck_Thikness']);
                        }}
                    />
                </svelte:fragment>
            </Wrapper>
        {/if}

        {#if headOverlay?.Blemishes?.overlayValue !== null}
            <Wrapper label="Face Details">
                <svelte:fragment slot="primary-start">Blemishes</svelte:fragment
                >
                <svelte:fragment slot="primary">
                    <NumberStepper
                        value={headOverlay.Blemishes.overlayValue}
                        total={headOverlayTotal.Blemishes}
                        none={true}
                        on:change={() => {
                            APPEARANCE.setHeadOverlay(headOverlay.Blemishes);
                        }}
                    />
                </svelte:fragment>

                <svelte:fragment slot="secondary-start">Ageing</svelte:fragment>

                <svelte:fragment slot="secondary">
                    <NumberStepper
                        value={headOverlay.Ageing.overlayValue}
                        total={headOverlayTotal.Ageing}
                        none={true}
                        on:change={() => {
                            APPEARANCE.setHeadOverlay(headOverlay.Ageing);
                        }}
                    />
                </svelte:fragment>

                <svelte:fragment slot="tertiary-start"
                    >Complexion</svelte:fragment
                >

                <svelte:fragment slot="tertiary">
                    <NumberStepper
                        value={headOverlay.Complexion.overlayValue}
                        total={headOverlayTotal.Complexion}
                        none={true}
                        on:change={() => {
                            APPEARANCE.setHeadOverlay(headOverlay.Complexion);
                        }}
                    />
                </svelte:fragment>

                <svelte:fragment slot="quaternary-start"
                    >Sun Damage</svelte:fragment
                >

                <svelte:fragment slot="quaternary">
                    <NumberStepper
                        value={headOverlay.SunDamage.overlayValue}
                        total={headOverlayTotal.SunDamage}
                        none={true}
                        on:change={() => {
                            APPEARANCE.setHeadOverlay(headOverlay.SunDamage);
                        }}
                    />
                </svelte:fragment>

                <svelte:fragment slot="quinary-start"
                    >Moles Freckles</svelte:fragment
                >

                <svelte:fragment slot="quinary">
                    <NumberStepper
                        value={headOverlay.MolesFreckles.overlayValue}
                        total={headOverlayTotal.MolesFreckles}
                        none={true}
                        on:change={() => {
                            APPEARANCE.setHeadOverlay(headOverlay.MolesFreckles);
                        }}
                    />
                </svelte:fragment>

                <svelte:fragment slot="senary-start"
                    >Body Blemishes</svelte:fragment
                >

                <svelte:fragment slot="senary">
                    <NumberStepper
                        value={headOverlay.BodyBlemishes.overlayValue}
                        total={headOverlayTotal.BodyBlemishes}
                        none={true}
                        on:change={() => {
                            APPEARANCE.setHeadOverlay(headOverlay.BodyBlemishes);
                        }}
                    />
                </svelte:fragment>
            </Wrapper>
        {/if}
    {/if}
{/if}
