import HighchartsReact from 'highcharts-react-official'
import Highcharts, { color } from 'highcharts';
import { Box } from '@mui/material';
import React from 'react'
import Highcharts3D from "highcharts/highcharts-3d";
Highcharts3D(Highcharts);
const Bar3D = ({data,...props}) => {
  const options={
    chart: {
        renderTo: 'container',
        type: 'column',
        options3d: {
            enabled: true,
            alpha: 15,
            beta: 15,
            depth: 50,
            viewDistance: 25
        }
    },
    title:{
        text:undefined
    },
    xAxis: {
        type: 'category'
    },
    yAxis: {
        title: {
            enabled: false
        }
    },
    tooltip: {
        pointFormat: '<b>{point.y}</b>'
    },
    plotOptions: {

        showInLegend:false
    },
    series:[{
        data:data,
        colorByPoint:true,
        showInLegend:false
    }]
  }
  return (
    <Box sx={{ width: '100%', height: 400 }}>
        <HighchartsReact
            highcharts={Highcharts}
            options={options}
            />
    </Box>
    
  )
}

export default Bar3D