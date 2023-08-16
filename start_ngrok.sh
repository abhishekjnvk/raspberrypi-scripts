#!/bin/sh

# Set local port from command line arg or default to 8080
LOCAL_PORT=${1-8080}
echo "Start ngrok in background on port [ $LOCAL_PORT ]"
nohup ngrok http --domain=live-kiwi-innocent.ngrok-free.app ${LOCAL_PORT} & >/dev/null &

urlencode() {
    local string="$1"
    local length="$(echo "$string" | wc -c | awk '{ print $1 - 1 }')"
    local encoded=""

    i=1
    while [ "$i" -le "$length" ]; do
        char="$(echo "$string" | cut -c "$i")"

        case $char in
        [a-zA-Z0-9.~_-])
            encoded="$encoded$char"
            ;;
        *)
            encoded="$encoded%$(printf '%02X' "'$char")"
            ;;
        esac

        i=$((i + 1))
    done

    echo "$encoded"
}

NGROK_PUBLIC_URL=""
RETRY_COUNT=0
MAX_RETRIES=5
SERVER_URL="https://abhishekjnvk.in/raspberry/"

while [ "$RETRY_COUNT" -lt "$MAX_RETRIES" ]; do
    NGROK_PUBLIC_URL="$(curl --silent --max-time 3 --connect-timeout 5 \
        --show-error http://127.0.0.1:4040/api/tunnels |
        sed -nE 's/.*public_url":"https:..([^"]*).*/\1/p')"

    if [ -n "$NGROK_PUBLIC_URL" ]; then
        echo "NGROK_PUBLIC_URL => [ $NGROK_PUBLIC_URL ]"
        break
    fi
    
    RETRY_COUNT=$((RETRY_COUNT + 1))
    sleep 1
done

if [ -z "$NGROK_PUBLIC_URL" ]; then
    error="Failed to retrieve NGROK_PUBLIC_URL after $MAX_RETRIES retries"
    echo "$error"
    encoded_content=$(urlencode "$error")
    curl "$SERVER_URL?data=$encoded_content"
else
    curl "$SERVER_URL?data=$NGROK_PUBLIC_URL"
fi
