<?php
/**
 * Front page template.
 *
 * @package RSS_Prism
 */

get_header();
?>
<main id="content" class="rss-home">
	<?php if ( 'page' === get_option( 'show_on_front' ) && have_posts() ) : ?>
		<div class="site-content">
			<?php
			while ( have_posts() ) :
				the_post();
				?>
				<article id="post-<?php the_ID(); ?>" <?php post_class( 'entry-card' ); ?>>
					<div class="entry-content">
						<?php the_content(); ?>
					</div>
				</article>
				<?php
			endwhile;
			?>
		</div>
	<?php else : ?>
		<section class="rp-hero rss-hero">
			<div class="rp-container rp-hero__inner">
				<div>
					<span class="rp-eyebrow"><?php esc_html_e( 'RAZEEN SMART SOLUTION · RSS', 'rss-prism' ); ?></span>
					<h1><?php esc_html_e( 'Developing Ideas. Delivering Solutions.', 'rss-prism' ); ?></h1>
					<p class="rp-hero__text"><?php esc_html_e( 'We build practical digital experiences, software tools, CCTV & networking infrastructure, and modern WordPress websites.', 'rss-prism' ); ?></p>
					<div class="rp-hero__actions">
						<a class="rp-button" href="#services"><?php esc_html_e( 'Explore Services', 'rss-prism' ); ?></a>
						<a class="rp-button rp-button--outline" href="#contact"><?php esc_html_e( 'Contact RSS', 'rss-prism' ); ?></a>
					</div>
				</div>
				<div class="rp-hero__visual rss-hero-art" aria-hidden="true">
					<div class="rp-hero__orb"></div>
					<div class="rss-orbit"></div>
					<div class="rss-orbit rss-orbit--two"></div>
					<div class="rss-monogram">RSS<span>PRISM</span></div>
				</div>
			</div>
		</section>

		<section id="services" class="rp-section rp-container">
			<h2><?php esc_html_e( 'Practical Technology & Digital Solutions', 'rss-prism' ); ?></h2>
			<p class="rss-section-lead"><?php esc_html_e( 'Designed for clarity, reliability, and maintainable business workflows across software, security, and cloud infrastructure.', 'rss-prism' ); ?></p>
			<div class="rp-card-grid rss-feature-grid">
				<article class="rp-card">
					<h3><?php esc_html_e( 'Software & Web Apps', 'rss-prism' ); ?></h3>
					<p><?php esc_html_e( 'Custom web applications, automation tools, and high-craft business websites.', 'rss-prism' ); ?></p>
				</article>
				<article class="rp-card">
					<h3><?php esc_html_e( 'CCTV & Networking', 'rss-prism' ); ?></h3>
					<p><?php esc_html_e( 'Reliable site surveillance, structured networking, and proactive system monitoring.', 'rss-prism' ); ?></p>
				</article>
				<article class="rp-card">
					<h3><?php esc_html_e( 'Cloud & Practical AI', 'rss-prism' ); ?></h3>
					<p><?php esc_html_e( 'Modern cloud deployments, secure workflows, and helpful AI integrations.', 'rss-prism' ); ?></p>
				</article>
			</div>
		</section>

		<?php if ( have_posts() ) : ?>
			<section class="rp-section rss-section-tint">
				<div class="rp-container">
					<h2><?php esc_html_e( 'Latest Updates', 'rss-prism' ); ?></h2>
					<div class="entry-grid">
						<?php
						while ( have_posts() ) :
							the_post();
							?>
							<article id="post-<?php the_ID(); ?>" <?php post_class( 'entry-card' ); ?>>
								<div class="entry-card__body">
									<h3 class="entry-title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
									<div class="entry-excerpt"><?php the_excerpt(); ?></div>
								</div>
							</article>
							<?php
						endwhile;
						?>
					</div>
					<?php the_posts_pagination(); ?>
				</div>
			</section>
		<?php endif; ?>
	<?php endif; ?>
</main>
<?php
get_footer();
