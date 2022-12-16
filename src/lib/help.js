export const help_data = [
{ topic: `Features`,
 text: `<h2>Features</h2>
<h3>General</h3>
<ul>
<li>Saves connection configuration (IP:Port, password) in browser local data</li>
<li>Saves settings in browser local data and optionally persists settings in OBS Studio persistent data slot</li>
<li>Saves OBS Studio persistent data slot name and sync configuration in browser local data</li>
<li>No installation or extra software is needed, works in any modern browser (desktop or mobile)</li>
</ul>
<h3>OBS Studio</h3>
<ul>
<li>Control Preview (Projector) and Program scenes independently</li>
<li>Change source settings of currently displayed Preview and/or Program views</li>
<li>Support for Studio Mode (preview and program scenes)</li>
<li>Live view of preview &amp; program, updating 1 fps</li>
<li>User defined hotkey configuration (both "named" and "keybord")</li>
</ul>
<h3>A/V Devices</h3>
<ul>
<li>Pan, Tilt, and Zoom support for VISCA cameras</li>
<li>View of 'same name' OBS Studio camera source behind translucent Pan / Tilt / Zoom buttons</li>
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
{ topic: `Connecting`,
 text: `<h2>Connecting</h2>
<p>Upon launch, IF there was a previous websocket connection, an automatic connect attempt is performed using the connection configuration (IP:Port, password) stored in browser local data.</p>
<p>If there was not a previous connection, or the connection attempt fails, the manual connect panel will be displayed. Connect by pressing the "Connect" button</p>
<p><img src="connect.jpg" ></p>
<p>The actual operation specifics can be configured as specified in "Configuration and Settings".</p>`},
{ topic: `OBS Studio Scene View`,
 text: `<h2>OBS Studio Scene View</h2>
<p>Scene View displays the selected scene next to a classic button for each scene that exists in OBS Studio. Pressing the button selects the scene for that view.</p>
<p>When OBS Studio is in studio mode, a Scene View is displayed for each of Preview (labeled Projector) and Program.</p>
<p><img src="sceneview.jpg" ></p>
<p>When Show Sources is enabled, a button is presented for each source in the scene. Those buttons may be used to enable / disable any of the sources in real time.</p>
<p><img src="sceneviewsources.jpg" ></p>`},
{ topic: `AvDeviceControl VISCA Camera View`,
 text: `<h2>AvDeviceControl VISCA Camera View</h2>
<p><img src="cameraview.jpg" ></p>`},
{ topic: `AvDeviceControl MIDI Mixer View`,
 text: `<h2>AvDeviceControl MIDI Mixer View</h2>
<p><img src="mixerview.jpg" ></p>`},
{ topic: `Configuration and Settings`,
 text: `<h2>Configuration and Settings</h2>
<p><img src="heading.jpg" ></p>
<p>Expand the settings panel by pressing the hamburger menu button at the right edge of the page heading.</p>
<p><img src="settingsview.jpg" ></p>
<p>The Settings section of the panel contains:</p>
<ul>
<li>Show Sources Configuration: Display the OBS Studio source buttons for the 
displayed scene(s) and allow changing which source are active fr each scene.</li>
<li>Use A/V Configuration: Activate connection to and control of
<a href="https://github.com/jacobvc/AvDeviceControl">AvDeviceControl</a> application.</li>
<li>Edit Hotkeys Control: Change hotkeys operation from Operation mode to Edit mode (See Hotkeys section)</li>
<li>Show Help: Select and display available help topics</li>
</ul>
<p>The Persist Settings section of the panel controls how and where settings are persisted.</p>
<p><img src="savesettings.jpg" ></p>
<p>All configuration and settings are stored in the browser local data. The two categories of configuration and setting are:
- Local Data:
  - OBS Studio IP:Port and password
  - AvDeviceControl IP:Port and password
  - Settngs Persist mode
  - OBS Studio slot name 
  - Synchronization enable
- Persisted Data:
  - Show Sources
  - Use A/V
  - Hotkey Configuration (JSON object)</p>
<p>The user interface allows choosing whether to persist settings in OBS Studio or the browser local data. </p>
<p>When configured to persist settings in OBS Studio, a OBS Studio persisted data slot name must be provided, and synchronization may optionally be enabled.</p>
<ul>
<li>Persisted data is saved to OBS Studio, but local data is not.</li>
<li>Persisted data is retrieved from the slot at OBS Studio connect time</li>
<li>Persisted data may be saved or loaded manually, but changes are not automatically persisted unless Sync is enabled.</li>
</ul>`},
{ topic: `Hotkeys`,
 text: `<h2>Hotkeys</h2>
<p>Hotkeys are presented as a horizontally aligned set of Hotkey group panels. </p>
<p>A hotkey panel is a bordered panel containing a group of one or more buttons 
below a label. A button press results in firing the associated hotkey.</p>
<p>The default configuration includes an example "Change Slide" group with a '&lt;'
button connected to the SlideShow.PreviousSlide named hotkey and a '&gt;' button
connected to the SlideSHow.NextSlide named hotkey.</p>
<p><img src="hotkeys.jpg" ></p>
<p>When the Edit Hotkeys switch is turned on, the hotkey display changes to edit
mode. </p>
<p><img src="edithotkeys.jpg" ></p>
<p>Edit mode supports selecting whether the hotkeys appear above or below the
(preview and program) scene displays, adding, removing, and ordering hotkey 
panels, editing button and panel labels, and defining hotkey binding.</p>
<p>In this example, the 'Change Slide' panel and '&lt;' button are in scope. Any of 
the labels may be changed by selecting the test an typing. Either the '&lt;' button
or the entire hotkey panel can be removed by pressing a 'Remove' button, and
the hotkey connection can be configured. In the case of a named hotkey, a
dropdown list of all available named hotkeys is provided. Pressing the '+' 
button will add another button.</p>
<p>Pressing the '+' button in the heading adds a 'New Group' containing one 
'New Key'. </p>
<p><img src="hotkeysnew.jpg" ></p>
<p>This example has configured a key sequence (NOT Named Hotkey) as Control-A.
<a href="https://github.com/obsproject/obs-studio/blob/master/libobs/obs-hotkeys.h">Look here for available key sequence key values.</a></p>`},
]
export default help_data;
