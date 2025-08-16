/**
 * Lazy loading utility for dynamic imports
 */
class LazyLoader {
  constructor() {
    this.cache = new Map();
    this.loadingPromises = new Map();
  }

  /**
   * Dynamically import a component with caching
   * @param {Function} importFn - Function that returns import promise
   * @param {string} key - Cache key for the component
   * @returns {Promise} Component promise
   */
  async loadComponent(importFn, key) {
    // Return cached component if available
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    // Return existing loading promise if in progress
    if (this.loadingPromises.has(key)) {
      return this.loadingPromises.get(key);
    }

    // Create loading promise
    const loadingPromise = importFn()
      .then(module => {
        const component = module.default || module;
        this.cache.set(key, component);
        this.loadingPromises.delete(key);
        return component;
      })
      .catch(error => {
        this.loadingPromises.delete(key);
        console.error(`Failed to load component ${key}:`, error);
        throw error;
      });

    this.loadingPromises.set(key, loadingPromise);
    return loadingPromise;
  }

  /**
   * Create a lazy component wrapper
   * @param {Function} importFn - Function that returns import promise
   * @param {string} key - Cache key for the component
   * @returns {Function} Component constructor
   */
  createLazyComponent(importFn, key) {
    return class LazyComponent {
      constructor(props = {}) {
        this.props = props;
        this.element = null;
        this.isLoading = true;
        this.component = null;
      }

      async mount(container) {
        // Show loading state
        this.showLoading(container);

        try {
          // Load the component
          const ComponentClass = await LazyLoader.instance.loadComponent(importFn, key);
          this.component = new ComponentClass(this.props);
          
          // Clear loading and render component
          container.innerHTML = '';
          
          // Check if component has render method (standard) or mount method (lazy)
          if (this.component.render) {
            await this.component.render(container);
          } else if (this.component.mount) {
            await this.component.mount(container);
          } else {
            throw new Error('Component must have either render() or mount() method');
          }
          
          this.isLoading = false;
        } catch (error) {
          this.showError(container, error);
        }
      }

      // Add render method for compatibility with router
      async render(container) {
        return this.mount(container);
      }

      showLoading(container) {
        container.innerHTML = `
          <div class="lazy-loading">
            <div class="loading-spinner"></div>
            <p>Loading...</p>
          </div>
        `;
      }

      showError(container, error) {
        container.innerHTML = `
          <div class="lazy-error">
            <p>Failed to load component</p>
            <button onclick="location.reload()">Retry</button>
          </div>
        `;
      }

      unmount() {
        if (this.component) {
          if (this.component.unmount) {
            this.component.unmount();
          } else if (this.component.destroy) {
            this.component.destroy();
          }
        }
      }
    };
  }

  /**
   * Preload components for better UX
   * @param {Array} components - Array of {importFn, key} objects
   */
  async preloadComponents(components) {
    const promises = components.map(({ importFn, key }) => 
      this.loadComponent(importFn, key).catch(() => {}) // Ignore errors for preloading
    );
    
    await Promise.allSettled(promises);
  }
}

// Create singleton instance
LazyLoader.instance = new LazyLoader();

export default LazyLoader;