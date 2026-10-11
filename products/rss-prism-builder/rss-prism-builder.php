<?php
/**
 * Plugin Name: RSS Prism Builder
 * Plugin URI: https://www.rsscctvsolution.eu.cc/
 * Description: Free visual page builder. Theme design tools: Dashboard → Appearance → RSS Prism Studio.
 * Version: 0.18.4
 * Requires at least: 6.4
 * Requires PHP: 7.4
 * Author: Razeen Secure Solution
 * License: GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: rss-prism-builder
 * @package RSSPrismBuilder
 */
defined( 'ABSPATH' ) || exit;

require_once __DIR__ . '/includes/auto-updates.php';
define( 'RSS_PRISM_BUILDER_VERSION', '0.18.4' );

function rss_prism_builder_register_templates() {
	register_post_type( 'rss_prism_template', array(
		'labels' => array(
			'name' => __( 'Prism Templates', 'rss-prism-builder' ),
			'singular_name' => __( 'Prism Template', 'rss-prism-builder' ),
			'add_new_item' => __( 'Add New Prism Template', 'rss-prism-builder' ),
			'edit_item' => __( 'Edit Prism Template', 'rss-prism-builder' ),
		),
		'public' => false, 'show_ui' => true, 'show_in_rest' => true,
		'menu_icon' => 'dashicons-layout',
		'supports' => array( 'title', 'editor', 'revisions', 'custom-fields' ),
		'capability_type' => 'post', 'map_meta_cap' => true, 'exclude_from_search' => true,
	) );
}
add_action( 'init', 'rss_prism_builder_register_templates' );

function rss_prism_builder_get_pricing_catalog() {
	$file = __DIR__ . '/includes/pricing-catalog.php';
	if ( ! is_readable( $file ) ) { return array(); }
	$catalog = require $file;
	return is_array( $catalog ) ? $catalog : array();
}
function rss_prism_builder_format_price( $amount, $currency ) {
	$amount = (int) $amount;
	return 'LKR' === $currency ? 'LKR ' . number_format_i18n( $amount ) : '$' . number_format_i18n( $amount );
}
function rss_prism_builder_pricing_shortcode() {
	$catalog = rss_prism_builder_get_pricing_catalog();
	if ( empty( $catalog['plans'] ) ) { return ''; }
	wp_enqueue_style( 'rss-prism-pricing', plugins_url( 'assets/pricing.css', __FILE__ ), array(), RSS_PRISM_BUILDER_VERSION );
	ob_start();
	?>
	<section class="rss-prism-pricing" aria-label="<?php esc_attr_e( 'RSS Prism plans', 'rss-prism-builder' ); ?>">
		<div class="rss-prism-pricing__grid">
			<?php foreach ( $catalog['plans'] as $plan_id => $plan ) : ?>
				<article class="rss-prism-plan rss-prism-plan--<?php echo esc_attr( sanitize_html_class( $plan_id ) ); ?>">
					<h3 class="rss-prism-plan__name"><?php echo esc_html( $plan['name'] ); ?></h3>
					<p class="rss-prism-plan__price"><?php echo esc_html( 'free' === $plan_id ? __( 'Free', 'rss-prism-builder' ) : rss_prism_builder_format_price( $plan['price_usd'], 'USD' ) ); ?>
						<?php if ( 'annual' === $plan['billing'] ) : ?><span><?php esc_html_e( '/ year', 'rss-prism-builder' ); ?></span><?php elseif ( 'one_time' === $plan['billing'] ) : ?><span><?php esc_html_e( 'one-time', 'rss-prism-builder' ); ?></span><?php elseif ( 'free' === $plan['billing'] ) : ?><span><?php esc_html_e( 'Included', 'rss-prism-builder' ); ?></span><?php endif; ?>
					</p>
					<p class="rss-prism-plan__sites"><?php echo esc_html( $plan['site_limit_label'] ); ?></p>
					<ul class="rss-prism-plan__features"><?php foreach ( $plan['features'] as $feature ) : ?><li><?php echo esc_html( $feature ); ?></li><?php endforeach; ?></ul>
				</article>
			<?php endforeach; ?>
		</div>
	</section>
	<?php
	return ob_get_clean();
}
add_shortcode( 'rss_prism_pricing', 'rss_prism_builder_pricing_shortcode' );

function rss_prism_builder_sanitize_layout( $layout ) {
	if ( ! is_array( $layout ) ) { return new WP_Error( 'invalid_layout', __( 'Layout must be a list of elements.', 'rss-prism-builder' ), array( 'status' => 400 ) ); }
	if ( count( $layout ) > 100 ) { return new WP_Error( 'layout_too_large', __( 'A layout may contain at most 100 elements.', 'rss-prism-builder' ), array( 'status' => 400 ) ); }
	$clean = array();
	$allowed = array( 'section', 'heading', 'text', 'button', 'image', 'columns', 'container' );
	foreach ( $layout as $item ) {
		if ( ! is_array( $item ) || empty( $item['type'] ) || ! in_array( $item['type'], $allowed, true ) ) { continue; }
		$padding = isset( $item['padding'] ) ? absint( $item['padding'] ) : 24;
		$clean[] = array(
			'id' => isset( $item['id'] ) ? sanitize_key( $item['id'] ) : wp_generate_uuid4(),
			'type' => sanitize_key( $item['type'] ),
			'text' => isset( $item['text'] ) ? sanitize_textarea_field( $item['text'] ) : '',
			'url' => isset( $item['url'] ) ? esc_url_raw( $item['url'] ) : '',
			'image_url' => isset( $item['image_url'] ) ? esc_url_raw( $item['image_url'] ) : '',
			'alt' => isset( $item['alt'] ) ? sanitize_text_field( $item['alt'] ) : '',
			'button_bg' => isset( $item['button_bg'] ) ? sanitize_hex_color( $item['button_bg'] ) : '#b88a2b',
			'button_text' => isset( $item['button_text'] ) ? sanitize_hex_color( $item['button_text'] ) : '#ffffff',
			'button_radius' => min( 40, absint( $item['button_radius'] ?? 6 ) ),
			'image_width' => min( 100, max( 10, absint( $item['image_width'] ?? 100 ) ) ),
			'columns_count' => min( 3, max( 2, absint( $item['columns_count'] ?? 2 ) ) ),
			'column_contents' => array_map( 'sanitize_textarea_field', array_slice( is_array( $item['column_contents'] ?? null ) ? $item['column_contents'] : array( 'First column content', 'Second column content', 'Third column content' ), 0, 3 ) ),
			'column_elements' => rss_prism_builder_sanitize_column_elements( $item['column_elements'] ?? array(), $item['column_contents'] ?? array(), min( 3, max( 2, absint( $item['columns_count'] ?? 2 ) ) ) ),
			'container_background' => isset( $item['container_background'] ) ? sanitize_hex_color( $item['container_background'] ) : '#f7f6f2',
			'container_elements' => rss_prism_builder_sanitize_container_elements( $item['container_elements'] ?? array() ),
			'background' => isset( $item['background'] ) ? sanitize_hex_color( $item['background'] ) : '',
			'text_color' => isset( $item['text_color'] ) ? sanitize_hex_color( $item['text_color'] ) : '',
			'font_size' => min( 96, max( 10, absint( $item['font_size'] ?? 16 ) ) ),
			'align' => isset( $item['align'] ) && in_array( $item['align'], array( 'left', 'center', 'right' ), true ) ? $item['align'] : 'left',
			'padding' => min( 200, $padding ),
			'responsive' => rss_prism_builder_sanitize_responsive( $item['responsive'] ?? array(), $item ),
		);
	}
	return $clean;
}


function rss_prism_builder_sanitize_column_elements( $column_elements, $legacy_contents, $count ) {
	$clean = array();
	$legacy_contents = is_array( $legacy_contents ) ? $legacy_contents : array();
	for ( $column = 0; $column < $count; $column++ ) {
		$source = is_array( $column_elements ) && isset( $column_elements[ $column ] ) && is_array( $column_elements[ $column ] ) ? $column_elements[ $column ] : array();
		if ( empty( $source ) && isset( $legacy_contents[ $column ] ) && '' !== $legacy_contents[ $column ] ) {
			$source[] = array( 'type' => 'text', 'text' => $legacy_contents[ $column ] );
		}
		$clean[ $column ] = array();
		foreach ( array_slice( $source, 0, 12 ) as $child ) {
			if ( ! is_array( $child ) || empty( $child['type'] ) || ! in_array( $child['type'], array( 'heading', 'text', 'button' ), true ) ) { continue; }
			$clean[ $column ][] = array(
				'id' => isset( $child['id'] ) ? sanitize_key( $child['id'] ) : wp_generate_uuid4(),
				'type' => sanitize_key( $child['type'] ),
				'text' => isset( $child['text'] ) ? sanitize_textarea_field( $child['text'] ) : '',
				'url' => isset( $child['url'] ) ? esc_url_raw( $child['url'] ) : '',
			);
		}
	}
	return $clean;
}

function rss_prism_builder_render_column_element( $child ) {
	$type = $child['type'] ?? 'text';
	$text = esc_html( $child['text'] ?? '' );
	if ( 'heading' === $type ) { return '<h3 class="rss-prism-column-heading">' . $text . '</h3>'; }
	if ( 'button' === $type && ! empty( $child['url'] ) ) { return '<p><a class="rss-prism-column-button" href="' . esc_url( $child['url'] ) . '">' . $text . '</a></p>'; }
	return '<p class="rss-prism-column-text">' . nl2br( $text ) . '</p>';
}


function rss_prism_builder_sanitize_container_elements( $children, $depth = 0 ) {
	$clean = array();
	if ( ! is_array( $children ) ) { return $clean; }
	$allowed = array( 'heading', 'text', 'button', 'image' );
	if ( $depth < 2 ) { $allowed[] = 'container'; }
	foreach ( array_slice( $children, 0, 20 ) as $child ) {
		if ( ! is_array( $child ) || empty( $child['type'] ) || ! in_array( $child['type'], $allowed, true ) ) { continue; }
		$type = sanitize_key( $child['type'] );
		$entry = array(
			'id' => isset( $child['id'] ) ? sanitize_key( $child['id'] ) : wp_generate_uuid4(),
			'type' => $type,
			'text' => isset( $child['text'] ) ? sanitize_textarea_field( $child['text'] ) : '',
			'url' => isset( $child['url'] ) ? esc_url_raw( $child['url'] ) : '',
			'image_url' => isset( $child['image_url'] ) ? esc_url_raw( $child['image_url'] ) : '',
			'alt' => isset( $child['alt'] ) ? sanitize_text_field( $child['alt'] ) : '',
		);
		if ( 'container' === $type ) {
			$entry['container_background'] = isset( $child['container_background'] ) ? ( sanitize_hex_color( $child['container_background'] ) ?: '#f7f6f2' ) : '#f7f6f2';
			$entry['container_elements'] = rss_prism_builder_sanitize_container_elements( $child['container_elements'] ?? array(), $depth + 1 );
		}
		$clean[] = $entry;
	}
	return $clean;
}
function rss_prism_builder_render_container_element( $child, $depth = 0 ) {
	$text = esc_html( $child['text'] ?? '' );
	$type = $child['type'] ?? 'text';
	if ( 'container' === $type && $depth < 2 ) {
		$background = sanitize_hex_color( $child['container_background'] ?? '#f7f6f2' ) ?: '#f7f6f2';
		$out = '<div class="rss-prism-canvas-container rss-prism-canvas-container--nested" style="background:' . esc_attr( $background ) . ';border:1px solid #e2e4e7;border-radius:8px;padding:12px;margin:12px 0;">';
		foreach ( rss_prism_builder_sanitize_container_elements( $child['container_elements'] ?? array(), $depth + 1 ) as $nested ) {
			$out .= rss_prism_builder_render_container_element( $nested, $depth + 1 );
		}
		return $out . '</div>';
	}
	if ( 'heading' === $type ) { return '<h3 class="rss-prism-container-heading">' . $text . '</h3>'; }
	if ( 'button' === $type && ! empty( $child['url'] ) ) { return '<p><a class="rss-prism-container-button" href="' . esc_url( $child['url'] ) . '">' . $text . '</a></p>'; }
	if ( 'image' === $type && ! empty( $child['image_url'] ) ) { return '<figure class="rss-prism-container-image"><img src="' . esc_url( $child['image_url'] ) . '" alt="' . esc_attr( $child['alt'] ?? '' ) . '" loading="lazy" decoding="async"></figure>'; }
	return '<p class="rss-prism-container-text">' . nl2br( $text ) . '</p>';
}

function rss_prism_builder_sanitize_responsive( $responsive, $item ) {
	$clean = array();
	foreach ( array( 'desktop', 'tablet', 'mobile' ) as $device ) {
		$source = isset( $responsive[ $device ] ) && is_array( $responsive[ $device ] ) ? $responsive[ $device ] : array();
		$clean[ $device ] = array(
			'font_size' => min( 96, max( 10, absint( $source['font_size'] ?? $item['font_size'] ?? 16 ) ) ),
			'padding' => min( 200, absint( $source['padding'] ?? $item['padding'] ?? 24 ) ),
			'align' => isset( $source['align'] ) && in_array( $source['align'], array( 'left', 'center', 'right' ), true ) ? $source['align'] : ( isset( $item['align'] ) && in_array( $item['align'], array( 'left', 'center', 'right' ), true ) ? $item['align'] : 'left' ),
		);
	}
	return $clean;
}

function rss_prism_builder_rest_can_edit_template( $request ) {
	if ( ! is_user_logged_in() || ! current_user_can( 'edit_posts' ) ) {
		return new WP_Error( 'rest_forbidden', __( 'You do not have permission to use RSS Prism Builder.', 'rss-prism-builder' ), array( 'status' => 403 ) );
	}
	$post_id = absint( $request->get_param( 'post_id' ) );
	$post = $post_id ? get_post( $post_id ) : null;
	if ( ! $post || 'rss_prism_template' !== $post->post_type || ! current_user_can( 'edit_post', $post_id ) ) {
		return new WP_Error( 'rest_forbidden_template', __( 'You cannot edit this Prism template.', 'rss-prism-builder' ), array( 'status' => 403 ) );
	}
	$body = $request->get_body();
	if ( strlen( $body ) > 1048576 ) {
		return new WP_Error( 'rss_prism_payload_too_large', __( 'The layout request exceeds the 1 MB safety limit.', 'rss-prism-builder' ), array( 'status' => 413 ) );
	}
	$rate_key = 'rss_prism_builder_rate_' . get_current_user_id();
	$rate = get_transient( $rate_key );
	if ( ! is_array( $rate ) || empty( $rate['started'] ) || ( time() - (int) $rate['started'] ) >= MINUTE_IN_SECONDS ) {
		$rate = array( 'count' => 0, 'started' => time() );
	}
	if ( (int) $rate['count'] >= 120 ) {
		return new WP_Error( 'rss_prism_rate_limited', __( 'Too many builder requests. Wait a minute and try again.', 'rss-prism-builder' ), array( 'status' => 429 ) );
	}
	$rate['count'] = (int) $rate['count'] + 1;
	set_transient( $rate_key, $rate, max( 1, MINUTE_IN_SECONDS - ( time() - (int) $rate['started'] ) ) );
	return true;
}

/**
 * Server-side feature allowlist. Unknown and future premium features stay disabled
 * until a verified licensing service is implemented; browser flags are never trusted.
 */
function rss_prism_builder_feature_is_available( $feature ) {
	$free_features = array(
		'visual_builder', 'starter_layouts', 'media_library_images', 'responsive_preview',
		'undo_redo', 'json_import_export', 'autosave', 'restore_history', 'nested_containers',
	);
	return in_array( sanitize_key( $feature ), $free_features, true );
}

function rss_prism_builder_register_rest_routes() {
	register_rest_route( 'rss-prism/v1', '/template-copy', array(
		'methods' => WP_REST_Server::CREATABLE,
		'callback' => 'rss_prism_builder_copy_template',
		'permission_callback' => 'rss_prism_builder_rest_can_edit_template',
		'args' => array(
			'post_id' => array( 'required' => true, 'type' => 'integer', 'sanitize_callback' => 'absint' ),
			'title' => array( 'required' => true, 'type' => 'string', 'sanitize_callback' => 'sanitize_text_field' ),
			'layout' => array( 'required' => true, 'type' => 'array' ),
		),
	) );
	register_rest_route( 'rss-prism/v1', '/layout', array(
		'methods' => WP_REST_Server::CREATABLE,
		'callback' => 'rss_prism_builder_save_layout',
		'permission_callback' => 'rss_prism_builder_rest_can_edit_template',
		'args' => array(
			'post_id' => array( 'required' => true, 'type' => 'integer', 'sanitize_callback' => 'absint' ),
			'layout' => array( 'required' => true, 'type' => 'array' ),
		),
	) );
}
add_action( 'rest_api_init', 'rss_prism_builder_register_rest_routes' );

function rss_prism_builder_copy_template( WP_REST_Request $request ) {
	$source_id = absint( $request->get_param( 'post_id' ) );
	$source = get_post( $source_id );
	if ( ! $source || 'rss_prism_template' !== $source->post_type || ! current_user_can( 'edit_post', $source_id ) ) {
		return new WP_Error( 'invalid_source_template', __( 'Choose a template you are allowed to edit.', 'rss-prism-builder' ), array( 'status' => 403 ) );
	}
	$title = sanitize_text_field( $request->get_param( 'title' ) );
	if ( '' === $title ) { return new WP_Error( 'missing_template_title', __( 'Enter a name for the new template.', 'rss-prism-builder' ), array( 'status' => 400 ) ); }
	$layout = rss_prism_builder_sanitize_layout( $request->get_param( 'layout' ) );
	if ( is_wp_error( $layout ) ) { return $layout; }
	$new_id = wp_insert_post( array( 'post_type' => 'rss_prism_template', 'post_status' => 'draft', 'post_title' => $title, 'post_content' => '', 'post_author' => get_current_user_id() ), true );
	if ( is_wp_error( $new_id ) ) { return $new_id; }
	update_post_meta( $new_id, '_rss_prism_layout', $layout );
	return rest_ensure_response( array( 'created' => true, 'post_id' => $new_id, 'edit_url' => add_query_arg( array( 'page' => 'rss-prism-builder', 'post_id' => $new_id ), admin_url( 'admin.php' ) ) ) );
}

function rss_prism_builder_save_layout( WP_REST_Request $request ) {
	$post_id = absint( $request->get_param( 'post_id' ) );
	$post = get_post( $post_id );
	if ( ! $post || 'rss_prism_template' !== $post->post_type ) {
		return new WP_Error( 'invalid_template', __( 'Choose a valid Prism template first.', 'rss-prism-builder' ), array( 'status' => 404 ) );
	}
	if ( ! current_user_can( 'edit_post', $post_id ) ) {
		return new WP_Error( 'forbidden', __( 'You cannot edit this template.', 'rss-prism-builder' ), array( 'status' => 403 ) );
	}
	$layout = rss_prism_builder_sanitize_layout( $request->get_param( 'layout' ) );
	if ( is_wp_error( $layout ) ) { return $layout; }
	update_post_meta( $post_id, '_rss_prism_layout', $layout );
	return rest_ensure_response( array( 'saved' => true, 'post_id' => $post_id, 'count' => count( $layout ) ) );
}

function rss_prism_builder_render_canvas_shortcode( $atts ) {
	$atts = shortcode_atts( array( 'id' => 0 ), $atts, 'rss_prism_canvas' );
	$post_id = absint( $atts['id'] );
	$post = get_post( $post_id );
	if ( ! $post || 'rss_prism_template' !== $post->post_type || 'publish' !== $post->post_status ) { return ''; }
	$layout = get_post_meta( $post_id, '_rss_prism_layout', true );
	if ( ! is_array( $layout ) ) { return ''; }
	$out = '<div class="rss-prism-canvas-output">';
	$responsive_css = '';
	foreach ( $layout as $item ) {
		$type = isset( $item['type'] ) ? $item['type'] : '';
		$text = isset( $item['text'] ) ? $item['text'] : '';
		$safe_id = isset( $item['id'] ) ? sanitize_html_class( $item['id'] ) : '';
		$responsive = rss_prism_builder_sanitize_responsive( $item['responsive'] ?? array(), $item );
		$style = 'padding:' . min( 200, absint( $item['padding'] ?? 24 ) ) . 'px;';
		if ( $safe_id ) {
			foreach ( array( 'desktop' => '', 'tablet' => '@media (max-width: 1024px){', 'mobile' => '@media (max-width: 640px){' ) as $device => $prefix ) {
				$s = $responsive[ $device ];
				$rule = '.rss-prism-item-' . $safe_id . '{font-size:' . $s['font_size'] . 'px!important;padding:' . $s['padding'] . 'px!important;text-align:' . $s['align'] . '!important;}';
				$responsive_css .= $prefix . $rule . ( '' !== $prefix ? '}' : '' );
			}
		}
		$style .= 'font-size:' . min( 96, max( 10, absint( $item['font_size'] ?? 16 ) ) ) . 'px;text-align:' . ( in_array( $item['align'] ?? 'left', array( 'left', 'center', 'right' ), true ) ? $item['align'] : 'left' ) . ';';
		if ( ! empty( $item['background'] ) && sanitize_hex_color( $item['background'] ) ) { $style .= 'background:' . sanitize_hex_color( $item['background'] ) . ';'; }
		if ( ! empty( $item['text_color'] ) && sanitize_hex_color( $item['text_color'] ) ) { $style .= 'color:' . sanitize_hex_color( $item['text_color'] ) . ';' ; }
		if ( 'section' === $type ) {
			$out .= '<section class="rss-prism-canvas-section ' . esc_attr( 'rss-prism-item-' . $safe_id ) . '" style="' . esc_attr( $style ) . '">' . esc_html( $text ) . '</section>';
		} elseif ( 'heading' === $type ) {
			$out .= '<h2 class="rss-prism-canvas-heading ' . esc_attr( 'rss-prism-item-' . $safe_id ) . '" style="' . esc_attr( $style ) . '">' . esc_html( $text ) . '</h2>';
		} elseif ( 'text' === $type ) {
			$out .= '<p class="rss-prism-canvas-text ' . esc_attr( 'rss-prism-item-' . $safe_id ) . '" style="' . esc_attr( $style ) . '">' . nl2br( esc_html( $text ) ) . '</p>';
		} elseif ( 'button' === $type && ! empty( $item['url'] ) ) {
			$button_style = 'display:inline-block;background:' . ( sanitize_hex_color( $item['button_bg'] ?? '#b88a2b' ) ?: '#b88a2b' ) . ';color:' . ( sanitize_hex_color( $item['button_text'] ?? '#ffffff' ) ?: '#ffffff' ) . ';border-radius:' . min( 40, absint( $item['button_radius'] ?? 6 ) ) . 'px;padding:.7rem 1.1rem;text-decoration:none;';
			$out .= '<p class="' . esc_attr( 'rss-prism-item-' . $safe_id ) . '" style="' . esc_attr( $style ) . '"><a class="rss-prism-canvas-button" style="' . esc_attr( $button_style ) . '" href="' . esc_url( $item['url'] ) . '">' . esc_html( $text ) . '</a></p>';
		} elseif ( 'columns' === $type ) {
			$count = min( 3, max( 2, absint( $item['columns_count'] ?? 2 ) ) );
			$contents = is_array( $item['column_contents'] ?? null ) ? $item['column_contents'] : array();
			$column_elements = rss_prism_builder_sanitize_column_elements( $item['column_elements'] ?? array(), $contents, $count );
			$out .= '<div class="rss-prism-canvas-columns ' . esc_attr( 'rss-prism-item-' . $safe_id ) . '" style="' . esc_attr( $style ) . '"><div class="rss-prism-columns-grid" style="display:grid;grid-template-columns:repeat(' . $count . ',minmax(0,1fr));gap:1rem">';
			for ( $column = 0; $column < $count; $column++ ) {
				$out .= '<div class="rss-prism-column-cell" style="padding:1rem;border:1px solid #e2e4e7;border-radius:6px;overflow-wrap:anywhere">';
				foreach ( $column_elements[ $column ] ?? array() as $child ) { $out .= rss_prism_builder_render_column_element( $child ); }
				$out .= '</div>';
			}
			$out .= '</div></div>';
		} elseif ( 'container' === $type ) {
			$container_bg = sanitize_hex_color( $item['container_background'] ?? '#f7f6f2' ) ?: '#f7f6f2';
			$out .= '<div class="rss-prism-canvas-container ' . esc_attr( 'rss-prism-item-' . $safe_id ) . '" style="' . esc_attr( $style . 'background:' . $container_bg . ';border:1px solid #e2e4e7;border-radius:10px;' ) . '">';
			foreach ( rss_prism_builder_sanitize_container_elements( $item['container_elements'] ?? array() ) as $child ) { $out .= rss_prism_builder_render_container_element( $child ); }
			$out .= '</div>';
		} elseif ( 'image' === $type && ! empty( $item['image_url'] ) ) {
			$out .= '<figure class="rss-prism-canvas-image ' . esc_attr( 'rss-prism-item-' . $safe_id ) . '" style="' . esc_attr( $style ) . '"><img src="' . esc_url( $item['image_url'] ) . '" alt="' . esc_attr( $item['alt'] ?? '' ) . '" loading="lazy" decoding="async" style="display:block;width:' . min( 100, max( 10, absint( $item['image_width'] ?? 100 ) ) ) . '%;max-width:100%;height:auto;margin-inline:auto"></figure>';
		}
	}
	if ( $responsive_css ) { $out .= '<style>' . $responsive_css . '@media(max-width:640px){.rss-prism-canvas-columns .rss-prism-columns-grid{grid-template-columns:1fr!important}}</style>'; } else { $out .= '<style>@media(max-width:640px){.rss-prism-canvas-columns .rss-prism-columns-grid{grid-template-columns:1fr!important}}</style>'; }
	return $out . '</div>';
}
add_shortcode( 'rss_prism_canvas', 'rss_prism_builder_render_canvas_shortcode' );

function rss_prism_builder_activate() {
	set_transient( 'rss_prism_builder_welcome_redirect_' . get_current_user_id(), 1, 90 );
}
register_activation_hook( __FILE__, 'rss_prism_builder_activate' );

function rss_prism_builder_welcome_redirect() {
	if ( ! is_admin() || wp_doing_ajax() || ! current_user_can( 'edit_posts' ) ) { return; }
	$key = 'rss_prism_builder_welcome_redirect_' . get_current_user_id();
	if ( ! get_transient( $key ) ) { return; }
	delete_transient( $key );
	$page = isset( $_GET['page'] ) ? sanitize_key( wp_unslash( $_GET['page'] ) ) : '';
	if ( 'rss-prism-builder-welcome' !== $page ) {
		wp_safe_redirect( admin_url( 'admin.php?page=rss-prism-builder-welcome' ) );
		exit;
	}
}
add_action( 'admin_init', 'rss_prism_builder_welcome_redirect', 20 );

function rss_prism_builder_render_welcome_page() {
	if ( ! current_user_can( 'edit_posts' ) ) { return; }
	$free_features = array(
		__( 'Visual drag-and-drop layout editor', 'rss-prism-builder' ),
		__( 'Sections, headings, text, buttons, images, columns and nested containers', 'rss-prism-builder' ),
		__( 'Six RSS starter layouts: business, services, about, projects, security and contact', 'rss-prism-builder' ),
		__( 'WordPress Media Library image picker and accessible alt text', 'rss-prism-builder' ),
		__( 'Desktop, tablet and mobile-width preview controls', 'rss-prism-builder' ),
		__( 'Automatic saving with visible save status', 'rss-prism-builder' ),
		__( 'Undo, redo, JSON import/export and browser recovery history', 'rss-prism-builder' ),
		__( 'Reusable draft templates and searchable template library', 'rss-prism-builder' ),
		__( 'Free RSS Prism theme controls for colours, content width, headers, footers and archives', 'rss-prism-builder' ),
	);
	$planned_features = array(
		__( 'Expanded premium widget and block library', 'rss-prism-builder' ),
		__( 'Global design systems and reusable style presets', 'rss-prism-builder' ),
		__( 'Advanced responsive and layout controls', 'rss-prism-builder' ),
		__( 'Cloud template library and synced patterns', 'rss-prism-builder' ),
		__( 'Premium template kits and advanced workflow tools', 'rss-prism-builder' ),
	);
	?>
	<div class="wrap rss-prism-admin-wrap rss-prism-welcome">
		<div class="rss-prism-welcome-hero">
			<p class="rss-prism-welcome-eyebrow"><?php esc_html_e( 'RAZEEN SECURE SOLUTION', 'rss-prism-builder' ); ?></p>
			<h1><?php esc_html_e( 'Welcome to RSS Prism Builder', 'rss-prism-builder' ); ?></h1>
			<p class="rss-prism-welcome-tagline"><?php esc_html_e( 'Developing Ideas. Delivering Solutions.', 'rss-prism-builder' ); ?></p>
			<p><?php esc_html_e( 'Build responsive business pages with RSS starter layouts, visual editing, images, nested content, autosave and recovery tools.', 'rss-prism-builder' ); ?></p>
			<div class="rss-prism-welcome-actions">
				<a class="button button-primary button-hero" href="<?php echo esc_url( admin_url( 'admin.php?page=rss-prism-builder' ) ); ?>"><?php esc_html_e( 'Open Visual Builder', 'rss-prism-builder' ); ?></a>
				<a class="button button-hero" href="<?php echo esc_url( admin_url( 'post-new.php?post_type=rss_prism_template' ) ); ?>"><?php esc_html_e( 'Create a template', 'rss-prism-builder' ); ?></a>
			</div>
			<div class="notice notice-info inline" style="margin:20px 0 0;padding:10px 14px">
				<p><strong><?php esc_html_e( 'Looking for header and footer design?', 'rss-prism-builder' ); ?></strong>
				<?php esc_html_e( 'Open Dashboard → Appearance → RSS Prism Studio to customise your logo, header rows, navigation, footer layout and responsive preview. You do not need a licence server to design your website.', 'rss-prism-builder' ); ?>
				<a href="<?php echo esc_url( admin_url( 'themes.php?page=rss-prism-studio' ) ); ?>"><?php esc_html_e( 'Open RSS Prism Studio', 'rss-prism-builder' ); ?></a></p>
			</div>
		</div>
		<div class="rss-prism-welcome-section">
			<h2><?php esc_html_e( 'Free features included', 'rss-prism-builder' ); ?></h2>
			<p><?php esc_html_e( 'The current release is free. These features are available without a license key, payment, or licence-server configuration. Header and footer design is available at Dashboard → Appearance → RSS Prism Studio when the RSS Prism theme is active.', 'rss-prism-builder' ); ?></p>
			<ul class="rss-prism-feature-grid">
				<?php foreach ( $free_features as $feature ) : ?><li><span aria-hidden="true">✓</span><?php echo esc_html( $feature ); ?></li><?php endforeach; ?>
			</ul>
		</div>
		<div class="rss-prism-welcome-section rss-prism-premium-section">
			<h2><?php esc_html_e( 'Premium roadmap', 'rss-prism-builder' ); ?> <span class="rss-prism-feature-label"><?php esc_html_e( 'PLANNED — NOT AVAILABLE YET', 'rss-prism-builder' ); ?></span></h2>
			<p><?php esc_html_e( 'These are planned ideas, not active features or offers. Premium licensing and checkout are not implemented, and there is no browser-side switch to unlock them.', 'rss-prism-builder' ); ?></p>
			<ul class="rss-prism-feature-grid">
				<?php foreach ( $planned_features as $feature ) : ?><li><span aria-hidden="true">◷</span><?php echo esc_html( $feature ); ?></li><?php endforeach; ?>
			</ul>
			<p class="description"><?php esc_html_e( 'No premium price is being advertised. The current product catalog remains Free-only.', 'rss-prism-builder' ); ?></p>
		</div>
		<div class="rss-prism-welcome-section rss-prism-security-section">
			<h2><?php esc_html_e( 'Security and recovery', 'rss-prism-builder' ); ?></h2>
			<ul>
				<li><?php esc_html_e( 'WordPress login, REST nonce validation and per-template edit permissions protect builder save actions.', 'rss-prism-builder' ); ?></li>
				<li><?php esc_html_e( 'Layout input is sanitized on the server; oversized REST payloads and excessive requests are rejected.', 'rss-prism-builder' ); ?></li>
				<li><?php esc_html_e( 'Unknown features default to unavailable in the server-side feature allowlist.', 'rss-prism-builder' ); ?></li>
				<li><?php esc_html_e( 'Export JSON backups before major edits. Browser recovery history can be removed when browser data is cleared.', 'rss-prism-builder' ); ?></li>
			</ul>
			<p class="description"><?php esc_html_e( 'Security is layered, not absolute. Keep WordPress, PHP, plugins and backups up to date, use strong administrator authentication, and test updates on staging.', 'rss-prism-builder' ); ?></p>
		</div>
	</div>
	<?php
}

function rss_prism_builder_admin_menu() {
	add_menu_page( __( 'RSS Prism Builder', 'rss-prism-builder' ), __( 'Prism Builder', 'rss-prism-builder' ), 'edit_posts', 'rss-prism-builder', 'rss_prism_builder_render_admin_page', 'dashicons-layout', 58 );
}
add_action( 'admin_menu', 'rss_prism_builder_admin_menu' );

function rss_prism_builder_welcome_submenu() {
	add_submenu_page( 'rss-prism-builder', __( 'Welcome to RSS Prism', 'rss-prism-builder' ), __( 'Welcome & Features', 'rss-prism-builder' ), 'edit_posts', 'rss-prism-builder-welcome', 'rss_prism_builder_render_welcome_page' );
}
add_action( 'admin_menu', 'rss_prism_builder_welcome_submenu', 20 );

function rss_prism_builder_render_admin_page() {
	if ( ! current_user_can( 'edit_posts' ) ) { return; }

	// Create a draft directly into the visual builder instead of sending users to
	// the default WordPress post editor, which previously left the builder empty.
	if ( isset( $_GET['rss_prism_new_template'] ) && '1' === $_GET['rss_prism_new_template'] ) {
		check_admin_referer( 'rss_prism_new_template' );
		$new_id = wp_insert_post( array(
			'post_type' => 'rss_prism_template',
			'post_status' => 'draft',
			'post_title' => __( 'New Prism Page', 'rss-prism-builder' ),
			'post_content' => '',
			'post_author' => get_current_user_id(),
		), true );
		if ( ! is_wp_error( $new_id ) ) {
			update_post_meta( $new_id, '_rss_prism_layout', array() );
			wp_safe_redirect( add_query_arg( array( 'page' => 'rss-prism-builder', 'post_id' => $new_id ), admin_url( 'admin.php' ) ) );
			exit;
		}
		echo '<div class="notice notice-error"><p>' . esc_html__( 'Could not create a new Prism page. Please try again.', 'rss-prism-builder' ) . '</p></div>';
	}
	$template_search = isset( $_GET['template_search'] ) ? sanitize_text_field( wp_unslash( $_GET['template_search'] ) ) : '';
	$template_query = array( 'post_type' => 'rss_prism_template', 'post_status' => array( 'publish', 'draft', 'pending', 'private' ), 'numberposts' => 100, 'orderby' => 'modified', 'order' => 'DESC' );
	if ( '' !== $template_search ) { $template_query['s'] = $template_search; }
	$templates = get_posts( $template_query );
	// If templates already exist, load the most recently modified one by default.
	// Without this, returning users can see only the template picker and an empty editor.
	$requested_id = isset( $_GET['post_id'] ) ? absint( $_GET['post_id'] ) : 0;
	if ( ! $requested_id && '' === $template_search && ! empty( $templates ) ) {
		wp_safe_redirect( add_query_arg( array( 'page' => 'rss-prism-builder', 'post_id' => absint( $templates[0]->ID ) ), admin_url( 'admin.php' ) ) );
		exit;
	}
	// On a fresh installation, create the first draft automatically so opening
	// Prism Builder always opens the actual editor instead of an empty screen.
	if ( empty( $templates ) && '' === $template_search && ! $requested_id && ! isset( $_GET['rss_prism_new_template'] ) ) {
		$first_id = wp_insert_post( array(
			'post_type' => 'rss_prism_template',
			'post_status' => 'draft',
			'post_title' => __( 'My First Prism Page', 'rss-prism-builder' ),
			'post_content' => '',
			'post_author' => get_current_user_id(),
		), true );
		if ( ! is_wp_error( $first_id ) ) {
			update_post_meta( $first_id, '_rss_prism_layout', array() );
			wp_safe_redirect( add_query_arg( array( 'page' => 'rss-prism-builder', 'post_id' => $first_id ), admin_url( 'admin.php' ) ) );
			exit;
		}
	}
	$selected_id = isset( $_GET['post_id'] ) ? absint( $_GET['post_id'] ) : 0;
	$selected = $selected_id ? get_post( $selected_id ) : null;
	if ( ! $selected || 'rss_prism_template' !== $selected->post_type || ! current_user_can( 'edit_post', $selected_id ) ) { $selected_id = 0; $selected = null; }
	$layout = $selected ? get_post_meta( $selected_id, '_rss_prism_layout', true ) : array();
	if ( ! is_array( $layout ) ) { $layout = array(); }
	?>
	<div class="wrap rss-prism-admin-wrap">
		<h1><?php esc_html_e( 'RSS Prism Builder', 'rss-prism-builder' ); ?></h1>
		<p><?php esc_html_e( 'Build a starter layout with draggable elements. This is an early builder MVP, not the complete visual editor.', 'rss-prism-builder' ); ?></p>
		<div class="rss-prism-live-test-guide">
			<h2><?php esc_html_e( 'Live WordPress test checklist', 'rss-prism-builder' ); ?></h2>
			<ol>
				<li><?php esc_html_e( 'Create or load a draft template and save the layout.', 'rss-prism-builder' ); ?></li>
				<li><?php esc_html_e( 'Open the template in Prism Templates and publish it when you are ready to test publicly.', 'rss-prism-builder' ); ?></li>
				<li><?php esc_html_e( 'Add the shortcode shown after saving to a test WordPress page: [rss_prism_canvas id="TEMPLATE_ID"] (replace TEMPLATE_ID with the template ID).', 'rss-prism-builder' ); ?></li>
				<li><?php esc_html_e( 'Preview the page on desktop and mobile, then test buttons, images, nested containers, and saving again.', 'rss-prism-builder' ); ?></li>
			</ol>
			<p><?php esc_html_e( 'Recommended: use a staging site or a private test page before publishing changes on a live business website.', 'rss-prism-builder' ); ?></p>
		</div>
		<p><a class="button button-primary button-hero" href="<?php echo esc_url( wp_nonce_url( add_query_arg( array( 'page' => 'rss-prism-builder', 'rss_prism_new_template' => '1' ), admin_url( 'admin.php' ) ), 'rss_prism_new_template' ) ); ?>"><?php esc_html_e( '＋ Create new page in Builder', 'rss-prism-builder' ); ?></a> <a class="button" href="<?php echo esc_url( admin_url( 'edit.php?post_type=rss_prism_template' ) ); ?>"><?php esc_html_e( 'Manage templates', 'rss-prism-builder' ); ?></a></p>
		<form method="get" class="rss-prism-template-select">
			<input type="hidden" name="page" value="rss-prism-builder">
			<label for="rss-prism-template-search"><?php esc_html_e( 'Search templates', 'rss-prism-builder' ); ?></label>
			<input type="search" id="rss-prism-template-search" name="template_search" value="<?php echo esc_attr( $template_search ); ?>" placeholder="<?php esc_attr_e( 'Search by template title…', 'rss-prism-builder' ); ?>">
			<button class="button"><?php esc_html_e( 'Search', 'rss-prism-builder' ); ?></button>
			<?php if ( '' !== $template_search ) : ?><a class="button" href="<?php echo esc_url( admin_url( 'admin.php?page=rss-prism-builder' ) ); ?>"><?php esc_html_e( 'Clear', 'rss-prism-builder' ); ?></a><?php endif; ?>
			<label for="rss-prism-template-id"><?php esc_html_e( 'Choose template', 'rss-prism-builder' ); ?></label>
			<select id="rss-prism-template-id" name="post_id">
				<option value="0"><?php esc_html_e( 'Select a template…', 'rss-prism-builder' ); ?></option>
				<?php foreach ( $templates as $template ) : $status_object = get_post_status_object( $template->post_status ); $status_label = $status_object ? $status_object->label : $template->post_status; ?>
					<option value="<?php echo esc_attr( $template->ID ); ?>" <?php selected( $selected_id, $template->ID ); ?>><?php echo esc_html( ( $template->post_title ? $template->post_title : '(Untitled template #' . $template->ID . ')' ) . ' — ' . $status_label ); ?></option>
				<?php endforeach; ?>
			</select>
			<button class="button button-primary"><?php esc_html_e( 'Load template', 'rss-prism-builder' ); ?></button>
		</form>
		<p class="description"><?php echo esc_html( sprintf( _n( '%d matching template found.', '%d matching templates found.', count( $templates ), 'rss-prism-builder' ), count( $templates ) ) ); ?> <?php esc_html_e( 'Draft templates remain separate from published pages; use “Save as new draft template” to make a safe copy.', 'rss-prism-builder' ); ?></p>
		<?php if ( '' !== $template_search && ! $templates ) : ?><div class="notice notice-warning inline"><p><?php esc_html_e( 'No templates matched that search. Try another title or clear the search.', 'rss-prism-builder' ); ?></p></div><?php endif; ?>
		<?php if ( $selected ) : ?>
			<div id="rss-prism-builder-app"></div>
			<script type="application/json" id="rss-prism-builder-data"><?php echo wp_json_encode( array( 'postId' => $selected_id, 'layout' => array_values( $layout ), 'nonce' => wp_create_nonce( 'wp_rest' ), 'restUrl' => esc_url_raw( rest_url( 'rss-prism/v1/layout' ) ), 'copyUrl' => esc_url_raw( rest_url( 'rss-prism/v1/template-copy' ) ) ), JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT ); ?></script>
		<?php else : ?>
			<div class="notice notice-info"><p><?php esc_html_e( 'Create a Prism Template, then select it here to start arranging content.', 'rss-prism-builder' ); ?></p></div>
		<?php endif; ?>
	</div>
	<?php
}

function rss_prism_builder_admin_assets( $hook ) {
	if ( 'toplevel_page_rss-prism-builder' !== $hook ) { return; }
	wp_enqueue_media();
	wp_enqueue_style( 'rss-prism-builder-admin', plugins_url( 'assets/builder.css', __FILE__ ), array(), RSS_PRISM_BUILDER_VERSION );
	wp_enqueue_script( 'rss-prism-builder-admin', plugins_url( 'assets/builder.js', __FILE__ ), array( 'wp-element', 'wp-components', 'wp-api-fetch' ), RSS_PRISM_BUILDER_VERSION, true );
}
add_action( 'admin_enqueue_scripts', 'rss_prism_builder_admin_assets' );
