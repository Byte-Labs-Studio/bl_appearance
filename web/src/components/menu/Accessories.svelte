<script lang="ts">
    import NumberStepper from '@components/micro/NumberStepper.svelte';
    import Wrapper from '@components/micro/Wrapper.svelte';
    import { APPEARANCE } from '@stores/appearance';

    $: props = $APPEARANCE.props;
    $: propTotal = $APPEARANCE.propTotal;
</script>

{#if !props}
    <Wrapper label="You can't add accessorries" />
{:else}
    {#if propTotal?.hats?.total > 0}
        <Wrapper label="Hats">
            <svelte:fragment slot="primary-start">Design</svelte:fragment>
            <svelte:fragment slot="primary-end"
                >Total: {propTotal.hats.total}</svelte:fragment
            >
            <svelte:fragment slot="primary">
                <NumberStepper
                    value={props.hats.value}
                    total={propTotal.hats.total}
                    none={false}
                    on:change={() => {
                        APPEARANCE.setProp(props.hats);
                    }}
                />
            </svelte:fragment>

            <svelte:fragment slot="secondary-start">Texture</svelte:fragment>
            <svelte:fragment slot="secondary-end"
                >Total: {propTotal.hats.textures}</svelte:fragment
            >

            <svelte:fragment slot="secondary">
                <NumberStepper
                    value={props.hats.value}
                    total={propTotal.hats.textures}
                    none={false}
                    on:change={() => {
                        APPEARANCE.setProp(props.hats);
                    }}
                />
            </svelte:fragment>
        </Wrapper>
    {/if}

    {#if propTotal?.glasses?.total > 0}
        <Wrapper label="Glasses">
            <svelte:fragment slot="primary-start">Design</svelte:fragment>
            <svelte:fragment slot="primary-end"
                >Total: {propTotal.glasses.total}</svelte:fragment
            >
            <svelte:fragment slot="primary">
                <NumberStepper
                    value={props.glasses.value}
                    total={propTotal.glasses.total}
                    none={false}
                    on:change={() => {
                        APPEARANCE.setProp(props.glasses);
                    }}
                />
            </svelte:fragment>

            <svelte:fragment slot="secondary-start">Texture</svelte:fragment>
            <svelte:fragment slot="secondary-end"
                >Total: {propTotal.glasses.textures}</svelte:fragment
            >

            <svelte:fragment slot="secondary">
                <NumberStepper
                    value={props.glasses.value}
                    total={propTotal.glasses.textures}
                    none={false}
                    on:change={() => {
                        APPEARANCE.setProp(props.glasses);
                    }}
                />
            </svelte:fragment>
        </Wrapper>
    {/if}

    {#if propTotal?.earrings?.total > 0}
        <Wrapper label="Earrings">
            <svelte:fragment slot="primary-start">Design</svelte:fragment>
            <svelte:fragment slot="primary-end"
                >Total: {propTotal.earrings.total}</svelte:fragment
            >
            <svelte:fragment slot="primary">
                <NumberStepper
                    value={props.earrings.value}
                    total={propTotal.earrings.total}
                    none={false}
                    on:change={() => {
                        APPEARANCE.setProp(props.earrings);
                    }}
                />
            </svelte:fragment>

            <svelte:fragment slot="secondary-start">Texture</svelte:fragment>
            <svelte:fragment slot="secondary-end"
                >Total: {propTotal.earrings.textures}</svelte:fragment
            >

            <svelte:fragment slot="secondary">
                <NumberStepper
                    value={props.earrings.value}
                    total={propTotal.earrings.textures}
                    none={false}
                    on:change={() => {
                        APPEARANCE.setProp(props.earrings);
                    }}
                />
            </svelte:fragment>
        </Wrapper>
    {/if}

    {#if propTotal?.watches?.total > 0}
        <Wrapper label="Watches">
            <svelte:fragment slot="primary-start">Design</svelte:fragment>
            <svelte:fragment slot="primary-end"
                >Total: {propTotal.watches.total}</svelte:fragment
            >
            <svelte:fragment slot="primary">
                <NumberStepper
                    value={props.watches.value}
                    total={propTotal.watches.total}
                    none={false}
                    on:change={() => {
                        APPEARANCE.setProp(props.watches);
                    }}
                />
            </svelte:fragment>

            <svelte:fragment slot="secondary-start">Texture</svelte:fragment>
            <svelte:fragment slot="secondary-end"
                >Total: {propTotal.watches.textures}</svelte:fragment
            >

            <svelte:fragment slot="secondary">
                <NumberStepper
                    value={props.watches.value}
                    total={propTotal.watches.textures}
                    none={false}
                    on:change={() => {
                        APPEARANCE.setProp(props.watches);
                    }}
                />
            </svelte:fragment>
        </Wrapper>
    {/if}

    {#if propTotal?.braclets?.total > 0}
        <Wrapper label="Earrings">
            <svelte:fragment slot="primary-start">Design</svelte:fragment>
            <svelte:fragment slot="primary-end"
                >Total: {propTotal.braclets.total}</svelte:fragment
            >
            <svelte:fragment slot="primary">
                <NumberStepper
                    value={props.braclets.value}
                    total={propTotal.braclets.total}
                    none={false}
                    on:change={() => {
                        APPEARANCE.setProp(props.braclets);
                    }}
                />
            </svelte:fragment>

            <svelte:fragment slot="secondary-start">Texture</svelte:fragment>
            <svelte:fragment slot="secondary-end"
                >Total: {propTotal.braclets.textures}</svelte:fragment
            >

            <svelte:fragment slot="secondary">
                <NumberStepper
                    value={props.braclets.value}
                    total={propTotal.braclets.textures}
                    none={false}
                    on:change={() => {
                        APPEARANCE.setProp(props.braclets);
                    }}
                />
            </svelte:fragment>
        </Wrapper>
    {/if}
{/if}
