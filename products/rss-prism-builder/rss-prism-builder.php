<?php
/**
 * Plugin Name: RSS Prism Builder
 * Plugin URI: https://www.rsscctvsolution.eu.cc/
 * Description: Theme-independent visual layout builder with image elements and responsive controls.
 * Version: 0.9.0
 * Requires at least: 6.4
 * Requires PHP: 7.4
 * Author: Razeen Secure Solution
 * License: GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: rss-prism-builder
 * @package RSSPrismBuilder
 */
defined( 'ABSPATH' ) || exit;
define( 'RSS_PRISM_BUILDER_VERSION', '0.9.0' );

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
	$allowed = array( 'section', 'heading', 'text', 'button', 'image', 'columns' );
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

function rss_prism_builder_register_rest_routes() {
	register_rest_route( 'rss-prism/v1', '/template-copy', array(
		'methods' => WP_REST_Server::CREATABLE,
		'callback' => 'rss_prism_builder_copy_template',
		'permission_callback' => function() { return current_user_can( 'edit_posts' ); },
		'args' => array(
			'post_id' => array( 'required' => true, 'type' => 'integer', 'sanitize_callback' => 'absint' ),
			'title' => array( 'required' => true, 'type' => 'string', 'sanitize_callback' => 'sanitize_text_field' ),
			'layout' => array( 'required' => true, 'type' => 'array' ),
		),
	) );
	register_rest_route( 'rss-prism/v1', '/layout', array(
		'methods' => WP_REST_Server::CREATABLE,
		'callback' => 'rss_prism_builder_save_layout',
		'permission_callback' => function() { return current_user_can( 'edit_posts' ); },
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
		} elseif ( 'image' === $type && ! empty( $item['image_url'] ) ) {
			$out .= '<figure class="rss-prism-canvas-image ' . esc_attr( 'rss-prism-item-' . $safe_id ) . '" style="' . esc_attr( $style ) . '"><img src="' . esc_url( $item['image_url'] ) . '" alt="' . esc_attr( $item['alt'] ?? '' ) . '" loading="lazy" decoding="async" style="display:block;width:' . min( 100, max( 10, absint( $item['image_width'] ?? 100 ) ) ) . '%;max-width:100%;height:auto;margin-inline:auto"></figure>';
		}
	}
	if ( $responsive_css ) { $out .= '<style>' . $responsive_css . '@media(max-width:640px){.rss-prism-canvas-columns .rss-prism-columns-grid{grid-template-columns:1fr!important}}</style>'; } else { $out .= '<style>@media(max-width:640px){.rss-prism-canvas-columns .rss-prism-columns-grid{grid-template-columns:1fr!important}}</style>'; }
	return $out . '</div>';
}
add_shortcode( 'rss_prism_canvas', 'rss_prism_builder_render_canvas_shortcode' );

function rss_prism_builder_admin_menu() {
	add_menu_page( __( 'RSS Prism Builder', 'rss-prism-builder' ), __( 'Prism Builder', 'rss-prism-builder' ), 'edit_posts', 'rss-prism-builder', 'rss_prism_builder_render_admin_page', 'dashicons-layout', 58 );
}
add_action( 'admin_menu', 'rss_prism_builder_admin_menu' );

function rss_prism_builder_render_admin_page() {
	if ( ! current_user_can( 'edit_posts' ) ) { return; }
	$templates = get_posts( array( 'post_type' => 'rss_prism_template', 'post_status' => array( 'publish', 'draft', 'pending', 'private' ), 'numberposts' => 100, 'orderby' => 'modified', 'order' => 'DESC' ) );
	$selected_id = isset( $_GET['post_id'] ) ? absint( $_GET['post_id'] ) : 0;
	$selected = $selected_id ? get_post( $selected_id ) : null;
	if ( ! $selected || 'rss_prism_template' !== $selected->post_type || ! current_user_can( 'edit_post', $selected_id ) ) { $selected_id = 0; $selected = null; }
	$layout = $selected ? get_post_meta( $selected_id, '_rss_prism_layout', true ) : array();
	if ( ! is_array( $layout ) ) { $layout = array(); }
	?>
	<div class="wrap rss-prism-admin-wrap">
		<h1><?php esc_html_e( 'RSS Prism Builder', 'rss-prism-builder' ); ?></h1>
		<p><?php esc_html_e( 'Build a starter layout with draggable elements. This is an early builder MVP, not the complete visual editor.', 'rss-prism-builder' ); ?></p>
		<p><a class="button button-primary" href="<?php echo esc_url( admin_url( 'post-new.php?post_type=rss_prism_template' ) ); ?>"><?php esc_html_e( 'Create template', 'rss-prism-builder' ); ?></a></p>
		<?php if ( $templates ) : ?>
			<form method="get" class="rss-prism-template-select">
				<input type="hidden" name="page" value="rss-prism-builder">
				<label for="rss-prism-template-id"><?php esc_html_e( 'Choose template', 'rss-prism-builder' ); ?></label>
				<select id="rss-prism-template-id" name="post_id">
					<option value="0"><?php esc_html_e( 'Select a template…', 'rss-prism-builder' ); ?></option>
					<?php foreach ( $templates as $template ) : ?><option value="<?php echo esc_attr( $template->ID ); ?>" <?php selected( $selected_id, $template->ID ); ?>><?php echo esc_html( $template->post_title ? $template->post_title : '(Untitled template #' . $template->ID . ')' ); ?></option><?php endforeach; ?>
				</select>
				<button class="button"><?php esc_html_e( 'Load', 'rss-prism-builder' ); ?></button>
			</form>
		<?php endif; ?>
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
