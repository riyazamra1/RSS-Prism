<?php
/**
 * RSS Prism theme setup.
 * @package RSSPrism
 */
defined( 'ABSPATH' ) || exit;

function rss_prism_setup() {
	load_theme_textdomain( 'rss-prism', get_template_directory() . '/languages' );
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'custom-logo', array( 'height' => 100, 'width' => 320, 'flex-height' => true, 'flex-width' => true ) );
	add_theme_support( 'automatic-feed-links' );
	add_theme_support( 'responsive-embeds' );
	add_theme_support( 'align-wide' );
	add_theme_support( 'wp-block-styles' );
	add_theme_support( 'editor-styles' );
	add_editor_style( 'style.css' );
	register_nav_menus( array(
		'primary' => __( 'Primary Menu', 'rss-prism' ),
		'footer'  => __( 'Footer Menu', 'rss-prism' ),
	) );
}
add_action( 'after_setup_theme', 'rss_prism_setup' );
add_theme_support( 'html5', array( 'search-form','comment-form','comment-list','gallery','caption','style','script' ) );

function rss_prism_customize_register( $wp_customize ) {
	$wp_customize->add_section( 'rss_prism_design', array(
		'title'       => __( 'RSS Prism Design', 'rss-prism' ),
		'priority'    => 35,
		'description' => __( 'Adjust the theme colours and content width.', 'rss-prism' ),
	) );

	$wp_customize->add_setting( 'rss_prism_accent_color', array(
		'default'           => '#b88a2b',
		'sanitize_callback' => 'sanitize_hex_color',
		'transport'         => 'refresh',
	) );
	$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'rss_prism_accent_color', array(
		'label'   => __( 'Accent colour', 'rss-prism' ),
		'section' => 'rss_prism_design',
	) ) );

	$wp_customize->add_setting( 'rss_prism_background_color', array(
		'default'           => '#f7f7f5',
		'sanitize_callback' => 'sanitize_hex_color',
		'transport'         => 'refresh',
	) );
	$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'rss_prism_background_color', array(
		'label'   => __( 'Page background', 'rss-prism' ),
		'section' => 'rss_prism_design',
	) ) );

	$extra_colors = array('surface_color'=>array(__('Card and header surface','rss-prism'),'#ffffff'),'text_color'=>array(__('Main text colour','rss-prism'),'#202124'),'muted_color'=>array(__('Secondary text colour','rss-prism'),'#686b70'));
	foreach($extra_colors as $key=>$item){$setting='rss_prism_'.$key;$wp_customize->add_setting($setting,array('default'=>$item[1],'sanitize_callback'=>'sanitize_hex_color','transport'=>'refresh'));$wp_customize->add_control(new WP_Customize_Color_Control($wp_customize,$setting,array('label'=>$item[0],'section'=>'rss_prism_design')));}

	$wp_customize->add_setting( 'rss_prism_content_width', array(
		'default'           => 1120,
		'sanitize_callback' => 'absint',
		'validate_callback' => function( $validity, $value ) {
			if ( $value < 720 || $value > 1600 ) {
				$validity->add( 'invalid_width', __( 'Choose a width between 720 and 1600 pixels.', 'rss-prism' ) );
			}
			return $validity;
		},
		'transport' => 'refresh',
	) );
	$wp_customize->add_control( 'rss_prism_content_width', array(
		'label'       => __( 'Content width (pixels)', 'rss-prism' ),
		'section'     => 'rss_prism_design',
		'type'        => 'number',
		'input_attrs' => array( 'min' => 720, 'max' => 1600, 'step' => 20 ),
	) );

	$wp_customize->add_panel('rss_prism_panel',array('title'=>__('RSS Prism Theme Settings','rss-prism'),'priority'=>30,'description'=>__('Customize homepage, layouts, and footer.','rss-prism')));
	$wp_customize->add_section('rss_prism_home',array('title'=>__('Homepage Hero','rss-prism'),'panel'=>'rss_prism_panel','priority'=>30));
	$fields=array('hero_eyebrow'=>array(__('Small heading','rss-prism'),'A CLEARER WAY FORWARD'),'hero_title'=>array(__('Main heading','rss-prism'),'Build something remarkable.'),'hero_text'=>array(__('Supporting text','rss-prism'),'A flexible starting point for your business, portfolio, publication, or personal website.'),'hero_primary_label'=>array(__('Primary button label','rss-prism'),'Explore our work'),'hero_primary_url'=>array(__('Primary button URL','rss-prism'),'#latest'),'hero_secondary_label'=>array(__('Secondary button label','rss-prism'),'Learn more'),'hero_secondary_url'=>array(__('Secondary button URL','rss-prism'),'#about'),'features_title'=>array(__('Features heading','rss-prism'),'Everything you need to begin'),'features_text'=>array(__('Features description','rss-prism'),'Flexible building blocks to make the site your own.'),'cta_title'=>array(__('Call-to-action heading','rss-prism'),'Ready to get started?'),'cta_text'=>array(__('Call-to-action text','rss-prism'),'Make your next idea real with a website that grows with you.'),'cta_label'=>array(__('Call-to-action button','rss-prism'),'Get in touch'),'cta_url'=>array(__('Call-to-action URL','rss-prism'),'#contact'));
	foreach($fields as $key=>$field){$id='rss_prism_'.$key;$wp_customize->add_setting($id,array('default'=>$field[1],'sanitize_callback'=>strpos($key,'url')!==false?'esc_url_raw':'sanitize_text_field'));$wp_customize->add_control($id,array('label'=>$field[0],'section'=>'rss_prism_home','type'=>strpos($key,'text')!==false?'textarea':(strpos($key,'url')!==false?'url':'text')));}
	$wp_customize->add_section('rss_prism_layouts',array('title'=>__('Layouts & Style','rss-prism'),'panel'=>'rss_prism_panel','priority'=>40));
	$choices=array('rss_prism_header_style'=>array('standard',array('standard'=>__('Logo left · menu right','rss-prism'),'centered'=>__('Centered brand','rss-prism'),'minimal'=>__('Compact header','rss-prism'),'dark'=>__('Dark header','rss-prism'))),'rss_prism_blog_layout'=>array('grid',array('grid'=>__('Card grid','rss-prism'),'list'=>__('Horizontal list','rss-prism'))),'rss_prism_corner_style'=>array('round',array('sharp'=>__('Sharp corners','rss-prism'),'round'=>__('Rounded corners','rss-prism'),'soft'=>__('Extra rounded corners','rss-prism'))),'rss_prism_shadow'=>array('yes',array('yes'=>__('Subtle shadows','rss-prism'),'no'=>__('No shadows','rss-prism'))));
	foreach($choices as $id=>$cfg){$wp_customize->add_setting($id,array('default'=>$cfg[0],'sanitize_callback'=>function($v)use($cfg){return array_key_exists($v,$cfg[1])?$v:$cfg[0];}));$wp_customize->add_control($id,array('label'=>ucwords(str_replace(array('rss_prism_','_'),array('',' '),$id)),'section'=>'rss_prism_layouts','type'=>'select','choices'=>$cfg[1]));}
	
 $more_choices=array('rss_prism_font_scale'=>array('normal',array('small'=>__('Compact','rss-prism'),'normal'=>__('Standard','rss-prism'),'large'=>__('Large and readable','rss-prism'))),'rss_prism_button_shape'=>array('pill',array('square'=>__('Square','rss-prism'),'soft'=>__('Soft corners','rss-prism'),'pill'=>__('Pill','rss-prism'))),'rss_prism_content_alignment'=>array('left',array('left'=>__('Left aligned','rss-prism'),'center'=>__('Centered headings','rss-prism'))));
 foreach($more_choices as $id=>$cfg){$wp_customize->add_setting($id,array('default'=>$cfg[0],'sanitize_callback'=>function($v)use($cfg){return array_key_exists($v,$cfg[1])?$v:$cfg[0];}));$wp_customize->add_control($id,array('label'=>ucwords(str_replace(array('rss_prism_','_'),array('',' '),$id)),'section'=>'rss_prism_layouts','type'=>'select','choices'=>$cfg[1]));}
 foreach(array('rss_prism_show_archive_images'=>__('Show featured images in article cards','rss-prism'),'rss_prism_show_breadcrumbs'=>__('Show breadcrumb navigation','rss-prism'),'rss_prism_show_back_to_top'=>__('Show back-to-top link','rss-prism'),'rss_prism_show_hero_visual'=>__('Show homepage hero artwork','rss-prism')) as $id=>$label){$wp_customize->add_setting($id,array('default'=>true,'sanitize_callback'=>'rest_sanitize_boolean'));$wp_customize->add_control($id,array('label'=>$label,'section'=>'rss_prism_layouts','type'=>'checkbox'));}

 $wp_customize->add_setting('rss_prism_sticky_header',array('default'=>false,'sanitize_callback'=>'rest_sanitize_boolean'));$wp_customize->add_control('rss_prism_sticky_header',array('label'=>__('Sticky header','rss-prism'),'section'=>'rss_prism_layouts','type'=>'checkbox'));
	$wp_customize->add_setting('rss_prism_show_author',array('default'=>true,'sanitize_callback'=>'rest_sanitize_boolean'));$wp_customize->add_control('rss_prism_show_author',array('label'=>__('Show post author','rss-prism'),'section'=>'rss_prism_layouts','type'=>'checkbox'));
	$wp_customize->add_setting('rss_prism_show_sidebar',array('default'=>true,'sanitize_callback'=>'rest_sanitize_boolean'));$wp_customize->add_control('rss_prism_show_sidebar',array('label'=>__('Show sidebar widgets','rss-prism'),'section'=>'rss_prism_layouts','type'=>'checkbox'));
	$wp_customize->add_section('rss_prism_footer',array('title'=>__('Footer','rss-prism'),'panel'=>'rss_prism_panel','priority'=>50));
	$wp_customize->add_setting('rss_prism_footer_text',array('default'=>'Ideas made clearer.','sanitize_callback'=>'sanitize_text_field'));$wp_customize->add_control('rss_prism_footer_text',array('label'=>__('Footer description','rss-prism'),'section'=>'rss_prism_footer','type'=>'textarea'));
	$wp_customize->add_setting('rss_prism_footer_copyright',array('default'=>'','sanitize_callback'=>'sanitize_text_field'));$wp_customize->add_control('rss_prism_footer_copyright',array('label'=>__('Footer copyright text (optional)','rss-prism'),'description'=>__('Leave blank to use the site name and current year.','rss-prism'),'section'=>'rss_prism_footer','type'=>'text'));
 $wp_customize->add_setting('rss_prism_footer_style',array('default'=>'light','sanitize_callback'=>function($v){return in_array($v,array('light','dark'),true)?$v:'light';}));$wp_customize->add_control('rss_prism_footer_style',array('label'=>__('Footer style','rss-prism'),'section'=>'rss_prism_footer','type'=>'select','choices'=>array('light'=>__('Light','rss-prism'),'dark'=>__('Dark','rss-prism'))));

}
add_action( 'customize_register', 'rss_prism_customize_register' );

function rss_prism_enqueue_assets() {
	wp_enqueue_style( 'rss-prism-style', get_stylesheet_uri(), array(), wp_get_theme()->get( 'Version' ) );
	wp_enqueue_script( 'rss-prism-navigation', get_template_directory_uri() . '/assets/js/navigation.js', array(), wp_get_theme()->get( 'Version' ), true );
	$accent = sanitize_hex_color( get_theme_mod( 'rss_prism_accent_color', '#b88a2b' ) );
	$background = sanitize_hex_color( get_theme_mod( 'rss_prism_background_color', '#f7f7f5' ) );
	$width = absint( get_theme_mod( 'rss_prism_content_width', 1120 ) );
	$width = min( 1600, max( 720, $width ) );
	$corner=get_theme_mod('rss_prism_corner_style','round');if(!in_array($corner,array('sharp','round','soft'),true))$corner='round';$radius=array('sharp'=>'4px','round'=>'16px','soft'=>'24px')[$corner];$surface=sanitize_hex_color(get_theme_mod('rss_prism_surface_color','#ffffff'));$text=sanitize_hex_color(get_theme_mod('rss_prism_text_color','#202124'));$muted=sanitize_hex_color(get_theme_mod('rss_prism_muted_color','#686b70'));$css=':root{--rss-prism-accent:'.($accent?$accent:'#b88a2b').';--rss-prism-background:'.($background?$background:'#f5f6f8').';--rss-prism-content-width:'.$width.'px;--rp-accent:'.($accent?$accent:'#b88a2b').';--rp-bg:'.($background?$background:'#f5f6f8').';--rp-width:'.$width.'px;--rp-paper:'.($surface?$surface:'#ffffff').';--rp-ink:'.($text?$text:'#202124').';--rp-muted:'.($muted?$muted:'#686b70').';--rp-radius:'.$radius.';'.('no'===get_theme_mod('rss_prism_shadow','yes')?'--rp-shadow:none;':'').'}';
	$font_scale=get_theme_mod('rss_prism_font_scale','normal');if(!in_array($font_scale,array('small','normal','large'),true))$font_scale='normal';$font_size=array('small'=>'15px','normal'=>'16px','large'=>'18px')[$font_scale];$button_shape=get_theme_mod('rss_prism_button_shape','pill');if(!in_array($button_shape,array('square','soft','pill'),true))$button_shape='pill';$button_radius=array('square'=>'4px','soft'=>'12px','pill'=>'999px')[$button_shape];$css=substr($css,0,-1).'--rp-font-size:'.$font_size.';--rp-button-radius:'.$button_radius.';}';
	wp_add_inline_style( 'rss-prism-style', $css );
}
add_action( 'wp_enqueue_scripts', 'rss_prism_enqueue_assets' );

function rss_prism_content_width() {
	$GLOBALS['content_width'] = min( 1600, max( 720, absint( get_theme_mod( 'rss_prism_content_width', 1120 ) ) ) );
}
add_action( 'after_setup_theme', 'rss_prism_content_width', 0 );

function rss_prism_excerpt_more( $more ) {
	return '';
}
add_filter( 'excerpt_more', 'rss_prism_excerpt_more' );

function rss_prism_excerpt_length( $length ) {
	return 28;
}
add_filter( 'excerpt_length', 'rss_prism_excerpt_length' );

function rss_prism_body_classes($classes){$classes[]='rp-layout--'.sanitize_html_class(get_theme_mod('rss_prism_blog_layout','grid'));$classes[]='rp-content-align--'.sanitize_html_class(get_theme_mod('rss_prism_content_alignment','left'));if(!get_theme_mod('rss_prism_show_sidebar',true))$classes[]='rp-sidebar-hidden';if(!get_theme_mod('rss_prism_show_hero_visual',true))$classes[]='rp-hero-visual-hidden';return $classes;} add_filter('body_class','rss_prism_body_classes');
function rss_prism_meta(){echo '<div class="entry-meta"><time datetime="'.esc_attr(get_the_date(DATE_W3C)).'">'.esc_html(get_the_date()).'</time>';if(get_theme_mod('rss_prism_show_author',true))echo '<span aria-hidden="true"> · </span>'.wp_kses_post(get_the_author_posts_link());echo '</div>';}
function rss_prism_post_card(){?><article <?php post_class('entry-card'); ?> id="post-<?php the_ID(); ?>"><?php if(get_theme_mod('rss_prism_show_archive_images',true)&&has_post_thumbnail()):?><a class="entry-thumbnail" href="<?php the_permalink(); ?>" tabindex="-1" aria-hidden="true"><?php the_post_thumbnail('large',array('loading'=>'lazy'));?></a><?php endif;?><div class="entry-card__body"><?php rss_prism_meta();?><h2 class="entry-title"><a href="<?php the_permalink(); ?>"><?php the_title();?></a></h2><div class="entry-excerpt"><?php the_excerpt();?></div><a class="entry-read-more" href="<?php the_permalink(); ?>"><?php esc_html_e('Read article','rss-prism');?> →</a></div></article><?php}
function rss_prism_sidebar(){if(get_theme_mod('rss_prism_show_sidebar',true)&&is_active_sidebar('sidebar-1')){echo '<aside class="sidebar" aria-label="'.esc_attr__('Sidebar','rss-prism').'">';dynamic_sidebar('sidebar-1');echo '</aside>';}}
function rss_prism_widgets_init(){register_sidebar(array('name'=>__('Main Sidebar','rss-prism'),'id'=>'sidebar-1','before_widget'=>'<section id="%1$s" class="widget %2$s">','after_widget'=>'</section>','before_title'=>'<h2 class="widget-title">','after_title'=>'</h2>'));register_sidebar(array('name'=>__('Footer Column 1','rss-prism'),'id'=>'footer-1','before_widget'=>'<section class="footer-widget %2$s">','after_widget'=>'</section>','before_title'=>'<h2>','after_title'=>'</h2>'));register_sidebar(array('name'=>__('Footer Column 2','rss-prism'),'id'=>'footer-2','before_widget'=>'<section class="footer-widget %2$s">','after_widget'=>'</section>','before_title'=>'<h2>','after_title'=>'</h2>'));} add_action('widgets_init','rss_prism_widgets_init');

function rss_prism_breadcrumbs(){if(!get_theme_mod('rss_prism_show_breadcrumbs',true)||is_front_page()||is_home())return;echo '<nav class="rp-breadcrumbs rp-container" aria-label="'.esc_attr__('Breadcrumb','rss-prism').'">';echo '<a href="'.esc_url(home_url('/')).'">'.esc_html__('Home','rss-prism').'</a><span aria-hidden="true"> / </span>';if(is_category()||is_tag()||is_tax()||is_post_type_archive())echo '<span>'.esc_html(wp_strip_all_tags(get_the_archive_title())).'</span>';elseif(is_search())echo '<span>'.esc_html__('Search results','rss-prism').'</span>';elseif(is_404())echo '<span>'.esc_html__('Page not found','rss-prism').'</span>';elseif(is_singular('post')){$cats=get_the_category();if(!empty($cats))echo '<a href="'.esc_url(get_category_link($cats[0]->term_id)).'">'.esc_html($cats[0]->name).'</a><span aria-hidden="true"> / </span>';echo '<span>'.esc_html(get_the_title()).'</span>';}elseif(is_singular())echo '<span>'.esc_html(get_the_title()).'</span>';else echo '<span>'.esc_html(wp_strip_all_tags(get_the_archive_title())).'</span>';echo '</nav>';}
function rss_prism_activation_welcome(){ $user_id=get_current_user_id();if($user_id)delete_user_meta($user_id,'rss_prism_welcome_dismissed');} add_action('after_switch_theme','rss_prism_activation_welcome');
function rss_prism_welcome_notice(){if(!current_user_can('switch_themes')||!is_admin()||!isset($GLOBALS['pagenow'])||'themes.php'!==$GLOBALS['pagenow'])return;$user_id=get_current_user_id();if(!$user_id||get_user_meta($user_id,'rss_prism_welcome_dismissed',true))return;$dismiss_url=wp_nonce_url(admin_url('admin-post.php?action=rss_prism_dismiss_welcome'),'rss_prism_dismiss_welcome');echo '<div class="notice notice-success rp-welcome-notice"><h2>'.esc_html__('Welcome to RSS Prism','rss-prism').'</h2><p>'.esc_html__('Your theme is active. Personalize the colours, homepage content, layouts, typography, and footer to make the site your own.','rss-prism').'</p><p><a class="button button-primary" href="'.esc_url(admin_url('customize.php')).'">'.esc_html__('Customize your site','rss-prism').'</a> <a class="button" href="'.esc_url(admin_url('nav-menus.php')).'">'.esc_html__('Set up menus','rss-prism').'</a> <a class="button" href="'.esc_url(home_url('/')).'" target="_blank" rel="noopener noreferrer">'.esc_html__('View website','rss-prism').'</a> <a class="button-link" style="margin-left:12px" href="'.esc_url($dismiss_url).'">'.esc_html__('Dismiss welcome','rss-prism').'</a></p></div>';}
add_action('admin_notices','rss_prism_welcome_notice');
function rss_prism_dismiss_welcome(){if(!current_user_can('switch_themes'))wp_die(esc_html__('You are not allowed to do that.','rss-prism'));check_admin_referer('rss_prism_dismiss_welcome');update_user_meta(get_current_user_id(),'rss_prism_welcome_dismissed',1);wp_safe_redirect(admin_url('themes.php'));exit;} add_action('admin_post_rss_prism_dismiss_welcome','rss_prism_dismiss_welcome');
