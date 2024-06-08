import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import App from './App';
import reportWebVitals from './reportWebVitals';

let roots = document.querySelectorAll('.shelterblock-root');
if(roots.length === 0) {
  roots = document.querySelectorAll('#root');
}
roots.forEach((rootElement) => {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App
        type={parseInt(rootElement.getAttribute('data-type') || '-1')}
        status={rootElement.getAttribute('data-status') || ''}
        hideFilters={rootElement.getAttribute('data-hideFilters') === 'true'}
      />
    </React.StrictMode>
  );
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
