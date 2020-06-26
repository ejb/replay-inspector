import React from 'react';
import ReactDOM from 'react-dom';
import {ObjectInspector} from 'react-inspector';

import { ObjectRootLabel } from 'react-inspector'
import { ObjectLabel } from 'react-inspector'

const omitDeep = require("omit-deep-lodash");

init();


const defaultNodeRenderer = ({ depth, name, data, isNonenumerable, expanded }) => {

  let label = depth === 0
    ? React.createElement(ObjectRootLabel, {name, data})
    : React.createElement(ObjectLabel, {name, data, isNonenumerable});
    
  const copyContents = (ev) => {
    ev.stopPropagation();
    ev.preventDefault();
    copyToClipboard(JSON.stringify(data, null, '\t'));
    return false;
  }
    
  const copyButton = React.createElement('button', {onClick: copyContents, className: 'copy-button'}, 'Copy');

  return React.createElement(React.Fragment, null, label, copyButton);;
}



class ReplayInspector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      gameState: {}
    }
  }
  componentDidMount() {
    setInterval(async () => {
      let gameState = this.state;
      try {
        gameState = await getHook();
      } catch (err) {
        console.error(err)
      }
      this.setState({
        gameState
      });
    }, 100);
  }
  render() {
    console.log(cleanGameState(this.state.gameState));
    return React.createElement(ObjectInspector, {
      data: cleanGameState(this.state.gameState),
      expandLevel: 1,
      nodeRenderer: defaultNodeRenderer
    });
  }
}

async function init() {
  try {
    await addHook();    
  } catch (err) {
    console.error(err)
  }
  const domContainer = document.querySelector('#replay-inspector-app');
  ReactDOM.render(React.createElement(ReplayInspector), domContainer);
}



async function addHook() {
  return await runEval('window.__REPLAY_DEVTOOLS_GLOBAL_HOOK__ = {}');
}

async function getHook(callback) {
  return await runEval('window.__REPLAY_DEVTOOLS_GLOBAL_HOOK__');
}

async function runEval(codeSnippet) {
  return new Promise((res, rej) => {
    chrome.devtools.inspectedWindow.eval(
      codeSnippet,
      function(result, isException) {
        if (isException) {
          rej(isException);
        }
        res(result);
      }
    );  
  });
}



function copyToClipboard (state) {
  const dummyTextArea = document.createElement('textarea')
  dummyTextArea.textContent = state;
  document.body.appendChild(dummyTextArea)
  dummyTextArea.select()
  document.execCommand('copy')
  document.body.removeChild(dummyTextArea)
}

function cleanGameState(state) {
  const propsToRemove = ['prevTime','currentLag','getSprites'];
  return omitDeep(state, ...propsToRemove);
}