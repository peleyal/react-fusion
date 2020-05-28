import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import './Graph.css';
import { mxCodec, mxConnectionHandler, mxClient, mxEvent, mxImage, mxGraph, mxUtils, mxGraphModel, mxGeometry } from "mxgraph-js";

var paletteNodes = [
  {"text": "ETL",         "type": "etl",        "fillColor": "lightcoral",},
  {"text": "Validation",  "type": "validation", "fillColor": "lightseagreen",},
  {"text": "Release",     "type": "release",    "fillColor": "lightgreen",},
];

// TODO(peleyal): Get it from the frontend.
var sampleModel = `<mxGraphModel>
                    <root>
                      <mxCell id="0"/>
                      <mxCell id="1" parent="0"/>
                      <mxCell id="2" value="ETL" style="fillColor=lightcoral" vertex="1" parent="1">
                        <mxGeometry x="20" y="20" width="80" height="30" as="geometry"/>
                      </mxCell>
                      <mxCell id="3" value="Validation" style="fillColor=lightseagreen" vertex="1" parent="1">
                        <mxGeometry x="150" y="20" width="80" height="30" as="geometry"/>
                      </mxCell>
                      <mxCell id="4" value="Release" style="fillColor=lightgreen" vertex="1" parent="1">
                        <mxGeometry x="280" y="20" width="80" height="30" as="geometry"/>
                      </mxCell>
                      <mxCell id="5" value="" edge="1" parent="1" source="2" target="3">
                        <mxGeometry relative="1" as="geometry"/>
                      </mxCell>
                      <mxCell id="6" value="" edge="1" parent="1" source="3" target="4">
                        <mxGeometry relative="1" as="geometry"/>
                      </mxCell>
                    </root>
                  </mxGraphModel>`;

function getNodeColor(nodeType) {
  return paletteNodes.find(n => n.type === nodeType).fillColor;
}

function createPopupMenu(graph, menu, cell, evt) {
  if (cell == null) {
    menu.addItem('Print', null, function() { 
      var encoder = new mxCodec();
      var model = encoder.encode(graph.getModel());
      console.log(mxUtils.getXml(model));
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

class Graph extends Component {
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
    if (this.props.onSelectionChanged) {
      this.props.onSelectionChanged(cell ? cell.value : null);
    }
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
    graph.setPanning(true);

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
      // https://jgraph.github.io/mxgraph/docs/js-api/files/model/mxCell-js.html
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

    graph.getModel().addListener(mxEvent.CHANGE, (sender, evt) => {
      console.log(evt);
      // TODO(peleyal): The graph was updated, we need to update the state!
      /*
      var encoder = new mxCodec();
      var model = encoder.encode(graph.getModel());
      console.log(mxUtils.getXml(model));
      */
    });

    // These are required to be able to load the model from XML, see 
    // https://github.com/jgraph/mxgraph/issues/301#issuecomment-514284868
    // for more details.
    window['mxGraphModel'] = mxGraphModel;
    window['mxGeometry'] = mxGeometry;

    var doc = mxUtils.parseXml(sampleModel);
    var codec = new mxCodec(doc);
    codec.decode(doc.documentElement, graph.getModel());

    /*var parent = graph.getDefaultParent();
    graph.getModel().beginUpdate();
    try {
      // Insert the nodes.
      var v1 = graph.insertVertex(parent, null,
        'ETL', 20, 20, 80, 30, "fillColor=" + getNodeColor("etl"));
      var v2 = graph.insertVertex(parent, null,
        'Validation', 150, 20, 80, 30, "fillColor=" + getNodeColor("validation"));
      var v3 = graph.insertVertex(parent, null,
        'Release', 280, 20, 80, 30,"fillColor=" + getNodeColor("release"));

      // Insert the edges.
      graph.insertEdge(parent, null, '', v1, v2);
      graph.insertEdge(parent, null, '', v2, v3);
    }
    finally {
        graph.getModel().endUpdate();
    }*/

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

Graph.propTypes = {
 onSelectionChanged: PropTypes.func,
};


export default Graph;