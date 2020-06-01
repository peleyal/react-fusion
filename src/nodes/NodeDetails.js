import React from 'react';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import NativeSelect from '@material-ui/core/NativeSelect';
import InputBase from '@material-ui/core/InputBase';


import NodeEtl from './NodeEtl'
import NodeValidation from './NodeValidation'
import NodeRelease from './NodeRelease'
import NodeSchedule from './NodeSchedule'

export default function NodeDetails(props) {
  const handleChange = event => {
    props.onNodeTypeChange(props.node, event.target.value);
  };

  let details;
  console.log(props.node != null ? "Node " + props.node.id + " is selected" : "NULL");
  if (props.node == null) {
    details = <div />
  } else if (props.node.type === "etl") {
    details = <NodeEtl />
  } else if (props.node.type === "validation") {
    details = <NodeValidation />
  } else if (props.node.type === "release") {
    details = <NodeRelease />
  } else if (props.node.type == "schedule") {
    details = <NodeSchedule /> 
  }
  return <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>Configure Node</Typography>
            <Typography color="textSecondary" gutterBottom>
              {props.node != null && 'Name: ' + props.node.name}
            </Typography>
            {props.node != null &&
            <FormControl>
              <InputLabel htmlFor="node-type">Node Type</InputLabel>
              <Select
                native
                value={props.node.type}
                onChange={handleChange}
                inputProps={{
                  name: 'node-type',
                  id: 'node-type',
                }}
              >
                <option value={"etl"}>ETL</option>
                <option value={"validation"}>Validation</option>
                <option value={"release"}>Release</option>
                <option value={"schedule"}>Schedule</option>
                <option value={"none"}>None</option>
              </Select>
            </FormControl>}
            {details}
          </CardContent>
        </Card>
}

