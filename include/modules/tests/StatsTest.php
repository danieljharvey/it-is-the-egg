<?php declare(strict_types = 1);

include_once dirname(__FILE__)."/../../vendor/autoload.php";
include_once dirname(__FILE__)."/../Stats.php";

use PHPUnit\Framework\TestCase;

use Spatie\Snapshots\MatchesSnapshots;

final class StatsTest extends TestCase {

  use MatchesSnapshots;

  public function testEmptyScores() {

    $stats = new Stats();

    $scores = [];
    
    $this->assertMatchesSnapshot($stats->calculateLevelStats($scores)); 
  }

  public function testScores() {

    $stats = new Stats();

    $scores = [
      ['rotationsUsed' => 10, 'score' => 100],
      ['rotationsUsed' => 20, 'score' => 120],
      ['rotationsUsed' => 150, 'score' => 5],
      ['rotationsUsed' => 5, 'score' => 10],
    ];
    
    $this->assertMatchesSnapshot($stats->calculateLevelStats($scores)); 
  }

} 
