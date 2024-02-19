<script>
    import { obsSendCommand, hotkeys, editHotkeys } from './Preferences.js';
    import { onMount } from 'svelte';

    let thisGroup = null;
    let thisButton = null;
    let namedHotkeys = [];

    $: thisGroup, thisButton;

    onMount(async () => {
        let hkeys = await obsSendCommand('GetHotkeyList');
        if (hkeys) {
            namedHotkeys = hkeys.hotkeys;
        }
    });
    /* key is a string in the OBS internal form of 'OBS_KEY_P'
     * key modifiers are an OR of the above ".._KEY" variables
     */
    function sendHotkey(hotkey) {
        if (hotkey.isNamedKey) {
            obsSendCommand('TriggerHotkeyByName', {
                hotkeyName: hotkey.keyName,
            });
        } else {
            obsSendCommand('TriggerHotkeyByKeySequence', {
                keyId: hotkey.keyId,
                keyModifiers: hotkey.keyModifiers,
            });
        }
    }
    function newGroup() {
        let group = { label: 'New Group', buttons: [] };
        $hotkeys.groups.push(group);
        thisGroup = group;
        newButton(group);
        //thisButton = null;
        hotkeys.set($hotkeys);
    }
    function newButton(group) {
        let btn = {
            name: 'New Key',
            isNamedKey: false,
            keyName: '',
            keyId: '',
            keyModifiers: {
                shift: false,
                alt: false,
                control: false,
                command: false,
            },
        };
        group.buttons.push(btn);
        thisButton = btn;
        hotkeys.set($hotkeys);
    }
    function rmvGroup(group) {
        $hotkeys.groups.splice($hotkeys.groups.indexOf(group), 1);
        thisGroup = null;
        hotkeys.set($hotkeys);
    }
    function rmvButton(group, btn) {
        group.buttons.splice(group.buttons.indexOf(btn), 1);
        thisButton = null;
        hotkeys.set($hotkeys);
    }
    function moveleft() {
        let index = $hotkeys.groups.indexOf(thisGroup);
        if (index > 0) {
            arraymove($hotkeys.groups, index, index - 1);
        }
        hotkeys.set($hotkeys);
    }
    function moveright() {
        let index = $hotkeys.groups.indexOf(thisGroup);
        if (index < $hotkeys.groups.length - 1) {
            arraymove($hotkeys.groups, index, index + 1);
        }
        hotkeys.set($hotkeys);
    }

    function arraymove(arr, fromIndex, toIndex) {
        var element = arr[fromIndex];
        arr.splice(fromIndex, 1);
        arr.splice(toIndex, 0, element);
    }
    function editGroup(e, group, btn) {
        e.stopPropagation();
        thisGroup = group;
        thisButton = btn;
        //console.log(thisGroup, thisButton);
        return false;
    }
</script>

{#if $editHotkeys}
    <div class="container">
        <h2 class="content-heading">
            <div>
                Edit Hotkey Groups
                <button
                    class="btn-default item-in-h2"
                    disabled="{!thisGroup ||
                        $hotkeys.groups.indexOf(thisGroup) < 1}"
                    on:click="{() => moveleft()}"
                    type="submit">
                    &lt;
                </button>
                <button
                    class="btn-default item-in-h2"
                    disabled="{!thisGroup ||
                        $hotkeys.groups.indexOf(thisGroup) >=
                            $hotkeys.groups.length - 1}"
                    on:click="{() => moveright()}"
                    type="submit">
                    &gt;
                </button>
                <button
                    class="btn-default item-in-h2"
                    on:click="{() => newGroup()}"
                    type="submit">
                    +
                </button>
            </div>
        </h2>
        <div class="content-flex">
            {#each $hotkeys.groups as group}
                <div
                    class="btn-group"
                    class:selected="{group === thisGroup}"
                    on:click="{(e) => editGroup(e, group)}"
                    on:keydown="{(e) => editGroup(e, group)}"
                    role="button" tabindex="0">
                    <span contenteditable bind:innerHTML="{group.label}"></span
                    ><br />
                    {#each group.buttons as button}
                        <button
                            class="btn-default"
                            on:click="{(e) => editGroup(e, group, button)}">
                            <span contenteditable bind:innerHTML="{button.name}"
                            ></span>
                        </button>
                    {/each}
                    <button
                        class="btn-default"
                        on:click="{() => newButton(group)}"
                        >+
                    </button>
                </div>
            {/each}
        </div>
        <div class="content-block">
            {#if thisGroup}
                Group: {thisGroup.label}
                <button
                    class="btn-default"
                    on:click="{() => rmvGroup(thisGroup)}">
                    Remove
                </button><br />
                {#if thisButton}
                    Button: {@html thisButton.name}
                    (Named Hotkey
                    <input
                        type="checkbox"
                        bind:checked="{thisButton.isNamedKey}" />)
                    <button
                        class="btn-default"
                        on:click="{() => rmvButton(thisGroup, thisButton)}">
                        Remove
                    </button>
                    <br />
                    <div class:invisible="{!thisButton.isNamedKey}">
                        Named Key:
                        <select bind:value="{thisButton.keyName}">
                            <option value="">none</option>
                            {#each namedHotkeys as key}
                                <option value="{key}">{key}</option>
                            {/each}
                        </select>
                    </div>
                    <div class:invisible="{thisButton.isNamedKey}">
                        Key: Shift
                        <input
                            type="checkbox"
                            bind:checked="{thisButton.keyModifiers.shift}" />
                        Alt
                        <input
                            type="checkbox"
                            bind:checked="{thisButton.keyModifiers.alt}" />
                        Ctrl
                        <input
                            type="checkbox"
                            bind:checked="{thisButton.keyModifiers.control}" />
                        Cmd
                        <input
                            type="checkbox"
                            bind:checked="{thisButton.keyModifiers.command}" />
                        <input type="text" bind:value="{thisButton.keyId}" />
                    </div>
                {/if}
            {/if}
        </div>
    </div>
{:else}
    {((thisGroup = null), (thisButton = null), '')}
    {#each $hotkeys.groups as group}
        <div class="btn-group">
            {group.label}<br />
            {#each group.buttons as button}
                <button
                    class="btn-default"
                    on:click="{() => sendHotkey(button)}"
                    contenteditable="false"
                    bind:innerHTML="{button.name}">
                </button>
            {/each}
        </div>
    {/each}
{/if}
