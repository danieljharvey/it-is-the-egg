#!/bin/bash

set -e

echo "Running fixes in PHP Code Sniffer..."

./include/vendor/bin/phpcbf -d memory_limit=2048M --standard=phpcs.xml --extensions=php,htm,html --tab-width=2 -sp --ignore=./include/vendor ./include/

