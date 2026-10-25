#!/bin/bash

# Google Drive File Downloader
#
# Link format:
#   https://drive.google.com/file/d/<fileId>/view?usp=sharing
#
# Example:
#   For link: https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/view?usp=sharing
#   Run:
#     ./download-drive-file.sh 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs my_file.zip
#
if [ "$#" -lt 2 ] 
then 
    echo "Usage: ./download-drive-file.sh [fileID] [fileName]"
    echo "Example: ./download-drive-file.sh 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs output.zip"
    exit 1
fi

fileid=$1
filename=$2
curl -c ./cookie -s -L "https://drive.google.com/uc?export=download&id=${fileid}" > /dev/null
curl -Lb ./cookie "https://drive.google.com/uc?export=download&confirm=$(awk "/download/ {print $NF}" ./cookie)&id=${fileid}" -C - --output ${filename}