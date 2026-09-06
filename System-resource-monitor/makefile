CC = gcc
CFLAGS = -Wall -Wextra -O2
LDFLAGS = -lm

TARGET = sysmon
SOURCES = main.c system_info.c process_monitor.c ui.c
OBJECTS = $(SOURCES:.c=.o)
HEADERS = system_info.h process_monitor.h ui.h

all: $(TARGET)

$(TARGET): $(OBJECTS)
	$(CC) $(CFLAGS) -o $(TARGET) $(OBJECTS) $(LDFLAGS)

%.o: %.c $(HEADERS)
	$(CC) $(CFLAGS) -c $< -o $@

clean:
	rm -f $(TARGET) $(OBJECTS)

install: $(TARGET)
	sudo cp $(TARGET) /usr/local/bin/

uninstall:
	sudo rm -f /usr/local/bin/$(TARGET)

.PHONY: all clean install uninstall
