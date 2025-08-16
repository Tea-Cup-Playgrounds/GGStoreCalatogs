/**
 * Resource preloader for optimizing asset loading
 */
class ResourcePreloader {
  constructor() {
    this.preloadedResources = new Set();
    this.preloadQueue = [];
    this.isProcessing = false;
  }

  /**
   * Preload critical resources
   */
  preloadCriticalResources() {
    // Preload critical images that appear above the fold
    const criticalImages = [
      '/images/logo.png',
      '/images/hero-banner.jpg'
    ];

    criticalImages.forEach(src => {
      this.preloadImage(src, 'high');
    });

    // Preload critical fonts
    this.preloadFont('/fonts/inter-regular.woff2');
    this.preloadFont('/fonts/inter-medium.woff2');
  }

  /**
   * Preload image with priority
   */
  preloadImage(src, priority = 'low') {
    if (this.preloadedResources.has(src)) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    
    if (priority === 'high') {
      link.fetchPriority = 'high';
    }

    document.head.appendChild(link);
    this.preloadedResources.add(src);
  }

  /**
   * Preload font
   */
  preloadFont(href) {
    if (this.preloadedResources.has(href)) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.href = href;
    link.crossOrigin = 'anonymous';

    document.head.appendChild(link);
    this.preloadedResources.add(href);
  }

  /**
   * Preload JavaScript module
   */
  preloadModule(href) {
    if (this.preloadedResources.has(href)) return;

    const link = document.createElement('link');
    link.rel = 'modulepreload';
    link.href = href;

    document.head.appendChild(link);
    this.preloadedResources.add(href);
  }

  /**
   * Preload CSS
   */
  preloadCSS(href) {
    if (this.preloadedResources.has(href)) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;

    document.head.appendChild(link);
    this.preloadedResources.add(href);
  }

  /**
   * Intelligent preloading based on user behavior
   */
  preloadOnHover(element, resources) {
    let hoverTimer;
    
    element.addEventListener('mouseenter', () => {
      hoverTimer = setTimeout(() => {
        resources.forEach(resource => {
          if (resource.type === 'image') {
            this.preloadImage(resource.src);
          } else if (resource.type === 'module') {
            this.preloadModule(resource.src);
          }
        });
      }, 100); // Small delay to avoid preloading on quick hovers
    });

    element.addEventListener('mouseleave', () => {
      if (hoverTimer) {
        clearTimeout(hoverTimer);
      }
    });
  }

  /**
   * Preload resources when they're likely to be needed
   */
  preloadOnIntersection(elements, resources, threshold = 0.1) {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          resources.forEach(resource => {
            if (resource.type === 'image') {
              this.preloadImage(resource.src);
            } else if (resource.type === 'module') {
              this.preloadModule(resource.src);
            }
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold });

    elements.forEach(element => {
      observer.observe(element);
    });
  }

  /**
   * Preload next page resources based on current route
   */
  preloadNextPageResources(currentRoute) {
    const routePreloadMap = {
      '/': [
        { type: 'module', src: '/js/katalog.js' },
        { type: 'image', src: '/images/katalog-preview.jpg' }
      ],
      '/katalog': [
        { type: 'module', src: '/js/detail.js' },
        { type: 'module', src: '/js/wishlist.js' }
      ],
      '/detail': [
        { type: 'module', src: '/js/katalog.js' },
        { type: 'module', src: '/js/wishlist.js' }
      ]
    };

    const resources = routePreloadMap[currentRoute];
    if (resources) {
      // Delay preloading to not interfere with current page
      setTimeout(() => {
        resources.forEach(resource => {
          if (resource.type === 'image') {
            this.preloadImage(resource.src, 'low');
          } else if (resource.type === 'module') {
            this.preloadModule(resource.src);
          }
        });
      }, 2000);
    }
  }

  /**
   * Adaptive preloading based on connection speed
   */
  adaptivePreload(resources) {
    // Check connection speed
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (connection) {
      const effectiveType = connection.effectiveType;
      
      // Only preload on fast connections
      if (effectiveType === '4g' || effectiveType === '3g') {
        resources.forEach(resource => {
          if (resource.type === 'image') {
            this.preloadImage(resource.src, 'low');
          } else if (resource.type === 'module') {
            this.preloadModule(resource.src);
          }
        });
      }
    } else {
      // Fallback: preload with delay
      setTimeout(() => {
        resources.forEach(resource => {
          if (resource.type === 'image') {
            this.preloadImage(resource.src, 'low');
          } else if (resource.type === 'module') {
            this.preloadModule(resource.src);
          }
        });
      }, 3000);
    }
  }

  /**
   * Clean up preloaded resources
   */
  cleanup() {
    this.preloadedResources.clear();
    this.preloadQueue = [];
  }
}

// Create singleton instance
const resourcePreloader = new ResourcePreloader();

// Auto-preload critical resources
window.addEventListener('load', () => {
  resourcePreloader.preloadCriticalResources();
});

export default resourcePreloader;