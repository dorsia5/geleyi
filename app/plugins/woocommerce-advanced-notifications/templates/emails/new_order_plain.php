<?php
/**
 * New order email (plain)
 */
if ( ! defined( 'ABSPATH' ) ) exit;

printf( __( 'Hi %s,', 'wc_adv_notifications' ), $recipient_name );

echo "\n\n";

printf( __( 'You have received an order from %s %s:', 'wc_adv_notifications' ), $order->billing_first_name, $order->billing_last_name );

echo "\n\n";

echo "============================================================\n";

printf( __( 'Order: %s', 'wc_adv_notifications' ), $order->get_order_number() );

echo "\n";

printf( '%s', date_i18n( __('jS F Y', 'wc_adv_notifications'), strtotime( $order->order_date ) ) );

echo "\n";

echo "============================================================";

$displayed_total = 0;

foreach ( $order->get_items() as $item ) {

	$_product = $order->get_product_from_item( $item );

	$display = false;

	if ( $triggers['all'] || in_array( $_product->id, $triggers['product_ids'] ) || in_array( $_product->get_shipping_class_id(), $triggers['shipping_classes'] ) )
		$display = true;

	if ( ! $display ) {

		$cats = wp_get_post_terms( $_product->id, 'product_cat', array( "fields" => "ids" ) );

		if ( sizeof( array_intersect( $cats, $triggers['product_cats'] ) ) > 0 )
			$display = true;

	}

	if ( ! $display )
		continue;

	$displayed_total += $order->get_line_total( $item, true );

	$item_meta	= new WC_Order_Item_Meta( $item['item_meta'] );

	// Product name
	echo "\n" . apply_filters( 'woocommerce_order_product_title', $item['name'], $_product );

	// SKU
	echo $_product->get_sku() ? ' (#' . $_product->get_sku() . ')' : '';

	if ( $show_prices )
		echo " (" . $order->get_line_subtotal( $item ) . ")";

	echo " X " . $item['qty'];

	// Variation
	echo $item_meta->meta ? ( "\n --> " . str_replace( "\n", '', $item_meta->display( true, true ) ) ) : '';

	echo "\n";

}

echo "============================================================\n";

if ( $show_totals ) {

	if ( $triggers['all'] && ( $totals = $order->get_order_item_totals() ) ) {
		foreach ( $totals as $total ) {
			echo $total['label'] . ' ';
			echo preg_replace( "/&#?[a-z0-9]{2,8};/i", "", $total['value'] );
			echo "\n";
		}
	} else {
		// Only show the total for displayed items
		echo __( 'Total', 'wc_adv_notifications' ) . ': ';
		echo $displayed_total;
		echo "\n";
	}

}

echo "\n\n";

_e('Customer details', 'wc_adv_notifications');

echo "\n\n";

echo __('Email:', 'wc_adv_notifications') . " ";
echo $order->billing_email;

echo "\n";

echo __('Tel:', 'wc_adv_notifications') . " ";
echo $order->billing_phone;

echo "\n\n";

echo __('Billing address:', 'wc_adv_notifications') . "\n";
echo str_replace( '<br>', "\n", $order->get_formatted_billing_address() );

echo "\n\n";

echo __('Shipping address:', 'wc_adv_notifications') . "\n";
echo str_replace( '<br>', "\n", $order->get_formatted_shipping_address() );

echo "\n\n";

echo "Regards,\n" . $blogname;