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
      if (camera && camera.name) {
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
      class="btn-default btn-in-h2"
      class:invisible="{camera.active}"
      on:click="{() => ConnectCamera(camera)}"
      type="submit">
      Connect
    </button>
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
        value="20"
        placeholder="50" />
    </div>
    <div class="ptz-btns-group">
      <button on:click="{() => Zoom(camera.name, 'in')}" class:ptz-btn="{true}">
        In
      </button>
      <button
        on:click="{() => Zoom(camera.name, 'out')}"
        class:ptz-btn="{true}">
        Out
      </button>
    </div>
    <button
      on:click="{() => MovePtz(camera.name, 'left')}"
      class:ptz-btn="{true}"
      class:pan-btn-pos="{true}">
      Left
    </button>
    <div class="ptz-btns-group">
      <button
        on:click="{() => MovePtz(camera.name, 'up')}"
        class:ptz-btn="{true}">
        Up
      </button>
      <button
        on:click="{() => MovePtz(camera.name, 'down')}"
        class:ptz-btn="{true}">
        Down
      </button>
    </div>
    <button
      on:click="{() => MovePtz(camera.name, 'right')}"
      class:ptz-btn="{true}"
      class:pan-btn-pos="{true}">
      Rght
    </button>
    <div data-tap-disabled="true" style="display: inline-block; ">
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
