safari.application.addEventListener("command", performCommand, false);
safari.application.addEventListener("validate", validateCommand, false);

// Called when the context menu item is clicked
function performCommand(event) {
	if (event.command !== "opsin")
		return;

	// Get selection from userInfo
	var selection = event.userInfo;
	safari.application.activeBrowserWindow.activeTab.page.dispatchMessage("searchResults", selection);
}

// Called whenever context menu is displayed
function validateCommand(event) {

	// Get selection from userInfo
	var selection = event.userInfo;
	
	// Remove item from context menu if criteria aren't satisfied
	if (event.command !== "opsin" || selection===undefined) {
		return;
	}
	if (selection.length == 0 || !selection) {
		event.target.disabled = true;
	}
	
	// Truncate context menu item if too long
	if (selection.length > 25) {
		selection = selection.substr(0,25);
		selection = selection.replace(/^\s+|\s+$/g,"");
		selection = selection + '...'
	}
	event.target.title = 'Display "'+selection+'" using OPSIN'; 
}
