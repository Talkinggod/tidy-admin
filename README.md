# Tidy Admin

A small WordPress plugin by **Talkinggod Labs** — *Níímą́ą́ʼ Bee Naalkaah* — that cleans up the admin screens.

- **Short plugin descriptions.** On the Plugins screen, each description is limited to two lines, with a "more" link.
- **Short plugin names.** "Image Optimization - Optimize Images and Convert to WebP or AVIF" shows as "Image Optimization" (full name on hover). Names that would collide are left in full.
- **Alternating plugin rows.** White and light blue row by row, instead of every active plugin sharing one colour. Active plugins keep the blue left bar.
- **A quieter byline.** "Version | By | View details" is one small grey line.
- **Resizable columns.** Drag a column border on any admin list table. Widths are saved per screen in your user profile. Double-click a border to reset. Arrow keys work on a focused border.
- **Quiet notices.** Upsells, "go Pro", "rate us" and information notices are gathered behind one **Notices (N)** button. Errors, warnings and the "Settings saved" message always stay visible.

Tidy Admin has no settings. It adds no database tables or tracking, and it contacts no outside service. The only thing it stores is each user's column widths (user meta `tidy_admin_widths`), removed when the plugin is deleted.

## Install

Download this repository as a ZIP. In WordPress, go to Plugins → Add New → Upload Plugin and choose the ZIP. The plugin folder must be named `tidy-admin`.

## Filters

| Filter | Type | Default | Purpose |
| --- | --- | --- | --- |
| `tidy_admin_clamp_descriptions` | bool | `true` | Return `false` to leave plugin descriptions full length. |
| `tidy_admin_short_names` | bool | `true` | Return `false` to show plugin names in full. |
| `tidy_admin_stripe_plugins` | bool | `true` | Return `false` to keep WordPress's own active/inactive row colours. |
| `tidy_admin_resize_columns` | bool | `true` | Return `false` to turn off resizable columns. |
| `tidy_admin_tray_notices` | bool | `true` | Return `false` to leave all notices in place. |
| `tidy_admin_keep_selectors` | string[] | `[]` | CSS selectors for extra notices that must always stay visible. |

```php
add_filter( 'tidy_admin_keep_selectors', function ( $selectors ) {
	$selectors[] = '.my-plugin-notice';
	return $selectors;
} );
```

## Requirements

WordPress 5.8 or later, PHP 7.4 or later. Tested with WordPress 7.1.

## License

GPL-2.0-or-later. See [LICENSE](LICENSE).
