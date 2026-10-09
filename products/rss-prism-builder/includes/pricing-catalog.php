<?php
/**
 * Current RSS Prism catalog. Only the Free plan is active.
 * Historical proposed prices are archived outside the active catalog.
 * @package RSSPrismBuilder
 */
defined( 'ABSPATH' ) || exit;
return array(
	'status' => 'free_only',
	'plans' => array(
		'free' => array(
			'name' => 'Free',
			'price_usd' => 0,
			'price_lkr' => 0,
			'billing' => 'free',
			'site_limit' => 0,
			'site_limit_label' => 'Free',
			'features' => array(
				'RSS Prism multipurpose theme',
				'Customizable colours and content width',
				'Homepage, header, footer, and archive layout settings',
				'Responsive navigation and WordPress core templates',
				'RSS Prism Builder foundation',
			),
		),
	),
);
