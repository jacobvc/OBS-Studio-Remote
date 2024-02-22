<script>
  import { onMount, onDestroy } from 'svelte';
  import {
    obs,
    obsSendCommand,
    showSources,
    obsConnected,
    obsProjOutput,
    obsProjScene,
  } from './Preferences.js';
  import Hotkey from './Hotkey.svelte';

  export let imageFormat = 'jpg';

  let isStudioMode = false;

  let program = {};
  let projector = {};
  let screenshotInterval;
  let imageUnits = 18;
  let imageWidth = imageUnits * 18;
  let imageHeight = imageUnits * 10;
  let scenes;

  let monitors = [];
  const PROJECTOR_NONE = 0;
  const PROJECTOR_PREVIEW = 1;
  const PROJECTOR_FIRST_DISPLAY = 2;

  let projectorSceneName = ''; // Current scene name for projector

  let projectorSources = [];    // Sources in projectorSceneName for non-preview projector
  let projectorSelection = '';  // Selected item in projectorSources
  let projectorSelectionSources = []; // Sources in projectorSelection

  let programSceneName = '';   // Current scene name for program
  let programSources = [];      // Sources for program
  
  onMount(async () => {
    let data;

    let scenelist = await obsSendCommand('GetSceneList');
    if (scenelist.scenes) {
      scenes = scenelist.scenes.reverse();

      //if (!programSceneName) {
      data = await obsSendCommand('GetCurrentProgramScene');
      ProgramActivateScene(data.currentProgramSceneName || '');
      //}
      data = await obsSendCommand('GetStudioModeEnabled');
      if (data && data.studioModeEnabled) {
        isStudioMode = true;
        if ($obsProjOutput == PROJECTOR_PREVIEW) {
          // In preview mode, activate projector scene from preview
          data = await obsSendCommand('GetCurrentPreviewScene');
          ProjectorActivateScene(data.currentPreviewSceneName || '');
        }
      }
      let monitorlist = await obsSendCommand('GetMonitorList');
      if (monitorlist.monitors) {
        monitors = [
          { value: 0, name: 'None' },
          { value: 1, name: 'Preview' },
        ];
        for (let i = 0; i < monitorlist.monitors.length; i++) {
          monitors[i + PROJECTOR_FIRST_DISPLAY] = {};
          monitors[i + PROJECTOR_FIRST_DISPLAY].value =
            i + PROJECTOR_FIRST_DISPLAY;
          monitors[i + PROJECTOR_FIRST_DISPLAY].name =
            monitorlist.monitors[i].monitorName;
        }
      }

      if ($obsProjOutput > PROJECTOR_PREVIEW && $obsProjScene) {
          // In projector mode, activate projector scene selected scene
          ProjectorActivateScene($obsProjScene);
      }
      screenshotInterval = setInterval(getScreenshot, 1000);
    }
  });

  onDestroy(() => {
    clearInterval(screenshotInterval);
  });

  /*
   * Projector
   */
  async function ProjectorCreate(name) {
    ProjectorActivateScene(name);
    await obsSendCommand('OpenSourceProjector', {
      sourceName: name,
      monitorIndex: $obsProjOutput - PROJECTOR_FIRST_DISPLAY,
    });
  }

  async function ProjectorSetScene(scene_name, item) {
    console.log('ProjectorSetScene(' + scene_name + ')');
    if (!item && projectorSources.length > 0) {
      item = projectorSources[0];
    }

    for (let i = 0; i < projectorSources.length; i++) {
      if (projectorSources[i].sceneItemId == item.sceneItemId) {
        projectorSelection = projectorSources[i].sourceName;
        projectorSelectionSources = await GetSources(projectorSelection);
      } else {
        await SceneSourceEnable(
          scene_name,
          projectorSources[i].sceneItemId,
          false,
        );
      }
    }
    await SceneSourceEnable(scene_name, item.sceneItemId, true);
  }

  async function ProjectorActivateScene(name) {
    projectorSceneName = name;
    projectorSources = await GetSources(name);
    if ($obsProjOutput > PROJECTOR_PREVIEW) {
      // In projector mode, set the projector input item and its sources
      // from the (first) enabled pprojector source
      for (let i = 0; i < projectorSources.length; i++) {
        if (projectorSources[i].sceneItemEnabled) {
          projectorSelection = projectorSources[i].sourceName;
          projectorSelectionSources = await GetSources(projectorSelection);
          break;
        }
      }
    }
  }

  async function ProjectorSourceEnable(item, enabled) {
    await SceneSourceEnable(projectorSelection, item.sceneItemId, enabled);
    projectorSelectionSources = await GetSources(projectorSelection);
  }

  /*
   * Preview
   *
   * A special case of projector, synchronized with OBS studio preview
   */
  async function PreviewSetScene(name) {
    console.log('SetCurrentProjector(' + name + ')');
    await obsSendCommand('SetCurrentPreviewScene', { sceneName: name });
  }

  async function PreviewSourceEnable(scene_name, item, enabled) {
    await SceneSourceEnable(scene_name, item.sceneItemId, enabled);
    // Set current scene for change to take effect on Preview
    //await PreviewSetScene(scene_name);
  }

  /*
   * Program
   */
  async function ProgramSetScene(name) {
    console.log('SetCurrentProgram' + '(' + name + ')');
    await obsSendCommand('SetCurrentProgramScene', { sceneName: name });
  }

  async function ProgramActivateScene(name) {
    programSceneName = name;
    programSources = await GetSources(name);
  }

  async function ProgramSourceEnable(scene_name, item_id, enabled) {
    await SceneSourceEnable(scene_name, item_id, enabled);
    // Set current scene for change to take effect on PROGRAM
    //await ProgramSetScene(scene_name);
  }

  // eslint-disable-next-line
  $: getScreenshot(), programSceneName, projectorSceneName;

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

  async function SceneSourceEnable(scene_name, item_id, enabled) {
    console.log(
      'SceneSourceEnable(' + scene_name + ', ' + item_id + ', ' + enabled + ')',
    );
    await obsSendCommand('SetSceneItemEnabled', {
      sceneName: scene_name,
      sceneItemId: item_id,
      sceneItemEnabled: enabled,
    });
    if (scene_name == projectorSceneName && enabled) {
      // Enabled source in projectorSceneName. Get projector sources for this selection
      projectorSources = await GetSources(scene_name);
    }
  }

  obs.on('StudioModeStateChanged', async (data) => {
    //console.log("StudioModeStateChanged", data.studioModeEnabled);
    isStudioMode = data.studioModeEnabled;
    if (isStudioMode) {
      //ProjectorActivateScene(programSceneName);
    }
  });

  obs.on('SceneListChanged', async (data) => {
    //console.log('SceneListChanged', data.scenes.length)
    scenes = data.scenes.reverse();
  });

  obs.on('CurrentPreviewSceneChanged', async (data) => {
    if ($obsProjOutput == PROJECTOR_PREVIEW) {
      // In preview mode, sync preview with projector view
      ProjectorActivateScene(data.sceneName);
    }
  });

  obs.on('CurrentProgramSceneChanged', async (data) => {
    //console.log("CurrentProgramSceneChanged", data.sceneName);
    await ProgramActivateScene(data.sceneName);
  });

  obs.on('SceneItemEnableStateChanged', async (data) => {
    //console.log("CurrentProgramSceneChanged", data.sceneName);
    if (data.sceneName === programSceneName) {
      ProgramActivateScene(data.sceneName);
    }
    if ($obsProjOutput == PROJECTOR_PREVIEW && data.sceneName === projectorSceneName) {
      ProjectorActivateScene(data.sceneName);
    }
    if (
      $obsProjOutput > PROJECTOR_PREVIEW && data.sceneName === projectorSelection) {
      // In this case, projectorSelection is in projectorSceneName and
      // we want to activate projectorSceneName
      ProjectorActivateScene(projectorSceneName);
    }
  });

  obs.on('SceneNameChanged', async (data) => {
    if (data.oldSceneName === programSceneName)
      ProgramActivateScene(data.sceneName);
    if (data.oldSceneName === projectorSceneName)
      ProjectorActivateScene(data.sceneName);
    for (let i = 0; i < scenes.length; i++) {
      if (scenes[i].sceneName === data.oldSceneName) {
        scenes[i].sceneName = data.sceneName;
      }
    }
  });

  async function getScreenshot() {
    if ($obsConnected) {
      if (programSceneName) {
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

        if (isStudioMode || $obsProjOutput != PROJECTOR_NONE) {
          if (projectorSceneName && projectorSceneName !== programSceneName) {
            data = await obsSendCommand('GetSourceScreenshot', {
              sourceName: projectorSceneName,
              imageFormat: imageFormat,
              imageWidth: imageWidth,
              imageHeight: imageHeight,
            });
          }
          if (data && data.imageData && projector) {
            projector.src = data.imageData;
          }
        }
      }
    }
  }
</script>

<div>
  <div style="display:flex" class="container">
    <div class="container">
      <label for="">Projector</label><br />
      <select bind:value="{$obsProjOutput}" title="Monitor">
        {#each monitors as monitor}
          <option value="{monitor.value}">{monitor.name}</option>
        {/each}
      </select>
      {#if $obsProjOutput > PROJECTOR_PREVIEW && scenes}
        <button on:click="{() => ProjectorCreate($obsProjScene)}">
          Show</button
        ><br />
        <select
          bind:value="{$obsProjScene}"
          title="ProjScene"
          on:change="{() => ProjectorActivateScene($obsProjScene)}">
          {#each scenes as scene}
            <option>{scene.sceneName}</option>
          {/each}
        </select>
      {/if}
    </div>
    <Hotkey />
  </div>
</div>
<div class="container">
  {#if $obsProjOutput != PROJECTOR_NONE}
    <div class="content-flex">
      <h2 class="content-heading-vertical">Projector</h2>
      <img bind:this="{projector}" height="{imageHeight}" alt="Projector" />
      <div class="subpanel-2row-flow">
        {#if scenes && $obsProjOutput == PROJECTOR_PREVIEW}
          {#each scenes as scene}
            <button
              class:btn-classic="{true}"
              class:projector-btn-on="{scene.sceneName == projectorSceneName}"
              on:click="{() => PreviewSetScene(scene.sceneName)}">
              {scene.sceneName}
            </button>
          {/each}
        {:else if projectorSources && $obsProjScene}
          {#each projectorSources as item}
            <button
              class:btn-classic="{true}"
              class:projector-btn-on="{item.sceneItemEnabled}"
              on:click="{() => ProjectorSetScene(projectorSceneName, item)}">
              {item.sourceName}
            </button>
          {/each}
        {/if}
      </div>
    </div>
    {#if $showSources}
      <div class="content-flex">
        <h2 class="content-heading-vertical">Source</h2>
        <div class="subpanel-source-btns">
          {#if scenes && $obsProjOutput == PROJECTOR_PREVIEW}
            {#each projectorSources as item}
              <button
                class:source-btn-on="{item.sceneItemEnabled}"
                class:source-btn-size="{true}"
                class:btn-classic="{true}"
                on:click="{() =>
                  PreviewSourceEnable(
                    projectorSceneName,
                    item,
                    !item.sceneItemEnabled,
                  )}">
                {item.sourceName}
              </button>
             {/each}
         {:else}
            {#each projectorSelectionSources as item}
              <button
                class:source-btn-on="{item.sceneItemEnabled}"
                class:source-btn-size="{true}"
                class:btn-classic="{true}"
                on:click="{() =>
                  ProjectorSourceEnable(
                     item,
                    !item.sceneItemEnabled,
                  )}">
                {item.sourceName}
              </button>
            {/each}
          {/if}
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
          {#if $obsProjOutput < PROJECTOR_FIRST_DISPLAY || $obsProjScene != scene.sceneName}
            <button
              class:btn-classic="{true}"
              class:program-btn-on="{scene.sceneName == programSceneName}"
              on:click="{() => ProgramSetScene(scene.sceneName)}">
              {scene.sceneName}
            </button>
          {/if}
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
              ProgramSourceEnable(
                programSceneName,
                item.sceneItemId,
                !item.sceneItemEnabled,
              )}">
            {item.sourceName}
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>
