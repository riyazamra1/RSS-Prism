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
	$wp_customize->add_setting('rss_prism_footer_text',array('default'=>'Ideas made clearer.','sanitize_callback'=>'sanitize_textarea_field'));$wp_customize->add_control('rss_prism_footer_text',array('label'=>__('Footer description','rss-prism'),'section'=>'rss_prism_footer','type'=>'textarea'));
	$wp_customize->add_setting('rss_prism_footer_copyright',array('default'=>'','sanitize_callback'=>'sanitize_text_field'));$wp_customize->add_control('rss_prism_footer_copyright',array('label'=>__('Footer copyright text (optional)','rss-prism'),'description'=>__('Leave blank to use the site name and current year.','rss-prism'),'section'=>'rss_prism_footer','type'=>'text'));
 $wp_customize->add_setting('rss_prism_footer_style',array('default'=>'light','sanitize_callback'=>function($v){return in_array($v,array('light','dark','accent'),true)?$v:'light';}));$wp_customize->add_control('rss_prism_footer_style',array('label'=>__('Footer style','rss-prism'),'section'=>'rss_prism_footer','type'=>'select','choices'=>array('light'=>__('Light','rss-prism'),'dark'=>__('Dark','rss-prism'),'accent'=>__('Accent colour','rss-prism'))));


	$wp_customize->add_section('rss_prism_header_controls',array('title'=>__('Header & Navigation','rss-prism'),'panel'=>'rss_prism_panel','priority'=>35));
	$header_choices=array('rss_prism_logo_position'=>array('left',array('left'=>__('Logo left','rss-prism'),'center'=>__('Logo centered','rss-prism'),'right'=>__('Logo right','rss-prism'))),'rss_prism_menu_style'=>array('pill',array('plain'=>__('Simple links','rss-prism'),'pill'=>__('Pill background','rss-prism'),'underline'=>__('Underline active item','rss-prism'))),'rss_prism_menu_alignment'=>array('right',array('left'=>__('Align menu left','rss-prism'),'center'=>__('Center menu','rss-prism'),'right'=>__('Align menu right','rss-prism'))),'rss_prism_header_surface'=>array('default',array('default'=>__('Theme surface','rss-prism'),'transparent'=>__('Transparent','rss-prism'),'accent'=>__('Accent colour','rss-prism'))));
	foreach($header_choices as $id=>$cfg){$wp_customize->add_setting($id,array('default'=>$cfg[0],'sanitize_callback'=>function($v)use($cfg){return array_key_exists($v,$cfg[1])?$v:$cfg[0];}));$wp_customize->add_control($id,array('label'=>ucwords(str_replace(array('rss_prism_','_'),array('',' '),$id)),'section'=>'rss_prism_header_controls','type'=>'select','choices'=>$cfg[1]));}
	$wp_customize->add_setting('rss_prism_logo_width',array('default'=>220,'sanitize_callback'=>'absint'));$wp_customize->add_control('rss_prism_logo_width',array('label'=>__('Logo maximum width (px)','rss-prism'),'section'=>'rss_prism_header_controls','type'=>'number','input_attrs'=>array('min'=>80,'max'=>420,'step'=>10)));
	$wp_customize->add_setting('rss_prism_header_border',array('default'=>true,'sanitize_callback'=>'rest_sanitize_boolean'));$wp_customize->add_control('rss_prism_header_border',array('label'=>__('Show header divider','rss-prism'),'section'=>'rss_prism_header_controls','type'=>'checkbox'));
	$wp_customize->add_setting('rss_prism_header_padding',array('default'=>'normal','sanitize_callback'=>function($v){return in_array($v,array('compact','normal','spacious'),true)?$v:'normal';}));$wp_customize->add_control('rss_prism_header_padding',array('label'=>__('Header spacing','rss-prism'),'section'=>'rss_prism_header_controls','type'=>'select','choices'=>array('compact'=>__('Compact','rss-prism'),'normal'=>__('Comfortable','rss-prism'),'spacious'=>__('Spacious','rss-prism'))));
	$footer_choices=array('rss_prism_footer_alignment'=>array('left',array('left'=>__('Left aligned','rss-prism'),'center'=>__('Centered','rss-prism'),'right'=>__('Right aligned','rss-prism'))),'rss_prism_footer_columns'=>array('three',array('one'=>__('One column','rss-prism'),'two'=>__('Two columns','rss-prism'),'three'=>__('Three columns','rss-prism'))),'rss_prism_footer_logo_position'=>array('left',array('left'=>__('Logo above text','rss-prism'),'right'=>__('Logo beside text','rss-prism'))),'rss_prism_footer_spacing'=>array('normal',array('compact'=>__('Compact','rss-prism'),'normal'=>__('Comfortable','rss-prism'),'spacious'=>__('Spacious','rss-prism'))));
	foreach($footer_choices as $id=>$cfg){$wp_customize->add_setting($id,array('default'=>$cfg[0],'sanitize_callback'=>function($v)use($cfg){return array_key_exists($v,$cfg[1])?$v:$cfg[0];}));$wp_customize->add_control($id,array('label'=>ucwords(str_replace(array('rss_prism_','_'),array('',' '),$id)),'section'=>'rss_prism_footer','type'=>'select','choices'=>$cfg[1]));}
	foreach(array('rss_prism_footer_show_logo'=>__('Show site logo in footer','rss-prism'),'rss_prism_footer_show_menu'=>__('Show footer navigation','rss-prism'),'rss_prism_footer_show_widgets'=>__('Show footer widget columns','rss-prism')) as $id=>$label){$wp_customize->add_setting($id,array('default'=>true,'sanitize_callback'=>'rest_sanitize_boolean'));$wp_customize->add_control($id,array('label'=>$label,'section'=>'rss_prism_footer','type'=>'checkbox'));}

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
	$font_scale=get_theme_mod('rss_prism_font_scale','normal');if(!in_array($font_scale,array('small','normal','large'),true))$font_scale='normal';$font_size=array('small'=>'15px','normal'=>'16px','large'=>'18px')[$font_scale];$button_shape=get_theme_mod('rss_prism_button_shape','pill');if(!in_array($button_shape,array('square','soft','pill'),true))$button_shape='pill';$button_radius=array('square'=>'4px','soft'=>'12px','pill'=>'999px')[$button_shape];$logo_width=absint(get_theme_mod('rss_prism_logo_width',220));$logo_width=min(420,max(80,$logo_width));$header_padding=get_theme_mod('rss_prism_header_padding','normal');$header_pad=array('compact'=>'0.45rem','normal'=>'1rem','spacious'=>'1.5rem')[$header_padding]??'1rem';$footer_spacing=get_theme_mod('rss_prism_footer_spacing','normal');$footer_pad=array('compact'=>'1.25rem','normal'=>'2.5rem','spacious'=>'4rem')[$footer_spacing]??'2.5rem';$css=substr($css,0,-1).'--rp-font-size:'.$font_size.';--rp-button-radius:'.$button_radius.';--rp-logo-width:'.$logo_width.'px;--rp-header-padding:'.$header_pad.';--rp-footer-padding:'.$footer_pad.';}';
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

function rss_prism_body_classes($classes){$classes[]='rp-layout--'.sanitize_html_class(get_theme_mod('rss_prism_blog_layout','grid'));$classes[]='rp-logo-position--'.sanitize_html_class(get_theme_mod('rss_prism_logo_position','left'));$classes[]='rp-menu-style--'.sanitize_html_class(get_theme_mod('rss_prism_menu_style','pill'));$classes[]='rp-menu-align--'.sanitize_html_class(get_theme_mod('rss_prism_menu_alignment','right'));$classes[]='rp-header-surface--'.sanitize_html_class(get_theme_mod('rss_prism_header_surface','default'));$classes[]='rp-footer-align--'.sanitize_html_class(get_theme_mod('rss_prism_footer_alignment','left'));$classes[]='rp-footer-columns--'.sanitize_html_class(get_theme_mod('rss_prism_footer_columns','three'));$classes[]='rp-footer-logo--'.sanitize_html_class(get_theme_mod('rss_prism_footer_logo_position','left'));$classes[]='rp-content-align--'.sanitize_html_class(get_theme_mod('rss_prism_content_alignment','left'));if(!get_theme_mod('rss_prism_show_sidebar',true))$classes[]='rp-sidebar-hidden';if(!get_theme_mod('rss_prism_show_hero_visual',true))$classes[]='rp-hero-visual-hidden';return $classes;} add_filter('body_class','rss_prism_body_classes');
function rss_prism_meta(){echo '<div class="entry-meta"><time datetime="'.esc_attr(get_the_date(DATE_W3C)).'">'.esc_html(get_the_date()).'</time>';if(get_theme_mod('rss_prism_show_author',true))echo '<span aria-hidden="true"> · </span>'.wp_kses_post(get_the_author_posts_link());echo '</div>';}
function rss_prism_post_card(){?><article <?php post_class('entry-card'); ?> id="post-<?php the_ID(); ?>"><?php if(get_theme_mod('rss_prism_show_archive_images',true)&&has_post_thumbnail()):?><a class="entry-thumbnail" href="<?php the_permalink(); ?>" tabindex="-1" aria-hidden="true"><?php the_post_thumbnail('large',array('loading'=>'lazy'));?></a><?php endif;?><div class="entry-card__body"><?php rss_prism_meta();?><h2 class="entry-title"><a href="<?php the_permalink(); ?>"><?php the_title();?></a></h2><div class="entry-excerpt"><?php the_excerpt();?></div><a class="entry-read-more" href="<?php the_permalink(); ?>"><?php esc_html_e('Read article','rss-prism');?> →</a></div></article><?php}
function rss_prism_sidebar(){if(get_theme_mod('rss_prism_show_sidebar',true)&&is_active_sidebar('sidebar-1')){echo '<aside class="sidebar" aria-label="'.esc_attr__('Sidebar','rss-prism').'">';dynamic_sidebar('sidebar-1');echo '</aside>';}}
function rss_prism_widgets_init(){register_sidebar(array('name'=>__('Main Sidebar','rss-prism'),'id'=>'sidebar-1','before_widget'=>'<section id="%1$s" class="widget %2$s">','after_widget'=>'</section>','before_title'=>'<h2 class="widget-title">','after_title'=>'</h2>'));register_sidebar(array('name'=>__('Footer Column 1','rss-prism'),'id'=>'footer-1','before_widget'=>'<section class="footer-widget %2$s">','after_widget'=>'</section>','before_title'=>'<h2>','after_title'=>'</h2>'));register_sidebar(array('name'=>__('Footer Column 2','rss-prism'),'id'=>'footer-2','before_widget'=>'<section class="footer-widget %2$s">','after_widget'=>'</section>','before_title'=>'<h2>','after_title'=>'</h2>'));} add_action('widgets_init','rss_prism_widgets_init');

function rss_prism_breadcrumbs(){if(!get_theme_mod('rss_prism_show_breadcrumbs',true)||is_front_page()||is_home())return;echo '<nav class="rp-breadcrumbs rp-container" aria-label="'.esc_attr__('Breadcrumb','rss-prism').'">';echo '<a href="'.esc_url(home_url('/')).'">'.esc_html__('Home','rss-prism').'</a><span aria-hidden="true"> / </span>';if(is_category()||is_tag()||is_tax()||is_post_type_archive())echo '<span>'.esc_html(wp_strip_all_tags(get_the_archive_title())).'</span>';elseif(is_search())echo '<span>'.esc_html__('Search results','rss-prism').'</span>';elseif(is_404())echo '<span>'.esc_html__('Page not found','rss-prism').'</span>';elseif(is_singular('post')){$cats=get_the_category();if(!empty($cats))echo '<a href="'.esc_url(get_category_link($cats[0]->term_id)).'">'.esc_html($cats[0]->name).'</a><span aria-hidden="true"> / </span>';echo '<span>'.esc_html(get_the_title()).'</span>';}elseif(is_singular())echo '<span>'.esc_html(get_the_title()).'</span>';else echo '<span>'.esc_html(wp_strip_all_tags(get_the_archive_title())).'</span>';echo '</nav>';}
function rss_prism_activation_welcome(){ $user_id=get_current_user_id();if($user_id)delete_user_meta($user_id,'rss_prism_welcome_dismissed');} add_action('after_switch_theme','rss_prism_activation_welcome');
function rss_prism_welcome_notice(){
	if(!current_user_can('switch_themes')||!is_admin()||!isset($GLOBALS['pagenow'])||'themes.php'!==$GLOBALS['pagenow'])return;
	$user_id=get_current_user_id();if(!$user_id||get_user_meta($user_id,'rss_prism_welcome_dismissed',true))return;
	$dismiss_url=wp_nonce_url(admin_url('admin-post.php?action=rss_prism_dismiss_welcome'),'rss_prism_dismiss_welcome');
	$status=isset($_GET['rss_prism_signup'])?sanitize_key(wp_unslash($_GET['rss_prism_signup'])):'';
	echo '<div class="notice notice-success rp-welcome-notice"><div class="rp-welcome-hero"><span class="rp-welcome-kicker">'.esc_html__('YOUR SITE. YOUR STYLE.','rss-prism').'</span><h2>'.esc_html__('Welcome to RSS Prism','rss-prism').'</h2><p class="rp-welcome-lead">'.esc_html__('A flexible toolkit for building a polished website without needing to code. Start with your brand, shape your header and footer, then fine-tune every detail.','rss-prism').'</p><div class="rp-welcome-actions"><a class="button button-primary button-hero" href="'.esc_url(admin_url('customize.php')).'">'.esc_html__('Open theme customizer','rss-prism').'</a> <a class="button button-hero" href="'.esc_url(admin_url('nav-menus.php')).'">'.esc_html__('Build your menus','rss-prism').'</a> <a class="button button-hero" href="'.esc_url(home_url('/')).'" target="_blank" rel="noopener noreferrer">'.esc_html__('Preview your website','rss-prism').'</a></div></div><div class="rp-welcome-features"><div><span class="dashicons dashicons-art"></span><strong>'.esc_html__('Brand & design','rss-prism').'</strong><p>'.esc_html__('Colours, typography, buttons, widths and layouts.','rss-prism').'</p></div><div><span class="dashicons dashicons-editor-kitchensink"></span><strong>'.esc_html__('Header controls','rss-prism').'</strong><p>'.esc_html__('Logo placement, menu styles, spacing and sticky navigation.','rss-prism').'</p></div><div><span class="dashicons dashicons-screenoptions"></span><strong>'.esc_html__('Footer builder','rss-prism').'</strong><p>'.esc_html__('Logo, alignment, columns, colour, copy and widgets.','rss-prism').'</p></div><div><span class="dashicons dashicons-smartphone"></span><strong>'.esc_html__('Responsive layouts','rss-prism').'</strong><p>'.esc_html__('Mobile-friendly menus and article cards.','rss-prism').'</p></div></div><div class="rp-welcome-signup"><div><h3>'.esc_html__('Get RSS Prism tips and updates','rss-prism').'</h3><p>'.esc_html__('Optional: join the email list for product news, design ideas and new features. You can use RSS Prism without subscribing.','rss-prism').'</p><p class="description">'.esc_html__('Your details are stored in this WordPress site for the administrator. No external mailing service is connected automatically.','rss-prism').'</p></div><form method="post" action="'.esc_url(admin_url('admin-post.php')).'" class="rp-signup-form"><input type="hidden" name="action" value="rss_prism_signup">';wp_nonce_field('rss_prism_signup','rss_prism_signup_nonce');echo '<label>'.esc_html__('Name','rss-prism').'<input type="text" name="rss_prism_name" autocomplete="name" maxlength="100" required></label><label>'.esc_html__('Email address','rss-prism').'<input type="email" name="rss_prism_email" autocomplete="email" maxlength="190" required></label><label class="rp-consent"><input type="checkbox" name="rss_prism_consent" value="1" required> <span>'.esc_html__('I agree to receive RSS Prism email updates. I understand I can request removal.','rss-prism').'</span></label><button class="button button-primary" type="submit">'.esc_html__('Join the updates list','rss-prism').'</button></form></div>';
	if('success'===$status)echo '<p class="notice notice-success inline">'.esc_html__('Thanks — your opt-in has been saved on this site.','rss-prism').'</p>';elseif('error'===$status)echo '<p class="notice notice-error inline">'.esc_html__('Please enter a valid name and email address and confirm consent.','rss-prism').'</p>';
	echo '<p class="rp-welcome-dismiss"><a href="'.esc_url($dismiss_url).'">'.esc_html__('Dismiss this welcome card','rss-prism').'</a></p></div>';
}
add_action('admin_notices','rss_prism_welcome_notice');
function rss_prism_handle_signup(){
	if(!current_user_can('switch_themes'))wp_die(esc_html__('You are not allowed to do that.','rss-prism'));
	if(!isset($_POST['rss_prism_signup_nonce'])||!wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['rss_prism_signup_nonce'])),'rss_prism_signup'))wp_die(esc_html__('Security check failed. Please try again.','rss-prism'));
	$name=isset($_POST['rss_prism_name'])?sanitize_text_field(wp_unslash($_POST['rss_prism_name'])):'';
	$email=isset($_POST['rss_prism_email'])?sanitize_email(wp_unslash($_POST['rss_prism_email'])):'';
	$consent=isset($_POST['rss_prism_consent'])&&'1'===sanitize_text_field(wp_unslash($_POST['rss_prism_consent']));
	$status='error';
	if($name&&is_email($email)&&$consent){$list=get_option('rss_prism_email_subscribers',array());if(!is_array($list))$list=array();$exists=false;foreach($list as $item){if(isset($item['email'])&&strtolower($item['email'])===strtolower($email)){$exists=true;break;}}if(!$exists){$list[]=array('name'=>$name,'email'=>$email,'consent'=>1,'consented_at'=>current_time('mysql'));update_option('rss_prism_email_subscribers',$list,false);}$status='success';}
	wp_safe_redirect(add_query_arg('rss_prism_signup',$status,admin_url('themes.php')));exit;
}
add_action('admin_post_rss_prism_signup','rss_prism_handle_signup');
function rss_prism_subscribers_menu(){add_theme_page(__('RSS Prism Email List','rss-prism'),__('RSS Prism Email List','rss-prism'),'manage_options','rss-prism-email-list','rss_prism_subscribers_page');}
add_action('admin_menu','rss_prism_subscribers_menu');
function rss_prism_subscribers_page(){
	if(!current_user_can('manage_options'))return;
	if(isset($_POST['rss_prism_delete_subscribers'])){check_admin_referer('rss_prism_delete_subscribers');delete_option('rss_prism_email_subscribers');echo '<div class="notice notice-success"><p>'.esc_html__('Saved signup records were deleted.','rss-prism').'</p></div>';}
	$list=get_option('rss_prism_email_subscribers',array());if(!is_array($list))$list=array();
	echo '<div class="wrap"><h1>'.esc_html__('RSS Prism Email List','rss-prism').'</h1><p>'.esc_html__('These contacts opted in through the welcome card. No external mailing service is connected; use or transfer contacts only under your privacy policy and applicable law.','rss-prism').'</p><p><strong>'.esc_html(sprintf(_n('%d subscriber','%d subscribers',count($list),'rss-prism'),count($list))).'</strong></p>';
	if($list){echo '<table class="widefat striped"><thead><tr><th>'.esc_html__('Name','rss-prism').'</th><th>'.esc_html__('Email','rss-prism').'</th><th>'.esc_html__('Consent recorded','rss-prism').'</th></tr></thead><tbody>';foreach($list as $item){echo '<tr><td>'.esc_html($item['name']??'').'</td><td>'.esc_html($item['email']??'').'</td><td>'.esc_html($item['consented_at']??'').'</td></tr>';}echo '</tbody></table><form method="post" style="margin-top:1rem">';wp_nonce_field('rss_prism_delete_subscribers');echo '<button class="button" type="submit" name="rss_prism_delete_subscribers" value="1">'.esc_html__('Delete all saved contacts','rss-prism').'</button></form>';}else echo '<p>'.esc_html__('No subscribers yet.','rss-prism').'</p>';
	echo '</div>';
}


function rss_prism_admin_welcome_styles($hook){
	if('themes.php'!==$hook)return;
	wp_register_style('rss-prism-admin-welcome',false,array(),wp_get_theme()->get('Version'));
	wp_enqueue_style('rss-prism-admin-welcome');
	wp_add_inline_style('rss-prism-admin-welcome','.rp-welcome-notice{margin:20px 20px 20px 0!important;padding:0!important;border:1px solid #dcdcde!important;border-left:5px solid #b88a2b!important;border-radius:14px;overflow:hidden;box-shadow:0 12px 32px rgba(20,24,33,.08);background:#fff}.rp-welcome-hero{padding:clamp(24px,4vw,42px);background:radial-gradient(circle at 90% 0%,rgba(184,138,43,.18),transparent 38%),linear-gradient(135deg,#fffdf7,#f7f7f5)}.rp-welcome-kicker{font-size:11px;letter-spacing:.16em;font-weight:800;color:#9b711b}.rp-welcome-notice .rp-welcome-hero h2{font-size:clamp(27px,3vw,38px);line-height:1.15;margin:10px 0 12px;color:#202124}.rp-welcome-lead{font-size:15px;line-height:1.7;max-width:760px;color:#555b65;margin:0 0 22px}.rp-welcome-actions{display:flex;gap:8px;flex-wrap:wrap}.rp-welcome-actions .button-hero{min-height:42px;padding:7px 15px;display:inline-flex;align-items:center}.rp-welcome-features{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;padding:20px 24px}.rp-welcome-features>div{padding:16px;border:1px solid #e6e7e9;border-radius:12px;background:#fff}.rp-welcome-features .dashicons{display:block;color:#b88a2b;margin-bottom:12px;font-size:23px;width:24px;height:24px}.rp-welcome-features strong{display:block;font-size:13px;color:#202124}.rp-welcome-features p{margin:6px 0 0;color:#686d76;font-size:12px;line-height:1.55}.rp-welcome-signup{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,.9fr);gap:24px;padding:24px;background:#f7f7f5;border-top:1px solid #e6e7e9}.rp-welcome-signup h3{margin:0 0 8px;font-size:19px;color:#202124}.rp-welcome-signup p{max-width:520px;color:#5f646d}.rp-signup-form{display:grid;gap:10px}.rp-signup-form label{display:grid;gap:5px;font-weight:600;color:#30343b}.rp-signup-form input[type=text],.rp-signup-form input[type=email]{width:100%;max-width:100%;min-height:40px;border:1px solid #c7c9ce;border-radius:7px;padding:8px 10px;background:#fff}.rp-signup-form .rp-consent{display:flex;align-items:flex-start;gap:8px;font-weight:400;font-size:12px;line-height:1.5}.rp-signup-form .rp-consent input{margin-top:3px}.rp-signup-form button{justify-self:start}.rp-welcome-dismiss{padding:0 24px 18px;margin:0;text-align:right}.rp-welcome-dismiss a{color:#686d76}@media(max-width:1000px){.rp-welcome-features{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:782px){.rp-welcome-signup{grid-template-columns:1fr}}@media(max-width:600px){.rp-welcome-features{grid-template-columns:1fr}}');
}
add_action('admin_enqueue_scripts','rss_prism_admin_welcome_styles');
