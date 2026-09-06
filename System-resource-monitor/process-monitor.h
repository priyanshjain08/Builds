#ifndef PROCESS_MONITOR_H
#define PROCESS_MONITOR_H

#include <stdbool.h>

#define MAX_PROCESSES 500
#define MAX_PROC_NAME 128
#define MAX_PROC_PATH 256

typedef struct {
    int pid;
    char name[MAX_PROC_NAME];
    char state;
    unsigned long utime;
    unsigned long stime;
    unsigned long rss;
    double cpu_percent;
    double mem_percent;
} ProcessInfo;

typedef struct {
    ProcessInfo processes[MAX_PROCESSES];
    int process_count;
    unsigned long total_memory_kb;
    double total_cpu_time;
} ProcessList;

// Function declarations
bool get_process_list(ProcessList *list, unsigned long total_memory_kb);
void sort_processes_by_cpu(ProcessList *list);
void sort_processes_by_memory(ProcessList *list);
void calculate_process_cpu_percent(ProcessList *current, ProcessList *previous);

#endif
