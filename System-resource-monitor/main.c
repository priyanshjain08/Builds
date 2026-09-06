#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <termios.h>
#include <fcntl.h>
#include <signal.h>
#include <time.h>
#include "system_info.h"
#include "process_monitor.h"
#include "ui.h"

// Global state for signal handling
static volatile sig_atomic_t keep_running = 1;

void signal_handler(int signum) {
    if (signum == SIGINT || signum == SIGTERM) {
        keep_running = 0;
    }
}

// Function to set terminal to non-blocking mode
void set_terminal_nonblocking(void) {
    struct termios ttystate;
    tcgetattr(STDIN_FILENO, &ttystate);
    ttystate.c_lflag &= ~ICANON;
    ttystate.c_lflag &= ~ECHO;
    ttystate.c_cc[VMIN] = 0;
    ttystate.c_cc[VTIME] = 0;
    tcsetattr(STDIN_FILENO, TCSANOW, &ttystate);
    
    // Set stdin to non-blocking
    int flags = fcntl(STDIN_FILENO, F_GETFL, 0);
    fcntl(STDIN_FILENO, F_SETFL, flags | O_NONBLOCK);
}

// Function to restore terminal settings
void restore_terminal(void) {
    struct termios ttystate;
    tcgetattr(STDIN_FILENO, &ttystate);
    ttystate.c_lflag |= ICANON;
    ttystate.c_lflag |= ECHO;
    tcsetattr(STDIN_FILENO, TCSANOW, &ttystate);
    
    // Restore stdin flags
    int flags = fcntl(STDIN_FILENO, F_GETFL, 0);
    fcntl(STDIN_FILENO, F_SETFL, flags & ~O_NONBLOCK);
    
    // Show cursor
    printf("\033[?25h");
}

void handle_key_press(char key, AppState *state) {
    switch (key) {
        case '1':
            state->current_view = VIEW_DASHBOARD;
            break;
        case '2':
            state->current_view = VIEW_PROCESSES;
            break;
        case '3':
            state->current_view = VIEW_DISK;
            break;
        case '4':
            state->current_view = VIEW_NETWORK;
            break;
        case '5':
            state->current_view = VIEW_SETTINGS;
            break;
        case 'p':
        case 'P':
            state->auto_refresh = !state->auto_refresh;
            break;
        case 'r':
        case 'R':
            // Force refresh (handled in main loop)
            break;
        case 's':
        case 'S':
            state->process_sort_mode = !state->process_sort_mode;
            break;
        case '+':
            if (state->refresh_interval < 60) {
                state->refresh_interval++;
            }
            break;
        case '-':
            if (state->refresh_interval > 1) {
                state->refresh_interval--;
            }
            break;
        case 'l':
        case 'L':
            // Cycle through process limits
            if (state->process_limit == 10) {
                state->process_limit = 20;
            } else if (state->process_limit == 20) {
                state->process_limit = 50;
            } else if (state->process_limit == 50) {
                state->process_limit = 100;
            } else {
                state->process_limit = 10;
            }
            break;
        case 'q':
        case 'Q':
            state->running = false;
            break;
    }
}

int main(void) {
    // Set up signal handlers
    signal(SIGINT, signal_handler);
    signal(SIGTERM, signal_handler);
    
    // Initialize application state
    AppState state = {
        .current_view = VIEW_DASHBOARD,
        .refresh_interval = 2,
        .auto_refresh = true,
        .running = true,
        .process_sort_mode = 0, // CPU sorting
        .process_limit = 20
    };
    
    // Initialize data structures
    SystemInfo sys_info;
    CpuUsage cpu = {0};
    MemoryInfo mem;
    DiskStats disk;
    NetworkStats net;
    ProcessList current_processes = {0};
    ProcessList previous_processes = {0};
    
    // Set up terminal for non-blocking input
    set_terminal_nonblocking();
    init_ui();
    
    // Initial data collection
    get_system_info(&sys_info);
    get_cpu_usage(&cpu); // First call initializes previous stats
    get_memory_info(&mem);
    get_disk_stats(&disk);
    get_network_stats(&net);
    get_process_list(&current_processes, mem.total_kb);
    
    // Main loop
    time_t last_refresh = time(NULL);
    bool need_refresh = true;
    
    while (state.running && keep_running) {
        // Check for keyboard input
        char key;
        while (read(STDIN_FILENO, &key, 1) > 0) {
            if (key == 'r' || key == 'R') {
                need_refresh = true;
            } else {
                handle_key_press(key, &state);
            }
        }
        
        // Check if it's time to refresh
        time_t current_time = time(NULL);
        if ((state.auto_refresh && (current_time - last_refresh >= state.refresh_interval)) 
            || need_refresh) {
            
            // Save previous process list for CPU calculation
            if (current_processes.process_count > 0) {
                previous_processes = current_processes;
            }
            
            // Refresh data
            get_cpu_usage(&cpu);
            get_memory_info(&mem);
            get_disk_stats(&disk);
            get_network_stats(&net);
            get_process_list(&current_processes, mem.total_kb);
            
            // Calculate process CPU usage based on previous data
            if (previous_processes.process_count > 0 && current_processes.process_count > 0) {
                calculate_process_cpu_percent(&current_processes, &previous_processes);
            }
            
            // Sort processes
            if (state.process_sort_mode == 0) {
                sort_processes_by_cpu(&current_processes);
            } else {
                sort_processes_by_memory(&current_processes);
            }
            
            last_refresh = current_time;
            need_refresh = false;
        }
        
        // Clear and redraw the screen
        clear_screen();
        
        switch (state.current_view) {
            case VIEW_DASHBOARD:
                draw_dashboard(&sys_info, &cpu, &mem, &disk, &net);
                break;
            case VIEW_PROCESSES:
                draw_processes(&current_processes, &state);
                break;
            case VIEW_DISK:
                draw_disk(&disk);
                break;
            case VIEW_NETWORK:
                draw_network(&net);
                break;
            case VIEW_SETTINGS:
                draw_settings(&state);
                draw_menu(&state);
                break;
        }
        
        // Small sleep to prevent excessive CPU usage
        usleep(100000); // 100ms
    }
    
    // Restore terminal settings
    restore_terminal();
    clear_screen();
    printf("System Resource Monitor terminated.\n");
    
    return 0;
}
