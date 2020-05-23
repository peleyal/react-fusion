import React, { Component } from 'react';

import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

export default function NodeDetails(props) {
  return <Card>
          <CardContent>
            <Typography gutterBottom>
              Workflow details
            </Typography>
          </CardContent>
        </Card>
}

