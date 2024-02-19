<script>
  import './style.css';

  import PtzCamera from './lib/PtzCamera.svelte';
  import AudioMixer from './lib/AudioMixer.svelte';
  import ObsMain from './lib/ObsMain.svelte';
  import Switch from './lib/Switch.svelte';
  import help_data from './lib/help';

  import { onMount, setContext, getContext } from 'svelte';
  import {
    obsModuleVersion,
    obs,
    avDevices,
    obsSendCommand,
    obsConnected,
    avdSendCommand,
    avdConnected,
    showSources,
    useAv,
    editHotkeys,
    obsAddress,
    obsPassword,
    avdAddress,
    avdPassword,
    obsProjOutput,
    runtimeError,
    obsConnectError,
    avdConnectError,
    persistObs,
    obsDataSlot,
    obsPrefsSync,
    saveSettingsToObs,
    loadSettingsFromObs,
    // exportSettings,
    // importSettings,
    themeHue,
    defaultHue,
  } from './lib/Preferences.js';
  import { writable } from 'svelte/store';
  
  import { compareVersions } from 'compare-versions';
  
  let obsServerWebsockVersion = '';
  let tips = writable();
  let help_text;

  let heartbeat = {};
  let heartbeatInterval;

  let openMenu = false;
  let avDeviceList;

  $: $obsConnectError, $avdConnectError, runtimeError;
  /**
   *
   * OBS Section
   *
   */
  async function connect() {
    $obsConnectError = '';
    $obsAddress = $obsAddress || 'localhost:4455';
    if ($obsAddress.indexOf('://') === -1) {
      const secure =
        location.protocol === 'https:' || $obsAddress.endsWith(':443');
      $obsAddress = secure ? 'wss://' : 'ws://' + $obsAddress;
    }
    console.log(
      'Connecting to OBS Studio:',
      $obsAddress,
      '- using password:',
      $obsPassword
    );
    await disconnect();
    try {
      const { obsWebSocketVersion, negotiatedRpcVersion } = await obs.connect(
        $obsAddress,
        $obsPassword
      );
      console.log(
        `Connected to obs-websocket version ${obsWebSocketVersion} (using RPC ${negotiatedRpcVersion})`
      );
    } catch (e) {
      console.log(e);
      //$obsConnectError = e.message;
    }
  }

  async function disconnect() {
    $obsConnected = false;
    await obs.disconnect();
    clearInterval(heartbeatInterval);
    //$obsConnectError = "OBS Disconnected";
  }

  // OBS events
  obs.on('ConnectionClosed', () => {
    clearInterval(heartbeatInterval);
    if ($obsConnected) {
      $obsConnected = false;
      $obsConnectError = 'OBS Studio Connection closed';
    }
  });

  obs.on('Identified', async () => {
    if ($obsDataSlot && $obsPrefsSync) {
      loadSettingsFromObs(true);
    }
    const data = await obsSendCommand('GetVersion');
    obsServerWebsockVersion = data.obsWebSocketVersion || '';
    console.log('OBS-websocket module version:' + obsModuleVersion + ' server version:' + obsServerWebsockVersion);
    /* if (compareVersions(obsServerWebsockVersion, obsModuleVersion) > 0) {
      $runtimeError =
        'Server is runnung OBS-websocket version ' +
          obsServerWebsockVersion +
          ', upgrade this app (from ' + obsModuleVersion + ') for full compatibility.'
      ;
    } */
    if (
      data.supportedImageFormats.includes('webp') &&
      document
        .createElement('canvas')
        .toDataURL('image/webp')
        .indexOf('data:image/webp') === 0
    ) {
    }
    heartbeatInterval = setInterval(async () => {
      const stats = await obsSendCommand('GetStats');
      const streaming = await obsSendCommand('GetStreamStatus');
      const recording = await obsSendCommand('GetRecordStatus');
      heartbeat = { stats, streaming, recording };
      // console.log(heartbeat);
    }, 1000); // Heartbeat
    console.log('OBS Studio Connected');
    $obsConnected = true;
  });

  obs.on('ConnectionError', async () => {
    $obsConnectError = 'Failed to Connect';
    $obsConnected = false;
  });

  /**
   *
   * A/V Section
   *
   */
  async function avdConnect() {
    $avdConnectError = '';
    $avdAddress = $avdAddress || 'localhost:4443';
    if ($avdAddress.indexOf('://') === -1) {
      const secure =
        location.protocol === 'https:' || $avdAddress.endsWith(':443');
      $avdAddress = secure ? 'wss://' : 'ws://' + $avdAddress;
    }
    console.log(
      'Connecting to A/V Devices:',
      $avdAddress,
      '- using password:',
      $avdPassword
    );
    avDevices.disconnect();
    try {
      const { obsWebSocketVersion, negotiatedRpcVersion } =
        await avDevices.connect($avdAddress, $avdPassword);
    } catch (e) {
      console.log(e);
      //$avdConnectError = e.message;
    }
  }

  avDevices.on('Identified', async () => {
    //document.location.hash = $obsAddress; // For easy bookmarking
    var servername = '';
    var serverversion = '';
    const data = await avdSendCommand('GetVersion');
    servername = data.server;
    serverversion = data.versionStr;
    obsServerWebsockVersion = data.obsWebSocketVersion || '';
    console.log('OBS-websocket version:', obsServerWebsockVersion);
    /*
    if (compareVersions(obsServerWebsockVersion, obsModuleVersion) > 0) {
      alert(
        'You are running an outdated OBS-websocket (version ' +
          obsServerWebsockVersion +
          '), please upgrade to the latest version for full compatibility.'
      );
    } */
    avDeviceList = await avdSendCommand('GetAvDevices');
    $avdConnected = true;
    console.log('A/V Devices Connected');
  });

  async function avDisconnect() {
    $avdConnected = false;
    await avDevices.disconnect();
    //$avdConnectError = "A/V Disconnected";
  }

  avDevices.on('ConnectionClosed', () => {
    if ($avdConnected) {
      $avdConnected = false;
      $avdConnectError = 'A/V Device connection closed';
    }
  });

  // @ts-ignore
  avDevices.on('ConfigurationChanged', (changedata) => {
    avdSendCommand('GetAvDevices')
      .then(function (data) {
        avDeviceList = data;
      })
      .catch((err) => {
        console.log(err);
      });
  });

  // @ts-ignore
  avDevices.on('Exiting', async (data) => {
    if ($avdConnected) {
      //alert("AV Devices exited");
      await avDisconnect();
      $avdConnectError = 'A/V Device shut down';
    }
  });

  avDevices.on('ConnectionError', async () => {
    $avdConnectError = 'Failed to Connect';
    //document.getElementById("password").focus();
    if (!$avdPassword) {
      $avdConnected = false;
    } else {
      await connect();
    }
  });

  onMount(async () => {
    //
    //
    // REGISTER SERVICE WORKER HERE
    //
    //

    setHue();

    if ($obsAddress !== '') {
      await connect();
    }
    if ($useAv && $avdAddress !== '') {
      avdConnect();
    }
  });

  function setHue() {
    document.documentElement.style.setProperty('--theme-color-h', $themeHue);
  }

  function ShowTip() {
    if ($tips) {
      let obj = help_data.find((help_data) => help_data.topic === $tips);
      if (obj) {
        help_text = obj.text;
      }
    } else {
      help_text = null;
    }
  }
</script>

<main>
  <nav class="nav">
    <img
      class="icon-img"
      src="favicon.png"
      alt="OBS Client"
      class:rotate="{$obsConnected}" />
    {#if $avdConnected}
      <img class="icon-img" src="avdevice.gif" alt="A/V Client" />
    {/if}
    {#if $runtimeError}
      <div class="error-report">
        {@html $runtimeError}
        <button
          class="btn-default btn-tiny"
          on:click="{() => ($runtimeError = '')}">
          <img style="margin-top:-10px"
          src="menu-x-50.png" alt="close"
          width="24" />        </button>
      </div>
    {:else}
      <div
        class="container"
        style="margin-top: 7px; background-color: transparent;">
        <h1>OBS Studio Remote</h1>
      </div>
    {/if}
    <button
      class="btn-default"
      style="float:right; margin-right:8px; margin-top:5px; padding-top: 3px;"
      on:click="{() => (openMenu = !openMenu)}">
      <img
        src="{openMenu ? 'menu-x-50.png' : 'menu-hamburger-24.png'}"
        alt="menu"
        width="24" /></button>
    <hr />

    <div class:invisible="{!openMenu}">
      <div class="container">
        <div class="content-flex">
          <Switch label="Show Sources" binding="{showSources}" />
          <Switch label="Use A/V" binding="{useAv}" />
          <Switch label="Edit Hotkeys" binding="{editHotkeys}" />
        </div>
        <label for="showtip">Show Help</label>
        <select bind:value="{$tips}" title="Tips" on:change="{() => ShowTip()}">
          <option value="">none</option>
          {#each help_data as data}
            <option value="{data.topic}">{data.topic}</option>
          {/each}
        </select>
      </div>
      <div class="container">
        <div class="content-block">
          <label for="">Settings Persist</label>
          <select bind:value="{$persistObs}" title="Persist">
            <option value="browser">Browser</option>
            <option value="obs">OBS Studio</option>
          </select>
          <br />
          {#if $persistObs === 'obs'}
            OBS Slot Name
            <input type="text" size="8" bind:value="{$obsDataSlot}" />
            Sync<input type="checkbox" bind:checked="{$obsPrefsSync}" />
            <br />
            {#if $obsConnected}
              <button class="btn-default" on:click="{() => saveSettingsToObs()}"
                >Save</button>
              <button
                class="btn-default"
                on:click="{() => {
                  if (loadSettingsFromObs(false)) location.reload();
                }}">
                Load
              </button>
            {/if}
          {/if}
          <!--
          <button class="btn-default" on:click="{() => {
            if (importSettings()) location.reload(); }}">
            Import
          </button>
          <button class="btn-default" on:click="{() => exportSettings()}">
            Export
          </button>
          -->
        </div>
      </div>
      <div class="container">
        <div class="subpanel-3row-flow">
          <span
            ><label for="" style="vertical-align: top; padding-top:3px;"
              >Color:</label
            ><input
              class="hue-slider"
              type="range"
              min="0"
              max="360"
              on:change="{() => setHue()}"
              on:pointermove="{() => setHue()}"
              bind:value="{$themeHue}" />
            {#if $themeHue != defaultHue}
              <button
                class="btn-default btn-tiny"
                on:click="{() => {
                  $themeHue = defaultHue;
                  setHue();
                }}">
                Rst
              </button>
            {/if}
          </span>
          {#if $obsConnected}
            <button class="btn-default" on:click="{() => disconnect()}">
              Disconnect OBS Studio
            </button>
          {/if}
          {#if $avdConnected}
            <button class="btn-default" on:click="{() => avDisconnect()}">
              Disconnect A/V Devices
            </button>
          {/if}
        </div>
        </div>
        <div class="container">
          <div class="subpanel-3row-flow">
          Websocket Version<br>Client {obsModuleVersion}<br>OBS {obsServerWebsockVersion }
          </div>
        </div>
      <div class="instructions" class:invisible="{!help_text}">
        <hr />
        {@html help_text}
      </div>
      <hr />
    </div>
  </nav>

  {#if !$obsConnected || ((!$avdConnected || !avDeviceList) && $useAv)}
    <div class="container" style="width:100%">
      <h3>
        <center>
          OBS Studio
          {#if $useAv}
            AND A/V Devices -
          {/if}
          Connect
        </center>
      </h3>

      {#if document.location.protocol === 'https:'}
        <div class="instructions">
          You are checking this page on a secure HTTPS connection. That's great,
          but it means you can
          <strong>only</strong>
          connect to WSS (secure websocket) addresses, for example OBS exposed with
          <a href="https://ngrok.com/">ngrok</a>
          or
          <a href="https://pagekite.net/">pagekite</a>
          . If you want to connect to a local OBS instance,
          <strong>
            <a
              href="http://{document.location.hostname}{document.location.port
                ? ':' + document.location.port
                : ''}{document.location.pathname}">
              please click here to load the non-secure version of this page
            </a>
          </strong>
          .
        </div>
      {/if}

      {#if !$obsConnected}
        <form on:submit|preventDefault="{connect}">
          <div class="field is-grouped">
            <p class="control is-expanded">
              <label style="width:155px;" for="host"
                >OBS Studio: Host:Port</label>
              <input
                id="host"
                bind:value="{$obsAddress}"
                type="text"
                size="15"
                autocomplete=""
                placeholder="localhost:4455" />
              Password
              <input
                id="password"
                bind:value="{$obsPassword}"
                type="password"
                size="10"
                autocomplete="current-password"
                placeholder="Empty if none" />
              <button class="btn-default">Connect</button>
              {#if $obsConnectError}
                <div class="error-report">{$obsConnectError}</div>
              {/if}
            </p>
          </div>
        </form>
      {/if}
      {#if (!$avdConnected || !avDeviceList) && $useAv}
        <form on:submit|preventDefault="{avdConnect}">
          <div class="field is-grouped">
            <p class="control is-expanded">
              <label style="width:155px;" for="avdHost"
                >A/V Devices: Host:Port</label>
              <input
                id="avdHost"
                bind:value="{$avdAddress}"
                type="text"
                size="15"
                autocomplete=""
                placeholder="localhost:4443" />
              Password
              <input
                id="avdPassword"
                bind:value="{$avdPassword}"
                type="password"
                size="10"
                autocomplete="current-avd-password"
                placeholder="Empty if none" />
              <button class="btn-default">Connect</button>
              {#if $avdConnectError}
                <div class="error-report">{$avdConnectError}</div>
              {/if}
            </p>
          </div>
        </form>
      {/if}
    </div>
  {/if}

  {#if $obsConnected}
    <ObsMain />
  {/if}
  {#if $avdConnected && avDeviceList}
    {#each avDeviceList.devices as avDevice}
      {#if avDevice.devicetype === 'viscacamera'}
        <PtzCamera camera="{avDevice}" />
      {:else if avDevice.devicetype === 'mixer'}
        <AudioMixer mixer="{avDevice}" />
      {/if}
    {/each}
  {/if}
</main>

<style>
.hue-slider {
  -webkit-appearance: none;
  margin-top: 6px;
  /* made this with a script and pasted it into the stylesheet */
  background: -webkit-linear-gradient(left, hsla(0, 50%, 50%, 1), hsla(10, 50%, 50%, 1), hsla(20, 50%, 50%, 1), hsla(30, 50%, 50%, 1), hsla(40, 50%, 50%, 1), hsla(50, 50%, 50%, 1), hsla(60, 50%, 50%, 1), hsla(70, 50%, 50%, 1), hsla(80, 50%, 50%, 1), hsla(90, 50%, 50%, 1), hsla(100, 50%, 50%, 1), hsla(110, 50%, 50%, 1), hsla(120, 50%, 50%, 1), hsla(130, 50%, 50%, 1), hsla(140, 50%, 50%, 1), hsla(150, 50%, 50%, 1), hsla(160, 50%, 50%, 1), hsla(170, 50%, 50%, 1), hsla(180, 50%, 50%, 1), hsla(190, 50%, 50%, 1), hsla(200, 50%, 50%, 1), hsla(210, 50%, 50%, 1), hsla(220, 50%, 50%, 1), hsla(230, 50%, 50%, 1), hsla(240, 50%, 50%, 1), hsla(250, 50%, 50%, 1), hsla(260, 50%, 50%, 1), hsla(270, 50%, 50%, 1), hsla(280, 50%, 50%, 1), hsla(290, 50%, 50%, 1), hsla(300, 50%, 50%, 1), hsla(310, 50%, 50%, 1), hsla(320, 50%, 50%, 1), hsla(330, 50%, 50%, 1), hsla(340, 50%, 50%, 1), hsla(350, 50%, 50%, 1), hsla(360, 50%, 50%, 1));
  border: 2px solid white;
  height: 15px;
  outline: none;
  opacity: 0.7;
  -webkit-transition: .2s;
  transition: opacity .2s;
}

.hue-slider:hover {
  opacity: 1;
}

.hue-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 11px;
  height: 13px;
  background: var(--control-background);
  border: 1px solid white;
  cursor: pointer;
}

.hue-slider::-moz-range-thumb {
  width: 11px;
  height: 13px;
  background: var(--control-background);
  border: 1px solid white;
  cursor: pointer;
}

</style>