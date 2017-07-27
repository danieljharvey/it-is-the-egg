<?php

include_once('../../include/bootstrap.php');

$params = getAllParams();

$response = $egg->process($params);

echo $response;

function getAllParams() {
	global $argv;
	$cliParams=[];
	if (is_array($argv)) {
		foreach ($argv as $arg) {
			$ar=explode('=',$arg);
			if (isset($ar[1])) {
				$cliParams[$ar[0]] = $ar[1];
			}
		}
	}
	return array_merge($_GET, $_POST, $cliParams);
}
