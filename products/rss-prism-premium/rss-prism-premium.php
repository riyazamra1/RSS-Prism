<?php
/**
 * Plugin Name: RSS Prism Premium
 * Plugin URI: https://www.rsscctvsolution.eu.cc/
 * Description: Optional RSS Prism Premium add-on with email-bound licence activation.
 * Version: 0.1.0
 * Requires at least: 6.4
 * Requires PHP: 7.4
 * Author: Razeen Secure Solution
 * License: GPL-2.0-or-later
 * Text Domain: rss-prism-premium
 */
defined( 'ABSPATH' ) || exit;

define( 'RSS_PRISM_PREMIUM_VERSION', '0.1.0' );
define( 'RSS_PRISM_PREMIUM_OPTION', 'rss_prism_premium_license' );

function rss_prism_premium_defaults() {
	return array(
		'api_url' => '',
		'license_key' => '',
		'email' => '',
		'status' => 'not_configured',
		'message' => '',
		'activation_limit' => 0,
		'active_activations' => 0,
		'valid_until' => '',
	);
}

function rss_prism_premium_get_settings() {
	$saved = get_option( RSS_PRISM_PREMIUM_OPTION, array() );
	return wp_parse_args( is_array( $saved ) ? $saved : array(), rss_prism_premium_defaults() );
}

function rss_prism_premium_api_url( $value ) {
	$value = esc_url_raw( trim( (string) $value ), array( 'https' ) );
	return untrailingslashit( $value );
}

function rss_prism_premium_remote_request( $endpoint, $site_url = '' ) {
	$settings = rss_prism_premium_get_settings();
	$api_url = rss_prism_premium_api_url( $settings['api_url'] );
	$key = trim( (string) $settings['license_key'] );
	$email = sanitize_email( $settings['email'] );

	if ( ! $api_url || ! is_email( $email ) || ! preg_match( '/^[A-Z0-9-]{16,128}$/i', $key ) ) {
		return new WP_Error( 'rss_prism_license_incomplete', __( 'Enter the licensing server URL, licence key and purchase email.', 'rss-prism-premium' ) );
	}

	$body = array(
		'license_key' => $key,
		'email' => strtolower( $email ),
		'product_id' => 'rss-prism-premium',
	);
	if ( '' !== $site_url ) {
		$body['site_url'] = esc_url_raw( $site_url );
	}

	$response = wp_remote_post(
		$api_url . '/v1/license/' . trim( $endpoint, '/' ),
		array(
			'timeout' => 12,
			'redirection' => 0,
			'headers' => array( 'Content-Type' => 'application/json', 'Accept' => 'application/json' ),
			'body' => wp_json_encode( $body ),
		)
	);
	if ( is_wp_error( $response ) ) {
		return new WP_Error( 'rss_prism_license_unreachable', __( 'The RSS Prism licence server could not be reached. Premium remains locked.', 'rss-prism-premium' ) );
	}
	$status = (int) wp_remote_retrieve_response_code( $response );
	$data = json_decode( wp_remote_retrieve_body( $response ), true );
	if ( $status < 200 || $status >= 300 || ! is_array( $data ) ) {
		$message = isset( $data['message'] ) && is_string( $data['message'] ) ? sanitize_text_field( $data['message'] ) : __( 'The licence was not accepted. Check the purchase email and licence status.', 'rss-prism-premium' );
		return new WP_Error( 'rss_prism_license_rejected', $message, array( 'status' => $status ) );
	}
	return $data;
}

function rss_prism_premium_handle_license_action() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( esc_html__( 'You are not allowed to manage RSS Prism licences.', 'rss-prism-premium' ), 403 );
	}
	check_admin_referer( 'rss_prism_premium_license_action', 'rss_prism_premium_nonce' );

	$action = isset( $_POST['rss_prism_action'] ) ? sanitize_key( wp_unslash( $_POST['rss_prism_action'] ) ) : '';
	$settings = rss_prism_premium_get_settings();
	$settings['api_url'] = isset( $_POST['api_url'] ) ? rss_prism_premium_api_url( wp_unslash( $_POST['api_url'] ) ) : $settings['api_url'];
	$settings['license_key'] = isset( $_POST['license_key'] ) ? strtoupper( sanitize_text_field( wp_unslash( $_POST['license_key'] ) ) ) : $settings['license_key'];
	$settings['email'] = isset( $_POST['email'] ) ? strtolower( sanitize_email( wp_unslash( $_POST['email'] ) ) ) : $settings['email'];

	if ( 'deactivate' === $action ) {
		$result = rss_prism_premium_remote_request( 'deactivate', site_url( '/' ) );
		if ( is_wp_error( $result ) ) {
			$settings['status'] = 'error';
			$settings['message'] = $result->get_error_message();
		} else {
			$settings['status'] = 'deactivated';
			$settings['message'] = __( 'This website has been deactivated for this licence.', 'rss-prism-premium' );
			$settings['active_activations'] = isset( $result['active_activations'] ) ? absint( $result['active_activations'] ) : 0;
		}
	} elseif ( 'activate' === $action || 'verify' === $action ) {
		$endpoint = 'activate' === $action ? 'activate' : 'verify';
		$result = rss_prism_premium_remote_request( $endpoint, 'activate' === $action ? site_url( '/' ) : '' );
		if ( is_wp_error( $result ) ) {
			$settings['status'] = 'invalid';
			$settings['message'] = $result->get_error_message();
			$settings['activation_limit'] = 0;
			$settings['active_activations'] = 0;
			$settings['valid_until'] = '';
		} else {
			$ok = ! empty( $result['activated'] ) || ! empty( $result['valid'] );
			$settings['status'] = $ok ? ( 'activate' === $action ? 'active' : 'verified' ) : 'invalid';
			$settings['message'] = $ok ? __( 'Licence verified by the RSS Prism server.', 'rss-prism-premium' ) : __( 'The RSS Prism server did not approve this licence.', 'rss-prism-premium' );
			$settings['activation_limit'] = isset( $result['activation_limit'] ) ? absint( $result['activation_limit'] ) : 0;
			$settings['active_activations'] = isset( $result['active_activations'] ) ? absint( $result['active_activations'] ) : 0;
			$settings['valid_until'] = isset( $result['valid_until'] ) && is_string( $result['valid_until'] ) ? sanitize_text_field( $result['valid_until'] ) : '';
		}
	} else {
		$settings['status'] = 'error';
		$settings['message'] = __( 'Unknown licence action.', 'rss-prism-premium' );
	}

	update_option( RSS_PRISM_PREMIUM_OPTION, $settings, false );
	delete_transient( 'rss_prism_premium_entitlement_' . get_current_blog_id() );
	wp_safe_redirect( add_query_arg( array( 'page' => 'rss-prism-premium-license', 'rss_prism_notice' => '1' ), admin_url( 'admin.php' ) ) );
	exit;
}
add_action( 'admin_post_rss_prism_premium_license_action', 'rss_prism_premium_handle_license_action' );

function rss_prism_premium_admin_menu() {
	add_submenu_page(
		'options-general.php',
		__( 'RSS Prism Premium Licence', 'rss-prism-premium' ),
		__( 'RSS Prism Licence', 'rss-prism-premium' ),
		'manage_options',
		'rss-prism-premium-license',
		'rss_prism_premium_render_license_page'
	);
}
add_action( 'admin_menu', 'rss_prism_premium_admin_menu' );

function rss_prism_premium_render_license_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	$s = rss_prism_premium_get_settings();
	$known_status = array(
		'not_configured' => __( 'Not configured', 'rss-prism-premium' ),
		'active' => __( 'Activated', 'rss-prism-premium' ),
		'verified' => __( 'Verified (not activated on this site)', 'rss-prism-premium' ),
		'deactivated' => __( 'Deactivated', 'rss-prism-premium' ),
		'invalid' => __( 'Not valid', 'rss-prism-premium' ),
		'error' => __( 'Needs attention', 'rss-prism-premium' ),
	);
	?>
	<div class="wrap">
		<h1><?php esc_html_e( 'RSS Prism Premium Licence', 'rss-prism-premium' ); ?></h1>
		<p><?php esc_html_e( 'Enter the licence key and the same email address used for the purchase. Both must match the official RSS licence record.', 'rss-prism-premium' ); ?></p>
		<?php if ( isset( $_GET['rss_prism_notice'] ) ) : ?>
			<div class="notice notice-info is-dismissible"><p><?php echo esc_html( $s['message'] ); ?></p></div>
		<?php endif; ?>
		<table class="widefat striped" style="max-width:760px;margin:1rem 0">
			<tbody>
				<tr><th><?php esc_html_e( 'Status', 'rss-prism-premium' ); ?></th><td><strong><?php echo esc_html( $known_status[ $s['status'] ] ?? $known_status['error'] ); ?></strong></td></tr>
				<tr><th><?php esc_html_e( 'Website activations', 'rss-prism-premium' ); ?></th><td><?php echo esc_html( absint( $s['active_activations'] ) . ' / ' . absint( $s['activation_limit'] ) ); ?></td></tr>
				<tr><th><?php esc_html_e( 'Valid until', 'rss-prism-premium' ); ?></th><td><?php echo esc_html( $s['valid_until'] ? $s['valid_until'] : __( 'Not available', 'rss-prism-premium' ) ); ?></td></tr>
			</tbody>
		</table>
		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" style="max-width:760px">
			<input type="hidden" name="action" value="rss_prism_premium_license_action">
			<?php wp_nonce_field( 'rss_prism_premium_license_action', 'rss_prism_premium_nonce' ); ?>
			<table class="form-table" role="presentation">
				<tr><th scope="row"><label for="rss-prism-api-url"><?php esc_html_e( 'Licence server URL', 'rss-prism-premium' ); ?></label></th><td><input class="regular-text" type="url" id="rss-prism-api-url" name="api_url" value="<?php echo esc_attr( $s['api_url'] ); ?>" placeholder="https://your-licence-worker.example.workers.dev" required><p class="description"><?php esc_html_e( 'HTTPS only. The server must be deployed and configured before activation can work.', 'rss-prism-premium' ); ?></p></td></tr>
				<tr><th scope="row"><label for="rss-prism-license-key"><?php esc_html_e( 'Licence key', 'rss-prism-premium' ); ?></label></th><td><input class="regular-text" type="password" autocomplete="off" id="rss-prism-license-key" name="license_key" value="<?php echo esc_attr( $s['license_key'] ); ?>" placeholder="RSSP-XXXX-XXXX-XXXX" required></td></tr>
				<tr><th scope="row"><label for="rss-prism-license-email"><?php esc_html_e( 'Purchase email', 'rss-prism-premium' ); ?></label></th><td><input class="regular-text" type="email" autocomplete="email" id="rss-prism-license-email" name="email" value="<?php echo esc_attr( $s['email'] ); ?>" required></td></tr>
			</table>
			<p>
				<button class="button button-primary" name="rss_prism_action" value="activate"><?php esc_html_e( 'Activate on this website', 'rss-prism-premium' ); ?></button>
				<button class="button" name="rss_prism_action" value="verify"><?php esc_html_e( 'Verify key and email', 'rss-prism-premium' ); ?></button>
				<button class="button" name="rss_prism_action" value="deactivate"><?php esc_html_e( 'Deactivate this website', 'rss-prism-premium' ); ?></button>
			</p>
		</form>
		<p class="description"><?php esc_html_e( 'No licence or purchase is created here. Activation only succeeds when the official server already contains a matching, active licence.', 'rss-prism-premium' ); ?></p>
	</div>
	<?php
}

/**
 * Check entitlement server-side before running a Premium feature.
 * Call this from Premium feature callbacks; never trust a browser-side flag.
 * @return bool
 */
function rss_prism_premium_is_licensed() {
	$cache_key = 'rss_prism_premium_entitlement_' . get_current_blog_id();
	$cached = get_transient( $cache_key );
	if ( is_bool( $cached ) ) {
		return $cached;
	}
	$result = rss_prism_premium_remote_request( 'activate', site_url( '/' ) );
	$licensed = ! is_wp_error( $result ) && ! empty( $result['activated'] );
	set_transient( $cache_key, $licensed, 5 * MINUTE_IN_SECONDS );
	return $licensed;
}

/** Keep the admin display in sync when a feature checks entitlement. */
function rss_prism_premium_feature_is_available( $feature_id = '' ) {
	unset( $feature_id );
	return rss_prism_premium_is_licensed();
}
