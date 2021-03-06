<?php if ( function_exists( 'wc_print_messages' ) ) wc_print_messages(); else {
	global $woocommerce;
	$woocommerce->show_messages();
} ?>

<?php if ( PV_Vendors::is_pending( get_current_user_id() ) ) { ?>

	<p><?php _e( 'Your account has not yet been approved to become a vendor.', 'wc_product_vendor' ); ?></p>

<?php } else { ?>

	<p><?php _e( 'Your account is not vendor capable.', 'wc_product_vendor' ); ?></p>

	<?php if ( Product_Vendor::$pv_options->get_option( 'show_vendor_registration' ) ) { ?>
		<form method="POST" action="">
			<div class="clear"></div>
			<p class="form-row">
				<input class="input-checkbox"
					   id="apply_for_vendor" <?php checked( isset( $_POST[ 'apply_for_vendor' ] ), true ) ?>
					   type="checkbox" name="apply_for_vendor" value="1"/>
				<label for="apply_for_vendor"
					   class="checkbox"><?php _e( 'Apply to become a vendor?', 'wc_product_vendor' ); ?></label>
			</p>

			<div class="clear"></div>

			<?php if ( $terms_page = Product_Vendor::$pv_options->get_option( 'terms_to_apply_page' ) ) { ?>
				<p class="form-row agree-to-terms-container" style="display:none">
					<input class="input-checkbox"
						   id="agree_to_terms" <?php checked( isset( $_POST[ 'agree_to_terms' ] ), true ) ?>
						   type="checkbox" name="agree_to_terms" value="1"/>
					<label for="agree_to_terms"
						   class="checkbox"><?php printf( __( 'I have read and accepted the <a href="%s">terms and conditions</a>', 'wc_product_vendor' ), get_permalink( $terms_page ) ); ?></label>
				</p>

				<script type="text/javascript">
					jQuery(function () {
						if (jQuery('#apply_for_vendor').is(':checked')) {
							jQuery('.agree-to-terms-container').show();
						}

						jQuery('#apply_for_vendor').on('click', function () {
							jQuery('.agree-to-terms-container').slideToggle();
						});
					})
				</script>

				<div class="clear"></div>
			<?php } ?>

			<p class="form-row">
				<input type="submit" class="button" name="apply_for_vendor_submit"
					   value="<?php _e( 'Submit', 'wc_product_vendor' ); ?>"/>
			</p>
		</form>
	<?php } ?>

<?php } ?>

<br class="clear">