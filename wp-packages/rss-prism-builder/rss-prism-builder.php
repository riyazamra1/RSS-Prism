<?php
/**
 * Plugin Name: RSS Prism Builder
 * Plugin URI: https://www.rsscctvsolution.eu.cc/
 * Description: Visual Divi-style drag-and-drop page builder with 60 modules, responsive preview modes, animations, and starter layouts.
 * Version: 1.3.13
 * Requires at least: 6.4
 * Requires PHP: 7.4
 * Author: Razeen Smart Solution
 * Author URI: https://www.rsscctvsolution.eu.cc/
 * License: GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: rss-prism-builder
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'RSS_PRISM_BUILDER_VERSION', '1.3.13' );
define( 'RSS_PRISM_BUILDER_META_KEY', '_rss_prism_builder_layout' );

function rss_prism_builder_allowed_types() {
	return array(
		'section', 'columns', 'container', 'divider', 'spacer', 'sidebar',
		'heading', 'text', 'button', 'blurb', 'callout', 'quote', 'pricing_table',
		'testimonial', 'icon_list', 'person', 'icon', 'code', 'breadcrumbs', 'post_content',
		'accordion', 'toggle', 'tabs', 'number_counter', 'bar_counter', 'circle_counter',
		'countdown', 'contact_form', 'email_optin', 'login', 'search', 'social_follow', 'comments',
		'image', 'gallery', 'video', 'video_slider', 'audio', 'map', 'before_after',
		'slider', 'blog', 'portfolio', 'filterable_portfolio', 'post_title',
		'post_navigation', 'post_slider', 'menu',
		'fullwidth_header', 'fullwidth_slider', 'fullwidth_image', 'fullwidth_map',
		'fullwidth_menu', 'fullwidth_portfolio', 'fullwidth_post_slider', 'fullwidth_code',
		'shop', 'woo_product', 'woo_cart', 'woo_checkout',
	);
}

function rss_prism_builder_clamp_int( $val, $min, $max, $fallback ) {
	if ( ! is_numeric( $val ) ) {
		return $fallback;
	}
	return max( $min, min( $max, intval( $val ) ) );
}

function rss_prism_builder_clamp_float( $val, $min, $max, $fallback ) {
	if ( ! is_numeric( $val ) ) {
		return $fallback;
	}
	return max( $min, min( $max, floatval( $val ) ) );
}

function rss_prism_builder_hex( $val, $fallback = '' ) {
	if ( ! is_string( $val ) ) {
		return $fallback;
	}
	$sanitized = sanitize_hex_color( trim( $val ) );
	return $sanitized ? strtolower( $sanitized ) : $fallback;
}

function rss_prism_builder_url( $val ) {
	if ( ! is_string( $val ) ) {
		return '';
	}
	$trimmed = trim( $val );
	if ( '' === $trimmed ) {
		return '';
	}
	if ( 0 === strpos( $trimmed, '/' ) || 0 === strpos( $trimmed, '#' ) ) {
		return sanitize_text_field( $trimmed );
	}
	return esc_url_raw( $trimmed );
}

function rss_prism_builder_sanitize_responsive( $resp, $item ) {
	$clean = array();
	$src   = is_array( $resp ) ? $resp : array();
	$align = array( 'left', 'center', 'right' );
	foreach ( array( 'desktop', 'tablet', 'mobile' ) as $dev ) {
		$d        = isset( $src[ $dev ] ) && is_array( $src[ $dev ] ) ? $src[ $dev ] : array();
		$raw_a    = isset( $d['align'] ) ? $d['align'] : ( isset( $item['align'] ) ? $item['align'] : 'left' );
		$clean[ $dev ] = array(
			'font_size' => rss_prism_builder_clamp_int( isset( $d['font_size'] ) ? $d['font_size'] : ( isset( $item['font_size'] ) ? $item['font_size'] : 16 ), 10, 96, 16 ),
			'padding'   => rss_prism_builder_clamp_int( isset( $d['padding'] ) ? $d['padding'] : ( isset( $item['padding'] ) ? $item['padding'] : 24 ), 0, 200, 24 ),
			'align'     => in_array( $raw_a, $align, true ) ? $raw_a : 'left',
		);
	}
	return $clean;
}

function rss_prism_builder_sanitize_column_elements( $col_elems, $legacy, $count ) {
	$allowed = array( 'heading', 'text', 'button', 'image' );
	$clean   = array();
	for ( $c = 0; $c < $count; $c++ ) {
		$src = ( is_array( $col_elems ) && isset( $col_elems[ $c ] ) && is_array( $col_elems[ $c ] ) ) ? $col_elems[ $c ] : array();
		if ( empty( $src ) && is_array( $legacy ) && isset( $legacy[ $c ] ) && is_string( $legacy[ $c ] ) && '' !== $legacy[ $c ] ) {
			$src = array( array( 'type' => 'text', 'text' => $legacy[ $c ] ) );
		}
		$items = array();
		foreach ( array_slice( $src, 0, 12 ) as $child ) {
			if ( ! is_array( $child ) || ! isset( $child['type'] ) || ! in_array( $child['type'], $allowed, true ) ) {
				continue;
			}
			$items[] = array(
				'id'        => isset( $child['id'] ) ? sanitize_key( $child['id'] ) : wp_generate_uuid4(),
				'type'      => sanitize_key( $child['type'] ),
				'text'      => substr( (string) ( isset( $child['text'] ) ? $child['text'] : '' ), 0, 10000 ),
				'url'       => rss_prism_builder_url( isset( $child['url'] ) ? $child['url'] : '' ),
				'image_url' => rss_prism_builder_url( isset( $child['image_url'] ) ? $child['image_url'] : '' ),
				'alt'       => sanitize_text_field( substr( (string) ( isset( $child['alt'] ) ? $child['alt'] : '' ), 0, 500 ) ),
				'image_fit' => ( isset( $child['image_fit'] ) && 'contain' === $child['image_fit'] ) ? 'contain' : 'cover',
			);
		}
		$clean[] = $items;
	}
	return $clean;
}

function rss_prism_builder_sanitize_container_elements( $children, $depth = 0 ) {
	if ( ! is_array( $children ) ) {
		return array();
	}
	$allowed = array( 'heading', 'text', 'button', 'image' );
	if ( $depth < 2 ) {
		$allowed[] = 'container';
	}
	$clean = array();
	foreach ( array_slice( $children, 0, 20 ) as $child ) {
		if ( ! is_array( $child ) || ! isset( $child['type'] ) || ! in_array( $child['type'], $allowed, true ) ) {
			continue;
		}
		$type  = sanitize_key( $child['type'] );
		$entry = array(
			'id'        => isset( $child['id'] ) ? sanitize_key( $child['id'] ) : wp_generate_uuid4(),
			'type'      => $type,
			'text'      => substr( (string) ( isset( $child['text'] ) ? $child['text'] : '' ), 0, 10000 ),
			'url'       => rss_prism_builder_url( isset( $child['url'] ) ? $child['url'] : '' ),
			'image_url' => rss_prism_builder_url( isset( $child['image_url'] ) ? $child['image_url'] : '' ),
			'alt'       => sanitize_text_field( substr( (string) ( isset( $child['alt'] ) ? $child['alt'] : '' ), 0, 500 ) ),
		);
		if ( 'container' === $type ) {
			$entry['container_background'] = rss_prism_builder_hex( isset( $child['container_background'] ) ? $child['container_background'] : '#f7f6f2', '#f7f6f2' );
			$entry['container_elements']   = rss_prism_builder_sanitize_container_elements( isset( $child['container_elements'] ) ? $child['container_elements'] : array(), $depth + 1 );
		}
		$clean[] = $entry;
	}
	return $clean;
}

function rss_prism_builder_sanitize_subitems( $arr, $max = 12 ) {
	if ( ! is_array( $arr ) ) {
		return array();
	}
	$out = array();
	foreach ( array_slice( $arr, 0, $max ) as $idx => $row ) {
		if ( ! is_array( $row ) ) {
			continue;
		}
		$out[] = array(
			'id'    => isset( $row['id'] ) ? sanitize_key( $row['id'] ) : 'sub-' . $idx,
			'title' => sanitize_text_field( substr( (string) ( isset( $row['title'] ) ? $row['title'] : 'Item ' . ( $idx + 1 ) ), 0, 200 ) ),
			'body'  => substr( (string) ( isset( $row['body'] ) ? $row['body'] : '' ), 0, 5000 ),
		);
	}
	return $out;
}

function rss_prism_builder_sanitize_layout( $layout ) {
	if ( ! is_array( $layout ) ) {
		return new WP_Error( 'invalid_layout', __( 'Layout must be a list of elements.', 'rss-prism-builder' ), array( 'status' => 400 ) );
	}
	if ( count( $layout ) > 100 ) {
		return new WP_Error( 'layout_too_large', __( 'A layout may contain at most 100 elements.', 'rss-prism-builder' ), array( 'status' => 400 ) );
	}

	$allowed        = rss_prism_builder_allowed_types();
	$allowed_align  = array( 'left', 'center', 'right' );
	$allowed_cols   = array( '50-50', '33-33-33', '66-33', '33-66', '100' );
	$allowed_anims  = array( 'none', 'fade', 'slide-up', 'slide-down', 'slide-left', 'slide-right', 'zoom', 'bounce', 'flip' );
	$allowed_shadow = array( 'none', 'subtle', 'elevated', 'deep', 'glow' );
	$allowed_bstyle = array( 'solid', 'dashed', 'dotted' );
	$allowed_trans  = array( 'none', 'uppercase', 'capitalize' );
	$clean          = array();

	foreach ( $layout as $item ) {
		if ( ! is_array( $item ) || empty( $item['type'] ) || ! in_array( $item['type'], $allowed, true ) ) {
			continue;
		}
		$cols_count = rss_prism_builder_clamp_int( isset( $item['columns_count'] ) ? $item['columns_count'] : 2, 1, 3, 2 );
		$legacy     = ( isset( $item['column_contents'] ) && is_array( $item['column_contents'] ) )
			? array_map( static function ( $v ) { return substr( (string) $v, 0, 5000 ); }, array_slice( $item['column_contents'], 0, 3 ) )
			: array( 'First column content', 'Second column content', 'Third column content' );
		$col_layout = ( isset( $item['column_layout'] ) && in_array( $item['column_layout'], $allowed_cols, true ) )
			? $item['column_layout']
			: ( 3 === $cols_count ? '33-33-33' : ( 1 === $cols_count ? '100' : '50-50' ) );

		$slides = array();
		if ( isset( $item['slides'] ) && is_array( $item['slides'] ) ) {
			foreach ( array_slice( $item['slides'], 0, 10 ) as $idx => $s ) {
				if ( ! is_array( $s ) ) { continue; }
				$slides[] = array(
					'id'           => isset( $s['id'] ) ? sanitize_key( $s['id'] ) : 'slide-' . $idx,
					'title'        => sanitize_text_field( substr( (string) ( isset( $s['title'] ) ? $s['title'] : 'Slide ' . ( $idx + 1 ) ), 0, 200 ) ),
					'body'         => sanitize_textarea_field( substr( (string) ( isset( $s['body'] ) ? $s['body'] : '' ), 0, 1000 ) ),
					'button_label' => sanitize_text_field( substr( (string) ( isset( $s['button_label'] ) ? $s['button_label'] : 'Learn More' ), 0, 60 ) ),
					'button_url'   => rss_prism_builder_url( isset( $s['button_url'] ) ? $s['button_url'] : '' ),
					'bg_color'     => rss_prism_builder_hex( isset( $s['bg_color'] ) ? $s['bg_color'] : '#1f2937', '#1f2937' ),
					'image_url'    => rss_prism_builder_url( isset( $s['image_url'] ) ? $s['image_url'] : '' ),
				);
			}
		}

		$cards = array();
		if ( isset( $item['cards'] ) && is_array( $item['cards'] ) ) {
			foreach ( array_slice( $item['cards'], 0, 12 ) as $idx => $c ) {
				if ( ! is_array( $c ) ) { continue; }
				$cards[] = array(
					'id'        => isset( $c['id'] ) ? sanitize_key( $c['id'] ) : 'card-' . $idx,
					'title'     => sanitize_text_field( substr( (string) ( isset( $c['title'] ) ? $c['title'] : 'Item ' . ( $idx + 1 ) ), 0, 180 ) ),
					'category'  => sanitize_text_field( substr( (string) ( isset( $c['category'] ) ? $c['category'] : 'General' ), 0, 60 ) ),
					'date'      => sanitize_text_field( substr( (string) ( isset( $c['date'] ) ? $c['date'] : '2026' ), 0, 40 ) ),
					'excerpt'   => sanitize_textarea_field( substr( (string) ( isset( $c['excerpt'] ) ? $c['excerpt'] : '' ), 0, 800 ) ),
					'price'     => sanitize_text_field( substr( (string) ( isset( $c['price'] ) ? $c['price'] : '$49' ), 0, 32 ) ),
					'image_url' => rss_prism_builder_url( isset( $c['image_url'] ) ? $c['image_url'] : '' ),
					'url'       => rss_prism_builder_url( isset( $c['url'] ) ? $c['url'] : '' ),
				);
			}
		}

		$videos = array();
		if ( isset( $item['video_playlist'] ) && is_array( $item['video_playlist'] ) ) {
			foreach ( array_slice( $item['video_playlist'], 0, 10 ) as $idx => $v ) {
				if ( ! is_array( $v ) ) { continue; }
				$videos[] = array(
					'id'        => isset( $v['id'] ) ? sanitize_key( $v['id'] ) : 'vid-' . $idx,
					'title'     => sanitize_text_field( substr( (string) ( isset( $v['title'] ) ? $v['title'] : 'Video ' . ( $idx + 1 ) ), 0, 160 ) ),
					'video_url' => rss_prism_builder_url( isset( $v['video_url'] ) ? $v['video_url'] : '' ),
					'duration'  => sanitize_text_field( substr( (string) ( isset( $v['duration'] ) ? $v['duration'] : '02:30' ), 0, 20 ) ),
				);
			}
		}

		$menus = array();
		if ( isset( $item['menu_items'] ) && is_array( $item['menu_items'] ) ) {
			foreach ( array_slice( $item['menu_items'], 0, 12 ) as $idx => $m ) {
				if ( ! is_array( $m ) ) { continue; }
				$menus[] = array(
					'id'    => isset( $m['id'] ) ? sanitize_key( $m['id'] ) : 'menu-' . $idx,
					'label' => sanitize_text_field( substr( (string) ( isset( $m['label'] ) ? $m['label'] : 'Link' ), 0, 80 ) ),
					'url'   => rss_prism_builder_url( isset( $m['url'] ) ? $m['url'] : '#' ) ?: '#',
				);
			}
		}

		$widgets = array();
		if ( isset( $item['sidebar_widgets'] ) && is_array( $item['sidebar_widgets'] ) ) {
			foreach ( array_slice( $item['sidebar_widgets'], 0, 8 ) as $idx => $w ) {
				if ( ! is_array( $w ) ) { continue; }
				$widgets[] = array(
					'id'    => isset( $w['id'] ) ? sanitize_key( $w['id'] ) : 'widget-' . $idx,
					'title' => sanitize_text_field( substr( (string) ( isset( $w['title'] ) ? $w['title'] : 'Widget' ), 0, 120 ) ),
					'items' => sanitize_textarea_field( substr( (string) ( isset( $w['items'] ) ? $w['items'] : '' ), 0, 1500 ) ),
				);
			}
		}

		$comments = array();
		if ( isset( $item['comments_items'] ) && is_array( $item['comments_items'] ) ) {
			foreach ( array_slice( $item['comments_items'], 0, 10 ) as $idx => $cm ) {
				if ( ! is_array( $cm ) ) { continue; }
				$comments[] = array(
					'id'     => isset( $cm['id'] ) ? sanitize_key( $cm['id'] ) : 'c-' . $idx,
					'author' => sanitize_text_field( substr( (string) ( isset( $cm['author'] ) ? $cm['author'] : 'Visitor' ), 0, 80 ) ),
					'date'   => sanitize_text_field( substr( (string) ( isset( $cm['date'] ) ? $cm['date'] : 'Today' ), 0, 40 ) ),
					'body'   => sanitize_textarea_field( substr( (string) ( isset( $cm['body'] ) ? $cm['body'] : '' ), 0, 1200 ) ),
				);
			}
		}

		$cart = array();
		if ( isset( $item['cart_items'] ) && is_array( $item['cart_items'] ) ) {
			foreach ( array_slice( $item['cart_items'], 0, 10 ) as $idx => $ci ) {
				if ( ! is_array( $ci ) ) { continue; }
				$cart[] = array(
					'id'    => isset( $ci['id'] ) ? sanitize_key( $ci['id'] ) : 'cart-' . $idx,
					'name'  => sanitize_text_field( substr( (string) ( isset( $ci['name'] ) ? $ci['name'] : 'Product' ), 0, 140 ) ),
					'qty'   => rss_prism_builder_clamp_int( isset( $ci['qty'] ) ? $ci['qty'] : 1, 1, 99, 1 ),
					'price' => rss_prism_builder_clamp_float( isset( $ci['price'] ) ? $ci['price'] : 49, 0, 1000000, 49 ),
				);
			}
		}

		$social = array();
		if ( isset( $item['social_links'] ) && is_array( $item['social_links'] ) ) {
			$nets = array( 'website', 'facebook', 'twitter', 'linkedin', 'youtube', 'instagram', 'email' );
			foreach ( array_slice( $item['social_links'], 0, 10 ) as $sl ) {
				if ( ! is_array( $sl ) ) { continue; }
				$social[] = array(
					'network' => ( isset( $sl['network'] ) && in_array( $sl['network'], $nets, true ) ) ? $sl['network'] : 'website',
					'label'   => sanitize_text_field( substr( (string) ( isset( $sl['label'] ) ? $sl['label'] : '' ), 0, 60 ) ),
					'url'     => rss_prism_builder_url( isset( $sl['url'] ) ? $sl['url'] : '' ),
				);
			}
		}

		$clean[] = array(
			'id'                   => isset( $item['id'] ) ? sanitize_key( $item['id'] ) : wp_generate_uuid4(),
			'type'                 => sanitize_key( $item['type'] ),
			'text'                 => substr( (string) ( isset( $item['text'] ) ? $item['text'] : '' ), 0, 20000 ),
			'subtitle'             => sanitize_text_field( substr( (string) ( isset( $item['subtitle'] ) ? $item['subtitle'] : '' ), 0, 400 ) ),
			'url'                  => rss_prism_builder_url( isset( $item['url'] ) ? $item['url'] : '' ),
			'secondary_label'      => sanitize_text_field( substr( (string) ( isset( $item['secondary_label'] ) ? $item['secondary_label'] : '' ), 0, 80 ) ),
			'secondary_url'        => rss_prism_builder_url( isset( $item['secondary_url'] ) ? $item['secondary_url'] : '' ),
			'image_url'            => rss_prism_builder_url( isset( $item['image_url'] ) ? $item['image_url'] : '' ),
			'alt'                  => sanitize_text_field( substr( (string) ( isset( $item['alt'] ) ? $item['alt'] : '' ), 0, 500 ) ),
			'button_bg'            => rss_prism_builder_hex( isset( $item['button_bg'] ) ? $item['button_bg'] : '#b88a2b', '#b88a2b' ),
			'button_text'          => rss_prism_builder_hex( isset( $item['button_text'] ) ? $item['button_text'] : '#ffffff', '#ffffff' ),
			'button_radius'        => rss_prism_builder_clamp_int( isset( $item['button_radius'] ) ? $item['button_radius'] : 6, 0, 40, 6 ),
			'image_width'          => rss_prism_builder_clamp_int( isset( $item['image_width'] ) ? $item['image_width'] : 100, 10, 100, 100 ),
			'image_fit'            => ( isset( $item['image_fit'] ) && 'contain' === $item['image_fit'] ) ? 'contain' : 'cover',
			'columns_count'        => $cols_count,
			'column_layout'        => $col_layout,
			'column_contents'      => $legacy,
			'column_elements'      => rss_prism_builder_sanitize_column_elements( isset( $item['column_elements'] ) ? $item['column_elements'] : array(), $legacy, $cols_count ),
			'container_background' => rss_prism_builder_hex( isset( $item['container_background'] ) ? $item['container_background'] : '#f7f6f2', '#f7f6f2' ),
			'container_elements'   => rss_prism_builder_sanitize_container_elements( isset( $item['container_elements'] ) ? $item['container_elements'] : array() ),
			'background'           => rss_prism_builder_hex( isset( $item['background'] ) ? $item['background'] : '', '' ),
			'bg_gradient_enabled'  => ! empty( $item['bg_gradient_enabled'] ),
			'bg_gradient_start'    => rss_prism_builder_hex( isset( $item['bg_gradient_start'] ) ? $item['bg_gradient_start'] : '#f7f3e8', '#f7f3e8' ),
			'bg_gradient_end'      => rss_prism_builder_hex( isset( $item['bg_gradient_end'] ) ? $item['bg_gradient_end'] : '#ffffff', '#ffffff' ),
			'bg_gradient_angle'    => rss_prism_builder_clamp_int( isset( $item['bg_gradient_angle'] ) ? $item['bg_gradient_angle'] : 135, 0, 360, 135 ),
			'border_radius'        => rss_prism_builder_clamp_int( isset( $item['border_radius'] ) ? $item['border_radius'] : 0, 0, 48, 0 ),
			'border_color'         => rss_prism_builder_hex( isset( $item['border_color'] ) ? $item['border_color'] : '#d9d9d9', '#d9d9d9' ),
			'border_width'         => rss_prism_builder_clamp_int( isset( $item['border_width'] ) ? $item['border_width'] : 0, 0, 12, 0 ),
			'border_style'         => ( isset( $item['border_style'] ) && in_array( $item['border_style'], $allowed_bstyle, true ) ) ? $item['border_style'] : 'solid',
			'box_shadow'           => ( isset( $item['box_shadow'] ) && in_array( $item['box_shadow'], $allowed_shadow, true ) ) ? $item['box_shadow'] : 'none',
			'divider_color'        => rss_prism_builder_hex( isset( $item['divider_color'] ) ? $item['divider_color'] : '#d9d9d9', '#d9d9d9' ),
			'divider_width'        => rss_prism_builder_clamp_int( isset( $item['divider_width'] ) ? $item['divider_width'] : 100, 10, 100, 100 ),
			'spacer_height'        => rss_prism_builder_clamp_int( isset( $item['spacer_height'] ) ? $item['spacer_height'] : 48, 8, 300, 48 ),
			'quote_author'         => sanitize_text_field( substr( (string) ( isset( $item['quote_author'] ) ? $item['quote_author'] : '' ), 0, 250 ) ),
			'blurb_icon'           => sanitize_text_field( substr( (string) ( isset( $item['blurb_icon'] ) ? $item['blurb_icon'] : '✦' ), 0, 16 ) ),
			'blurb_body'           => substr( (string) ( isset( $item['blurb_body'] ) ? $item['blurb_body'] : '' ), 0, 5000 ),
			'callout_body'         => substr( (string) ( isset( $item['callout_body'] ) ? $item['callout_body'] : '' ), 0, 5000 ),
			'callout_label'        => sanitize_text_field( substr( (string) ( isset( $item['callout_label'] ) ? $item['callout_label'] : 'Get started' ), 0, 120 ) ),
			'gallery_urls'         => substr( (string) ( isset( $item['gallery_urls'] ) ? $item['gallery_urls'] : '' ), 0, 10000 ),
			'accordion_items'      => rss_prism_builder_sanitize_subitems( isset( $item['accordion_items'] ) ? $item['accordion_items'] : array(), 15 ),
			'tabs_items'           => rss_prism_builder_sanitize_subitems( isset( $item['tabs_items'] ) ? $item['tabs_items'] : array(), 10 ),
			'toggle_open'          => ! empty( $item['toggle_open'] ),
			'pricing_currency'     => sanitize_text_field( substr( (string) ( isset( $item['pricing_currency'] ) ? $item['pricing_currency'] : '$' ), 0, 8 ) ),
			'pricing_price'        => sanitize_text_field( substr( (string) ( isset( $item['pricing_price'] ) ? $item['pricing_price'] : '49' ), 0, 24 ) ),
			'pricing_period'       => sanitize_text_field( substr( (string) ( isset( $item['pricing_period'] ) ? $item['pricing_period'] : '/ year' ), 0, 32 ) ),
			'pricing_badge'        => sanitize_text_field( substr( (string) ( isset( $item['pricing_badge'] ) ? $item['pricing_badge'] : '' ), 0, 40 ) ),
			'pricing_features'     => sanitize_textarea_field( substr( (string) ( isset( $item['pricing_features'] ) ? $item['pricing_features'] : '' ), 0, 4000 ) ),
			'pricing_featured'     => ! empty( $item['pricing_featured'] ),
			'testimonial_author'   => sanitize_text_field( substr( (string) ( isset( $item['testimonial_author'] ) ? $item['testimonial_author'] : 'A. Customer' ), 0, 120 ) ),
			'testimonial_role'     => sanitize_text_field( substr( (string) ( isset( $item['testimonial_role'] ) ? $item['testimonial_role'] : 'Operations Lead' ), 0, 120 ) ),
			'testimonial_avatar'   => rss_prism_builder_url( isset( $item['testimonial_avatar'] ) ? $item['testimonial_avatar'] : '' ),
			'testimonial_rating'   => rss_prism_builder_clamp_int( isset( $item['testimonial_rating'] ) ? $item['testimonial_rating'] : 5, 1, 5, 5 ),
			'counter_number'       => rss_prism_builder_clamp_float( isset( $item['counter_number'] ) ? $item['counter_number'] : 150, -10000000, 10000000, 150 ),
			'counter_prefix'       => sanitize_text_field( substr( (string) ( isset( $item['counter_prefix'] ) ? $item['counter_prefix'] : '' ), 0, 12 ) ),
			'counter_suffix'       => sanitize_text_field( substr( (string) ( isset( $item['counter_suffix'] ) ? $item['counter_suffix'] : '+' ), 0, 12 ) ),
			'bar_percent'          => rss_prism_builder_clamp_int( isset( $item['bar_percent'] ) ? $item['bar_percent'] : 85, 0, 100, 85 ),
			'bar_color'            => rss_prism_builder_hex( isset( $item['bar_color'] ) ? $item['bar_color'] : '#2b87da', '#2b87da' ),
			'bar_track_color'      => rss_prism_builder_hex( isset( $item['bar_track_color'] ) ? $item['bar_track_color'] : '#e5e7eb', '#e5e7eb' ),
			'video_url'            => rss_prism_builder_url( isset( $item['video_url'] ) ? $item['video_url'] : '' ),
			'countdown_target'     => sanitize_text_field( substr( (string) ( isset( $item['countdown_target'] ) ? $item['countdown_target'] : '' ), 0, 40 ) ),
			'icon_list_items'      => sanitize_textarea_field( substr( (string) ( isset( $item['icon_list_items'] ) ? $item['icon_list_items'] : '' ), 0, 4000 ) ),
			'icon_list_symbol'     => sanitize_text_field( substr( (string) ( isset( $item['icon_list_symbol'] ) ? $item['icon_list_symbol'] : '✓' ), 0, 8 ) ),
			'form_button_label'    => sanitize_text_field( substr( (string) ( isset( $item['form_button_label'] ) ? $item['form_button_label'] : 'Send Message' ), 0, 80 ) ),
			'form_success_message' => sanitize_text_field( substr( (string) ( isset( $item['form_success_message'] ) ? $item['form_success_message'] : 'Thank you — received.' ), 0, 300 ) ),
			'social_links'         => $social,
			'audio_url'            => rss_prism_builder_url( isset( $item['audio_url'] ) ? $item['audio_url'] : '' ),
			'audio_artist'         => sanitize_text_field( substr( (string) ( isset( $item['audio_artist'] ) ? $item['audio_artist'] : 'RSS Studio' ), 0, 120 ) ),
			'code_language'        => sanitize_key( isset( $item['code_language'] ) ? $item['code_language'] : 'html' ),
			'code_content'         => substr( (string) ( isset( $item['code_content'] ) ? $item['code_content'] : '' ), 0, 12000 ),
			'map_address'          => sanitize_text_field( substr( (string) ( isset( $item['map_address'] ) ? $item['map_address'] : 'Colombo, Sri Lanka' ), 0, 300 ) ),
			'map_lat'              => rss_prism_builder_clamp_float( isset( $item['map_lat'] ) ? $item['map_lat'] : 6.9271, -90, 90, 6.9271 ),
			'map_lng'              => rss_prism_builder_clamp_float( isset( $item['map_lng'] ) ? $item['map_lng'] : 79.8612, -180, 180, 79.8612 ),
			'map_zoom'             => rss_prism_builder_clamp_int( isset( $item['map_zoom'] ) ? $item['map_zoom'] : 13, 1, 18, 13 ),
			'map_height'           => rss_prism_builder_clamp_int( isset( $item['map_height'] ) ? $item['map_height'] : 320, 160, 600, 320 ),
			'search_placeholder'   => sanitize_text_field( substr( (string) ( isset( $item['search_placeholder'] ) ? $item['search_placeholder'] : 'Search...' ), 0, 120 ) ),
			'icon_symbol'          => sanitize_text_field( substr( (string) ( isset( $item['icon_symbol'] ) ? $item['icon_symbol'] : '★' ), 0, 16 ) ),
			'icon_shape'           => sanitize_key( isset( $item['icon_shape'] ) ? $item['icon_shape'] : 'circle' ),
			'icon_size'            => rss_prism_builder_clamp_int( isset( $item['icon_size'] ) ? $item['icon_size'] : 42, 20, 96, 42 ),
			'slides'               => $slides,
			'video_playlist'       => $videos,
			'cards'                => $cards,
			'menu_items'           => $menus,
			'sidebar_widgets'      => $widgets,
			'post_meta'            => sanitize_text_field( substr( (string) ( isset( $item['post_meta'] ) ? $item['post_meta'] : 'By Razeen Smart Solution' ), 0, 200 ) ),
			'prev_post_label'      => sanitize_text_field( substr( (string) ( isset( $item['prev_post_label'] ) ? $item['prev_post_label'] : '← Previous' ), 0, 120 ) ),
			'next_post_label'      => sanitize_text_field( substr( (string) ( isset( $item['next_post_label'] ) ? $item['next_post_label'] : 'Next →' ), 0, 120 ) ),
			'comments_items'       => $comments,
			'product_price'        => sanitize_text_field( substr( (string) ( isset( $item['product_price'] ) ? $item['product_price'] : '$79' ), 0, 40 ) ),
			'product_sale_price'   => sanitize_text_field( substr( (string) ( isset( $item['product_sale_price'] ) ? $item['product_sale_price'] : '' ), 0, 40 ) ),
			'product_sku'          => sanitize_text_field( substr( (string) ( isset( $item['product_sku'] ) ? $item['product_sku'] : 'RSS-PRO-01' ), 0, 40 ) ),
			'product_rating'       => rss_prism_builder_clamp_int( isset( $item['product_rating'] ) ? $item['product_rating'] : 5, 1, 5, 5 ),
			'cart_items'           => $cart,
			'before_image_url'     => rss_prism_builder_url( isset( $item['before_image_url'] ) ? $item['before_image_url'] : '' ),
			'after_image_url'      => rss_prism_builder_url( isset( $item['after_image_url'] ) ? $item['after_image_url'] : '' ),
			'before_label'         => sanitize_text_field( substr( (string) ( isset( $item['before_label'] ) ? $item['before_label'] : 'Before' ), 0, 40 ) ),
			'after_label'          => sanitize_text_field( substr( (string) ( isset( $item['after_label'] ) ? $item['after_label'] : 'After' ), 0, 40 ) ),
			'compare_split'        => rss_prism_builder_clamp_int( isset( $item['compare_split'] ) ? $item['compare_split'] : 50, 5, 95, 50 ),
			'text_color'           => rss_prism_builder_hex( isset( $item['text_color'] ) ? $item['text_color'] : '', '' ),
			'font_size'            => rss_prism_builder_clamp_int( isset( $item['font_size'] ) ? $item['font_size'] : 16, 10, 96, 16 ),
			'font_weight'          => sanitize_text_field( isset( $item['font_weight'] ) ? $item['font_weight'] : '600' ),
			'line_height'          => rss_prism_builder_clamp_float( isset( $item['line_height'] ) ? $item['line_height'] : 1.5, 1.0, 2.5, 1.5 ),
			'letter_spacing'       => rss_prism_builder_clamp_int( isset( $item['letter_spacing'] ) ? $item['letter_spacing'] : 0, -2, 12, 0 ),
			'text_transform'       => ( isset( $item['text_transform'] ) && in_array( $item['text_transform'], $allowed_trans, true ) ) ? $item['text_transform'] : 'none',
			'align'                => ( isset( $item['align'] ) && in_array( $item['align'], $allowed_align, true ) ) ? $item['align'] : 'left',
			'padding'              => rss_prism_builder_clamp_int( isset( $item['padding'] ) ? $item['padding'] : 24, 0, 200, 24 ),
			'margin_top'           => rss_prism_builder_clamp_int( isset( $item['margin_top'] ) ? $item['margin_top'] : 0, 0, 200, 0 ),
			'margin_bottom'        => rss_prism_builder_clamp_int( isset( $item['margin_bottom'] ) ? $item['margin_bottom'] : 12, 0, 200, 12 ),
			'max_width_pct'        => rss_prism_builder_clamp_int( isset( $item['max_width_pct'] ) ? $item['max_width_pct'] : 100, 20, 100, 100 ),
			'opacity_pct'          => rss_prism_builder_clamp_int( isset( $item['opacity_pct'] ) ? $item['opacity_pct'] : 100, 10, 100, 100 ),
			'hover_lift'           => rss_prism_builder_clamp_int( isset( $item['hover_lift'] ) ? $item['hover_lift'] : 0, 0, 12, 0 ),
			'animation'            => ( isset( $item['animation'] ) && in_array( $item['animation'], $allowed_anims, true ) ) ? $item['animation'] : 'none',
			'animation_duration'   => rss_prism_builder_clamp_int( isset( $item['animation_duration'] ) ? $item['animation_duration'] : 650, 200, 2000, 650 ),
			'animation_delay'      => rss_prism_builder_clamp_int( isset( $item['animation_delay'] ) ? $item['animation_delay'] : 0, 0, 1500, 0 ),
			'hide_desktop'         => ! empty( $item['hide_desktop'] ),
			'hide_tablet'          => ! empty( $item['hide_tablet'] ),
			'hide_mobile'          => ! empty( $item['hide_mobile'] ),
			'custom_class'         => sanitize_html_class( isset( $item['custom_class'] ) ? $item['custom_class'] : '' ),
			'custom_id'            => sanitize_html_class( isset( $item['custom_id'] ) ? $item['custom_id'] : '' ),
			'responsive'           => rss_prism_builder_sanitize_responsive( isset( $item['responsive'] ) ? $item['responsive'] : array(), $item ),
		);
	}

	return $clean;
}

function rss_prism_builder_default_layout() {
	return rss_prism_builder_sanitize_layout(
		array(
			array( 'id' => 'starter-section', 'type' => 'section', 'text' => 'Razeen Smart Solution', 'background' => '#f7f6f2', 'animation' => 'fade' ),
			array( 'id' => 'starter-heading', 'type' => 'heading', 'text' => 'Developing Ideas. Delivering Solutions.', 'font_size' => 36, 'animation' => 'slide-up' ),
			array( 'id' => 'starter-intro', 'type' => 'text', 'text' => 'Software development, CCTV solutions, networking, cloud services, and practical AI.' ),
			array( 'id' => 'starter-cta', 'type' => 'button', 'text' => 'Get Started', 'url' => '#contact', 'button_bg' => '#b88a2b', 'button_text' => '#ffffff' ),
		)
	);
}

function rss_prism_builder_register_cpt() {
	register_post_type(
		'rss_prism_template',
		array(
			'labels'       => array(
				'name'          => __( 'Prism Templates', 'rss-prism-builder' ),
				'singular_name' => __( 'Prism Template', 'rss-prism-builder' ),
			),
			'public'       => false,
			'show_ui'      => true,
			'show_in_menu' => false,
			'supports'     => array( 'title' ),
		)
	);
}
add_action( 'init', 'rss_prism_builder_register_cpt' );

function rss_prism_builder_admin_menu() {
	add_menu_page(
		__( 'RSS Prism Builder', 'rss-prism-builder' ),
		__( 'RSS Prism Builder', 'rss-prism-builder' ),
		'edit_pages',
		'rss-prism-builder',
		'rss_prism_builder_admin_page',
		'dashicons-layout',
		26
	);
}
add_action( 'admin_menu', 'rss_prism_builder_admin_menu' );

function rss_prism_builder_enqueue_admin( $hook ) {
	if ( 'toplevel_page_rss-prism-builder' !== $hook ) {
		return;
	}
	wp_enqueue_media();
	wp_enqueue_style( 'rss-prism-builder', plugin_dir_url( __FILE__ ) . 'assets/builder.css', array(), RSS_PRISM_BUILDER_VERSION );
	wp_enqueue_script( 'rss-prism-builder-modules', plugin_dir_url( __FILE__ ) . 'assets/builder-modules.js', array( 'wp-element' ), RSS_PRISM_BUILDER_VERSION, true );
	wp_enqueue_script( 'rss-prism-builder', plugin_dir_url( __FILE__ ) . 'assets/builder.js', array( 'wp-element', 'rss-prism-builder-modules' ), RSS_PRISM_BUILDER_VERSION, true );
}
add_action( 'admin_enqueue_scripts', 'rss_prism_builder_enqueue_admin' );

function rss_prism_builder_admin_page() {
	if ( ! current_user_can( 'edit_pages' ) ) {
		return;
	}

	if ( isset( $_GET['new_template'] ) && '1' === $_GET['new_template'] && isset( $_GET['_wpnonce'] ) && wp_verify_nonce( sanitize_text_field( wp_unslash( $_GET['_wpnonce'] ) ), 'rss_prism_new_template' ) ) {
		$new_id = wp_insert_post(
			array(
				'post_type'   => 'rss_prism_template',
				'post_title'  => __( 'New Prism Page', 'rss-prism-builder' ),
				'post_status' => 'draft',
			)
		);
		if ( $new_id && ! is_wp_error( $new_id ) ) {
			update_post_meta( $new_id, RSS_PRISM_BUILDER_META_KEY, rss_prism_builder_default_layout() );
			wp_safe_redirect( admin_url( 'admin.php?page=rss-prism-builder&post_id=' . absint( $new_id ) ) );
			exit;
		}
	}

	$templates = get_posts(
		array(
			'post_type'      => 'rss_prism_template',
			'post_status'    => array( 'publish', 'draft' ),
			'posts_per_page' => 50,
			'orderby'        => 'modified',
			'order'          => 'DESC',
		)
	);

	if ( empty( $templates ) ) {
		$first_id = wp_insert_post(
			array(
				'post_type'   => 'rss_prism_template',
				'post_title'  => __( 'My First Prism Page', 'rss-prism-builder' ),
				'post_status' => 'draft',
			)
		);
		if ( $first_id && ! is_wp_error( $first_id ) ) {
			update_post_meta( $first_id, RSS_PRISM_BUILDER_META_KEY, rss_prism_builder_default_layout() );
			$templates = array( get_post( $first_id ) );
		}
	}

	$post_id  = isset( $_GET['post_id'] ) ? absint( $_GET['post_id'] ) : ( ! empty( $templates ) ? $templates[0]->ID : 0 );
	$selected = $post_id ? get_post( $post_id ) : null;
	$layout   = $selected ? get_post_meta( $selected->ID, RSS_PRISM_BUILDER_META_KEY, true ) : array();
	if ( ! is_array( $layout ) ) {
		$layout = rss_prism_builder_default_layout();
	}

	$new_url = wp_nonce_url( admin_url( 'admin.php?page=rss-prism-builder&new_template=1' ), 'rss_prism_new_template' );
	?>
	<script>
		(function(){
			var KEY='rss-prism-builder-theme';
			var saved='';
			try{saved=localStorage.getItem(KEY)||'';}catch(e){}
			var initial=(saved==='dark'||saved==='light')?saved:(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
			document.documentElement.dataset.rpBuilderTheme=initial;
			window.rssPrismSetBuilderTheme=function(next){
				var mode=next==='dark'?'dark':'light';
				document.documentElement.dataset.rpBuilderTheme=mode;
				try{localStorage.setItem(KEY,mode);}catch(e){}
				document.querySelectorAll('[data-rp-theme-choice]').forEach(function(b){
					var on=b.getAttribute('data-rp-theme-choice')===mode;
					b.classList.toggle('is-active',on);
					b.setAttribute('aria-pressed',on?'true':'false');
				});
				window.dispatchEvent(new CustomEvent('rp-builder-theme-change',{detail:{theme:mode}}));
			};
			document.addEventListener('DOMContentLoaded',function(){
				document.body.classList.add('rp-builder-page');
				window.rssPrismSetBuilderTheme(document.documentElement.dataset.rpBuilderTheme||initial);
				document.querySelectorAll('[data-rp-theme-choice]').forEach(function(b){
					b.addEventListener('click',function(){window.rssPrismSetBuilderTheme(b.getAttribute('data-rp-theme-choice'));});
				});
			});
		})();
	</script>
	<div class="wrap rss-prism-admin-wrap">
		<div class="rp-builder-topbar">
			<div class="rp-builder-topbar__left">
				<h1><?php esc_html_e( 'RSS Prism Visual Builder', 'rss-prism-builder' ); ?></h1>
			</div>
			<div class="rp-builder-topbar__right">
				<div class="rp-theme-switch" role="group" aria-label="<?php esc_attr_e( 'Builder interface theme', 'rss-prism-builder' ); ?>">
					<button type="button" class="rp-theme-switch__btn" data-rp-theme-choice="light" aria-pressed="false"><?php esc_html_e( 'Light', 'rss-prism-builder' ); ?></button>
					<button type="button" class="rp-theme-switch__btn" data-rp-theme-choice="dark" aria-pressed="false"><?php esc_html_e( 'Dark', 'rss-prism-builder' ); ?></button>
				</div>
				<a class="button button-primary" href="<?php echo esc_url( $new_url ); ?>"><?php esc_html_e( '+ New Template', 'rss-prism-builder' ); ?></a>
			</div>
		</div>

		<form method="get" class="rss-prism-template-select">
			<input type="hidden" name="page" value="rss-prism-builder">
			<label for="rss-prism-template-id"><?php esc_html_e( 'Choose template', 'rss-prism-builder' ); ?></label>
			<select id="rss-prism-template-id" name="post_id">
				<?php foreach ( $templates as $tpl ) : ?>
					<option value="<?php echo esc_attr( (string) $tpl->ID ); ?>" <?php selected( $selected ? $selected->ID : 0, $tpl->ID ); ?>>
						<?php echo esc_html( $tpl->post_title ); ?>
					</option>
				<?php endforeach; ?>
			</select>
			<button class="button button-primary" type="submit"><?php esc_html_e( 'Load template', 'rss-prism-builder' ); ?></button>
		</form>

		<?php if ( $selected ) : ?>
			<div id="rss-prism-builder-app"></div>
			<script type="application/json" id="rss-prism-builder-data"><?php
				echo wp_json_encode(
					array(
						'postId'     => $selected->ID,
						'layout'     => $layout,
						'nonce'      => wp_create_nonce( 'wp_rest' ),
						'restUrl'    => rest_url( 'rss-prism/v1/layout' ),
						'copyUrl'    => rest_url( 'rss-prism/v1/template-copy' ),
						'publishUrl' => rest_url( 'rss-prism/v1/publish-page' ),
					)
				);
			?></script>
		<?php endif; ?>
	</div>
	<?php
}

function rss_prism_builder_register_rest_routes() {
	register_rest_route(
		'rss-prism/v1',
		'/layout',
		array(
			'methods'             => 'POST',
			'permission_callback' => static function () {
				return current_user_can( 'edit_pages' );
			},
			'callback'            => static function ( WP_REST_Request $request ) {
				$post_id = absint( $request->get_param( 'post_id' ) );
				$post    = get_post( $post_id );
				if ( ! $post || 'rss_prism_template' !== $post->post_type || ! current_user_can( 'edit_post', $post_id ) ) {
					return new WP_REST_Response( array( 'saved' => false, 'message' => __( 'Choose a valid Prism template.', 'rss-prism-builder' ) ), 404 );
				}
				$sanitized = rss_prism_builder_sanitize_layout( $request->get_param( 'layout' ) );
				if ( is_wp_error( $sanitized ) ) {
					return $sanitized;
				}
				update_post_meta( $post_id, RSS_PRISM_BUILDER_META_KEY, $sanitized );
				return new WP_REST_Response( array( 'saved' => true, 'post_id' => $post_id, 'count' => count( $sanitized ) ), 200 );
			},
		)
	);

	register_rest_route(
		'rss-prism/v1',
		'/template-copy',
		array(
			'methods'             => 'POST',
			'permission_callback' => static function () {
				return current_user_can( 'edit_pages' );
			},
			'callback'            => static function ( WP_REST_Request $request ) {
				$title = sanitize_text_field( (string) $request->get_param( 'title' ) );
				if ( '' === $title ) {
					return new WP_REST_Response( array( 'created' => false, 'message' => __( 'Enter a template title.', 'rss-prism-builder' ) ), 400 );
				}
				$sanitized = rss_prism_builder_sanitize_layout( $request->get_param( 'layout' ) );
				if ( is_wp_error( $sanitized ) ) {
					return $sanitized;
				}
				$new_id = wp_insert_post(
					array(
						'post_type'   => 'rss_prism_template',
						'post_title'  => $title,
						'post_status' => 'draft',
					)
				);
				update_post_meta( $new_id, RSS_PRISM_BUILDER_META_KEY, $sanitized );
				return new WP_REST_Response(
					array(
						'created'  => true,
						'post_id'  => $new_id,
						'edit_url' => admin_url( 'admin.php?page=rss-prism-builder&post_id=' . absint( $new_id ) ),
					),
					200
				);
			},
		)
	);

	register_rest_route(
		'rss-prism/v1',
		'/publish-page',
		array(
			'methods'             => 'POST',
			'permission_callback' => static function () {
				return current_user_can( 'publish_pages' );
			},
			'callback'            => static function ( WP_REST_Request $request ) {
				$post_id    = absint( $request->get_param( 'post_id' ) );
				$page_title = sanitize_text_field( (string) $request->get_param( 'page_title' ) );
				if ( ! $post_id || '' === $page_title ) {
					return new WP_REST_Response( array( 'created' => false, 'message' => __( 'Template ID and page title are required.', 'rss-prism-builder' ) ), 400 );
				}
				$sanitized = rss_prism_builder_sanitize_layout( $request->get_param( 'layout' ) );
				if ( is_wp_error( $sanitized ) ) {
					return $sanitized;
				}
				update_post_meta( $post_id, RSS_PRISM_BUILDER_META_KEY, $sanitized );
				$page_id = wp_insert_post(
					array(
						'post_type'    => 'page',
						'post_title'   => $page_title,
						'post_status'  => 'publish',
						'post_content' => '[rss_prism_canvas id="' . absint( $post_id ) . '"]',
					)
				);
				return new WP_REST_Response(
					array(
						'created'     => true,
						'page_id'     => $page_id,
						'page_title'  => $page_title,
						'edit_url'    => get_edit_post_link( $page_id, 'raw' ),
						'preview_url' => get_permalink( $page_id ),
						'message'     => __( 'Page published.', 'rss-prism-builder' ),
					),
					200
				);
			},
		)
	);
}
add_action( 'rest_api_init', 'rss_prism_builder_register_rest_routes' );

function rss_prism_builder_render_shortcode( $atts ) {
	$atts    = shortcode_atts( array( 'id' => 0 ), $atts, 'rss_prism_canvas' );
	$post_id = absint( $atts['id'] );
	if ( ! $post_id ) {
		return '';
	}
	$layout = get_post_meta( $post_id, RSS_PRISM_BUILDER_META_KEY, true );
	if ( ! is_array( $layout ) || empty( $layout ) ) {
		return '';
	}

	$out      = '<div class="rss-prism-canvas-output">';
	$resp_css = '';
	foreach ( $layout as $item ) {
		$type   = isset( $item['type'] ) ? sanitize_key( $item['type'] ) : 'text';
		$text   = isset( $item['text'] ) ? (string) $item['text'] : '';
		$safeid = sanitize_html_class( isset( $item['id'] ) ? $item['id'] : '' );
		$cls    = 'rss-prism-item-' . $safeid . ( ! empty( $item['custom_class'] ) ? ' ' . sanitize_html_class( $item['custom_class'] ) : '' );
		$idattr = ! empty( $item['custom_id'] ) ? ' id="' . esc_attr( $item['custom_id'] ) . '"' : '';

		$bg = '';
		if ( ! empty( $item['bg_gradient_enabled'] ) ) {
			$bg = sprintf(
				'background:linear-gradient(%ddeg,%s,%s);',
				rss_prism_builder_clamp_int( $item['bg_gradient_angle'], 0, 360, 135 ),
				esc_attr( rss_prism_builder_hex( $item['bg_gradient_start'], '#f7f3e8' ) ),
				esc_attr( rss_prism_builder_hex( $item['bg_gradient_end'], '#ffffff' ) )
			);
		} elseif ( ! empty( $item['background'] ) ) {
			$bg = 'background:' . esc_attr( rss_prism_builder_hex( $item['background'], '' ) ) . ';';
		}

		$style = sprintf(
			'padding:%dpx;margin-top:%dpx;margin-bottom:%dpx;border-radius:%dpx;max-width:%d%%;margin-inline:auto;font-size:%dpx;text-align:%s;%s',
			rss_prism_builder_clamp_int( isset( $item['padding'] ) ? $item['padding'] : 24, 0, 200, 24 ),
			rss_prism_builder_clamp_int( isset( $item['margin_top'] ) ? $item['margin_top'] : 0, 0, 200, 0 ),
			rss_prism_builder_clamp_int( isset( $item['margin_bottom'] ) ? $item['margin_bottom'] : 12, 0, 200, 12 ),
			rss_prism_builder_clamp_int( isset( $item['border_radius'] ) ? $item['border_radius'] : 0, 0, 48, 0 ),
			rss_prism_builder_clamp_int( isset( $item['max_width_pct'] ) ? $item['max_width_pct'] : 100, 20, 100, 100 ),
			rss_prism_builder_clamp_int( isset( $item['font_size'] ) ? $item['font_size'] : 16, 10, 96, 16 ),
			esc_attr( isset( $item['align'] ) ? $item['align'] : 'left' ),
			$bg
		);
		if ( ! empty( $item['text_color'] ) ) {
			$style .= 'color:' . esc_attr( rss_prism_builder_hex( $item['text_color'], '' ) ) . ';';
		}
		if ( ! empty( $item['hide_desktop'] ) ) {
			$resp_css .= '@media(min-width:1025px){.rss-prism-item-' . $safeid . '{display:none!important;}}';
		}
		if ( ! empty( $item['hide_tablet'] ) ) {
			$resp_css .= '@media(min-width:641px) and (max-width:1024px){.rss-prism-item-' . $safeid . '{display:none!important;}}';
		}
		if ( ! empty( $item['hide_mobile'] ) ) {
			$resp_css .= '@media(max-width:640px){.rss-prism-item-' . $safeid . '{display:none!important;}}';
		}

		$btn_bg   = rss_prism_builder_hex( isset( $item['button_bg'] ) ? $item['button_bg'] : '#b88a2b', '#b88a2b' );
		$btn_text = rss_prism_builder_hex( isset( $item['button_text'] ) ? $item['button_text'] : '#ffffff', '#ffffff' );
		$btn_rad  = rss_prism_builder_clamp_int( isset( $item['button_radius'] ) ? $item['button_radius'] : 6, 0, 40, 6 );

		if ( 'section' === $type ) {
			$out .= '<section' . $idattr . ' class="rss-prism-canvas-section ' . esc_attr( $cls ) . '" style="' . esc_attr( $style ) . '">' . esc_html( $text ) . '</section>';
		} elseif ( 'heading' === $type ) {
			$out .= '<h2' . $idattr . ' class="rss-prism-canvas-heading ' . esc_attr( $cls ) . '" style="' . esc_attr( $style ) . '">' . esc_html( $text ) . '</h2>';
		} elseif ( 'button' === $type ) {
			$url  = ! empty( $item['url'] ) ? $item['url'] : '#';
			$bcss = 'display:inline-block;background:' . $btn_bg . ';color:' . $btn_text . ';border-radius:' . $btn_rad . 'px;padding:.7rem 1.2rem;text-decoration:none;font-weight:600;';
			$out .= '<p' . $idattr . ' class="' . esc_attr( $cls ) . '" style="' . esc_attr( $style ) . '"><a href="' . esc_url( $url ) . '" style="' . esc_attr( $bcss ) . '">' . esc_html( $text ) . '</a></p>';
		} elseif ( 'image' === $type || 'fullwidth_image' === $type ) {
			if ( ! empty( $item['image_url'] ) ) {
				$w    = 'fullwidth_image' === $type ? 100 : rss_prism_builder_clamp_int( isset( $item['image_width'] ) ? $item['image_width'] : 100, 10, 100, 100 );
				$out .= '<figure' . $idattr . ' class="rss-prism-canvas-image ' . esc_attr( $cls ) . '" style="' . esc_attr( $style ) . '"><img src="' . esc_url( $item['image_url'] ) . '" alt="' . esc_attr( isset( $item['alt'] ) ? $item['alt'] : '' ) . '" loading="lazy" style="width:' . $w . '%;max-width:100%;height:auto;border-radius:8px"></figure>';
			}
		} elseif ( 'gallery' === $type ) {
			$urls = array_filter( array_map( 'rss_prism_builder_url', preg_split( '/\r?\n/', isset( $item['gallery_urls'] ) ? $item['gallery_urls'] : '' ) ) );
			if ( ! empty( $urls ) ) {
				$out .= '<div' . $idattr . ' class="rss-prism-canvas-gallery ' . esc_attr( $cls ) . '" style="' . esc_attr( $style ) . 'display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;">';
				foreach ( array_slice( $urls, 0, 12 ) as $gu ) {
					$out .= '<figure style="margin:0"><img src="' . esc_url( $gu ) . '" alt="" loading="lazy" style="width:100%;height:180px;object-fit:cover;border-radius:8px"></figure>';
				}
				$out .= '</div>';
			}
		} elseif ( 'columns' === $type ) {
			$cnt = rss_prism_builder_clamp_int( isset( $item['columns_count'] ) ? $item['columns_count'] : 2, 1, 3, 2 );
			$out .= '<div' . $idattr . ' class="rss-prism-canvas-columns ' . esc_attr( $cls ) . '" style="' . esc_attr( $style ) . '"><div style="display:grid;grid-template-columns:repeat(' . $cnt . ',minmax(0,1fr));gap:1rem">';
			$cols = isset( $item['column_elements'] ) && is_array( $item['column_elements'] ) ? $item['column_elements'] : array();
			for ( $c = 0; $c < $cnt; $c++ ) {
				$out .= '<div style="padding:1rem;border:1px solid #e2e4e7;border-radius:6px">';
				if ( isset( $cols[ $c ] ) && is_array( $cols[ $c ] ) ) {
					foreach ( $cols[ $c ] as $ch ) {
						$ct = isset( $ch['type'] ) ? $ch['type'] : 'text';
						if ( 'heading' === $ct ) {
							$out .= '<h3>' . esc_html( $ch['text'] ) . '</h3>';
						} elseif ( 'button' === $ct && ! empty( $ch['url'] ) ) {
							$out .= '<p><a href="' . esc_url( $ch['url'] ) . '">' . esc_html( $ch['text'] ) . '</a></p>';
						} elseif ( 'image' === $ct && ! empty( $ch['image_url'] ) ) {
							$out .= '<img src="' . esc_url( $ch['image_url'] ) . '" alt="' . esc_attr( $ch['alt'] ) . '" loading="lazy" style="max-width:100%;height:auto">';
						} else {
							$out .= '<p>' . nl2br( esc_html( isset( $ch['text'] ) ? $ch['text'] : '' ) ) . '</p>';
						}
					}
				}
				$out .= '</div>';
			}
			$out .= '</div></div>';
		} elseif ( 'container' === $type ) {
			$cbg  = rss_prism_builder_hex( isset( $item['container_background'] ) ? $item['container_background'] : '#f7f6f2', '#f7f6f2' );
			$out .= '<div' . $idattr . ' class="rss-prism-canvas-container ' . esc_attr( $cls ) . '" style="' . esc_attr( $style . 'background:' . $cbg . ';border:1px solid #e2e4e7;border-radius:10px;' ) . '">';
			foreach ( (array) ( isset( $item['container_elements'] ) ? $item['container_elements'] : array() ) as $ch ) {
				$out .= '<p>' . esc_html( isset( $ch['text'] ) ? $ch['text'] : '' ) . '</p>';
			}
			$out .= '</div>';
		} elseif ( 'spacer' === $type ) {
			$h    = rss_prism_builder_clamp_int( isset( $item['spacer_height'] ) ? $item['spacer_height'] : 48, 8, 300, 48 );
			$out .= '<div' . $idattr . ' class="rss-prism-canvas-spacer ' . esc_attr( $cls ) . '" aria-hidden="true" style="height:' . $h . 'px"></div>';
		} elseif ( 'divider' === $type ) {
			$dc   = rss_prism_builder_hex( isset( $item['divider_color'] ) ? $item['divider_color'] : '#d9d9d9', '#d9d9d9' );
			$out .= '<hr' . $idattr . ' class="rss-prism-canvas-divider ' . esc_attr( $cls ) . '" style="border:0;border-top:2px solid ' . esc_attr( $dc ) . ';margin:16px 0">';
		} elseif ( 'quote' === $type ) {
			$cite = ! empty( $item['quote_author'] ) ? '<cite style="display:block;margin-top:6px">' . esc_html( $item['quote_author'] ) . '</cite>' : '';
			$out .= '<blockquote' . $idattr . ' class="rss-prism-canvas-quote ' . esc_attr( $cls ) . '" style="' . esc_attr( $style . 'border-left:4px solid #b88a2b;font-style:italic;' ) . '"><p>' . nl2br( esc_html( $text ) ) . '</p>' . $cite . '</blockquote>';
		} elseif ( 'blurb' === $type ) {
			$out .= '<article' . $idattr . ' class="rss-prism-canvas-blurb ' . esc_attr( $cls ) . '" style="' . esc_attr( $style . 'border:1px solid #e5e7eb;' ) . '"><div>' . esc_html( isset( $item['blurb_icon'] ) ? $item['blurb_icon'] : '✦' ) . '</div><h3>' . esc_html( $text ) . '</h3><p>' . nl2br( esc_html( isset( $item['blurb_body'] ) ? $item['blurb_body'] : '' ) ) . '</p></article>';
		} elseif ( 'callout' === $type || 'fullwidth_header' === $type ) {
			$bcss = 'display:inline-block;background:' . $btn_bg . ';color:' . $btn_text . ';border-radius:' . $btn_rad . 'px;padding:.7rem 1.2rem;text-decoration:none;font-weight:700;';
			$desc = 'fullwidth_header' === $type ? ( isset( $item['subtitle'] ) ? $item['subtitle'] : '' ) : ( isset( $item['callout_body'] ) ? $item['callout_body'] : '' );
			$out .= '<section' . $idattr . ' class="rss-prism-canvas-' . esc_attr( $type ) . ' ' . esc_attr( $cls ) . '" style="' . esc_attr( $style ) . '"><h2>' . esc_html( $text ) . '</h2><p>' . nl2br( esc_html( $desc ) ) . '</p><a href="' . esc_url( ! empty( $item['url'] ) ? $item['url'] : '#' ) . '" style="' . esc_attr( $bcss ) . '">' . esc_html( isset( $item['callout_label'] ) ? $item['callout_label'] : 'Get Started' ) . '</a></section>';
		} elseif ( 'accordion' === $type ) {
			$rows = ! empty( $item['accordion_items'] ) ? $item['accordion_items'] : array( array( 'title' => 'Question 1', 'body' => 'Details here.' ) );
			$out .= '<div' . $idattr . ' class="rss-prism-canvas-accordion ' . esc_attr( $cls ) . '" style="' . esc_attr( $style ) . '">';
			foreach ( $rows as $idx => $r ) {
				$out .= '<details style="border:1px solid #e2e8f0;border-radius:8px;margin-bottom:8px;background:#fff;padding:12px"' . ( 0 === $idx ? ' open' : '' ) . '><summary style="font-weight:700;cursor:pointer">' . esc_html( $r['title'] ) . '</summary><p>' . nl2br( esc_html( $r['body'] ) ) . '</p></details>';
			}
			$out .= '</div>';
		} elseif ( 'toggle' === $type ) {
			$open = ! empty( $item['toggle_open'] ) ? ' open' : '';
			$out .= '<details' . $idattr . ' class="rss-prism-canvas-toggle ' . esc_attr( $cls ) . '" style="' . esc_attr( $style . 'border:1px solid #e2e8f0;background:#fff;' ) . '"' . $open . '><summary style="font-weight:700;cursor:pointer">' . esc_html( $text ) . '</summary><p>' . nl2br( esc_html( isset( $item['callout_body'] ) ? $item['callout_body'] : '' ) ) . '</p></details>';
		} elseif ( 'tabs' === $type ) {
			$rows = ! empty( $item['tabs_items'] ) ? $item['tabs_items'] : array( array( 'title' => 'Tab 1', 'body' => 'Content.' ) );
			$out .= '<div' . $idattr . ' class="rss-prism-canvas-tabs ' . esc_attr( $cls ) . '" style="' . esc_attr( $style ) . '">';
			foreach ( $rows as $r ) {
				$out .= '<div style="margin-bottom:10px;padding:12px;border:1px solid #e2e8f0;border-radius:8px;background:#fff"><strong>' . esc_html( $r['title'] ) . '</strong><p style="margin:6px 0 0">' . nl2br( esc_html( $r['body'] ) ) . '</p></div>';
			}
			$out .= '</div>';
		} elseif ( 'pricing_table' === $type ) {
			$feats = array_filter( array_map( 'trim', preg_split( '/\r?\n/', isset( $item['pricing_features'] ) ? $item['pricing_features'] : '' ) ) );
			$bcss  = 'display:inline-block;background:' . $btn_bg . ';color:' . $btn_text . ';border-radius:' . $btn_rad . 'px;padding:.7rem 1.2rem;text-decoration:none;font-weight:700;';
			$out  .= '<article' . $idattr . ' class="rss-prism-canvas-pricing ' . esc_attr( $cls ) . '" style="' . esc_attr( $style . 'border:1px solid #e2e8f0;background:#fff;' ) . '"><h3>' . esc_html( $text ) . '</h3><div style="font-size:2em;font-weight:800">' . esc_html( $item['pricing_currency'] . $item['pricing_price'] ) . ' <small>' . esc_html( $item['pricing_period'] ) . '</small></div><ul>';
			foreach ( $feats as $f ) {
				$out .= '<li>' . esc_html( $f ) . '</li>';
			}
			$out .= '</ul><a href="' . esc_url( ! empty( $item['url'] ) ? $item['url'] : '#' ) . '" style="' . esc_attr( $bcss ) . '">' . esc_html( $item['callout_label'] ) . '</a></article>';
		} elseif ( 'testimonial' === $type || 'person' === $type ) {
			$sub  = 'person' === $type ? ( isset( $item['subtitle'] ) ? $item['subtitle'] : '' ) : ( isset( $item['testimonial_author'] ) ? $item['testimonial_author'] : '' );
			$out .= '<article' . $idattr . ' class="rss-prism-canvas-' . esc_attr( $type ) . ' ' . esc_attr( $cls ) . '" style="' . esc_attr( $style . 'border:1px solid #e2e8f0;background:#fff;' ) . '"><h3>' . esc_html( $text ) . '</h3><div style="font-weight:600;color:' . esc_attr( $btn_bg ) . '">' . esc_html( $sub ) . '</div><p>' . nl2br( esc_html( isset( $item['callout_body'] ) ? $item['callout_body'] : '' ) ) . '</p></article>';
		} elseif ( 'number_counter' === $type ) {
			$out .= '<div' . $idattr . ' class="rss-prism-canvas-counter ' . esc_attr( $cls ) . '" style="' . esc_attr( $style ) . '"><div style="font-size:2.3em;font-weight:800;color:' . esc_attr( $btn_bg ) . '">' . esc_html( $item['counter_prefix'] . $item['counter_number'] . $item['counter_suffix'] ) . '</div><div>' . esc_html( $text ) . '</div></div>';
		} elseif ( 'bar_counter' === $type || 'circle_counter' === $type ) {
			$pct  = rss_prism_builder_clamp_int( isset( $item['bar_percent'] ) ? $item['bar_percent'] : 85, 0, 100, 85 );
			$out .= '<div' . $idattr . ' class="rss-prism-canvas-' . esc_attr( $type ) . ' ' . esc_attr( $cls ) . '" style="' . esc_attr( $style ) . '"><strong>' . esc_html( $text ) . ' (' . $pct . '%)</strong><div style="height:12px;background:' . esc_attr( $item['bar_track_color'] ) . ';border-radius:999px;margin-top:6px;overflow:hidden"><div style="width:' . $pct . '%;height:100%;background:' . esc_attr( $item['bar_color'] ) . '"></div></div></div>';
		} elseif ( 'icon_list' === $type ) {
			$lines = array_filter( array_map( 'trim', preg_split( '/\r?\n/', isset( $item['icon_list_items'] ) ? $item['icon_list_items'] : '' ) ) );
			$out  .= '<ul' . $idattr . ' class="rss-prism-canvas-icon-list ' . esc_attr( $cls ) . '" style="' . esc_attr( $style . 'list-style:none;padding-left:0;' ) . '">';
			foreach ( $lines as $l ) {
				$out .= '<li><span style="color:' . esc_attr( $btn_bg ) . ';font-weight:800">' . esc_html( $item['icon_list_symbol'] ) . '</span> ' . esc_html( $l ) . '</li>';
			}
			$out .= '</ul>';
		} elseif ( 'icon' === $type ) {
			$out .= '<div' . $idattr . ' class="rss-prism-canvas-icon ' . esc_attr( $cls ) . '" style="' . esc_attr( $style ) . '"><span style="display:inline-flex;align-items:center;justify-content:center;width:64px;height:64px;border-radius:50%;background:' . esc_attr( $btn_bg ) . ';color:' . esc_attr( $btn_text ) . ';font-size:32px">' . esc_html( $item['icon_symbol'] ) . '</span>' . ( $text ? '<div style="margin-top:8px;font-weight:700">' . esc_html( $text ) . '</div>' : '' ) . '</div>';
		} elseif ( 'code' === $type || 'fullwidth_code' === $type ) {
			$out .= '<pre' . $idattr . ' class="rss-prism-canvas-' . esc_attr( $type ) . ' ' . esc_attr( $cls ) . '" style="' . esc_attr( $style . 'background:#0f172a;color:#e2e8f0;' ) . '"><code>' . esc_html( isset( $item['code_content'] ) ? $item['code_content'] : $text ) . '</code></pre>';
		} elseif ( 'audio' === $type ) {
			$out .= '<div' . $idattr . ' class="rss-prism-canvas-audio ' . esc_attr( $cls ) . '" style="' . esc_attr( $style ) . '"><strong>' . esc_html( $text ) . '</strong>' . ( ! empty( $item['audio_url'] ) ? '<audio controls src="' . esc_url( $item['audio_url'] ) . '" style="width:100%"></audio>' : '' ) . '</div>';
		} elseif ( 'map' === $type || 'fullwidth_map' === $type ) {
			$out .= '<div' . $idattr . ' class="rss-prism-canvas-' . esc_attr( $type ) . ' ' . esc_attr( $cls ) . '" style="' . esc_attr( $style ) . '"><strong>' . esc_html( isset( $item['map_address'] ) ? $item['map_address'] : $text ) . '</strong><div>Lat ' . esc_html( (string) $item['map_lat'] ) . ', Lng ' . esc_html( (string) $item['map_lng'] ) . '</div></div>';
		} elseif ( 'slider' === $type || 'fullwidth_slider' === $type || 'post_slider' === $type || 'fullwidth_post_slider' === $type ) {
			$slides = ! empty( $item['slides'] ) ? $item['slides'] : array( array( 'title' => $text ?: 'Featured Slide', 'body' => '', 'bg_color' => '#1e293b' ) );
			$out   .= '<div' . $idattr . ' class="rss-prism-canvas-' . esc_attr( $type ) . ' ' . esc_attr( $cls ) . '" style="' . esc_attr( $style ) . '">';
			foreach ( $slides as $s ) {
				$out .= '<div style="background:' . esc_attr( $s['bg_color'] ) . ';color:#fff;padding:28px;border-radius:10px;margin-bottom:8px"><h3>' . esc_html( $s['title'] ) . '</h3><p>' . esc_html( $s['body'] ) . '</p></div>';
			}
			$out .= '</div>';
		} elseif ( 'blog' === $type || 'portfolio' === $type || 'filterable_portfolio' === $type || 'fullwidth_portfolio' === $type || 'shop' === $type ) {
			$cards = ! empty( $item['cards'] ) ? $item['cards'] : array( array( 'title' => 'Sample Item', 'category' => 'General', 'excerpt' => '', 'price' => '$49' ) );
			$out  .= '<div' . $idattr . ' class="rss-prism-canvas-' . esc_attr( $type ) . ' ' . esc_attr( $cls ) . '" style="' . esc_attr( $style ) . 'display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;">';
			foreach ( $cards as $c ) {
				$out .= '<article style="border:1px solid #e2e8f0;border-radius:10px;background:#fff;padding:14px"><small>' . esc_html( $c['category'] ) . '</small><h3>' . esc_html( $c['title'] ) . '</h3>' . ( 'shop' === $type ? '<strong>' . esc_html( $c['price'] ) . '</strong>' : '' ) . '<p>' . esc_html( $c['excerpt'] ) . '</p></article>';
			}
			$out .= '</div>';
		} elseif ( 'woo_product' === $type ) {
			$out .= '<article' . $idattr . ' class="rss-prism-canvas-woo-product ' . esc_attr( $cls ) . '" style="' . esc_attr( $style . 'border:1px solid #e2e8f0;background:#fff;' ) . '"><h3>' . esc_html( $text ) . '</h3><strong>' . esc_html( ! empty( $item['product_sale_price'] ) ? $item['product_sale_price'] : $item['product_price'] ) . '</strong><p>' . esc_html( $item['callout_body'] ) . '</p></article>';
		} elseif ( 'woo_cart' === $type || 'woo_checkout' === $type ) {
			$out .= '<section' . $idattr . ' class="rss-prism-canvas-' . esc_attr( $type ) . ' ' . esc_attr( $cls ) . '" style="' . esc_attr( $style . 'border:1px solid #e2e8f0;background:#fff;' ) . '"><h3>' . esc_html( $text ) . '</h3>';
			foreach ( (array) $item['cart_items'] as $ci ) {
				$out .= '<div>' . esc_html( $ci['name'] ) . ' &times; ' . absint( $ci['qty'] ) . ' — $' . esc_html( number_format_i18n( $ci['qty'] * $ci['price'], 2 ) ) . '</div>';
			}
			$out .= '</section>';
		} else {
			$body_extra = '';
			if ( ! empty( $item['subtitle'] ) ) {
				$body_extra .= '<div style="font-size:.9em;opacity:.8">' . esc_html( $item['subtitle'] ) . '</div>';
			}
			if ( ! empty( $item['callout_body'] ) ) {
				$body_extra .= '<p>' . nl2br( esc_html( $item['callout_body'] ) ) . '</p>';
			}
			if ( ! empty( $item['blurb_body'] ) ) {
				$body_extra .= '<p>' . nl2br( esc_html( $item['blurb_body'] ) ) . '</p>';
			}
			$out .= '<div' . $idattr . ' class="rss-prism-canvas-' . esc_attr( $type ) . ' ' . esc_attr( $cls ) . '" style="' . esc_attr( $style ) . '">' . nl2br( esc_html( $text ) ) . $body_extra . '</div>';
		}
	}
	if ( '' !== $resp_css ) {
		$out .= '<style>' . $resp_css . '</style>';
	}
	return $out . '</div>';
}
add_shortcode( 'rss_prism_canvas', 'rss_prism_builder_render_shortcode' );
