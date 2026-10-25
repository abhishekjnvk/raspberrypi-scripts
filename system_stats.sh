#!/bin/sh
temperature=$(awk '{print $1/1000}' /sys/class/thermal/thermal_zone0/temp)
disk_used=$(df -h / | awk 'NR==2 {print $3}')
disk_total=$(df -h / | awk 'NR==2 {print $2}')
disk_usage=$(df -h / | awk 'NR==2 {print $5}')
cpu_usage=$(top -b -n 1 | grep "Cpu(s)" | awk '{print $2 + $4}')
free_ram=$(free -h | awk '/Mem:/ {print $4}')
load_average=$(uptime | awk -F 'load average:' '{print $2}' | awk '{print $1}')
swap_usage=$(free -h | awk '/Swap:/ {print $3}')
system_uptime=$(uptime -p)
system_arch=$(uname -m)
active_users=$(who | wc -l)
processes_count=$(ps aux | wc -l)
total_ram=$(free -h | awk '/Mem:/ {print $2}')
used_ram=$(free | awk '/Mem:/ {print $3}')


echo "Temperature: $temperature°C"
echo "Disk Usage: $disk_usage ($disk_used/$disk_total)"
echo "CPU Usage: $cpu_usage%"
echo "Free RAM: $free_ram/$total_ram"
echo "Load Average (1 min): $load_average"
echo "Swap Usage: $swap_usage"
echo "System Uptime: $system_uptime"
echo "Active Users: $active_users"
echo "Number of Processes: $processes_count"
echo "System Architecture: $system_arch"
