<?php
/**
 * RSS Prism admin dashboard and release information.
 *
 * @package RSSPrism
 */
defined('ABSPATH') || exit;

/**
 * Render a compact, useful theme status panel.
 */
function rss_prism_render_admin_dashboard_panel($full = false) {
	if (!current_user_can('edit_theme_options')) {
		return;
	}
	$theme = wp_get_theme(get_template());
	$version = $theme->get('Version');
	$stylesheet = get_template();
	$updates = get_site_transient('update_themes');
	$available = null;
	if (is_object($updates) && isset($updates->response[$stylesheet])) {
		$entry = $updates->response[$stylesheet];
		if (is_array($entry)) {
			$available = (object) $entry;
		} elseif (is_object($entry)) {
			$available = $entry;
		}
	}
	$latest_version = $available && !empty($available->new_version) ? sanitize_text_field($available->new_version) : '';
	$release_url = 'https://github.com/riyazamra1/RSS-Prism/releases';
	$download_url = 'https://github.com/riyazamra1/RSS-Prism/releases/latest';
	$refresh_url = wp_nonce_url(admin_url('admin-post.php?action=rss_prism_refresh_updates'), 'rss_prism_refresh_updates');
	$installed_theme = wp_get_theme($stylesheet);
	?>
	<div class="rp-admin-dashboard">
		<div class="rp-admin-dashboard__hero">
			<p class="rp-admin-dashboard__eyebrow"><?php esc_html_e('RAZEEN SECURE SOLUTION', 'rss-prism'); ?></p>
			<h2><?php esc_html_e('Welcome to RSS Prism', 'rss-prism'); ?></h2>
			<p><?php esc_html_e('A practical workspace for your website design, content and theme updates.', 'rss-prism'); ?></p>
			<div class="rp-admin-dashboard__actions">
				<a class="button button-primary" href="<?php echo esc_url(admin_url('themes.php?page=rss-prism-studio')); ?>"><?php esc_html_e('Open Header & Footer Studio', 'rss-prism'); ?></a>
				<a class="button" href="<?php echo esc_url(admin_url('customize.php')); ?>"><?php esc_html_e('Customize theme', 'rss-prism'); ?></a>
				<a class="button" href="<?php echo esc_url(admin_url('update-core.php')); ?>"><?php esc_html_e('Check WordPress updates', 'rss-prism'); ?></a>
			</div>
		</div>
		<div class="rp-admin-dashboard__grid">
			<section class="rp-admin-dashboard__card">
				<h3><?php esc_html_e('Installed theme', 'rss-prism'); ?></h3>
				<p class="rp-admin-dashboard__version"><?php echo esc_html(sprintf(__('RSS Prism %s', 'rss-prism'), $version)); ?></p>
				<p class="description"><?php echo esc_html(sprintf(__('Theme stylesheet: %s', 'rss-prism'), $stylesheet)); ?></p>
				<p><?php esc_html_e('Keep this theme updated to receive layout refinements, fixes and improvements.', 'rss-prism'); ?></p>
			</section>
			<section class="rp-admin-dashboard__card">
				<h3><?php esc_html_e('Update status', 'rss-prism'); ?></h3>
				<?php if (isset($_GET['rss_prism_updates_refreshed']) && '1' === sanitize_text_field(wp_unslash($_GET['rss_prism_updates_refreshed']))) : ?>
					<p><strong><?php esc_html_e('Update check completed. Review the status below.', 'rss-prism'); ?></strong></p>
				<?php endif; ?>
				<?php if ($latest_version && version_compare($latest_version, $version, '>')) : ?>
					<p><strong><?php echo esc_html(sprintf(__('Version %s is available.', 'rss-prism'), $latest_version)); ?></strong></p>
					<p><?php esc_html_e('Review the update in Dashboard → Updates. WordPress will ask you to install it.', 'rss-prism'); ?></p>
					<a class="button button-primary" href="<?php echo esc_url(admin_url('update-core.php')); ?>"><?php esc_html_e('Review available update', 'rss-prism'); ?></a> <a class="button" href="<?php echo esc_url($refresh_url); ?>"><?php esc_html_e('Check again', 'rss-prism'); ?></a>
				<?php else : ?>
					<p><strong><?php esc_html_e('No newer version is currently listed by WordPress.', 'rss-prism'); ?></strong></p>
					<p><?php esc_html_e('If a release was just published, go to Dashboard → Updates and click “Check Again”. Release checks may be cached temporarily.', 'rss-prism'); ?></p>
					<p><a class="button" href="<?php echo esc_url($refresh_url); ?>"><?php esc_html_e('Force update check', 'rss-prism'); ?></a> <a class="button" href="<?php echo esc_url($release_url); ?>" target="_blank" rel="noopener noreferrer"><?php esc_html_e('View release notes', 'rss-prism'); ?></a></p>
				<?php endif; ?>
				<p class="description"><?php esc_html_e('The theme does not install updates silently. You remain in control of when WordPress updates it.', 'rss-prism'); ?></p>
			</section>
			<section class="rp-admin-dashboard__card">
				<h3><?php esc_html_e('Design & content', 'rss-prism'); ?></h3>
				<ul>
					<li><a href="<?php echo esc_url(admin_url('themes.php?page=rss-prism-studio')); ?>"><?php esc_html_e('Arrange header and footer rows', 'rss-prism'); ?></a></li>
					<li><a href="<?php echo esc_url(admin_url('customize.php')); ?>"><?php esc_html_e('Edit colours, typography and homepage copy', 'rss-prism'); ?></a></li>
					<li><a href="<?php echo esc_url(admin_url('nav-menus.php')); ?>"><?php esc_html_e('Manage navigation menus', 'rss-prism'); ?></a></li>
					<li><a href="<?php echo esc_url(admin_url('widgets.php')); ?>"><?php esc_html_e('Manage widgets', 'rss-prism'); ?></a></li>
				</ul>
			</section>
			<section class="rp-admin-dashboard__card">
				<h3><?php esc_html_e('Release details', 'rss-prism'); ?></h3>
				<p><?php esc_html_e('Read the release notes, inspect source changes or download the installable theme package.', 'rss-prism'); ?></p>
				<p><a href="<?php echo esc_url($release_url); ?>" target="_blank" rel="noopener noreferrer"><?php esc_html_e('All releases', 'rss-prism'); ?></a> · <a href="<?php echo esc_url($download_url); ?>" target="_blank" rel="noopener noreferrer"><?php esc_html_e('Latest release', 'rss-prism'); ?></a> · <a href="https://github.com/riyazamra1/RSS-Prism" target="_blank" rel="noopener noreferrer"><?php esc_html_e('Source repository', 'rss-prism'); ?></a></p>
			</section>
		</div>
	</div>
	<?php
}

function rss_prism_register_dashboard_widget() {
	if (!current_user_can('edit_theme_options')) {
		return;
	}
	wp_add_dashboard_widget('rss_prism_dashboard_widget', __('RSS Prism — Welcome & Updates', 'rss-prism'), 'rss_prism_render_admin_dashboard_panel');
}
add_action('wp_dashboard_setup', 'rss_prism_register_dashboard_widget');

function rss_prism_register_dashboard_page() {
	add_theme_page(__('RSS Prism Dashboard', 'rss-prism'), __('RSS Prism Dashboard', 'rss-prism'), 'edit_theme_options', 'rss-prism-dashboard', 'rss_prism_render_admin_dashboard_page');
}
add_action('admin_menu', 'rss_prism_register_dashboard_page');

function rss_prism_render_admin_dashboard_page() {
	if (!current_user_can('edit_theme_options')) {
		return;
	}
	echo '<div class="wrap"><h1>' . esc_html__('RSS Prism Dashboard', 'rss-prism') . '</h1>';
	rss_prism_render_admin_dashboard_panel(true);
	echo '</div>';
}

function rss_prism_admin_dashboard_styles($hook) {
	if (!in_array($hook, array('index.php', 'appearance_page_rss-prism-dashboard'), true)) {
		return;
	}
	wp_register_style('rss-prism-admin-dashboard', false, array(), wp_get_theme()->get('Version'));
	wp_enqueue_style('rss-prism-admin-dashboard');
	wp_add_inline_style('rss-prism-admin-dashboard', '
		.rp-admin-dashboard{max-width:1280px;margin:14px 0 24px;color:#202124}
		.rp-admin-dashboard__hero{padding:28px 30px;border:1px solid #e2e4e8;border-left:5px solid #b88a2b;border-radius:14px;background:radial-gradient(circle at 92% 0,rgba(184,138,43,.16),transparent 36%),linear-gradient(135deg,#fffdf7,#f5f6f8)}
		.rp-admin-dashboard__eyebrow{font-size:11px;font-weight:800;letter-spacing:.15em;color:#926b1b}
		.rp-admin-dashboard__hero h2{margin:8px 0;font-size:28px;letter-spacing:-.025em;color:#182030}
		.rp-admin-dashboard__hero>p:not(.rp-admin-dashboard__eyebrow){max-width:700px;color:#626875;font-size:14px}
		.rp-admin-dashboard__actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:18px}
		.rp-admin-dashboard__grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:14px}
		.rp-admin-dashboard__card{padding:20px;border:1px solid #e1e4e9;border-radius:12px;background:#fff;box-shadow:0 4px 16px rgba(24,32,48,.035)}
		.rp-admin-dashboard__card h3{margin:0 0 10px;font-size:15px;color:#182030}
		.rp-admin-dashboard__card p,.rp-admin-dashboard__card li{color:#626875;line-height:1.65}
		.rp-admin-dashboard__version{font-size:20px;font-weight:750;color:#182030!important}
		.rp-admin-dashboard__card ul{margin:0 0 0 18px;list-style:disc}
		@media(max-width:782px){.rp-admin-dashboard__grid{grid-template-columns:1fr}.rp-admin-dashboard__hero{padding:22px}.rp-admin-dashboard__hero h2{font-size:24px}}
	');
}
add_action('admin_enqueue_scripts', 'rss_prism_admin_dashboard_styles');
