import { AuthService } from '../lib/AuthService.js';
import { NotificationService } from '../components/NotificationService.js';

class AdminDashboard {
  constructor() {
    this.authService = new AuthService();
    this.notificationService = new NotificationService();
    this.sidebarCollapsed = false;
  }

  async render(container) {
    container.innerHTML = this.getHTML();
    this.bindEvents();
    await this.loadUserInfo();
  }

  getHTML() {
    return `
      <div class="admin-layout">
        <aside class="admin-sidebar" id="adminSidebar">
          <div class="sidebar-header">
            <div class="sidebar-logo">
              <i class="fas fa-cube"></i>
              <span class="sidebar-logo-text">GG Catalogs</span>
            </div>
            <button class="sidebar-toggle" id="sidebarToggle">
              <i class="fas fa-bars"></i>
            </button>
          </div>
          
          <nav class="sidebar-nav">
            <ul class="nav-list">
              <li class="nav-item">
                <a href="/admin/dashboard" class="nav-link" data-route="/admin/dashboard">
                  <i class="fas fa-tachometer-alt"></i>
                  <span class="nav-text">Dashboard</span>
                </a>
              </li>
              <li class="nav-item">
                <a href="/admin/products" class="nav-link" data-route="/admin/products">
                  <i class="fas fa-box"></i>
                  <span class="nav-text">Products</span>
                </a>
              </li>
              <li class="nav-item">
                <a href="/admin/brands" class="nav-link" data-route="/admin/brands">
                  <i class="fas fa-tags"></i>
                  <span class="nav-text">Brands</span>
                </a>
              </li>
              <li class="nav-item">
                <a href="/admin/categories" class="nav-link" data-route="/admin/categories">
                  <i class="fas fa-list"></i>
                  <span class="nav-text">Categories</span>
                </a>
              </li>
              <li class="nav-item">
                <a href="/admin/banners" class="nav-link" data-route="/admin/banners">
                  <i class="fas fa-image"></i>
                  <span class="nav-text">Banners</span>
                </a>
              </li>
              <li class="nav-item">
                <a href="/admin/admins" class="nav-link" data-route="/admin/admins">
                  <i class="fas fa-users-cog"></i>
                  <span class="nav-text">Admin Users</span>
                </a>
              </li>
            </ul>
          </nav>
        </aside>
        
        <div class="admin-main">
          <header class="admin-header">
            <div class="header-left">
              <button class="mobile-menu-toggle" id="mobileMenuToggle">
                <i class="fas fa-bars"></i>
              </button>
              <h1 class="page-title" id="pageTitle">Dashboard</h1>
            </div>
            
            <div class="header-right">
              <div class="user-menu">
                <button class="user-menu-toggle" id="userMenuToggle">
                  <div class="user-avatar">
                    <i class="fas fa-user"></i>
                  </div>
                  <span class="user-name" id="userName">Admin</span>
                  <i class="fas fa-chevron-down"></i>
                </button>
                
                <div class="user-menu-dropdown" id="userMenuDropdown">
                  <a href="#" class="dropdown-item" id="logoutBtn">
                    <i class="fas fa-sign-out-alt"></i>
                    Logout
                  </a>
                </div>
              </div>
            </div>
          </header>
          
          <main class="admin-content" id="adminContent">
            <!-- Page content will be loaded here -->
          </main>
        </div>

        <nav class="mobile-bottom-nav">
          <a href="/admin/dashboard" class="bottom-nav-link" data-route="/admin/dashboard">
            <i class="fas fa-tachometer-alt"></i>
            <span>Dashboard</span>
          </a>
          <a href="/admin/products" class="bottom-nav-link" data-route="/admin/products">
            <i class="fas fa-box"></i>
            <span>Products</span>
          </a>
          <a href="/admin/brands" class="bottom-nav-link" data-route="/admin/brands">
            <i class="fas fa-tags"></i>
            <span>Brands</span>
          </a>
          <a href="/admin/categories" class="bottom-nav-link" data-route="/admin/categories">
            <i class="fas fa-list"></i>
            <span>Categories</span>
          </a>
          <a href="/admin/banners" class="bottom-nav-link" data-route="/admin/banners">
            <i class="fas fa-image"></i>
            <span>Banners</span>
          </a>
          <a href="/admin/admins" class="bottom-nav-link" data-route="/admin/admins">
            <i class="fas fa-users-cog"></i>
            <span>Admins</span>
          </a>
        </nav>
      </div>
      
      <style>
        .page-container {
          flex-direction: row;
        }

        .admin-layout {
          display: flex;
          height: 100vh;
          background-color: #FFFFFF;
        }

        .mobile-bottom-nav {
          display: none;
        }

        .admin-sidebar {
          width: 260px;
          background: #000000;
          color: #FFFFFF;
          transition: all 0.3s ease;
          position: relative;
          z-index: 1000;
        }
        
        .admin-sidebar.collapsed {
          width: 70px;
        }
        
        .sidebar-header {
          padding: 1rem 1rem 1.37rem 1rem;
          border-bottom: 1px solid #E6B120;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 600;
          font-size: 1.125rem;
        }

        .sidebar-logo i {
          font-size: 1.5rem;
          color: #FFCD29;
        }
        
        .sidebar-toggle {
          background: none;
          border: none;
          color: #E6B120;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 0.375rem;
          transition: all 0.2s;
        }

        .sidebar-toggle:hover {
          background-color: #E6B120;
          color: #000000;
        }
        
        .sidebar-nav {
          padding: 1rem 0;
        }
        
        .nav-list {
          list-style: none;
          width: 100%;
          margin: 0;
          padding: 0;
        }
        
        .nav-item {
          margin-bottom: 0.25rem;
        }
        
        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          color: #FFFFFF;
          text-decoration: none;
          transition: all 0.2s;
          border-left: 3px solid transparent;
        }

        .nav-link:hover {
          background-color: #E6B120;
          color: #000000;
          text-decoration: none;
        }

        .nav-link.active {
          background-color: #FFCD29;
          color: #000000;
          border-left-color: #E6B120;
        }
        
        .nav-link i {
          width: 20px;
          text-align: center;
        }
        
        .admin-sidebar.collapsed .sidebar-logo-text,
        .admin-sidebar.collapsed .nav-text {
          display: none;
        }

        .admin-sidebar.collapsed .nav-list {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .admin-sidebar.collapsed .nav-item {
          width: 100%;
          display: flex;
          justify-content: center;
        }

        .admin-sidebar.collapsed .nav-link {
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .admin-sidebar.collapsed .nav-link i {
          font-size: 1.25rem;
        }

        .admin-sidebar.collapsed .nav-link:hover {
          background-color: #E6B120;
          color: #000000;
          border-left: none;
          border-radius: 0.5rem;
        }

        
        .admin-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        
        .admin-header {
          background: #FFFFFF;
          border-bottom: 1px solid #E6B120;
          padding: 0 1.5rem;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 1px 3px rgba(230, 177, 32, 0.2);
        }
        
        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .mobile-menu-toggle {
          display: none;
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 0.375rem;
        }
        
        .page-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #000000;
          margin: 0;
        }
        
        .user-menu {
          position: relative;
        }
        
        .user-menu-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 0.5rem;
          transition: background-color 0.2s;
        }
        
        .user-menu-toggle:hover {
          background-color: #f1f5f9;
        }
        
        .user-avatar {
          width: 32px;
          height: 32px;
          background: #E6B120;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #000000;
        }

        .user-name {
          font-weight: 500;
          color: #000000;
        }
        
        .user-menu-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          min-width: 150px;
          z-index: 1000;
          display: none;
        }
        
        .user-menu-dropdown.show {
          display: block;
        }
        
        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          color: #374151;
          text-decoration: none;
          transition: background-color 0.2s;
        }
        
        .dropdown-item:hover {
          background-color: #f9fafb;
          text-decoration: none;
          color: #374151;
        }
        
        .admin-content {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
        }

        @media (min-width: 1280px) {
          nav {
            
          }
        }
        
        @media (max-width: 768px) {
          .admin-sidebar {
            display: none;
            transition: none;
            position: fixed;
            left: -260px;
            height: 100vh;
            z-index: 1001;
          }
          
          .admin-sidebar.mobile-open {
            left: 0;
          }
          
          .admin-main {
            width: 100%;
          }
          
          .mobile-menu-toggle {
            display: none;
          }
          
          .admin-content {
            padding: 1rem;
          }

          .mobile-bottom-nav {
            display: flex;
            justify-content: space-around;
            align-items: center;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: #000000;
            border-top: 1px solid #E6B120;
            padding: 0.5rem 0.25rem;
            z-index: 1002;
            gap: 0.25rem;
          }

          .bottom-nav-link {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-decoration: none;
            color: #FFFFFF;
            font-size: 0.7rem;
            flex: 1;
            min-width: 0;
            padding: 0.25rem;
            border-radius: 0.375rem;
            transition: all 0.2s ease;
          }

          .bottom-nav-link:hover {
            background: rgba(230, 177, 32, 0.1);
            color: #FFCD29;
            text-decoration: none;
          }

          .bottom-nav-link i {
            font-size: 1.1rem;
            margin-bottom: 0.25rem;
          }

          .bottom-nav-link span {
            text-align: center;
            line-height: 1.1;
            word-break: break-word;
          }

          .bottom-nav-link.active {
            color: #FFCD29;
            background: rgba(255, 205, 41, 0.15);
          }

          /* Adjust page content padding so it doesn't get hidden */
          .admin-content {
            padding-bottom: 4rem;
          }
        }

        /* Extra small screens - optimize for 6 navigation items */
        @media (max-width: 480px) {
          .mobile-bottom-nav {
            padding: 0.375rem 0.125rem;
            gap: 0.125rem;
          }

          .bottom-nav-link {
            font-size: 0.65rem;
            padding: 0.125rem;
          }

          .bottom-nav-link i {
            font-size: 1rem;
            margin-bottom: 0.125rem;
          }

          .bottom-nav-link span {
            font-size: 0.6rem;
          }
        }

        /* Very small screens - ultra compact */
        @media (max-width: 360px) {
          .mobile-bottom-nav {
            padding: 0.25rem 0.0625rem;
            gap: 0.0625rem;
          }

          .bottom-nav-link {
            font-size: 0.6rem;
            padding: 0.0625rem;
          }

          .bottom-nav-link i {
            font-size: 0.9rem;
            margin-bottom: 0.0625rem;
          }

          .bottom-nav-link span {
            font-size: 0.55rem;
            line-height: 1;
          }
        }
      </style>
    `;
  }

  bindEvents() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const userMenuToggle = document.getElementById('userMenuToggle');
    const userMenuDropdown = document.getElementById('userMenuDropdown');
    const logoutBtn = document.getElementById('logoutBtn');
    const sidebar = document.getElementById('adminSidebar');

    // Sidebar toggle
    sidebarToggle?.addEventListener('click', () => {
      this.sidebarCollapsed = !this.sidebarCollapsed;
      sidebar.classList.toggle('collapsed', this.sidebarCollapsed);
    });

    // Mobile menu toggle
    mobileMenuToggle?.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });

    // User menu toggle
    userMenuToggle?.addEventListener('click', (e) => {
      e.stopPropagation();
      userMenuDropdown.classList.toggle('show');
    });

    // Close user menu when clicking outside
    document.addEventListener('click', () => {
      userMenuDropdown.classList.remove('show');
    });

    // Logout
    logoutBtn?.addEventListener('click', async (e) => {
      e.preventDefault();
      await this.handleLogout();
    });

    // Navigation links (sidebar)
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const route = link.dataset.route;
        if (route) {
          this.navigateToRoute(route);
        }
      });
    });

    // Mobile bottom navigation links
    const bottomNavLinks = document.querySelectorAll('.bottom-nav-link');
    bottomNavLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const route = link.dataset.route;
        if (route) {
          this.navigateToRoute(route);
        }
      });
    });

    // Update active nav link based on current route
    this.updateActiveNavLink();
  }

  async loadUserInfo() {
    try {
      const user = this.authService.getUser();
      if (user) {
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
          userNameElement.textContent = user.username || 'Admin';
        }
      }
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  }

  async handleLogout() {
    try {
      await this.authService.logout();
      this.notificationService.success('Logged Out', 'You have been successfully logged out');
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      this.notificationService.error('Logout Error', 'There was an error logging out');
    }
  }

  navigateToRoute(route) {
    // Update active nav link for both sidebar and mobile navigation
    const navLinks = document.querySelectorAll('.nav-link, .bottom-nav-link');
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.dataset.route === route) {
        link.classList.add('active');
      }
    });

    // Update page title
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
      const titles = {
        '/admin/dashboard': 'Dashboard',
        '/admin/products': 'Products',
        '/admin/brands': 'Brands',
        '/admin/categories': 'Categories',
        '/admin/banners': 'Banners',
        '/admin/admins': 'Admin Users'
      };
      pageTitle.textContent = titles[route] || 'Dashboard';
    }

    // Navigate using router
    if (window.history) {
      window.history.pushState({}, '', route);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }

  updateActiveNavLink() {
    const currentPath = window.location.pathname;
    
    // Update sidebar navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.dataset.route === currentPath) {
        link.classList.add('active');
      }
    });

    // Update mobile bottom navigation
    const bottomNavLinks = document.querySelectorAll('.bottom-nav-link');
    bottomNavLinks.forEach(link => {
      link.classList.remove('active');
      if (link.dataset.route === currentPath) {
        link.classList.add('active');
      }
    });
  }
}

export default AdminDashboard;
