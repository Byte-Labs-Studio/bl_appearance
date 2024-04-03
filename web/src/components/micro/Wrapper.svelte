<script lang="ts">
    export let label: string;
</script>

<div class="w-full h-fit flex flex-col items-end justify-center pt-[0.5vh] gap-[0.5vh]">
    <p class="text-[2vh] uppercase font-semibold">{label}</p>

    {#if $$slots.primary || $$slots.secondary}
        <div class="flex items-center justify-center w-full gap-[1vh]">
            {#if $$slots.primary}
                {@const position = 'primary'}
                <div class="flex flex-col items-center justify-center w-full">
                    <span
                        class="opacity-75 w-full flex items-center {$$slots[
                            `${position}-end`
                        ]
                            ? 'justify-between'
                            : 'justify-end'} gap-[0.5vh]"
                    >
                        {#if $$slots[`${position}-start`]}
                            <p>
                                <slot name="primary-start" />
                            </p>
                        {:else}
                            <p></p>
                        {/if}

                        {#if $$slots[`${position}-end`]}
                            <p>
                                <slot name="primary-end" />
                            </p>
                        {/if}
                    </span>
                    <slot name="primary" />
                </div>
            {/if}

            {#if $$slots.secondary}
                {@const position = 'secondary'}
                <div class="flex flex-col items-center justify-center w-full">
                    <span
                        class="opacity-75 w-full flex items-center {$$slots[
                            `${position}-end`
                        ]
                            ? 'justify-between'
                            : 'justify-end'} gap-[0.5vh]"
                    >
                        {#if $$slots[`${position}-start`]}
                            <p>
                                <slot name="secondary-start" />
                            </p>
                        {:else}
                            <p></p>
                        {/if}

                        {#if $$slots[`${position}-end`]}
                            <p>
                                <slot name="secondary-end" />
                            </p>
                        {/if}
                    </span>
                    <slot name="secondary" />
                </div>
            {/if}
        </div>
    {/if}

    {#if $$slots.tertiary || $$slots.quaternary}
        <div class="flex items-center justify-center w-full gap-[1vh]">
            {#if $$slots.tertiary}
                {@const position = 'tertiary'}
                <div class="flex flex-col items-center justify-center w-full">
                    <span
                        class="opacity-75 w-full flex items-center {$$slots[
                            `${position}-end`
                        ]
                            ? 'justify-between'
                            : 'justify-end'} gap-[0.5vh]"
                    >
                        {#if $$slots[`${position}-start`]}
                            <p>
                                <slot name="tertiary-start" />
                            </p>
                        {:else}
                            <p></p>
                        {/if}

                        {#if $$slots[`${position}-end`]}
                            <p>
                                <slot name="tertiary-end" />
                            </p>
                        {/if}
                    </span>
                    <slot name="tertiary" />
                </div>
            {/if}

            {#if $$slots.quaternary}
                {@const position = 'quaternary'}
                <div class="flex flex-col items-center justify-center w-full">
                    <span
                        class="opacity-75 w-full flex items-center {$$slots[
                            `${position}-end`
                        ]
                            ? 'justify-between'
                            : 'justify-end'} gap-[0.5vh]"
                    >
                        {#if $$slots[`${position}-start`]}
                            <p>
                                <slot name="quaternary-start" />
                            </p>
                        {:else}
                            <p></p>
                        {/if}

                        {#if $$slots[`${position}-end`]}
                            <p>
                                <slot name="quaternary-end" />
                            </p>
                        {/if}
                    </span>
                    <slot name="quaternary" />
                </div>
            {/if}
        </div>
    {/if}

    {#if $$slots.quinary || $$slots.senary}
        <div class="flex items-center justify-center w-full gap-[1vh]">
            {#if $$slots.quinary}
                {@const position = 'quinary'}
                <div class="flex flex-col items-center justify-center w-full">
                    <span
                        class="opacity-75 w-full flex items-center {$$slots[
                            `${position}-end`
                        ]
                            ? 'justify-between'
                            : 'justify-end'} gap-[0.5vh]"
                    >
                        {#if $$slots[`${position}-start`]}
                            <p>
                                <slot name="quinary-start" />
                            </p>
                        {:else}
                            <p></p>
                        {/if}

                        {#if $$slots[`${position}-end`]}
                            <p>
                                <slot name="quinary-end" />
                            </p>
                        {/if}
                    </span>
                    <slot name="quinary" />
                </div>
            {/if}

            {#if $$slots.senary}
                {@const position = 'senary'}
                <div class="flex flex-col items-center justify-center w-full">
                    <span
                        class="opacity-75 w-full flex items-center {$$slots[
                            `${position}-end`
                        ]
                            ? 'justify-between'
                            : 'justify-end'} gap-[0.5vh]"
                    >
                        {#if $$slots[`${position}-start`]}
                            <p>
                                <slot name="senary-start" />
                            </p>
                        {:else}
                            <p></p>
                        {/if}

                        {#if $$slots[`${position}-end`]}
                            <p>
                                <slot name="senary-end" />
                            </p>
                        {/if}
                    </span>
                    <slot name="senary" />
                </div>
            {/if}
        </div>
    {/if}

    {#if $$slots.extra_primary}
        {@const position = 'extra_primary'}
        <div class="flex flex-col items-center justify-center w-full">
            <span
                class="opacity-75 w-full flex items-center {$$slots[
                    `${position}-end`
                ]
                    ? 'justify-between'
                    : 'justify-end'} gap-[0.5vh]"
            >
                {#if $$slots[`${position}-start`]}
                    <p>
                        <slot name="extra_primary-start" />
                    </p>
                {:else}
                    <p></p>
                {/if}

                {#if $$slots[`${position}-end`]}
                    <p>
                        <slot name="extra_primary-end" />
                    </p>
                {/if}
            </span>
            <slot name="extra_primary" />
        </div>
    {/if}

    {#if $$slots.extra_secondary}
        {@const position = 'extra_secondary'}
        <div class="flex flex-col items-center justify-center w-full">
            <span
                class="opacity-75 w-full flex items-center {$$slots[
                    `${position}-end`
                ]
                    ? 'justify-between'
                    : 'justify-end'} gap-[0.5vh]"
            >
                {#if $$slots[`${position}-start`]}
                    <p>
                        <slot name="extra_secondary-start" />
                    </p>
                {:else}
                    <p></p>
                {/if}

                {#if $$slots[`${position}-end`]}
                    <p>
                        <slot name="extra_secondary-end" />
                    </p>
                {/if}
            </span>
            <slot name="extra_secondary" />
        </div>
    {/if}

    {#if $$slots.extra_tertiary}
        {@const position = 'extra_tertiary'}
        <div class="flex flex-col items-center justify-center w-full">
            <span
                class="opacity-75 w-full flex items-center {$$slots[
                    `${position}-end`
                ]
                    ? 'justify-between'
                    : 'justify-end'} gap-[0.5vh]"
            >
                {#if $$slots[`${position}-start`]}
                    <p>
                        <slot name="extra_tertiary-start" />
                    </p>
                {:else}
                    <p></p>
                {/if}

                {#if $$slots[`${position}-end`]}
                    <p>
                        <slot name="extra_tertiary-end" />
                    </p>
                {/if}
            </span>
            <slot name="extra_tertiary" />
        </div>
    {/if}

    {#if $$slots.extra_quaternary}
        {@const position = 'extra_quaternary'}
        <div class="flex flex-col items-center justify-center w-full">
            <span
                class="opacity-75 w-full flex items-center {$$slots[
                    `${position}-end`
                ]
                    ? 'justify-between'
                    : 'justify-end'} gap-[0.5vh]"
            >
                {#if $$slots[`${position}-start`]}
                    <p>
                        <slot name="extra_quaternary-start" />
                    </p>
                {:else}
                    <p></p>
                {/if}

                {#if $$slots[`${position}-end`]}
                    <p>
                        <slot name="extra_quaternary-end" />
                    </p>
                {/if}
            </span>
            <slot name="extra_quaternary" />
        </div>
    {/if}

    {#if $$slots.extra_quinary}
        {@const position = 'extra_quinary'}
        <div class="flex flex-col items-center justify-center w-full">
            <span
                class="opacity-75 w-full flex items-center {$$slots[
                    `${position}-end`
                ]
                    ? 'justify-between'
                    : 'justify-end'} gap-[0.5vh]"
            >
                {#if $$slots[`${position}-start`]}
                    <p>
                        <slot name="extra_quinary-start" />
                    </p>
                {:else}
                    <p></p>
                {/if}

                {#if $$slots[`${position}-end`]}
                    <p>
                        <slot name="extra_quinary-end" />
                    </p>
                {/if}
            </span>
            <slot name="extra_quinary" />
        </div>
    {/if}

    {#if $$slots.extra_senary}
        {@const position = 'extra_senary'}
        <div class="flex flex-col items-center justify-center w-full">
            <span
                class="opacity-75 w-full flex items-center {$$slots[
                    `${position}-end`
                ]
                    ? 'justify-between'
                    : 'justify-end'} gap-[0.5vh]"
            >
                {#if $$slots[`${position}-start`]}
                    <p>
                        <slot name="extra_senary-start" />
                    </p>
                {:else}
                    <p></p>
                {/if}

                {#if $$slots[`${position}-end`]}
                    <p>
                        <slot name="extra_senary-end" />
                    </p>
                {/if}
            </span>
            <slot name="extra_senary" />
        </div>
    {/if}
</div>
