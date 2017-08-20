<?php

// stats processing for levels

class Stats {

	// pure func turns data into various stats
	public function calculateLevelStats(Array $scores) {
		return [
			'totalCompleted'=>count($scores),
			'rotationsUsed'=>$this->basicStats('rotationsUsed',$scores),
			'score'=>$this->basicStats('score',$scores)
		];
	}

	protected function basicStats(String $key, Array $scores) {
		$data = $this->subArray($key,$scores);
		return [
			'min'=>min($data),
			'max'=>max($data),
			'average'=>round(
				array_sum($data) / count($data),
				2
			)
		];
	}

	protected function subArray(String $key, Array $array) {
		return array_map(function($item) use ($key) {
		    return $item[$key];
		}, $array);
	}

}
