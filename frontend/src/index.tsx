import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AnimalStatus } from './models/animalStatus';
import { AnimalSex } from './models/animalSex';

let roots = document.querySelectorAll('.shelterblock-root');
if(roots.length === 0) {
  roots = document.querySelectorAll('#root');
}
roots.forEach((rootElement) => {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App
        type={rootElement.getAttribute('data-type') ? parseInt(rootElement.getAttribute('data-type')!) :  undefined}
        status={rootElement.getAttribute('data-status') as AnimalStatus || undefined}
        sex={rootElement.getAttribute('data-sex') as AnimalSex || undefined}
        maxAge={getNumber(rootElement, 'data-maxAge') || undefined}
        minAge={getNumber(rootElement, 'data-minAge', 1) || undefined}
        hideFilters={rootElement.getAttribute('data-hideFilters') === 'yes' || undefined}
        wasFound={rootElement.getAttribute('data-wasFound') === 'yes' || undefined}
        missing={rootElement.getAttribute('data-missing') === 'yes' || undefined}
        privateAdoption={rootElement.getAttribute('data-privateAdoption') === 'yes' || undefined}
      />
    </React.StrictMode>
  );
});

function getNumber(element: Element, attribute: string, bias: number = 0): number | undefined {
  return element.getAttribute(attribute) ? parseInt(element.getAttribute(attribute)!) + bias : undefined;
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
