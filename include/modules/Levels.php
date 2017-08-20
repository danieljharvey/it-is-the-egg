<?php

// get / put levels

class Levels {

	protected $dbal;

	function __construct($dbal) {
		$this->dbal = $dbal;
	}

	public function getLevel(int $levelID) {
		
		$sql = "SELECT data FROM levels WHERE levelID = :levelID";
		
		$stmt = $this->dbal->prepare($sql);
		$stmt->bindValue('levelID', $levelID);
		$stmt->execute();
		$json = false;

		while ($row = $stmt->fetch()) {
			$json = $row['data'];
		}
		
		try {
			$data = json_decode($json,true);
		} catch (Exception $e) {
			return false;
		}
		return $data;
	}	

	public function updateLevel(int $levelID, $data) {

		$sql = "UPDATE levels SET data = ? WHERE levelID = ?";

		$savedRows =  $this->dbal->executeUpdate($sql, [$data, $levelID]);

		if (!$savedRows) {
			return false;
		}
		return $levelID;
	}

	public function insertLevel($data) {

		$sql = "INSERT INTO levels (data) VALUES (?)";

		$savedRows = $this->dbal->executeQuery($sql, [$data]);

		if (!$savedRows) {
			return false;
		}

		$levelID = $this->dbal->lastInsertId();
		return $levelID;
	}

	public function getLevelsList() {

		$sql = "SELECT levelID FROM levels";
		$stmt = $this->dbal->query($sql);

		$levelsList = [];
		while ($row = $stmt->fetch()) {
			$levelID = $row['levelID'];
			array_push($levelsList,$levelID);
		}

		return $levelsList;
	}
}