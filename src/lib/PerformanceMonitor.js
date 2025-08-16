/**
 * Performance monitoring utility for tracking load times and metrics
 */
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = [];
    this.initObservers();
  }

  initObservers() {
    // Observe Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.recordMetric('LCP', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);

        // Observe First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            this.recordMetric('FID', entry.processingStart - entry.startTime);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);

        // Observe Cumulative Layout Shift
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.recordMetric('CLS', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (error) {
        console.warn('Performance Observer not fully supported:', error);
      }
    }
  }

  recordMetric(name, value) {
    this.metrics.set(name, {
      value,
      timestamp: Date.now()
    });
  }

  startTimer(name) {
    this.recordMetric(`${name}_start`, performance.now());
  }

  endTimer(name) {
    const startTime = this.metrics.get(`${name}_start`)?.value;
    if (startTime) {
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration);
      return duration;
    }
    return null;
  }

  measureRouteChange(routeName) {
    this.startTimer(`route_${routeName}`);
    
    // End timer when route is fully loaded
    requestAnimationFrame(() => {
      setTimeout(() => {
        this.endTimer(`route_${routeName}`);
      }, 100);
    });
  }

  measureComponentLoad(componentName) {
    this.startTimer(`component_${componentName}`);
    
    return () => {
      this.endTimer(`component_${componentName}`);
    };
  }

  getMetrics() {
    const result = {};
    this.metrics.forEach((data, name) => {
      result[name] = data.value;
    });
    return result;
  }

  getWebVitals() {
    return {
      LCP: this.metrics.get('LCP')?.value || null,
      FID: this.metrics.get('FID')?.value || null,
      CLS: this.metrics.get('CLS')?.value || null
    };
  }

  logPerformanceReport() {
    const metrics = this.getMetrics();
    const webVitals = this.getWebVitals();
    
    console.group('🚀 Performance Report');
    console.log('Web Vitals:', webVitals);
    console.log('Route Timings:', Object.keys(metrics)
      .filter(key => key.startsWith('route_') && !key.endsWith('_start'))
      .reduce((obj, key) => {
        obj[key] = `${metrics[key].toFixed(2)}ms`;
        return obj;
      }, {})
    );
    console.log('Component Timings:', Object.keys(metrics)
      .filter(key => key.startsWith('component_') && !key.endsWith('_start'))
      .reduce((obj, key) => {
        obj[key] = `${metrics[key].toFixed(2)}ms`;
        return obj;
      }, {})
    );
    console.groupEnd();
  }

  // Send metrics to analytics (placeholder)
  sendMetrics(endpoint) {
    if (!endpoint) return;
    
    const metrics = this.getMetrics();
    const webVitals = this.getWebVitals();
    
    // Only send in production and if metrics exist
    if (process.env.NODE_ENV === 'production' && Object.keys(metrics).length > 0) {
      fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          metrics,
          webVitals,
          userAgent: navigator.userAgent,
          timestamp: Date.now()
        })
      }).catch(error => {
        console.warn('Failed to send performance metrics:', error);
      });
    }
  }

  cleanup() {
    this.observers.forEach(observer => {
      observer.disconnect();
    });
    this.observers = [];
    this.metrics.clear();
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Auto-report performance metrics after page load
window.addEventListener('load', () => {
  setTimeout(() => {
    performanceMonitor.logPerformanceReport();
  }, 3000);
});

export default performanceMonitor;