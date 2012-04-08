var locX, locY;

function contextMessage(e) {
	locX = e.clientX + 10;
    locY = e.clientY + 10;
	var sel = '';
	sel = window.parent.getSelection()+'';
	sel = sel.replace(/^\s+|\s+$/g,"");
	safari.self.tab.setContextMenuEventUserInfo(e, sel);
}

function handleMessage(msg) {
	if (msg.name === "searchResults") {
		openWindow(msg.message);
	}
}

function openWindow(msg) {
	if (window !== window.top) 
		return;
	if ($('link[href^="safari-extension://com.matt-swain.opsin"][href$="css/opsin.css"]').length == 0) {
		$('<link rel="stylesheet" href="'+safari.extension.baseURI+'css/opsin.css">').appendTo('head');
	}
	var $popupDiv = $('<div/>').appendTo('body'),
		imgString = '<img src="http://opsin.ch.cam.ac.uk/opsin/'+encodeURIComponent(msg)+'.png">'
	
	$img = $(imgString).appendTo($popupDiv);
	
	$popupDiv.dialog({
		position: [locX,locY],
		width: 154,
		title: 'OPSIN',
		buttons: [
			{text: 'SMILES', 'class':'__opsin-dialog-button', click: function() { 
				location.href = "http://opsin.ch.cam.ac.uk/opsin/"+encodeURIComponent(msg)+".smi";
			}},
			{text: 'InChi', 'class':'__opsin-dialog-button', click: function() {
				location.href = "http://opsin.ch.cam.ac.uk/opsin/"+encodeURIComponent(msg)+".inchi";
			}},
			{text: 'CML', 'class':'__opsin-dialog-button', click: function() {
				location.href = "http://opsin.ch.cam.ac.uk/opsin/"+encodeURIComponent(msg)+".cml";
			}},
		]
	});
	
	$img.one('error', function() { 
		$(this).replaceWith($('<div>No Results Found</div>'));
		$popupDiv.dialog({
			buttons: [
				{text: 'Close', 'class':'__opsin-dialog-button', click: function() {
					$(this).dialog("close"); 
				}},
			]
		});
	});
	
}

document.addEventListener('contextmenu', contextMessage, false);
safari.self.addEventListener('message', handleMessage, false);
