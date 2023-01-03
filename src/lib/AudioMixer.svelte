<script>
  import ResizeObserver from 'svelte-resize-observer';
  import { avDevices } from './Preferences.js';
  import { obsSendCommand, avdSendCommand } from './Preferences.js';

  export let mixer;

  let volumeMap = [];
  let volumeSettingMap = [];
  let muteMap = [];

  function channelKey(mixername, channelname) {
    return mixername + '-' + channelname;
  }

  function ConnectMixer(mixer) {
    console.log('ConnectMixer(' + mixer.name + ')');
    avdSendCommand('Connect', { cameraname: mixer.name });
  }
  function VolumeSetting(mixername, channelname) {
    let item = volumeSettingMap[channelKey(mixername, channelname)];
    if (item) {
      avdSendCommand('VolumeSetting', {
        mixername: mixername,
        channelname: channelname,
        value: item.value,
      });
    }
  }

  function indicate_mute(elem, mute) {
    if (mute) {
      elem.classList.remove('audio-btn-unmuted');
    } else {
      elem.classList.add('audio-btn-unmuted');
    }
  }
  function switch_mute(mixername, channelname) {
    var muting = false;
    let item = muteMap[channelKey(mixername, channelname)];
    if (item.classList.contains('audio-btn-unmuted')) {
      // Already muted, unmute
      muting = true;
    }
    console.log(
      'switch_mute(' + mixername + ', ' + channelname + ': ' + muting + ')'
    );
    indicate_mute(item, muting);
    avdSendCommand('Mute', {
      mixername: mixername,
      channelname: channelname,
      value: muting,
    });
  }

  avDevices.on('VolumeSettingChanged', (data) => {
    let item = volumeSettingMap[channelKey(data.mixername, data.channelname)];
    if (item) item.value = data.value;
  });

  avDevices.on('VolumeLevelChanged', (data) => {
    let item = volumeMap[channelKey(data.mixername, data.channelname)];
    if (item) item.value = data.value;
  });
  avDevices.on('MuteChanged', (data) => {
    let item = muteMap[channelKey(data.mixername, data.channelname)];
    if (item) indicate_mute(item, data.value);
  });

  function resizeComputed(container) {
    if (!container) return;
    // The child of interest is the first class named: audio-rotated-container
    let child = container.getElementsByClassName('audio-rotated-container')[0];
    child.style.width = container.clientHeight + 'px';
    if (
      (container.w && container.w !== container.clientWidth) ||
      (container.h && container.h !== container.clientHeight)
    ) {
      // Container size changed
      // Set the child's (rotated) height to the container's width style
      child.style.Height = container.style.width;
    } else {
      // Child size changed
      // Set the container's width style to the child's (rotated) height
      container.style.width = child.clientHeight + 'px';
      // Set the child's (rotated) height style to the container's clientWidth
      child.style.Height = container.clientWidth - 30 + 'px';
    }
    // Remember the current size
    container.w = container.clientWidth;
    container.h = container.clientHeight;

    return '';
  }
</script>

<div class="container resizable">
  <ResizeObserver on:resize="{(e) => resizeComputed(e.detail)}" />
  <h2 class="content-heading">
    {mixer.name}
    <button
      class="btn-default item-in-h2 right"
      class:invisible="{mixer.active}"
      on:click="{() => ConnectMixer(mixer)}"
      type="submit">
      Connect
    </button>
  </h2>
  <div class="content-flex audio-rotated-container">
    <div class="content-block audio-container">
      {#if mixer.channels}
        {(volumeMap = [])}
        {(muteMap = [])}
        {(volumeSettingMap = [])}
        {#each mixer.channels as channel}
          <div class="audio-channel-wrap">
            <div class="audio-channel">
              <input
                class="audio-btn"
                class:audio-btn-unmuted="{!channel.mute}"
                bind:this="{muteMap[channelKey(mixer.name, channel.name)]}"
                on:click="{() => switch_mute(mixer.name, channel.name)}"
                type="submit"
                name="{channel.name}"
                value="{channel.name}" />
              <input
                type="range"
                class="audio"
                min="0"
                max="127"
                value="{channel.volumesetting}"
                placeholder="0"
                bind:this="{volumeSettingMap[
                  channelKey(mixer.name, channel.name)
                ]}"
                on:input="{() => VolumeSetting(mixer.name, channel.name)}" />
              <datalist>
                <option value="0"></option>
                <option value="13"></option>
                <option value="26"></option>
                <option value="39"></option>
                <option value="52"></option>
                <option value="65"></option>
                <option value="78"></option>
                <option value="91"></option>
                <option value="104"></option>
                <option value="117"></option>
                <option value="127"></option>
              </datalist>
              <progress
                value="19"
                max="127"
                class="audio"
                bind:this="{volumeMap[channelKey(mixer.name, channel.name)]}"
              ></progress>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>

<style>
/* **** Progress **** */
.container div progress {
  vertical-align: top;
  position: relative;
  top: 6px;
  left: 25px;
}

/*
progress.vertical {
  width: 96px;
  height: 4px;
  position: relative;
  margin: 10px auto;
  background-color: var(--control-background);
  box-shadow: 0 0 3px #c3e7a5 inset, 0 0 2px rgba(228, 103, 103, 0.9);
  border-radius: 0px;
  padding: 0px;
  transform-origin: top left;
  transform: translateX(20px) translateY(-13px) rotate(90deg);
  -webkit-appearance: none;
  appearance: none;
}
*/

progress.audio {
  width: calc(100% - 25px);
  height: 4px;
  grid-column: 1;
  grid-row: 2;
}

/* value: */
progress::-webkit-progress-value {
  background-color: rgb(37, 228, 53) !important;
}

progress::-moz-progress-bar {
  background-color: rgb(37, 228, 53) !important;
}

progress[value]::-webkit-progress-value {
  background-color: rgb(37, 228, 53);
}

/* background: */
progress::-webkit-progress-bar {
  background-color: black;
  width: 100%;
}

progress {
  background-color: var(--body-background);
}

/* **** AUDIO Container **** */
.audio-rotated-container {
  width: fit_content;
  transform: translateX(-100%) translateY(-00%) rotate(-90deg);
  transform-origin: 100% 0%;
}

.audio-container {
  position: relative;
  width: 100%;
}

.audio-channel-wrap {
  max-height: 55px;
  min-width: 110px;
  top: 0;
  position: relative;
  width: 100%;
  padding: 1px;
  border: 1px solid var(--border-color);
}

.audio-channel {
  display: grid;
  position: relative;
  grid-template-columns: calc(100% - 20px) 20px;
  grid-template-rows: 28px 28px;
  margin-right: 2px;
  min-width: 10px;
  width: 100%;
  border: 2px;
  border-radius: 8px;
  background-color: var(--control-background);
  padding: 1px;
}

/* **** audio Range input **** */
.container input[type=range] {
  background-color: transparent;
  background-image: url('../assets/11lines.png');
  background-repeat: no-repeat;
  background-size: 100%;
  background-position-y: 2px;
  color: var(--text-color);
}

input.audio {
  position: relative;
  width: calc(100% - 25px);
  appearance: none;
  transform-origin: top left;
  top: 3px;
  left: 25px;
  margin: 0px;
  grid-column: 1;
  grid-row: 1;

}

input.audio::-webkit-slider-runnable-track {
  background-color: black;
  height: 2px;
}
input.audio::-moz-range-track {
  background-color: black;
  height: 2px;
}
input.audio::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  margin-top: -7px;
  width: 24px;
  height: 16px;
  border: 0;
  background: url('../assets/slider_knob.png');
  cursor: pointer;
}

input.audio::-moz-range-thumb {
  width: 24px;
  height: 16px;
  border: 0;
  background: url('../assets/slider_knob.png');
  cursor: pointer;
}

/* **** Audio Mute Button **** */
.audio-btn {
  display: inline-grid;
  position: relative;
  border-color: var(--border-color);
  background-color: var(--control-background);
  color: var(--text-color);
  width: 55px;
  height: 21px;
  max-height: 21px;
  padding: 0px;
  margin: 0px;
  transform-origin: left bottom;
  transform: translateY(-100%) rotate(90deg);
  grid-row-start: 1;
  grid-row-end: 3;
  grid-column: 2;

}

.audio-btn-unmuted {
  box-shadow: 0px 0px 10px lime;
  background-color: lime;
  color: black;
}

</style>