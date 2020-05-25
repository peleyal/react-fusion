import React, { Component } from 'react';
import { render } from 'react-dom';

import { withStyles } from '@material-ui/core/styles';

import Graph from './component/Graph';
import NodeDetails from './nodes/NodeDetails';
import WorkflowDetails from './WorkflowDetails';

const styles = {
  graphContainer: {
    height: '220px',
    float: 'left',
  },
  top: {
    marginTop: '10px',
  },
}

class WorkflowForm extends Component {
  constructor(props) {
    super(props);
    this.onGraphSelectionChanged = this.onGraphSelectionChanged.bind(this);
    this.state = {
      selectedNode: null
    }
  }
  onGraphSelectionChanged(node) {
    this.setState({ selectedNode: node });
  }
  render() {
    return (
      <>
        <div className={this.props.classes.top}>
            <div className={this.props.classes.graphContainer}>
            <Graph onSelectionChanged={this.onGraphSelectionChanged}/>
            </div>
            <WorkflowDetails />
        </div>
        <NodeDetails selectedNode={this.state.selectedNode} />
      </>
    );
  }
}

export default withStyles(styles)(WorkflowForm);