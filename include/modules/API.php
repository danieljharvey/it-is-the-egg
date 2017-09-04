<?php

// messy turning of request params into various data etc

class API {

	protected $levels;
	protected $scores;
	protected $stats;

	function __construct(Levels $levels, Scores $scores, Stats $stats) {
		$this->levels = $levels;
		$this->scores = $scores;
		$this->stats = $stats;
	}

	public function process($params) {
		if (!isset($params['action'])) {
			return $this->error("No action specified!");
		}
		$action = $params['action'];
		return $this->processAction($action, $params);
	}

	protected function processAction(String $action, Array $params) {
		if ($action=='getLevel') {
			return $this->processGetLevel($params);
		}
		if ($action=='saveLevel') {
			return $this->processSaveLevel($params);
		}
		if ($action=='getLevelsList') {
			return $this->processGetLevelsList($params);
		}
		if ($action=='saveScore') {
			return $this->processSaveScore($params);
		}
		if ($action=='getLevelScores') {
			return $this->processGetLevelScores($params);
		}
		return $this->error("Action {$action} not found!");
	}

	protected function processGetLevel(Array $params) {
		if (!isset($params['levelID'])) {
			return $this->error("Level ID required!");
		}
		$levelID = $params['levelID'];
		if (!is_numeric($levelID)) {
			return $this->error("Level ID must be a valid integer!");
		}
		$level = $this->levels->getLevel($levelID);
		if (!$level) {
			return $this->error("Level ID {$levelID} could not be retrieved!");
		}
		$scores = $this->scores->getLevelScores($levelID);
		
		$level['stats'] = $this->stats->calculateLevelStats($scores);

		return $this->success($level, "Level ID {$levelID} found!");
	}

	protected function processSaveLevel(Array $params) {
		if (!isset($params['data'])) {
			return $this->error("No level data supplied!");
		}
		if (isset($params['levelID']) && $params['levelID'] >0 ) {
			if (!is_numeric($params['levelID'])) {
				return $this->error("Level ID must be a valid integer!");
			}
			$levelID = $this->levels->updateLevel($params['levelID'], $params['data']);
			if ($levelID) {
				return $this->success($levelID,"Level ID {$levelID} successfully updated!");
			} else {
				return $this->error("Could not update level ID {$params['levelID']}");
			}
		} else {
			$levelID = $this->levels->insertLevel($params['data']);
			if ($levelID) {
				return $this->success($levelID, "New level ID {$levelID} successfully saved!");
			} else {
				return $this->error("Could not insert new level!");
			}
		}
	}

	protected function processSaveScore(Array $params) {
		if (!isset($params['levelID'])) {
			return $this->error("Level ID required");
		}
		if (!isset($params['score'])) {
			$params['score'] = 0;
		}
		if (!isset($params['rotationsUsed'])) {
			return $this->error("Number of rotations required!");
		}
		$scoreID = $this->scores->insertScore($params['levelID'],$params['score'],$params['rotationsUsed']);
		if ($scoreID) {
			$this->success($scoreID, "Score number {$scoreID} saved!");
		} else {
			return $this->error("Could not save score!");
		}
	}

	protected function processGetLevelsList(Array $params) {
		$levelsList = $this->levels->getLevelsList();
		return $this->success($levelsList, "Got levels list!");
	}

	protected function processGetLevelScores(Array $params) {
		if (!isset($params['levelID'])) {
			return $this->error("Level ID required");
		}
		$scores = $this->scores->getLevelScores($params['levelID']);
		return $this->success($scores,"Scores for level {$params['levelID']}");
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

	
}