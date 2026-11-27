<?php
/**
 * Single post template.
 *
 * @package RSS_Prism
 */

get_header();
?>
<main id="content" class="site-content">
	<div class="<?php echo is_active_sidebar( 'sidebar-1' ) ? 'single-layout' : 'single-layout--no-sidebar'; ?>">
		<div>
			<?php
			while ( have_posts() ) :
				the_post();
				?>
				<article id="post-<?php the_ID(); ?>" <?php post_class( 'entry-card' ); ?>>
					<header>
						<h1 class="entry-title"><?php the_title(); ?></h1>
						<div class="entry-meta">
							<?php echo esc_html( get_the_date() ); ?> &middot; <?php echo esc_html( get_the_author() ); ?>
						</div>
					</header>
					<?php if ( has_post_thumbnail() ) : ?>
						<div class="entry-thumbnail"><?php the_post_thumbnail( 'large' ); ?></div>
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
					<footer class="entry-meta">
						<?php the_tags( esc_html__( 'Tags: ', 'rss-prism' ), ', ' ); ?>
					</footer>
				</article>
				<?php
				the_post_navigation();
				if ( comments_open() || get_comments_number() ) {
					comments_template();
				}
			endwhile;
			?>
		</div>
		<?php if ( is_active_sidebar( 'sidebar-1' ) ) : ?>
			<aside class="sidebar" aria-label="<?php esc_attr_e( 'Sidebar', 'rss-prism' ); ?>">
				<?php dynamic_sidebar( 'sidebar-1' ); ?>
			</aside>
		<?php endif; ?>
	</div>
</main>
<?php
get_footer();
