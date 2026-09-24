<?php
/**
 * Removes every user's saved column widths when Tidy Admin is deleted.
 *
 * @package TidyAdmin
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

delete_metadata( 'user', 0, 'tidy_admin_widths', '', true );
