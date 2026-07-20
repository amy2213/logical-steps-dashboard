import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

const rootElement=document.getElementById('root');
if(!rootElement)throw new Error('Application root element "#root" was not found.');
ReactDOM.createRoot(rootElement).render(<React.StrictMode><ErrorBoundary><App/></ErrorBoundary></React.StrictMode>);
