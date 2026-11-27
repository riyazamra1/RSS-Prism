<?php
/**
 * 404 Not Found template.
 *
 * @package RSS_Prism
 */

get_header();
?>
<main id="content" class="site-content">
	<section class="entry-card">
		<h1 class="entry-title"><?php esc_html_e( 'Page Not Found', 'rss-prism' ); ?></h1>
		<p><?php esc_html_e( 'The page you requested could not be found. Try searching or return to the homepage.', 'rss-prism' ); ?></p>
		<?php get_search_form(); ?>
	</section>
</main>
<?php
get_footer();
