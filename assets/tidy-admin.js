/* Tidy Admin */
( function () {
	'use strict';

	var cfg = window.tidyAdmin || {};
	var t = cfg.i18n || {};

	function ready( fn ) {
		if ( document.readyState !== 'loading' ) {
			fn();
		} else {
			document.addEventListener( 'DOMContentLoaded', fn );
		}
	}

	/* Plugin descriptions: clamp to two lines with a more / less link. */
	function clampDescriptions() {
		document.querySelectorAll( '.plugins .plugin-description' ).forEach( function ( cell ) {
			if ( cell.dataset.tidyAdmin ) {
				return;
			}
			cell.dataset.tidyAdmin = '1';

			var wrap = document.createElement( 'div' );
			wrap.className = 'tidy-admin-desc';
			while ( cell.firstChild ) {
				wrap.appendChild( cell.firstChild );
			}
			cell.appendChild( wrap );

			var link = document.createElement( 'a' );
			link.href = '#';
			link.className = 'tidy-admin-toggle';
			link.textContent = t.more || 'more';
			link.setAttribute( 'aria-expanded', 'false' );
			link.addEventListener( 'click', function ( e ) {
				e.preventDefault();
				var open = wrap.classList.toggle( 'is-open' );
				link.textContent = open ? ( t.less || 'less' ) : ( t.more || 'more' );
				link.setAttribute( 'aria-expanded', open ? 'true' : 'false' );
			} );
			cell.appendChild( link );
		} );
		refreshToggles();
	}

	/* Shows "more" only where a description is actually cut off at the current width. */
	function refreshToggles() {
		document.querySelectorAll( '.plugins .tidy-admin-desc' ).forEach( function ( wrap ) {
			var link = wrap.parentNode.querySelector( '.tidy-admin-toggle' );
			if ( link && ! wrap.classList.contains( 'is-open' ) ) {
				link.hidden = wrap.scrollHeight <= wrap.clientHeight + 2;
			}
		} );
	}

	/*
	 * Plugin names: "Name - Marketing tagline" shows just the name. The full
	 * name stays in the tooltip and in the screen-reader checkbox label.
	 */
	function shortenNames() {
		var rows = [];
		var seen = {};
		document.querySelectorAll( '.plugins .plugin-title strong' ).forEach( function ( el ) {
			if ( el.dataset.tidyAdmin || el.children.length ) {
				return;
			}
			el.dataset.tidyAdmin = '1';
			var full = el.textContent.trim();
			var m = full.length > 30 ? /\s+[-\u2013\u2014|:]\s+|:\s+/.exec( full ) : null;
			var name = ( m && m.index >= 3 ) ? full.slice( 0, m.index ) : full;
			seen[ name ] = ( seen[ name ] || 0 ) + 1;
			rows.push( { el: el, full: full, name: name } );
			if ( full.length > 30 ) {
				el.title = full;
			}
		} );

		rows.forEach( function ( r ) {
			// Never shorten two plugins to the same name (e.g. a family of add-ons).
			if ( r.name === r.full || seen[ r.name ] > 1 ) {
				return;
			}
			r.el.textContent = r.name;
			var tail = document.createElement( 'span' );
			tail.className = 'tidy-admin-tagline';
			tail.textContent = r.full.slice( r.name.length );
			r.el.appendChild( tail );
			r.el.title = r.full;
		} );
	}

	/* Notices: errors and warnings stay; the rest go behind one button. */
	function trayNotices() {
		var keep = ( cfg.keep || [] ).join( ',' );
		var justSaved = /settings-updated|message=/.test( window.location.search );
		var held = [];

		document.querySelectorAll(
			'#wpbody-content .notice, #wpbody-content .updated, #wpbody-content .update-nag'
		).forEach( function ( n ) {
			var cls = ' ' + ( n.className || '' ) + ' ';
			if ( /\snotice-error\s|\snotice-warning\s|\serror\s/.test( cls ) ) {
				return; // Real problems stay visible.
			}
			if ( justSaved && /\ssettings-error\s|\snotice-success\s/.test( cls ) ) {
				return; // "Settings saved." right after saving stays visible.
			}
			if ( n.closest( '#tidy-admin-tray' ) || n.closest( '.tidy-admin-notice' ) ) {
				return;
			}
			if ( keep ) {
				try {
					if ( n.matches( keep ) ) {
						return;
					}
				} catch ( err ) {
					// Ignore an invalid selector from a filter.
				}
			}
			n.classList.add( 'tidy-admin-notice' );
			held.push( n );
		} );

		if ( ! held.length ) {
			return;
		}

		var label = ( t.notices || 'Notices (%d)' ).replace( '%d', held.length );
		document.body.classList.add( 'tidy-admin-held' );

		var tray = document.createElement( 'div' );
		tray.id = 'tidy-admin-tray';
		var button = document.createElement( 'button' );
		button.type = 'button';
		button.className = 'button button-small';
		button.textContent = label;
		button.setAttribute( 'aria-expanded', 'false' );
		button.addEventListener( 'click', function () {
			var hidden = document.body.classList.toggle( 'tidy-admin-held' );
			button.textContent = hidden ? label : ( t.hide || 'Hide notices' );
			button.setAttribute( 'aria-expanded', hidden ? 'false' : 'true' );
		} );
		tray.appendChild( button );

		var anchor = document.querySelector( '#wpbody-content .wrap' ) || document.getElementById( 'wpbody-content' );
		if ( anchor && anchor.parentNode ) {
			anchor.parentNode.insertBefore( tray, anchor );
		}
	}

	/*
	 * Adjustable columns: drag a header border on any list table. The primary
	 * column (usually Title or Name) takes up whatever width is left over.
	 */
	function resizeColumns() {
		var tables = document.querySelectorAll( 'table.wp-list-table' );
		if ( ! tables.length || ! cfg.screen ) {
			return;
		}

		var widths = {};
		Object.keys( cfg.widths || {} ).forEach( function ( k ) {
			if ( /^[a-z0-9_-]+$/.test( k ) ) {
				widths[ k ] = parseInt( cfg.widths[ k ], 10 ) || 0;
			}
		} );
		var rtl = document.body.classList.contains( 'rtl' );
		var style = document.createElement( 'style' );
		style.id = 'tidy-admin-widths';
		document.head.appendChild( style );
		var timer;

		function key( th ) {
			for ( var i = 0; i < th.classList.length; i++ ) {
				var c = th.classList[ i ];
				if ( c.indexOf( 'column-' ) === 0 && c !== 'column-primary' && /^column-[a-z0-9_-]+$/.test( c ) ) {
					return c.slice( 7 );
				}
			}
			return '';
		}

		function render() {
			var keys = Object.keys( widths );
			tables.forEach( function ( t ) {
				t.classList.toggle( 'tidy-admin-sized', keys.length > 0 );
			} );
			if ( ! keys.length ) {
				style.textContent = '';
				return;
			}
			var p = 'table.wp-list-table.tidy-admin-sized ';
			style.textContent = '@media screen and (min-width: 783px){' + p.trim() + '{table-layout:fixed}' + p + 'th.column-primary{width:auto}' +
				keys.map( function ( k ) {
					return p + 'th.column-' + k + ',' + p + 'td.column-' + k + '{width:' + widths[ k ] + 'px}';
				} ).join( '' ) + '}';
		}

		function save() {
			clearTimeout( timer );
			timer = setTimeout( function () {
				var body = new URLSearchParams();
				body.append( 'action', 'tidy_admin_widths' );
				body.append( 'nonce', cfg.nonce );
				body.append( 'screen', cfg.screen );
				body.append( 'widths', JSON.stringify( widths ) );
				window.fetch( cfg.ajax, { method: 'POST', credentials: 'same-origin', body: body } ).catch( function () {} );
			}, 400 );
		}

		tables.forEach( function ( table ) {
			var heads = Array.prototype.slice.call( table.querySelectorAll( 'thead th, thead td' ) );
			var flex = table.querySelector( 'thead .column-primary' );
			if ( ! flex ) {
				flex = heads.reduce( function ( a, b ) {
					return ( b.offsetWidth > ( a ? a.offsetWidth : -1 ) ) ? b : a;
				}, null );
			}
			var flexIndex = heads.indexOf( flex );

			// Pin every other column at its current width so nothing jumps.
			function freeze() {
				heads.forEach( function ( th ) {
					var k = key( th );
					if ( th !== flex && k && ! th.classList.contains( 'check-column' ) && ! th.classList.contains( 'hidden' ) && ! ( k in widths ) ) {
						widths[ k ] = Math.round( th.getBoundingClientRect().width );
					}
				} );
			}

			heads.forEach( function ( th, i ) {
				var k = key( th );
				if ( th === flex || ! k || th.classList.contains( 'check-column' ) ) {
					return;
				}
				var trailing = i < flexIndex; // Columns before the primary grow from their far edge.
				var sign = ( trailing ? 1 : -1 ) * ( rtl ? -1 : 1 );
				var grip = document.createElement( 'span' );
				grip.className = 'tidy-admin-grip ' + ( trailing !== rtl ? 'is-right' : 'is-left' );
				grip.setAttribute( 'role', 'separator' );
				grip.setAttribute( 'aria-orientation', 'vertical' );
				grip.setAttribute( 'aria-label', t.grip || 'Resize column' );
				grip.tabIndex = 0;
				th.classList.add( 'tidy-admin-resizable' );
				th.appendChild( grip );

				function set( px ) {
					widths[ k ] = Math.max( 40, Math.min( 2000, Math.round( px ) ) );
					render();
				}

				grip.addEventListener( 'pointerdown', function ( e ) {
					if ( e.button !== 0 ) {
						return;
					}
					e.preventDefault();
					e.stopPropagation();
					freeze();
					var startX = e.clientX;
					var startW = th.getBoundingClientRect().width;
					grip.setPointerCapture( e.pointerId );
					grip.classList.add( 'is-active' );
					document.body.classList.add( 'tidy-admin-resizing' );

					function move( ev ) {
						set( startW + sign * ( ev.clientX - startX ) );
					}
					function end() {
						grip.removeEventListener( 'pointermove', move );
						grip.removeEventListener( 'pointerup', end );
						grip.removeEventListener( 'pointercancel', end );
						grip.classList.remove( 'is-active' );
						document.body.classList.remove( 'tidy-admin-resizing' );
						refreshToggles();
						save();
					}
					grip.addEventListener( 'pointermove', move );
					grip.addEventListener( 'pointerup', end );
					grip.addEventListener( 'pointercancel', end );
				} );

				grip.addEventListener( 'click', function ( e ) {
					e.preventDefault();
					e.stopPropagation();
				} );

				grip.addEventListener( 'dblclick', function ( e ) {
					e.preventDefault();
					widths = {};
					render();
					refreshToggles();
					save();
				} );

				grip.addEventListener( 'keydown', function ( e ) {
					if ( e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' ) {
						return;
					}
					e.preventDefault();
					freeze();
					var step = e.shiftKey ? 50 : 10;
					var dx = e.key === 'ArrowRight' ? step : -step;
					set( th.getBoundingClientRect().width + sign * dx );
					refreshToggles();
					save();
				} );
			} );
		} );

		render();
	}

	ready( function () {
		if ( cfg.tray !== false ) {
			trayNotices();
		}
		if ( cfg.names !== false ) {
			shortenNames();
		}
		if ( cfg.resize !== false ) {
			resizeColumns();
		}
		if ( cfg.clamp !== false ) {
			clampDescriptions();
			var again;
			window.addEventListener( 'resize', function () {
				clearTimeout( again );
				again = setTimeout( refreshToggles, 150 );
			} );
		}
	} );
} )();
