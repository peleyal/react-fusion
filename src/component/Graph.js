import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import './Graph.css';
import { mxCodec, mxCellTracker, mxHierarchicalLayout, mxChildChange, mxConnectionHandler, mxCellEditor, mxCellOverlay, mxImage, mxClient, mxEvent, mxGraph, mxUtils, mxGraphModel, mxGeometry, mxLayoutManager, mxCompactTreeLayout, mxPoint, mxConstants, mxEdgeStyle } from "mxgraph-js";

var possibleNodes = [
  {"type": "etl",        "fillColor": "blue",},
  {"type": "validation", "fillColor": "red",},
  {"type": "release",    "fillColor": "purple",},
  {"type": "schedule",   "fillColor": "yellow",},
  {"type": "none",       "fillColor": "white",},
];

// TODO(peleyal): Avoid cyclic graph - https://screenshot.googleplex.com/EQ4zawrmRUs.
function getNodeColor(nodeType) {
  return possibleNodes.find(n => n.type === nodeType).fillColor;
}

function createPopupMenu(graph, menu, cell, evt) {
  menu.addItem('Print', null, function() { 
    var encoder = new mxCodec();
    var model = encoder.encode(graph.getModel());
    console.log(mxUtils.getXml(model));
  });
  menu.addItem('Zoom In', null, () => graph.zoomIn());
  menu.addItem('Zoom Out', null, () => graph.zoomOut());
  menu.addItem('Fit', null, () => graph.fit());
  if (cell != null) {  
    // TODO(peleyal): Remove.
    // TODO(peleyal): Add a way to delete an edge (and store in the state).
    if (graph.isEnabled()) {
      menu.addItem('Delete', null, function() { 
        graph.removeCells([cell]);
      });
    }
  }
}

class Graph extends Component {
  constructor(props) {
    super(props);
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
      this.props.onSelectionChanged(cell ? cell.getAttribute('id', '') : null);
    }
  }

  initGraph() {
    var container = ReactDOM.findDOMNode(this.refs.graph);
    // Checks if the browser is supported.
    if (!mxClient.isBrowserSupported()) {
      mxUtils.error("Browser is not supported!", 200, false);
      return;
    }

    mxConnectionHandler.prototype.connectImage = new mxImage('images/icons8-down-arrow.png', 10, 30);

    // Creates the graph inside the given container.
    var graph = new mxGraph(container);
    // TODO(peleyal: Support view only. graph.setEnabled(false);
    
    // Disables the built-in context menu
    mxEvent.disableContextMenu(container);
		graph.popupMenuHandler.factoryMethod = function(menu, cell, evt) {
			return createPopupMenu(graph, menu, cell, evt);
    };
    
    graph.getSelectionModel().addListener(mxEvent.CHANGE, (sender, evt) => {
      console.log("selection; mxEvent.CHANGE : ");
      console.log(evt);
      var added = evt.getProperty('added'); // TODO(peleyal): It seems like this containts actually the removed items.
      if (added && added.length > 0) {
        // ACT as removed
        let removedCell = added[0];
        if (removedCell.isVertex()) {
          graph.removeCellOverlays(removedCell);
        }
      }
      var removed = evt.getProperty('removed');
      if (removed && removed.length > 0) {
        // ACT as added
        let addedCell = removed[0];
        if (addedCell.isVertex()) {
          // TODO(peleyal): Don't add delete for root.
          this.addOverlays(graph, addedCell, true);
        }
      }
      // TODO(peleyal): Maybe change overlays based on selection?
      this.selectionChange();
    });
    graph.setConnectable(true);
    graph.setPanning(true);
    graph.setCellsMovable(false);
    graph.setAutoSizeCells(true);
    graph.setAllowDanglingEdges(false);

    var layout = new mxCompactTreeLayout(graph, false);
    layout.useBoundingBox = false;
    layout.edgeRouting = false;
    layout.levelDistance = 50;
    layout.nodeDistance = 25;

    // Allows the layout to move cells even though cells
    // aren't movable in the graph
    layout.isVertexMovable = cell => true;
    var layoutMgr = new mxLayoutManager(graph);
    layoutMgr.getLayout = cell => layout;

    mxConstants.VERTEX_SELECTION_COLOR = '#0000AA';
    mxConstants.VERTEX_SELECTION_STROKEWIDTH = 2;
    mxConstants.VERTEX_SELECTION_DASHED = false;

    mxConstants.EDGE_SELECTION_STROKEWIDTH = 2;
    mxConstants.EDGE_SELECTION_COLOR = '#0000AA';
    mxConstants.EDGE_SELECTION_DASHED = false;

    var style = graph.getStylesheet().getDefaultVertexStyle();
    style[mxConstants.STYLE_SHAPE] = 'label';
    
    style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
    style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
    
    style[mxConstants.STYLE_GRADIENTCOLOR] = '#d3dfeb';
    style[mxConstants.STYLE_STROKECOLOR] = '#5d65df';
    style[mxConstants.STYLE_FILLCOLOR] = '#adc5ff';
    
    style[mxConstants.STYLE_FONTCOLOR] = '#1d258f';
    style[mxConstants.STYLE_FONTFAMILY] = 'Verdana';
    style[mxConstants.STYLE_FONTSIZE] = '16';
    style[mxConstants.STYLE_FONTSTYLE] = '2';
    
    style[mxConstants.STYLE_SHADOW] = '1';
    style[mxConstants.STYLE_ROUNDED] = '1';
    style[mxConstants.STYLE_GLASS] = '1';
    
    style[mxConstants.STYLE_IMAGE] = 'editors/images/dude3.png';
    style[mxConstants.STYLE_IMAGE_WIDTH] = '100';
    style[mxConstants.STYLE_IMAGE_HEIGHT] = '30';
    style[mxConstants.STYLE_SPACING] = 8;
    style[mxConstants.STYLE_RESIZABLE] = 0; // disable resize

    // Sets the default style for edges
    style = graph.getStylesheet().getDefaultEdgeStyle();
    style[mxConstants.STYLE_ENTRY_X] = 0.5; // center
    style[mxConstants.STYLE_EXIT_X] = 0.5; // center
    style[mxConstants.STYLE_ENTRY_Y] = 0; // top
    style[mxConstants.STYLE_EXIT_Y] = 1; // bottom
    style[mxConstants.STYLE_ROUNDED] = true;
    style[mxConstants.STYLE_RESIZABLE] = 0; // disable resize

    /*style[mxConstants.STYLE_ROUNDED] = true;
    style[mxConstants.STYLE_STROKEWIDTH] = 3;
    style[mxConstants.STYLE_EXIT_X] = 0.5; // center
    style[mxConstants.STYLE_EXIT_Y] = 1.0; // bottom
    style[mxConstants.STYLE_EXIT_PERIMETER] = 0; // disabled
    style[mxConstants.STYLE_ENTRY_X] = 0.5; // center
    style[mxConstants.STYLE_ENTRY_Y] = 0; // top
    style[mxConstants.STYLE_ENTRY_PERIMETER] = 0; // disabled*/
    
    graph.convertValueToString = cell => {
      if (mxUtils.isNode(cell.value)) {
        return cell.getAttribute('name', '')
      }
    };

    // Disable editing the name of the node from the graph.
    mxCellEditor.prototype.startEditing = (cell, trigger) => {};

    this.graph = graph;

    this.updateGraph();

    graph.getModel().addListener(mxEvent.CHANGE, (sender, evt) => {
      console.log("model; mxEvent.CHANGE : ");
      console.log(evt);
    });

    window['mxGraphModel'] = mxGraphModel;
    window['mxGeometry'] = mxGeometry;
    mxConnectionHandler.prototype.insertEdge = (parent, id, value, source, target, style) => {
      this.props.onInsertEdge(source.getAttribute("id"), target.getAttribute("id"));
    };
  }

  addOverlays(graph, cell, addDeleteIcon) {
    if (!graph.isEnabled()) return;

    var overlay = new mxCellOverlay(new mxImage('images/icons8-add.png', 24, 24), 'Add');
    overlay.offset = new mxPoint(15,0);
    overlay.cursor = 'hand';
    overlay.align = mxConstants.ALIGN_RIGHT;
    overlay.addListener(mxEvent.CLICK, mxUtils.bind(this, function(sender, evt) {
      this.props.onCreateChildNode(cell.getAttribute('id'));
    }));
    
    graph.addCellOverlay(cell, overlay);

    if (addDeleteIcon) {
      overlay = new mxCellOverlay(new mxImage('images/icons8-remove.png', 24, 24), 'Delete');
      overlay.offset = new mxPoint(15,0);
      overlay.cursor = 'hand';
      overlay.align = mxConstants.ALIGN_RIGHT;
      overlay.verticalAlign = mxConstants.ALIGN_TOP;
      overlay.addListener(mxEvent.CLICK, mxUtils.bind(this, function(sender, evt) {
        this.props.onDeleteNode(cell.getAttribute('id'));
      }));
    
      graph.addCellOverlay(cell, overlay);
    }
  }

  updateGraph() {
    console.log("Updating the graph...");
    var parent = this.graph.getDefaultParent();
    let graph = this.graph;

    let previousSelectionId = this.graph.getSelectionCell() ? this.graph.getSelectionCell().getAttribute('id', '') : null;
    let previousSelection = null;
    
    this.graph.removeCells(this.graph.getChildVertices(this.graph.getDefaultParent()))
    this.graph.getModel().beginUpdate();


    try {
      // Adds the root vertex of the tree
      let nodeNameToVertex = new Map();
      // TODO(peleyal): Support 1:N as well.
      let sourceNodeNameToTargetNode = new Map();
      for (let node of this.props.nodes) {
        var doc = mxUtils.createXmlDocument();
        var metadata = doc.createElement('metadata')
        metadata.setAttribute('name', node.name);
        metadata.setAttribute('type', node.type);
        metadata.setAttribute('id', node.id);
        let vertex;
        if (nodeNameToVertex.size == 0) {
          // Root node, the following is good when choosing a tree representation
          var w = graph.container.offsetWidth;
          vertex = graph.insertVertex(parent, 'treeRoot',
            metadata, w/2 - 80, 20, 160, 60, "fillColor=" + getNodeColor(node.type));
          graph.updateCellSize(vertex);
          //this.addOverlays(graph, vertex, false);
          /*vertex = this.graph.insertVertex(parent, null,
            metadata, 0, 0, 0, 0, "fillColor=" + getNodeColor(node.type))
          this.addOverlays(graph, vertex, false);*/
        } else {
          vertex = this.graph.insertVertex(parent, null,
            metadata, 0, 0, 0, 0, "fillColor=" + getNodeColor(node.type))
          //this.addOverlays(graph, vertex, true);
        }
        nodeNameToVertex.set(node.name, vertex);
        if (sourceNodeNameToTargetNode.has(node.name)) {
          graph.insertEdge(parent, null, '', vertex, sourceNodeNameToTargetNode.get(node.name));  
        }

        for (let dependency of node.dependencies) {
          if (!nodeNameToVertex.has(dependency)) {
            // TODO(peleyal): The source of the connection wasn't created yet. Add to 
            // sourceNodeNameToTargetNode, so the connection will be created when the source
            // vertex will be created.
            sourceNodeNameToTargetNode.set(dependency, vertex);
            continue;
          }

          graph.insertEdge(parent, null, '', nodeNameToVertex.get(dependency), vertex)
          /*var edge = graph.insertEdge(parent, null, '', nodeNameToVertex.get(dependency), vertex);
          var overlay = new mxCellOverlay(new mxImage('images/icons8-remove.png', 24, 24), 'Delete');
          overlay.offset = new mxPoint(15,15);
          overlay.cursor = 'hand';
          overlay.align = mxConstants.ALIGN_RIGHT;
          overlay.addListener(mxEvent.CLICK, mxUtils.bind(this, function(sender, evt) {
            //this.props.onCreateChildNode();
          }));
          graph.addCellOverlay(edge, overlay);*/
        }

        var geometry = this.graph.getModel().getGeometry(vertex);
        var size = this.graph.getPreferredSizeForCell(vertex);
        geometry.width = size.width;
        geometry.height = size.height;

        // Select it agin...
        if (previousSelectionId == node.id) {
          previousSelection = vertex;
        }
      }
    } finally {
        this.graph.getModel().endUpdate();
    }

    //var layout = new mxHierarchicalLayout(graph);
    //layout.execute((graph.getDefaultParent()));
    //graph.fit();    

    this.graph.setSelectionCell(previousSelection);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.nodes.length !== this.props.nodes.length) {
      this.updateGraph();
    } else {
      for (let i in this.props.nodes) {
        if (prevProps.nodes[i].name !== this.props.nodes[i].name ||
          prevProps.nodes[i].type !== this.props.nodes[i].type ||
          prevProps.nodes[i].dependencies.length !== this.props.nodes[i].dependencies.length) {
          this.updateGraph();
          return;
        }
      }
    }
  }

  render() {
    return (
      <div className="graph">
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