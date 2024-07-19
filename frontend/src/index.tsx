import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AnimalStatus } from './models/animalStatus';
import { AnimalSex } from './models/animalSex';
import {AnimalSort} from "./models/animalSort";

let roots = document.querySelectorAll('.shelterblock-root');
if(roots.length === 0) {
  roots = document.querySelectorAll('#root');
}
roots.forEach((rootElement) => {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App
        type={getTypesFromRoot(rootElement) || undefined}
        status={rootElement.getAttribute('data-status')?.split(",").filter((it) => it !== '').map((it: string) => it as AnimalStatus) || Object.values(AnimalStatus)}
        sex={rootElement.getAttribute('data-sex') as AnimalSex || undefined}
        maxAge={getNumber(rootElement, 'data-maxAge') || undefined}
        minAge={getNumber(rootElement, 'data-minAge', 1) || undefined}
        hideFilters={rootElement.getAttribute('data-hideFilters') === 'yes' || undefined}
        wasFound={rootElement.hasAttribute('data-wasFound') && rootElement.getAttribute('data-wasFound') !== '' ? (rootElement.getAttribute('data-wasFound') === 'yes') : undefined}
        missing={rootElement.hasAttribute('data-missing') && rootElement.getAttribute('data-missing') !== '' ? (rootElement.getAttribute('data-missing') === 'yes') : undefined}
        privateAdoption={rootElement.hasAttribute('data-privateAdoption') && rootElement.getAttribute('data-privateAdoption') !== '' ? (rootElement.getAttribute('data-privateAdoption') === 'yes') : undefined}
        orderBy={rootElement.getAttribute('data-orderBy') as AnimalSort || undefined}
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
function getTypesFromRoot(rootElement: Element): number[] | undefined {
  const rawData = rootElement.getAttribute('data-type')
  if(!rawData) return undefined
  const splitted = rawData!.split(",").filter((it) => it !== '')
  return splitted.map((it: string) => parseInt(it))
}

