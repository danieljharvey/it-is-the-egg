<?php

// IT IS THE EGG
// levels database

class Egg {
	
	protected $dbal;

	public function __construct($dbal) {
		$this->dbal = $dbal;
	}

	public function getLevelList() {
		
	}

	public function getLevel(int $levelID) {
		$sql = "SELECT * FROM levels WHERE levelID={$levelID}";
		$stmt = $this->dbal->query($sql); // Simple, but has several drawbacks
	
		$data = false;
		while ($row = $stmt->fetch()) {
			$data = $row['data'];
		}
		return $data;
	}

	public function saveLevel(Level $level) {

	}
}
