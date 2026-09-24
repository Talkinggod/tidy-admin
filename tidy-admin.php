<?php
/**
 * Plugin Name:       Tidy Admin
 * Description:       A calmer admin: short plugin names and descriptions, resizable list-table columns, and routine notices (upsells, "go Pro", "rate us") behind one Notices button. Errors and warnings always stay visible.
 * Version:           1.0.0
 * Requires at least: 5.8
 * Requires PHP:      7.4
 * Author:            Talkinggod Labs
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       tidy-admin
 *
 * @package TidyAdmin
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'TIDY_ADMIN_VERSION', '1.0.0' );
define( 'TIDY_ADMIN_META', 'tidy_admin_widths' );

/**
 * Returns the saved column widths for one screen, for the current user.
 *
 * @param string $screen Screen ID.
 * @return array<string,int> Column key => width in pixels.
 */
function tidy_admin_widths( $screen ) {
	$all = get_user_meta( get_current_user_id(), TIDY_ADMIN_META, true );
	return ( is_array( $all ) && isset( $all[ $screen ] ) && is_array( $all[ $screen ] ) ) ? $all[ $screen ] : array();
}

/**
 * Saves (or, when empty, clears) the column widths for one screen.
 */
function tidy_admin_save_widths() {
	check_ajax_referer( 'tidy_admin_widths', 'nonce' );
	if ( ! current_user_can( 'read' ) ) {
		wp_send_json_error( null, 403 );
	}

	$screen = isset( $_POST['screen'] ) ? sanitize_key( wp_unslash( $_POST['screen'] ) ) : '';
	$raw    = isset( $_POST['widths'] ) ? json_decode( wp_unslash( $_POST['widths'] ), true ) : array(); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- decoded and sanitized below.
	if ( '' === $screen ) {
		wp_send_json_error( null, 400 );
	}

	$widths = array();
	foreach ( is_array( $raw ) ? array_slice( $raw, 0, 40, true ) : array() as $column => $px ) {
		$column = sanitize_key( $column );
		if ( '' !== $column ) {
			$widths[ $column ] = max( 40, min( 2000, absint( $px ) ) );
		}
	}

	$user = get_current_user_id();
	$all  = get_user_meta( $user, TIDY_ADMIN_META, true );
	$all  = is_array( $all ) ? $all : array();
	unset( $all[ $screen ] );
	if ( $widths ) {
		$all[ $screen ] = $widths;
		$all            = array_slice( $all, -200, null, true ); // Keep the 200 most recent screens.
	}

	if ( $all ) {
		update_user_meta( $user, TIDY_ADMIN_META, $all );
	} else {
		delete_user_meta( $user, TIDY_ADMIN_META );
	}
	wp_send_json_success( $widths );
}
add_action( 'wp_ajax_tidy_admin_widths', 'tidy_admin_save_widths' );

/**
 * Loads the stylesheet and script on every admin screen.
 */
function tidy_admin_enqueue() {
	$base   = plugin_dir_url( __FILE__ ) . 'assets/';
	$screen = function_exists( 'get_current_screen' ) && get_current_screen() ? get_current_screen()->id : '';

	wp_enqueue_style( 'tidy-admin', $base . 'tidy-admin.css', array(), TIDY_ADMIN_VERSION );
	wp_enqueue_script( 'tidy-admin', $base . 'tidy-admin.js', array(), TIDY_ADMIN_VERSION, true );

	wp_localize_script(
		'tidy-admin',
		'tidyAdmin',
		array(
			/**
			 * Filters whether plugin descriptions are clamped on the Plugins screen.
			 *
			 * @param bool $clamp Default true.
			 */
			'clamp'   => (bool) apply_filters( 'tidy_admin_clamp_descriptions', true ),

			/**
			 * Filters whether long plugin names drop their marketing tagline
			 * ("Name - Tagline" shows "Name"; the full name stays in the tooltip).
			 *
			 * @param bool $short Default true.
			 */
			'names'   => (bool) apply_filters( 'tidy_admin_short_names', true ),

			/**
			 * Filters whether routine notices are gathered behind the Notices button.
			 *
			 * @param bool $tray Default true.
			 */
			'tray'    => (bool) apply_filters( 'tidy_admin_tray_notices', true ),

			/**
			 * Filters extra CSS selectors for notices that must always stay visible.
			 * Errors and warnings are always kept regardless of this list.
			 *
			 * @param string[] $selectors Default empty.
			 */
			'keep'    => array_values( array_filter( (array) apply_filters( 'tidy_admin_keep_selectors', array() ), 'is_string' ) ),

			/**
			 * Filters whether list-table columns can be resized by dragging.
			 *
			 * @param bool $resize Default true.
			 */
			'resize'  => (bool) apply_filters( 'tidy_admin_resize_columns', true ),
			'screen'  => $screen,
			'widths'  => (object) tidy_admin_widths( $screen ),
			'ajax'    => admin_url( 'admin-ajax.php' ),
			'nonce'   => wp_create_nonce( 'tidy_admin_widths' ),

			'i18n'    => array(
				'more'    => __( 'more', 'tidy-admin' ),
				'less'    => __( 'less', 'tidy-admin' ),
				/* translators: %d: number of notices waiting in the tray. */
				'notices' => __( 'Notices (%d)', 'tidy-admin' ),
				'hide'    => __( 'Hide notices', 'tidy-admin' ),
				'grip'    => __( 'Resize column. Use the arrow keys, or double-click to reset all columns.', 'tidy-admin' ),
			),
		)
	);
}
add_action( 'admin_enqueue_scripts', 'tidy_admin_enqueue' );
