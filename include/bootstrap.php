<?php

use Doctrine\Common\ClassLoader;

require_once(dirname(__FILE__)."/vendor/autoload.php");
require_once(dirname(__FILE__)."/Egg.php");
require_once(dirname(__FILE__)."/Level.php");

$classLoader = new ClassLoader('Doctrine', '/path/to/doctrine');
$classLoader->register();

$config = new \Doctrine\DBAL\Configuration();

$configFilename = dirname(__FILE__)."/settings/connection.json";
$configJSON = file_get_contents($configFilename);
if ($configJSON) {
	$configArray = json_decode($configJSON,true);
	$connectionParams = array(
		'dbname' => $configArray['dbname'],
		'user' => $configArray['user'],
		'password' => $configArray['password'],
		'host' => $configArray['host'],
		'driver' => 'pdo_mysql',
	);
} else {
	throw new Exception("Could not read /settings/connection.json");
}

$conn = \Doctrine\DBAL\DriverManager::getConnection($connectionParams, $config);

$egg = new Egg($conn);

$data = $egg->getLevel(1);

var_dump($data);
