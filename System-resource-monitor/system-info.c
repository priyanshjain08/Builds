#include "system_info.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/sysinfo.h>
#include <sys/statvfs.h>
#include <sys/utsname.h>
#include <unistd.h>
#include <dirent.h>
#include <ctype.h>

bool get_system_info(SystemInfo *info) {
    if (!info) return false;
    
    memset(info, 0, sizeof(SystemInfo));
    
    // Get hostname
    if (gethostname(info->hostname, MAX_NAME_LEN) != 0) {
        strncpy(info->hostname, "Unknown", MAX_NAME_LEN);
    }
    
    // Get OS information
    FILE *fp = fopen("/etc/os-release", "r");
    if (fp) {
        char line[256];
        char *name = NULL, *version = NULL;
        while (fgets(line, sizeof(line), fp)) {
            if (strncmp(line, "PRETTY_NAME=", 12) == 0) {
                name = line + 12;
                // Remove quotes
                char *p = name;
                while (*p) {
                    if (*p == '"') {
                        memmove(p, p + 1, strlen(p));
                    } else {
                        p++;
                    }
                }
                // Remove trailing newline
                p = name + strlen(name) - 1;
                if (*p == '\n') *p = '\0';
                
                strncpy(info->os_name, name, MAX_NAME_LEN - 1);
            } else if (strncmp(line, "VERSION_ID=", 11) == 0) {
                version = line + 11;
                char *p = version;
                while (*p) {
                    if (*p == '"') {
                        memmove(p, p + 1, strlen(p));
                    } else {
                        p++;
                    }
                }
                p = version + strlen(version) - 1;
                if (*p == '\n') *p = '\0';
                
                strncpy(info->os_version, version, MAX_NAME_LEN - 1);
            }
        }
        fclose(fp);
    } else {
        strncpy(info->os_name, "Linux", MAX_NAME_LEN - 1);
        strncpy(info->os_version, "Unknown", MAX_NAME_LEN - 1);
    }
    
    // Get kernel version
    struct utsname uts;
    if (uname(&uts) == 0) {
        strncpy(info->kernel_version, uts.release, MAX_NAME_LEN - 1);
    } else {
        strncpy(info->kernel_version, "Unknown", MAX_NAME_LEN - 1);
    }
    
    // Get system information
    struct sysinfo si;
    if (sysinfo(&si) == 0) {
        info->uptime_seconds = si.uptime;
        info->total_memory_kb = si.totalram / 1024;
    }
    
    // Get CPU information
    info->cpu_cores = sysconf(_SC_NPROCESSORS_ONLN);
    if (info->cpu_cores < 1) info->cpu_cores = 1;
    
    // Get CPU model
    fp = fopen("/proc/cpuinfo", "r");
    if (fp) {
        char line[256];
        while (fgets(line, sizeof(line), fp)) {
            if (strncmp(line, "model name", 10) == 0) {
                char *colon = strchr(line, ':');
                if (colon) {
                    colon++;
                    // Skip leading spaces
                    while (*colon == ' ') colon++;
                    // Remove trailing newline
                    char *end = colon + strlen(colon) - 1;
                    if (*end == '\n') *end = '\0';
                    strncpy(info->cpu_model, colon, MAX_NAME_LEN - 1);
                }
                break;
            }
        }
        fclose(fp);
    }
    
    if (strlen(info->cpu_model) == 0) {
        strncpy(info->cpu_model, "Unknown CPU", MAX_NAME_LEN - 1);
    }
    
    return true;
}

bool get_cpu_usage(CpuUsage *cpu) {
    if (!cpu) return false;
    
    FILE *fp = fopen("/proc/stat", "r");
    if (!fp) return false;
    
    char line[256];
    if (fgets(line, sizeof(line), fp)) {
        CpuStats stats;
        memset(&stats, 0, sizeof(stats));
        
        sscanf(line, "cpu %lf %lf %lf %lf %lf %lf %lf %lf",
               &stats.user, &stats.nice, &stats.system, &stats.idle,
               &stats.iowait, &stats.irq, &stats.softirq, &stats.steal);
        
        fclose(fp);
        
        if (!cpu->has_previous) {
            cpu->previous = stats;
            cpu->has_previous = true;
            cpu->usage_percent = 0.0;
            cpu->current = stats;
            return true;
        }
        
        cpu->current = stats;
        
        double prev_idle = cpu->previous.idle + cpu->previous.iowait;
        double idle = stats.idle + stats.iowait;
        
        double prev_non_idle = cpu->previous.user + cpu->previous.nice + 
                              cpu->previous.system + cpu->previous.irq + 
                              cpu->previous.softirq + cpu->previous.steal;
        double non_idle = stats.user + stats.nice + stats.system + 
                         stats.irq + stats.softirq + stats.steal;
        
        double prev_total = prev_idle + prev_non_idle;
        double total = idle + non_idle;
        
        double total_diff = total - prev_total;
        double idle_diff = idle - prev_idle;
        
        if (total_diff > 0) {
            cpu->usage_percent = ((total_diff - idle_diff) / total_diff) * 100.0;
        } else {
            cpu->usage_percent = 0.0;
        }
        
        cpu->previous = stats;
    } else {
        fclose(fp);
        return false;
    }
    
    return true;
}

bool get_memory_info(MemoryInfo *mem) {
    if (!mem) return false;
    
    memset(mem, 0, sizeof(MemoryInfo));
    
    FILE *fp = fopen("/proc/meminfo", "r");
    if (!fp) return false;
    
    char line[256];
    unsigned long mem_total = 0, mem_free = 0, mem_available = 0;
    unsigned long buffers = 0, cached = 0;
    unsigned long swap_total = 0, swap_free = 0;
    
    while (fgets(line, sizeof(line), fp)) {
        if (strncmp(line, "MemTotal:", 9) == 0) {
            sscanf(line + 9, "%lu", &mem_total);
        } else if (strncmp(line, "MemFree:", 8) == 0) {
            sscanf(line + 8, "%lu", &mem_free);
        } else if (strncmp(line, "MemAvailable:", 13) == 0) {
            sscanf(line + 13, "%lu", &mem_available);
        } else if (strncmp(line, "Buffers:", 8) == 0) {
            sscanf(line + 8, "%lu", &buffers);
        } else if (strncmp(line, "Cached:", 7) == 0) {
            sscanf(line + 7, "%lu", &cached);
        } else if (strncmp(line, "SwapTotal:", 10) == 0) {
            sscanf(line + 10, "%lu", &swap_total);
        } else if (strncmp(line, "SwapFree:", 9) == 0) {
            sscanf(line + 9, "%lu", &swap_free);
        }
    }
    
    fclose(fp);
    
    mem->total_kb = mem_total;
    mem->free_kb = mem_free;
    mem->available_kb = mem_available;
    mem->buffers_kb = buffers;
    mem->cached_kb = cached;
    mem->swap_total_kb = swap_total;
    mem->swap_free_kb = swap_free;
    mem->swap_used_kb = swap_total - swap_free;
    
    if (mem_total > 0) {
        unsigned long used = mem_total - mem_available;
        mem->usage_percent = ((double)used / mem_total) * 100.0;
    }
    
    return true;
}

bool get_disk_stats(DiskStats *disk) {
    if (!disk) return false;
    
    memset(disk, 0, sizeof(DiskStats));
    
    FILE *fp = fopen("/proc/mounts", "r");
    if (!fp) return false;
    
    char device[MAX_PATH_LEN], mount_point[MAX_PATH_LEN], fs_type[MAX_NAME_LEN];
    char options[MAX_PATH_LEN];
    int dump, pass;
    
    while (fscanf(fp, "%255s %255s %127s %255s %d %d\n",
                  device, mount_point, fs_type, options, &dump, &pass) == 6) {
        
        // Skip virtual filesystems and special mounts
        if (strncmp(device, "/dev/", 5) != 0) continue;
        if (strcmp(fs_type, "tmpfs") == 0 || strcmp(fs_type, "devtmpfs") == 0 ||
            strcmp(fs_type, "squashfs") == 0 || strcmp(fs_type, "overlay") == 0) {
            continue;
        }
        
        struct statvfs st;
        if (statvfs(mount_point, &st) == 0 && disk->disk_count < MAX_DISKS) {
            DiskInfo *di = &disk->disks[disk->disk_count];
            strncpy(di->mount_point, mount_point, MAX_PATH_LEN - 1);
            strncpy(di->filesystem, fs_type, MAX_NAME_LEN - 1);
            
            di->total_bytes = st.f_blocks * st.f_frsize;
            di->available_bytes = st.f_bavail * st.f_frsize;
            di->used_bytes = di->total_bytes - (st.f_bfree * st.f_frsize);
            
            if (di->total_bytes > 0) {
                di->usage_percent = ((double)di->used_bytes / di->total_bytes) * 100.0;
            }
            
            disk->disk_count++;
        }
    }
    
    fclose(fp);
    return disk->disk_count > 0;
}

bool get_network_stats(NetworkStats *net) {
    if (!net) return false;
    
    memset(net, 0, sizeof(NetworkStats));
    
    FILE *fp = fopen("/proc/net/dev", "r");
    if (!fp) return false;
    
    char line[512];
    // Skip header lines
    fgets(line, sizeof(line), fp);
    fgets(line, sizeof(line), fp);
    
    while (fgets(line, sizeof(line), fp) && net->interface_count < MAX_INTERFACES) {
        char ifname[MAX_NAME_LEN];
        unsigned long long rx_bytes, rx_packets, rx_errs, rx_drop, rx_fifo, rx_frame;
        unsigned long long rx_compressed, rx_multicast;
        unsigned long long tx_bytes, tx_packets, tx_errs, tx_drop, tx_fifo, tx_colls;
        unsigned long long tx_carrier, tx_compressed;
        
        char *colon = strchr(line, ':');
        if (!colon) continue;
        
        *colon = '\0';
        // Remove leading spaces from interface name
        char *name = line;
        while (*name == ' ') name++;
        strncpy(ifname, name, MAX_NAME_LEN - 1);
        
        sscanf(colon + 1, "%llu %llu %llu %llu %llu %llu %llu %llu %llu %llu %llu %llu %llu %llu %llu %llu",
               &rx_bytes, &rx_packets, &rx_errs, &rx_drop, &rx_fifo, &rx_frame,
               &rx_compressed, &rx_multicast,
               &tx_bytes, &tx_packets, &tx_errs, &tx_drop, &tx_fifo, &tx_colls,
               &tx_carrier, &tx_compressed);
        
        NetworkInterface *ni = &net->interfaces[net->interface_count];
        strncpy(ni->interface_name, ifname, MAX_NAME_LEN - 1);
        ni->rx_bytes = rx_bytes;
        ni->tx_bytes = tx_bytes;
        ni->rx_packets = rx_packets;
        ni->tx_packets = tx_packets;
        
        // Check if interface is up
        char path[MAX_PATH_LEN];
        snprintf(path, MAX_PATH_LEN, "/sys/class/net/%s/operstate", ifname);
        FILE *state_fp = fopen(path, "r");
        if (state_fp) {
            char state[32];
            if (fgets(state, sizeof(state), state_fp)) {
                // Remove newline
                char *newline = strchr(state, '\n');
                if (newline) *newline = '\0';
                ni->is_up = (strcmp(state, "up") == 0);
            }
            fclose(state_fp);
        }
        
        net->interface_count++;
    }
    
    fclose(fp);
    return net->interface_count > 0;
}

void format_uptime(long seconds, char *buffer, size_t buffer_size) {
    long days = seconds / 86400;
    long hours = (seconds % 86400) / 3600;
    long minutes = (seconds % 3600) / 60;
    
    if (days > 0) {
        snprintf(buffer, buffer_size, "%ld days, %ld hours, %ld min", days, hours, minutes);
    } else if (hours > 0) {
        snprintf(buffer, buffer_size, "%ld hours, %ld min", hours, minutes);
    } else {
        snprintf(buffer, buffer_size, "%ld min", minutes);
    }
}

void format_bytes(unsigned long bytes, char *buffer, size_t buffer_size) {
    const char *units[] = {"B", "KB", "MB", "GB", "TB", "PB"};
    int unit_index = 0;
    double size = (double)bytes;
    
    while (size >= 1024.0 && unit_index < 5) {
        size /= 1024.0;
        unit_index++;
    }
    
    if (unit_index == 0) {
        snprintf(buffer, buffer_size, "%.0f %s", size, units[unit_index]);
    } else {
        snprintf(buffer, buffer_size, "%.1f %s", size, units[unit_index]);
    }
}
