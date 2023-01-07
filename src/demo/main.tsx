import React from 'react';
import ReactDOM from 'react-dom/client';
import Demo from './demo';
import { StoreProvider } from './storeProvider';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <StoreProvider>
      <Demo />
    </StoreProvider>
  </React.StrictMode>
);
