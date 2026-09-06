#ifndef UI_H
#define UI_H

#include "system_info.h"
#include "process_monitor.h"
#include <stdbool.h>

#define COLOR_RESET   "\033[0m"
#define COLOR_BOLD    "\033[1m"
#define COLOR_RED     "\033[31m"
#define COLOR_GREEN   "\033[32m"
#define COLOR_YELLOW  "\033[33m"
#define COLOR_BLUE    "\033[34m"
#define COLOR_MAGENTA "\033[35m"
#define COLOR_CYAN    "\033[36m"

typedef enum {
    VIEW_DASHBOARD,
    VIEW_PROCESSES,
    VIEW_DISK,
    VIEW_NETWORK,
    VIEW_SETTINGS
} ViewMode;

typedef struct {
    ViewMode current_view;
    int refresh_interval; // in seconds
    bool auto_refresh;
    bool running;
    int process_sort_mode; // 0 = CPU, 1 = Memory
    int process_limit;
} AppState;

// Function declarations
void clear_screen(void);
void init_ui(void);
void draw_dashboard(SystemInfo *sys_info, CpuUsage *cpu, MemoryInfo *mem, 
                   DiskStats *disk, NetworkStats *net);
void draw_processes(ProcessList *processes, AppState *state);
void draw_disk(DiskStats *disk);
void draw_network(NetworkStats *net);
void draw_settings(AppState *state);
void draw_menu(AppState *state);
void draw_header(const char *title);

#endif
