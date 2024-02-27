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
<li>User defined hotkey configuration (both "named" and "keybord") hotkeys</li>
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
{ topic: `OBS Studio Live View`,
 text: `<h2>OBS Studio Live View</h2>
<p>Live View displays an optional Projector view followd by a Program view. Each view displays an image of the selected content 
next to a classic button for each available content selection. Pressing the button selects the content for that view.</p>
<p>See the Projector View and Program View sections for the content associated with each view.</p>
<p><img src="sceneview.jpg" ></p>
<p>When Show Sources is enabled, a button is presented for each source in the scene. Those buttons may be used to enable / disable any of the sources in real time.</p>
<p><img src="sceneviewsources.jpg" ></p>
<h3>Program View</h3>
<p>The program view shows the "Program" content (the same content as displayed on the OBS Studio Program View). A button is present
for each available scene. When a button is pressed, OBS Studio's Program selection is changed.</p>
<p>When sources are shown, there is a button to enable / disable each source in the selected scene.</p>
<h3>Projector View</h3>
<hr />
<p><strong>A few words about OBS Studio Projectors</strong></p>
<p>An OBS Studio projector is a window displaying the contents of the selected item (source, scene, Program or Preview).
A windowed projector is a sizeable window, and a full screen projector is a screen sized borderless window. There is no re-use or
automatic closure of existing projector windows, and there is no provision for closing them programattically. If one, for example,
opens a full screen projector for a selected scene upon each scene change, a stack of dozens of screen could very quickly accumulate.
These screens are closed by manually selecting each one and pressing the ESC key.</p>
<p>The logical approach of opening a full screen projector for a scene when it is selected is unsatisfactory.</p>
<p>This implementation has taken a "scene of scenes" approach. That is, a combining scene is constructed by creating a scene that is
composed entirely of the rest of the scenes, and having control buttons enable / disable the sub-scenes</p>
<hr />
<p>The settings configuration supports selecting a projector source from <strong>None</strong>, <strong>Preview</strong>, or one of the displays attached to the host computer.</p>
<p><img src="projectorsettings.jpg" ></p>
<p>These there selections result in the following behaviors:</p>
<p><strong>None</strong></p>
<p>No Projector View is displayed.</p>
<p><strong>Preview</strong></p>
<p>The projector displays and is synchronized with the OBS Studio Preview. If a physical projector is intended, it may be connected by right clicking on 
the OBS Studio Preview window.</p>
<p><strong>Display</strong></p>
<p>The configured scene, "Combo" in this example, is sent to the projector. The "Show" button will open a new full screen projector of the
"Combo" scene. A projector (full screen or windowed) can also be opened by right clicking on the "Combo" scene name in OBS Studio.</p>
<p>The projector view shows the configured scene. A button is present
for each available sub-scene. When a button is pressed, sub-scenes are enabled / disabled.</p>
<p>When operating in this mode, the configured scene does not appear in the Program view.</p>`},
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
  - OBS Studio persisted data slot name 
  - Synchronization enable
- Persisted Data:
  - Show Sources
  - Use A/V
  - Hotkey Configuration (JSON object)
  - OBS Websocket versions for both OBS Studio and for the javascript client library
  - Theme color</p>
<p>The user interface allows choosing whether to persist settings in OBS Studio or the browser local data. </p>
<p>When configured to persist settings in OBS Studio, a OBS Studio persisted data slot name must be provided, and synchronization may optionally be enabled.</p>
<ul>
<li>Persisted data is saved to OBS Studio, but local data is not.</li>
<li>Persisted data is retrieved from the slot at OBS Studio connect time</li>
<li>Persisted data may be saved or loaded manually, but changes are not automatically persisted unless Sync is enabled.</li>
</ul>
<p>The third section of the panel contains:</p>
<p><img src="color-disconnect.jpg" ></p>
<ul>
<li>Color - Change the color theme. </li>
<li>Disconnect - Disconnect any connected websocket server. Button only appears for connected servers.</li>
</ul>`},
{ topic: `Hotkeys`,
 text: `<h2>Hotkeys</h2>
<p>Hotkeys are presented as a horizontally aligned set of Hotkey group panels. </p>
<p>A hotkey panel is a bordered panel containing a group of one or more buttons 
below a label. A button press results in firing the associated hotkey.</p>
<p>The default configuration includes an example "Change Slide" group with a '&lt;'
button connected to the SlideShow.PreviousSlide named hotkey and a '&gt;' button
connected to the SlideSHow.NextSlide named hotkey (which are only available if a slideshow is present in the configuration).</p>
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
