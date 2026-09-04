import { createRoot } from 'react-dom/client';
import RootApp from './RootApp';

const root = createRoot(document.getElementById('root'));
root.render(<RootApp />);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.log('SW registration failed: ', err);
    });
  });
}
