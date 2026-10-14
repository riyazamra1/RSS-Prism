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
	$wp_customize->add_panel( 'rss_prism_panel', array(
		'title'       => __( 'RSS Prism Settings', 'rss-prism' ),
		'priority'    => 30,
		'description' => __( 'All RSS Prism design controls, grouped by what you want to customize.', 'rss-prism' ),
	) );
	$wp_customize->add_section( 'rss_prism_design', array(
		'title'       => __( 'Brand & Colours', 'rss-prism' ),
		'panel'       => 'rss_prism_panel',
		'priority'    => 30,
		'description' => __( 'Set your site colours and overall content width.', 'rss-prism' ),
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


	$wp_customize->add_section('rss_prism_home',array('title'=>__('Homepage','rss-prism'),'panel'=>'rss_prism_panel','priority'=>40,'description'=>__('Edit homepage messaging and hero content. Use RSS Prism Studio for visual header and footer arrangement.','rss-prism')));
	$fields=array('hero_eyebrow'=>array(__('Small heading','rss-prism'),'RAZEEN SECURE SOLUTION · RSS'),'hero_title'=>array(__('Main heading','rss-prism'),'Developing Ideas. Delivering Solutions.'),'hero_text'=>array(__('Supporting text','rss-prism'),'We build practical digital experiences, software tools, and website solutions with a focus on clarity, reliability, and security-minded design.'),'hero_primary_label'=>array(__('Primary button label','rss-prism'),'Explore RSS projects'),'hero_primary_url'=>array(__('Primary button URL','rss-prism'),'#projects'),'hero_secondary_label'=>array(__('Secondary button label','rss-prism'),'About RSS'),'hero_secondary_url'=>array(__('Secondary button URL','rss-prism'),'#about-rss'),'features_title'=>array(__('Features heading','rss-prism'),'Useful features. Clear experiences.'),'features_text'=>array(__('Features description','rss-prism'),'RSS projects aim to combine practical functionality with straightforward user experiences and security-aware engineering.'),'cta_title'=>array(__('Call-to-action heading','rss-prism'),'Have an idea to build?'),'cta_text'=>array(__('Call-to-action text','rss-prism'),'Visit Razeen Secure Solution to learn more about RSS and its digital projects.'),'cta_label'=>array(__('Call-to-action button','rss-prism'),'Visit RSS website'),'cta_url'=>array(__('Call-to-action URL','rss-prism'),'https://www.rsscctvsolution.eu.cc/'));
	foreach($fields as $key=>$field){$id='rss_prism_'.$key;$wp_customize->add_setting($id,array('default'=>$field[1],'sanitize_callback'=>strpos($key,'url')!==false?'esc_url_raw':'sanitize_text_field'));$wp_customize->add_control($id,array('label'=>$field[0],'section'=>'rss_prism_home','type'=>strpos($key,'text')!==false?'textarea':(strpos($key,'url')!==false?'url':'text')));}
	$wp_customize->add_section('rss_prism_layouts',array('title'=>__('Global Styles','rss-prism'),'panel'=>'rss_prism_panel','priority'=>60,'description'=>__('Set site-wide shape, typography scale, button shape and content alignment.','rss-prism')));
	$wp_customize->add_setting( 'rss_prism_font_family', array(
		'default' => 'system',
		'sanitize_callback' => function( $value ) { return in_array( $value, array( 'system', 'arial', 'georgia', 'trebuchet', 'verdana' ), true ) ? $value : 'system'; },
		'transport' => 'refresh',
	) );
	$wp_customize->add_control( 'rss_prism_font_family', array(
		'label' => __( 'Website font family', 'rss-prism' ),
		'section' => 'rss_prism_layouts',
		'type' => 'select',
		'choices' => array( 'system' => __( 'System default', 'rss-prism' ), 'arial' => __( 'Arial', 'rss-prism' ), 'georgia' => __( 'Georgia (serif)', 'rss-prism' ), 'trebuchet' => __( 'Trebuchet MS', 'rss-prism' ), 'verdana' => __( 'Verdana', 'rss-prism' ) ),
	) );

	$choices=array('rss_prism_corner_style'=>array('round',array('sharp'=>__('Sharp corners','rss-prism'),'round'=>__('Rounded corners','rss-prism'),'soft'=>__('Extra rounded corners','rss-prism'))),'rss_prism_shadow'=>array('yes',array('yes'=>__('Subtle shadows','rss-prism'),'no'=>__('No shadows','rss-prism'))));
	foreach($choices as $id=>$cfg){$wp_customize->add_setting($id,array('default'=>$cfg[0],'sanitize_callback'=>function($v)use($cfg){return array_key_exists($v,$cfg[1])?$v:$cfg[0];}));$wp_customize->add_control($id,array('label'=>ucwords(str_replace(array('rss_prism_','_'),array('',' '),$id)),'section'=>'rss_prism_layouts','type'=>'select','choices'=>$cfg[1]));}
	
 $more_choices=array('rss_prism_font_scale'=>array('normal',array('small'=>__('Compact','rss-prism'),'normal'=>__('Standard','rss-prism'),'large'=>__('Large and readable','rss-prism'))),'rss_prism_button_shape'=>array('pill',array('square'=>__('Square','rss-prism'),'soft'=>__('Soft corners','rss-prism'),'pill'=>__('Pill','rss-prism'))),'rss_prism_content_alignment'=>array('left',array('left'=>__('Left aligned','rss-prism'),'center'=>__('Centered headings','rss-prism'))));
 foreach($more_choices as $id=>$cfg){$wp_customize->add_setting($id,array('default'=>$cfg[0],'sanitize_callback'=>function($v)use($cfg){return array_key_exists($v,$cfg[1])?$v:$cfg[0];}));$wp_customize->add_control($id,array('label'=>ucwords(str_replace(array('rss_prism_','_'),array('',' '),$id)),'section'=>'rss_prism_layouts','type'=>'select','choices'=>$cfg[1]));}
 foreach(array('rss_prism_show_hero_visual'=>__('Show homepage hero artwork','rss-prism')) as $id=>$label){$wp_customize->add_setting($id,array('default'=>true,'sanitize_callback'=>'rest_sanitize_boolean'));$wp_customize->add_control($id,array('label'=>$label,'section'=>'rss_prism_home','type'=>'checkbox'));}

 $wp_customize->add_section('rss_prism_blog',array('title'=>__('Blog & Archives','rss-prism'),'panel'=>'rss_prism_panel','priority'=>70,'description'=>__('Article layout, featured images, category labels, breadcrumbs, author metadata and sidebar visibility.','rss-prism')));
 $wp_customize->add_setting('rss_prism_blog_layout',array('default'=>'grid','sanitize_callback'=>function($v){return in_array($v,array('grid','list'),true)?$v:'grid';}));
 $wp_customize->add_control('rss_prism_blog_layout',array('label'=>__('Article layout','rss-prism'),'section'=>'rss_prism_blog','type'=>'select','choices'=>array('grid'=>__('Card grid','rss-prism'),'list'=>__('Horizontal list','rss-prism'))));
 foreach(array('rss_prism_show_archive_images'=>__('Show featured images in article cards','rss-prism'),'rss_prism_show_breadcrumbs'=>__('Show breadcrumb navigation','rss-prism'),'rss_prism_show_back_to_top'=>__('Show back-to-top link','rss-prism'),'rss_prism_show_author'=>__('Show post author','rss-prism'),'rss_prism_show_sidebar'=>__('Show sidebar widgets','rss-prism'),'rss_prism_show_categories'=>__('Show category labels on articles','rss-prism')) as $id=>$label){$wp_customize->add_setting($id,array('default'=>true,'sanitize_callback'=>'rest_sanitize_boolean'));$wp_customize->add_control($id,array('label'=>$label,'section'=>'rss_prism_blog','type'=>'checkbox'));}
	$wp_customize->add_section('rss_prism_footer',array('title'=>__('Footer Styling','rss-prism'),'panel'=>'rss_prism_panel','priority'=>85,'description'=>__('Set footer colours and content. Arrange footer rows and elements in RSS Prism Studio.','rss-prism')));
	$wp_customize->add_setting('rss_prism_footer_text',array('default'=>'Developing Ideas. Delivering Solutions.','sanitize_callback'=>'sanitize_textarea_field'));$wp_customize->add_control('rss_prism_footer_text',array('label'=>__('Footer description','rss-prism'),'section'=>'rss_prism_footer','type'=>'textarea'));
	$wp_customize->add_setting('rss_prism_footer_copyright',array('default'=>'','sanitize_callback'=>'sanitize_text_field'));$wp_customize->add_control('rss_prism_footer_copyright',array('label'=>__('Footer copyright text (optional)','rss-prism'),'description'=>__('Leave blank to use the site name and current year.','rss-prism'),'section'=>'rss_prism_footer','type'=>'text'));
 $wp_customize->add_setting('rss_prism_footer_style',array('default'=>'light','sanitize_callback'=>function($v){return in_array($v,array('light','dark','accent'),true)?$v:'light';}));$wp_customize->add_control('rss_prism_footer_style',array('label'=>__('Footer style','rss-prism'),'section'=>'rss_prism_footer','type'=>'select','choices'=>array('light'=>__('Light','rss-prism'),'dark'=>__('Dark','rss-prism'),'accent'=>__('Accent colour','rss-prism'))));


	$wp_customize->add_section('rss_prism_header_controls',array('title'=>__('Header Styling','rss-prism'),'panel'=>'rss_prism_panel','priority'=>50,'description'=>__('Set logo placement and size, header layout and surface, sticky behaviour, divider, and vertical spacing. Arrange header elements in RSS Prism Studio.','rss-prism')));
	$header_choices=array('rss_prism_logo_position'=>array('left',array('left'=>__('Logo left','rss-prism'),'center'=>__('Logo centered','rss-prism'),'right'=>__('Logo right','rss-prism'))),'rss_prism_header_surface'=>array('default',array('default'=>__('Theme surface','rss-prism'),'transparent'=>__('Transparent','rss-prism'),'accent'=>__('Accent colour','rss-prism'))));
	foreach($header_choices as $id=>$cfg){$wp_customize->add_setting($id,array('default'=>$cfg[0],'sanitize_callback'=>function($v)use($cfg){return array_key_exists($v,$cfg[1])?$v:$cfg[0];}));$wp_customize->add_control($id,array('label'=>ucwords(str_replace(array('rss_prism_','_'),array('',' '),$id)),'section'=>'rss_prism_header_controls','type'=>'select','choices'=>$cfg[1]));}
	$navigation_choices=array('rss_prism_menu_style'=>array('pill',array('plain'=>__('Minimal links','rss-prism'),'pill'=>__('Rounded background','rss-prism'),'underline'=>__('Underline active item','rss-prism'),'outlined'=>__('Outlined buttons','rss-prism'))),'rss_prism_menu_alignment'=>array('right',array('left'=>__('Align menu left','rss-prism'),'center'=>__('Center menu','rss-prism'),'right'=>__('Align menu right','rss-prism'))));
	foreach($navigation_choices as $id=>$cfg){$wp_customize->add_setting($id,array('default'=>$cfg[0],'sanitize_callback'=>function($v)use($cfg){return array_key_exists($v,$cfg[1])?$v:$cfg[0];}));$wp_customize->add_control($id,array('label'=>ucwords(str_replace(array('rss_prism_','_'),array('',' '),$id)),'section'=>'rss_prism_navigation_controls','type'=>'select','choices'=>$cfg[1]));}

	$wp_customize->add_section( 'rss_prism_navigation_controls', array(
		'title' => __( 'Navigation & Menu Typography', 'rss-prism' ),
		'panel' => 'rss_prism_panel',
		'priority' => 55,
		'description' => __( 'Menu appearance, alignment, spacing, font size, weight and letter style.', 'rss-prism' ),
	) );
	$wp_customize->add_setting( 'rss_prism_header_style', array(
		'default' => 'standard',
		'sanitize_callback' => function( $value ) { return in_array( $value, array( 'standard', 'centered', 'dark' ), true ) ? $value : 'standard'; },
		'transport' => 'refresh',
	) );
	$wp_customize->add_control( 'rss_prism_header_style', array(
		'label' => __( 'Header layout', 'rss-prism' ),
		'description' => __( 'Choose a standard, centered, or dark header layout.', 'rss-prism' ),
		'section' => 'rss_prism_header_controls',
		'type' => 'select',
		'choices' => array( 'standard' => __( 'Standard horizontal', 'rss-prism' ), 'centered' => __( 'Centered logo', 'rss-prism' ), 'dark' => __( 'Dark header', 'rss-prism' ) ),
	) );
	$wp_customize->add_setting('rss_prism_sticky_header',array('default'=>false,'sanitize_callback'=>'rest_sanitize_boolean'));$wp_customize->add_control('rss_prism_sticky_header',array('label'=>__('Sticky header','rss-prism'),'section'=>'rss_prism_header_controls','type'=>'checkbox'));
	// Logo width now uses the range control above; the original setting ID and saved values remain unchanged.
	// Fine-grained logo and navigation controls. Existing setting IDs are retained for backward compatibility.
	$range_controls = array(
		'rss_prism_logo_width' => array( 220, 80, 420, 10, __( 'Logo width', 'rss-prism' ), __( 'Adjust the maximum logo width in pixels.', 'rss-prism' ) ),
		'rss_prism_logo_height' => array( 76, 30, 140, 2, __( 'Logo height', 'rss-prism' ), __( 'Adjust the maximum logo height in pixels.', 'rss-prism' ) ),
		'rss_prism_menu_font_size' => array( 15, 11, 22, 1, __( 'Menu text size', 'rss-prism' ), __( 'Set navigation text size in pixels.', 'rss-prism' ) ),
		'rss_prism_menu_gap' => array( 4, 0, 24, 1, __( 'Space between menu items', 'rss-prism' ), __( 'Control the horizontal gap between links in pixels.', 'rss-prism' ) ),
		'rss_prism_menu_padding_x' => array( 12, 0, 28, 1, __( 'Menu item horizontal padding', 'rss-prism' ), __( 'Control the space on the left and right of each link.', 'rss-prism' ) ),
		'rss_prism_menu_padding_y' => array( 8, 0, 20, 1, __( 'Menu item vertical padding', 'rss-prism' ), __( 'Control the space above and below each link.', 'rss-prism' ) ),
		'rss_prism_menu_radius' => array( 10, 0, 30, 1, __( 'Menu item corner radius', 'rss-prism' ), __( 'Set the roundness of menu item backgrounds in pixels.', 'rss-prism' ) ),
	);
	foreach ( $range_controls as $id => $cfg ) {
		$wp_customize->add_setting( $id, array(
			'default' => $cfg[0],
			'sanitize_callback' => function( $value ) use ( $cfg ) {
				return min( $cfg[2], max( $cfg[1], absint( $value ) ) );
			},
			'transport' => 'refresh',
		) );
		$control_section = in_array( $id, array( 'rss_prism_logo_width', 'rss_prism_logo_height' ), true ) ? 'rss_prism_header_controls' : 'rss_prism_navigation_controls';
		$wp_customize->add_control( $id, array(
			'label' => $cfg[4],
			'description' => $cfg[5],
			'section' => $control_section,
			'type' => 'range',
			'input_attrs' => array( 'min' => $cfg[1], 'max' => $cfg[2], 'step' => $cfg[3] ),
		) );
	}
	$wp_customize->add_setting( 'rss_prism_menu_font_weight', array(
		'default' => '600',
		'sanitize_callback' => function( $value ) { return in_array( (string) $value, array( '400', '500', '600', '700', '800' ), true ) ? (string) $value : '600'; },
		'transport' => 'refresh',
	) );
	$wp_customize->add_control( 'rss_prism_menu_font_weight', array(
		'label' => __( 'Menu text weight', 'rss-prism' ),
		'section' => 'rss_prism_navigation_controls',
		'type' => 'select',
		'choices' => array( '400' => __( 'Regular', 'rss-prism' ), '500' => __( 'Medium', 'rss-prism' ), '600' => __( 'Semi-bold', 'rss-prism' ), '700' => __( 'Bold', 'rss-prism' ), '800' => __( 'Extra bold', 'rss-prism' ) ),
	) );
	$wp_customize->add_setting( 'rss_prism_menu_text_transform', array(
		'default' => 'none',
		'sanitize_callback' => function( $value ) { return in_array( $value, array( 'none', 'uppercase', 'capitalize' ), true ) ? $value : 'none'; },
		'transport' => 'refresh',
	) );
	$wp_customize->add_control( 'rss_prism_menu_text_transform', array(
		'label' => __( 'Menu letter style', 'rss-prism' ),
		'section' => 'rss_prism_navigation_controls',
		'type' => 'select',
		'choices' => array( 'none' => __( 'Normal', 'rss-prism' ), 'uppercase' => __( 'UPPERCASE', 'rss-prism' ), 'capitalize' => __( 'Capitalize Words', 'rss-prism' ) ),
	) );
	$wp_customize->add_setting('rss_prism_header_border',array('default'=>true,'sanitize_callback'=>'rest_sanitize_boolean'));$wp_customize->add_control('rss_prism_header_border',array('label'=>__('Show header divider','rss-prism'),'section'=>'rss_prism_header_controls','type'=>'checkbox'));
	$wp_customize->add_setting('rss_prism_header_padding',array('default'=>'normal','sanitize_callback'=>function($v){return in_array($v,array('compact','normal','spacious'),true)?$v:'normal';}));$wp_customize->add_control('rss_prism_header_padding',array('label'=>__('Header spacing','rss-prism'),'section'=>'rss_prism_header_controls','type'=>'select','choices'=>array('compact'=>__('Compact','rss-prism'),'normal'=>__('Comfortable','rss-prism'),'spacious'=>__('Spacious','rss-prism'))));

	$wp_customize->add_section( 'rss_prism_footer_layout', array(
		'title' => __( 'Footer Layout & Visibility', 'rss-prism' ),
		'panel' => 'rss_prism_panel',
		'priority' => 80,
		'description' => __( 'Choose footer alignment, columns, logo placement, spacing and visible elements.', 'rss-prism' ),
	) );
	$footer_choices=array('rss_prism_footer_alignment'=>array('left',array('left'=>__('Left aligned','rss-prism'),'center'=>__('Centered','rss-prism'),'right'=>__('Right aligned','rss-prism'))),'rss_prism_footer_columns'=>array('three',array('one'=>__('One column','rss-prism'),'two'=>__('Two columns','rss-prism'),'three'=>__('Three columns','rss-prism'))),'rss_prism_footer_logo_position'=>array('left',array('left'=>__('Logo above text','rss-prism'),'right'=>__('Logo beside text','rss-prism'))),'rss_prism_footer_spacing'=>array('normal',array('compact'=>__('Compact','rss-prism'),'normal'=>__('Comfortable','rss-prism'),'spacious'=>__('Spacious','rss-prism'))));
	foreach($footer_choices as $id=>$cfg){$wp_customize->add_setting($id,array('default'=>$cfg[0],'sanitize_callback'=>function($v)use($cfg){return array_key_exists($v,$cfg[1])?$v:$cfg[0];}));$wp_customize->add_control($id,array('label'=>ucwords(str_replace(array('rss_prism_','_'),array('',' '),$id)),'section'=>'rss_prism_footer_layout','type'=>'select','choices'=>$cfg[1]));}
	foreach(array('rss_prism_footer_show_logo'=>__('Show site logo in footer','rss-prism'),'rss_prism_footer_show_menu'=>__('Show footer navigation','rss-prism'),'rss_prism_footer_show_widgets'=>__('Show footer widget columns','rss-prism')) as $id=>$label){$wp_customize->add_setting($id,array('default'=>true,'sanitize_callback'=>'rest_sanitize_boolean'));$wp_customize->add_control($id,array('label'=>$label,'section'=>'rss_prism_footer_layout','type'=>'checkbox'));}

}
add_action( 'customize_register', 'rss_prism_customize_register' );

function rss_prism_enqueue_assets() {
	wp_enqueue_style( 'rss-prism-style', get_stylesheet_uri(), array(), wp_get_theme()->get( 'Version' ) );
	wp_enqueue_script( 'rss-prism-navigation', get_template_directory_uri() . '/assets/js/navigation.js', array(), wp_get_theme()->get( 'Version' ), true );
	// The navigation script is small and independent; defer execution to avoid blocking HTML parsing.
	wp_script_add_data( 'rss-prism-navigation', 'strategy', 'defer' );
	$accent = sanitize_hex_color( get_theme_mod( 'rss_prism_accent_color', '#b88a2b' ) );
	$background = sanitize_hex_color( get_theme_mod( 'rss_prism_background_color', '#f7f7f5' ) );
	$width = absint( get_theme_mod( 'rss_prism_content_width', 1120 ) );
	$width = min( 1600, max( 720, $width ) );
	$corner=get_theme_mod('rss_prism_corner_style','round');if(!in_array($corner,array('sharp','round','soft'),true))$corner='round';$radius=array('sharp'=>'4px','round'=>'16px','soft'=>'24px')[$corner];$surface=sanitize_hex_color(get_theme_mod('rss_prism_surface_color','#ffffff'));$text=sanitize_hex_color(get_theme_mod('rss_prism_text_color','#202124'));$muted=sanitize_hex_color(get_theme_mod('rss_prism_muted_color','#686b70'));$css=':root{--rss-prism-accent:'.($accent?$accent:'#b88a2b').';--rss-prism-background:'.($background?$background:'#f5f6f8').';--rss-prism-content-width:'.$width.'px;--rp-accent:'.($accent?$accent:'#b88a2b').';--rp-bg:'.($background?$background:'#f5f6f8').';--rp-width:'.$width.'px;--rp-paper:'.($surface?$surface:'#ffffff').';--rp-ink:'.($text?$text:'#202124').';--rp-muted:'.($muted?$muted:'#686b70').';--rp-radius:'.$radius.';'.('no'===get_theme_mod('rss_prism_shadow','yes')?'--rp-shadow:none;':'').'}';
	$font_scale=get_theme_mod('rss_prism_font_scale','normal');if(!in_array($font_scale,array('small','normal','large'),true))$font_scale='normal';$font_size=array('small'=>'15px','normal'=>'16px','large'=>'18px')[$font_scale];$button_shape=get_theme_mod('rss_prism_button_shape','pill');if(!in_array($button_shape,array('square','soft','pill'),true))$button_shape='pill';$button_radius=array('square'=>'4px','soft'=>'12px','pill'=>'999px')[$button_shape];$logo_width=min(420,max(80,absint(get_theme_mod('rss_prism_logo_width',220))));$logo_height=min(140,max(30,absint(get_theme_mod('rss_prism_logo_height',76))));$menu_font_size=min(22,max(11,absint(get_theme_mod('rss_prism_menu_font_size',15))));$menu_gap=min(24,max(0,absint(get_theme_mod('rss_prism_menu_gap',4))));$menu_padding_x=min(28,max(0,absint(get_theme_mod('rss_prism_menu_padding_x',12))));$menu_padding_y=min(20,max(0,absint(get_theme_mod('rss_prism_menu_padding_y',8))));$menu_radius=min(30,max(0,absint(get_theme_mod('rss_prism_menu_radius',10))));$menu_weight=get_theme_mod('rss_prism_menu_font_weight','600');if(!in_array((string)$menu_weight,array('400','500','600','700','800'),true))$menu_weight='600';$menu_transform=get_theme_mod('rss_prism_menu_text_transform','none');if(!in_array($menu_transform,array('none','uppercase','capitalize'),true))$menu_transform='none';$header_padding=get_theme_mod('rss_prism_header_padding','normal');$header_pad=array('compact'=>'0.45rem','normal'=>'1rem','spacious'=>'1.5rem')[$header_padding]??'1rem';$footer_spacing=get_theme_mod('rss_prism_footer_spacing','normal');$footer_pad=array('compact'=>'1.25rem','normal'=>'2.5rem','spacious'=>'4rem')[$footer_spacing]??'2.5rem';$font_family=get_theme_mod('rss_prism_font_family','system');$font_stack=array('system'=>'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif','arial'=>'Arial,Helvetica,sans-serif','georgia'=>'Georgia,"Times New Roman",serif','trebuchet'=>'"Trebuchet MS",sans-serif','verdana'=>'Verdana,Geneva,sans-serif')[$font_family]??'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';$css=substr($css,0,-1).'--rp-font-family:'.$font_stack.';--rp-font-size:'.$font_size.';--rp-button-radius:'.$button_radius.';--rp-logo-width:'.$logo_width.'px;--rp-logo-height:'.$logo_height.'px;--rp-menu-font-size:'.$menu_font_size.'px;--rp-menu-gap:'.$menu_gap.'px;--rp-menu-padding-x:'.$menu_padding_x.'px;--rp-menu-padding-y:'.$menu_padding_y.'px;--rp-menu-radius:'.$menu_radius.'px;--rp-menu-font-weight:'.$menu_weight.';--rp-menu-text-transform:'.$menu_transform.';--rp-header-padding:'.$header_pad.';--rp-footer-padding:'.$footer_pad.';}';
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
function rss_prism_meta(){
	echo '<div class="entry-meta"><time datetime="'.esc_attr(get_the_date(DATE_W3C)).'">'.esc_html(get_the_date()).'</time>';
	if(get_theme_mod('rss_prism_show_author',true)) echo '<span aria-hidden="true"> · </span>'.wp_kses_post(get_the_author_posts_link());
	echo '</div>';
	if(get_theme_mod('rss_prism_show_categories',true)){
		$categories=get_the_category();
		if(!empty($categories)){
			echo '<div class="entry-categories" aria-label="'.esc_attr__('Categories','rss-prism').'">';
			foreach($categories as $category){
				$link=get_category_link($category->term_id);
				if(!is_wp_error($link)) echo '<a href="'.esc_url($link).'">'.esc_html($category->name).'</a>';
			}
			echo '</div>';
		}
	}
}
function rss_prism_post_card(){?><article <?php post_class('entry-card'); ?> id="post-<?php the_ID(); ?>"><?php if(get_theme_mod('rss_prism_show_archive_images',true)&&has_post_thumbnail()):?><a class="entry-thumbnail" href="<?php the_permalink(); ?>" tabindex="-1" aria-hidden="true"><?php the_post_thumbnail('large',array('loading'=>'lazy'));?></a><?php endif;?><div class="entry-card__body"><?php rss_prism_meta();?><h2 class="entry-title"><a href="<?php the_permalink(); ?>"><?php the_title();?></a></h2><div class="entry-excerpt"><?php the_excerpt();?></div><a class="entry-read-more" href="<?php the_permalink(); ?>"><?php esc_html_e('Read article','rss-prism');?> →</a></div></article><?php }
function rss_prism_sidebar(){if(get_theme_mod('rss_prism_show_sidebar',true)&&is_active_sidebar('sidebar-1')){echo '<aside class="sidebar" aria-label="'.esc_attr__('Sidebar','rss-prism').'">';dynamic_sidebar('sidebar-1');echo '</aside>';}}
function rss_prism_widgets_init(){register_sidebar(array('name'=>__('Main Sidebar','rss-prism'),'id'=>'sidebar-1','before_widget'=>'<section id="%1$s" class="widget %2$s">','after_widget'=>'</section>','before_title'=>'<h2 class="widget-title">','after_title'=>'</h2>'));register_sidebar(array('name'=>__('Footer Column 1','rss-prism'),'id'=>'footer-1','before_widget'=>'<section class="footer-widget %2$s">','after_widget'=>'</section>','before_title'=>'<h2>','after_title'=>'</h2>'));register_sidebar(array('name'=>__('Footer Column 2','rss-prism'),'id'=>'footer-2','before_widget'=>'<section class="footer-widget %2$s">','after_widget'=>'</section>','before_title'=>'<h2>','after_title'=>'</h2>'));} add_action('widgets_init','rss_prism_widgets_init');

function rss_prism_breadcrumbs(){if(!get_theme_mod('rss_prism_show_breadcrumbs',true)||is_front_page()||is_home())return;echo '<nav class="rp-breadcrumbs rp-container" aria-label="'.esc_attr__('Breadcrumb','rss-prism').'">';echo '<a href="'.esc_url(home_url('/')).'">'.esc_html__('Home','rss-prism').'</a><span aria-hidden="true"> / </span>';if(is_category()||is_tag()||is_tax()||is_post_type_archive())echo '<span>'.esc_html(wp_strip_all_tags(get_the_archive_title())).'</span>';elseif(is_search())echo '<span>'.esc_html__('Search results','rss-prism').'</span>';elseif(is_404())echo '<span>'.esc_html__('Page not found','rss-prism').'</span>';elseif(is_singular('post')){$cats=get_the_category();if(!empty($cats))echo '<a href="'.esc_url(get_category_link($cats[0]->term_id)).'">'.esc_html($cats[0]->name).'</a><span aria-hidden="true"> / </span>';echo '<span>'.esc_html(get_the_title()).'</span>';}elseif(is_singular())echo '<span>'.esc_html(get_the_title()).'</span>';else echo '<span>'.esc_html(wp_strip_all_tags(get_the_archive_title())).'</span>';echo '</nav>';}
function rss_prism_activation_welcome(){
	// Show the welcome card only on first activation. Do not reset a user's Hide preference on routine theme switches.
	$user_id=get_current_user_id();
	if($user_id && !get_user_meta($user_id,'rss_prism_welcome_seen',true)){
		delete_user_meta($user_id,'rss_prism_welcome_dismissed');
		update_user_meta($user_id,'rss_prism_welcome_seen',1);
	}
}
add_action('after_switch_theme','rss_prism_activation_welcome');
function rss_prism_welcome_notice(){
	if(!current_user_can('switch_themes')||!is_admin()||!isset($GLOBALS['pagenow'])||'themes.php'!==$GLOBALS['pagenow'])return;
	$user_id=get_current_user_id();if(!$user_id||get_user_meta($user_id,'rss_prism_welcome_dismissed',true))return;
	$dismiss_url=wp_nonce_url(admin_url('admin-post.php?action=rss_prism_dismiss_welcome'),'rss_prism_dismiss_welcome');
	$dismiss_nonce=wp_create_nonce('rss_prism_dismiss_welcome');

	echo '<div class="notice notice-success rp-welcome-notice"><div class="rp-welcome-hero"><span class="rp-welcome-kicker">'.esc_html__('YOUR SITE. YOUR STYLE.','rss-prism').'</span><h2>'.esc_html__('Welcome to RSS Prism','rss-prism').'</h2><p class="rp-welcome-lead">'.esc_html__('A flexible toolkit for building a polished website without needing to code. Start with your brand, shape your header and footer, then fine-tune every detail.','rss-prism').'</p><div class="rp-welcome-actions"><a class="button button-primary button-hero" href="'.esc_url(admin_url('themes.php?page=rss-prism-studio')).'">'.esc_html__('Open RSS Prism Studio','rss-prism').'</a> <a class="button button-hero" href="'.esc_url(admin_url('customize.php')).'">'.esc_html__('Open theme customizer','rss-prism').'</a> <a class="button button-hero" href="'.esc_url(admin_url('nav-menus.php')).'">'.esc_html__('Build your menus','rss-prism').'</a> <a class="button button-hero" href="'.esc_url(home_url('/')).'" target="_blank" rel="noopener noreferrer">'.esc_html__('Preview your website','rss-prism').'</a> <a class="button button-hero" href="'.esc_url(admin_url('post-new.php?post_type=page')).'">'.esc_html__('Create a page','rss-prism').'</a></div></div><div class="rp-welcome-features"><div><span class="dashicons dashicons-art"></span><strong>'.esc_html__('Brand & design','rss-prism').'</strong><p>'.esc_html__('Colours, typography, buttons, widths and layouts.','rss-prism').'</p></div><div><span class="dashicons dashicons-editor-kitchensink"></span><strong>'.esc_html__('Header controls','rss-prism').'</strong><p>'.esc_html__('Logo placement, menu styles, spacing and sticky navigation. Open Dashboard → Appearance → RSS Prism Studio to arrange header rows and preview desktop/mobile layouts.','rss-prism').'</p></div><div><span class="dashicons dashicons-screenoptions"></span><strong>'.esc_html__('Footer builder','rss-prism').'</strong><p>'.esc_html__('Logo, alignment, columns, colour, copy and widgets.','rss-prism').'</p></div><div><span class="dashicons dashicons-smartphone"></span><strong>'.esc_html__('Responsive layouts','rss-prism').'</strong><p>'.esc_html__('Mobile-friendly menus and article cards.','rss-prism').'</p></div><div><span class="dashicons dashicons-layout"></span><strong>'.esc_html__('Visual page builder','rss-prism').'</strong><p>'.esc_html__('Optional RSS Prism Builder plugin adds draggable sections, headings, text, buttons, and image blocks with responsive controls.','rss-prism').'</p></div><div><span class="dashicons dashicons-images-alt2"></span><strong>'.esc_html__('Reusable templates','rss-prism').'</strong><p>'.esc_html__('Create a Prism Template, arrange elements, save it, then publish and embed it with the canvas shortcode.','rss-prism').'</p></div></div>';
	echo '<p class="rp-welcome-dismiss"><a class="rp-welcome-hide" href="'.esc_url($dismiss_url).'" data-nonce="'.esc_attr($dismiss_nonce).'">'.esc_html__('Hide','rss-prism').'</a></p></div>';
}
add_action('admin_notices','rss_prism_welcome_notice');

function rss_prism_handle_dismiss_welcome(){
	if(!current_user_can('switch_themes')) wp_die(esc_html__('You are not allowed to do this.','rss-prism'));
	check_admin_referer('rss_prism_dismiss_welcome');
	update_user_meta(get_current_user_id(),'rss_prism_welcome_dismissed',1);
	wp_safe_redirect(admin_url('themes.php'));
	exit;
}
add_action('admin_post_rss_prism_dismiss_welcome','rss_prism_handle_dismiss_welcome');

function rss_prism_ajax_dismiss_welcome(){
	check_ajax_referer('rss_prism_dismiss_welcome','nonce');
	if(!current_user_can('switch_themes')) wp_send_json_error(array('message'=>__('Permission denied.','rss-prism')),403);
	update_user_meta(get_current_user_id(),'rss_prism_welcome_dismissed',1);
	wp_send_json_success();
}
add_action('wp_ajax_rss_prism_dismiss_welcome','rss_prism_ajax_dismiss_welcome');

function rss_prism_admin_welcome_styles($hook){
	if('themes.php'!==$hook)return;
	wp_register_style('rss-prism-admin-welcome',false,array(),wp_get_theme()->get('Version'));
	wp_enqueue_style('rss-prism-admin-welcome');
	wp_add_inline_style('rss-prism-admin-welcome','.rp-welcome-notice{margin:20px 20px 20px 0!important;padding:0!important;border:1px solid #dcdcde!important;border-left:5px solid #b88a2b!important;border-radius:14px;overflow:hidden;box-shadow:0 12px 32px rgba(20,24,33,.08);background:#fff}.rp-welcome-hero{padding:clamp(24px,4vw,42px);background:radial-gradient(circle at 90% 0%,rgba(184,138,43,.18),transparent 38%),linear-gradient(135deg,#fffdf7,#f7f7f5)}.rp-welcome-kicker{font-size:11px;letter-spacing:.16em;font-weight:800;color:#9b711b}.rp-welcome-notice .rp-welcome-hero h2{font-size:clamp(27px,3vw,38px);line-height:1.15;margin:10px 0 12px;color:#202124}.rp-welcome-lead{font-size:15px;line-height:1.7;max-width:760px;color:#555b65;margin:0 0 22px}.rp-welcome-actions{display:flex;gap:8px;flex-wrap:wrap}.rp-welcome-actions .button-hero{min-height:42px;padding:7px 15px;display:inline-flex;align-items:center}.rp-welcome-features{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;padding:20px 24px}.rp-welcome-features>div{padding:16px;border:1px solid #e6e7e9;border-radius:12px;background:#fff}.rp-welcome-features .dashicons{display:block;color:#b88a2b;margin-bottom:12px;font-size:23px;width:24px;height:24px}.rp-welcome-features strong{display:block;font-size:13px;color:#202124}.rp-welcome-features p{margin:6px 0 0;color:#686d76;font-size:12px;line-height:1.55}.rp-welcome-dismiss{padding:0 24px 18px;margin:0;text-align:right}.rp-welcome-dismiss a{color:#686d76}@media(max-width:1000px){.rp-welcome-features{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:782px){}@media(max-width:600px){.rp-welcome-features{grid-template-columns:1fr}}');
	wp_add_inline_style('rss-prism-admin-welcome','.rp-welcome-notice{max-width:1500px}.rp-welcome-hero{padding:clamp(32px,5vw,56px)}.rp-welcome-notice .rp-welcome-hero h2{font-size:clamp(32px,3.4vw,44px)}.rp-welcome-lead{font-size:16px;max-width:900px}.rp-welcome-features{grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;padding:24px 28px}.rp-welcome-features>div{min-height:142px;padding:20px}.rp-welcome-features strong{font-size:14px}.rp-welcome-features p{font-size:13px}@media(max-width:1100px){.rp-welcome-features{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:600px){.rp-welcome-features{grid-template-columns:1fr}.rp-welcome-hero{padding:24px}}');

}
add_action('admin_enqueue_scripts','rss_prism_admin_welcome_styles');




require_once get_template_directory() . '/inc/theme-studio.php';
require_once get_template_directory() . '/inc/admin-dashboard.php';
require_once get_template_directory() . '/inc/auto-updates.php';
