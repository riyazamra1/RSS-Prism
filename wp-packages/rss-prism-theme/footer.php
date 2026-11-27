<?php
/**
 * Site footer template.
 *
 * @package RSS_Prism
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$footer_style = sanitize_key( get_theme_mod( 'rss_prism_footer_style', 'light' ) );
$footer_align = sanitize_key( get_theme_mod( 'rss_prism_footer_alignment', 'left' ) );
$footer_cols  = sanitize_key( get_theme_mod( 'rss_prism_footer_columns', 'three' ) );
$footer_rows  = rss_prism_get_footer_rows();
$footer_text  = get_theme_mod( 'rss_prism_footer_text', __( 'Developing Ideas. Delivering Solutions.', 'rss-prism' ) );
$copyright    = get_theme_mod( 'rss_prism_footer_copyright', '' );
$social_url   = get_theme_mod( 'rss_prism_social_url', '' );
?>

<footer class="site-footer site-footer--<?php echo esc_attr( $footer_style ); ?> rp-footer-builder rp-footer-align--<?php echo esc_attr( $footer_align ); ?> rp-footer-columns--<?php echo esc_attr( $footer_cols ); ?>">
	<?php foreach ( $footer_rows as $row_index => $elements ) : ?>
		<?php if ( empty( $elements ) ) { continue; } ?>
		<div class="rp-footer-builder__row<?php echo 2 === $row_index ? ' rp-footer-builder__row--bottom' : ''; ?> rp-container">
			<?php foreach ( $elements as $element ) : ?>
				<div class="rp-footer-builder__item rp-footer-builder__item--<?php echo esc_attr( $element ); ?>">
					<?php if ( 'brand' === $element ) : ?>
						<div class="rp-studio-brand">
							<a class="rp-studio-site-title" href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php bloginfo( 'name' ); ?></a>
							<span class="rp-studio-tagline"><?php bloginfo( 'description' ); ?></span>
						</div>
					<?php elseif ( 'description' === $element ) : ?>
						<p class="site-footer__copy"><?php echo esc_html( $footer_text ); ?></p>
					<?php elseif ( 'menu' === $element ) : ?>
						<nav class="footer-navigation" aria-label="<?php esc_attr_e( 'Footer navigation', 'rss-prism' ); ?>">
							<?php
							wp_nav_menu(
								array(
									'theme_location' => 'footer',
									'container'      => false,
									'fallback_cb'    => 'rss_prism_fallback_menu',
								)
							);
							?>
						</nav>
					<?php elseif ( 'widgets' === $element ) : ?>
						<p class="rp-studio-help"><?php esc_html_e( 'Razeen Smart Solution · Software, CCTV, Networking, Cloud & AI.', 'rss-prism' ); ?></p>
					<?php elseif ( 'social' === $element && ! empty( $social_url ) ) : ?>
						<a class="rp-social-link" href="<?php echo esc_url( $social_url ); ?>" rel="me noopener noreferrer" target="_blank"><?php esc_html_e( 'Follow RSS', 'rss-prism' ); ?></a>
					<?php elseif ( 'copyright' === $element ) : ?>
						<span>
							<?php
							if ( ! empty( $copyright ) ) {
								echo esc_html( $copyright );
							} else {
								printf(
									/* translators: %s: current year */
									esc_html__( '© %s Razeen Smart Solution. All rights reserved.', 'rss-prism' ),
									esc_html( wp_date( 'Y' ) )
								);
							}
							?>
						</span>
					<?php elseif ( 'credit' === $element ) : ?>
						<span class="rp-prism-credit">
							<?php
							printf(
								/* translators: %s: theme link */
								esc_html__( 'Theme: %s by Razeen Smart Solution.', 'rss-prism' ),
								'<a href="' . esc_url( 'https://www.rsscctvsolution.eu.cc/' ) . '" rel="noopener noreferrer" target="_blank">RSS Prism</a>'
							);
							?>
						</span>
					<?php endif; ?>
				</div>
			<?php endforeach; ?>
		</div>
	<?php endforeach; ?>
</footer>

<a class="rp-back-to-top" href="#top" aria-label="<?php esc_attr_e( 'Back to top', 'rss-prism' ); ?>">&uarr; <span><?php esc_html_e( 'Top', 'rss-prism' ); ?></span></a>
<?php wp_footer(); ?>
</body>
</html>
