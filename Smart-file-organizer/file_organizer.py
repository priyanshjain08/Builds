import os
import shutil
from datetime import datetime
from pathlib import Path

class FileOrganizer:
    """Organizes files into folders based on various criteria"""
    
    def __init__(self):
        self.operations = []
        
    def preview_organization(self, files, method='type', base_directory=None):
        """Preview file organization plan"""
        self.operations = []
        
        for file_info in files:
            source = file_info['path']
            
            if method == 'type':
                destination_folder = file_info['category']
            elif method == 'extension':
                destination_folder = file_info['extension'].lstrip('.') or 'No_Extension'
            elif method == 'date_created':
                date = file_info['created']
                destination_folder = f"{date.year}_{date.month:02d}"
            elif method == 'date_modified':
                date = file_info['modified']
                destination_folder = f"{date.year}_{date.month:02d}"
            else:
                destination_folder = 'Other'
            
            # Clean folder name
            destination_folder = self.clean_folder_name(destination_folder)
            
            # Create destination path
            if base_directory:
                destination = os.path.join(base_directory, 'Smart File Organizer Pro', destination_folder)
            else:
                destination = os.path.join(os.path.dirname(source), 'Smart File Organizer Pro', destination_folder)
            
            destination_file = os.path.join(destination, file_info['name'])
            
            # Handle duplicate filenames
            destination_file = self.get_unique_filename(destination_file)
            
            self.operations.append({
                'source': source,
                'destination': destination_file,
                'filename': file_info['name'],
                'size': file_info['size']
            })
        
        return self.operations
    
    def clean_folder_name(self, name):
        """Clean folder name for filesystem"""
        # Remove invalid characters
        invalid_chars = '<>:"|?*'
        for char in invalid_chars:
            name = name.replace(char, '')
        return name.strip() or 'Other'
    
    def get_unique_filename(self, filepath):
        """Generate unique filename if file exists"""
        if not os.path.exists(filepath):
            return filepath
            
        directory = os.path.dirname(filepath)
        filename = os.path.basename(filepath)
        name, extension = os.path.splitext(filename)
        counter = 1
        
        while os.path.exists(filepath):
            new_filename = f"{name}_{counter}{extension}"
            filepath = os.path.join(directory, new_filename)
            counter += 1
            
        return filepath
    
    def organize_files(self, operations, progress_callback=None):
        """Execute file organization operations"""
        completed = 0
        failed = 0
        
        for i, operation in enumerate(operations):
            try:
                # Create destination directory if it doesn't exist
                os.makedirs(os.path.dirname(operation['destination']), exist_ok=True)
                
                # Move file
                shutil.move(operation['source'], operation['destination'])
                completed += 1
                
            except Exception as e:
                print(f"Error moving file {operation['source']}: {e}")
                failed += 1
            
            # Update progress
            progress = ((i + 1) / len(operations)) * 100
            if progress_callback:
                progress_callback(progress, operation['filename'])
        
        return {'completed': completed, 'failed': failed}
    
    def delete_files(self, filepaths, progress_callback=None):
        """Safely delete files"""
        deleted = 0
        failed = 0
        
        for i, filepath in enumerate(filepaths):
            try:
                os.remove(filepath)
                deleted += 1
            except Exception as e:
                print(f"Error deleting file {filepath}: {e}")
                failed += 1
            
            progress = ((i + 1) / len(filepaths)) * 100
            if progress_callback:
                progress_callback(progress, os.path.basename(filepath))
        
        return {'deleted': deleted, 'failed': failed}
