#ifndef SYSTEM_INFO_H
#define SYSTEM_INFO_H

#include <stdbool.h>

#define MAX_PATH_LEN 256
#define MAX_NAME_LEN 128
#define MAX_DISKS 10
#define MAX_INTERFACES 10

typedef struct {
    char hostname[MAX_NAME_LEN];
    char os_name[MAX_NAME_LEN];
    char os_version[MAX_NAME_LEN];
    char kernel_version[MAX_NAME_LEN];
    long uptime_seconds;
    int cpu_cores;
    unsigned long total_memory_kb;
    char cpu_model[MAX_NAME_LEN];
} SystemInfo;

typedef struct {
    double user;
    double nice;
    double system;
    double idle;
    double iowait;
    double irq;
    double softirq;
    double steal;
} CpuStats;

typedef struct {
    double usage_percent;
    CpuStats current;
    CpuStats previous;
    bool has_previous;
} CpuUsage;

typedef struct {
    unsigned long total_kb;
    unsigned long free_kb;
    unsigned long available_kb;
    unsigned long buffers_kb;
    unsigned long cached_kb;
    unsigned long swap_total_kb;
    unsigned long swap_free_kb;
    unsigned long swap_used_kb;
    double usage_percent;
} MemoryInfo;

typedef struct {
    char mount_point[MAX_PATH_LEN];
    char filesystem[MAX_NAME_LEN];
    unsigned long total_bytes;
    unsigned long used_bytes;
    unsigned long available_bytes;
    double usage_percent;
} DiskInfo;

typedef struct {
    DiskInfo disks[MAX_DISKS];
    int disk_count;
} DiskStats;

typedef struct {
    char interface_name[MAX_NAME_LEN];
    unsigned long long rx_bytes;
    unsigned long long tx_bytes;
    unsigned long long rx_packets;
    unsigned long long tx_packets;
    bool is_up;
} NetworkInterface;

typedef struct {
    NetworkInterface interfaces[MAX_INTERFACES];
    int interface_count;
} NetworkStats;

// Function declarations
bool get_system_info(SystemInfo *info);
bool get_cpu_usage(CpuUsage *cpu);
bool get_memory_info(MemoryInfo *mem);
bool get_disk_stats(DiskStats *disk);
bool get_network_stats(NetworkStats *net);
void format_uptime(long seconds, char *buffer, size_t buffer_size);
void format_bytes(unsigned long bytes, char *buffer, size_t buffer_size);

#endif
