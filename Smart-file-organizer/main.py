import customtkinter as ctk
from ui_components import SmartFileOrganizerApp
import sys
import os

def main():
    # Set appearance mode and color theme
    ctk.set_appearance_mode("dark")
    ctk.set_default_color_theme("blue")
    
    # Create and run application
    app = SmartFileOrganizerApp()
    app.run()

if __name__ == "__main__":
    main()
