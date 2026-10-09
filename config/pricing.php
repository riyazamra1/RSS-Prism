<?php
/**
 * RSS Prism pricing catalog. Proposed launch prices; not live checkout config.
 * @package RSSPrism
 */
defined( 'ABSPATH' ) || defined( 'RSS_PRISM_PRICING_STANDALONE' ) || exit;

return array(
	'status' => 'proposed',
	'currency' => 'USD',
	'local_currency' => 'LKR',
	'plans' => array(
		'free' => array(
			'name' => 'Free', 'price_usd' => 0, 'price_lkr' => 0, 'billing' => 'free',
			'site_limit' => 0, 'site_limit_label' => 'Core free features',
			'features' => array('Lightweight responsive theme', 'Essential typography and color controls', 'Basic layout and spacing controls', 'WordPress block editor compatibility', 'Community documentation'),
		),
		'personal' => array(
			'name' => 'Personal', 'price_usd' => 59, 'price_lkr' => 14900, 'billing' => 'annual',
			'site_limit' => 1, 'site_limit_label' => '1 production site',
			'features' => array('Premium theme features', 'RSS Prism Builder premium features', 'Premium template library access', 'Updates and support while subscription is active'),
		),
		'freelancer' => array(
			'name' => 'Freelancer', 'price_usd' => 99, 'price_lkr' => 24900, 'billing' => 'annual',
			'site_limit' => 5, 'site_limit_label' => '5 production sites',
			'features' => array('All Personal features', 'Activation for up to 5 production sites', 'Updates and support while subscription is active'),
		),
		'agency' => array(
			'name' => 'Agency', 'price_usd' => 199, 'price_lkr' => 49900, 'billing' => 'annual',
			'site_limit' => -1, 'site_limit_label' => 'Unlimited production sites',
			'features' => array('All Freelancer features', 'Unlimited production-site activations', 'Updates and support while subscription is active'),
		),
		'lifetime_personal' => array(
			'name' => 'Lifetime Personal', 'price_usd' => 199, 'price_lkr' => 49900, 'billing' => 'one_time',
			'site_limit' => 1, 'site_limit_label' => '1 production site',
			'features' => array('Lifetime usage rights under the published license', 'One-time payment', 'Update and support coverage defined separately in license terms'),
		),
	),
);
