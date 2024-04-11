<script lang="ts">
    import NumberStepper from '@components/micro/NumberStepper.svelte';
    import Wrapper from '@components/micro/Wrapper.svelte';
    import { APPEARANCE, BLACKLIST } from '@stores/appearance';

    $: props = $APPEARANCE.props;
    $: propTotal = $APPEARANCE.propTotal;
    $: blacklist = $BLACKLIST.props;
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
                    bind:value={props.hats.value}
                    total={propTotal.hats.total}
                    none={true}
                    blacklist={blacklist.hats.values}
                    on:change={e => {
                        props.hats.texture = 0;
                        APPEARANCE.setProp(props.hats, e.detail);
                    }}
                />
            </svelte:fragment>

            <svelte:fragment slot="secondary-start">Texture</svelte:fragment>
            <svelte:fragment slot="secondary-end"
                >Total: {propTotal.hats.textures}</svelte:fragment
            >

            <svelte:fragment slot="secondary">
                <NumberStepper
                    bind:value={props.hats.texture}
                    total={propTotal.hats.textures}
                    blacklist={blacklist.hats.textures[props.hats.value] ||
                        null}
                    none={true}
                    on:change={e =>
                        APPEARANCE.setProp(props.hats, e.detail, true)}
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
                    bind:value={props.glasses.value}
                    total={propTotal.glasses.total}
                    none={true}
                    blacklist={blacklist.glasses.values}
                    on:change={e => {
                        props.glasses.texture = 0;
                        APPEARANCE.setProp(props.glasses, e.detail);
                    }}
                />
            </svelte:fragment>

            <svelte:fragment slot="secondary-start">Texture</svelte:fragment>
            <svelte:fragment slot="secondary-end"
                >Total: {propTotal.glasses.textures}</svelte:fragment
            >

            <svelte:fragment slot="secondary">
                <NumberStepper
                    bind:value={props.glasses.value}
                    total={propTotal.glasses.textures}
                    none={true}
                    blacklist={blacklist.glasses.textures[props.glasses.value] ||
                        null}
                    on:change={e =>
                        APPEARANCE.setProp(props.glasses, e.detail, true)}
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
                    bind:value={props.earrings.value}
                    total={propTotal.earrings.total}
                    none={true}
                    blacklist={blacklist.earrings.values}
                    on:change={e => {
                        props.earrings.texture = 0;
                        APPEARANCE.setProp(props.earrings, e.detail);
                    }}
                />
            </svelte:fragment>

            <svelte:fragment slot="secondary-start">Texture</svelte:fragment>
            <svelte:fragment slot="secondary-end"
                >Total: {propTotal.earrings.textures}</svelte:fragment
            >

            <svelte:fragment slot="secondary">
                <NumberStepper
                    bind:value={props.earrings.value}
                    total={propTotal.earrings.textures}
                    none={true}
                    blacklist={blacklist.earrings.textures[props.earrings.value] ||
                        null}
                    on:change={e => {
                        props.earrings.texture = 0;
                        APPEARANCE.setProp(props.earrings, e.detail, true);
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
                    bind:value={props.watches.value}
                    total={propTotal.watches.total}
                    none={true}
                    blacklist={blacklist.watches.values}
                    on:change={e => {
                        props.watches.texture = 0;
                        APPEARANCE.setProp(props.watches, e.detail);
                    }}
                />
            </svelte:fragment>

            <svelte:fragment slot="secondary-start">Texture</svelte:fragment>
            <svelte:fragment slot="secondary-end"
                >Total: {propTotal.watches.textures}</svelte:fragment
            >

            <svelte:fragment slot="secondary">
                <NumberStepper
                    bind:value={props.watches.value}
                    total={propTotal.watches.textures}
                    none={true}
                    blacklist={blacklist.watches.textures[props.watches.value] ||
                        null}
                    on:change={e => {
                        props.watches.texture = 0;
                        APPEARANCE.setProp(props.watches, e.detail, true);
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
                    bind:value={props.braclets.value}
                    total={propTotal.braclets.total}
                    none={true}
                    blacklist={blacklist.braclets.values}
                    on:change={e => {
                        props.braclets.texture = 0;
                        APPEARANCE.setProp(props.braclets, e.detail);
                    }}
                />
            </svelte:fragment>

            <svelte:fragment slot="secondary-start">Texture</svelte:fragment>
            <svelte:fragment slot="secondary-end"
                >Total: {propTotal.braclets.textures}</svelte:fragment
            >

            <svelte:fragment slot="secondary">
                <NumberStepper
                    bind:value={props.braclets.value}
                    total={propTotal.braclets.textures}
                    none={true}
                    blacklist={blacklist.braclets.textures[props.braclets.value] ||
                        null}
                    on:change={e =>
                        APPEARANCE.setProp(props.braclets, e.detail, true)}
                />
            </svelte:fragment>
        </Wrapper>
    {/if}
{/if}
