<?php
/**
 * Main template.
 * @package RSSPrism
 */
defined( 'ABSPATH' ) || exit;
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<header class="site-header"><div class="site-header__inner">
	<div class="site-branding-wrap">
		<?php if ( has_custom_logo() ) : the_custom_logo(); else : ?>
			<a class="site-branding" href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php bloginfo( 'name' ); ?></a>
		<?php endif; ?>
		<?php if ( get_bloginfo( 'description' ) ) : ?><div class="site-description"><?php bloginfo( 'description' ); ?></div><?php endif; ?>
	</div>
	<nav class="main-navigation" aria-label="<?php esc_attr_e( 'Primary navigation', 'rss-prism' ); ?>">
		<?php wp_nav_menu( array( 'theme_location' => 'primary', 'container' => false, 'fallback_cb' => false ) ); ?>
	</nav>
</div></header>
<main id="content" class="site-content">
	<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
		<article <?php post_class( 'entry-card' ); ?> id="post-<?php the_ID(); ?>">
			<?php if ( has_post_thumbnail() && ! is_singular() ) : ?>
				<a class="entry-thumbnail" href="<?php the_permalink(); ?>" tabindex="-1" aria-hidden="true"><?php the_post_thumbnail( 'large' ); ?></a>
			<?php endif; ?>
			<?php if ( is_singular() ) : ?><h1 class="entry-title"><?php the_title(); ?></h1><?php else : ?><h2 class="entry-title"><a href="<?php echo esc_url( get_permalink() ); ?>"><?php the_title(); ?></a></h2><?php endif; ?>
			<div class="entry-meta"><time datetime="<?php echo esc_attr( get_the_date( DATE_W3C ) ); ?>"><?php echo esc_html( get_the_date() ); ?></time> <span aria-hidden="true">·</span> <?php the_author_posts_link(); ?></div>
			<div class="entry-content"><?php if ( is_singular() ) { the_content(); wp_link_pages(); } else { the_excerpt(); ?><p class="entry-read-more"><a href="<?php echo esc_url( get_permalink() ); ?>"><?php esc_html_e( 'Read more', 'rss-prism' ); ?> <span aria-hidden="true">→</span></a></p><?php } ?></div>
		</article>
	<?php endwhile; ?>
		<nav class="pagination" aria-label="<?php esc_attr_e( 'Posts navigation', 'rss-prism' ); ?>"><?php the_posts_pagination(); ?></nav>
	<?php else : ?>
		<section class="entry-card">
			<h1 class="entry-title"><?php echo esc_html( is_search() ? __( 'No results found', 'rss-prism' ) : __( 'Nothing here yet', 'rss-prism' ) ); ?></h1>
			<p><?php echo esc_html( is_search() ? __( 'Try a different search term, or browse the latest posts.', 'rss-prism' ) : __( 'Publish your first post to get started.', 'rss-prism' ) ); ?></p>
			<?php if ( is_search() ) { get_search_form(); } ?>
		</section>
	<?php endif; ?>
</main>
<footer class="site-footer"><div class="site-footer__inner">
	<span><?php echo esc_html( get_bloginfo( 'name' ) ); ?></span>
	<nav aria-label="<?php esc_attr_e( 'Footer navigation', 'rss-prism' ); ?>"><?php wp_nav_menu( array( 'theme_location' => 'footer', 'container' => false, 'fallback_cb' => false ) ); ?></nav>
</div></footer>
<?php wp_footer(); ?>
</body></html>
