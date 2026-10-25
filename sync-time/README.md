# Sync Time

## Why Do We Need This?
Raspberry Pis lack a built-in hardware Real-Time Clock (RTC) with a backup battery. When powered off or rebooted, the Pi has no internal clock running and resets its time to the manufacturing date / build timestamp.

Because the system clock resets to an old date, all modern SSL/TLS certificates become invalid (falling outside their valid date range). Consequently:
- HTTPS requests, package manager commands (`apt update`), and captive portals fail immediately.
- NTP cannot automatically correct the time on its own, because network access and secure handshakes are blocked until the system time is brought into a valid certificate validity window.

These scripts solve this chicken-and-egg problem by periodically taking a snapshot of the current time and restoring that timestamp immediately upon boot, placing the clock back into a valid certificate range so network access and NTP synchronization can proceed normally.

---

## Overview

- `snapshot.sh`: Saves the current system time in epoch format to `last-time-snapshot`. Run periodically (e.g., via cron) or during shutdown.
- `sync.sh`: Restores the system clock from `last-time-snapshot` on boot so network calls and SSL validations succeed, then restarts NTP (`systemd-timesyncd`) once network interfaces initialize.

---

## Usage

### Option 1. Using Periodic Snapshot via Crontab

Open your user crontab:
```bash
crontab -e
```

Add the following entry to save a snapshot every 30 minutes:
```cron
*/30 * * * * /path/to/sync-time/snapshot.sh >/dev/null 2>&1
```

*(Optional) Save snapshot before reboot/shutdown:*
```cron
@reboot /path/to/sync-time/snapshot.sh >/dev/null 2>&1
```

### Option 2. Using Systemd Service to Restore Time on Boot

Run with `sudo` permissions (required for updating system date with `date -s`):
```bash
sudo ./sync.sh
```

**Systemd Service (Run on startup):**
Create `/etc/systemd/system/sync-time.service`:

```ini
[Unit]
Description=Restore time from snapshot and trigger NTP
After=local-fs.target

[Service]
Type=oneshot
ExecStart=/path/to/sync-time/sync.sh
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
```

Enable the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now sync-time.service
```

---

## Limitations

- **First-Time Setup**: You must set the system time manually for the first time before taking the initial snapshot; otherwise, no valid reference timestamp exists.
- **Extended Downtime / Long Inactivity**: If the Raspberry Pi remains powered off for an extended period (months or years), the restored time from the last saved snapshot will also become stale and fall outside current SSL/TLS certificate validity windows. In that scenario, the system date must be updated manually again (e.g., `sudo timedatectl set-time "YYYY-MM-DD"`) so network and NTP services can resume.