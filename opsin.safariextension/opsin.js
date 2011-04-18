document.addEventListener("contextmenu", contextMessage, false);
safari.self.addEventListener("message", handleMessage, false);
document.addEventListener("mousedown", dragStart, false);
document.addEventListener("click", handleClick, false);

var dragObj = new Object();					// Global object to hold drag information.
var windowNo = 0;							// To keep track of which window to move/close
var locx;									// For the start position of the window
var locy;									// For the start position of the window
var topZIndex = 10000;						// To move the clicked window to the top

// Called when the user right-clicks on the page
function contextMessage(msgEvent) {

	// Get text selection and remove starting and trailing spaces
	var sel = '';
	sel = window.parent.getSelection()+'';
	sel = sel.replace(/^\s+|\s+$/g,"");
	
	// Set the window position to 10px right and below the right-click
	locx = msgEvent.clientX + window.scrollX + 10;
	locy = msgEvent.clientY + window.scrollY + 10;
	
	// Set the UserInfo to the selection (can be accessed from global)
	safari.self.tab.setContextMenuEventUserInfo(msgEvent, sel);
}

// Called whenever a message is sent from the global page.
function handleMessage(msgEvent) {
	if (msgEvent.name === "searchResults") {
		openWindow(msgEvent.message);
	}
}

// Open a new compound popup window
function openWindow(message) {

	// Stops popup opening in all the iframes on the page
	if (window !== window.top) 
		return;
	
	// Make unique identifier for window, and make sure it's on top
	windowNo++;
	topZIndex++;
	
	// Remove spaces from chemical name
	message = message.split(' ').join('');
		
	// Inject the css to style the popup window
	var cssLink = document.createElement("link");
	cssLink.setAttribute("rel", "stylesheet");
	cssLink.setAttribute("href", safari.extension.baseURI + "opsin.css");
	var head = document.getElementsByTagName("head")[0];
	head.appendChild(cssLink);
	
	// Create container div to hold popup, in the correct location and on top of other popups
	var previewContainer = document.createElement ( "div" );
	previewContainer.setAttribute ( 'style', "left: "+locx+"px !important; top: "+locy+"px !important; z-index: "+topZIndex+" !important;" );
	previewContainer.className = "__OPSINpreviewContainer__";
	previewContainer.id = "__OPSINpreviewContainer-"+windowNo;
	document.body.insertBefore (previewContainer, document.body.firstChild);
	
	// Create the titlebar and put it inside the container div
	var titleBar = document.createElement ( "div" );
	titleBar.className = "__OPSINtitleBar__"
	titleBar.id = "__OPSINtitleBar-"+windowNo;
	previewContainer.appendChild (titleBar);
	
	// Create the OPSIN link and put it inside the titlebar
	var titleLink = document.createElement ( "a" );
	titleLink.className = "__OPSINtitleLink__";
	titleLink.textContent="OPSIN";
	titleLink.href = "http://opsin.ch.cam.ac.uk/";
	titleLink.setAttribute ('target', '_blank');
	titleBar.appendChild (titleLink);
	
	// Create the close link and put it insode the titlebar
	var closeLink = document.createElement ( "button" );
	closeLink.className = "__OPSINcloseLink__";
	closeLink.id = "__OPSINcloseLink-"+windowNo;
	closeLink.textContent="";
	titleBar.appendChild (closeLink);

	/*
	
	// Instead, if the image is error, dispay message
	
	// If the IDs array is empty, fill the window with an error message
	if (idsArray.length == 0) {
		var noResults = document.createElement ( "p" );
		noResults.className = "__noResults__";
		noResults.textContent="No Results Found";
		previewContainer.appendChild (noResults);
		
		// Turn off the View link
		titleLink.style.visibility = "hidden !important";
		return;
	}
	*/
	
	// Create image of chemical
	var previewImg = document.createElement ( "img" );
	previewImg.className = "__OPSINpreviewImg__";
	previewImg.id = "__OPSINpreviewImg-"+windowNo;
	previewImg.src = "http://opsin.ch.cam.ac.uk/opsin/"+message+".png";
	previewContainer.appendChild (previewImg);
	
	// Create a bar along the bottom
	var bottomBar = document.createElement ( "div" );
	bottomBar.className = "__OPSINbottomBar__";
	bottomBar.id = "__OPSINbottomBar-"+windowNo+"-"+message;
	previewContainer.appendChild (bottomBar);
	 
	// Create SMILES link
	var smilesLink = document.createElement ( "button" );
	smilesLink.className = "__OPSINbottomLink__";
	smilesLink.id = "__OPSINsmilesLink-"+windowNo;
	smilesLink.textContent="SMILES";
	bottomBar.appendChild (smilesLink);
	
	// Create InChI link
	var inchiLink = document.createElement ( "button" );
	inchiLink.className = "__OPSINbottomLink__";
	inchiLink.id = "__OPSINinchiLink-"+windowNo;
	inchiLink.textContent="InChI";
	bottomBar.appendChild (inchiLink);
	
	// Create cml link
	var cmlLink = document.createElement ( "button" );
	cmlLink.className = "__OPSINbottomLink__";
	cmlLink.id = "__OPSINcmlLink-"+windowNo;
	cmlLink.textContent="CML";
	bottomBar.appendChild (cmlLink);
	
}

// Called on mousedown events
function dragStart(event) {

	// Return unless the click is in a titlebar (could be multiple)
	if (event.srcElement.className !== "__OPSINtitleBar__")
		return;

	// Get the windowNo of the clicked window
	var draggingWindowNo = event.srcElement.id.split('-')[1];

	// Set the thing to be dragged to the container div of the clicked window
	dragObj.elNode = document.querySelector("#__OPSINpreviewContainer-"+draggingWindowNo);
	
	// Get cursor position with respect to the page.
	var x = event.clientX + window.scrollX,
		y = event.clientY + window.scrollY;

	// Save starting positions of cursor and element.
	dragObj.cursorStartX = x;
	dragObj.cursorStartY = y;
	dragObj.elStartLeft  = parseInt(dragObj.elNode.style.left, 10);
	dragObj.elStartTop   = parseInt(dragObj.elNode.style.top,  10);
	if (isNaN(dragObj.elStartLeft)) dragObj.elStartLeft = 0;
	if (isNaN(dragObj.elStartTop))  dragObj.elStartTop  = 0;
	
	// Bring window to the top, and update the topZIndex
	topZIndex++;
	dragObj.elNode.style.zIndex = topZIndex+" !important";
	
	
	// Capture mousemove and mouseup events on the page.
	document.addEventListener("mousemove", dragGo,   true);
	document.addEventListener("mouseup",   dragStop, true);
	event.preventDefault();
}

// Called when the mouse moves while the mouse is held down over a titlebar
function dragGo(event) {

	// Get cursor position with respect to the page.
	var x = event.clientX + window.scrollX,
		y = event.clientY + window.scrollY;
		
	// Move drag element by the same amount the cursor has moved.
	dragObj.elNode.style.left = (dragObj.elStartLeft + x - dragObj.cursorStartX) + "px !important";
	dragObj.elNode.style.top  = (dragObj.elStartTop  + y - dragObj.cursorStartY) + "px !important";
	
	// Stop dragging off edge of screen
	if ((dragObj.elStartLeft + x - dragObj.cursorStartX)<scrollX) {
		dragObj.elNode.style.left = scrollX + "px !important";
	}
	if ((dragObj.elStartTop  + y - dragObj.cursorStartY)<scrollY) {
		dragObj.elNode.style.top = scrollY + "px !important";
	}
	if ((dragObj.elStartLeft + x - dragObj.cursorStartX)>(window.innerWidth+window.scrollX-177)) {
		dragObj.elNode.style.left = (window.innerWidth+window.scrollX-177) + "px !important";
	}
	if ((dragObj.elStartTop  + y - dragObj.cursorStartY)>(window.innerHeight+window.scrollY-202)) {
		dragObj.elNode.style.top = (window.innerHeight+window.scrollY-202) + "px !important";
	}
	
	event.preventDefault();
}

// Called when the mouse is released from being clicked on a titlebar
function dragStop(event) {

	// Stop capturing mousemove and mouseup events.
	document.removeEventListener("mousemove", dragGo,   true);
	document.removeEventListener("mouseup",   dragStop, true);
}

// Called when the page is clicked on
function handleClick(event) {
	
	// Check that the clicked item belongs to OPSIN extension
	if(event.srcElement.className.substr(0,7) != "__OPSIN")
		return;

	// Get the button type, windowNo and chemical name
	var clickedWindowType = event.srcElement.id.split('-')[0],
		clickedWindowNo = event.srcElement.id.split('-')[1],
		deleteUpto = event.srcElement.parentElement.id.indexOf("-", 18),
		id = event.srcElement.parentElement.id.substr(deleteUpto+1);
		
	console.log(id);
	
	if (clickedWindowType == "__OPSINcloseLink") {
		previewClose(clickedWindowNo);
	}

	if (!id)
		return;
	
	if (clickedWindowType == "__OPSINsmilesLink") {
		location.href = "http://opsin.ch.cam.ac.uk/opsin/"+id+".smi";
	} else if (clickedWindowType == "__OPSINinchiLink") {
		location.href = "http://opsin.ch.cam.ac.uk/opsin/"+id+".inchi";
	} else if (clickedWindowType == "__OPSINcmlLink") {
		location.href = "http://opsin.ch.cam.ac.uk/opsin/"+id+".cml";
	}
}

// Closes the window with the given windowNo
function previewClose(id) {
	document.getElementById("__OPSINpreviewContainer-"+id).parentNode.removeChild(document.getElementById("__OPSINpreviewContainer-"+id));return false;
}