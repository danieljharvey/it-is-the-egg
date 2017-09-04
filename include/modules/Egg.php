<?php

// It Is The Egg

class Egg {
	
	protected $dbal;
	protected $api;

	public function __construct($dbal, API $api) {
		$this->dbal = $dbal;
		$this->api = $api;
	}

	public function process($params) {
		return $this->api->process($params);
	}

	// get everything passed to program
	public function getAllParams() {
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

}
