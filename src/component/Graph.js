import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './Graph.css';
import {
  mxCodec,
  mxConnectionHandler,
  mxClient,
  mxEvent,
  mxImage,
  mxGraph,
  mxUtils,
} from "mxgraph-js";

var paletteNodes = [
  {"text": "ETL",         "type": "etl",        "fillColor": "lightcoral",},
  {"text": "Validation",  "type": "validation", "fillColor": "lightseagreen",},
  {"text": "Release",     "type": "release",    "fillColor": "lightgreen",},
];

// TODO(peleyal): Log the graph from XML:
// https://github.com/jgraph/mxgraph/blob/e407026f5db3d40d3e39b3396dbed1b03e6f9608/javascript/examples/grapheditor/www/js/Editor.js#L469

function getNodeColor(nodeType) {
  return paletteNodes.find(n => n.type === nodeType).fillColor;
}

function createPopupMenu(graph, menu, cell, evt) {
  if (cell == null) {
    menu.addItem('Print', null, function() { 
      var encoder = new mxCodec();
      var node = encoder.encode(graph.getModel());
      console.log(mxUtils.getPrettyXml(node), true);
    });
    menu.addItem('Zoom In', null, () => graph.zoomIn());
    menu.addItem('Zoom Out', null, () => graph.zoomOut());
    menu.addItem('Fit', null, () => graph.fit());
    
  } else {
    menu.addItem('Delete', null, function() { 
      graph.removeCells([cell]);
    });
  }
}

export default class Graph extends Component {
  constructor(props) {
    super(props);
    // this.state = {} ?
    this.graph = null;
    this.selectionChange = this.selectionChange.bind(this); 
  }

  componentDidMount() {
    this.initGraph();
  }

  selectionChange() {
    // TODO(peleyal): We need to support more than one node from a single "type".
    let cell = this.graph.getSelectionCell();
    this.props.onSelectionChanged(cell ? cell.value : null);
  }

  initGraph() {
    var container = ReactDOM.findDOMNode(this.refs.graph);
    // Checks if the browser is supported.
    if (!mxClient.isBrowserSupported()) {
      mxUtils.error("Browser is not supported!", 200, false);
      return;
    }
    // TODO(peleyal): Display a nice image for dragging when connecting nodes.
    mxConnectionHandler.prototype.connectImage = new mxImage('images/connector.gif', 16, 16);

    // Creates the graph inside the given container.
    var graph = new mxGraph(container);
    
    // Disables the built-in context menu
    mxEvent.disableContextMenu(container);
		graph.popupMenuHandler.factoryMethod = function(menu, cell, evt) {
			return createPopupMenu(graph, menu, cell, evt);
		};


    graph.getSelectionModel().addListener(mxEvent.CHANGE, this.selectionChange);
    graph.setConnectable(true);

    // Palette
    // TODO(peleyal): Maybe we should create a mxToolbar, as suggested in:
    // https://github.com/jgraph/mxgraph-js/blob/master/javascript/examples/dynamictoolbar.html
    var palette = ReactDOM.findDOMNode(this.refs.palette);
    const nodes = palette.children;
    // Function that is executed when a node is dropped on the graph.
    var dropEnd = function(graph, evt, cell, x, y, node) {
      const dataType = node.getAttribute("data-type");
      const dataText = node.getAttribute("data-text");
      // TODO(peleyal): Use data-type, and pass it to the Graph's owner, as we can edit
      // the vertex text.
      let vertex = graph.insertVertex(
        graph.getDefaultParent(), cell, dataText, x, y, 80, 30,  
          "fillColor=" + getNodeColor(dataType));
      graph.setSelectionCell(vertex);
    }
    for (var node of nodes) {
      const element = node;
      mxUtils.makeDraggable(
        element,
        graph,
        (graph, evt, target, x, y) =>
          dropEnd(graph, evt, target, x, y, element));
    }
    
    var parent = graph.getDefaultParent();
    graph.getModel().beginUpdate();
    try {
      var v1 = graph.insertVertex(parent, null,
        'ETL', 20, 20, 80, 30, "fillColor=" + getNodeColor("etl"));
      var v2 = graph.insertVertex(parent, null,
        'Validation', 150, 20, 80, 30, "fillColor=" + getNodeColor("validation"));
      var v3 = graph.insertVertex(parent, null,
        'Release', 280, 20, 80, 30,"fillColor=" + getNodeColor("release"));

      graph.insertEdge(parent, null, '', v1, v2);
      graph.insertEdge(parent, null, '', v2, v3);
    }
    finally {
        graph.getModel().endUpdate();
    }

    this.graph = graph;
  }

  render() {
    return (
      <div className="graph">
        <div className="palette" ref="palette">
          {paletteNodes.map((node) => {
            var color = node.fillColor;
            return  <div className="node"
                       key={node.type}
                       data-text={node.text}
                       data-type={node.type}
                       style={{background:color}}>
                      {node.text} 
                    </div>;})}
        </div>
        <div className="digram-container">
          <div className="diagram" ref="graph" />
        </div>
      </div>
    );
  }
}