<?php

// IT IS THE EGG
// levels database

class Egg {
	
	protected $dbal;

	public function __construct($dbal) {
		$this->dbal = $dbal;
	}

	public function process($params) {
		if (!isset($params['action'])) {
			return $this->error("No action specified!");
		}
		$action = $params['action'];
		return $this->processAction($action, $params);
	}

	protected function processAction($action, $params) {
		if ($action=='getLevel') {
			return $this->processGetLevel($params);
		}
		if ($action=='saveLevel') {
			return $this->processSaveLevel($params);
		}
		if ($action=='getLevelsList') {
			return $this->processGetLevelsList($params);
		}
		return $this->error("Action {$action} not found!");
	}

	protected function processGetLevel($params) {
		if (!isset($params['levelID'])) return $this->error("Level ID required!");
		if (!is_numeric($params['levelID'])) return $this->error("Level ID must be a valid integer!");
		$data = $this->getLevel($params['levelID']);
		if (!$data) return $this->error("Level ID {$params['levelID']} could not be retrieved!");
		return $this->success($data, "Level ID {$params['levelID']} found!");
	}

	protected function processSaveLevel($params) {
		if (!isset($params['data'])) return $this->error("No level data supplied!");
		if (isset($params['levelID'])) {
			if (!is_numeric($params['levelID'])) return $this->error("Level ID must be a valid integer!");
			return $this->updateLevel($params['levelID'], $params['data']);
		} else {
			return $this->insertLevel($params['data']);
		}
	}

	protected function processGetLevelsList($params) {
		$levelsList = $this->getLevelsList();
		return $this->success($levelsList, "Got levels list!");
	}

	protected function error($msg) {
		return json_encode([
			'rc'=>2,
			'msg'=>$msg
		]);
	}

	protected function success($data, $msg) {
		return json_encode([
			'rc'=>0,
			'msg'=>$msg,
			'data'=>$data
		]);
	}

	protected function getLevelsList() {
		$sql = "SELECT levelID FROM levels";
		$stmt = $this->dbal->query($sql);

		$levelsList = [];
		while ($row = $stmt->fetch()) {
			$levelID = $row['levelID'];
			array_push($levelsList,$levelID);
		}
		return $levelsList;
	}

	public function getLevel(int $levelID) {
		$sql = "SELECT data FROM levels WHERE levelID={$levelID}";
		$stmt = $this->dbal->query($sql); // Simple, but has several drawbacks
	
		$data = false;
		while ($row = $stmt->fetch()) {
			$data = $row['data'];
		}
		
		return json_decode($data);
	}

	protected function updateLevel(int $levelID, $data) {
		$success = $this->dbal->update('levels', ['data'=>$data], ['levelID'=>$levelID]);
		if (!$success) return $this->error("Could not update level ID {$levelID}");
		return $this->success($levelID,"Level ID {$levelID} successfully updated!");		
	}

	protected function insertLevel($data) {
		$success = $this->dbal->insert('levels', ['data'=>$data]);
		if (!$success) return $this->error("Could not insert new level!");
		$levelID = $this->dbal->lastInsertId();
		return $this->success($levelID, "New level ID {$levelID} successfully saved!");
	}

}
