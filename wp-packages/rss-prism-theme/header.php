<?php
/**
 * Site header template.
 *
 * @package RSS_Prism
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$header_style   = sanitize_key( get_theme_mod( 'rss_prism_header_style', 'standard' ) );
$logo_pos       = sanitize_key( get_theme_mod( 'rss_prism_logo_position', 'left' ) );
$menu_style     = sanitize_key( get_theme_mod( 'rss_prism_menu_style', 'pill' ) );
$menu_align     = sanitize_key( get_theme_mod( 'rss_prism_menu_alignment', 'right' ) );
$header_surface = sanitize_key( get_theme_mod( 'rss_prism_header_surface', 'default' ) );
$header_rows    = rss_prism_get_header_rows();
$btn_label      = get_theme_mod( 'rss_prism_header_button_label', __( 'Get in touch', 'rss-prism' ) );
$btn_url        = get_theme_mod( 'rss_prism_header_button_url', '#contact' );
$social_url     = get_theme_mod( 'rss_prism_social_url', '' );
?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?> id="top">
<?php wp_body_open(); ?>
<a class="skip-link screen-reader-text" href="#content"><?php esc_html_e( 'Skip to content', 'rss-prism' ); ?></a>

<header class="site-header site-header--<?php echo esc_attr( $header_style ); ?> rp-header-logo--<?php echo esc_attr( $logo_pos ); ?> rp-header-menu--<?php echo esc_attr( $menu_style ); ?> rp-header-align--<?php echo esc_attr( $menu_align ); ?> rp-header-surface--<?php echo esc_attr( $header_surface ); ?>">
	<div class="site-header__inner">
		<button class="rp-menu-toggle" type="button" aria-expanded="false" aria-controls="primary-menu">&#9776; <?php esc_html_e( 'Menu', 'rss-prism' ); ?></button>
		<div class="rp-header-builder rp-header-builder--<?php echo esc_attr( $header_style ); ?>">
			<?php foreach ( $header_rows as $row_index => $elements ) : ?>
				<?php if ( empty( $elements ) ) { continue; } ?>
				<div class="rp-header-builder__row rp-header-builder__row--<?php echo esc_attr( (string) $row_index ); ?>">
					<?php foreach ( $elements as $element ) : ?>
						<div class="rp-header-builder__item rp-header-builder__item--<?php echo esc_attr( $element ); ?>">
							<?php if ( 'brand' === $element ) : ?>
								<div class="rp-studio-brand">
									<?php if ( has_custom_logo() ) : ?>
										<?php the_custom_logo(); ?>
									<?php endif; ?>
									<a class="rp-studio-site-title" href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php bloginfo( 'name' ); ?></a>
								</div>
							<?php elseif ( 'menu' === $element ) : ?>
								<nav class="main-navigation" id="primary-menu" aria-label="<?php esc_attr_e( 'Primary navigation', 'rss-prism' ); ?>">
									<?php
									wp_nav_menu(
										array(
											'theme_location' => 'primary',
											'container'      => false,
											'fallback_cb'    => 'rss_prism_fallback_menu',
										)
									);
									?>
								</nav>
							<?php elseif ( 'button' === $element && ! empty( $btn_label ) && ! empty( $btn_url ) ) : ?>
								<a class="rp-button" href="<?php echo esc_url( $btn_url ); ?>"><?php echo esc_html( $btn_label ); ?></a>
							<?php elseif ( 'search' === $element ) : ?>
								<?php get_search_form(); ?>
							<?php elseif ( 'social' === $element && ! empty( $social_url ) ) : ?>
								<a class="rp-social-link" href="<?php echo esc_url( $social_url ); ?>" rel="me noopener noreferrer" target="_blank"><?php esc_html_e( 'Follow', 'rss-prism' ); ?></a>
							<?php endif; ?>
						</div>
					<?php endforeach; ?>
				</div>
			<?php endforeach; ?>
		</div>
	</div>
</header>
