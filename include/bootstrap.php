<?php

use Doctrine\Common\ClassLoader;

require_once(dirname(__FILE__)."/vendor/autoload.php");
require_once(dirname(__FILE__)."/modules/Egg.php");
require_once(dirname(__FILE__)."/modules/Stats.php");
require_once(dirname(__FILE__)."/modules/Scores.php");
require_once(dirname(__FILE__)."/modules/Levels.php");
require_once(dirname(__FILE__)."/modules/API.php");

function getEgg() {
	try {
		$conn = getDBAL();
	} catch (Exception $e) {
		return false;
	}

	$levels = new Levels($conn);
	$scores = new Scores($conn);
	$stats = new Stats();

	$api = new API($levels, $scores, $stats);

	$egg = new Egg($conn, $api);

	return $egg;
}

function getDBAL() {
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
	return $conn;
}

