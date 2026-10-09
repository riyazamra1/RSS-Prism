<?php
/**
 * RSS Prism theme setup.
 * @package RSSPrism
 */
defined( 'ABSPATH' ) || exit;

function rss_prism_setup() {
	load_theme_textdomain( 'rss-prism', get_template_directory() . '/languages' );
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'automatic-feed-links' );
	add_theme_support( 'responsive-embeds' );
	add_theme_support( 'align-wide' );
	add_theme_support( 'wp-block-styles' );
	add_theme_support( 'editor-styles' );
	add_editor_style( 'style.css' );
	register_nav_menus( array(
		'primary' => __( 'Primary Menu', 'rss-prism' ),
		'footer'  => __( 'Footer Menu', 'rss-prism' ),
	) );
}
add_action( 'after_setup_theme', 'rss_prism_setup' );

function rss_prism_enqueue_assets() {
	wp_enqueue_style( 'rss-prism-style', get_stylesheet_uri(), array(), wp_get_theme()->get( 'Version' ) );
}
add_action( 'wp_enqueue_scripts', 'rss_prism_enqueue_assets' );

function rss_prism_content_width() {
	$GLOBALS['content_width'] = apply_filters( 'rss_prism_content_width', 1120 );
}
add_action( 'after_setup_theme', 'rss_prism_content_width', 0 );
