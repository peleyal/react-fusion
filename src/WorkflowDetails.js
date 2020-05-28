import React from 'react';

import Card from '@material-ui/core/Card';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';


export default function NodeDetails(props) {
  return <Card>
          <CardContent>
            <Typography gutterBottom>
              Workflow details
            </Typography>
            <FormGroup>
              <FormGroup row>
                <FormControlLabel control={<Checkbox name="pubsub" color="primary" />} label="Pubsub" />
                <TextField label="Topic Name" />
              </FormGroup>
              <FormControlLabel control={<Checkbox name="daily" color="primary" />} label="daily" />
              <FormControlLabel control={<Checkbox name="hourly" color="primary" />} label="hourly" />
              <FormGroup row>
                <FormControlLabel control={<Checkbox name="cron" color="primary" />} label="Cron" />
                <TextField label="* * * * *" />
              </FormGroup>
            </FormGroup>
          </CardContent>
        </Card>
}

