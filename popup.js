document.getElementById('closeTabsBtn').addEventListener('click', function() {
  chrome.tabs.query({}, function(tabs) {
    tabs.forEach(function(tab) {
      chrome.tabs.remove(tab.id);
    });
  });
});

function switchTab(tabId) {
  chrome.tabs.update(tabId, { active: true });
}

function switchTabGroup(groupId) {
  chrome.tabs.query({ currentWindow: true, groupId }, function(tabs) {
    if (tabs.length > 0) {
      chrome.tabs.update(tabs[0].id, { active: true });
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
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
      var tabList = document.createElement('ul');
      tabList.className = 'tab-list';

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
		  const tabGroup = tabGroups[groupId];
		  const groupTitle = `Tab Group ${groupId}`;
		  const groupElement = document.createElement('li');
		  groupElement.textContent = groupTitle;
		  groupElement.className = 'group-heading';
		  tabList.appendChild(groupElement);

		  for (const tab of tabGroup) {
			const tabId =  tab.id;
			const tabElement = document.createElement('li');
			tabElement.textContent = tab.url;
			tabElement.setAttribute('data-tab-id', tabId);
			tabElement.addEventListener('click', function() {
			  switchTab(tabId);
			});
			tabList.appendChild(tabElement);
		  }
		  
		}

        // Append the list to the window div
        windowDiv.appendChild(tabList);

        // Append the window div to the popup body
        tabListContainer.appendChild(windowDiv);
      });
    });
  });
});
