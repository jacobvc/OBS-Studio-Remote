<script>
    // binding MUST BE a writable
    export let binding = null;
    export let label;
</script>

<div class="switch-container">
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="switch-label">{label}</label>
    <label class="switch">
        <input type="checkbox" bind:checked="{$binding}" />
        <span class="slider round"></span>
    </label>
</div>
