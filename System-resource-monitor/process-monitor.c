#include "process_monitor.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <dirent.h>
#include <ctype.h>
#include <unistd.h>

bool get_process_list(ProcessList *list, unsigned long total_memory_kb) {
    if (!list) return false;
    
    memset(list, 0, sizeof(ProcessList));
    list->total_memory_kb = total_memory_kb;
    
    DIR *dir = opendir("/proc");
    if (!dir) return false;
    
    struct dirent *entry;
    long page_size = sysconf(_SC_PAGESIZE);
    
    while ((entry = readdir(dir)) != NULL && list->process_count < MAX_PROCESSES) {
        // Check if the entry is a PID (numeric directory)
        if (!isdigit(entry->d_name[0])) continue;
        
        int pid = atoi(entry->d_name);
        if (pid <= 0) continue;
        
        ProcessInfo *proc = &list->processes[list->process_count];
        memset(proc, 0, sizeof(ProcessInfo));
        proc->pid = pid;
        
        // Read process stat file
        char stat_path[MAX_PROC_PATH];
        snprintf(stat_path, MAX_PROC_PATH, "/proc/%d/stat", pid);
        FILE *fp = fopen(stat_path, "r");
        if (!fp) continue;
        
        char comm[MAX_PROC_NAME];
        char state;
        unsigned long utime, stime;
        long rss;
        
        // Parse the stat file
        // Format: pid (comm) state ppid pgrp session tty_nr tpgid flags minflt cminflt majflt cmajflt utime stime cutime cstime priority nice num_threads itrealvalue starttime vsize rss ...
        if (fscanf(fp, "%d %127s %c %*d %*d %*d %*d %*d %*u %*u %*u %*u %*u %lu %lu %*d %*d %*d %*d %*d %*d %*u %*u %ld",
                   &proc->pid, comm, &state, &utime, &stime, &rss) == 6) {
            
            // Remove parentheses from process name
            size_t len = strlen(comm);
            if (len >= 2) {
                memmove(comm, comm + 1, len - 2);
                comm[len - 2] = '\0';
            }
            
            strncpy(proc->name, comm, MAX_PROC_NAME - 1);
            proc->state = state;
            proc->utime = utime;
            proc->stime = stime;
            proc->rss = rss * page_size / 1024; // Convert to KB
            
            // Calculate memory percentage
            if (total_memory_kb > 0) {
                proc->mem_percent = ((double)proc->rss / total_memory_kb) * 100.0;
            }
            
            // Accumulate total CPU time
            list->total_cpu_time += (double)(utime + stime);
            
            list->process_count++;
        }
        
        fclose(fp);
    }
    
    closedir(dir);
    
    // Set initial CPU percentages based on total CPU time
    if (list->total_cpu_time > 0) {
        for (int i = 0; i < list->process_count; i++) {
            list->processes[i].cpu_percent = 
                ((double)(list->processes[i].utime + list->processes[i].stime) / 
                 list->total_cpu_time) * 100.0;
        }
    }
    
    return list->process_count > 0;
}

void calculate_process_cpu_percent(ProcessList *current, ProcessList *previous) {
    if (!current || !previous) return;
    
    // Create a map of previous processes by PID
    for (int i = 0; i < current->process_count; i++) {
        bool found = false;
        
        for (int j = 0; j < previous->process_count; j++) {
            if (current->processes[i].pid == previous->processes[j].pid) {
                double delta_time = (current->processes[i].utime + current->processes[i].stime) -
                                  (previous->processes[j].utime + previous->processes[j].stime);
                double total_delta = current->total_cpu_time - previous->total_cpu_time;
                
                if (total_delta > 0 && delta_time > 0) {
                    current->processes[i].cpu_percent = (delta_time / total_delta) * 100.0;
                } else {
                    current->processes[i].cpu_percent = 0.0;
                }
                found = true;
                break;
            }
        }
        
        if (!found) {
            current->processes[i].cpu_percent = 0.0;
        }
    }
}

void sort_processes_by_cpu(ProcessList *list) {
    if (!list) return;
    
    // Simple bubble sort for clarity (can be optimized for large process lists)
    for (int i = 0; i < list->process_count - 1; i++) {
        for (int j = 0; j < list->process_count - i - 1; j++) {
            if (list->processes[j].cpu_percent < list->processes[j + 1].cpu_percent) {
                ProcessInfo temp = list->processes[j];
                list->processes[j] = list->processes[j + 1];
                list->processes[j + 1] = temp;
            }
        }
    }
}

void sort_processes_by_memory(ProcessList *list) {
    if (!list) return;
    
    // Simple bubble sort for clarity
    for (int i = 0; i < list->process_count - 1; i++) {
        for (int j = 0; j < list->process_count - i - 1; j++) {
            if (list->processes[j].rss < list->processes[j + 1].rss) {
                ProcessInfo temp = list->processes[j];
                list->processes[j] = list->processes[j + 1];
                list->processes[j + 1] = temp;
            }
        }
    }
}
