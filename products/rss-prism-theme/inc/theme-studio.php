<?php
/**
 * RSS Prism visual Header & Footer Studio.
 * @package RSSPrism
 */
defined('ABSPATH') || exit;

function rss_prism_studio_default_layout($type) {
	if ('header' === $type) {
		return array(
			array(),
			array('brand', 'menu', 'button'),
			array(),
		);
	}
	return array(
		array('brand', 'description'),
		array('menu', 'widgets'),
		array('copyright', 'credit'),
	);
}

function rss_prism_studio_allowed_elements($type) {
	return 'header' === $type
		? array('brand', 'menu', 'button', 'search', 'social')
		: array('brand', 'description', 'menu', 'widgets', 'social', 'copyright', 'credit');
}

function rss_prism_studio_layout($type) {
	$allowed = rss_prism_studio_allowed_elements($type);
	$layout = get_option('rss_prism_' . $type . '_builder_rows', rss_prism_studio_default_layout($type));
	if (!is_array($layout)) {
		$layout = rss_prism_studio_default_layout($type);
	}
	$rows = array();
	for ($i = 0; $i < 3; $i++) {
		$source = isset($layout[$i]) && is_array($layout[$i]) ? $layout[$i] : array();
		$rows[$i] = array_values(array_unique(array_filter(array_map('sanitize_key', $source), function($item) use ($allowed) {
			return in_array($item, $allowed, true);
		})));
	}
	return $rows;
}

function rss_prism_studio_element_label($element) {
	$labels = array(
		'brand' => __('Logo & site identity', 'rss-prism'),
		'menu' => __('Navigation menu', 'rss-prism'),
		'button' => __('Call-to-action button', 'rss-prism'),
		'search' => __('Search form', 'rss-prism'),
		'social' => __('Social links', 'rss-prism'),
		'description' => __('Footer description', 'rss-prism'),
		'widgets' => __('Footer widgets', 'rss-prism'),
		'copyright' => __('Copyright', 'rss-prism'),
		'credit' => __('RSS Prism credit', 'rss-prism'),
	);
	return isset($labels[$element]) ? $labels[$element] : ucfirst($element);
}

function rss_prism_studio_render_element($element, $type) {
	switch ($element) {
		case 'brand':
			echo '<div class="rp-studio-brand">';
			if (has_custom_logo()) {
				the_custom_logo();
			} else {
				echo '<a class="rp-studio-site-title" href="' . esc_url(home_url('/')) . '">' . esc_html(get_bloginfo('name')) . '</a>';
			}
			if ('footer' === $type && get_bloginfo('description')) {
				echo '<span class="rp-studio-tagline">' . esc_html(get_bloginfo('description')) . '</span>';
			}
			echo '</div>';
			break;
		case 'menu':
			if ('header' === $type) {
				echo '<nav class="main-navigation" id="primary-menu" aria-label="' . esc_attr__('Primary navigation', 'rss-prism') . '">';
				wp_nav_menu(array('theme_location' => 'primary', 'container' => false, 'fallback_cb' => 'wp_page_menu', 'depth' => 3));
				echo '</nav>';
			} else {
				wp_nav_menu(array('theme_location' => 'footer', 'container' => 'nav', 'container_class' => 'footer-navigation', 'fallback_cb' => false));
			}
			break;
		case 'button':
			$label = sanitize_text_field(get_theme_mod('rss_prism_header_button_label', __('Get in touch', 'rss-prism')));
			$url = esc_url(get_theme_mod('rss_prism_header_button_url', home_url('/#contact')));
			if ($label && $url) {
				echo '<a class="rp-header-cta" href="' . $url . '">' . esc_html($label) . '</a>';
			}
			break;
		case 'search':
			get_search_form();
			break;
		case 'social':
			$social_url = esc_url(get_theme_mod('rss_prism_social_url', ''));
			if ($social_url) {
				echo '<a class="rp-social-link" href="' . $social_url . '" rel="me noopener noreferrer" target="_blank">' . esc_html__('Follow RSS', 'rss-prism') . '</a>';
			}
			break;
		case 'description':
			echo '<p class="site-footer__copy">' . esc_html(get_theme_mod('rss_prism_footer_text', 'Developing Ideas. Delivering Solutions.')) . '</p>';
			break;
		case 'widgets':
			if (is_active_sidebar('footer-1')) {
				dynamic_sidebar('footer-1');
			} else {
				echo '<p class="rp-studio-help">' . esc_html__('Add widgets under Appearance → Widgets to fill this area.', 'rss-prism') . '</p>';
			}
			break;
		case 'copyright':
			$copyright = trim((string) get_theme_mod('rss_prism_footer_copyright', ''));
			if (!$copyright) {
				$copyright = '© ' . wp_date('Y') . ' ' . get_bloginfo('name') . '. ' . __('All rights reserved.', 'rss-prism');
			}
			echo '<span>' . esc_html($copyright) . '</span>';
			break;
		case 'credit':
			$is_premium = (bool) apply_filters('rss_prism_is_premium_licensed', false);
			if (!$is_premium) {
				echo '<span class="rp-prism-credit">' . esc_html__('Powered by', 'rss-prism') . ' <a href="https://github.com/riyazamra1/RSS-Prism" rel="noopener noreferrer">RSS Prism Theme</a></span>';
			}
			break;
	}
}

function rss_prism_render_header_builder() {
	$rows = rss_prism_studio_layout('header');
	$style = sanitize_html_class(get_theme_mod('rss_prism_header_style', 'standard'));
	echo '<div class="rp-header-builder rp-header-builder--' . esc_attr($style) . '">';
	foreach ($rows as $index => $elements) {
		if (!$elements) {
			continue;
		}
		echo '<div class="rp-header-builder__row rp-header-builder__row--' . esc_attr((string) $index) . '">';
		foreach ($elements as $element) {
			echo '<div class="rp-header-builder__item rp-header-builder__item--' . esc_attr($element) . '">';
			rss_prism_studio_render_element($element, 'header');
			echo '</div>';
		}
		echo '</div>';
	}
	echo '</div>';
}

function rss_prism_render_footer_builder() {
	$rows = rss_prism_studio_layout('footer');
	$style = sanitize_html_class(get_theme_mod('rss_prism_footer_style', 'light'));
	$alignment = sanitize_html_class(get_theme_mod('rss_prism_footer_alignment', 'left'));
	$columns = sanitize_html_class(get_theme_mod('rss_prism_footer_columns', 'three'));
	$logo_position = sanitize_html_class(get_theme_mod('rss_prism_footer_logo_position', 'left'));
	echo '<footer class="site-footer site-footer--' . esc_attr($style) . ' rp-footer-builder rp-footer-align--' . esc_attr($alignment) . ' rp-footer-columns--' . esc_attr($columns) . ' rp-footer-logo--' . esc_attr($logo_position) . '">';
	foreach ($rows as $index => $elements) {
		if (!$elements) {
			continue;
		}
		$row_class = 2 === $index ? ' rp-footer-builder__row--bottom' : '';
		echo '<div class="rp-footer-builder__row' . esc_attr($row_class) . ' rp-container">';
		foreach ($elements as $element) {
			echo '<div class="rp-footer-builder__item rp-footer-builder__item--' . esc_attr($element) . '">';
			rss_prism_studio_render_element($element, 'footer');
			echo '</div>';
		}
		echo '</div>';
	}
	echo '</footer>';
}

function rss_prism_studio_admin_menu() {
	add_theme_page(__('RSS Prism Studio', 'rss-prism'), __('RSS Prism Studio', 'rss-prism'), 'edit_theme_options', 'rss-prism-studio', 'rss_prism_studio_admin_page');
}
add_action('admin_menu', 'rss_prism_studio_admin_menu');

function rss_prism_studio_admin_assets($hook) {
	if ('appearance_page_rss-prism-studio' !== $hook) {
		return;
	}
	wp_enqueue_style('rss-prism-studio-admin', get_template_directory_uri() . '/assets/css/theme-studio.css', array(), wp_get_theme()->get('Version'));
	wp_enqueue_script('rss-prism-studio-admin', get_template_directory_uri() . '/assets/js/theme-studio.js', array(), wp_get_theme()->get('Version'), true);
	wp_localize_script('rss-prism-studio-admin', 'rssPrismStudio', array(
		'header' => rss_prism_studio_layout('header'),
		'footer' => rss_prism_studio_layout('footer'),
		'labels' => array(
			'brand' => rss_prism_studio_element_label('brand'),
			'menu' => rss_prism_studio_element_label('menu'),
			'button' => rss_prism_studio_element_label('button'),
			'search' => rss_prism_studio_element_label('search'),
			'social' => rss_prism_studio_element_label('social'),
			'description' => rss_prism_studio_element_label('description'),
			'widgets' => rss_prism_studio_element_label('widgets'),
			'copyright' => rss_prism_studio_element_label('copyright'),
			'credit' => rss_prism_studio_element_label('credit'),
		),
	));
}
add_action('admin_enqueue_scripts', 'rss_prism_studio_admin_assets');

function rss_prism_studio_admin_page() {
	if (!current_user_can('edit_theme_options')) {
		return;
	}
	$header = rss_prism_studio_layout('header');
	$footer = rss_prism_studio_layout('footer');
	$header_elements = rss_prism_studio_allowed_elements('header');
	$footer_elements = rss_prism_studio_allowed_elements('footer');
	?>
	<div class="wrap rp-studio-wrap">
		<div class="rp-studio-heading">
			<div><span class="rp-studio-kicker"><?php esc_html_e('RSS PRISM · DESIGN STUDIO', 'rss-prism'); ?></span><h1><?php esc_html_e('Theme Customizer', 'rss-prism'); ?></h1><p><?php esc_html_e('Arrange your header and footer visually, then preview your changes on the live site. Website design works locally in WordPress and never requires a licence-server URL.', 'rss-prism'); ?></p></div>
			<div class="rp-studio-actions"><a class="button" href="<?php echo esc_url(admin_url('customize.php')); ?>"><?php esc_html_e('More theme settings', 'rss-prism'); ?></a><a class="button button-primary" href="<?php echo esc_url(home_url('/')); ?>" target="_blank" rel="noopener noreferrer"><?php esc_html_e('Open site preview', 'rss-prism'); ?> ↗</a></div>
		</div>
		<div class="rp-studio-plan"><strong><?php esc_html_e('FREE PLAN', 'rss-prism'); ?></strong><span><?php esc_html_e('Header/footer layout, colours, typography and responsive behaviour are available. The RSS Prism footer credit stays enabled on the free plan.', 'rss-prism'); ?></span></div>
		<form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>" id="rp-studio-form">
			<input type="hidden" name="action" value="rss_prism_save_studio"><?php wp_nonce_field('rss_prism_save_studio', 'rss_prism_studio_nonce'); ?>
			<input type="hidden" name="rss_prism_header_rows_json" id="rp-header-rows-json" value="<?php echo esc_attr(wp_json_encode($header)); ?>">
			<input type="hidden" name="rss_prism_footer_rows_json" id="rp-footer-rows-json" value="<?php echo esc_attr(wp_json_encode($footer)); ?>">
			<div class="rp-studio-workspace">
				<section class="rp-studio-panel">
					<div class="rp-studio-tabs" role="tablist"><button type="button" class="is-active" data-studio-tab="header"><?php esc_html_e('Header Builder', 'rss-prism'); ?></button><button type="button" data-studio-tab="footer"><?php esc_html_e('Footer Builder', 'rss-prism'); ?></button></div>
					<div class="rp-studio-editor is-active" data-studio-editor="header">
						<h2><?php esc_html_e('Build your header', 'rss-prism'); ?></h2><p><?php esc_html_e('Drag elements between rows to change their order. Empty rows are hidden on your website.', 'rss-prism'); ?></p>
						<div class="rp-studio-available"><strong><?php esc_html_e('Add elements', 'rss-prism'); ?></strong><div class="rp-studio-palette"><?php foreach ($header_elements as $element): ?><button type="button" class="rp-studio-chip" draggable="true" data-element="<?php echo esc_attr($element); ?>" data-source="palette"><?php echo esc_html(rss_prism_studio_element_label($element)); ?> <span>+</span></button><?php endforeach; ?></div></div>
						<div class="rp-studio-rows" data-builder-rows="header"><?php foreach ($header as $index => $elements): ?><div class="rp-studio-row" data-row="<?php echo esc_attr((string) $index); ?>"><div class="rp-studio-row-head"><strong><?php echo esc_html(sprintf(__('Header row %d', 'rss-prism'), $index + 1)); ?></strong><span><?php echo esc_html(0 === $index ? __('Brand area', 'rss-prism') : (1 === $index ? __('Main navigation', 'rss-prism') : __('Utility row', 'rss-prism'))); ?></span></div><div class="rp-studio-dropzone" data-dropzone="header" aria-label="<?php echo esc_attr(sprintf(__('Drop header elements into row %d', 'rss-prism'), $index + 1)); ?>"><?php foreach ($elements as $element): ?><button type="button" class="rp-studio-chip" draggable="true" data-element="<?php echo esc_attr($element); ?>"><?php echo esc_html(rss_prism_studio_element_label($element)); ?><span class="rp-studio-remove" aria-label="<?php esc_attr_e('Remove element', 'rss-prism'); ?>">×</span></button><?php endforeach; ?><span class="rp-studio-empty"><?php esc_html_e('Drop elements here', 'rss-prism'); ?></span></div></div><?php endforeach; ?></div>
					</div>
					<div class="rp-studio-editor" data-studio-editor="footer">
						<h2><?php esc_html_e('Build your footer', 'rss-prism'); ?></h2><p><?php esc_html_e('Organise identity, navigation, widgets, copyright and the required free-theme credit.', 'rss-prism'); ?></p>
						<div class="rp-studio-available"><strong><?php esc_html_e('Add elements', 'rss-prism'); ?></strong><div class="rp-studio-palette"><?php foreach ($footer_elements as $element): ?><button type="button" class="rp-studio-chip" draggable="true" data-element="<?php echo esc_attr($element); ?>" data-source="palette"><?php echo esc_html(rss_prism_studio_element_label($element)); ?> <span>+</span></button><?php endforeach; ?></div></div>
						<div class="rp-studio-rows" data-builder-rows="footer"><?php foreach ($footer as $index => $elements): ?><div class="rp-studio-row" data-row="<?php echo esc_attr((string) $index); ?>"><div class="rp-studio-row-head"><strong><?php echo esc_html(sprintf(__('Footer row %d', 'rss-prism'), $index + 1)); ?></strong><span><?php echo esc_html(2 === $index ? __('Bottom bar', 'rss-prism') : (0 === $index ? __('Top row', 'rss-prism') : __('Content row', 'rss-prism'))); ?></span></div><div class="rp-studio-dropzone" data-dropzone="footer" aria-label="<?php echo esc_attr(sprintf(__('Drop footer elements into row %d', 'rss-prism'), $index + 1)); ?>"><?php foreach ($elements as $element): ?><button type="button" class="rp-studio-chip" draggable="true" data-element="<?php echo esc_attr($element); ?>"><?php echo esc_html(rss_prism_studio_element_label($element)); ?><?php if ('credit' === $element): ?><span class="rp-studio-lock" title="<?php esc_attr_e('Required for free users', 'rss-prism'); ?>">●</span><?php else: ?><span class="rp-studio-remove" aria-label="<?php esc_attr_e('Remove element', 'rss-prism'); ?>">×</span><?php endif; ?></button><?php endforeach; ?><span class="rp-studio-empty"><?php esc_html_e('Drop elements here', 'rss-prism'); ?></span></div></div><?php endforeach; ?></div>
					</div>
					<div class="rp-studio-controls">
						<h2><?php esc_html_e('Header button', 'rss-prism'); ?></h2>
						<div class="rp-studio-fields"><label><?php esc_html_e('Button label', 'rss-prism'); ?><input type="text" name="rss_prism_header_button_label" maxlength="60" value="<?php echo esc_attr(get_theme_mod('rss_prism_header_button_label', __('Get in touch', 'rss-prism'))); ?>"></label><label><?php esc_html_e('Button URL', 'rss-prism'); ?><input type="url" name="rss_prism_header_button_url" value="<?php echo esc_attr(get_theme_mod('rss_prism_header_button_url', home_url('/#contact'))); ?>"></label><label><?php esc_html_e('Social profile URL (optional)', 'rss-prism'); ?><input type="url" name="rss_prism_social_url" value="<?php echo esc_attr(get_theme_mod('rss_prism_social_url', '')); ?>"></label></div>
						<p class="description"><?php esc_html_e('Use the WordPress Customizer for global colours, typography scale, button shape, content width and existing layout options.', 'rss-prism'); ?></p>
					</div>
				</section>
				<aside class="rp-studio-preview-panel"><div class="rp-studio-preview-head"><div><strong><?php esc_html_e('Live site preview', 'rss-prism'); ?></strong><span><?php esc_html_e('Changes appear after saving', 'rss-prism'); ?></span></div><div class="rp-studio-device-icons" role="group" aria-label="<?php esc_attr_e('Preview sizes', 'rss-prism'); ?>"><button type="button" class="is-active" data-preview-width="100%" aria-label="<?php esc_attr_e('Desktop preview', 'rss-prism'); ?>">▰</button><button type="button" data-preview-width="768px" aria-label="<?php esc_attr_e('Tablet preview', 'rss-prism'); ?>">▯</button><button type="button" data-preview-width="390px" aria-label="<?php esc_attr_e('Mobile preview', 'rss-prism'); ?>">▯</button></div></div><iframe title="<?php esc_attr_e('Website preview', 'rss-prism'); ?>" src="<?php echo esc_url(add_query_arg('rp_studio_preview', '1', home_url('/'))); ?>" loading="lazy"></iframe><p><?php esc_html_e('For the closest result, open the site preview in another tab after saving. WordPress may restrict previews when security headers are enabled.', 'rss-prism'); ?></p></aside>
			</div>
			<div class="rp-studio-savebar"><span><?php esc_html_e('Your layout is saved in this WordPress site.', 'rss-prism'); ?></span><button type="submit" class="button button-primary button-hero"><?php esc_html_e('Save header & footer', 'rss-prism'); ?></button></div>
		</form>
		<div class="rp-studio-premium-note"><strong><?php esc_html_e('Advanced design features', 'rss-prism'); ?></strong><span><?php esc_html_e('Additional advanced layouts and effects can be added to a future Premium release. Premium licensing and payment verification are not yet active; no paid feature is represented as unlocked.', 'rss-prism'); ?></span></div>
	</div>
	<?php
}

function rss_prism_save_studio() {
	if (!current_user_can('edit_theme_options')) {
		wp_die(esc_html__('You are not allowed to change theme settings.', 'rss-prism'));
	}
	check_admin_referer('rss_prism_save_studio', 'rss_prism_studio_nonce');
	foreach (array('header', 'footer') as $type) {
		$field = 'rss_prism_' . $type . '_rows_json';
		$raw = isset($_POST[$field]) ? json_decode(wp_unslash($_POST[$field]), true) : null;
		$allowed = rss_prism_studio_allowed_elements($type);
		$rows = array();
		for ($i = 0; $i < 3; $i++) {
			$items = isset($raw[$i]) && is_array($raw[$i]) ? $raw[$i] : array();
			$clean = array();
			foreach ($items as $item) {
				$item = sanitize_key($item);
				if (in_array($item, $allowed, true) && !in_array($item, $clean, true)) {
					$clean[] = $item;
				}
			}
			$rows[] = $clean;
		}
		if ('footer' === $type) {
			foreach ($rows as $row_index => $row_items) {
				$rows[$row_index] = array_values(array_diff($row_items, array('credit')));
			}
			$rows[2][] = 'credit';
		}
		update_option('rss_prism_' . $type . '_builder_rows', $rows, false);
	}
	if (isset($_POST['rss_prism_header_button_label'])) {
		set_theme_mod('rss_prism_header_button_label', sanitize_text_field(wp_unslash($_POST['rss_prism_header_button_label'])));
	}
	if (isset($_POST['rss_prism_header_button_url'])) {
		set_theme_mod('rss_prism_header_button_url', esc_url_raw(wp_unslash($_POST['rss_prism_header_button_url'])));
	}
	if (isset($_POST['rss_prism_social_url'])) {
		set_theme_mod('rss_prism_social_url', esc_url_raw(wp_unslash($_POST['rss_prism_social_url'])));
	}
	wp_safe_redirect(add_query_arg('rp_studio_saved', '1', admin_url('themes.php?page=rss-prism-studio')));
	exit;
}
add_action('admin_post_rss_prism_save_studio', 'rss_prism_save_studio');

function rss_prism_studio_saved_notice() {
	if (!isset($_GET['page'], $_GET['rp_studio_saved']) || 'rss-prism-studio' !== sanitize_key(wp_unslash($_GET['page'])) || '1' !== sanitize_text_field(wp_unslash($_GET['rp_studio_saved']))) {
		return;
	}
	echo '<div class="notice notice-success is-dismissible"><p>' . esc_html__('RSS Prism header and footer layout saved.', 'rss-prism') . '</p></div>';
}
add_action('admin_notices', 'rss_prism_studio_saved_notice');
