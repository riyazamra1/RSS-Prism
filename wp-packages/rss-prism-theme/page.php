<?php
/**
 * Page template.
 *
 * @package RSS_Prism
 */

get_header();
?>
<main id="content" class="site-content">
	<?php
	while ( have_posts() ) :
		the_post();
		?>
		<article id="post-<?php the_ID(); ?>" <?php post_class( 'entry-card' ); ?>>
			<header>
				<h1 class="entry-title"><?php the_title(); ?></h1>
			</header>
			<?php if ( has_post_thumbnail() ) : ?>
				<div class="entry-thumbnail"><?php the_post_thumbnail( 'full' ); ?></div>
			<?php endif; ?>
			<div class="entry-content">
				<?php
				the_content();
				wp_link_pages(
					array(
						'before' => '<div class="page-links">' . esc_html__( 'Pages:', 'rss-prism' ),
						'after'  => '</div>',
					)
				);
				?>
			</div>
		</article>
		<?php
		if ( comments_open() || get_comments_number() ) {
			comments_template();
		}
	endwhile;
	?>
</main>
<?php
get_footer();
