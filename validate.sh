#!/bin/bash

set -e

echo "Linting for PHP syntax errors..."

./include/vendor/bin/parallel-lint -e php,htm,html --exclude ./include/vendor ./include || exit 1

echo "Running PHP Code Sniffer..."

./include/vendor/bin/phpcs -d memory_limit=2048M --standard=phpcs.xml --extensions=php,htm,html --tab-width=2 -sp --ignore=./include/vendor ./include/ || exit 1
