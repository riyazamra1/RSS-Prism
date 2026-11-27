<?php
/**
 * Archive template.
 *
 * @package RSS_Prism
 */

get_header();
?>
<main id="content" class="site-content">
	<header class="entry-card">
		<?php
		the_archive_title( '<h1 class="entry-title">', '</h1>' );
		the_archive_description( '<div class="entry-meta">', '</div>' );
		?>
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
						<div class="entry-meta"><?php echo esc_html( get_the_date() ); ?></div>
						<div class="entry-excerpt"><?php the_excerpt(); ?></div>
					</div>
				</article>
				<?php
			endwhile;
			?>
		</div>
		<?php the_posts_pagination(); ?>
	<?php endif; ?>
</main>
<?php
get_footer();
