<?php
/**
 * WooCommerce Pre-Orders
 *
 * @package     WC-Pre-Orders/Templates/Email
 * @author      WooThemes
 * @copyright   Copyright (c) 2013, WooThemes
 * @license     http://www.gnu.org/licenses/gpl-3.0.html GNU General Public License v3.0
 */

/**
 * Customer pre-order cancelled notification email
 *
 * @since 1.0
 */

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly ?>

<?php do_action( 'woocommerce_email_header', $email_heading ); ?>

<p><?php _e( "Your pre-order has been cancelled. Your order details are shown below for your reference.", WC_Pre_Orders::TEXT_DOMAIN ); ?></p>

<?php if ( $message ) : ?>
<blockquote><?php echo wpautop( wptexturize( $message ) ); ?></blockquote>
<?php endif; ?>

<?php do_action( 'woocommerce_email_before_order_table', $order, false ); ?>

<h2><?php echo __( 'Order:', WC_Pre_Orders::TEXT_DOMAIN ) . ' ' . $order->get_order_number(); ?></h2>

<table cellspacing="0" cellpadding="6" style="width: 100%; border: 1px solid #eee;" border="1" bordercolor="#eee">
	<thead>
		<tr>
			<th scope="col" style="text-align:left; border: 1px solid #eee;"><?php _e( 'Product', WC_Pre_Orders::TEXT_DOMAIN ); ?></th>
			<th scope="col" style="text-align:left; border: 1px solid #eee;"><?php _e( 'Quantity', WC_Pre_Orders::TEXT_DOMAIN ); ?></th>
			<th scope="col" style="text-align:left; border: 1px solid #eee;"><?php _e( 'Price', WC_Pre_Orders::TEXT_DOMAIN ); ?></th>
		</tr>
	</thead>
	<tbody>
		<?php echo $order->email_order_items_table( false, true ); ?>
	</tbody>
	<tfoot>
		<?php
			if ( $totals = $order->get_order_item_totals() ) {
				$i = 0;
				foreach ( $totals as $total ) {
					$i++;
					?><tr>
						<th scope="row" colspan="2" style="text-align:left; border: 1px solid #eee; <?php if ( $i == 1 ) echo 'border-top-width: 4px;'; ?>"><?php echo $total['label']; ?></th>
						<td style="text-align:left; border: 1px solid #eee; <?php if ( $i == 1 ) echo 'border-top-width: 4px;'; ?>"><?php echo $total['value']; ?></td>
					</tr><?php
				}
			}
		?>
	</tfoot>
</table>

<?php do_action( 'woocommerce_email_after_order_table', $order, false ); ?>

<?php do_action( 'woocommerce_email_order_meta', $order, false ); ?>

<h2><?php _e( 'Customer details', WC_Pre_Orders::TEXT_DOMAIN ); ?></h2>

<?php if ( $order->billing_email ) : ?>
	<p><strong><?php _e( 'Email:', WC_Pre_Orders::TEXT_DOMAIN ); ?></strong> <?php echo $order->billing_email; ?></p>
<?php endif; ?>
<?php if ( $order->billing_phone ) : ?>
	<p><strong><?php _e( 'Tel:', WC_Pre_Orders::TEXT_DOMAIN ); ?></strong> <?php echo $order->billing_phone; ?></p>
<?php endif; ?>

<?php woocommerce_get_template( 'emails/email-addresses.php', array( 'order' => $order ) ); ?>

<?php do_action( 'woocommerce_email_footer' ); ?>
