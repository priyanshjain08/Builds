import customtkinter as ctk
from tkinter import filedialog, messagebox
import os
import threading
import time
from datetime import datetime
from file_analyzer import FileAnalyzer, DuplicateFinder
from file_organizer import FileOrganizer

# Color scheme
COLORS = {
    'bg_dark': '#1a1a2e',
    'bg_medium': '#16213e',
    'bg_light': '#0f3460',
    'accent': '#e94560',
    'text': '#ffffff',
    'text_secondary': '#a0a0a0',
    'success': '#4caf50',
    'warning': '#ff9800',
    'danger': '#f44336',
}

class SmartFileOrganizerApp:
    def __init__(self):
        self.window = ctk.CTk()
        self.window.title("Smart File Organizer Pro")
        self.window.geometry("1400x800")
        self.window.configure(fg_color=COLORS['bg_dark'])
        
        # Initialize components
        self.analyzer = FileAnalyzer()
        self.duplicate_finder = DuplicateFinder()
        self.organizer = FileOrganizer()
        
        # State variables
        self.current_folder = None
        self.activity_log = []
        
        # Setup UI
        self.setup_ui()
        
    def setup_ui(self):
        """Setup the main UI layout"""
        # Main container
        self.main_container = ctk.CTkFrame(self.window, fg_color=COLORS['bg_dark'])
        self.main_container.pack(fill="both", expand=True)
        
        # Sidebar
        self.setup_sidebar()
        
        # Main content area
        self.content_frame = ctk.CTkFrame(self.main_container, fg_color=COLORS['bg_medium'])
        self.content_frame.pack(side="right", fill="both", expand=True, padx=10, pady=10)
        
        # Show dashboard by default
        self.show_dashboard()
        
    def setup_sidebar(self):
        """Setup sidebar navigation"""
        sidebar = ctk.CTkFrame(self.main_container, width=200, fg_color=COLORS['bg_medium'])
        sidebar.pack(side="left", fill="y", padx=10, pady=10)
        sidebar.pack_propagate(False)
        
        # App logo and name
        logo_frame = ctk.CTkFrame(sidebar, fg_color="transparent")
        logo_frame.pack(pady=20, padx=20, fill="x")
        
        logo_label = ctk.CTkLabel(
            logo_frame,
            text="📁",
            font=("Arial", 40)
        )
        logo_label.pack()
        
        title_label = ctk.CTkLabel(
            logo_frame,
            text="Smart File Organizer",
            font=("Arial", 16, "bold"),
            text_color=COLORS['text']
        )
        title_label.pack()
        
        subtitle_label = ctk.CTkLabel(
            logo_frame,
            text="PRO",
            font=("Arial", 12),
            text_color=COLORS['accent']
        )
        subtitle_label.pack()
        
        # Navigation buttons
        nav_buttons = [
            ("Dashboard", "📊", self.show_dashboard),
            ("File Analyzer", "🔍", self.show_file_analyzer),
            ("File Organizer", "📁", self.show_file_organizer),
            ("Duplicate Finder", "🔍", self.show_duplicate_finder),
            ("Large Files", "📈", self.show_large_files),
            ("Activity Log", "📝", self.show_activity_log),
            ("Settings", "⚙️", self.show_settings),
        ]
        
        for text, icon, command in nav_buttons:
            btn = ctk.CTkButton(
                sidebar,
                text=f"{icon} {text}",
                command=command,
                fg_color="transparent",
                hover_color=COLORS['bg_light'],
                anchor="w",
                height=40,
                corner_radius=8,
                font=("Arial", 13)
            )
            btn.pack(pady=5, padx=20, fill="x")
        
    def clear_content(self):
        """Clear main content area"""
        for widget in self.content_frame.winfo_children():
            widget.destroy()
    
    def show_dashboard(self):
        """Show dashboard with overview"""
        self.clear_content()
        
        # Header
        header = ctk.CTkFrame(self.content_frame, fg_color="transparent")
        header.pack(fill="x", padx=20, pady=20)
        
        ctk.CTkLabel(
            header,
            text="Dashboard",
            font=("Arial", 24, "bold"),
            text_color=COLORS['text']
        ).pack(side="left")
        
        if not self.current_folder:
            ctk.CTkButton(
                header,
                text="Select Folder",
                command=self.select_folder,
                fg_color=COLORS['accent'],
                hover_color="#c73e54"
            ).pack(side="right")
        
        # Stats cards
        stats_frame = ctk.CTkFrame(self.content_frame, fg_color="transparent")
        stats_frame.pack(fill="x", padx=20, pady=10)
        
        # Create stats cards
        stats = [
            ("Total Files", str(self.analyzer.total_files), "📄"),
            ("Total Size", self.analyzer.format_size(self.analyzer.total_size), "💾"),
            ("Categories", str(len(self.analyzer.categories)), "📁"),
            ("Duplicates", str(len(self.duplicate_finder.duplicates)), "🔍"),
        ]
        
        for i, (title, value, icon) in enumerate(stats):
            card = ctk.CTkFrame(stats_frame, fg_color=COLORS['bg_light'], corner_radius=10)
            card.grid(row=0, column=i, padx=10, pady=10, sticky="nsew")
            stats_frame.grid_columnconfigure(i, weight=1)
            
            ctk.CTkLabel(
                card,
                text=icon,
                font=("Arial", 30)
            ).pack(pady=10)
            
            ctk.CTkLabel(
                card,
                text=value,
                font=("Arial", 20, "bold"),
                text_color=COLORS['text']
            ).pack()
            
            ctk.CTkLabel(
                card,
                text=title,
                font=("Arial", 12),
                text_color=COLORS['text_secondary']
            ).pack(pady=(0, 10))
        
        # Category breakdown
        if self.current_folder and self.analyzer.categories:
            ctk.CTkLabel(
                self.content_frame,
                text="File Categories",
                font=("Arial", 18, "bold"),
                text_color=COLORS['text']
            ).pack(pady=(20, 10))
            
            categories_frame = ctk.CTkFrame(self.content_frame, fg_color=COLORS['bg_light'], corner_radius=10)
            categories_frame.pack(fill="x", padx=20, pady=10)
            
            for category, info in self.analyzer.categories.items():
                row = ctk.CTkFrame(categories_frame, fg_color="transparent")
                row.pack(fill="x", padx=20, pady=5)
                
                ctk.CTkLabel(
                    row,
                    text=category,
                    font=("Arial", 14),
                    text_color=COLORS['text']
                ).pack(side="left")
                
                ctk.CTkLabel(
                    row,
                    text=f"{info['count']} files",
                    font=("Arial", 12),
                    text_color=COLORS['text_secondary']
                ).pack(side="left", padx=20)
                
                ctk.CTkLabel(
                    row,
                    text=self.analyzer.format_size(info['size']),
                    font=("Arial", 12),
                    text_color=COLORS['text_secondary']
                ).pack(side="right")
        else:
            # Show placeholder
            placeholder = ctk.CTkFrame(self.content_frame, fg_color=COLORS['bg_light'], corner_radius=10)
            placeholder.pack(fill="both", expand=True, padx=20, pady=20)
            
            ctk.CTkLabel(
                placeholder,
                text="📂",
                font=("Arial", 60)
            ).pack(pady=20)
            
            ctk.CTkLabel(
                placeholder,
                text="Select a folder to get started",
                font=("Arial", 18, "bold"),
                text_color=COLORS['text']
            ).pack()
            
            ctk.CTkLabel(
                placeholder,
                text="Analyze and organize your files intelligently",
                font=("Arial", 14),
                text_color=COLORS['text_secondary']
            ).pack()
            
            ctk.CTkButton(
                placeholder,
                text="Select Folder",
                command=self.select_folder,
                fg_color=COLORS['accent'],
                hover_color="#c73e54",
                width=200,
                height=40
            ).pack(pady=30)
    
    def show_file_analyzer(self):
        """Show file analyzer view"""
        self.clear_content()
        
        # Header
        header = ctk.CTkFrame(self.content_frame, fg_color="transparent")
        header.pack(fill="x", padx=20, pady=20)
        
        ctk.CTkLabel(
            header,
            text="File Analyzer",
            font=("Arial", 24, "bold"),
            text_color=COLORS['text']
        ).pack(side="left")
        
        if not self.current_folder:
            ctk.CTkButton(
                header,
                text="Select Folder",
                command=self.select_folder,
                fg_color=COLORS['accent'],
                hover_color="#c73e54"
            ).pack(side="right")
        
        if self.current_folder:
            # Search and filter
            filter_frame = ctk.CTkFrame(self.content_frame, fg_color=COLORS['bg_light'], corner_radius=10)
            filter_frame.pack(fill="x", padx=20, pady=10)
            
            ctk.CTkLabel(
                filter_frame,
                text="Search:",
                font=("Arial", 14),
                text_color=COLORS['text']
            ).pack(side="left", padx=10)
            
            search_entry = ctk.CTkEntry(
                filter_frame,
                placeholder_text="Search files...",
                width=200
            )
            search_entry.pack(side="left", padx=10)
            
            ctk.CTkLabel(
                filter_frame,
                text="Category:",
                font=("Arial", 14),
                text_color=COLORS['text']
            ).pack(side="left", padx=10)
            
            categories = ["All"] + list(self.analyzer.categories.keys())
            category_var = ctk.StringVar(value="All")
            category_menu = ctk.CTkOptionMenu(
                filter_frame,
                values=categories,
                variable=category_var
            )
            category_menu.pack(side="left", padx=10)
            
            def search_files():
                query = search_entry.get()
                category = category_var.get()
                results = self.analyzer.search_files(query, category)
                update_file_list(results)
            
            ctk.CTkButton(
                filter_frame,
                text="Search",
                command=search_files,
                fg_color=COLORS['accent'],
                hover_color="#c73e54"
            ).pack(side="left", padx=10)
            
            # File list
            list_frame = ctk.CTkScrollableFrame(self.content_frame, fg_color=COLORS['bg_light'], corner_radius=10)
            list_frame.pack(fill="both", expand=True, padx=20, pady=10)
            
            def update_file_list(files):
                for widget in list_frame.winfo_children():
                    widget.destroy()
                
                for file_info in files[:100]:  # Show first 100 files
                    row = ctk.CTkFrame(list_frame, fg_color="transparent")
                    row.pack(fill="x", pady=2)
                    
                    ctk.CTkLabel(
                        row,
                        text=file_info['name'][:50],
                        font=("Arial", 12),
                        text_color=COLORS['text'],
                        anchor="w"
                    ).pack(side="left", padx=10)
                    
                    ctk.CTkLabel(
                        row,
                        text=file_info['category'],
                        font=("Arial", 12),
                        text_color=COLORS['text_secondary'],
                        width=100
                    ).pack(side="left", padx=10)
                    
                    ctk.CTkLabel(
                        row,
                        text=self.analyzer.format_size(file_info['size']),
                        font=("Arial", 12),
                        text_color=COLORS['text_secondary'],
                        width=100
                    ).pack(side="right", padx=10)
            
            # Show initial files
            update_file_list(self.analyzer.files)
    
    def show_file_organizer(self):
        """Show file organizer view"""
        self.clear_content()
        
        # Header
        header = ctk.CTkFrame(self.content_frame, fg_color="transparent")
        header.pack(fill="x", padx=20, pady=20)
        
        ctk.CTkLabel(
            header,
            text="File Organizer",
            font=("Arial", 24, "bold"),
            text_color=COLORS['text']
        ).pack(side="left")
        
        if self.current_folder and self.analyzer.files:
            # Organization method selection
            method_frame = ctk.CTkFrame(self.content_frame, fg_color=COLORS['bg_light'], corner_radius=10)
            method_frame.pack(fill="x", padx=20, pady=10)
            
            ctk.CTkLabel(
                method_frame,
                text="Organize by:",
                font=("Arial", 14),
                text_color=COLORS['text']
            ).pack(side="left", padx=10)
            
            methods = ["File Type", "File Extension", "Date Created", "Date Modified"]
            method_var = ctk.StringVar(value="File Type")
            method_menu = ctk.CTkOptionMenu(
                method_frame,
                values=methods,
                variable=method_var
            )
            method_menu.pack(side="left", padx=10)
            
            def preview_organization():
                method = method_var.get().lower().replace(" ", "_")
                operations = self.organizer.preview_organization(
                    self.analyzer.files,
                    method=method,
                    base_directory=self.current_folder
                )
                
                # Show preview
                preview_window = ctk.CTkToplevel(self.window)
                preview_window.title("Organization Preview")
                preview_window.geometry("800x600")
                preview_window.configure(fg_color=COLORS['bg_medium'])
                
                ctk.CTkLabel(
                    preview_window,
                    text=f"Preview: {len(operations)} files to organize",
                    font=("Arial", 18, "bold"),
                    text_color=COLORS['text']
                ).pack(pady=20)
                
                # Scrollable preview
                preview_frame = ctk.CTkScrollableFrame(preview_window, fg_color=COLORS['bg_light'], corner_radius=10)
                preview_frame.pack(fill="both", expand=True, padx=20, pady=10)
                
                for op in operations[:50]:  # Show first 50 operations
                    row = ctk.CTkFrame(preview_frame, fg_color="transparent")
                    row.pack(fill="x", pady=2)
                    
                    ctk.CTkLabel(
                        row,
                        text=op['filename'][:30],
                        font=("Arial", 12),
                        text_color=COLORS['text'],
                        width=200,
                        anchor="w"
                    ).pack(side="left", padx=5)
                    
                    ctk.CTkLabel(
                        row,
                        text="→",
                        font=("Arial", 14),
                        text_color=COLORS['accent']
                    ).pack(side="left", padx=10)
                    
                    ctk.CTkLabel(
                        row,
                        text=os.path.dirname(op['destination'])[:50],
                        font=("Arial", 12),
                        text_color=COLORS['text_secondary'],
                        width=300,
                        anchor="w"
                    ).pack(side="left", padx=5)
                
                def confirm_organization():
                    if messagebox.askyesno("Confirm", "Are you sure you want to organize these files?"):
                        def organize_thread():
                            result = self.organizer.organize_files(
                                operations,
                                progress_callback=lambda p, f: self.update_progress(p, f)
                            )
                            self.window.after(0, lambda: organization_complete(result))
                        
                        threading.Thread(target=organize_thread, daemon=True).start()
                        preview_window.destroy()
                
                def organization_complete(result):
                    messagebox.showinfo(
                        "Organization Complete",
                        f"Successfully organized {result['completed']} files\nFailed: {result['failed']} files"
                    )
                    self.log_activity(f"Organized {result['completed']} files")
                    self.show_dashboard()
                
                ctk.CTkButton(
                    preview_window,
                    text="Confirm Organization",
                    command=confirm_organization,
                    fg_color=COLORS['success'],
                    hover_color="#45a049"
                ).pack(pady=20)
            
            ctk.CTkButton(
                method_frame,
                text="Preview Organization",
                command=preview_organization,
                fg_color=COLORS['accent'],
                hover_color="#c73e54"
            ).pack(side="left", padx=20)
        
        elif not self.current_folder:
            ctk.CTkLabel(
                self.content_frame,
                text="Please select a folder first",
                font=("Arial", 16),
                text_color=COLORS['text_secondary']
            ).pack(pady=50)
    
    def show_duplicate_finder(self):
        """Show duplicate finder view"""
        self.clear_content()
        
        # Header
        header = ctk.CTkFrame(self.content_frame, fg_color="transparent")
        header.pack(fill="x", padx=20, pady=20)
        
        ctk.CTkLabel(
            header,
            text="Duplicate Finder",
            font=("Arial", 24, "bold"),
            text_color=COLORS['text']
        ).pack(side="left")
        
        if self.current_folder and self.analyzer.files:
            if not self.duplicate_finder.duplicates:
                ctk.CTkButton(
                    header,
                    text="Find Duplicates",
                    command=self.find_duplicates,
                    fg_color=COLORS['accent'],
                    hover_color="#c73e54"
                ).pack(side="right")
        
        if self.duplicate_finder.duplicates:
            # Show duplicate groups
            duplicate_frame = ctk.CTkScrollableFrame(self.content_frame, fg_color=COLORS['bg_light'], corner_radius=10)
            duplicate_frame.pack(fill="both", expand=True, padx=20, pady=10)
            
            ctk.CTkLabel(
                duplicate_frame,
                text=f"Found {len(self.duplicate_finder.duplicates)} duplicate groups",
                font=("Arial", 16, "bold"),
                text_color=COLORS['text']
            ).pack(pady=10)
            
            for hash_value, group in self.duplicate_finder.duplicates.items():
                group_frame = ctk.CTkFrame(duplicate_frame, fg_color=COLORS['bg_dark'], corner_radius=8)
                group_frame.pack(fill="x", pady=5, padx=10)
                
                ctk.CTkLabel(
                    group_frame,
                    text=f"Duplicate Group ({len(group)} files)",
                    font=("Arial", 14, "bold"),
                    text_color=COLORS['accent']
                ).pack(pady=5)
                
                for file_info in group:
                    row = ctk.CTkFrame(group_frame, fg_color="transparent")
                    row.pack(fill="x", pady=2)
                    
                    ctk.CTkLabel(
                        row,
                        text=file_info['path'],
                        font=("Arial", 12),
                        text_color=COLORS['text'],
                        anchor="w"
                    ).pack(side="left", padx=10)
                    
                    ctk.CTkLabel(
                        row,
                        text=self.analyzer.format_size(file_info['size']),
                        font=("Arial", 12),
                        text_color=COLORS['text_secondary']
                    ).pack(side="right", padx=10)
    
    def show_large_files(self):
        """Show large files view"""
        self.clear_content()
        
        # Header
        header = ctk.CTkFrame(self.content_frame, fg_color="transparent")
        header.pack(fill="x", padx=20, pady=20)
        
        ctk.CTkLabel(
            header,
            text="Large Files",
            font=("Arial", 24, "bold"),
            text_color=COLORS['text']
        ).pack(side="left")
        
        if self.current_folder and self.analyzer.files:
            large_files = self.analyzer.get_large_files(20)
            
            # File list
            list_frame = ctk.CTkScrollableFrame(self.content_frame, fg_color=COLORS['bg_light'], corner_radius=10)
            list_frame.pack(fill="both", expand=True, padx=20, pady=10)
            
            # Header row
            header_row = ctk.CTkFrame(list_frame, fg_color=COLORS['bg_dark'], corner_radius=5)
            header_row.pack(fill="x", pady=5)
            
            for col, width in [("File Name", 300), ("Path", 400), ("Size", 100)]:
                ctk.CTkLabel(
                    header_row,
                    text=col,
                    font=("Arial", 14, "bold"),
                    text_color=COLORS['text'],
                    width=width,
                    anchor="w"
                ).pack(side="left", padx=10)
            
            for file_info in large_files:
                row = ctk.CTkFrame(list_frame, fg_color="transparent")
                row.pack(fill="x", pady=2)
                
                ctk.CTkLabel(
                    row,
                    text=file_info['name'],
                    font=("Arial", 12),
                    text_color=COLORS['text'],
                    width=300,
                    anchor="w"
                ).pack(side="left", padx=10)
                
                ctk.CTkLabel(
                    row,
                    text=file_info['path'],
                    font=("Arial", 12),
                    text_color=COLORS['text_secondary'],
                    width=400,
                    anchor="w"
                ).pack(side="left", padx=10)
                
                ctk.CTkLabel(
                    row,
                    text=self.analyzer
