<?php
/**
 * RSS Prism opt-in native WordPress theme updates.
 * Stable releases use tags rss-prism-theme-vX.Y.Z and attach rss-prism-theme.zip.
 * @package RSSPrism
 */
defined( 'ABSPATH' ) || exit;

if ( ! class_exists( 'RSS_Prism_Auto_Updates' ) ) {
	final class RSS_Prism_Auto_Updates {
		const API_URL = 'https://api.github.com/repos/riyazamra1/RSS-Prism/releases?per_page=20';
		const CACHE_KEY = 'rss_prism_latest_theme_release';
		const CACHE_TTL = 6 * HOUR_IN_SECONDS;
		const TAG_PREFIX = 'rss-prism-theme-v';
		const PACKAGE_NAME = 'rss-prism-theme.zip';

		public static function boot() {
			add_filter( 'pre_set_site_transient_update_themes', array( __CLASS__, 'inject_update' ) );
			add_filter( 'site_transient_update_themes', array( __CLASS__, 'inject_update' ) );
		}

		public static function inject_update( $transient ) {
			if ( ! is_object( $transient ) || empty( $transient->checked ) || ! is_array( $transient->checked ) ) {
				return $transient;
			}
			$stylesheet = get_stylesheet();
			if ( empty( $transient->checked[ $stylesheet ] ) ) {
				return $transient;
			}
			$release = self::latest_release();
			if ( is_wp_error( $release ) || empty( $release['version'] ) || empty( $release['package'] ) ) {
				return $transient;
			}
			$installed = (string) $transient->checked[ $stylesheet ];
			if ( version_compare( $release['version'], $installed, '>' ) ) {
				$transient->response[ $stylesheet ] = array(
					'theme' => $stylesheet,
					'new_version' => $release['version'],
					'url' => $release['html_url'],
					'package' => $release['package'],
					'requires' => $release['requires'],
					'requires_php' => $release['requires_php'],
				);
				unset( $transient->no_update[ $stylesheet ] );
			} else {
				if ( isset( $transient->response[ $stylesheet ] ) && is_array( $transient->response[ $stylesheet ] ) && ! empty( $transient->response[ $stylesheet ]['rss_prism_managed'] ) ) {
					unset( $transient->response[ $stylesheet ] );
				}
				$transient->no_update[ $stylesheet ] = array(
					'theme' => $stylesheet,
					'new_version' => $installed,
					'url' => 'https://github.com/riyazamra1/RSS-Prism/releases',
					'package' => '',
				);
			}
			return $transient;
		}

		private static function latest_release() {
			$cached = get_transient( self::CACHE_KEY );
			if ( is_array( $cached ) && isset( $cached['checked_at'] ) && ( time() - (int) $cached['checked_at'] ) < self::CACHE_TTL ) {
				return ! empty( $cached['release'] ) ? $cached['release'] : new WP_Error( 'rss_prism_release_missing', 'No eligible RSS Prism theme release found.' );
			}
			$response = wp_remote_get( self::API_URL, array(
				'timeout' => 5,
				'redirection' => 3,
				'headers' => array(
					'Accept' => 'application/vnd.github+json',
					'User-Agent' => 'RSS-Prism-WordPress-Updater',
					'X-GitHub-Api-Version' => '2022-11-28',
				),
			) );
			if ( is_wp_error( $response ) || 200 !== (int) wp_remote_retrieve_response_code( $response ) ) {
				return new WP_Error( 'rss_prism_release_unavailable', 'RSS Prism release information is temporarily unavailable.' );
			}
			$releases = json_decode( wp_remote_retrieve_body( $response ), true );
			if ( ! is_array( $releases ) ) {
				return new WP_Error( 'rss_prism_release_invalid', 'RSS Prism release information could not be read.' );
			}
			foreach ( $releases as $item ) {
				if ( empty( $item['tag_name'] ) || 0 !== strpos( $item['tag_name'], self::TAG_PREFIX ) || ! empty( $item['draft'] ) || ! empty( $item['prerelease'] ) ) {
					continue;
				}
				$version = substr( $item['tag_name'], strlen( self::TAG_PREFIX ) );
				if ( ! preg_match( '/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/', $version ) ) {
					continue;
				}
				$package = '';
				if ( ! empty( $item['assets'] ) && is_array( $item['assets'] ) ) {
					foreach ( $item['assets'] as $asset ) {
						if ( isset( $asset['name'], $asset['browser_download_url'] ) && self::PACKAGE_NAME === $asset['name'] && 0 === strpos( $asset['browser_download_url'], 'https://github.com/riyazamra1/RSS-Prism/releases/download/' ) ) {
							$package = esc_url_raw( $asset['browser_download_url'] );
							break;
						}
					}
				}
				if ( '' === $package ) {
					continue;
				}
				$release = array(
					'version' => $version,
					'package' => $package,
					'html_url' => isset( $item['html_url'] ) ? esc_url_raw( $item['html_url'] ) : 'https://github.com/riyazamra1/RSS-Prism/releases',
					'requires' => '6.4',
					'requires_php' => '7.4',
				);
				set_transient( self::CACHE_KEY, array( 'checked_at' => time(), 'release' => $release ), self::CACHE_TTL );
				return $release;
			}
			set_transient( self::CACHE_KEY, array( 'checked_at' => time(), 'release' => null ), 15 * MINUTE_IN_SECONDS );
			return new WP_Error( 'rss_prism_release_missing', 'No published RSS Prism theme release with an installable ZIP was found.' );
		}
	}
	RSS_Prism_Auto_Updates::boot();
}
