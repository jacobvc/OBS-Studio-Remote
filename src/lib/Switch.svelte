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

<style>
.switch-container {
  padding: 3px;
  margin: 1px;
  width: fit-content;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 2px solid var(--border-color);
  background-color: var(--container-background);
  border-radius: 6px;
}


/* The switch - the box around the slider */
.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 22px;
  padding: 0;
  margin: 0;
}

/* Hide default HTML checkbox */
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

/* The slider */
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: red;
  -webkit-transition: .4s;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 0px;
  background-color: var(--control-background);
  -webkit-transition: .4s;
  transition: .4s;
}

.switch-label {
  display: block;
  position: relative;
  width: fit-content;
  margin: 0;
  padding: 0;
}

input:checked+.slider {
  background-color: limegreen;
}

input:focus+.slider {
  box-shadow: 0 0 1px red;
}

input:checked+.slider:before {
  -webkit-transform: translateX(20px);
  -ms-transform: translateX(20px);
  transform: translateX(20px);
}

/* Rounded slider */
.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
  border: 1px solid black;
}
</style>