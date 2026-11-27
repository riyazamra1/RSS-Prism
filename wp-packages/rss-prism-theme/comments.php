<?php
/**
 * Comments template.
 *
 * @package RSS_Prism
 */

if ( post_password_required() ) {
	return;
}
?>
<section id="comments" class="entry-card comments-area">
	<?php if ( have_comments() ) : ?>
		<h2 class="comments-title">
			<?php
			printf(
				/* translators: %1$s: comment count */
				esc_html( _nx( '%1$s Comment', '%1$s Comments', get_comments_number(), 'comments title', 'rss-prism' ) ),
				esc_html( number_format_i18n( get_comments_number() ) )
			);
			?>
		</h2>
		<ol class="comment-list">
			<?php wp_list_comments( array( 'style' => 'ol', 'short_ping' => true ) ); ?>
		</ol>
		<?php the_comments_navigation(); ?>
	<?php endif; ?>

	<?php if ( ! comments_open() && get_comments_number() && post_type_supports( get_post_type(), 'comments' ) ) : ?>
		<p class="no-comments"><?php esc_html_e( 'Comments are closed.', 'rss-prism' ); ?></p>
	<?php endif; ?>

	<?php comment_form(); ?>
</section>
