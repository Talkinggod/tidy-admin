=== Tidy Admin ===
Contributors: talkinggod
Tags: admin, notices, columns, plugins, clean
Requires at least: 5.8
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

A calmer admin: short plugin names and descriptions, resizable columns, and routine notices behind one button.

== Description ==

Tidy Admin makes the WordPress admin easier to scan:

* **Short plugin descriptions.** On the Plugins screen, each description is limited to two lines. Click "more" to read the rest.
* **Short plugin names.** A long name with a marketing tagline, such as "Image Optimization - Optimize Images and Convert to WebP or AVIF", shows as "Image Optimization". Hover to see the full name. Names that would become identical (a family of add-ons, for example) are left in full.
* **A quieter byline.** The "Version | By | View details" line is one small grey line.
* **Resizable columns.** Drag a column border on any admin list (Posts, Pages, Plugins, Users, Comments, orders and more). Your widths are remembered for each screen, in your own user profile, so they follow you to any browser. Double-click a border to reset that screen. Keyboard users can focus a border and use the arrow keys. On phone-sized screens WordPress's normal layout is kept.
* **Quiet notices.** Upsells, "go Pro", "rate us" and other information notices are gathered behind a single "Notices (N)" button at the top of the screen. Click it to see them all. Click again to hide them.

What Tidy Admin never hides:

* Error notices
* Warning notices
* The "Settings saved" message you see right after saving

Tidy Admin has no settings page. It adds no database tables or tracking, and it contacts no outside service. The only thing it saves is each user's own column widths, in that user's profile; deleting the plugin removes them.

= For developers =

These filters are available:

* `tidy_admin_clamp_descriptions` (bool): return false to leave plugin descriptions full length.
* `tidy_admin_short_names` (bool): return false to show plugin names in full.
* `tidy_admin_resize_columns` (bool): return false to turn off resizable columns.
* `tidy_admin_tray_notices` (bool): return false to leave all notices in place.
* `tidy_admin_keep_selectors` (string[]): CSS selectors for extra notices that must always stay visible.

Example:

`add_filter( 'tidy_admin_keep_selectors', function ( $s ) { $s[] = '.my-plugin-notice'; return $s; } );`

== Installation ==

1. Upload the `tidy-admin` folder to `/wp-content/plugins/`, or install it from Plugins → Add New.
2. Activate Tidy Admin.

== Frequently Asked Questions ==

= Will I miss an important message? =

Error and warning notices are never hidden. Other notices are only moved behind the Notices button, and the button shows how many are waiting.

= Does it dismiss notices permanently? =

No. Nothing is dismissed or deleted. Deactivate the plugin and every notice appears again.

= How do I put the columns back the way they were? =

Double-click any column border on that screen.

= Does it work on multisite? =

Yes. It works on every admin screen, including the Network Admin.

== Changelog ==

= 1.0.0 =
* First release: two-line plugin descriptions, short plugin names, a compact byline, resizable list-table columns, and a Notices button for routine admin notices.
