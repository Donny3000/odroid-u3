<?php
if( isset($_SERVER['HTTP_X_FILENAME']) ) 
{
    $dir = 'uploads';

    // create new directory with 744 permissions if it does not exist yet
    // owner will be the user/group the PHP script is run under
    if ( !file_exists($dir) ) {
        mkdir($dir, 0744);
    }

    $file = $dir.'/'.$_SERVER['HTTP_X_FILENAME'];
    
	file_put_contents("$file", file_get_contents("php://input"));

    $cmd = './uploader.sh '.$file;
	exec($cmd, $out);

    if(count($out) == 0) {
        $res = array('success' => false, 'msg' => 'Failed to upload binary to ATMega328P!');
    } else {
    
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
    }

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
