export const help_data = [
{ topic: `Features`,
 text: `<h2>Features</h2>
<h3>General</h3>
<ul>
<li>Saves connection configuration (IP:Port, password) in browser local data</li>
<li>Saves settings in browser local data and optionally persists settings in OBS Studio persistent data slot</li>
<li>Saves OBS Studio persistent data slot name and sync configuration in browser local data</li>
</ul>
<h3>OBS Studio</h3>
<ul>
<li>No installation or extra software is needed, works in any modern browser (desktop or mobile)</li>
<li>Control Preview (Projector) and Program scenes independently</li>
<li>Change source settings for currently displayed Preview and Program views</li>
<li>
<p>Support for Studio Mode (preview and program scenes)</p>
</li>
<li>
<p>Live view of preview &amp; output, updating 1 fps</p>
</li>
<li>
<p>User defined hotkey configuration (both "named" and "keybord")</p>
</li>
</ul>
<h3>A/V Devices</h3>
<ul>
<li>Pan, Tilt, and Zoom support for VISCA cameras</li>
<li>MIDI Audio Mixer Support</li>
</ul>
<hr />`},
{ topic: `OBS Studio Requirements`,
 text: `<h2>OBS Studio Requirements</h2>
<p>This project requires OBS websocket v5. This is OBS Studio version dependent, meaning:</p>
<ul>
<li><a href="https://obsproject.com/">OBS</a> v28 or higher - this includes the latest version of the OBS-websocket plugin</li>
<li>OBS v27 is also supported, by manually installing the <a href="https://github.com/obsproject/obs-websocket/releases/latest">OBS-websocket v5</a> plugin</li>
<li>Enabling the OBS-websocket server in OBS under <code>Tools -&gt; obs-websocket Settings -&gt; Enable WebSocket Server</code></li>
</ul>
<hr />`},
{ topic: `Settings`,
 text: `<h2>Settings</h2>
<p><img src="config.jpg" ></p>
<p><img src="savesettings.jpg" ></p>`},
{ topic: `Hotkeys`,
 text: `<h2>Hotkeys</h2>
<p><img src="hotkeys.jpg" ></p>
<p><img src="edithotkeys.jpg" ></p>`},
{ topic: `OBS Studio Operation`,
 text: `<h2>OBS Studio Operation</h2>`},
{ topic: `VISCA Camera Operation`,
 text: `<h2>VISCA Camera Operation</h2>`},
{ topic: `MIDI Mixer Operation`,
 text: `<h2>MIDI Mixer Operation</h2>`},
]
export default help_data;
