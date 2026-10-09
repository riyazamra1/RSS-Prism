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
	add_theme_support( 'custom-logo', array( 'height' => 100, 'width' => 320, 'flex-height' => true, 'flex-width' => true ) );
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

function rss_prism_customize_register( $wp_customize ) {
	$wp_customize->add_section( 'rss_prism_design', array(
		'title'       => __( 'RSS Prism Design', 'rss-prism' ),
		'priority'    => 35,
		'description' => __( 'Adjust the theme colours and content width.', 'rss-prism' ),
	) );

	$wp_customize->add_setting( 'rss_prism_accent_color', array(
		'default'           => '#b88a2b',
		'sanitize_callback' => 'sanitize_hex_color',
		'transport'         => 'refresh',
	) );
	$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'rss_prism_accent_color', array(
		'label'   => __( 'Accent colour', 'rss-prism' ),
		'section' => 'rss_prism_design',
	) ) );

	$wp_customize->add_setting( 'rss_prism_background_color', array(
		'default'           => '#f7f7f5',
		'sanitize_callback' => 'sanitize_hex_color',
		'transport'         => 'refresh',
	) );
	$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'rss_prism_background_color', array(
		'label'   => __( 'Page background', 'rss-prism' ),
		'section' => 'rss_prism_design',
	) ) );

	$wp_customize->add_setting( 'rss_prism_content_width', array(
		'default'           => 1120,
		'sanitize_callback' => 'absint',
		'validate_callback' => function( $validity, $value ) {
			if ( $value < 720 || $value > 1600 ) {
				$validity->add( 'invalid_width', __( 'Choose a width between 720 and 1600 pixels.', 'rss-prism' ) );
			}
			return $validity;
		},
		'transport' => 'refresh',
	) );
	$wp_customize->add_control( 'rss_prism_content_width', array(
		'label'       => __( 'Content width (pixels)', 'rss-prism' ),
		'section'     => 'rss_prism_design',
		'type'        => 'number',
		'input_attrs' => array( 'min' => 720, 'max' => 1600, 'step' => 20 ),
	) );
}
add_action( 'customize_register', 'rss_prism_customize_register' );

function rss_prism_enqueue_assets() {
	wp_enqueue_style( 'rss-prism-style', get_stylesheet_uri(), array(), wp_get_theme()->get( 'Version' ) );
	$accent = sanitize_hex_color( get_theme_mod( 'rss_prism_accent_color', '#b88a2b' ) );
	$background = sanitize_hex_color( get_theme_mod( 'rss_prism_background_color', '#f7f7f5' ) );
	$width = absint( get_theme_mod( 'rss_prism_content_width', 1120 ) );
	$width = min( 1600, max( 720, $width ) );
	$css = ':root{--rss-prism-accent:' . ( $accent ? $accent : '#b88a2b' ) . ';--rss-prism-background:' . ( $background ? $background : '#f7f7f5' ) . ';--rss-prism-content-width:' . $width . 'px}';
	wp_add_inline_style( 'rss-prism-style', $css );
}
add_action( 'wp_enqueue_scripts', 'rss_prism_enqueue_assets' );

function rss_prism_content_width() {
	$GLOBALS['content_width'] = min( 1600, max( 720, absint( get_theme_mod( 'rss_prism_content_width', 1120 ) ) ) );
}
add_action( 'after_setup_theme', 'rss_prism_content_width', 0 );

function rss_prism_excerpt_more( $more ) {
	return '';
}
add_filter( 'excerpt_more', 'rss_prism_excerpt_more' );

function rss_prism_excerpt_length( $length ) {
	return 28;
}
add_filter( 'excerpt_length', 'rss_prism_excerpt_length' );
