<?php
/**
 * Plugin Name: RSS Prism Builder
 * Plugin URI: https://www.rsscctvsolution.eu.cc/
 * Description: Foundation for RSS Prism's theme-independent visual page builder.
 * Version: 0.1.1
 * Requires at least: 6.4
 * Requires PHP: 7.4
 * Author: Razeen Secure Solution
 * License: GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: rss-prism-builder
 * @package RSSPrismBuilder
 */
defined( 'ABSPATH' ) || exit;
define( 'RSS_PRISM_BUILDER_VERSION', '0.1.1' );

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
	$catalog_file = __DIR__ . '/includes/pricing-catalog.php';
	if ( ! is_readable( $catalog_file ) ) { return array(); }
	$catalog = require $catalog_file;
	return is_array( $catalog ) ? $catalog : array();
}

function rss_prism_builder_format_price( $amount, $currency ) {
	$amount = (int) $amount;
	return 'LKR' === $currency ? 'LKR ' . number_format_i18n( $amount ) : '$' . number_format_i18n( $amount );
}

/** Display proposed plans with [rss_prism_pricing]; no checkout buttons are shown. */
function rss_prism_builder_pricing_shortcode() {
	$catalog = rss_prism_builder_get_pricing_catalog();
	if ( empty( $catalog['plans'] ) ) { return ''; }
	wp_enqueue_style( 'rss-prism-pricing', plugins_url( 'assets/pricing.css', __FILE__ ), array(), RSS_PRISM_BUILDER_VERSION );
	ob_start();
	?>
	<section class="rss-prism-pricing" aria-label="<?php esc_attr_e( 'RSS Prism plans', 'rss-prism-builder' ); ?>">
		<p class="rss-prism-pricing__notice"><?php esc_html_e( 'Proposed launch pricing — checkout is not yet available.', 'rss-prism-builder' ); ?></p>
		<div class="rss-prism-pricing__grid">
			<?php foreach ( $catalog['plans'] as $plan_id => $plan ) : ?>
				<article class="rss-prism-plan rss-prism-plan--<?php echo esc_attr( sanitize_html_class( $plan_id ) ); ?>">
					<h3 class="rss-prism-plan__name"><?php echo esc_html( $plan['name'] ); ?></h3>
					<p class="rss-prism-plan__price"><?php echo esc_html( rss_prism_builder_format_price( $plan['price_usd'], 'USD' ) ); ?>
						<?php if ( 'annual' === $plan['billing'] ) : ?><span><?php esc_html_e( '/ year', 'rss-prism-builder' ); ?></span><?php elseif ( 'one_time' === $plan['billing'] ) : ?><span><?php esc_html_e( 'one-time', 'rss-prism-builder' ); ?></span><?php else : ?><span><?php esc_html_e( 'forever', 'rss-prism-builder' ); ?></span><?php endif; ?>
					</p>
					<p class="rss-prism-plan__local"><?php echo esc_html( rss_prism_builder_format_price( $plan['price_lkr'], 'LKR' ) ); ?></p>
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
