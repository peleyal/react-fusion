import React from 'react';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

import NodeEtl from './NodeEtl'
import NodeValidation from './NodeValidation'
import NodeRelease from './NodeRelease'

export default function NodeDetails(props) {
  let details;
  if (props.selectedNode == null) {
    details = <div />
  } else if (props.selectedNode === "ETL") {
    details = <NodeEtl />
  } else if (props.selectedNode === "Validation") {
    details = <NodeValidation />
  } else if (props.selectedNode === "Release") {
    details = <NodeRelease />
  }
  return <Card style={{clear: "both"}}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              {props.selectedNode}
            </Typography>
            {details}
          </CardContent>
        </Card>
}

