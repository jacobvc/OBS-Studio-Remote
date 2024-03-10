<script>
  import { onMount, onDestroy } from 'svelte';
  import {
    avdSendCommand,
    obsSendCommand,
    obsConnected,
  } from './Preferences.js';

  export let camera;

  let velocity;
  let presets;
  let screenshotInterval;
  let camView = {};
  export let imageFormat = 'jpg';
  let imageUnits = 13;
  let imageWidth = imageUnits * 18;
  let imageHeight = imageUnits * 10;

  let turboShots = 0;
  let totalCycles = 0;

  let noObsSource;

  $: $obsConnected;

  onMount(async () => {
    screenshotInterval = setInterval(getScreenshot, 125);
  });

  onDestroy(() => {
    clearInterval(screenshotInterval);
  });

  async function getScreenshot() {
    ++totalCycles;
    if (turboShots > 0) {
      // turbo active. samle every intervaal
      --turboShots;
    }
    else if ((totalCycles % 8) != 0) {
      // Normal mode. Sample every eighth interval
      return;
    }
    if ($obsConnected) {
      if (camera && camera.name && camera.active && !noObsSource) {
        let data = await obsSendCommand('GetSourceScreenshot', {
          sourceName: camera.name,
          imageFormat: imageFormat,
          imageWidth: imageWidth,
          imageHeight: imageHeight,
        });
        if (data && data.imageData) {
          camView.style.backgroundImage = `url(${data.imageData})`;
          camView.style.backgroundRepeat = 'no-repeat';
        }
      }
    }
  }

  function ConnectCamera(camera) {
    console.log('ConnectCamera(' + camera.name + ')');
    avdSendCommand('Connect', { cameraname: camera.name });
  }

  //function DisconnectCamera(cameraname) {
  //    avdSendCommand('Disconnect', { "cameraname": cameraname });
  //}

  function MovePtz(cameraname, direction) {
    avdSendCommand('MovePtz', {
      cameraname: cameraname,
      direction: direction,
      amount: velocity.value,
    });
    turboShots = 3 * 8;
  }

  function Zoom(cameraname, direction) {
    avdSendCommand('Zoom', {
      cameraname: cameraname,
      direction: direction,
      amount: velocity.value,
    });
    turboShots = 3 * 8;
  }

  function Preset(cameraname) {
    avdSendCommand('Preset', { cameraname: cameraname, preset: presets.value });
    presets.selectedIndex = -1;
    turboShots = 6 * 8;
  }
</script>

<div class="container">
  <h2 class="content-heading">
    {camera.name}
    <button
      class="btn-default item-in-h2 right"
      class:invisible="{camera.active}"
      on:click="{() => ConnectCamera(camera)}"
      type="submit">
      Connect
    </button>
    <span
      class="item-in-h2 right"
      class:invisible="{!camera.active}">
      <label for="">No OBS Source</label>
      <input type="checkbox"
      bind:checked="{noObsSource}"
      />
    </span>
  </h2>
  <div
    class="content-block "
    bind:this="{camView}"
    class:disabledpanel="{!camera.active}">
    <div class="ptz-velocity">
      <input
        bind:this="{velocity}"
        type="range"
        class="vertical"
        min="1"
        max="100"
        value="10"
        placeholder="50" />
    </div>
    <div class="ptz-btns-group">
      <button class:ptz-btn="{true}"
        on:mousedown="{() => Zoom(camera.name, 'in')}" 
        on:mouseup="{() => Zoom(camera.name, 'stop')}">
        In
      </button>
      <button class:ptz-btn="{true}"
      on:mousedown="{() => Zoom(camera.name, 'out')}" 
      on:mouseup="{() => Zoom(camera.name, 'stop')}">
        Out
      </button>
    </div>
    <button class:ptz-btn="{true}" class:pan-btn-pos="{true}"
    on:mousedown="{() => MovePtz(camera.name, 'left')}" 
    on:mouseup="{() => MovePtz(camera.name, 'stop')}">
      Left
    </button>
    <div class="ptz-btns-group">
      <button class:ptz-btn="{true}" 
      on:mousedown="{() => MovePtz(camera.name, 'up')}" 
      on:mouseup="{() => MovePtz(camera.name, 'stop')}">
          Up
      </button>
      <button class:ptz-btn="{true}" 
      on:mousedown="{() => MovePtz(camera.name, 'down')}" 
      on:mouseup="{() => MovePtz(camera.name, 'stop')}">
          Down
      </button>
    </div>
    <button class:ptz-btn="{true}" class:pan-btn-pos="{true}"
    on:mousedown="{() => MovePtz(camera.name, 'right')}" 
    on:mouseup="{() => MovePtz(camera.name, 'stop')}">
      Rght
    </button>
    <div data-tap-disabled="true" class="ptz-select-container" >
      &nbsp;&nbsp;Presets<br />
      <select
        bind:this="{presets}"
        title="Presets"
        size="5"
        on:change="{() => Preset(camera.name)}">
        {#if camera.presets}
          {#each camera.presets.split(',') as option}
            <option value="{option}">{option}</option>
          {/each}
        {/if}
      </select>
    </div>
  </div>
</div>

<style>
input.vertical {
  transform: translateX(-35px) translateY(50px) rotate(-90deg);
  width: 98px;
  height: 28px;
  vertical-align: top;
  position: relative;
}

.ptz-select-container {
  display: inline-block;
}

.ptz-velocity {
  display: inline-block;
  top: -98px;
  position: relative;
  width: 36px;
}

.ptz-btns-group {
  display: inline-block;
  position: relative;

  top: -22px;
  max-width: 45px;
  min-width: 0px;
}

.pan-btn-pos {
  position: relative;
  top: -44px;
}

.ptz-btn {
  height: 45px;
  width: 45px;
  border-radius: 10px;
  background-color: rgba(var(--control-background), 15%);
  border-color: var(--border-color);
}

</style>