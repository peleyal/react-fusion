import React, { Component } from 'react';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import Graph from './component/Graph';
import NodeDetails from './nodes/NodeDetails';

const styles = {
  graphContainer: {
    height: '100%',
    width: '80%',
    float: 'left',
    marginRight: '5px',
  },
  top: {
    marginTop: '10px',
  },
}

class WorkflowForm extends Component {
  constructor(props) {
    super(props);
    this.onGraphSelectionChanged = this.onGraphSelectionChanged.bind(this);
    this.onGraphCreateChildNode = this.onGraphCreateChildNode.bind(this);
    this.onGraphDeleteNode = this.onGraphDeleteNode.bind(this);
    this.onGraphInsertEdge = this.onGraphInsertEdge.bind(this);
    this.onNodeTypeChange = this.onNodeTypeChange.bind(this);
    
    this.state = {
      selectedNode: null,
      model: { 
        workflow_id: "SDR pipeline",
        nodes: [
          {
            id: "0",
            type: "schedule",
            name: "Schedule",
            schedule: {
              pubSubTopic: "GCS_FUSION_CHANGED"
            },
            dependencies: [],
          },
          { 
            id: "1",
            type: "etl",
            name: "ETL",
            betl: {
              github_path: "https://github.com/study_x/tree/master/prod/etl"
            },
            dependencies: ["Schedule",],
          },
          { 
            id: "2",
            type: "validation",
            name: "Validation",
            validation: {
              dataset_format: "{{ ds_nodesh }}_%s"
            },
            dependencies: ["ETL",],
          },
          {
            id: "3",
            type: "release",
            name: "Release",
            release: {
              dataset: [
                "bigquery.googleapis.com/projects/study_x_prod/datasets/PRO",
                "bigquery.googleapis.com/projects/study_x_prod/datasets/CRF"
              ]
            },
            dependencies: ["Validation",],
          }
        ],
      }
    }
  }
  
  onNodeTypeChange(node, type) {
    let model = JSON.parse(JSON.stringify(this.state.model));
    for (let n of model.nodes) {
      if (n.id === node.id) {
        n.type = type;
        // TODO: clean other fields.
        this.setState({ model: model, selectedNode: n });
        return;
      }
    }
    this.setState({ selectedNode: null });
  }

  onGraphSelectionChanged(nodeId) {
    for (let node of this.state.model.nodes) {
      if (node.id === nodeId) {
        this.setState({ selectedNode: node });
        return;
      }
    }
    this.setState({ selectedNode: null });
  }

  onGraphDeleteNode(nodeId) {
    let model = JSON.parse(JSON.stringify(this.state.model));
    for (let index in model.nodes) {
      if (model.nodes[index].id === nodeId) {
        model.nodes.splice(index, 1);
        break;
      }
    }
    this.setState({ model: model });
  }

  onGraphCreateChildNode(nodeId) {
    let model = JSON.parse(JSON.stringify(this.state.model));
    // Set valid id.
    let id = 0;
    let parentNode;
    for (let n of model.nodes) {
      if (parseInt(n.id) > parseInt(id)) {
        id = parseInt(n.id);
      }
      if (nodeId === n.id) {
        parentNode = n;
      }
    }
    model.nodes.push(
      { type: "none",
        name: "new " + id,
        id: (id + 1).toString(),
        dependencies: [parentNode.name],
      });
    this.setState({ model: model });
  }
  onGraphInsertEdge(sourceNodeId, targetNodeId) {
    //alert(JSON.stringify(this.state.model));
    let model = JSON.parse(JSON.stringify(this.state.model));
    let targetNode;
    let sourceName;
    // TODO(peleyal): Add validation.
    for (let node of model.nodes) {
      if (node.id === sourceNodeId) {
        sourceName = node.name;
      } else if (node.id === targetNodeId) {
        targetNode = node;
      }
    }
    targetNode.dependencies.push(sourceName);
    this.setState({ model: model });
  }

  render() {
    return (
      <>
        <div className={this.props.classes.top}>
            <div className={this.props.classes.graphContainer}>
            <Graph  nodes={this.state.model.nodes}
                    onSelectionChanged={this.onGraphSelectionChanged}
                    onCreateChildNode={this.onGraphCreateChildNode}
                    onDeleteNode={this.onGraphDeleteNode}
                    onInsertEdge={this.onGraphInsertEdge} />
            </div>
            <NodeDetails node={this.state.selectedNode} onNodeTypeChange={this.onNodeTypeChange} />    
        </div>
      </>
    );
  }
}

export default withStyles(styles)(WorkflowForm);