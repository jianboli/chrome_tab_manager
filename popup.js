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

function popup() {
    // Get all windows
    chrome.windows.getAll({ populate: true }, function (windows) {
        var tabListContainer = document.getElementById('tabList');

        let tabIdCounter = 0;
        windows.forEach(function (window) {
            // Create a div for each window
            var windowDiv = document.createElement('div');
            windowDiv.className = 'window';

            // Create a heading for the window
            var windowHeading = document.createElement('h2');
            windowHeading.textContent = 'Window ' + window.id;
            windowDiv.appendChild(windowHeading);

            // Create a list for each window
            var grpList = document.createElement('div');
            grpList.className = 'grp-list';

            // Populate the list with tabs
            chrome.tabs.query({ windowId: window.id }, function (tabs) {
            var tabGroups = {};

            tabs.forEach(function (tab) {
                if (!tabGroups[tab.groupId]) {
                tabGroups[tab.groupId] = [];
                }
                tabGroups[tab.groupId].push(tab);
            });

            for (const groupId in tabGroups) {

                    //create group div
                    var groupDiv = document.createElement('div');
                    groupDiv.className = 'group';
            
                    // Create a heading for the groups
                    var groupHeading = document.createElement('h3');
                    groupHeading.textContent = 'Tab Group';
                    groupHeading.className = 'group-heading';
                    groupDiv.appendChild(groupHeading);
            
                    // Create a list for each group
                    var tabList = document.createElement('div');
                    tabList.className = 'tab-list'; 
                    const groupElement = document.createElement('ul');
                    
                    const tabGroupTabs = tabGroups[groupId];          
                    for (const tab of tabGroupTabs) {
                        const tabId =  tab.id;
                        const tabElement = document.createElement('li');
                        //tabElement.textContent = tab.url;
                        tabElement.className = 'tab-item';
                        tabElement.textContent = tab.title;
                        tabElement.setAttribute('data-tab-id', tabId);
                        tabElement.addEventListener('click', function() {
                            switchTab(tabId);
                        });
                        groupElement.appendChild(tabElement);
                    }
                    tabList.appendChild(groupElement);
                    groupDiv.appendChild(tabList);
                    grpList.appendChild(groupDiv);
                    //tabGroups.get is running async, let's update it instead of directly initialize it with correct titles 
                    update_group_info(groupHeading, groupId);
            }
            // Append the list to the window div
            windowDiv.appendChild(grpList);

            // Append the window div to the popup body
            tabListContainer.appendChild(windowDiv);
            });
        });
    });
}

document.getElementById('refreshBtn').addEventListener('click', function() {
    document.getElementById('tabList').innerHTML = '';
    popup();
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
