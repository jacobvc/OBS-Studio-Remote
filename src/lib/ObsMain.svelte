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
  let programSceneName = '';
  let projectorSceneName = '';

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

  let projectorSources;
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
        if ($obsProjOutput == PROJECTOR_PREVIEW) {
          data = await obsSendCommand('GetCurrentPreviewScene');
          ChangeProjectorScene(data.currentPreviewSceneName || '');
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
        ChangeProjectorScene($obsProjScene);
      }
      screenshotInterval = setInterval(getScreenshot, 1000);
    }
  });

  onDestroy(() => {
    clearInterval(screenshotInterval);
  });

  async function SelectProgram(name) {
    console.log('SetCurrentProgram' + '(' + name + ')');
    await obsSendCommand('SetCurrentProgramScene', { sceneName: name });
  }

  async function ShowProjector(name) {
    console.log(
      'OpenSourceProjector(Scene, ' +
        name +
        ', ' +
        ($obsProjOutput - PROJECTOR_FIRST_DISPLAY) +
        ')',
    );
    ChangeProjectorScene(name);
    await obsSendCommand('OpenSourceProjector', {
      sourceName: name,
      monitorIndex: $obsProjOutput - PROJECTOR_FIRST_DISPLAY,
    });
  }

  async function SelectProjector(name) {
    console.log('SetCurrentProjector(' + name + ')');
    if ($obsProjOutput == PROJECTOR_PREVIEW) {
      await obsSendCommand('SetCurrentPreviewScene', { sceneName: name });
    } else if ($obsProjOutput > PROJECTOR_NONE) {
    }
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

  async function ChangeProjectorScene(name) {
    projectorSceneName = name;
    projectorSources = await GetSources(name);
  }

  async function ChangeProgramScene(name) {
    programSceneName = name;
    programSources = await GetSources(name);
  }

  async function SceneItemEnable(scene_name, item_id, enabled) {
    console.log(
      'SceneItemEnable(' + scene_name + ', ' + item_id + ', ' + enabled + ')',
    );
    await obsSendCommand('SetSceneItemEnabled', {
      sceneName: scene_name,
      sceneItemId: item_id,
      sceneItemEnabled: enabled,
    });
    if (scene_name == projectorSceneName) {
      projectorSources = await GetSources(scene_name);
    }
  }

  async function ProgramItemEnable(scene_name, item_id, enabled) {
    await SceneItemEnable(scene_name, item_id, enabled);
    // Set current scene for change to take effect on PROGRAM
    await SelectProgram(scene_name);
  }
  async function ProjectorItemEnable(scene_name, item_id, enabled) {
    await SceneItemEnable(scene_name, item_id, enabled);
  }

  obs.on('StudioModeStateChanged', async (data) => {
    //console.log("StudioModeStateChanged", data.studioModeEnabled);
    isStudioMode = data.studioModeEnabled;
    if (isStudioMode) {
      //ChangeProjectorScene(programSceneName);
    }
  });

  obs.on('SceneListChanged', async (data) => {
    //console.log('SceneListChanged', data.scenes.length)
    scenes = data.scenes.reverse();
  });

  obs.on('CurrentPreviewSceneChanged', async (data) => {
    if ($obsProjOutput == PROJECTOR_PREVIEW) {
      ChangeProjectorScene(data.sceneName);
    }
  });

  obs.on('CurrentProgramSceneChanged', async (data) => {
    //console.log("CurrentProgramSceneChanged", data.sceneName);
    await ChangeProgramScene(data.sceneName);
  });

  obs.on('SceneNameChanged', async (data) => {
    if (data.oldSceneName === programSceneName)
      ChangeProgramScene(data.sceneName);
    if (data.oldSceneName === projectorSceneName)
      ChangeProjectorScene(data.sceneName);
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
        <button on:click="{() => ShowProjector($obsProjScene)}">
          Show</button
        ><br />
        <select
          bind:value="{$obsProjScene}"
          title="ProjScene"
          on:change="{() => ChangeProjectorScene($obsProjScene)}">
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
              on:click="{() => SelectProjector(scene.sceneName)}">
              {scene.sceneName}
            </button>
          {/each}
        {:else if projectorSources && $obsProjScene}
          {#each projectorSources as item}
            <button
              class:btn-classic="{true}"
              class:projector-btn-on="{item.sceneItemEnabled}"
              on:click="{() =>
                ProjectorItemEnable(
                  projectorSceneName,
                  item.sceneItemId,
                  !item.sceneItemEnabled,
                )}">
              {item.sourceName}
            </button>
          {/each}
        {/if}
      </div>
    </div>
    {#if projectorSources && $showSources}
      <div class="content-flex">
        <h2 class="content-heading-vertical">Source</h2>
        <div class="subpanel-source-btns">
          {#each projectorSources as item}
            <button
              class:source-btn-on="{item.sceneItemEnabled}"
              class:source-btn-size="{true}"
              class:btn-classic="{true}"
              on:click="{() =>
                ProjectorItemEnable(
                  projectorSceneName,
                  item.sceneItemId,
                  !item.sceneItemEnabled,
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
          {#if $obsProjOutput < PROJECTOR_FIRST_DISPLAY 
          || $obsProjScene != scene.sceneName}
            <button
              class:btn-classic="{true}"
              class:program-btn-on="{scene.sceneName == programSceneName}"
              on:click="{() => SelectProgram(scene.sceneName)}">
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
              ProgramItemEnable(
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
