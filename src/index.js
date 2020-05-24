import React, { Component } from 'react';
import { render } from 'react-dom';

import { createStyles, makeStyles, Theme, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import purple from '@material-ui/core/colors/purple';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';

import Graph from './component/Graph';
import NodeDetails from './nodes/NodeDetails';
import WorkflowDetails from './WorkflowDetails';
import './style.css';

const useStyles = makeStyles((theme) =>
  createStyles({
    menuButton: {
      marginRight: theme.spacing(2),
    },
  }),
);

export default function FusionNavbar() {
  const classes = useStyles();

  // TODO(peleyal): Use grid here.
  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6">
            Beagle Fusion
          </Typography>
        </Toolbar>
      </AppBar>
    </div>
  );
}

const theme = createMuiTheme({
  palette: {
    primary: purple,
  },
  status: {
    danger: 'orange',
  },
});

class App extends Component {
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
      <MuiThemeProvider theme={theme}>
        <FusionNavbar />
        <div className="graph-container">
          <Graph onSelectionChanged={this.onGraphSelectionChanged}/>
        </div>
        <WorkflowDetails />
        <NodeDetails selectedNode={this.state.selectedNode} />
      </MuiThemeProvider>
    );
  }
}

render(<App />, document.getElementById('root'));
