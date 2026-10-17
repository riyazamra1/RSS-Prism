<?php
/**
 * RSS Prism Builder updater.
 *
 * Stable packages are published as GitHub release assets.
 */
defined( 'ABSPATH' ) || exit;

final class RSS_Prism_Builder_Auto_Updates {
	const API_URL = 'https://api.github.com/repos/riyazamra1/RSS-Prism/releases?per_page=30';
	const CACHE_KEY = 'rss_prism_builder_release_metadata';
	const CACHE_TTL = 900;
	const PLUGIN_SLUG = 'rss-prism-builder';

	public static function init() {
		add_filter( 'pre_set_site_transient_update_plugins', array( __CLASS__, 'inject_update' ) );
		add_filter( 'site_transient_update_plugins', array( __CLASS__, 'inject_update' ) );
		// Plugins declaring a non-WordPress.org Update URI are checked through a host-specific filter.
		// Return the update object here so WordPress receives the actual downloadable package URL.
		add_filter( 'update_plugins_github.com', array( __CLASS__, 'host_update' ), 10, 4 );
		add_filter( 'plugins_api', array( __CLASS__, 'plugin_information' ), 20, 3 );
		add_action( 'admin_post_rss_prism_builder_check_updates', array( __CLASS__, 'force_check' ) );
		add_action( 'admin_notices', array( __CLASS__, 'admin_notice' ) );
		add_filter( 'plugin_action_links_' . self::plugin_file(), array( __CLASS__, 'action_links' ) );
	}

	private static function plugin_file() {
		return plugin_basename( dirname( dirname( __FILE__ ) ) . '/rss-prism-builder.php' );
	}

	private static function current_version() {
		return defined( 'RSS_PRISM_BUILDER_VERSION' ) ? RSS_PRISM_BUILDER_VERSION : '0.18.0';
	}

	private static function release_data( $force = false ) {
		if ( ! $force ) {
			$cached = get_site_transient( self::CACHE_KEY );
			if ( is_array( $cached ) && ! empty( $cached['version'] ) && ! empty( $cached['zip_url'] ) ) {
				return $cached;
			}
		}

		$response = wp_remote_get( self::API_URL, array(
			'timeout' => 20,
			'redirection' => 5,
			'headers' => array(
				'Accept' => 'application/vnd.github+json',
				'User-Agent' => 'RSS-Prism-Builder/' . self::current_version() . '; WordPress/' . get_bloginfo( 'version' ),
				'X-GitHub-Api-Version' => '2022-11-28',
			),
		) );

		if ( is_wp_error( $response ) || 200 !== (int) wp_remote_retrieve_response_code( $response ) ) {
			return array();
		}

		$releases = json_decode( wp_remote_retrieve_body( $response ), true );
		if ( ! is_array( $releases ) ) {
			return array();
		}

		$valid = array();
		foreach ( $releases as $release ) {
			if ( ! is_array( $release ) || ! empty( $release['draft'] ) || ! empty( $release['prerelease'] ) ) {
				continue;
			}
			$tag = isset( $release['tag_name'] ) ? (string) $release['tag_name'] : '';
			if ( ! preg_match( '/^rss-prism-builder-v([0-9]+\.[0-9]+\.[0-9]+)$/', $tag, $matches ) ) {
				continue;
			}
			$version = $matches[1];
			$zip_url = '';
			if ( ! empty( $release['assets'] ) && is_array( $release['assets'] ) ) {
				foreach ( $release['assets'] as $asset ) {
					if ( empty( $asset['name'] ) || 'rss-prism-builder.zip' !== $asset['name'] || empty( $asset['browser_download_url'] ) ) {
						continue;
					}
					if ( isset( $asset['state'] ) && 'uploaded' !== $asset['state'] ) {
						continue;
					}
					$candidate = esc_url_raw( $asset['browser_download_url'] );
					$parts = wp_parse_url( $candidate );
					$expected_path = '/riyazamra1/RSS-Prism/releases/download/' . $tag . '/rss-prism-builder.zip';
					if ( is_array( $parts ) && isset( $parts['scheme'], $parts['host'], $parts['path'] ) &&
						'https' === strtolower( $parts['scheme'] ) &&
						'github.com' === strtolower( $parts['host'] ) &&
						$expected_path === $parts['path'] ) {
						$zip_url = $candidate;
					}
					break;
				}
			}
			if ( '' === $zip_url ) {
				continue;
			}
			$valid[] = array(
				'version' => $version,
				'tag' => $tag,
				'zip_url' => $zip_url,
				'homepage' => ! empty( $release['html_url'] ) ? esc_url_raw( $release['html_url'] ) : 'https://github.com/riyazamra1/RSS-Prism/releases',
				'release_notes' => isset( $release['body'] ) ? wp_strip_all_tags( (string) $release['body'] ) : '',
				'published_at' => isset( $release['published_at'] ) ? sanitize_text_field( $release['published_at'] ) : '',
			);
		}

		usort( $valid, function( $a, $b ) {
			return version_compare( $b['version'], $a['version'] );
		} );
		$latest = isset( $valid[0] ) ? $valid[0] : array();
		// Do not cache failed/empty API responses: a temporary GitHub outage must not hide updates.
		if ( ! empty( $latest['version'] ) && ! empty( $latest['zip_url'] ) ) {
			set_site_transient( self::CACHE_KEY, $latest, self::CACHE_TTL );
		}
		return $latest;
	}


	/**
	 * WordPress routes plugins with Update URI=https://github.com/... through this host filter.
	 * The generic update transient alone is not sufficient on all supported WordPress versions.
	 */
	public static function host_update( $update, $plugin_data, $plugin_file, $locales ) {
		unset( $plugin_data, $locales );
		if ( self::plugin_file() !== $plugin_file ) {
			return $update;
		}
		$release = self::release_data();
		if ( empty( $release['version'] ) || empty( $release['zip_url'] ) ||
			! version_compare( self::current_version(), $release['version'], '<' ) ) {
			return false;
		}
		$result = new stdClass();
		$result->id = 'https://github.com/riyazamra1/RSS-Prism/';
		$result->slug = self::PLUGIN_SLUG;
		$result->plugin = $plugin_file;
		$result->new_version = $release['version'];
		$result->url = $release['homepage'];
		$result->package = $release['zip_url'];
		$result->tested = '6.8';
		$result->requires = '6.4';
		$result->requires_php = '7.4';
		return $result;
	}

	public static function inject_update( $transient ) {
		if ( ! is_object( $transient ) ) {
			$transient = new stdClass();
		}
		if ( ! isset( $transient->response ) || ! is_array( $transient->response ) ) {
			$transient->response = array();
		}
		if ( ! isset( $transient->no_update ) || ! is_array( $transient->no_update ) ) {
			$transient->no_update = array();
		}

		$release = self::release_data();
		$file = self::plugin_file();
		if ( empty( $release['version'] ) || empty( $release['zip_url'] ) ) {
			return $transient;
		}

		if ( version_compare( self::current_version(), $release['version'], '<' ) ) {
			unset( $transient->no_update[ $file ] );
			$transient->response[ $file ] = array(
				'id' => 'https://github.com/riyazamra1/RSS-Prism/',
				'slug' => self::PLUGIN_SLUG,
				'plugin' => $file,
				'new_version' => $release['version'],
				'url' => $release['homepage'],
				'package' => $release['zip_url'],
				'tested' => '6.8',
				'requires' => '6.4',
				'requires_php' => '7.4',
			);
		} else {
			unset( $transient->response[ $file ] );
			$transient->no_update[ $file ] = array(
				'id' => 'https://github.com/riyazamra1/RSS-Prism/',
				'slug' => self::PLUGIN_SLUG,
				'plugin' => $file,
				'new_version' => self::current_version(),
				'url' => $release['homepage'],
				'package' => '',
				'tested' => '6.8',
				'requires' => '6.4',
				'requires_php' => '7.4',
			);
		}
		return $transient;
	}

	public static function plugin_information( $result, $action, $args ) {
		if ( 'plugin_information' !== $action || empty( $args->slug ) || self::PLUGIN_SLUG !== $args->slug ) {
			return $result;
		}
		$release = self::release_data();
		if ( empty( $release['version'] ) || empty( $release['zip_url'] ) ) {
			return $result;
		}
		$info = new stdClass();
		$info->name = 'RSS Prism Builder';
		$info->slug = self::PLUGIN_SLUG;
		$info->version = $release['version'];
		$info->author = '<a href="https://github.com/riyazamra1/RSS-Prism">Razeen Secure Solution</a>';
		$info->homepage = $release['homepage'];
		$info->requires = '6.4';
		$info->tested = '6.8';
		$info->requires_php = '7.4';
		$info->download_link = $release['zip_url'];
		$info->sections = array(
			'description' => 'RSS Prism Builder is a visual layout builder for WordPress.',
			'changelog' => nl2br( esc_html( $release['release_notes'] ) ),
		);
		return $info;
	}

	public static function force_check() {
		if ( ! current_user_can( 'update_plugins' ) ) {
			wp_die( esc_html__( 'You are not allowed to check plugin updates.', 'rss-prism-builder' ), '', array( 'response' => 403 ) );
		}
		check_admin_referer( 'rss_prism_builder_check_updates' );
		delete_site_transient( self::CACHE_KEY );
		delete_site_transient( 'update_plugins' );
		wp_update_plugins();
		wp_safe_redirect( add_query_arg( 'rss_prism_builder_checked', '1', self_admin_url( 'plugins.php' ) ) );
		exit;
	}

	public static function action_links( $links ) {
		if ( ! current_user_can( 'update_plugins' ) ) {
			return $links;
		}
		$url = wp_nonce_url( admin_url( 'admin-post.php?action=rss_prism_builder_check_updates' ), 'rss_prism_builder_check_updates' );
		array_unshift( $links, '<a href="' . esc_url( $url ) . '">' . esc_html__( 'Check for updates', 'rss-prism-builder' ) . '</a>' );
		return $links;
	}

	public static function admin_notice() {
		if ( ! current_user_can( 'update_plugins' ) || empty( $_GET['rss_prism_builder_checked'] ) || '1' !== sanitize_text_field( wp_unslash( $_GET['rss_prism_builder_checked'] ) ) ) {
			return;
		}
		echo '<div class="notice notice-info is-dismissible"><p>' . esc_html__( 'RSS Prism Builder update information has been refreshed. Check Dashboard → Updates or the Plugins screen.', 'rss-prism-builder' ) . '</p></div>';
	}
}

RSS_Prism_Builder_Auto_Updates::init();
