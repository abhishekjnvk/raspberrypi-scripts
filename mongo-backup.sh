#!/bin/bash

# Maximum number of files to keep
MAX_FILES=2
DIRECTORY="files/"


delete_oldest_file() {
    # Check if file count exceeds 10
    file_count=$(ls -1 "$DIRECTORY" | wc -l)

    if [ "$file_count" -gt "$MAX_FILES" ]; then
        # Find the oldest file and delete it
        oldest_file=$(ls -1t "$DIRECTORY" | tail -1)
        rm -f "${DIRECTORY}/${oldest_file}"
        echo "Deleted oldest file: ${oldest_file}"
    fi
}




current_date=$(date +"%d-%m-%Y")
epoch_time=$(date +"%s")
# Create the filename with date and epoch time
filename="${current_date}-${epoch_time}.archive"




## create dump of mongo (ADD USERNAME)
mongodump --port <PORT> -u <USER_NAME> -p <PASSWORD>  --host <HOST> --archive=$DIRECTORY/$filename


## delete previous backup files
delete_oldest_file

## FINISHED
echo "Script execution finished :)"
