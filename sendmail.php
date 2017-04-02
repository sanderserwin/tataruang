<?php
    $mailWeb = 'erwinsanderslie@yahoo.com';
    $mailSubject = $_POST["subject"];
    $content = $_POST["message"];
    $header = "From".$_POST["email"];
    $success = mail($mailWeb,$mailSubject,$content, $header);
?>
