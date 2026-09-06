# 📁 Smart File Organizer Pro

A modern, professional desktop application for analyzing, organizing, and managing files on your computer. Built with Python and CustomTkinter, this application provides a premium dark-themed interface with powerful file management capabilities.

![Python Version](https://img.shields.io/badge/Python-3.7%2B-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![GUI Framework](https://img.shields.io/badge/GUI-CustomTkinter-orange)
![Status](https://img.shields.io/badge/Status-Active-brightgreen)

## ✨ Features

### 📊 Dashboard
- Overview of total files and storage usage
- File category breakdown with visual statistics
- Quick access to all major features
- Real-time updates after file operations
- Interactive cards showing key metrics

### 🔍 File Analyzer
- Scan folders and subfolders automatically
- Categorize files into 8 smart categories
- File search with filters by name, category, and extension
- Detailed file information display
- Real-time progress tracking during scans

### 📁 File Organizer
- Organize files by:
  - File type (categories)
  - File extension
  - Date created
  - Date modified
- Preview changes before applying
- Safe file moving with duplicate name handling
- Confirmation before any file operations
- Progress tracking during organization

### 🔍 Duplicate Finder
- Intelligent duplicate detection using file size and SHA-256 hashing
- Group duplicates for easy review
- Safe deletion with confirmation
- Progress tracking during scan
- Size-based pre-filtering for performance

### 📈 Large Files
- Identify largest files in your folders
- Sort by file size
- Quick identification of space-consuming files
- Display file paths for easy location

### 📝 Activity Log
- Track all important actions
- Timestamp for each operation
- History of scans, organizations, and deletions

## 🚀 Installation

### Prerequisites
- Python 3.7 or higher
- pip (Python package installer)
- Windows, macOS, or Linux

### Step 1: Create Project Files

Create the following files in your project directory:

1. **main.py** - Main application entry point
2. **file_analyzer.py** - File analysis and categorization logic
3. **file_organizer.py** - File organization operations
4. **ui_components.py** - User interface components
5. **requirements.txt** - Required Python packages

### Step 2: Install Required Packages

Open your terminal/command prompt and run:

```bash
# Navigate to your project directory
cd smart-file-organizer-pro

# Install required packages
pip install -r requirements.txt

### Step 3: Run the application

# Run the application
python main.py
