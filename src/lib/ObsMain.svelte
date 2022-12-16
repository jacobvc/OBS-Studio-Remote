<script>
  import { onMount, onDestroy } from 'svelte';
  import {
    obs,
    obsSendCommand,
    showSources,
    obsConnected,
    hotkeys,
  } from './Preferences.js';
  import Hotkey from './Hotkey.svelte';

  export let imageFormat = 'jpg';

  let isStudioMode = false;
  let programSceneName = '';
  let previewSceneName = '';

  let program = {};
  let preview = {};
  let screenshotInterval;
  let imageUnits = 18;
  let imageWidth = imageUnits * 18;
  let imageHeight = imageUnits * 10;
  let scenes;

  let previewSources;
  let programSources;

  onMount(async () => {
    let data;

    let scenelist = await obsSendCommand('GetSceneList');
    if (scenelist.scenes) {
      scenes = scenelist.scenes.reverse();

      //if (!programSceneName) {
      data = await obsSendCommand('GetCurrentProgramScene');
      ChangeProgramScene(data.currentProgramSceneName || '');
      //}
      data = await obsSendCommand('GetStudioModeEnabled');
      if (data && data.studioModeEnabled) {
        isStudioMode = true;
        data = await obsSendCommand('GetCurrentPreviewScene');
        ChangePreviewScene(data.currentPreviewSceneName || '');
      }
      screenshotInterval = setInterval(getScreenshot, 1000);
    }
  });

  onDestroy(() => {
    clearInterval(screenshotInterval);
  });

  async function select(which, name) {
    console.log('SetCurrent' + which + '(' + name + ')');
    await obsSendCommand('SetCurrent' + which + 'Scene', { sceneName: name });
  }

  // eslint-disable-next-line
  $: getScreenshot(), programSceneName, previewSceneName;

  async function GetSources(scene_name) {
    let sources = null;
    let items = await obsSendCommand('GetSceneItemList', {
      sceneName: scene_name,
    });
    if (items) {
      sources = items.sceneItems.reverse();
    }
    return sources;
  }

  async function ChangePreviewScene(name) {
    previewSceneName = name;
    previewSources = await GetSources(name);
  }

  async function ChangeProgramScene(name) {
    programSceneName = name;
    programSources = await GetSources(name);
  }

  async function switch_src(scene_name, item_id, enabled) {
    console.log(
      'switch_src(' + scene_name + ', ' + item_id + ', ' + enabled + ')'
    );
    await obsSendCommand('SetSceneItemEnabled', {
      sceneName: scene_name,
      sceneItemId: item_id,
      sceneItemEnabled: enabled,
    });
    if (scene_name == previewSceneName) {
      previewSources = await GetSources(scene_name);
    }
  }

  async function switch_pgm_src(scene_name, item_id, enabled) {
    await switch_src(scene_name, item_id, enabled);
    // Set current scene for change to take effect on PROGRAM
    await select('Program', scene_name);
  }
  async function switch_pvw_src(scene_name, item_id, enabled) {
    await switch_src(scene_name, item_id, enabled);
  }

  obs.on('StudioModeStateChanged', async (data) => {
    //console.log("StudioModeStateChanged", data.studioModeEnabled);
    isStudioMode = data.studioModeEnabled;
    if (isStudioMode) {
      ChangePreviewScene(programSceneName);
    }
  });

  obs.on('SceneListChanged', async (data) => {
    //console.log('SceneListChanged', data.scenes.length)
    scenes = data.scenes.reverse();
  });

  obs.on('CurrentPreviewSceneChanged', async (data) => {
    //console.log("CurrentPreviewSceneChanged", data.sceneName);
    ChangePreviewScene(data.sceneName);
  });

  obs.on('CurrentProgramSceneChanged', async (data) => {
    //console.log("CurrentProgramSceneChanged", data.sceneName);
    await ChangeProgramScene(data.sceneName);
  });

  obs.on('SceneNameChanged', async (data) => {
    if (data.oldSceneName === programSceneName)
      ChangeProgramScene(data.sceneName);
    if (data.oldSceneName === previewSceneName)
      ChangePreviewScene(data.sceneName);
    for (let i = 0; i < scenes.length; i++) {
      if (scenes[i].sceneName === data.oldSceneName) {
        scenes[i].sceneName = data.sceneName;
      }
    }
  });

  async function getScreenshot() {
    if (programSceneName && $obsConnected) {
      let data = await obsSendCommand('GetSourceScreenshot', {
        sourceName: programSceneName,
        imageFormat: imageFormat,
        imageWidth: imageWidth,
        imageHeight: imageHeight,
      });
      if (data && data.imageData && program) {
        program.src = data.imageData;
        program.className = '';
      }

      if (isStudioMode) {
        if (previewSceneName !== programSceneName) {
          data = await obsSendCommand('GetSourceScreenshot', {
            sourceName: previewSceneName,
            imageFormat: imageFormat,
            imageWidth: imageWidth,
            imageHeight: imageHeight,
          });
        }
        if (data && data.imageData && preview) {
          preview.src = data.imageData;
        }
      }
    }
  }
</script>

<div>
  {#if $hotkeys.above}
    <div style="display:flex" class="container">
      <Hotkey />
    </div>
  {/if}
</div>
<div class="container">
  {#if isStudioMode}
    <div class="content-flex">
      <h2 class="content-heading-vertical">Projector</h2>
      <img bind:this="{preview}" height="{imageHeight}" alt="Preview" />
      <div class="subpanel-2row-flow">
        {#if scenes}
          {#each scenes as scene}
            <button
              class:btn-classic="{true}"
              class:preview-btn-on="{scene.sceneName == previewSceneName}"
              on:click="{() => select('Preview', scene.sceneName)}">
              {scene.sceneName}
            </button>
          {/each}
        {/if}
      </div>
    </div>
    {#if previewSources && $showSources}
      <div class="content-flex">
        <h2 class="content-heading-vertical">Source</h2>
        <div class="subpanel-source-btns">
          {#each previewSources as item}
            <button
              class:source-btn-on="{item.sceneItemEnabled}"
              class:source-btn-size="{true}"
              class:btn-classic="{true}"
              on:click="{() =>
                switch_pvw_src(
                  previewSceneName,
                  item.sceneItemId,
                  !item.sceneItemEnabled
                )}">
              {item.sourceName}
            </button>
          {/each}
        </div>
      </div>
    {/if}
  {/if}
</div>
<div class="container">
  <div class="content-flex">
    <h2 class="content-heading-vertical">Program</h2>
    <img bind:this="{program}" height="{imageHeight}" alt="Program" />
    <div class="subpanel-2row-flow">
      {#if scenes}
        {#each scenes as scene}
          <button
            class:btn-classic="{true}"
            class:program-btn-on="{scene.sceneName == programSceneName}"
            on:click="{() => select('Program', scene.sceneName)}">
            {scene.sceneName}
          </button>
        {/each}
      {/if}
    </div>
  </div>
  {#if programSources && $showSources}
    <div class="content-flex">
      <h2 class="content-heading-vertical">Source</h2>
      <div class="subpanel-source-btns">
        {#each programSources as item}
          <button
            class:source-btn-on="{item.sceneItemEnabled}"
            class:source-btn-size="{true}"
            class:btn-classic="{true}"
            on:click="{() =>
              switch_pgm_src(
                programSceneName,
                item.sceneItemId,
                !item.sceneItemEnabled
              )}">
            {item.sourceName}
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>
<div>
  {#if !$hotkeys.above}
    <div style="display:flex" class="container">
      <Hotkey />
    </div>
  {/if}
</div>

