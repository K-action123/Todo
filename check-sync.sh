#!/bin/bash

SERVICES=("backend" "frontend")
echo "checking dependency synchronization..."

for DIR in "${SERVICES[@]}"; do
    if [ -d "$DIR" ]; then 
        echo "--- Checking $DIR ---"

        # Check if package-lock exists
        if [ ! -f "$DIR/package-lock.json" ]; then
            echo "Error: $DIR/package-lock.json is missing!"
            exit 1
        fi
        # Use 'diff' to see if package.json is newer than package-lock.json
        # in Linux -nt means "newer than"
        if [ "$DIR/package.json" -nt "$DIR/package-lock.json" ]; then
            echo " WARNING: $DIR/package.json has been modified."
            echo "RUN 'npm install' in ./$DIR to sync your lockfile"
            exit 1
        else
            echo "$DIR is in sync."
        fi
    fi
done

echo "All systems go! Ready to push"