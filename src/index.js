import './styles/global.css';
import App from './App.js';

// Register service worker
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('✅ Service Worker registered successfully:', registration.scope);
        
        // Listen for updates
        registration.addEventListener('updatefound', () => {
          console.log('🔄 Service Worker update found');
        });
      })
      .catch(registrationError => {
        console.error('❌ Service Worker registration failed:', registrationError);
      });
  });
} else if (process.env.NODE_ENV !== 'production') {
  console.log('🚧 Service Worker disabled in development mode');
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = '';
    const app = new App();
    app.mount(root);
  }
});