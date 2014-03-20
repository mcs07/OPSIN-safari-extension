function performCommand(e) {
	if (e.command !== 'opsin') return;
	app.activeBrowserWindow.activeTab.page.dispatchMessage('searchResults', e.userInfo);
}

function validateCommand(e) {
	var selection = e.userInfo;
	if (e.command !== 'opsin' || selection === undefined) {
		return;
	}
	// Only show OPSIN context menu item if there is some selected text
	if (selection.length == 0 || !selection) {
		e.target.disabled = true;
	}
	// Truncate the menu item text if the selection is over 25 characters
	if (selection.length > 25) {
		selection = selection.substr(0, 25).replace(/^\s+|\s+$/g,'') + '...';
	}
	e.target.title = 'Resolve "'+selection+'" using OPSIN';
}

const app = safari.application;
app.addEventListener('command', performCommand, false);
app.addEventListener('validate', validateCommand, false);
