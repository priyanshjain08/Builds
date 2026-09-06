# System Resource Monitor

A terminal-based system monitoring application written in C for Linux systems.

## Features

- **System Overview**: Display OS information, hostname, kernel version, uptime, and CPU details
- **CPU Monitoring**: Real-time CPU usage percentage with color-coded display
- **Memory Monitoring**: Total, used, available memory with swap information
- **Disk Monitoring**: Mounted filesystem information with usage statistics
- **Process Monitoring**: List running processes with CPU and memory usage
- **Network Information**: Network interface status and traffic statistics
- **Auto Refresh**: Automatic updates with configurable refresh intervals
- **Interactive UI**: Keyboard navigation between different views

## Requirements

- Linux operating system
- GCC compiler
- Standard C libraries
- Terminal with ANSI color support (optional, but recommended)

## Supported Operating System

- Linux (primary target)
- The application uses Linux-specific interfaces (/proc filesystem, sysinfo.h, etc.)

## How to Compile

```bash
# Navigate to the project directory
cd system-resource-monitor

# Compile the application
make

# Or compile manually
gcc -Wall -Wextra -O2 -o sysmon main.c system_info.c process_monitor.c ui.c -lm
