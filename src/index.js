import React from 'react';
import { render } from 'react-dom';

import { createStyles, makeStyles, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import purple from '@material-ui/core/colors/purple';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';

import WorkflowForm from './WorkflowForm';

const useStyles = makeStyles((theme) =>
  createStyles({
    menuButton: {
      marginRight: theme.spacing(2),
    },
  }),
);

function FusionNavbar() {
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

class CallApi extends React.Component {
  constructor(props) {
    super(props);
    this.state = {apiResponse: ""};
  }

  callApi() {
    fetch("http://localhost:9000/workflows")
      .then(res => res.text())
      .then(text => this.setState({apiResponse: text}));
  }

  componentWillMount() {
    this.callApi();
  }

  render() {
    return <div>API Response: {this.state.apiResponse}</div>;
  }
}

function App() {
  const theme = createMuiTheme({
    palette: {
      primary: purple,
    },
    status: {
      danger: 'orange',
    },
  });

  return (
    <MuiThemeProvider theme={theme}>
      <FusionNavbar />
      <WorkflowForm />
      <CallApi />
    </MuiThemeProvider>
  );
}

render(<App />, document.getElementById('root'));
