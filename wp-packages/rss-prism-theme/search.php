<?php
/**
 * Search results template.
 *
 * @package RSS_Prism
 */

get_header();
?>
<main id="content" class="site-content">
	<header class="entry-card">
		<h1 class="entry-title">
			<?php
			printf(
				/* translators: %s: search query */
				esc_html__( 'Search Results for: %s', 'rss-prism' ),
				'<span>' . esc_html( get_search_query() ) . '</span>'
			);
			?>
		</h1>
		<?php get_search_form(); ?>
	</header>
	<?php if ( have_posts() ) : ?>
		<div class="entry-grid">
			<?php
			while ( have_posts() ) :
				the_post();
				?>
				<article id="post-<?php the_ID(); ?>" <?php post_class( 'entry-card' ); ?>>
					<div class="entry-card__body">
						<h2 class="entry-title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
						<div class="entry-excerpt"><?php the_excerpt(); ?></div>
					</div>
				</article>
				<?php
			endwhile;
			?>
		</div>
		<?php the_posts_pagination(); ?>
	<?php else : ?>
		<section class="entry-card">
			<p><?php esc_html_e( 'Sorry, no content matched your search terms.', 'rss-prism' ); ?></p>
		</section>
	<?php endif; ?>
</main>
<?php
get_footer();
