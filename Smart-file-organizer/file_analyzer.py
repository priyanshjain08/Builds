import os
import hashlib
from datetime import datetime
from pathlib import Path
import threading
import time

class FileAnalyzer:
    """Analyzes files in a directory and provides statistics"""
    
    # File categories with their extensions
    CATEGORIES = {
        'Images': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp', '.ico', '.tiff', '.raw'],
        'Documents': ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt', '.xls', '.xlsx', '.ppt', '.pptx', '.csv', '.md'],
        'Videos': ['.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv', '.webm', '.m4v', '.mpg', '.mpeg'],
        'Audio': ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.wma', '.m4a', '.opus'],
        'Archives': ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2', '.xz', '.iso'],
        'Code': ['.py', '.js', '.html', '.css', '.java', '.cpp', '.c', '.h', '.php', '.rb', '.go', '.rs', '.ts', '.jsx', '.tsx', '.json', '.xml', '.yml', '.yaml'],
        'Executables': ['.exe', '.msi', '.deb', '.rpm', '.app', '.bat', '.sh', '.bin', '.dmg'],
    }
    
    def __init__(self):
        self.files = []
        self.total_files = 0
        self.total_size = 0
        self.categories = {}
        self.scanning = False
        self.scan_progress = 0
        self.current_file = ""
        
    def get_category(self, extension):
        """Get category for a file extension"""
        extension = extension.lower()
        for category, extensions in self.CATEGORIES.items():
            if extension in extensions:
                return category
        return 'Other'
    
    def scan_directory(self, directory, progress_callback=None):
        """Scan directory and analyze all files"""
        self.files = []
        self.total_files = 0
        self.total_size = 0
        self.categories = {}
        self.scanning = True
        self.scan_progress = 0
        
        try:
            # First, count total files for progress
            total_files_count = sum([len(files) for _, _, files in os.walk(directory)])
            
            for root, dirs, files in os.walk(directory):
                # Skip hidden directories
                dirs[:] = [d for d in dirs if not d.startswith('.')]
                
                for filename in files:
                    if not self.scanning:
                        return
                        
                    filepath = os.path.join(root, filename)
                    
                    try:
                        # Skip hidden files
                        if filename.startswith('.'):
                            continue
                            
                        stat_info = os.stat(filepath)
                        extension = os.path.splitext(filename)[1]
                        category = self.get_category(extension)
                        
                        file_info = {
                            'name': filename,
                            'path': filepath,
                            'extension': extension,
                            'category': category,
                            'size': stat_info.st_size,
                            'created': datetime.fromtimestamp(stat_info.st_ctime),
                            'modified': datetime.fromtimestamp(stat_info.st_mtime),
                            'accessed': datetime.fromtimestamp(stat_info.st_atime)
                        }
                        
                        self.files.append(file_info)
                        self.total_files += 1
                        self.total_size += stat_info.st_size
                        
                        # Update categories
                        if category not in self.categories:
                            self.categories[category] = {'count': 0, 'size': 0}
                        self.categories[category]['count'] += 1
                        self.categories[category]['size'] += stat_info.st_size
                        
                        # Update progress
                        self.scan_progress = (self.total_files / total_files_count) * 100
                        self.current_file = filename
                        
                        if progress_callback:
                            progress_callback(self.scan_progress, filename)
                            
                    except (OSError, PermissionError) as e:
                        print(f"Error accessing file {filepath}: {e}")
                        continue
                        
        except Exception as e:
            print(f"Error scanning directory: {e}")
        finally:
            self.scanning = False
            
    def get_large_files(self, limit=20):
        """Get largest files"""
        sorted_files = sorted(self.files, key=lambda x: x['size'], reverse=True)
        return sorted_files[:limit]
    
    def search_files(self, query, category=None, extension=None):
        """Search and filter files"""
        results = self.files.copy()
        
        if query:
            query = query.lower()
            results = [f for f in results if query in f['name'].lower()]
            
        if category and category != 'All':
            results = [f for f in results if f['category'] == category]
            
        if extension and extension != 'All':
            results = [f for f in results if f['extension'].lower() == extension.lower()]
            
        return results
    
    def format_size(self, size):
        """Format file size to human readable format"""
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if size < 1024.0:
                return f"{size:.2f} {unit}"
            size /= 1024.0
        return f"{size:.2f} PB"

class DuplicateFinder:
    """Finds duplicate files using hashing"""
    
    def __init__(self):
        self.duplicates = {}
        self.scanning = False
        self.progress = 0
        
    def calculate_hash(self, filepath, block_size=65536):
        """Calculate SHA-256 hash of file"""
        hasher = hashlib.sha256()
        try:
            with open(filepath, 'rb') as f:
                for block in iter(lambda: f.read(block_size), b''):
                    hasher.update(block)
            return hasher.hexdigest()
        except (IOError, OSError):
            return None
    
    def find_duplicates(self, files, progress_callback=None):
        """Find duplicate files in list"""
        self.duplicates = {}
        self.scanning = True
        self.progress = 0
        
        # Group by size first (quick filter)
        size_groups = {}
        for file_info in files:
            size = file_info['size']
            if size > 0:  # Skip empty files for performance
                if size not in size_groups:
                    size_groups[size] = []
                size_groups[size].append(file_info)
        
        # Only check groups with multiple files
        potential_duplicates = {size: group for size, group in size_groups.items() if len(group) > 1}
        
        total_to_check = sum(len(group) for group in potential_duplicates.values())
        checked = 0
        
        for size, group in potential_duplicates.items():
            hash_groups = {}
            
            for file_info in group:
                if not self.scanning:
                    return
                    
                file_hash = self.calculate_hash(file_info['path'])
                if file_hash:
                    if file_hash not in hash_groups:
                        hash_groups[file_hash] = []
                    hash_groups[file_hash].append(file_info)
                
                checked += 1
                self.progress = (checked / total_to_check) * 100
                
                if progress_callback:
                    progress_callback(self.progress, file_info['name'])
            
            # Add duplicate groups
            for file_hash, duplicate_group in hash_groups.items():
                if len(duplicate_group) > 1:
                    self.duplicates[file_hash] = duplicate_group
        
        self.scanning = False
        return self.duplicates
