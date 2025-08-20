import { BottomNavigationBar, updateBottomNavigation } from '../components/BottomNavigationBar.js';
import { AuthService } from './AuthService.js';

/**
 * NavigationManager - Handles navigation updates based on authentication state
 */
class NavigationManager {
  constructor() {
    this.authService = new AuthService();
    this.authStateUnsubscribe = null;
  }

  /**
   * Initialize navigation with auth state monitoring
   */
  initialize() {
    // Set up auth state listener
    this.authStateUnsubscribe = this.authService.onAuthStateChange((isAuthenticated) => {
      this.updateNavigation(isAuthenticated);
    });

    // Initial navigation setup
    this.updateNavigation(this.authService.isLoggedIn());
  }

  /**
   * Update navigation based on authentication state
   */
  updateNavigation(isAuthenticated) {
    // Update bottom navigation
    updateBottomNavigation();
    
    // Update active states based on current path
    this.updateActiveNavStates();
  }

  /**
   * Update active navigation states based on current path
   */
  updateActiveNavStates() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.bottom-nav a');
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      
      const linkPath = link.getAttribute('data-path');
      if (linkPath) {
        // Handle exact matches and admin routes
        if (currentPath === linkPath || 
            (linkPath === '/admin' && currentPath.startsWith('/admin')) ||
            (linkPath === '/' && currentPath === '/') ||
            (linkPath === '/katalog' && currentPath === '/katalog') ||
            (linkPath === '/Brands' && currentPath === '/brands') ||
            (linkPath === '/Wishlist' && currentPath === '/wishlist')) {
          link.classList.add('active');
        }
      }
    });
  }

  /**
   * Clean up listeners
   */
  destroy() {
    if (this.authStateUnsubscribe) {
      this.authStateUnsubscribe();
      this.authStateUnsubscribe = null;
    }
  }
}

// Create singleton instance
const navigationManager = new NavigationManager();

export { NavigationManager, navigationManager };