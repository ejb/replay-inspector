import React from 'react';
import ReactDOM from 'react-dom';
import {ObjectInspector} from 'react-inspector';

import { ObjectRootLabel } from 'react-inspector'
import { ObjectLabel } from 'react-inspector'

const defaultNodeRenderer = ({ depth, name, data, isNonenumerable, expanded }) => {

  let label = depth === 0
    ? React.createElement(ObjectRootLabel, {name, data})
    : React.createElement(ObjectLabel, {name, data, isNonenumerable});
    
  const copyContents = (ev) => {
    ev.stopPropagation();
    ev.preventDefault();
    console.log(data);
    copyToClipboard(JSON.stringify(data, null, '\t'));
    return false;
  }
    
  const copyButton = React.createElement('button', {onClick: copyContents, className: 'copy-button'}, 'Copy');

  return React.createElement(React.Fragment, null, label, copyButton);;
}


const domContainer = document.querySelector('#replay-inspector-app');

class ReplayInspector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      gameState: {}
    }
  }
  componentDidMount() {
    setInterval(() => {
      getReplayState(gameState => {
        this.setState({
          gameState
        });
      });
    }, 100);
  }
  render() {
    
    
    return React.createElement(ObjectInspector, {
      data: this.state.gameState,
      expandLevel: 1,
      nodeRenderer: defaultNodeRenderer
    });
  }
}

ReactDOM.render(React.createElement(ReplayInspector), domContainer);



function getReplayState(callback) {
  chrome.devtools.inspectedWindow.eval(
    'window.__replay_state__',
    function(result, isException) {
      if (isException) {
        throw(isException);
      }
      callback(result);
    }
  );  
}


function copyToClipboard (state) {
  const dummyTextArea = document.createElement('textarea')
  dummyTextArea.textContent = state;
  document.body.appendChild(dummyTextArea)
  dummyTextArea.select()
  document.execCommand('copy')
  document.body.removeChild(dummyTextArea)
}
