<?php
/**
 * RSS Prism theme setup and asset loading.
 *
 * @package RSS_Prism
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'RSS_PRISM_VERSION', '1.3.13' );

require get_template_directory() . '/inc/theme-studio.php';

if ( ! function_exists( 'rss_prism_setup' ) ) {
	function rss_prism_setup() {
		load_theme_textdomain( 'rss-prism', get_template_directory() . '/languages' );

		add_theme_support( 'automatic-feed-links' );
		add_theme_support( 'title-tag' );
		add_theme_support( 'post-thumbnails' );
		add_theme_support( 'responsive-embeds' );
		add_theme_support( 'align-wide' );
		add_theme_support( 'customize-selective-refresh-widgets' );
		add_theme_support(
			'custom-logo',
			array(
				'height'      => 100,
				'width'       => 320,
				'flex-height' => true,
				'flex-width'  => true,
			)
		);
		add_theme_support(
			'html5',
			array(
				'search-form',
				'comment-form',
				'comment-list',
				'gallery',
				'caption',
				'style',
				'script',
			)
		);

		register_nav_menus(
			array(
				'primary' => esc_html__( 'Primary Navigation', 'rss-prism' ),
				'footer'  => esc_html__( 'Footer Navigation', 'rss-prism' ),
			)
		);
	}
}
add_action( 'after_setup_theme', 'rss_prism_setup' );

function rss_prism_content_width() {
	$width = absint( get_theme_mod( 'rss_prism_content_width', 1180 ) );
	$GLOBALS['content_width'] = max( 720, min( 1600, $width ) );
}
add_action( 'after_setup_theme', 'rss_prism_content_width', 0 );

function rss_prism_widgets_init() {
	register_sidebar(
		array(
			'name'          => esc_html__( 'Primary Sidebar', 'rss-prism' ),
			'id'            => 'sidebar-1',
			'description'   => esc_html__( 'Add widgets here to appear in your sidebar.', 'rss-prism' ),
			'before_widget' => '<section id="%1$s" class="widget %2$s">',
			'after_widget'  => '</section>',
			'before_title'  => '<h2 class="widget-title">',
			'after_title'   => '</h2>',
		)
	);
}
add_action( 'widgets_init', 'rss_prism_widgets_init' );

function rss_prism_enqueue_assets() {
	wp_enqueue_style(
		'rss-prism-style',
		get_stylesheet_uri(),
		array(),
		RSS_PRISM_VERSION
	);

	$accent     = sanitize_hex_color( get_theme_mod( 'rss_prism_accent_color', '#b88a2b' ) ) ?: '#b88a2b';
	$background = sanitize_hex_color( get_theme_mod( 'rss_prism_background_color', '#f5f6f8' ) ) ?: '#f5f6f8';
	$width      = max( 720, min( 1600, absint( get_theme_mod( 'rss_prism_content_width', 1180 ) ) ) );
	$btn_shape  = sanitize_key( get_theme_mod( 'rss_prism_button_shape', 'pill' ) );
	$btn_radius = 'soft' === $btn_shape ? '10px' : ( 'square' === $btn_shape ? '3px' : '999px' );

	$inline_css = sprintf(
		':root{--rss-prism-accent:%1$s;--rp-accent:%1$s;--rss-prism-background:%2$s;--rp-bg:%2$s;--rss-prism-content-width:%3$dpx;--rp-width:%3$dpx;--rp-button-radius:%4$s;}',
		esc_attr( $accent ),
		esc_attr( $background ),
		$width,
		esc_attr( $btn_radius )
	);
	wp_add_inline_style( 'rss-prism-style', $inline_css );

	wp_enqueue_script(
		'rss-prism-navigation',
		get_template_directory_uri() . '/assets/js/navigation.js',
		array(),
		RSS_PRISM_VERSION,
		true
	);

	if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
		wp_enqueue_script( 'comment-reply' );
	}
}
add_action( 'wp_enqueue_scripts', 'rss_prism_enqueue_assets' );

function rss_prism_fallback_menu() {
	echo '<ul>';
	echo '<li><a href="' . esc_url( home_url( '/' ) ) . '">' . esc_html__( 'Home', 'rss-prism' ) . '</a></li>';
	wp_list_pages(
		array(
			'title_li' => '',
			'depth'    => 1,
		)
	);
	echo '</ul>';
}
