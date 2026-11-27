<?php
/**
 * Customizer & Theme Studio header/footer layout builder.
 *
 * @package RSS_Prism
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function rss_prism_get_header_rows() {
	$saved   = get_option( 'rss_prism_header_rows', array() );
	$allowed = array( 'brand', 'menu', 'button', 'search', 'social' );
	if ( ! is_array( $saved ) || count( $saved ) !== 3 ) {
		return array( array(), array( 'brand', 'menu', 'button' ), array() );
	}
	$clean = array();
	$seen  = array();
	foreach ( $saved as $row ) {
		$row_clean = array();
		if ( is_array( $row ) ) {
			foreach ( $row as $item ) {
				$key = sanitize_key( $item );
				if ( in_array( $key, $allowed, true ) && ! in_array( $key, $seen, true ) ) {
					$seen[]      = $key;
					$row_clean[] = $key;
				}
			}
		}
		$clean[] = $row_clean;
	}
	return $clean;
}

function rss_prism_get_footer_rows() {
	$saved   = get_option( 'rss_prism_footer_rows', array() );
	$allowed = array( 'brand', 'description', 'menu', 'widgets', 'social', 'copyright', 'credit' );
	if ( ! is_array( $saved ) || count( $saved ) !== 3 ) {
		return array( array( 'brand', 'description' ), array( 'menu', 'widgets' ), array( 'copyright', 'credit' ) );
	}
	$clean = array();
	$seen  = array();
	foreach ( $saved as $row ) {
		$row_clean = array();
		if ( is_array( $row ) ) {
			foreach ( $row as $item ) {
				$key = sanitize_key( $item );
				if ( in_array( $key, $allowed, true ) && ! in_array( $key, $seen, true ) ) {
					$seen[]      = $key;
					$row_clean[] = $key;
				}
			}
		}
		$clean[] = $row_clean;
	}
	return $clean;
}

function rss_prism_customize_register( $wp_customize ) {
	$wp_customize->add_section(
		'rss_prism_design',
		array(
			'title'    => __( 'RSS Prism Design', 'rss-prism' ),
			'priority' => 30,
		)
	);

	$wp_customize->add_setting( 'rss_prism_accent_color', array( 'default' => '#b88a2b', 'sanitize_callback' => 'sanitize_hex_color' ) );
	$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'rss_prism_accent_color', array(
		'label'   => __( 'Accent Color', 'rss-prism' ),
		'section' => 'rss_prism_design',
	) ) );

	$wp_customize->add_setting( 'rss_prism_background_color', array( 'default' => '#f5f6f8', 'sanitize_callback' => 'sanitize_hex_color' ) );
	$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'rss_prism_background_color', array(
		'label'   => __( 'Background Color', 'rss-prism' ),
		'section' => 'rss_prism_design',
	) ) );

	$wp_customize->add_setting( 'rss_prism_content_width', array( 'default' => 1180, 'sanitize_callback' => 'absint' ) );
	$wp_customize->add_control( 'rss_prism_content_width', array(
		'label'       => __( 'Content Width (px)', 'rss-prism' ),
		'section'     => 'rss_prism_design',
		'type'        => 'number',
		'input_attrs' => array( 'min' => 720, 'max' => 1600, 'step' => 20 ),
	) );

	$wp_customize->add_setting( 'rss_prism_header_style', array( 'default' => 'standard', 'sanitize_callback' => 'sanitize_key' ) );
	$wp_customize->add_control( 'rss_prism_header_style', array(
		'label'   => __( 'Header Style', 'rss-prism' ),
		'section' => 'rss_prism_design',
		'type'    => 'select',
		'choices' => array(
			'standard' => __( 'Standard', 'rss-prism' ),
			'centered' => __( 'Centered', 'rss-prism' ),
			'dark'     => __( 'Dark', 'rss-prism' ),
		),
	) );

	$wp_customize->add_setting( 'rss_prism_footer_style', array( 'default' => 'light', 'sanitize_callback' => 'sanitize_key' ) );
	$wp_customize->add_control( 'rss_prism_footer_style', array(
		'label'   => __( 'Footer Style', 'rss-prism' ),
		'section' => 'rss_prism_design',
		'type'    => 'select',
		'choices' => array(
			'light'  => __( 'Light', 'rss-prism' ),
			'dark'   => __( 'Dark', 'rss-prism' ),
			'accent' => __( 'Accent', 'rss-prism' ),
		),
	) );

	$wp_customize->add_setting( 'rss_prism_footer_text', array( 'default' => 'Developing Ideas. Delivering Solutions.', 'sanitize_callback' => 'sanitize_text_field' ) );
	$wp_customize->add_control( 'rss_prism_footer_text', array(
		'label'   => __( 'Footer Description', 'rss-prism' ),
		'section' => 'rss_prism_design',
		'type'    => 'text',
	) );

	$wp_customize->add_setting( 'rss_prism_footer_copyright', array( 'default' => '', 'sanitize_callback' => 'sanitize_text_field' ) );
	$wp_customize->add_control( 'rss_prism_footer_copyright', array(
		'label'   => __( 'Footer Copyright Text', 'rss-prism' ),
		'section' => 'rss_prism_design',
		'type'    => 'text',
	) );
}
add_action( 'customize_register', 'rss_prism_customize_register' );

function rss_prism_register_studio_page() {
	add_theme_page(
		__( 'RSS Prism Studio', 'rss-prism' ),
		__( 'Theme Studio', 'rss-prism' ),
		'edit_theme_options',
		'rss-prism-studio',
		'rss_prism_render_studio_page'
	);
}
add_action( 'admin_menu', 'rss_prism_register_studio_page' );

function rss_prism_studio_admin_assets( $hook ) {
	if ( 'appearance_page_rss-prism-studio' !== $hook ) {
		return;
	}
	wp_enqueue_style( 'rss-prism-studio', get_template_directory_uri() . '/assets/css/theme-studio.css', array(), RSS_PRISM_VERSION );
	wp_enqueue_script( 'rss-prism-studio', get_template_directory_uri() . '/assets/js/theme-studio.js', array(), RSS_PRISM_VERSION, true );
}
add_action( 'admin_enqueue_scripts', 'rss_prism_studio_admin_assets' );

function rss_prism_render_studio_page() {
	if ( ! current_user_can( 'edit_theme_options' ) ) {
		return;
	}

	$saved = false;
	if ( isset( $_POST['rss_prism_studio_nonce'] ) && wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['rss_prism_studio_nonce'] ) ), 'rss_prism_save_studio' ) ) {
		$h_json = isset( $_POST['rss_prism_header_rows_json'] ) ? json_decode( wp_unslash( $_POST['rss_prism_header_rows_json'] ), true ) : null;
		$f_json = isset( $_POST['rss_prism_footer_rows_json'] ) ? json_decode( wp_unslash( $_POST['rss_prism_footer_rows_json'] ), true ) : null;
		if ( is_array( $h_json ) && count( $h_json ) === 3 ) {
			update_option( 'rss_prism_header_rows', $h_json );
		}
		if ( is_array( $f_json ) && count( $f_json ) === 3 ) {
			update_option( 'rss_prism_footer_rows', $f_json );
		}
		if ( isset( $_POST['rss_prism_header_button_label'] ) ) {
			set_theme_mod( 'rss_prism_header_button_label', sanitize_text_field( wp_unslash( $_POST['rss_prism_header_button_label'] ) ) );
		}
		if ( isset( $_POST['rss_prism_header_button_url'] ) ) {
			set_theme_mod( 'rss_prism_header_button_url', esc_url_raw( wp_unslash( $_POST['rss_prism_header_button_url'] ) ) );
		}
		$saved = true;
	}

	$header_rows = rss_prism_get_header_rows();
	$footer_rows = rss_prism_get_footer_rows();
	?>
	<div class="wrap rp-studio-wrap">
		<h1><?php esc_html_e( 'RSS Prism Theme Studio', 'rss-prism' ); ?></h1>
		<?php if ( $saved ) : ?>
			<div class="notice notice-success"><p><?php esc_html_e( 'Header and footer layout saved.', 'rss-prism' ); ?></p></div>
		<?php endif; ?>
		<form method="post">
			<?php wp_nonce_field( 'rss_prism_save_studio', 'rss_prism_studio_nonce' ); ?>
			<input type="hidden" name="rss_prism_header_rows_json" id="rp-header-rows-json" value="<?php echo esc_attr( wp_json_encode( $header_rows ) ); ?>">
			<input type="hidden" name="rss_prism_footer_rows_json" id="rp-footer-rows-json" value="<?php echo esc_attr( wp_json_encode( $footer_rows ) ); ?>">
			<p>
				<label><?php esc_html_e( 'Header CTA Label', 'rss-prism' ); ?><br>
					<input type="text" name="rss_prism_header_button_label" value="<?php echo esc_attr( get_theme_mod( 'rss_prism_header_button_label', __( 'Get in touch', 'rss-prism' ) ) ); ?>">
				</label>
			</p>
			<p>
				<label><?php esc_html_e( 'Header CTA URL', 'rss-prism' ); ?><br>
					<input type="url" name="rss_prism_header_button_url" value="<?php echo esc_attr( get_theme_mod( 'rss_prism_header_button_url', home_url( '/#contact' ) ) ); ?>">
				</label>
			</p>
			<?php submit_button( __( 'Save Theme Studio Settings', 'rss-prism' ) ); ?>
		</form>
	</div>
	<?php
}
