function getContrastColor(colorName) {
    // Create a dummy element to get the computed style
    var dummyElement = document.createElement('div');
    dummyElement.style.color = colorName;
    document.body.appendChild(dummyElement);

    // Get the computed style
    var computedColor = window.getComputedStyle(dummyElement).color;

    // Remove the dummy element
    document.body.removeChild(dummyElement);

    // Extract RGB values
    var match = computedColor.match(/\d+/g);
    var r = parseInt(match[0], 10);
    var g = parseInt(match[1], 10);
    var b = parseInt(match[2], 10);

    // Calculate luminance
    var luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Choose black or white based on luminance
    return luminance > 0.6 ? 'black' : 'white';
  }


function update_group_info(groupElement, groupId)
{
    const groupIDInt = parseInt(groupId);
    if (groupIDInt > 0){
        const tabGroup = chrome.tabGroups.get(groupIDInt,
            function(grp) {
                groupElement.textContent = grp.title;
                var grpColor = grp.color;
                groupElement.style.backgroundColor = grpColor;
                groupElement.style.color = getContrastColor(grpColor);
        });
    }
}


function displayGroup(tabGroups, groupId, tabCounter){
    const groupElement = document.createElement('ul');

    const tabGroupTabs = tabGroups[groupId];
    for (const tab of tabGroupTabs) {
        const tabId =  tab.id;
        const tabElement = document.createElement('li');
        //tabElement.textContent = tab.url;

        //highlight the tabs with the same names
        if(!tabCounter[tab.title] || tabCounter[tab.title].length == 1) {
            tabElement.className = 'tab-item tab-item-dup1';
        } else if (tabCounter[tab.title].length == 2) {
            tabElement.className = 'tab-item tab-item-dup2';
        } else if (tabCounter[tab.title].length == 3) {
            tabElement.className = 'tab-item tab-item-dup3';
        } else {
            tabElement.className = 'tab-item tab-item-dup4';
        }

        tabElement.textContent = tab.title;
        tabElement.setAttribute('data-tab-id', tabId);
        tabElement.addEventListener('click', function() {
            for (const tab1 of tabCounter[tab.title]) {
                switchTab(tab1.id);
            }
            switchTab(tabId);
        });
        groupElement.appendChild(tabElement);
    }
    return groupElement;
}

function popup() {
    // Get saved window names first
    chrome.storage.local.get(['windowNames'], function(result) {
        const windowNames = result.windowNames || {};

        // Get all windows
        chrome.windows.getAll({ populate: true }, function (windows) {
            var tabListContainer = document.getElementById('tabList');

            windows.forEach(function (window) {
                //Create a details element
                var windowCollapsible = document.createElement('details');
                windowCollapsible.id = window.id;
                tabListContainer.append(windowCollapsible);

                // Create a collapsible heading for the window
                var windowHeading = document.createElement('summary');
                windowHeading.className = "window-heading";

                // Create title text span
                var titleSpan = document.createElement('span');
                titleSpan.className = 'window-title-text';
                var savedName = windowNames[window.id];
                titleSpan.textContent = savedName ? savedName : 'Window ' + window.id;
                windowHeading.appendChild(titleSpan);

                // Create edit button
                var editBtn = document.createElement('button');
                editBtn.className = 'edit-window-btn';
                editBtn.innerHTML = '✎'; // Edit icon
                editBtn.title = 'Rename Window';

                // Edit button event listener
                editBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation(); // Prevent toggling details

                    // Switch to edit mode
                    var input = document.createElement('input');
                    input.type = 'text';
                    input.className = 'window-name-input';
                    input.value = titleSpan.textContent;

                    // Replace span with input
                    titleSpan.replaceWith(input);
                    editBtn.style.display = 'none';
                    input.focus();

                    // Save function
                    function saveName() {
                        var newName = input.value.trim();
                        if (newName) {
                            windowNames[window.id] = newName;
                        } else {
                            delete windowNames[window.id];
                            newName = 'Window ' + window.id;
                        }

                        // Update storage
                        chrome.storage.local.set({ windowNames: windowNames }, function() {
                            // Revert to text
                            titleSpan.textContent = newName;
                            input.replaceWith(titleSpan);
                            editBtn.style.display = '';
                        });
                    }

                    // Handle save on enter or blur
                    input.addEventListener('keydown', function(keyEvent) {
                        if (keyEvent.key === 'Enter') {
                            saveName();
                        }
                    });

                    input.addEventListener('blur', saveName);

                    // Prevent click on input from toggling details
                    input.addEventListener('click', function(inputEvent) {
                        inputEvent.preventDefault();
                        inputEvent.stopPropagation();
                    });
                });

                windowHeading.appendChild(editBtn);
                windowCollapsible.appendChild(windowHeading);


                // Create a div for each window
                var windowUl = document.createElement("ul");
                windowCollapsible.appendChild(windowUl)

                // Create a list for each window
                var grpList = document.createElement('div');
                grpList.className = 'grp-list';

                // Populate the list with tabs
                chrome.tabs.query({ windowId: window.id }, function (tabs) {
                var tabGroups = {};
                var tabCounter = {};
                tabs.forEach(function (tab) {
                    if (!tabGroups[tab.groupId]) {
                        tabGroups[tab.groupId] = [];
                    }
                    tabGroups[tab.groupId].push(tab);
                    if (!tabCounter[tab.title]) {
                        tabCounter[tab.title] = [];
                    }
                    tabCounter[tab.title].push(tab);
                });

                for (const groupId in tabGroups) {
                    //create group div
                    var groupDiv = document.createElement('details');
                    groupDiv.className = 'group';
                    groupDiv.id = window.id + "," + groupId;

                    // Create a heading for the groups
                    var groupHeading = document.createElement('summary');
                    groupHeading.textContent = 'Ungrouped';
                    groupHeading.className = 'group-heading';
                    groupDiv.appendChild(groupHeading);

                    // Create a list for each group
                    var tabList = document.createElement('div');
                    tabList.className = 'tab-list';
                    groupElement = displayGroup(tabGroups, groupId, tabCounter);
                    tabList.appendChild(groupElement);
                    groupDiv.appendChild(tabList);
                    grpList.appendChild(groupDiv);
                    update_group_info(groupHeading, groupId);
                }
                // Append the list to the window div
                windowUl.appendChild(grpList);
                });
            });
        });

        //update the current window and current tab to expand it
        chrome.windows.getCurrent({}, function (currentWindow) {
            chrome.tabs.query({ active: true, windowId: currentWindow.id }, function (currentTabs) {
                var winEl = document.getElementById(currentWindow.id);
                if(winEl) winEl.setAttribute('open', true);

                var currentWindowId = currentWindow.id;
                if(currentTabs.length > 0) {
                    var groupId = currentTabs[0].groupId;
                    if(groupId != -1){ // not in a group
                        var groupEl = document.getElementById(currentWindowId + "," + groupId);
                        if(groupEl) groupEl.setAttribute('open', true);
                    }
                }
            });
        });
    });
}

async function sortTabByNameWithinGroup() {
  // Get all open tabs in the current window
  const tabs = await chrome.tabs.query({ currentWindow: true });

  // 1. Chunk tabs based on visual grouping (Pinned vs Unpinned, Group ID)
  // This preserves the order of groups in the window
  const chunks = [];
  if (tabs.length > 0) {
    let currentChunk = [tabs[0]];
    for (let i = 1; i < tabs.length; i++) {
      const prev = tabs[i - 1];
      const curr = tabs[i];

      // Start a new chunk if pinned status changes or group ID changes
      if (prev.pinned !== curr.pinned || prev.groupId !== curr.groupId) {
        chunks.push(currentChunk);
        currentChunk = [];
      }
      currentChunk.push(curr);
    }
    chunks.push(currentChunk);
  }

  // 2. Sort tabs within each chunk by title
  chunks.forEach(chunk => {
    chunk.sort((a, b) => a.title.localeCompare(b.title));
  });

  // 3. Move tabs to their new positions
  // We move chunk by chunk to reconstruct the window order
  let currentIndex = 0;
  for (const chunk of chunks) {
    const tabIds = chunk.map(t => t.id);
    if (tabIds.length > 0) {
      await chrome.tabs.move(tabIds, { index: currentIndex });
      currentIndex += tabIds.length;
    }
  }
}

// Button event handlers
document.getElementById('refreshBtn').addEventListener('click', function() {
    document.getElementById('tabList').innerHTML = '';
    popup();
  });

document.getElementById('sortBtn').addEventListener('click', async function() {
    document.getElementById('tabList').innerHTML = '';
    await sortTabByNameWithinGroup();
    popup();
});

document.getElementById('expandBtn').addEventListener('click', function() {
    var detailsElements = document.querySelectorAll('details');
    detailsElements.forEach(function(details) {
        details.setAttribute('open', true);
    });
});

document.getElementById('collapseBtn').addEventListener('click', function() {
    var detailsElements = document.querySelectorAll('details');
    detailsElements.forEach(function(details) {
      details.removeAttribute('open');
    });
});



function switchTab(tabId) {
    chrome.tabs.get(tabId, function(tab) {
        var windowId = tab.windowId;
        chrome.windows.update(windowId, { focused: true }, function () {
        });
    });
    // Focus on the specified tab within the window
    chrome.tabs.update(tabId, { active: true });
}

function switchTabGroup(groupId) {
  chrome.tabs.query({ currentWindow: true, groupId }, function(tabs) {
    if (tabs.length > 0) {
      chrome.tabs.update(tabs[0].id, { active: true });
    }
  });
}

document.addEventListener('DOMContentLoaded', popup);
