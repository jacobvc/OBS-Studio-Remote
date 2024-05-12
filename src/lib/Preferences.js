import OBSWebSocket from 'obs-websocket-js'
import { writable, get } from 'svelte/store'

import { devDependencies } from '../../package.json';

function trim_end(str, chr) {
  var rgxtrim = (!chr) ? new RegExp('^\\s+|\\s+$', 'g') : new RegExp('^'+chr+'+|'+chr+'+$', 'g');
  return str.replace(rgxtrim, '');
}

let settings;

let fileHandle;

export const obsModuleVersion = trim_end(devDependencies['obs-websocket-js'], '\\^');
export const defaultHue = 240;


if (localStorage.stringifiedSettings) {
  settings = JSON.parse(localStorage.stringifiedSettings);
}
else {
  settings = {};
}

let hotkeys_default = { "name": "hotkeys", "above": true, "groups": [{ "label": "Change Slide", "buttons": [{ "name": "&lt;", "isNamedKey": true, "keyName": "SlideShow.PreviousSlide", "keyId": "", "keyModifiers": { "shift": false, "alt": false, "control": false, "command": false } }, { "name": "&gt;", "isNamedKey": true, "keyName": "SlideShow.NextSlide", "keyId": "", "keyModifiers": { "shift": false, "alt": false, "control": false, "command": false } }] }] };
//
// Dynamic preferences (state)
//

export let editHotkeys = writable(false);
export let obsConnected = writable(false);
export let avdConnected = writable(false);
export let runtimeError = writable('');
export let obsConnectError = writable('');
export let avdConnectError = writable('');

//
// Persistent preferences - LOCAL
//
export let obsAddress = writable(localStorage.obsAddress
  ? localStorage.obsAddress : '');
obsAddress.subscribe((value) => { localStorage.obsAddress = value });
export let obsPassword = writable(localStorage.obsPassword
  ? localStorage.obsPassword : '');
obsPassword.subscribe((value) => { localStorage.obsPassword = value });
export let avdAddress = writable(localStorage.avdAddress
  ? localStorage.avdAddress : '');
avdAddress.subscribe((value) => { localStorage.avdAddress = value });
export let avdPassword = writable(localStorage.avdPassword
  ? localStorage.avdPassword : '');
avdPassword.subscribe((value) => { localStorage.avdPassword = value });
export let persistObs = writable(localStorage.persistObs ? localStorage.persistObs : 'browser');
persistObs.subscribe((value) => { localStorage.persistObs = value });
export let obsDataSlot = writable(localStorage.obsDataSlot
  ? localStorage.obsDataSlot : '');
obsDataSlot.subscribe((value) => { localStorage.obsDataSlot = value });
export let obsPrefsSync = writable(localStorage.obsPrefsSync === 'true' || false)
obsPrefsSync.subscribe((value) => { localStorage.obsPrefsSync = value; });

// 
// Persistent preferences - Persisted externally
//

// Configure whether to show OBS scene sources
export let showSources = writable(settings.showSources === 'true' || false)
showSources.subscribe((value) => { settings.showSources = value; persistSettings(); });
// Configure whether to use A/V devices
export let useAv = writable(settings.useAv === 'true' || false);
useAv.subscribe((value) => {settings.useAv = String(value); persistSettings();});
export let obsProjOutput = writable(settings.obsProjOutput ? settings.obsProjOutput : 0);
obsProjOutput.subscribe((value) => { settings.obsProjOutput = value; persistSettings(); });
export let obsProjScene = writable(settings.obsProjScene ? settings.obsProjScene : '');
obsProjScene.subscribe((value) => { settings.obsProjScene = value; persistSettings() });
export let themeHue = writable(settings.themeHue || defaultHue)
themeHue.subscribe((value) => { settings.themeHue = value; persistSettings(); });


// Hotkey configuration
export let hotkeys = writable(settings.hotkeys
  ? JSON.parse(settings.hotkeys) : hotkeys_default);
hotkeys.subscribe((value) => {
  settings.hotkeys = JSON.stringify(value);
  persistSettings();
  console.log("Updated ", value)
});

// Update hotkeys when exit editing state
editHotkeys.subscribe((value) => {
  if (!value && get(obsConnected)) {
    hotkeys.set(get(hotkeys))
  }
});


// 
// Persistent support functions
//

function persistSettings() {
  localStorage.stringifiedSettings = JSON.stringify(settings);
  if (get(obsDataSlot) && get(obsPrefsSync) && get(obsConnected)) {
    saveSettingsToObs();
  }
}
export async function saveSettingsToObs() {
  if (get(obsDataSlot)) {
    obsSendCommand("SetPersistentData", {
      realm: "OBS_WEBSOCKET_DATA_REALM_GLOBAL",
      slotName: get(obsDataSlot).toLowerCase(),
      slotValue: localStorage.stringifiedSettings
    })
  }
  else {
    runtimeError.set("OBS Studio slot name required");
  }
}

export async function loadSettingsFromObs(quiet) {
  if (get(obsDataSlot)) {
    let tmp = await obsSendCommand("GetPersistentData", {
      realm: "OBS_WEBSOCKET_DATA_REALM_GLOBAL",
      slotName: get(obsDataSlot).toLowerCase(),
    });
    if (tmp.slotValue) {
      localStorage.stringifiedSettings = tmp.slotValue;
      return true;
    }
    else if (!quiet) {
      runtimeError.set("No persistent data found in slot " + get(obsDataSlot));
    }
  }
  else if (!quiet) {
    runtimeError.set("OBS Studio slot name required");
  }
  return false;
}

/* showSaveFilePicker doesn't seem to work very well
 * Hide import / export buttons in App.svelte, and 
 * comment out these functions for now
 */ 
/*
export async function exportSettings() {
  [fileHandle] = await window.showSaveFilePicker();
   const writable = await fileHandle.createWritable();
  await writable.write(JSON.stringify(localStorage));
  await writable.close();
}

export async function importSettings() {
  [fileHandle] = await window.showOpenFilePicker();
  // get file contents
  const fileData = await fileHandle.getFile();
  let contents = await fileData.text();
  if (contents) {
    let obj = JSON.parse(contents);
    if (obj) {
      localStorage = obj;
      location.reload();
      return true;
    }
  }
  return false;
}
*/

//
// OBS Studio interface / connection
//

export const obs = new OBSWebSocket()

export async function obsSendCommand(command, params) {
  try {
    // if (command.indexOf('Set') === 0)
    //console.log('Sending command:', command, 'with params:', params)
    return await obs.call(command, params || {})
  } catch (e) {
    let s = 'OBS Studio: Error sending command ' + command
      + ' - error is:<br>' + e.message;
    console.log(s);
    runtimeError.set(s);
    return {}
  }
}

obs.on('ConnectionError', err => {
  //console.error('Socket error:', err)
})

//
// A/V devices interface / connection
//

export const avDevices = new OBSWebSocket();

export async function avdSendCommand(command, params) {
  try {
    // if (command.indexOf('Set') === 0)
    //console.log('Sending command:', command, 'with params:', params)
    return await avDevices.call(command, params || {})
  } catch (e) {
    let s = 'A/V Devices: Error sending command ' + command
      + ' - error is:<br>' + e.message;
    console.log(s);
    runtimeError.set(s);
    return {}
  }
}

