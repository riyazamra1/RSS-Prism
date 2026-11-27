<?php
/**
 * Main index template.
 *
 * @package RSS_Prism
 */

get_header();
?>
<main id="content" class="site-content">
	<?php if ( have_posts() ) : ?>
		<div class="entry-grid">
			<?php
			while ( have_posts() ) :
				the_post();
				?>
				<article id="post-<?php the_ID(); ?>" <?php post_class( 'entry-card' ); ?>>
					<?php if ( has_post_thumbnail() ) : ?>
						<a class="entry-thumbnail" href="<?php the_permalink(); ?>">
							<?php the_post_thumbnail( 'large' ); ?>
						</a>
					<?php endif; ?>
					<div class="entry-card__body">
						<header>
							<h2 class="entry-title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
							<div class="entry-meta"><?php echo esc_html( get_the_date() ); ?></div>
						</header>
						<div class="entry-excerpt"><?php the_excerpt(); ?></div>
						<p class="entry-read-more"><a href="<?php the_permalink(); ?>"><?php esc_html_e( 'Read more', 'rss-prism' ); ?> &rarr;</a></p>
					</div>
				</article>
				<?php
			endwhile;
			?>
		</div>
		<?php the_posts_pagination(); ?>
	<?php else : ?>
		<section class="entry-card">
			<h1><?php esc_html_e( 'Nothing Found', 'rss-prism' ); ?></h1>
			<p><?php esc_html_e( 'It seems we cannot find what you are looking for. Perhaps searching can help.', 'rss-prism' ); ?></p>
			<?php get_search_form(); ?>
		</section>
	<?php endif; ?>
</main>
<?php
get_footer();
