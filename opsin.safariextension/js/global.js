function performCommand(e) {
	if (e.command !== 'opsin')
		return;
	var selection = e.userInfo;
	app.activeBrowserWindow.activeTab.page.dispatchMessage('searchResults', selection);
}

function validateCommand(e) {
	var selection = e.userInfo;
	if (e.command !== 'opsin' || selection===undefined) {
		return;
	}
	if (selection.length == 0 || !selection) {
		e.target.disabled = true;
	}
	if (selection.length > 25) {
		selection = selection.substr(0,25);
		selection = selection.replace(/^\s+|\s+$/g,'');
		selection = selection + '...'
	}
	e.target.title = 'Display "'+selection+'" using OPSIN'; 
}

const app = safari.application;
app.addEventListener('command', performCommand, false);
app.addEventListener('validate', validateCommand, false);
