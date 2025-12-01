# Another chrome tab manager extension

Here is an chrome tab manager extension. It has the following functionailities:
* List the existing chrome tabs grouped by window and tab groups.
* Sort the tabs by name so that similar tabs by name are be placed together and easier to identify - this sorting respect the tabs and will only sort within tabs
* Duplicated tabs (by tab name) are highlighted
* Name/Rename an window that survives through chrome restarts

<img width="437" height="375" alt="Screenshot 2025-12-01 at 2 43 45 PM" src="https://github.com/user-attachments/assets/503599fb-b1dd-4eca-b6cd-4a6df39fcd68" />


# Installation
To test it, clone the extension to local and do the following:

* Load the Extension:
Open Chrome and go to chrome://extensions/. Enable "Developer mode" and click on "Load unpacked". Select the directory where your extension files are located.

* Test the Extension:
Click on the extension icon in the Chrome toolbar to see your popup. You can click the "Refresh" button to test the functionality.

# TODO:
* [X] make the tab item clickable: currently, this function is coded but it does not work
* [X] make the tab group and window name more readable
  * [X] Make the tab group name more readable
  * [ ] ~~The window name is currently not supported, please follow this thread for more detail: [Issue 1190160: Programmatic access to window-name from chrome.windows extension API](https://bugs.chromium.org/p/chromium/issues/detail?id=1190160)~~
* [X] label/highlight duplicated tabs
  * The background color of the tab changes from blue (2 duplicated), orange (3 duplicated), to red (4 duplicate or more)
* [ ] quick comparison between the duplicated tabs
* [X] sort the tabs by name, only for current window and the sorting is applied within tab groups
* [X] collapse all the content to start with
* [X] expand the current window and tab by default
* [ ] close tabs from the plugin
* [ ] move tabs around within the tool
* [ ] a global short-cut key
* [X] beatify the popup window
* [X] naming a window

* [-] search for tabs (**P2** as this is already embedded in chrome)

The extension does not collect any data. However, please use it with with your own responsibilities.
