<?php
/**
 * Plugin Name: RSS Prism Builder
 * Plugin URI: https://www.rsscctvsolution.eu.cc/
 * Description: Foundation for RSS Prism's theme-independent visual page builder.
 * Version: 0.1.0
 * Requires at least: 6.4
 * Requires PHP: 7.4
 * Author: Razeen Secure Solution
 * License: GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: rss-prism-builder
 * @package RSSPrismBuilder
 */
defined( 'ABSPATH' ) || exit;
define( 'RSS_PRISM_BUILDER_VERSION', '0.1.0' );

/** Register template storage in the plugin so it survives theme changes. */
function rss_prism_builder_register_templates() {
	register_post_type( 'rss_prism_template', array(
		'labels' => array(
			'name' => __( 'Prism Templates', 'rss-prism-builder' ),
			'singular_name' => __( 'Prism Template', 'rss-prism-builder' ),
			'add_new_item' => __( 'Add New Prism Template', 'rss-prism-builder' ),
			'edit_item' => __( 'Edit Prism Template', 'rss-prism-builder' ),
		),
		'public' => false,
		'show_ui' => true,
		'show_in_rest' => true,
		'menu_icon' => 'dashicons-layout',
		'supports' => array( 'title', 'editor', 'revisions', 'custom-fields' ),
		'capability_type' => 'post',
		'map_meta_cap' => true,
		'exclude_from_search' => true,
	) );
}
add_action( 'init', 'rss_prism_builder_register_templates' );
