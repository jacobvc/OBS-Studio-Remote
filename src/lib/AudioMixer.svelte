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
      class="btn-default btn-in-h2"
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
