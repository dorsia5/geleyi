<?php include('style.inc.php'); ?>

<ul id="<?php echo $id; ?>" data-counter="false" class="social-sharing social-sharing-style-14">
    <li class="twitter" data-url="<?php echo $tw_url; ?>"<?php echo (!empty($tw_text) ? ' data-title="'.ucfirst($tw_text).'"' : ''); ?>></li>
    <li class="facebook" data-url="<?php echo $fb_like_url; ?>"<?php echo (!empty($fb_text) ? ' data-title="'.ucfirst($fb_text).'"' : ''); ?>></li>
    <li class="googlePlus" data-url="<?php echo $g_url; ?>"<?php echo (!empty($g_text) ? ' data-title="'.ucfirst($g_text).'"' : ''); ?>></li>
</ul>