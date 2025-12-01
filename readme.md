# Another chrome tab manager extension

Currently, it can only list the existing chrome tabs grouped by window and tab groups.
To test it, clone the extension to local and do the following:

* Load the Extension:
Open Chrome and go to chrome://extensions/. Enable "Developer mode" and click on "Load unpacked". Select the directory where your extension files are located.

* Test the Extension:
Click on the extension icon in the Chrome toolbar to see your popup. You can click the "Refresh" button to test the functionality.

TODO:

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
* [x] beatify the popup window

* [ ] search for tabs (**P2** as this is already embedded in chrome)

The extension does not collect any data. However, please use it with with your own responsibilities.
