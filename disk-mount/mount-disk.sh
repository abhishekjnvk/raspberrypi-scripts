#!/bin/bash

# Predefined Array format: "UUID|MOUNT_LOCATION|NAME"
DEVICES=(
    # "12345678-abcd-1234-abcd-123456789abc|/mnt/disk1|PrimaryDisk"
)

echo "Starting disk mounting process..."

# Check if the DEVICES array is empty
if [ ${#DEVICES[@]} -eq 0 ]; then
    echo "DEVICES array is empty. Scanning for available unmounted storage devices..."

    root_uuid=$(findmnt / -o UUID -n)

    while read -r name fstype label uuid mountpoint; do
        [ -z "$fstype" ] && continue
        [ -n "$mountpoint" ] && continue
        [ "$uuid" = "$root_uuid" ] && continue
        [ -z "$uuid" ] && continue

        if [ -n "$label" ]; then
            mount_point="/mnt/$label"
            display_name="Label:$label"
        else
            mount_point="/mnt/$uuid"
            display_name="UUID:$uuid"
        fi

        if [ ! -d "$mount_point" ]; then
            mkdir -p "$mount_point"
            echo "[$display_name] Created mount directory: $mount_point"
        fi

        echo "[$display_name] Mounting UUID=$uuid to $mount_point..."

        # Handle mounting options based on filesystem type
        if [[ "$fstype" == "ntfs" || "$fstype" == "vfat" || "$fstype" == "exfat" ]]; then
            # Windows filesystems need user mapping for write access
            mount -o uid=1000,gid=1000,umask=022 -U "$uuid" "$mount_point"
        else
            # Linux filesystems (ext4, xfs, etc.)
            mount -U "$uuid" "$mount_point"
        fi   # <--- Corrected from } to fi

        if [ $? -eq 0 ]; then
            echo "[$display_name] Successfully mounted."
            # Grant full read/write permissions to all users for the mounted drive
            chmod 777 "$mount_point"
        else
            echo "[$display_name] ERROR: Failed to mount."
        fi
    done < <(lsblk -o NAME,FSTYPE,LABEL,UUID,MOUNTPOINT -p -n)

else
    for entry in "${DEVICES[@]}"; do
        IFS='|' read -r uuid mount_point name <<< "$entry"

        [ -z "$uuid" ] || [ -z "$mount_point" ] && continue

        if [ ! -d "$mount_point" ]; then
            mkdir -p "$mount_point"
            echo "[$name] Created mount directory: $mount_point"
        fi

        if mountpoint -q "$mount_point"; then
            echo "[$name] Already mounted at $mount_point"
        else
            echo "[$name] Mounting UUID=$uuid to $mount_point..."
            mount -U "$uuid" "$mount_point"

            if [ $? -eq 0 ]; then
                echo "[$name] Successfully mounted."
                chmod 777 "$mount_point"
            else
                echo "[$name] ERROR: Failed to mount."
            fi
        fi
    done
fi

echo "Disk mounting process completed."