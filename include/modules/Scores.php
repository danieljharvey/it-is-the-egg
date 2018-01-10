<?php

class Scores {
  
  protected $dbal;

  function __construct($dbal) {
    $this->dbal = $dbal;
  }

  public function insertScore(int $levelID, int $score, int $rotationsUsed) {
    
    $sql = "INSERT INTO scores (levelID, score, rotationsUsed, theDate) VALUES (?,?,?, NOW())";

    $savedRows = $this->dbal->executeQuery($sql, [$levelID, $score, $rotationsUsed]);
    
    if (!$savedRows) {
      return false;
    }

    $scoreID = $this->dbal->lastInsertId();
    return $scoreID;
  }

  public function getLevelScores(int $levelID) {

    $sql = "SELECT * FROM scores WHERE levelID = :levelID";
    
    $stmt = $this->dbal->prepare($sql);
    $stmt->bindValue('levelID', $levelID);
    $stmt->execute();
    $scores = [];

    while ($row = $stmt->fetch()) {
      array_push($scores, $row);
    }
    
    return $scores;

  }

}