<?php
/**
 * RSS Prism branded homepage.
 *
 * @package RSSPrism
 */
get_header();
?>
<main id="content" class="rss-home">
	<section class="rp-hero rss-hero">
		<div class="rp-container rp-hero__inner">
			<div>
				<p class="rp-eyebrow"><?php echo esc_html( get_theme_mod( 'rss_prism_hero_eyebrow', 'RAZEEN SECURE SOLUTION · RSS' ) ); ?></p>
				<h1><?php echo esc_html( get_theme_mod( 'rss_prism_hero_title', 'Developing Ideas. Delivering Solutions.' ) ); ?></h1>
				<p class="rp-hero__text"><?php echo esc_html( get_theme_mod( 'rss_prism_hero_text', 'We build practical digital experiences, software tools, and website solutions with a focus on clarity, reliability, and security-minded design.' ) ); ?></p>
				<div class="rp-hero__actions">
					<?php $label = get_theme_mod( 'rss_prism_hero_primary_label', 'Explore RSS projects' ); $url = get_theme_mod( 'rss_prism_hero_primary_url', '#projects' ); if ( $label && $url ) : ?>
						<a class="rp-button" href="<?php echo esc_url( $url ); ?>"><?php echo esc_html( $label ); ?> →</a>
					<?php endif; ?>
					<?php $label = get_theme_mod( 'rss_prism_hero_secondary_label', 'About RSS' ); $url = get_theme_mod( 'rss_prism_hero_secondary_url', '#about-rss' ); if ( $label && $url ) : ?>
						<a class="rp-button rp-button--outline" href="<?php echo esc_url( $url ); ?>"><?php echo esc_html( $label ); ?></a>
					<?php endif; ?>
				</div>
				<p class="rss-hero-note">Independent digital solutions · A security-aware approach · Free public offering</p>
			</div>
			<div class="rp-hero__visual rss-hero-art" aria-hidden="true"><div class="rp-hero__orb"></div><span class="rss-orbit rss-orbit--one"></span><span class="rss-orbit rss-orbit--two"></span><div class="rss-monogram">RSS<span>PRISM</span></div></div>
		</div>
	</section>

	<section class="rp-section rp-container rss-intro" id="about-rss">
		<p class="rp-eyebrow">WHO WE ARE</p>
		<h2>Technology built around real needs.</h2>
		<p class="rss-section-lead">Razeen Secure Solution (RSS) is a technology and digital-solutions brand focused on building useful software, web experiences, and tools that help people manage work more clearly. Our guiding idea is simple: make technology practical, understandable, and designed with security in mind.</p>
		<div class="rss-facts"><div><strong>Our mission</strong><span>Turn ideas into useful digital solutions.</span></div><div><strong>Our approach</strong><span>Clear interfaces, thoughtful workflows, and responsible implementation.</span></div><div><strong>Our promise</strong><span>Be transparent about features, availability, and project status.</span></div></div>
	</section>

	<section class="rp-section rss-section-tint" id="features">
		<div class="rp-container">
			<p class="rp-eyebrow">WHAT WE FOCUS ON</p>
			<h2><?php echo esc_html( get_theme_mod( 'rss_prism_features_title', 'Useful features. Clear experiences.' ) ); ?></h2>
			<p class="rss-section-lead"><?php echo esc_html( get_theme_mod( 'rss_prism_features_text', 'RSS projects aim to combine practical functionality with straightforward user experiences and security-aware engineering.' ) ); ?></p>
			<div class="rp-card-grid rss-feature-grid">
				<article class="rp-card"><div class="rp-card__icon">✦</div><h3>Website experiences</h3><p>Responsive WordPress websites, flexible layouts, reusable content sections, and brand-consistent presentation.</p></article>
				<article class="rp-card"><div class="rp-card__icon">▤</div><h3>Project workflows</h3><p>Tools and portal concepts for organizing projects, requests, approvals, and progress in a clearer workflow.</p></article>
				<article class="rp-card"><div class="rp-card__icon">⌁</div><h3>Security-aware design</h3><p>Attention to access control, input validation, account verification, and safe handling of application data.</p></article>
				<article class="rp-card"><div class="rp-card__icon">◈</div><h3>Responsive interfaces</h3><p>Layouts designed to adapt across desktop and mobile screens, with readable content and accessible controls.</p></article>
				<article class="rp-card"><div class="rp-card__icon">⚙</div><h3>Practical automation</h3><p>Exploring ways to reduce repetitive work through useful integrations and well-defined processes.</p></article>
				<article class="rp-card"><div class="rp-card__icon">◎</div><h3>Transparent delivery</h3><p>Features and project status should be communicated clearly, without presenting planned work as already released.</p></article>
			</div>
		</div>
	</section>

	<section class="rp-section rp-container" id="projects">
		<p class="rp-eyebrow">THE RSS ECOSYSTEM</p>
		<h2>Projects and products</h2>
		<p class="rss-section-lead">A snapshot of the RSS project portfolio. Each project can evolve independently; availability depends on its current development and release status.</p>
		<div class="rp-card-grid rss-project-grid">
			<article class="rp-card rss-project-card"><span class="rss-project-label">WordPress theme</span><h3>RSS Prism</h3><p>A responsive WordPress theme with configurable colours, header and footer layouts, homepage sections, article layouts, and site-personalization controls.</p><a href="<?php echo esc_url( home_url( '/' ) ); ?>">Explore this website <span aria-hidden="true">→</span></a></article>
			<article class="rp-card rss-project-card"><span class="rss-project-label">Project management</span><h3>RSS Project Manager</h3><p>A project-management portal initiative for organizing project information and workflows. Features should be checked against the current deployed release.</p><a href="https://github.com/riyazamra1/RSS-Prism">View RSS project repository <span aria-hidden="true">→</span></a></article>
			<article class="rp-card rss-project-card"><span class="rss-project-label">Core services</span><h3>RSS Core</h3><p>A shared-services project supporting connected RSS applications and their account or service workflows, subject to the deployed configuration.</p><a href="https://github.com/riyazamra1/RSS-Prism">View RSS project repository <span aria-hidden="true">→</span></a></article>
			<article class="rp-card rss-project-card"><span class="rss-project-label">Site building</span><h3>RSS Prism Builder</h3><p>A developing visual layout builder for WordPress with draggable content blocks, responsive settings, and saved layouts. It is not yet a complete Divi-class builder.</p><a href="https://github.com/riyazamra1/RSS-Prism/tree/main/products/rss-prism-builder">View Builder source <span aria-hidden="true">→</span></a></article>
			<article class="rp-card rss-project-card"><span class="rss-project-label">Shared toolkit</span><h3>RSS KIT</h3><p>A toolkit initiative for reusable RSS components and remote-interface capabilities as those features are implemented and released.</p><a href="https://github.com/riyazamra1/RSS-Prism">View RSS project repository <span aria-hidden="true">→</span></a></article>
			<article class="rp-card rss-project-card rss-project-card--planned"><span class="rss-project-label">Future project</span><h3>RSS APK Analyzer</h3><p>Planned Android APK inspection and analysis tooling, including permission review, code/resource search, comparison, and authorized modification workflows. Not presented as a released product.</p><span class="rss-status-note">Planned · Not yet released</span></article>
		</div>
	</section>

	<section class="rp-section rss-security-section" id="security">
		<div class="rp-container rss-security-layout">
			<div><p class="rp-eyebrow">SECURITY AND TRUST</p><h2>Security is a design priority.</h2><p class="rss-section-lead">RSS aims to apply security-conscious practices appropriate to each project, including access checks, input validation, secure account flows, and careful treatment of sensitive information.</p></div>
			<div class="rss-security-list">
				<div><span class="rss-security-mark">01</span><div><h3>Access control</h3><p>Protected actions should verify permissions on the server, not rely only on what the interface displays.</p></div></div>
				<div><span class="rss-security-mark">02</span><div><h3>Account verification</h3><p>Where supported, verification and approval flows help confirm account ownership and control access.</p></div></div>
				<div><span class="rss-security-mark">03</span><div><h3>Input and data handling</h3><p>Validation, sanitization, and minimal exposure of sensitive data are important implementation goals.</p></div></div>
				<div><span class="rss-security-mark">04</span><div><h3>Honest security claims</h3><p>Security controls vary by product and deployment. RSS does not claim a certification or guarantee that has not been independently verified.</p></div></div>
			</div>
		</div>
	</section>

	<section class="rp-section rp-container rss-pricing" id="pricing">
		<div class="rp-cta"><p class="rp-eyebrow">PUBLIC OFFERING</p><h2>Start with Free.</h2><p>RSS public-facing offerings are presented as Free. No demo paid tiers or promotional placeholder prices are shown here. Product capabilities and availability may vary by project.</p><a class="rp-button" href="https://www.rsscctvsolution.eu.cc/">Visit the RSS website →</a></div>
	</section>

	<section class="rp-section rp-container" id="latest">
		<p class="rp-eyebrow">UPDATES FROM RSS</p><h2>Latest articles and updates</h2>
		<?php $rss_posts = new WP_Query( array( 'post_type' => 'post', 'post_status' => 'publish', 'posts_per_page' => 3 ) ); if ( $rss_posts->have_posts() ) : ?><div class="entry-grid"><?php while ( $rss_posts->have_posts() ) : $rss_posts->the_post(); rss_prism_post_card(); endwhile; ?></div><?php wp_reset_postdata(); else : ?><p>RSS news, project updates, and articles will appear here when published.</p><?php endif; ?>
	</section>

	<section class="rp-section rp-container" id="contact"><div class="rp-cta"><p class="rp-eyebrow">LET'S CONNECT</p><h2><?php echo esc_html( get_theme_mod( 'rss_prism_cta_title', 'Have an idea to build?' ) ); ?></h2><p><?php echo esc_html( get_theme_mod( 'rss_prism_cta_text', 'Visit Razeen Secure Solution to learn more about RSS and its digital projects.' ) ); ?></p><?php $label = get_theme_mod( 'rss_prism_cta_label', 'Visit RSS website' ); $url = get_theme_mod( 'rss_prism_cta_url', 'https://www.rsscctvsolution.eu.cc/' ); if ( $label && $url ) : ?><a class="rp-button" href="<?php echo esc_url( $url ); ?>"><?php echo esc_html( $label ); ?> →</a><?php endif; ?></div></section>
	<?php while ( have_posts() ) : the_post(); if ( trim( get_the_content() ) ) : ?><section class="rp-section rp-container entry-content"><?php the_content(); ?></section><?php endif; endwhile; ?>
</main>
<?php get_footer(); ?>
