<?php

include_once '../../include/bootstrap.php';

$egg = getEgg();

$params = $egg->getAllParams();

$response = $egg->process($params);

echo $response;


