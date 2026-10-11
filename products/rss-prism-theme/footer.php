<?php
defined('ABSPATH') || exit;
rss_prism_render_footer_builder();
if (get_theme_mod('rss_prism_show_back_to_top', true)) : ?>
<a class="rp-back-to-top" href="#top" aria-label="<?php esc_attr_e('Back to top', 'rss-prism'); ?>">↑ <span><?php esc_html_e('Top', 'rss-prism'); ?></span></a>
<?php endif; ?>
<?php wp_footer(); ?></body></html>
