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
    // Get all windows
    chrome.windows.getAll({ populate: true }, function (windows) {
        var tabListContainer = document.getElementById('tabList');

        let tabIdCounter = 0;
        windows.forEach(function (window) {
            //Create a details element
            var windowCollapsible = document.createElement('details');
            windowCollapsible.id = window.id;
            tabListContainer.append(windowCollapsible);

            // Create a collapsible heading for the window
            var windowHeading = document.createElement('summary');
            windowHeading.textContent = 'Window ' + window.id;
            windowHeading.className = "window-heading"
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
            document.getElementById(currentWindow.id).setAttribute('open', true);
            var currentWindowId = currentWindow.id;
            if(currentTabs.length > 0) {
                var groupId = currentTabs[0].groupId;
                if(groupId != -1){ // not in a group
                    document.getElementById(currentWindowId + "," + groupId).setAttribute('open', true);
                }
            }
        });
      });
}

function sortTabByNameWithinGroup() {
  // Get all open tabs
  chrome.tabs.query({currentWindow: true}, function (tabs) {
    // Group tabs by their group ID
    var groupedTabs = tabs.reduce(function (groups, tab) {
      var groupId = tab.groupId || 'ungrouped';
      groups[groupId] = groups[groupId] || [];
      groups[groupId].push(tab);
      return groups;
    }, {});

    // Sort tabs within each group by title
    Object.keys(groupedTabs).forEach(function (groupId) {
      groupedTabs[groupId].sort(function (a, b) {
        var titleA = a.title.toLowerCase();
        var titleB = b.title.toLowerCase();
        return titleA.localeCompare(titleB);
      });

      // Move tabs to their new positions within the group
      groupedTabs[groupId].forEach(function (tab, index) {
        chrome.tabs.move(tab.id, { index: index });
      });
    });
  });
}

// Button event handlers
document.getElementById('refreshBtn').addEventListener('click', function() {
    document.getElementById('tabList').innerHTML = '';
    popup();
  });
  
document.getElementById('sortBtn').addEventListener('click', function() {
    document.getElementById('tabList').innerHTML = '';
    sortTabByNameWithinGroup();
    popup();
});

document.getElementById('expandBtn').addEventListener('click', function() {
    var detailsElements = document.querySelectorAll('details');
    detailsElements.forEach(function(details) {
        details.setAttribute('open', true);
    });
});

document.getElementById('collapsBtn').addEventListener('click', function() {
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
