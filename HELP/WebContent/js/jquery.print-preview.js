/*!
 * jQuery Print Previw Plugin v1.0.1
 *
 * Copyright 2011, Tim Connell
 * Licensed under the GPL Version 2 license
 * http://www.gnu.org/licenses/gpl-2.0.html
 *
 * Date: Wed Jan 25 00:00:00 2012 -000
 */
 
(function($) { 
    var print_obj_nm;   
	var print_zoom;
	// Initialization
	$.fn.printPreview = function(obj_nm, obj_zoom) {
		print_obj_nm = obj_nm;
		print_zoom = obj_zoom;
		this.each(function() {
			$(this).bind('click', function(e) {
			    e.preventDefault();
			    if (!$('#print-modal').length) {
			        $.printPreview.loadPrintPreview();
			    }
			});
		});
		return this;
	};
    
    // Private functions
    var mask, size, print_modal, print_controls;
    $.printPreview = {
        loadPrintPreview: function() {
            // Declare DOM objects
            print_modal = $('<div id="print-modal"></div>');
            print_controls = $('<div id="print-modal-controls">' + 
                                    '<a href="#" class="print" title="Print page">Print page</a>' +
                                    '<a href="#" class="close" title="Close print preview">Close</a>').hide();
            var print_frame = $('<iframe id="print-modal-content" scrolling="no" frameborder="0" name="print-frame" />');

            // Raise print preview window from the dead, zooooooombies
            print_modal
                .hide()
                .append(print_controls)
                .append(print_frame)
                .appendTo('body');

            // The frame lives
            for (var i=0; i < window.frames.length; i++) {
                if (window.frames[i].name == "print-frame") {    
                    var print_frame_ref = window.frames[i].document;
                    break;
                }
            }
            print_frame_ref.open();
            print_frame_ref.write('<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">' +
                '<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="ko" lang="ko">' + 
                '<head><title>' + document.title + '</title></head>' +
                '<body style="background:none;"></body>' +
                '</html>');
            print_frame_ref.close();
            
            // Grab contents and apply stylesheet
            //var $iframe_head = $('head link[media*=print], head link[media=all]').clone(),
            //    $iframe_body = $('body > *:not(#print-modal):not(script)').clone();
			
            var $iframe_head = $('head link').clone(),
                $iframe_body = $(''+print_obj_nm+' > *:not(#print-modal):not(script)').clone();	
			
            //var $iframe_head = $('head').clone();
            //var $iframe_body = $(print_obj_nm+' > *:not(#print-modal):not(script)').clone();
			
            $iframe_head.each(function() {
                $(this).attr('media', 'all');
            });
			
			var add_obj_nm = "";
			if(print_obj_nm.indexOf(".") > -1){
				add_obj_nm = " class='"+print_obj_nm.substring(print_obj_nm.indexOf(".")+1,print_obj_nm.length)+"' ";
			}else if(print_obj_nm.indexOf("#")  > -1){
				add_obj_nm = " id='"+print_obj_nm.substring(print_obj_nm.indexOf("#")+1,print_obj_nm.length)+"' ";
			}
			
            if (!$.browser.msie && !($.browser.version < 7) ) {
				//alert(1);
				//return;
                $('head', print_frame_ref).append($iframe_head);
                $('body', print_frame_ref).append("<div id=\"container\"></div>");
                $('#container', print_frame_ref).append("<div class=\"contents\"></div>");
				$('.contents', print_frame_ref).append("<div "+add_obj_nm+"></div>");
                $('body '+print_obj_nm, print_frame_ref).append($iframe_body);
				
            }else {
				//alert(2);
				$('body', print_frame_ref).append("<div "+add_obj_nm+"></div>");
                $(''+print_obj_nm+' > *:not(#print-modal):not(script)').clone().each(function() {
                    $('body '+print_obj_nm, print_frame_ref).append(this.outerHTML);
                });
                $('head link').each(function() {
                    $('head', print_frame_ref).append($(this).clone().attr('media', 'all')[0].outerHTML);
                });
            }
			
			
			//return;
            
            // Disable all links
            $('a', print_frame_ref).bind('click.printPreview', function(e) {
                e.preventDefault();
            });
            
            // Introduce print styles
            $('head').append('<style type="text/css">' +
                '@media print {' +
                    '/* -- Print Preview --*/' +
                    '#print-modal-mask,' +
                    '#print-modal {' +
                        'display: none !important;' +
                    '}' +
                '}' +
                '</style>'
            );

            // Load mask
            $.printPreview.loadMask();

            // Disable scrolling
            $('body').css({overflowY: 'hidden', height: '100%'});
            $('img', print_frame_ref).load(function() {
                print_frame.height($('body', print_frame.contents())[0].scrollHeight);
            });
            
            // Position modal            
            starting_position = $(window).height() + $(window).scrollTop();
            var css = {
                    top:         starting_position,
                    height:      '100%',
                    overflowY:   'auto',
                    zIndex:      99999,
                    display:     'block'
                }
            print_modal
                .css(css)
                .animate({ top: $(window).scrollTop()}, 400, 'linear', function() {
                    print_controls.fadeIn('slow').focus();
                });
            //print_frame.height($('body', print_frame.contents())[0].scrollHeight);
			//$(print_frame,parent.document).attr("height",$(window).height()+"px");
			//alert($('#print-modal-content').find('body').height());
            
			
            /*$('#print-modal-content').find('img').each(function() {
				var imgwidth = $(this).attr('width');
				if(imgwidth > 500){
					imgwidth = 500;
					$(this).attr('width',imgwidth);
				}
            });*/
			
			print_frame_ref.body.style.zoom=print_zoom;
			
            // Bind closure
            $('a', print_controls).bind('click', function(e) {
                e.preventDefault();
                if ($(this).hasClass('print')) { 
					document.getElementById("print-modal-content").contentWindow.focus();
					document.getElementById("print-modal-content").contentWindow.print();
					//alert(document.frames['print-frame'].innerHTML);
				}else { $.printPreview.distroyPrintPreview(); }
            });
    	},
    	
    	distroyPrintPreview: function() {
    	    print_controls.fadeOut(100);
    	    print_modal.animate({ top: $(window).scrollTop() - $(window).height(), opacity: 1}, 400, 'linear', function(){
    	        print_modal.remove();
    	        $('body').css({overflowY: 'auto', height: 'auto'});
    	    });
    	    mask.fadeOut('slow', function()  {
    			mask.remove();
    		});				

    		$(document).unbind("keydown.printPreview.mask");
    		mask.unbind("click.printPreview.mask");
    		$(window).unbind("resize.printPreview.mask");
	    },
	    
    	/* -- Mask Functions --*/
	    loadMask: function() {
	        size = $.printPreview.sizeUpMask();
            mask = $('<div id="print-modal-mask" />').appendTo($('body'));
    	    mask.css({				
    			position:           'fixed', 
    			top:                0, 
    			left:               0,
    			width:              size[0],
    			height:             size[1],
    			display:            'none',
    			opacity:            0,					 		
    			zIndex:             9999,
    			backgroundColor:    '#000'
    		});
	
    		mask.css({display: 'block'}).fadeTo('400', 0.75);
    		
            $(window).bind("resize..printPreview.mask", function() {
				$.printPreview.updateMaskSize();
			});
			
			mask.bind("click.printPreview.mask", function(e)  {
				$.printPreview.distroyPrintPreview();
			});
			
			$(document).bind("keydown.printPreview.mask", function(e) {
			    if (e.keyCode == 27) {  $.printPreview.distroyPrintPreview(); }
			});
        },
    
        sizeUpMask: function() {
			//alert($.browser.msie);
			var agent = navigator.userAgent.toLowerCase();
			var ie11_chk = false;
			if( (navigator.appName == "Netscape" && navigator.userAgent.search('Trident')!=-1) || (navigator.userAgent.search('msie') !=-1) ){
				ie11_chk = true;
			}
            if ($.browser.msie || ie11_chk) {
            	// if there are no scrollbars then use window.height
				
            	var d = $(document).height(), w = $(window).height();
				if(ie11_chk == true){
					return [
						"100%",
						"100%"
					];
				}else{
					return [
						window.innerWidth || 						// ie7+
						document.documentElement.clientWidth || 	// ie6  
						document.body.clientWidth, 					// ie6 quirks mode
						d - w < 20 ? w : d
					];
				}

            } else { return [$(document).width(), $(document).height()]; }
        },
    
        updateMaskSize: function() {
    		var size = $.printPreview.sizeUpMask();
    		mask.css({width: size[0], height: size[1]});
        }
    }
})(jQuery);