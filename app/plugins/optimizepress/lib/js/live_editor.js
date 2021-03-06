;var op_cur_html;
(function($){
	var cur = [], fancy_defaults = {}, win = $(window),
		parent_win = window.dialogArguments || opener || parent || top,
		scroll_top, epicbox,
		child_element = false, cur_child, refresh_item = null,
		sort_default = {
			revert:'invalid',
			scrollSensitivity: '50',
			tolerance: 'pointer'
		},
		editor_switch = false,
		wysiwygs_checked = false;
	var cat_options = [];
	var subcat_options = [];

	//OP is global optimizepress object
	OP = OP || {};
	OP.disable_alert = false;

	$(document).ready(function(){
		bind_content_sliders();
		$('#op_category_id').find('option').each(function() {
			var selected_val;
			if ($(this).attr('selected')) {
				selected_val = $(this).val();
			} else {
				selected_val = '';
			}
			cat_options.push({value: $(this).val(), text: $(this).text(), parent: $(this).attr('class'), selected: selected_val});
		});
		$('#op_subcategory_id').find('option').each(function() {
			var selected_val;
			if ($(this).attr('selected')) {
				selected_val = $(this).val();
			} else {
				selected_val = '';
			}
			subcat_options.push({value: $(this).val(), text: $(this).text(), parent: $(this).attr('class'), selected: selected_val});
		});
		if(typeof switchEditors != 'undefined'){
			editor_switch = true;
		}
		/*******/
		$('#op_product_id').change(function(event, a){
			show_member_fields($('#op_category_id'), $(this).val(), 'category', a);
		}).trigger('change', ["first"]);
		$('#op_category_id').change(function(event, a){
			show_member_fields($('#op_subcategory_id'), $(this).val(), 'subcategory', a);
		}).trigger('change', ["second"]);
		function show_member_fields(el, id, what, clean) {
			el.empty();
			if (what == 'category') {
				el.append(
					$('<option>').text('').val('')
				);
				$.each(cat_options, function(i) {
					var option = cat_options[i];
					if(option.parent === 'parent-' + id) {
						if (option.selected != '') {
							el.append(
									$('<option>').text(option.text).val(option.value).attr('selected', true)
								);
						} else {
							el.append(
								$('<option>').text(option.text).val(option.value)
							);
						}
					}
				});
			} else {
				el.append(
					$('<option>').text('').val('')
				);
				$.each(subcat_options, function(i) {
					var option = subcat_options[i];
					if(option.parent === 'parent-' + id) {
						if (option.selected != '') {
							el.append(
									$('<option>').text(option.text).val(option.value).attr('selected', true)
								);
						} else {
							el.append(
								$('<option>').text(option.text).val(option.value)
							);
						}
					}
				});
			}
			if (typeof clean === 'undefined') {
				el.val('');
			}
			if (el.selector == '#op_category_id') {
				$('#op_category_id').trigger('change');
			}
			if (el.selector == '#op_category_id1') {
				$('#op_category_id1').trigger('change', clean);
			}
		};
		/*function show_member_fields(el, id, clean) {
			el.find("option").show();
			el.find("option:not(.parent-" + id + ",.default-val)").hide();
			if (typeof clean === 'undefined') {
				el.val('');
			}
			if (el.selector == '#op_category_id') {
				$('#op_category_id').trigger('change', clean);
			}
		};*/
		var preset_options = $('#preset-option-preset,#preset-option-content_layout');
		$('#preset-option :radio').change(function(){
			preset_options.hide();
			if($(this).is(':checked') && (v = $(this).val()) && v != 'blank'){
				$('#preset-option-'+v).show();
			}
		}).filter(':checked').trigger('change');
		/*******/
		epicbox = [$('#epicbox-overlay'),$('#epicbox')];
		epicbox.push($('.epicbox-content',epicbox[1]));
		epicbox.push($('.epicbox-scroll',epicbox[2]));
		epicbox[0].css({ opacity: 0.8 });
		win.bind('beforeunload',function(e){
			if(OP.disable_alert === false){
				var message = 'If you leave page, all unsaved changes will be lost.';
				if (typeof e == 'undefined') {
					e = window.event;
				}
				if (e) {
					e.returnValue = message;
				}
				return message;
			}
		}).resize(function(){
			scroll_top = $('.fancybox-inner').scrollTop();
			resize_epicbox();
		});
		fancy_defaults = {
			padding: 0,
			autoSize: true,
			wrapCSS: 'fancybox-no-scroll',
			helpers: {
				overlay: {
					closeClick: false
				}
			},
			beforeClose: close_wysiwygs,
			afterClose: function(){
				scroll_top = null;
				refresh_item = null;
				//This is necessary in order to hide the parent fancybox scrollbars and close button
				$('html').css({
					overflow: 'auto',
					height: 'auto'
				});
				$(window.parent.document).find('.fancybox-close').css({ display: 'block' });
			},
			beforeShow: function() {
				//This is necessary in order to hide the parent fancybox scrollbars and close button
				$('html').css({
					overflow: 'hidden',
					height: '100%'
				});
				$(window.parent.document).find('.fancybox-close').css({ display: 'none' });
			},
			afterShow: function(){
				if(editor_switch && typeof this.content != 'string'){
					this.content.find('.wp-editor-area').each(function(){
						var id = $(this).attr('id');
						$(this).val(OP_AB.autop($(this).val()));
						tinyMCE.execCommand("mceAddControl", true, id);
					});
				}
				$('select.op-type-switcher').trigger('change');
			},

			onCancel: function(){
				cur = [];
			},
			onUpdate: function(){
				if(scroll_top != null){
					$('.fancybox-inner').scrollTop(scroll_top);
				}
			}
		};
		$('#op-le-row-options-update').click(function(e){
			e.preventDefault();
			var dataStyles = {};
			if ($('input[name="op_full_width_row"]:checked').length > 0) {
				cur[0].addClass('section');
			} else {
				cur[0].removeClass('section');
			}

			// bg options
			if ($('#op_row_bg_options').val() && $('#op_row_background').val()) {
				var position = $('#op_row_bg_options').val();
				var image = "url(" + $('#op_row_background').val() + ")";
				dataStyles.backgroundImage = image;
				dataStyles.backgroundPosition = position;
				switch (position) {
					case 'center':
						cur[0].css({'background-image': image,
									'background-repeat': 'no-repeat',
									'background-position': 'center'});
					break;
					case 'cover':
						cur[0].css({'background-image': image,'background-size': 'cover',
									'background-repeat': 'no-repeat'});
					break;
					case 'tile_horizontal':
						cur[0].css({'background-image': image, 'background-repeat': 'repeat-x'});
					break;
					case 'tile':
						cur[0].css({'background-repeat' : 'repeat', 'background-image' : image});
					break;
				}
			} else {
				cur[0].css({'background-image': 'none', 'background-repeat': 'no-repeat'});
			}
			//bgcolor
			if ($('#op_section_row_options_bgcolor_start').val()) {
				dataStyles.backgroundColorStart = $('#op_section_row_options_bgcolor_start').val();
				if ($('#op_section_row_options_bgcolor_end').val()) {
					// gradient
					var start_color = $('#op_section_row_options_bgcolor_start').val();
					var end_color = $('#op_section_row_options_bgcolor_end').val();
					dataStyles.backgroundColorEnd = $('#op_section_row_options_bgcolor_end').val();
					cur[0]
						.css('background', start_color)
						.css('background', '-webkit-gradient(linear, left top, left bottom, color-stop(0%, ' + start_color + '), color-stop(100%, ' + end_color + '))')
						.css('background', '-webkit-linear-gradient(top, ' + start_color + ' 0%, ' + end_color + ' 100%)')
						.css('background', '-moz-linear-gradient(top, ' + start_color + ' 0%, ' + end_color + ' 100%)')
						.css('background', '-ms-linear-gradient(top, ' + start_color + ' 0%, ' + end_color + ' 100%)')
						.css('background', '-o-linear-gradient(top, ' + start_color + ' 0%, ' + end_color + ' 100%)')
						.css('background', 'linear-gradient(to bottom, ' + start_color + ' 0%, ' + end_color + ' 100%)')
						.css('filter', 'progid:DXImageTransform.Microsoft.gradient( startColorstr=' + start_color + ', endColorstr=' + end_color + ', GradientType=0 )');
				} else {
					cur[0].css('background-color', $('#op_section_row_options_bgcolor_start').val());
				}
			} else {
				cur[0].css('background-color', '');
			}
			//padding top
			if ($('#op_row_top_padding').val()) {
				cur[0].css('padding-top', $('#op_row_top_padding').val() + 'px');
				dataStyles.paddingTop = $('#op_row_top_padding').val();
			} else {
				cur[0].css('padding-top', '');
			}
			//padding bottom
			if ($('#op_row_bottom_padding').val()) {
				cur[0].css('padding-bottom', $('#op_row_bottom_padding').val() + 'px');
				dataStyles.paddingBottom = $('#op_row_bottom_padding').val();
			} else {
				cur[0].css('padding-bottom', '');
			}
			// border width
			if ($('#op_row_border_width').val()) {
				cur[0].css('border-top-width', $('#op_row_border_width').val() + 'px');
				cur[0].css('border-bottom-width', $('#op_row_border_width').val() + 'px');
				dataStyles.borderWidth = $('#op_row_border_width').val();
			} else {
				cur[0].css('border-top-width', '0px');
				cur[0].css('border-bottom-width', '0px');
			}
			// border color
			if ($('#op_section_row_options_borderColor').val()) {
				cur[0].css('border-top-color', $('#op_section_row_options_borderColor').val());
				cur[0].css('border-bottom-color', $('#op_section_row_options_borderColor').val());
				cur[0].css('border-style', 'solid');
				dataStyles.borderColor = $('#op_section_row_options_borderColor').val();
			} else {
				cur[0].css('border-top-color', '');
				cur[0].css('border-bottom-color', '');
			}
			var base = btoa(JSON.stringify(dataStyles));
			cur[0].attr('data-style', base);
			//console.log(dataStyles);
			$.fancybox.close();
		});
		$('.editable-area').each(function(){
			var el = $(this),
				id = el.attr('id');
			init_editable_area(el,id.substr(0,id.length-5));
			custom_item_ids(el);
		});
		init_child_elements();
		$('#op-le-row-select li a').click(function(e){
			$('#op-le-row-select li.selected').removeClass('selected');
			$(this).parent().addClass('selected');
			e.preventDefault();
		});
		$('#op-le-row-select-insert').click(function(e){
			e.preventDefault();
			add_new_row($('#op-le-row-select li.selected').find('a:first'));
		});
		$('#op-le-row-select li a').dblclick(function(e){
			e.preventDefault();
			add_new_row($(this));
		});
		// split columns
		$('#op-le-split-column li a').click(function(e){
			$('#op-le-split-column li.selected').removeClass('selected');
			$(this).parent().addClass('selected');
			e.preventDefault();
		});
		$('#op-le-split-column-insert').click(function(e){
			e.preventDefault();
			split_column($('#op-le-split-column li.selected').find('a:first'));
		});
		$('a.add-new-element').each(function() {
			if ($(this).width() < 120) {
				$(this).find('span').hide();
			}
		});
		$('#op-le-split-column li a').dblclick(function(e){
			e.preventDefault();
			split_column($(this));
		});
		// end split columns
		$('a.feature-settings').live('click',function(e){
			e.preventDefault();
			e.stopPropagation();
			var $t = $(this);
			cur = [$t.closest('.op-feature-area'),'replaceWith'];
			$.fancybox.open($.extend({},fancy_defaults,{
				type: 'inline',
				href: $t.attr('href')
			}));
		});
		$('#op-le-settings-toolbar div.links a').click(function(e){
			e.preventDefault();
			var h = $(this).attr('href').split('#')[1], c = $('#'+h);
			$.fancybox($.extend({},fancy_defaults,{minWidth:c.width(),href:'#'+h}));
		});

		$('form.op-feature-area').submit(function(e){
			e.preventDefault();

			$(this).find('.wp-editor-area').each(function(){
				var id = $(this).attr('id'),
					content = OP_AB.wysiwyg_content(id);
				$(this).val(content);
			});
			$.post(OptimizePress.ajaxurl,$(this).serialize(),
				function(resp){
					if(typeof resp.error != 'undefined'){
						alert(resp.error);
					} else {
						cur[0][cur[1]](resp.output);
						OP_Feature_Area[resp.option] = resp.js_options;
						$.fancybox.close();
					}
				},
				'json'
			);
		});

		$('#op-le-close-editor').click(function(e){
			e.preventDefault();
			OP.disable_alert = true;
			parent_win.OP.disable_alert = true;
			parent_win.jQuery.fancybox.close();
		});

		$('#op-le-save-1').click(function(e){
			e.preventDefault();
			save_content();
		});

		$('#op-le-save-2').click(function(e){
			e.preventDefault();
			OP.disable_alert = true;
			parent_win.OP.disable_alert = true;
			save_content(parent_win.jQuery.fancybox.close);
		});
		$('#le-settings-dialog').submit(function(e){
			e.preventDefault();
			$.fancybox.close();
		});

		$('#le-typography-dialog').submit(function(e){
			e.preventDefault();
			$.fancybox.close();
			var data = {
				action: OptimizePress.SN+'-live-editor-typography',
				_wpnonce: $('#_wpnonce').val(),
				page_id: $('#page_id').val()
			};
			$.extend(data,serialize($(this)));
			$.post(OptimizePress.ajaxurl,data,function(resp){
				if(typeof resp.error != 'undefined'){
					alert(resp.error);
				} else {
					var el = $('#op_header_css');
					if(typeof resp.css != 'undefined'){
						if(el.length > 0){
							el.replaceWith(resp.css);
						} else {
							$('head').append(resp.css);
						}
					} else {
						el.remove();
					}
				}
			},'json');
		});
		$('.op-feature-area:not(:has(.editable-area))').live('click',function(e){
			$(this).find('a.feature-settings').trigger('click');

			/*
			 * Preventing onbeforeunload event
			 */
			if (typeof $(this).attr('data-unload') != 'undefined' && $(this).attr('data-unload') == '0') {
				e.preventDefault();
			}
		});
		$('.fancybox-inner a').live('click',function(e){
			scroll_top = $('.fancybox-inner').scrollTop();
			$.fancybox.update();
		});
		init_content_layouts();
		init_presets_dialogs();
		if(op_launch_funnel_enabled === true && typeof parent_win.op_launch_suite_update_selects == 'function'){
			parent_win.op_launch_suite_update_selects($('#page_id').val());
		}

		//$('a[href$="#le-settings-dialog"]').trigger('click');
	});
	
	function bind_content_sliders(){
		//Get all the content slider buttons
		var $btn = $('.op-content-slider-button'), $cur_btn;
		
		//Loop through all buttons
		$btn.each(function(){
			$cur_btn = $(this);
			var $target = $('#' + $(this).data('target')); //Get the target of the current button (the content slider)
			
			//Unbind any existing click events so we dont duplicate them
			$(this).unbind('click').click(function(e){
				var scrollY = window.pageYOffset;
				$target.show().animate({top:scrollY},400);
				e.preventDefault();
			});
			
			//Initialize the close button
			$target.find('.hide-the-panda').unbind('click').click(function(e){
				var scrollY = window.pageYOffset;
				
				$target.animate({top:-(scrollY)},400, function(){
					$(this).hide();
				});
				
				e.preventDefault();
			});
			
			$target.delegate('ul.op-image-slider-content li a','click',function(e){
				var $input = $cur_btn.next('input.op-gallery-value');
				var $preview = $input.next('.file-preview').find('.content');
				var src = $(this).find('img').attr('src');
				var html = '<a class="preview-image" target="_blank" href="' + src + '"><img alt="uploaded-image" src="' + src + '"></a><a class="remove-file button" href="#remove">Remove Image</a>';
				$input.val(src);
				$input.parent().next('.op-file-uploader').find('.file-preview .content').empty().html(html).find('.remove-file').click(function(){
					$(this).parent().empty().parent('.file-preview').prev('.op-uploader-value').val('');
				});
				/*$preview.empty().html(html).find('.remove-file').click(function(){
					$preview.empty().parent('.file-preview').prev('.op-gallery-value').val('');
				});*/
				$('#op_page_thumbnail').val(src);
				$target.animate({top:-475},400, function(){
					$(this).hide();
				});
				
				e.preventDefault();
			});
		});
	}

	function init_content_layouts(){
		var buttons = $('#le-layouts-dialog .op-insert-button');
		$('#le-layouts-dialog ul.op-bsw-grey-panel-tabs a').click(function(e){
			e.preventDefault();
			if($(this).get_hash() == 'predefined'){
				buttons.show();
			} else {
				buttons.hide();
			}
		});
		$('#export_layout_category_create_new').click(function(e){
			e.preventDefault();
			$('#export_layout_category_select_container:visible').fadeOut('fast',function(){
				$('#export_layout_category_new_container').fadeIn('fast');
			});
		});
		$('#export_layout_category_select').click(function(e){
			e.preventDefault();
			$('#export_layout_category_new_container:visible').fadeOut('fast',function(){
				$('#export_layout_category_select_container').fadeIn('fast');
			});
		});
		$('#export_layout_category_new_submit').click(function(e){
			e.preventDefault();
			var waiting = $(this).next().find('img').fadeIn('fast'), name = $(this).prev().val(),
				data = {
					action: OptimizePress.SN+'-live-editor-create-category',
					_wpnonce: $('#_wpnonce').val(),
					category_name: name
				};
			$.post(OptimizePress.ajaxurl,data,function(resp){
				waiting.fadeOut('fast');
				if(typeof resp.error != 'undefined'){
					alert(resp.error);
				} else {
					$('#export_layout_category').html(resp.html);
					$('#export_layout_category_select').trigger('click');
				}
			},'json');
		});
		// membership
		$('#le-membership-dialog').submit(function(e){
			e.preventDefault();
			$.fancybox.close();
			$.fancybox.showLoading();
			var data = {
				action: OptimizePress.SN+'-live-editor-membership',
				_wpnonce: $('#_wpnonce').val(),
				page_id: $('#page_id').val()
			};
			$.extend(data, serialize($(this)));
			//save_content();
			$.post(OptimizePress.ajaxurl, data,
				function(resp){
					$.fancybox.hideLoading();
					if(typeof resp.error != 'undefined'){
						alert(resp.error);
					}
					if(typeof resp.done != 'undefined'){
						OP.disable_alert = true;
						window.location.reload();
					}
				},
				'json'
			);
		});
		// end membership

		// headers
		$('#le-headers-dialog').submit(function(e){
			e.preventDefault();
			var selected = $(this).find(':radio:checked').val();
			$.fancybox.close();
			//$.fancybox.showLoading();
			var data = {
				action: OptimizePress.SN+'-live-editor-headers',
				_wpnonce: $('#_wpnonce').val(),
				page_id: $('#page_id').val()
			};
			$.extend(data, serialize($(this)));
			save_content();
			$.post(OptimizePress.ajaxurl, data,
				function(resp){
					$.fancybox.hideLoading();
					if(typeof resp.error != 'undefined'){
						alert(resp.error);
					}
					if(typeof resp.done != 'undefined'){
						OP.disable_alert = true;
						window.location.reload();
					}
				},
				'json'
			);
		});
		// end headers
		// colours
		$('#le-colours-dialog').submit(function(e){
			e.preventDefault();
			var selected = $(this).find(':radio:checked').val();
			$.fancybox.close();
			//$.fancybox.showLoading();
			var data = {
				action: OptimizePress.SN+'-live-editor-colours',
				_wpnonce: $('#_wpnonce').val(),
				page_id: $('#page_id').val()
			};
			$.extend(data, serialize($(this)));
			save_content();
			$.post(OptimizePress.ajaxurl, data,
				function(resp){
					$.fancybox.hideLoading();
					if(typeof resp.error != 'undefined'){
						alert(resp.error);
					}
					if(typeof resp.done != 'undefined'){
						OP.disable_alert = true;
						window.location.reload();
					}
				},
				'json'
			);
		});
		// end colours

		$('#le-layouts-dialog').submit(function(e){
			e.preventDefault();
			var selected = $(this).find(':radio:checked').val();
			$.fancybox.close();
			$.fancybox.showLoading();
			var opts = {
				action: OptimizePress.SN+'-live-editor-get-layout',
				_wpnonce: $('#_wpnonce').val(),
				layout: selected,
				page_id: $('#page_id').val(),
				keep_options: []
			};
			$('#content_layout_keep_options :checkbox:checked').each(function(){
				opts.keep_options.push($(this).val());
			});
			$.post(OptimizePress.ajaxurl,opts,
				function(resp){
					$.fancybox.hideLoading();
					if(typeof resp.error != 'undefined'){
						alert(resp.error);
					}
					if(typeof resp.done != 'undefined'){
						OP.disable_alert = true;
						window.location.reload();
					}
				},
				'json'
			);
		});

		$('#op_export_content').delegate('a.delete-file','click',function(e){
			e.preventDefault();
			var waiting = $(this).parent().prev().fadeIn('fast'),
				data = {
					action: OptimizePress.SN+'-live-editor-deleted-exported-layout',
					_wpnonce: $('#_wpnonce').val(),
					filename: $('#zip_filename').val()
				};
			$.post(OptimizePress.ajaxurl,data,function(resp){
				waiting.fadeOut('fast');
				if(typeof resp.error != 'undefined'){
					alert(resp.error);
				}
				$('#op_export_content').html('');
			},'json');
		});

		$('#export_layout_submit').click(function(e){
			e.preventDefault();
			$('#op_export_content').html('');
			var waiting = $(this).next().fadeIn('fast'),
				data = {
					action: OptimizePress.SN+'-live-editor-export-layout',
					status: $('#op-live-editor-status').val(),
					_wpnonce: $('#_wpnonce').val(),
					layout_name: $('#export_layout_name').val(),
					layout_description: $('#export_layout_description').val(),
					layout_category: $('#export_layout_category').val(),
					image: $('#export_layout_image_path').val(),
					page_id: $('#page_id').val(),
					op: {},
					layouts: {}
				};

			$('div.editable-area').each(function(){
				var l = $(this).data('layout');
				data.layouts[l] = get_layout_array($(this));
			});
			if(typeof OP_Feature_Area != 'undefined'){
				data.feature_area = OP_Feature_Area;
			}
			var dialogs = ['typography','settings'];
			for(var i=0,dl=dialogs.length;i<dl;i++){
				$.extend(data.op,serialize($('#le-'+dialogs[i]+'-dialog')).op || {});
			}

			$.post(OptimizePress.ajaxurl,data,
				function(resp){
					waiting.fadeOut('fast');
					if(typeof resp.error != 'undefined'){
						alert(resp.error);
					}
					if(typeof resp.output != 'undefined'){
						$('#op_export_content').html(resp.output);
					}
				},
				'json'
			);
		});

		$('#op_header_layout_nav_bar_alongside_enabled').change(function(){
			$('#advanced_colors_nav_bar_alongside').toggle($(this).is(':checked'));
		}).trigger('change');

		$('#op_footer_area_enabled').change(function(){
			$('#advanced_colors_footer').toggle($(this).is(':checked'));
		}).trigger('change');

		$('#op_header_layout_nav_bar_below_enabled').change(function(){
			$('#advanced_colors_nav_bar_below').toggle($(this).is(':checked'));
		}).trigger('change');

		$('#op_header_layout_nav_bar_above_enabled').change(function(){
			$('#advanced_colors_nav_bar_above').toggle($(this).is(':checked'));
		}).trigger('change');
	};

	function init_presets_dialogs(){
		$('#op-save-preset').click(function(e){
			e.preventDefault();
			$.fancybox.open($.extend({},fancy_defaults,{
				type: 'inline',
				href: '#le-presets-dialog'
			}));
		});
		$('#le-presets-dialog').submit(function(e){
			e.preventDefault();
			var data = {
				action: OptimizePress.SN+'-live-editor-save-preset',
				status: $('#op-live-editor-status').val(),
				_wpnonce: $('#_wpnonce').val(),
				page_id: $('#page_id').val(),
				op: {},
				preset: serialize($('#le-presets-dialog')),
				layouts: {}
			};
			$('div.editable-area').each(function(){
				var l = $(this).data('layout');
				data.layouts[l] = get_layout_array($(this));
			});
			if(typeof OP_Feature_Area != 'undefined'){
				data.feature_area = OP_Feature_Area;
			}
			var dialogs = ['typography','settings'];
			for(var i=0,dl=dialogs.length;i<dl;i++){
				$.extend(data.op,serialize($('#le-'+dialogs[i]+'-dialog')).op || {});
			}
			$.post(OptimizePress.ajaxurl,data,
				function(resp){
					if(typeof resp.error != 'undefined'){
						alert(resp.error);
					} else {
						if(typeof resp.preset_dropdown != 'undefined'){
							$('#preset_save').html(resp.preset_dropdown);
							$('#preset_type').val('overwrite').trigger('change');
						}
						alert('Saved');
						$.fancybox.close();
					}
				},
				'json'
			);
		});
	};

	function resize_epicbox(){
		//epicbox[3].css("height",epicbox[3].innerHeight() + "px");
		epicbox[1].height(epicbox[3].outerHeight());
		epicbox[2].height(epicbox[1].height());
		epicbox[1].css("margin-top","-" +  epicbox[1].innerHeight() / 2 + "px");



		/*
		0 = #epicbox-overlay
		1 = #epicbox
		2 = .epicbox-content
		3 = .epicbox-scroll
		4 = .epicbox-actual-content

		*/
	};
	function init_child_elements(){
		$('.element-container a.add-new-element').live('click',function(e){
			var $t = $(this),
				w = parseInt($t.closest('.cols').width())+40;
			e.preventDefault();
			resize_epicbox();
			epicbox[3].html('');
			epicbox[2].css('background','url(images/wpspin_light.gif) no-repeat center center');
			epicbox[0].add(epicbox[1]).fadeIn();
			epicbox[1].width(w).css('margin-left',-(w/2)+'px');
			cur_child = $t.closest('.element').find('textarea.op-le-child-shortcode');
			op_cur_html = epicbox[3];
			$.post(OptimizePress.ajaxurl,
				{
					action: OptimizePress.SN+'-live-editor-parse',
					_wpnonce: $('#_wpnonce').val(),
					shortcode: cur_child.val(),
					depth: 1,
					page_id: $('#page_id').val()
				},
				function(resp){
					if(typeof resp.output != 'undefined'){
						epicbox[2].css('background','none');
						epicbox[3].html(resp.output+resp.js);
						epicbox[4] = $('.epicbox-actual-content',epicbox[3]);
						resize_epicbox();
						init_child_sortables();
					}
				},
				'json'
			);
		});
		$('.op-element-links a.element-delete',epicbox[3]).live('click',function(e){
			e.preventDefault();
			confirm('Are you sure you wish to remove this element?') && $(this).closest('.row').remove();
		});
		$('a.add-new-element',epicbox[3]).live('click',function(e){
			e.preventDefault();
			child_element = true;
			var prev = $(this).prev();
			cur = [$(this),'before'];
			refresh_item = null;
			OP_AB.open_dialog();
		});

		$('.op-element-links a.element-settings',epicbox[3]).live('click',function(e){
			e.preventDefault();
			var el = $(this).closest('.row');
			cur = [el,'replaceWith'];
			child_element = true;
			edit_element(el,false);
		});

		$('.close',epicbox[1]).click(function(e){
			e.preventDefault();
			epicbox[0].add(epicbox[1]).fadeOut();
		});

		$('#op_child_elements_form').submit(function(e){
			e.preventDefault();
			var out = '[op_liveeditor_elements] ';
			$(this).find('textarea.op-le-child-shortcode').each(function(){
				out += '[op_liveeditor_element]'+$(this).val()+'[/op_liveeditor_element] ';
			});
			out += '[/op_liveeditor_elements] ';
			cur_child.val(out);
			refresh_element(cur_child);
			child_element = false;
			$('.close',epicbox[1]).trigger('click');
		});
	};
	function close_wysiwygs(){
		if(editor_switch && typeof this.content != 'string'){
			this.content.find('.wp-editor-area').each(function(){
				var id = $(this).attr('id');
				if(id != 'opassetswysiwyg'){
					$('#'+id+'-tmce').trigger('click');
					//var content = OP_AB.wysiwyg_content(id);
					tinyMCE.execCommand('mceFocus', false, id);
					tinyMCE.execCommand('mceRemoveControl', false, id);
					//$(this).val(content);
				}
			});
		}
	};
	function init_child_sortables(ref){
		var ref = ref || false;
		if(ref){
			epicbox[4].sortable('refresh').disableSelection();
		} else {
			epicbox[4].sortable($.extend({},sort_default,{
				handle:'.op-element-links .element-move',
				items:'div.row',
				update: null
			})).disableSelection();
		}
	};
	function get_full_shortcode(c){
		var textarea = c.find('textarea.op-le-shortcode'),
			sc = textarea.text();
		if (!sc) {
			sc = textarea.val();
		}
		var reg = new RegExp('#OP_CHILD_ELEMENTS#');
		c.find('textarea.op-le-child-shortcode').each(function(){
			sc = sc.replace(reg,$(this).val());
		});

		return sc;
	};
	function refresh_element(text){
		text.text('');
		var c = text.closest('.element-container'),
			sc = get_full_shortcode(c),
			el = c.find('.element:first'),
			waiting = c.find('.op-waiting');
		op_cur_html = c;
		el.fadeOut('fast').html('');
		waiting.fadeIn('fast');
		$.post(OptimizePress.ajaxurl,
			{
				action: OptimizePress.SN+'-live-editor-parse',
				_wpnonce: $('#_wpnonce').val(),
				shortcode: sc,
				depth: 0,
				page_id: $('#page_id').val()
			},
			function(resp){
				if(typeof el != 'undefined' && typeof resp.output != 'undefined'){
					el.html(resp.output+resp.js);
					var area = c.closest('.editable-area');
					refresh_sortables(area);
					if(typeof resp.shortcode != 'undefined'){
						text.val(resp.shortcode);
					}
					waiting.fadeOut('fast',function(){
						el.fadeIn('fast');
					});
					custom_item_ids(area);
				}
			},
			'json'
		);
	};
	function custom_item_ids(container){
		container.each(function(idx){
			var $t = $(this),
				id = $t.attr('id'),
				pref = 'le_'+(id == 'footer_area' ? 'footer' : (id == 'content_area' ? 'body' : id ))+'_row_',
				rcounter = 1;
			$(this).find('> .row').each(function(){
				var ccounter = 1;
				$(this).attr('id',pref+rcounter).find('> .cols').each(function(){
					var ecounter = 1;
					$(this).attr('id',pref+rcounter+'_col_'+ccounter).find('> .element-container:not(.sort-disabled)').each(function(){
						$(this).attr('id',pref+rcounter+'_col_'+ccounter+'_el_'+ecounter);
						ecounter++;
					});
					ccounter++;
				});
				rcounter++;
			});
		});
	};
	/**
	 * NEW FUNCTION
	 */
	function get_layout_array(el){
		var data = [],
			nr = 0;
		if(el.length > 0){
			data = [];
		}
		el.find('> .row').each(function(){
			var therow = $(this),
				row = {
					row_class: therow.attr('class'),
					row_style: therow.attr('style'),
					row_data_style: therow.attr('data-style'),
					children: []
				};
			therow.find('> > .cols:not(.sort-diabled)').each(function(){
				var thecol = $(this),
					col = {
						col_class: thecol.attr('class'),
						type: 'column',
						children: []
					},
					rchild = {
						type: '',
						object: {}
					},
					schild = {
						type : '',
						object : {}
					};

				thecol.find('> div:not(.sort-disabled, .add-element-container)').each(function() {
					var cchild = {
						type: '',
						object: {}
					};
					if ($(this).hasClass('element-container')) {
						cchild.type = 'element';
						cchild.object = get_full_shortcode($(this));
						cchild.element_class = $(this).attr('class');
						if (!$(this).hasClass('cf')) {
							$(this).addClass('cf');
						}
						cchild.element_data_style = $(this).attr('data-style');
						col.children.push(cchild);
					} else if ($(this).hasClass('subcol')) {
						var thesubcol = $(this),
						subcol = {
							subcol_class: $(this).attr('class'),
							type: 'subcolumn',
							children: []
						};
						thesubcol.find('> div:not(.sort-disabled, .add-element-container)').each(function() {
							var thesubcolel = $(this),
								gchild = {
									type: '',
									object: {}
								};
							gchild.type = 'element';
							gchild.object = get_full_shortcode(thesubcolel);
							gchild.element_class = $(this).attr('class');
							gchild.element_data_style = $(this).attr('data-style');
							subcol.children.push(gchild);
						});
						//console.log(subcol);
						col.children.push(subcol);
						//console.log(col);
					}
				});
				rchild.type = 'column';
				rchild.object = col;
				row.children.push(rchild);
				//console.log(row);
			});
			data.push(row);
		});
		//console.log(data);

		return data;
	};
	function save_content(callback){
		var data = {
			action: OptimizePress.SN+'-live-editor-save',
			status: $('#op-live-editor-status').val(),
			_wpnonce: $('#_wpnonce').val(),
			page_id: $('#page_id').val(),
			op: {},
			layouts: {}
		};

		$('div.editable-area').each(function(){
			var l = $(this).data('layout');
			data.layouts[l] = get_layout_array($(this));
		});
		if(typeof OP_Feature_Area != 'undefined'){
			data.feature_area = OP_Feature_Area;
		}
		var dialogs = ['typography','settings'];
		for(var i=0,dl=dialogs.length;i<dl;i++){
			$.extend(data.op,serialize($('#le-'+dialogs[i]+'-dialog')).op || {});
		}
		$.post(OptimizePress.ajaxurl,data,
			function(resp){
				if(typeof resp.error != 'undefined'){
					alert(resp.error);
				} else if($.isFunction(callback)){
					alert('Saved');
					callback();
				} else {
					alert('Saved');
				}
			},
			'json'
		);
	};
	function init_editable_area(container,prefix){
		prefix = prefix || '';
		prefix = prefix == '' ? '' : prefix+'-';
		if(container.data('one_col') == 'N'){
			container.append('<div id="'+prefix+'add-new-row" class="cf"><div class="'+prefix+'add-new-row-link"><div class="add-new-row-content"><a href="#op-le-row-select" class="add-new-button"><img src="'+OptimizePress.imgurl+'/live_editor/add_new.png" alt="'+translate('add_new_row')+'" /><span>'+translate('add_new_row')+'</span></a></div></div></div>');
			var el = $('a','#'+prefix+'add-new-row');
			el.fancybox($.extend({},fancy_defaults,{
				type: 'inline',
				href: '#op-le-row-select',
				beforeLoad: function(){
					cur = [$('#'+prefix+'add-new-row'),'before'];
				}
			}));
			$('.add-new-row',container).live('click',function(e){
				e.preventDefault();
				cur = [$(this).closest('.row'),'before'];
				$.fancybox.open($.extend({},fancy_defaults,{
					type: 'inline',
					href: '#op-le-row-select'
				}));
			});
			$('.cols').live('mouseenter', function(){
				$(this).find('.split-column').fadeIn(100);
			});
			$('.cols').live('mouseleave', function(){
				$(this).find('.split-column').fadeOut(100);
			});
			$('.split-column').live('click',function(e){
				e.preventDefault();
				var column_type = $(this).attr("href");
				column_type = column_type.substring(1);
				$('#op-le-split-column ul li').each(function(e){
					$(this).hide();
				});
				//console.log(column_type);
				switch (column_type) {
					case 'one-half':
						$('#op-le-split-column ul li a.split-half').parent().show();
					break;
					case 'two-thirds':
						$('#op-le-split-column ul li a.split-half').parent().show();
						$('#op-le-split-column ul li a.one-third-first').parent().show();
						$('#op-le-split-column ul li a.one-third-second').parent().show();
						$('#op-le-split-column ul li a.one-thirds').parent().show();
						$('#op-le-split-column ul li a.one-fourth-first').parent().show();
						$('#op-le-split-column ul li a.one-fourth-second').parent().show();
					break;
					case 'two-fourths':
						$('#op-le-split-column ul li a.split-half').parent().show();
					break;
					case 'three-fourths':
						$('#op-le-split-column ul li a.split-half').parent().show();
						$('#op-le-split-column ul li a.one-third-first').parent().show();
						$('#op-le-split-column ul li a.one-third-second').parent().show();
						$('#op-le-split-column ul li a.one-thirds').parent().show();
						$('#op-le-split-column ul li a.one-fourth-first').parent().show();
						$('#op-le-split-column ul li a.one-fourth-second').parent().show();
						$('#op-le-split-column ul li a.one-fourths').parent().show();
					break;
					case 'three-fifths':
						$('#op-le-split-column ul li a.split-half').parent().show();
						$('#op-le-split-column ul li a.one-third-first').parent().show();
						$('#op-le-split-column ul li a.one-third-second').parent().show();
						$('#op-le-split-column ul li a.one-thirds').parent().show();
					break;
					case 'four-fifths':
						$('#op-le-split-column ul li a.split-half').parent().show();
						$('#op-le-split-column ul li a.one-third-first').parent().show();
						$('#op-le-split-column ul li a.one-third-second').parent().show();
						$('#op-le-split-column ul li a.one-thirds').parent().show();
						$('#op-le-split-column ul li a.one-fourth-first').parent().show();
						$('#op-le-split-column ul li a.one-fourth-second').parent().show();
						$('#op-le-split-column ul li a.one-fourths').parent().show();
					break;
				}
				cur = [$(this).closest('.column'),'append'];
				$.fancybox.open($.extend({},fancy_defaults,{
					type: 'inline',
					href: '#op-le-split-column'
				}));
			});
			$('.banner').click(function(e) {
				e.preventDefault();
				e.stopPropagation();
				$.fancybox.open($.extend({},fancy_defaults,{
					type: 'inline',
					href: '#le-headers-dialog'
				}));
			});
			// advanced element options click
			$('.op-element-links a.element-advanced').live('click',function(e){
				e.preventDefault();
				cur = [$(this).closest('.element-container')];
				if (cur[0].hasClass('hide-mobile')) {
					$('input[name="op_hide_phones"]').prop('checked', true);
				} else {
					$('input[name="op_hide_phones"]').prop('checked', false);
				}
				if (cur[0].hasClass('hide-tablet')) {
					$('input[name="op_hide_tablets"]').prop('checked', true);
				} else {
					$('input[name="op_hide_tablets"]').prop('checked', false);
				}
				cur_data_style = cur[0].attr('data-style');
				if (cur_data_style) {
					// clearing old data
					$('#op_advanced_fadein').val('');
					$('#op_advanced_code_before').val('');
					$('#op_advanced_code_after').val('');
					$('#op_advanced_class').val('');
					var obj = JSON.parse(atob(cur_data_style));
					for (var key in obj) {
						switch (key) {
							case 'codeBefore':
								$('#op_advanced_code_before').val(obj[key]);
							break;
							case 'codeAfter':
								$('#op_advanced_code_after').val(obj[key]);
							break;
							case 'fadeIn':
								$('#op_advanced_fadein').val(obj[key]);
							break;
							case 'advancedClass':
								$('#op_advanced_class').val(obj[key]);
							break;
						}
					}
				} else {
					// clearing old data
					$('#op_advanced_fadein').val('');
					$('#op_advanced_code_before').val('');
					$('#op_advanced_code_after').val('');
					$('#op_advanced_class').val('');
				}
				$.fancybox.open($.extend({},fancy_defaults,{
					type: 'inline',
					href: $(this).attr('href')
				}));
			});
			// advanced element option Update button click
			$('#op-le-advanced-update').click(function(e){
				e.preventDefault();
				var dataStyles = {};
				if ($('#op_advanced_class').val()) {
					cur[0].addClass($('#op_advanced_class').val());
					dataStyles.advancedClass = $('#op_advanced_class').val();
				} else {
					cur[0].removeClass().addClass('element-container cf');
				}
				if ($('input[name="op_hide_phones"]:checked').length > 0) {
					cur[0].addClass('hide-mobile');
					dataStyles.hideMobile = 1;
				} else {
					cur[0].removeClass('hide-mobile');
				}
				if ($('input[name="op_hide_tablets"]:checked').length > 0) {
					cur[0].addClass('hide-tablet');
					dataStyles.hideTablet = 1;
				} else {
					cur[0].removeClass('hide-tablet');
				}
				if ($('#op_advanced_fadein').val()) {
					dataStyles.fadeIn = $('#op_advanced_fadein').val();
				}
				var html = '',
				before = '',
				after = '',
				markup = '';
				if ($('#op_advanced_code_before').val()) {
					before = $('#op_advanced_code_before').val();
				}
				if ($('#op_advanced_code_after').val()) {
					after = $('#op_advanced_code_after').val();
				}
				cur[0].find(".element, .op-hidden, .op-element-links, .op-waiting").each(function(i, item){
					var g = $(item);
					if (g.hasClass('element')) {
						var elementContent = before + $(g[0].innerHTML)[0].outerHTML + after;
						markup += '<div class="element">' + elementContent + '</div>';
					} else {
						if (g.hasClass('op-hidden') && !g.hasClass('op-waiting')) {
							if (!g.find(' > textarea').hasClass('op-le-child-shortcode')) {
								var value = g.find('> textarea').val();
								markup += '<div class="op-hidden">';
								markup += '<textarea name="shortcode[]" class="op-le-shortcode">';
								markup += value;
								markup += '</textarea>';
								markup += '</div>';
								//console.log(markup);
							}
						} else {
							markup += g[0].outerHTML;
						}
					}
				});

				cur[0].html(markup);

				if ($('#op_advanced_code_before').val()) {
					dataStyles.codeBefore = $('#op_advanced_code_before').val();
				}
				if ($('#op_advanced_code_after').val()) {
					dataStyles.codeAfter = $('#op_advanced_code_after').val();
				}
				var base = btoa(JSON.stringify(dataStyles));
				cur[0].attr('data-style', base);
				//console.log(dataStyles);
				$.fancybox.close();
			});
			// row options click
			$('.edit-row').live('click', function(e){
				e.preventDefault();
				cur = [$(this).closest('.row'),'before'];
				if (cur[0].hasClass('section')) {
					$('input[name="op_full_width_row"]').prop('checked', true);
				} else {
					$('input[name="op_full_width_row"]').prop('checked', false);
				}
				cur_style = cur[0].attr('style');
				cur_data_style = cur[0].attr('data-style');
				if (cur_data_style) {
					// clearing old data
					$('#op_section_row_options_bgcolor_start').val('').trigger('change');
					$('#op_section_row_options_bgcolor_end').val('').trigger('change');
					$('#op_row_top_padding').val('');
					$('#op_row_bottom_padding').val('');
					$('#op_row_border_width').val('');
					$('#op_section_row_options_borderColor').val('').trigger('change');
					OP_AB.set_uploader_value('op_row_background', '');
					$(".op_row_bg_options option").each(function(){
						$(this).attr("selected", false);
					});
					var obj = JSON.parse(atob(cur_data_style));
					for (var key in obj) {
						//console.log(key);
						switch (key) {
							case 'paddingTop':
								$('#op_row_top_padding').val(obj[key]);
							break;
							case 'paddingBottom':
								$('#op_row_bottom_padding').val(obj[key]);
							break;
							case 'backgroundImage':
								var imgUrl = obj[key].slice(4, -1);
								OP_AB.set_uploader_value('op_row_background', imgUrl);
							break;
							case 'backgroundPosition':
								$('.op_row_bg_options option[value="'+obj[key]+'"]').attr('selected','selected');
							break;
							case 'borderWidth':
								$('#op_row_border_width').val(obj[key]);
							break;
							case 'borderColor':
								$('#op_section_row_options_borderColor').val(obj[key]).trigger('change');
							break;
							case 'backgroundColorStart':
								$('#op_section_row_options_bgcolor_start').val(obj[key]).trigger('change');
							break;
							case 'backgroundColorEnd':
								$('#op_section_row_options_bgcolor_end').val(obj[key]).trigger('change');
							break;
						}
					}
				} else {
					$('#op_section_row_options_bgcolor_start').val('').trigger('change');
					$('#op_section_row_options_bgcolor_end').val('').trigger('change');
					$('#op_row_top_padding').val('');
					$('#op_row_bottom_padding').val('');
					$('#op_row_border_width').val('');
					$('#op_section_row_options_borderColor').val('').trigger('change');
					OP_AB.set_uploader_value('op_row_background', '');
					$(".op_row_bg_options option").each(function(){
						$(this).attr("selected", false);
					});
				}

				$.fancybox.open($.extend({},fancy_defaults,{
					type: 'inline',
					href: '#op-le-row-options'
				}));
			});
		}
		custom_item_ids(container);
		refresh_sortables(container);
		container.find('a.move-row,a.element-move').live('click',function(e){
			e.preventDefault();
		});
		container.find('.cols > .add-element-container > a.add-new-element').click(function(e){
			e.preventDefault();
			child_element = false;
			cur = [$(this).parent().prev(),'before'];
			refresh_item = null;
			OP_AB.open_dialog();
		});
		$('a.delete-row',container).live('click',function(e){
			e.preventDefault();
			confirm('Are you sure you wish to remove this row and all its elements?') && $(this).closest('.row').remove();
		});
		$('.op-element-links a.element-delete',container).live('click',function(e){
			e.preventDefault();
			confirm('Are you sure you wish to remove this element?') && $(this).closest('.element-container').remove();
		});
		$('.op-element-links a.element-settings',container).live('click',function(e){
			e.preventDefault();
			var el = $(this).closest('.element-container');
			var child = el.find('> .element a.add-new-element');
			if (child.length) {
				child.trigger('click');
			} else {
				cur = [el,'replaceWith'];
				refresh_item = el.find('textarea.op-le-shortcode');
				edit_element(refresh_item.closest('.element-container'));
			}
		});

	};

	function edit_element(el,get_full){
		get_full = get_full === false ? false : true;
		var sc = get_full ? get_full_shortcode(el) : el.find('textarea.op-le-child-shortcode').val();
		OP_AB.open_dialog(0);
		$.post(OptimizePress.ajaxurl,
			{
				action: OptimizePress.SN+'-live-editor-params',
				_wpnonce: $('#_wpnonce').val(),
				shortcode: sc
			},
			function(resp){
				if(typeof resp.error != 'undefined'){
					alert(resp.error);
				} else {
					OP_AB.edit_element(resp);
				}
			},
			'json'
		);
	};

	function serialize(el){
		if(!el.length){
			return false;
		}
		var data = {},
			lookup = data;
		el.find(':input[type!="checkbox"][type!="radio"][type!="submit"], input:checked').each(function(){
			var name = this.name.replace(/\[([^\]]+)?\]/g,',$1').split(','),
				cap = name.length-1,
				i = 0;
			if(name[0]){
				for(;i<cap;i++)
					lookup= lookup[name[i]] = lookup[name[i]] || (name[i+1] == '' ? [] : {});
			}
			if(typeof lookup.length != 'undefined')
				lookup.push($(this).val());
			else
				lookup[name[cap]] = $(this).val();
			lookup = data;
		});
		return data;
	};
	/***********Column split************/
	function split_column(selected){
		if(cur.length == 0){
			alert('Could not find the current position, please try clicking the Split Column link again.');
			return;
		}
		var h = selected.attr('href').split('#')[1],
			row_class = '',
			cols = [];
			isTextOnButton = [];
		if(selected.length > 0){
			switch(h){
				case 'split-half':
					cols = ['split-half', 'split-half'];
					isTextOnButton = [true, true];
				break;
				case 'one-third-second':
					cols = ['split-two-thirds', 'split-one-third'];
					isTextOnButton = [true, false];
				break;
				case 'one-third-first':
					cols = ['split-one-third', 'split-two-thirds'];
					isTextOnButton = [false, true];
				break;
				case 'one-thirds':
					cols = ['split-one-third', 'split-one-third', 'split-one-third'];
					isTextOnButton = [false, false, false];
				break;
				case 'one-fourth-second':
					cols = ['split-three-fourths', 'split-one-fourth'];
					isTextOnButton = [true, false];
				break;
				case 'one-fourth-first':
					cols = ['split-one-fourth', 'split-three-fourths'];
					isTextOnButton = [false, true];
				break;
				case 'one-fourths':
					cols = ['split-one-fourth', 'split-one-fourth', 'split-one-fourth', 'split-one-fourth',];
					isTextOnButton = [false, false, false, false];
				break;
			}
			var html = '';
			for(var i=0,cl=cols.length;i<cl;i++){
				var btnClass = '';
				if (isTextOnButton[i]) btnText = '<span>Add Element</span>'; else btnText = '';
				html += '<div class="'+cols[i]+' column cols subcol"><div class="element-container sort-disabled"></div><div class="add-element-container"><a href="#add_element" class="add-new-element"><img src="'+OptimizePress.imgurl+'/live_editor/add_new.png" alt="Add New Element" />' + btnText + '</a></div></div>';
			}
			btnText = '<span>Add element</span>';
			html += '</div></div><div class="clearcol"></div>';
			html += '<div class="element-container sort-disabled"></div><div class="add-element-container"><a href="#add_element" class="add-new-element"><img src="'+OptimizePress.imgurl+'/live_editor/add_new.png" alt="Add New Element" />' + btnText + '</a></div>';
			html = $(html);
			cur[0][cur[1]](html);
			cur[0].find('.add-element-container > a.add-new-element').click(function(e){
				e.preventDefault();
				child_element = false;
				cur = [$(this).parent().prev(),'before'];
				refresh_item = null;
				OP_AB.open_dialog();
			});
			var area = cur[0].closest('.editable-area');
			refresh_sortables(area);
			custom_item_ids(area);
			$.fancybox.close();
		} else {
			alert('Please select split column type');
		}
	};
	/***********************/
	function add_new_row(selected){
		if(cur.length == 0){
			alert('Could not find the current position, please try clicking the Add new row link again.');
			return;
		}
		var h = selected.attr('href').split('#')[1],
			row_class = '',
			cols = [];
			isTextOnButton = [];
		if(selected.length > 0){
			switch(h){
				case 'one-col':
					row_class = 'one-column';
					cols = ['one-column'];
					isTextOnButton = [true];
					break;
				case 'two-col':
					row_class = 'two-columns';
					cols = ['one-half','one-half'];
					isTextOnButton = [true, true];
					break;
				case 'three-col':
					row_class = 'three-columns';
					cols = ['one-third','one-third','one-third'];
					isTextOnButton = [true, true, true];
					break;
				case 'four-col':
					row_class = 'four-columns';
					cols = ['one-fourth','one-fourth','one-fourth','one-fourth'];
					isTextOnButton = [false, false, false, false];
					break;
				case 'five-col':
					row_class = 'five-columns';
					cols = ['one-fifth','one-fifth','one-fifth','one-fifth','one-fifth'];
					isTextOnButton = [false, false, false, false, false];
					break;
				default:
					switch(h){
						case '1':
							row_class = 'three-columns';
							cols = ['two-thirds','one-third'];
							isTextOnButton = [true, true];
							break;
						case '2':
							row_class = 'three-columns';
							cols = ['one-third','two-thirds'];
							isTextOnButton = [true, true];
							break;
						case '3':
							row_class = 'four-columns';
							cols = ['two-fourths','one-fourth','one-fourth'];
							isTextOnButton = [true, false, false];
							break;
						case '4':
							row_class = 'four-columns';
							cols = ['one-fourth','one-fourth','two-fourths'];
							isTextOnButton = [false, false, true];
							break;
						case '5':
							row_class = 'four-columns';
							cols = ['three-fourths','one-fourth'];
							isTextOnButton = [true, false];
							break;
						case '6':
							row_class = 'four-columns';
							cols = ['one-fourth','three-fourths'];
							isTextOnButton = [false, true];
							break;
						case '7':
							row_class = 'five-columns';
							cols = ['two-fifths','one-fifth','one-fifth','one-fifth'];
							isTextOnButton = [true, false, false, false];
							break;
						case '8':
							row_class = 'five-columns';
							cols = ['one-fifth','one-fifth','one-fifth','two-fifths'];
							isTextOnButton = [false, false, false, true];
							break;
						case '9':
							row_class = 'five-columns';
							cols = ['three-fifths','one-fifth','one-fifth'];
							isTextOnButton = [true, false, false];
							break;
						case '10':
							row_class = 'five-columns';
							cols = ['one-fifth','one-fifth','three-fifths'];
							isTextOnButton = [false, false, true];
							break;
						case '11':
							row_class = 'five-columns';
							cols = ['four-fifths','one-fifth'];
							isTextOnButton = [true, false];
							break;
						case '12':
							row_class = 'five-columns';
							cols = ['one-fifth','four-fifths'];
							isTextOnButton = [false, true];
							break;
						case '13':
							row_class = 'four-columns';
							cols = ['one-fourth','two-fourths','one-fourth'];
							isTextOnButton = [false, true, false];
							break;
						case '14':
							row_class = 'five-columns';
							cols = ['two-fifths','three-fifths'];
							isTextOnButton = [true, true];
							break;
						case '15':
							row_class = 'five-columns';
							cols = ['three-fifths','two-fifths'];
							isTextOnButton = [true, true];
							break;
						case '16':
							row_class = 'five-columns';
							cols = ['one-fifth','two-fifths','two-fifths'];
							isTextOnButton = [false, true, true];
							break;
						case '17':
							row_class = 'five-columns';
							cols = ['two-fifths','two-fifths','one-fifth'];
							isTextOnButton = [true, true, false];
							break;
						case '18':
							row_class = 'five-columns';
							cols = ['one-fifth','three-fifths','one-fifth'];
							isTextOnButton = [false, true, false];
							break;
					}
					break;
			}
			var html = '';
			if (h.indexOf('feature_') === 0) { // feature areas
				$.fancybox.showLoading();
				var data1 = {
					action: OptimizePress.SN+'-live-editor-get-predefined-template',
					template: h,
					page_id: $('#page_id').val()
				};
				$.ajax({
					type: "POST",
					dataType: "json",
					url: OptimizePress.ajaxurl,
					data: data1
				}).done(function(data) {
					if (data.output != 'error') {
						html += data.output;
						html = $(html);
						html.find('.cols > .add-element-container > a.add-new-element').click(function(e){
							e.preventDefault();
							child_element = false;
							cur = [$(this).parent().prev(),'before'];
							refresh_item = null;
							OP_AB.open_dialog();
						});
						cur[0][cur[1]](html);
						var area = cur[0].closest('.editable-area');
						refresh_sortables(area);
						custom_item_ids(area);
						$.fancybox.hideLoading();
						$.fancybox.close();
					}
				});
			} else { // normal row insert
				html += '<div class="row ' + row_class + ' cf"><div class="fixed-width"><div class="op-row-links"><a id="row_options" href="#options" class="edit-row"></a><a href="#move" class="move-row"></a><a href="#add-new-row" class="add-new-row"><img src="'+OptimizePress.imgurl+'/live_editor/add_new.png" alt="'+translate('add_new_row')+'" /><span>'+translate('add_new_row')+'</span></a><a href="#delete-row" class="delete-row"></a></div>';
				var splitColumn;
				for(var i=0,cl=cols.length;i<cl;i++){
					var btnClass = '';
					if (isTextOnButton[i]) btnText = '<span>Add Element</span>'; else btnText = '';
					var narrowClass = '';
					switch(cols[i]) {
						case 'one-third':
						case 'one-fourth':
						case 'one-fifth':
						case 'two-fifths':
							narrowClass = ' narrow';
						break;
						default:
							narrowClass = '';
						break;
					}
					switch (cols[i]) {
					case 'one-half':
					case 'two-thirds':
					case 'two-fourths':
					case 'three-fourths':
					case 'three-fifths':
					case 'four-fifths':
						splitColumn = '<a href="#'+cols[i]+'" class="split-column"><img src="'+OptimizePress.imgurl+'/live_editor/split_column.png" alt="Split Column" /></a>';
						break;
					default:
						splitColumn = '';
						break;
					}
					html += '<div class="'+cols[i]+' column cols'+narrowClass+'"><div class="element-container sort-disabled"></div><div class="add-element-container">' + splitColumn + '<a href="#add_element" class="add-new-element"><img src="'+OptimizePress.imgurl+'/live_editor/add_new.png" alt="Add New Element" />' + btnText + '</a></div></div>';
				}


				html += '</div></div>';
				html = $(html);
				html.find('.cols > .add-element-container > a.add-new-element').click(function(e){
					e.preventDefault();
					child_element = false;
					cur = [$(this).parent().prev(),'before'];
					refresh_item = null;
					OP_AB.open_dialog();
				});
				cur[0][cur[1]](html);
				var area = cur[0].closest('.editable-area');
				refresh_sortables(area);
				custom_item_ids(area);
				$.fancybox.close();
			}
		} else {
			alert('Please select a column type');
		}
	};

	function refresh_sortables(area){
		area.sortable($.extend({},sort_default,{
			handle:'.op-row-links .move-row',
			items:'div.row',
			update: function(){
				custom_item_ids(area);
			}
		})).disableSelection();
		area.find('div.row').sortable($.extend({},sort_default,{
			handle:'.op-element-links .element-move',
			items:'div.element-container',
			update: function(){
				custom_item_ids(area);
			}
		}));
	};

	function init_uploader(){
		var nonce = $('#_wpnonce').val(),
			processing = $('#li-content-layout-processing'),
			queue = $('#le-content-layout-file-list'),
			row,
			login = $('#le-content-layout-login'),
			resp_func = function(resp){
				if(typeof resp.show_login != 'undefined'){
					if(login.length == 0){
						processing.after('<div id="le-content-layout-login" />');
					}
					$('#le-content-layout-login').append(resp.login_html).find('form').submit(function(e){
						row.slideDown('fast').fadeIn('fast');
						e.preventDefault();
						$.post($(this).attr('action'),$(this).serialize(),resp_func,'json');
						$('#le-content-layout-login').remove();
					});
				}
				if(typeof resp.error != 'undefined'){
					alert(resp.error);
				} else if(typeof resp.content_layout != 'undefined'){
					$('#le-layouts-dialog div.tab-predefined').html(resp.content_layout);
					$('#le-layouts-dialog ul.op-bsw-grey-panel-tabs a[href$="#predefined"]').trigger('click');
				}
				row.fadeOut('fast').slideUp('fast');
			},
			uploader = new qq.FileUploader({
				element: document.getElementById('le-content-layout-upload'),
				listElement: queue.get(0),
				action: OptimizePress.ajaxurl,
				params: {
					action: OptimizePress.SN+'-live-editor-upload-layout',
					_wpnonce: nonce
				},
				allowedExtensions: ['zip'],
				onComplete: function(id,fileName,resp){
					queue.find('li:eq('+id+')').fadeOut('fast').slideUp('fast');
					row = $('<li />').html('Processing '+fileName+' <img src="images/wpspin_light.gif" alt="" />');
					processing.append(row);
					$.post(OptimizePress.ajaxurl,{
						action: OptimizePress.SN+'-live-editor-process-layout',
						_wpnonce: nonce,
						attachment_id: resp.fileid
					},resp_func,'json');
				}
			});
	};
	window.op_live_editor = true;
	window.op_le_column_width = function(){
		return $(cur[0]).closest('.cols').width();
	};
	window.op_refresh_content_layouts = function(){
		$.post(OptimizePress.ajaxurl,{
			action: OptimizePress.SN+'-live-editor-load-layouts',
			_wpnonce: $('#_wpnonce').val()
		},
		function(resp){
			if(typeof resp.error != 'undefined'){
				alert(resp.error);
			} else if(typeof resp.content_layout != 'undefined'){
				$('#le-layouts-dialog div.tab-predefined').html(resp.content_layout);
				$('#le-layouts-dialog ul.op-bsw-grey-panel-tabs a[href$="#predefined"]').trigger('click');
			}
		},
		'json');
	};
	window.op_le_insert_content = function(str){
		if(cur.length == 0){
			alert('Could not find the current position, please try clicking the Add new row link again.');
			return;
		}
		var sc = str;
		if(refresh_item !== null && child_element === false){
			refresh_item.val(sc);
			refresh_element(refresh_item);
			return $.fancybox.close();
		}
		var html = '', classname = '';
		if(child_element){
			html = $('<div class="row element-container cf" />');
			classname = 'op-le-child-shortcode';
		} else {
			html = $('<div class="element-container cf" />');
			classname = 'op-le-shortcode';
		}
		var area = cur[0].closest('.editable-area');
		cur[0][cur[1]](html);
		html.append('<div class="op-element-links"><a href="#settings" class="element-settings"><img alt="'+translate('edit_element')+'" title="'+translate('edit_element')+'" src="'+OptimizePress.imgurl+'pencil.png" /></a><a href="#op-le-advanced" class="element-advanced"><img alt="'+translate('edit_element')+'" title="'+translate('advanced_element')+'" src="'+OptimizePress.imgurl+'pencil.png" /></a><a href="#move" class="element-move"><img src="'+OptimizePress.imgurl+'move-icon.png" alt="'+translate('move')+'" /></a><a href="#delete" class="element-delete"><img src="'+OptimizePress.imgurl+'remove-row.png" alt="'+translate('delete')+'" /></a></div><div class="op-waiting"><img src="images/wpspin_light.gif" alt="" class="op-bsw-waiting op-show-waiting" /></div><div class="element cf"></div><div class="op-hidden"><textarea name="shortcode[]" class="'+classname+'"></textarea></div>');
		var sc_textarea = html.find('textarea').val(sc);
		$.fancybox.close();
		op_cur_html = html;
		$.post(OptimizePress.ajaxurl,
			{
				action: OptimizePress.SN+'-live-editor-parse',
				_wpnonce: $('#_wpnonce').val(),
				shortcode: sc,
				depth: (child_element ? 1 : 0),
				page_id: $('#page_id').val()
			},
			function(resp){
				if(resp.check !== null){
					var valid = true;
					for(var i in resp.check){
						if($(i).length > 0){
							if(resp.check[i] != ''){
								html.fadeOut('fast',function(){
									$(this).remove();
								});
								alert(resp.check[i]);
								return;
							}
						}
					};
					if(valid === true){
						var el = html.find('.element').html(resp.output+resp.js);
						child_element ? init_child_sortables(true) : refresh_sortables(area);
					}
				} else {
					var el = html.find('.element').html(resp.output+resp.js);
					child_element ? init_child_sortables(true) : refresh_sortables(area);
				}
				if(typeof el != 'undefined'){
					if(typeof resp.shortcode != 'undefined'){
						sc_textarea.val(resp.shortcode);
					}
					html.find('.op-waiting').fadeOut('fast',function(){
						el.fadeIn('fast');
					});
					custom_item_ids(cur[0].closest('.editable-area'));
				}
			},
			'json'
		);
	};

	function rgb2hex(rgb){
		 rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
		 return "#" +
		  ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
		  ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
		  ("0" + parseInt(rgb[3],10).toString(16)).slice(-2);
		}

	function translate(str){
		return OP_AB.translate(str);
	};


	/**
	 * Autohiding and showing of toolbars
	 */
	$(document).ready(function(){
		var $ = jQuery;

		var $sidebar = $('#op-le-settings-toolbar');
		var $sidebarToggleBtn = $('#op-le-toggle-sidebar-btn');
		var showPanelsHtml;

		var toggleSidebar = function () {
			//console.log('toggle');
			$('html').toggleClass('op-le-settings-toolbar--hidden');
			//$showLiveEditorPanels.addClass('showLiveEditorPanels--hidden');
			// setTimeout(function () {
			// 	$('html').removeClass('op-toolbars--hidden');
			// }, 200);
			return false;
		}

		var hideEditorPanels = function () {
			$('html').addClass('op-toolbars--hidden');
			setTimeout(function () {
				$showLiveEditorPanels.removeClass('showLiveEditorPanels--hidden');
			}, 200);
			return false;
		}

		$sidebarToggleBtn.parent().on('click', toggleSidebar);

	});

})(jQuery);