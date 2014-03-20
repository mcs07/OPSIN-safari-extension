var locX, locY, locZ = 0;

function handleContextMenu(e) {
    // Get mouse position, but limit to page size constraints
    locX = Math.min(e.pageX + 10, $(document).width() - 200);
    locY = Math.min(e.pageY + 10, $(document).height() - 300);
    // Get selection and set as userInfo for global page
    var sel = '';
    sel = window.parent.getSelection()+'';
    sel = sel.replace(/^\s+|\s+$/g,'');
    safari.self.tab.setContextMenuEventUserInfo(e, sel);
}

function handleMessage(msg) {
	if (window !== window.top) return;
	if (msg.name === 'searchResults') {
        displayResult(msg.message);
    }
}

function displayResult(msg) {
	if ($('link[href^="safari-extension://com.matt-swain.opsin"][href$="css/opsin.css"]').length == 0) {
        $('<link rel="stylesheet" href="'+safari.extension.baseURI+'css/opsin.css">').appendTo('head');
	}
    var dialog = $('<div class="opsin-safari-extension" />'),
        title = $('<div class="opsse-title">OPSIN</div>')
        main = $('<div class="opsse-mol" />'),
        close = $('<button type="button" class="opsse-close">×</button>'),
        img = $('<img src="http://opsin.ch.cam.ac.uk/opsin/'+encodeURIComponent(msg)+'.png" title="'+msg+'">'),
        smiles = $('<button type="button" title="Save SMILES file" class="opsse-save">SMILES</button>'),
        inchi = $('<button type="button" title="Save InChI file" class="opsse-save">InChI</button>'),
        cml = $('<button type="button" title="Save CML file" class="opsse-save">CML</button>');
    smiles.click(function() { location.href = 'http://opsin.ch.cam.ac.uk/opsin/'+encodeURIComponent(msg)+'.smi'; });
    inchi.click(function() { location.href = 'http://opsin.ch.cam.ac.uk/opsin/'+encodeURIComponent(msg)+'.inchi'; });
    cml.click(function() { location.href = 'http://opsin.ch.cam.ac.uk/opsin/'+encodeURIComponent(msg)+'.cml'; });
    close.click(function() { $(this).parent().fadeOut(); });
    dialog.append(close).append(title).append(main);
    main.append(img).append(smiles).append(inchi).append(cml);
    img.error(function() {
    	main.remove();
    	dialog.append('<div class="opsse-noresults">No Results Found</div>');
    })
    dialog.css({top: locY, left: locX, display: 'none'});
    dialog.drags({handle: '.opsse-title'})
    dialog.appendTo('body').fadeIn();
}

// Draggable code
(function($) {
    $.fn.drags = function(opt) {
        opt = $.extend({cursor:'move'}, opt);
        var $el = this.find(opt.handle);
        return $el.css('cursor', opt.cursor).on('mousedown', function(e) {
            var $drag = $(this).addClass('opsse-active-handle').parent().addClass('opsse-draggable');
            locZ = Math.max(5001, locZ+1);
            var drg_h = $drag.outerHeight(),
                drg_w = $drag.outerWidth(),
                pos_y = $drag.offset().top + drg_h - e.pageY,
                pos_x = $drag.offset().left + drg_w - e.pageX;
            $drag.css('z-index', locZ).parents().on('mousemove', function(e) {
                $('.opsse-draggable').offset({
                    top:e.pageY + pos_y - drg_h,
                    left:e.pageX + pos_x - drg_w
                }).on('mouseup', function() {
                    $(this).removeClass('opsse-draggable');
                });
            });
            e.preventDefault(); // disable selection
        }).on('mouseup', function() {
            $(this).removeClass('opsse-active-handle').parent().removeClass('opsse-draggable');
        });
    }
})(jQuery);

document.addEventListener('contextmenu', handleContextMenu, false);
safari.self.addEventListener('message', handleMessage, false);
