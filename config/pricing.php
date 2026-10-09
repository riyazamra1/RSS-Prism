<?php
/**
 * Load the canonical RSS Prism plan catalog from the Builder package.
 * @package RSSPrism
 */
defined( 'ABSPATH' ) || exit;
$catalog_file = dirname( __DIR__ ) . '/products/rss-prism-builder/includes/pricing-catalog.php';
if ( ! is_readable( $catalog_file ) ) { return array(); }
return require $catalog_file;
