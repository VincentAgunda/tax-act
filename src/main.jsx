import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './styles/animations.css'
import * as serviceWorker from './utils/serviceWorker'

// Performance monitoring
if (import.meta.env.PROD) {
  // Register service worker in production
  serviceWorker.register({
    onSuccess: () => {
      console.log('App is ready for offline use');
    },
    onUpdate: (registration) => {
      console.log('New content available; please refresh to update');
      // You could show a notification to user here
    }
  });
  
  // Monitor Web Vitals in production
  serviceWorker.measureWebVitals();
} else {
  // Monitor performance in development
  setTimeout(() => {
    serviceWorker.measurePerformance();
  }, 2000);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
