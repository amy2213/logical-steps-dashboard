import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props){super(props);this.state={error:null};}
  static getDerivedStateFromError(error){return{error};}
  componentDidCatch(error,info){console.error('Logical Steps crashed',{error,info});}
  render(){
    if(this.state.error){return <main className="shell"><section className="notice" role="alert"><h1>Logical Steps hit a problem</h1><p>The page could not finish rendering. Your pasted text was not saved.</p><button type="button" className="btn btn--primary" onClick={()=>window.location.reload()}>Reload Logical Steps</button></section></main>;}
    return this.props.children;
  }
}
