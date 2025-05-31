/**
 * Theme management module for the NTA Mock Test Platform
 * Handles theme switching between NTA and Material You themes
 * and toggling between light and dark modes
 */
class ThemeManager {
    constructor() {
        this.themeToggleBtn = document.getElementById('theme-toggle-btn');
        this.uiToggleBtn = document.getElementById('ui-toggle-btn');
        this.themeStylesheet = document.getElementById('theme-style');
        this.body = document.body;
        
        // Initialize theme state from local storage or defaults
        this.isDarkMode = localStorage.getItem(CONFIG.STORAGE_KEYS.DARK_MODE) === 'true';
        this.currentUIStyle = localStorage.getItem(CONFIG.STORAGE_KEYS.UI_STYLE) || CONFIG.THEMES.NTA;
        
        // Set initial theme
        this.applyTheme();
        
        // Bind event handlers
        this.bindEvents();
    }
    
    /**
     * Bind event handlers for theme toggles
     */
    bindEvents() {
        // Light/Dark mode toggle
        this.themeToggleBtn.addEventListener('click', () => {
            this.toggleDarkMode();
        });
        
        // UI style toggle (NTA vs Material You)
        this.uiToggleBtn.addEventListener('click', () => {
            this.toggleUIStyle();
        });
    }
    
    /**
     * Toggle between light and dark modes
     */
    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
        localStorage.setItem(CONFIG.STORAGE_KEYS.DARK_MODE, this.isDarkMode);
        
        // Update the toggle button icon
        const darkModeIcon = this.themeToggleBtn.querySelector('.material-symbols-rounded');
        darkModeIcon.textContent = this.isDarkMode ? 'light_mode' : 'dark_mode';
        
        this.applyTheme();
        
        // Add animation effect
        this.animateThemeTransition();
    }
    
    /**
     * Toggle between NTA and Material You UI styles
     */
    toggleUIStyle() {
        this.currentUIStyle = this.currentUIStyle === CONFIG.THEMES.NTA 
            ? CONFIG.THEMES.MATERIAL_YOU 
            : CONFIG.THEMES.NTA;
            
        localStorage.setItem(CONFIG.STORAGE_KEYS.UI_STYLE, this.currentUIStyle);
        
        // Update the toggle button icon with animation
        const styleIcon = this.uiToggleBtn.querySelector('.material-symbols-rounded');
        styleIcon.style.transform = 'rotate(180deg)';
        styleIcon.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
        
        setTimeout(() => {
            styleIcon.textContent = this.currentUIStyle === CONFIG.THEMES.NTA ? 'palette' : 'dashboard';
            styleIcon.style.transform = 'rotate(0deg)';
        }, 250);
        
        this.applyTheme();
        
        // Add animation effect
        this.animateThemeTransition();
        
        // Show theme change notification
        this.showThemeChangeNotification();
    }
    
    /**
     * Apply the current theme settings
     */
    applyTheme() {
        // Apply dark mode if enabled
        if (this.isDarkMode) {
            this.body.classList.add('dark-mode');
        } else {
            this.body.classList.remove('dark-mode');
        }
        
        // Apply UI style
        if (this.currentUIStyle === CONFIG.THEMES.MATERIAL_YOU) {
            this.body.classList.remove(CONFIG.THEMES.NTA);
            this.body.classList.add(CONFIG.THEMES.MATERIAL_YOU);
            this.themeStylesheet.href = 'css/material-you-theme.css';
        } else {
            this.body.classList.remove(CONFIG.THEMES.MATERIAL_YOU);
            this.body.classList.add(CONFIG.THEMES.NTA);
            this.themeStylesheet.href = 'css/nta-theme.css';
        }
    }
    
    /**
     * Add transition animation when changing themes
     */
    animateThemeTransition() {
        // Add a subtle animation effect when switching themes
        this.body.style.transition = 'background-color 0.3s, color 0.3s';
        
        // Create a quick flash effect to indicate theme change
        const flashOverlay = document.createElement('div');
        flashOverlay.style.position = 'fixed';
        flashOverlay.style.top = '0';
        flashOverlay.style.left = '0';
        flashOverlay.style.width = '100%';
        flashOverlay.style.height = '100%';
        flashOverlay.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        flashOverlay.style.pointerEvents = 'none';
        flashOverlay.style.zIndex = '9999';
        flashOverlay.style.opacity = '0';
        flashOverlay.style.transition = 'opacity 0.3s';
        
        document.body.appendChild(flashOverlay);
        
        // Trigger animation
        setTimeout(() => {
            flashOverlay.style.opacity = '0.2';
            
            setTimeout(() => {
                flashOverlay.style.opacity = '0';
                
                setTimeout(() => {
                    document.body.removeChild(flashOverlay);
                }, 300);
            }, 100);
        }, 0);
    }
    
    /**
     * Show a notification when theme is changed
     */
    showThemeChangeNotification() {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'theme-notification';
        notification.style.position = 'fixed';
        notification.style.bottom = '80px';
        notification.style.right = '20px';
        notification.style.backgroundColor = 'var(--primary-color)';
        notification.style.color = 'white';
        notification.style.padding = '12px 20px';
        notification.style.borderRadius = '16px';
        notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        notification.style.zIndex = '1001';
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(20px)';
        notification.style.transition = 'opacity 0.3s, transform 0.3s';
        
        // Set notification content
        const themeName = this.currentUIStyle === CONFIG.THEMES.NTA ? 'NTA Theme' : 'Material You Theme';
        notification.textContent = `Switched to ${themeName}`;
        
        // Add to body
        document.body.appendChild(notification);
        
        // Show notification with animation
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
            
            // Hide and remove after 3 seconds
            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 3000);
        }, 100);
    }
}

// Initialize theme manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
});
