<?php
require 'FirePHPCore/fb.php';

if( isset($_SERVER['HTTP_X_FILENAME']) ) 
{
    $dir = 'uploads';

    // create new directory with 744 permissions if it does not exist yet
    // owner will be the user/group the PHP script is run under
    if ( !file_exists($dir) ) {
        mkdir($dir, 0744);
    }

    $file = $dir.'/'.$_SERVER['HTTP_X_FILENAME'];
    
    FB::info($file, 'File:');
    
	file_put_contents("$file", file_get_contents("php://input"));

    $cmd = './avrdude -patmega328p -carduino -P/dev/ttySAC0 -b115200 -D -Uflash:w:'.$file.':i 2>&1';
    
    FB::info($cmd, 'Command');
    
	exec($cmd, $out);
    
    FB::info($out, 'Out:');
    
    $errorFound = false;
    for($i = 0; $i < count($out); $i++) {
        $str = $out[$i];
        $pos = strpos($str, 'ERROR:');
        if($pos !== false) {
            $errorFound = true;
            $res = array('success' => false, 'msg' => $str);
            break;
        }
    }

	if($errorFound !== true)
		$res = array('success' => true, 'msg' => 'Firmware upload successful!');

	header('Content-Type: application/json');
	echo json_encode( $res );
}
else
{
	header('HTTP/1.1 404 Not found');
	header('Content-Type: application/json');
	echo json_encode(array(
		'success' => false,
		'msg' => '404 - The resource you requested is not found.'
	));
}
