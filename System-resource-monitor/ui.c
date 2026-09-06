#include "ui.h"
#include <stdio.h>
#include <string.h>
#include <unistd.h>

void clear_screen(void) {
    printf("\033[2J\033[H");
}

void init_ui(void) {
    // Hide cursor
    printf("\033[?25l");
}

void draw_header(const char *title) {
    printf(COLOR_BOLD COLOR_CYAN);
    printf("==================================================\n");
    printf("           %s\n", title);
    printf("==================================================\n");
    printf(COLOR_RESET);
}

void draw_menu(AppState *state) {
    printf(COLOR_BOLD);
    printf("\n[1] Dashboard  [2] Processes  [3] Disk  [4] Network  [5] Settings  [Q] Quit\n");
    
    if (state->auto_refresh) {
        printf("Auto-refresh: ON (%ds)  ", state->refresh_interval);
    } else {
        printf("Auto-refresh: OFF (paused)  ");
    }
    printf("[P] Pause/Resume  [R] Manual Refresh  [S] Sort Processes\n");
    printf(COLOR_RESET);
}

void draw_dashboard(SystemInfo *sys_info, CpuUsage *cpu, MemoryInfo *mem, 
                   DiskStats *disk, NetworkStats *net) {
    
    draw_header("SYSTEM RESOURCE MONITOR");
    
    // System Information
    printf(COLOR_BOLD COLOR_GREEN "SYSTEM" COLOR_RESET "\n");
    printf("Hostname:        %s\n", sys_info->hostname);
    printf("OS:              %s %s\n", sys_info->os_name, sys_info->os_version);
    printf("Kernel:          %s\n", sys_info->kernel_version);
    
    char uptime_str[128];
    format_uptime(sys_info->uptime_seconds, uptime_str, sizeof(uptime_str));
    printf("Uptime:          %s\n", uptime_str);
    printf("\n");
    
    // CPU Information
    printf(COLOR_BOLD COLOR_GREEN "CPU" COLOR_RESET "\n");
    printf("Model:           %s\n", sys_info->cpu_model);
    printf("Cores:           %d\n", sys_info->cpu_cores);
    
    // Display CPU usage bar
    printf("Usage:           %.1f%% ", cpu->usage_percent);
    int bar_width = 30;
    int filled = (int)(cpu->usage_percent / 100.0 * bar_width);
    
    printf(COLOR_CYAN "[");
    for (int i = 0; i < bar_width; i++) {
        if (i < filled) {
            printf("#");
        } else {
            printf("-");
        }
    }
    printf("]" COLOR_RESET "\n\n");
    
    // Memory Information
    printf(COLOR_BOLD COLOR_GREEN "MEMORY" COLOR_RESET "\n");
    char total_mem[32], used_mem[32], available_mem[32];
    unsigned long used_mem_kb = mem->total_kb - mem->available_kb;
    
    format_bytes(mem->total_kb * 1024, total_mem, sizeof(total_mem));
    format_bytes(used_mem_kb * 1024, used_mem, sizeof(used_mem));
    format_bytes(mem->available_kb * 1024, available_mem, sizeof(available_mem));
    
    printf("Used:            %s / %s\n", used_mem, total_mem);
    printf("Available:       %s\n", available_mem);
    printf("Usage:           %.1f%% ", mem->usage_percent);
    
    // Memory usage bar
    filled = (int)(mem->usage_percent / 100.0 * bar_width);
    printf(COLOR_YELLOW "[");
    for (int i = 0; i < bar_width; i++) {
        if (i < filled) {
            printf("#");
        } else {
            printf("-");
        }
    }
    printf("]" COLOR_RESET "\n");
    
    // Swap information
    if (mem->swap_total_kb > 0) {
        char swap_total[32], swap_used[32];
        format_bytes(mem->swap_total_kb * 1024, swap_total, sizeof(swap_total));
        format_bytes(mem->swap_used_kb * 1024, swap_used, sizeof(swap_used));
        printf("Swap:            %s / %s\n", swap_used, swap_total);
    }
    printf("\n");
    
    // Disk Information
    printf(COLOR_BOLD COLOR_GREEN "DISK" COLOR_RESET "\n");
    for (int i = 0; i < disk->disk_count && i < 3; i++) {
        char total[32], used[32];
        format_bytes(disk->disks[i].total_bytes, total, sizeof(total));
        format_bytes(disk->disks[i].used_bytes, used, sizeof(used));
        printf("%-15s %s / %s (%.1f%%)\n", 
               disk->disks[i].mount_point, used, total, disk->disks[i].usage_percent);
    }
    printf("\n");
    
    // Network Information
    printf(COLOR_BOLD COLOR_GREEN "NETWORK" COLOR_RESET "\n");
    unsigned long long total_rx = 0, total_tx = 0;
    for (int i = 0; i < net->interface_count; i++) {
        if (net->interfaces[i].is_up) {
            total_rx += net->interfaces[i].rx_bytes;
            total_tx += net->interfaces[i].tx_bytes;
        }
    }
    
    char rx_str[32], tx_str[32];
    format_bytes(total_rx, rx_str, sizeof(rx_str));
    format_bytes(total_tx, tx_str, sizeof(tx_str));
    printf("Received:        %s\n", rx_str);
    printf("Transmitted:     %s\n", tx_str);
    
    draw_menu(NULL);
}

void draw_processes(ProcessList *processes, AppState *state) {
    draw_header("PROCESS MONITOR");
    
    printf(COLOR_BOLD);
    printf("%-8s %-25s %-8s %-10s %-10s %-5s\n", 
           "PID", "PROCESS", "STATE", "CPU %", "MEM %", "MEM (KB)");
    printf(COLOR_RESET);
    printf("%-8s %-25s %-8s %-10s %-10s %-5s\n", 
           "--------", "-------------------------", "--------", 
           "----------", "----------", "--------");
    
    int limit = state ? state->process_limit : 20;
    if (limit > processes->process_count) limit = processes->process_count;
    
    for (int i = 0; i < limit; i++) {
        ProcessInfo *proc = &processes->processes[i];
        
        // Color code based on CPU usage
        if (proc->cpu_percent > 50.0) {
            printf(COLOR_RED);
        } else if (proc->cpu_percent > 20.0) {
            printf(COLOR_YELLOW);
        }
        
        printf("%-8d %-25.25s %-8c %-10.1f %-10.1f %-5lu\n",
               proc->pid, proc->name, proc->state, 
               proc->cpu_percent, proc->mem_percent, proc->rss);
        
        printf(COLOR_RESET);
    }
    
    printf(COLOR_BOLD "\nShowing %d of %d processes\n" COLOR_RESET, 
           limit, processes->process_count);
    
    draw_menu(state);
}

void draw_disk(DiskStats *disk) {
    draw_header("DISK INFORMATION");
    
    printf(COLOR_BOLD);
    printf("%-20s %-15s %-12s %-12s %-12s %-8s\n",
           "MOUNT POINT", "FILESYSTEM", "TOTAL", "USED", "AVAILABLE", "USAGE %");
    printf(COLOR_RESET);
    printf("%-20s %-15s %-12s %-12s %-12s %-8s\n",
           "--------------------", "---------------", "------------", 
           "------------", "------------", "--------");
    
    for (int i = 0; i < disk->disk_count; i++) {
        char total[32], used[32], available[32];
        format_bytes(disk->disks[i].total_bytes, total, sizeof(total));
        format_bytes(disk->disks[i].used_bytes, used, sizeof(used));
        format_bytes(disk->disks[i].available_bytes, available, sizeof(available));
        
        printf("%-20s %-15s %-12s %-12s %-12s ",
               disk->disks[i].mount_point, disk->disks[i].filesystem,
               total, used, available);
        
        // Color code the usage percentage
        if (disk->disks[i].usage_percent > 90.0) {
            printf(COLOR_RED "%.1f%%" COLOR_RESET, disk->disks[i].usage_percent);
        } else if (disk->disks[i].usage_percent > 75.0) {
            printf(COLOR_YELLOW "%.1f%%" COLOR_RESET, disk->disks[i].usage_percent);
        } else {
            printf(COLOR_GREEN "%.1f%%" COLOR_RESET, disk->disks[i].usage_percent);
        }
        printf("\n");
        
        // Display usage bar
        printf("                    ");
        int bar_width = 30;
        int filled = (int)(disk->disks[i].usage_percent / 100.0 * bar_width);
        printf("[");
        for (int j = 0; j < bar_width; j++) {
            if (j < filled) {
                printf("#");
            } else {
                printf("-");
            }
        }
        printf("]\n");
    }
    
    draw_menu(NULL);
}

void draw_network(NetworkStats *net) {
    draw_header("NETWORK INFORMATION");
    
    printf(COLOR_BOLD);
    printf("%-15s %-8s %-15s %-15s %-12s %-12s\n",
           "INTERFACE", "STATUS", "RX BYTES", "TX BYTES", "RX PACKETS", "TX PACKETS");
    printf(COLOR_RESET);
    printf("%-15s %-8s %-15s %-15s %-12s %-12s\n",
           "---------------", "--------", "---------------", "---------------",
           "------------", "------------");
    
    for (int i = 0; i < net->interface_count; i++) {
        NetworkInterface *ni = &net->interfaces[i];
        
        // Color code based on status
        if (ni->is_up) {
            printf(COLOR_GREEN);
            printf("%-15s %-8s ", ni->interface_name, "UP");
        } else {
            printf(COLOR_RED);
            printf("%-15s %-8s ", ni->interface_name, "DOWN");
        }
        printf(COLOR_RESET);
        
        char rx[32], tx[32];
        format_bytes(ni->rx_bytes, rx, sizeof(rx));
        format_bytes(ni->tx_bytes, tx, sizeof(tx));
        
        printf("%-15s %-15s %-12llu %-12llu\n",
               rx, tx, ni->rx_packets, ni->tx_packets);
    }
    
    draw_menu(NULL);
}

void draw_settings(AppState *state) {
    draw_header("SETTINGS");
    
    printf("Current Settings:\n\n");
    printf("Auto-refresh: %s\n", state->auto_refresh ? "Enabled" : "Disabled");
    printf("Refresh interval: %d seconds\n", state->refresh_interval);
    printf("Process sort mode: %s\n", 
           state->process_sort_mode == 0 ? "CPU usage" : "Memory usage");
    printf("Process list limit: %d\n", state->process_limit);
    
    printf("\nCommands:\n");
    printf("[P] Toggle auto-refresh\n");
    printf("[+] Increase refresh interval\n");
    printf("[-] Decrease refresh interval\n");
    printf("[S] Toggle process sort mode\n");
    printf("[L] Change process limit\n");
    printf("[Q] Return to dashboard\n");
}
