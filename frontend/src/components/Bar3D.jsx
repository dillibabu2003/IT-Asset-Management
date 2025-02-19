import HighchartsReact from 'highcharts-react-official'
import Highcharts, { color } from 'highcharts';
import { Box } from '@mui/material';
import React from 'react'
import Highcharts3D from "highcharts/highcharts-3d";
Highcharts3D(Highcharts);
const data = [
    { name: 'Available', y: 1189, color: '#2e7d32' },
    { name: 'Checked Out', y: 793, color: '#ed6c02' },
    { name: 'Maintenance', y: 396, color: '#d32f2f' },
    { name: 'Other', y: 265, color: '#757575' },
  ];
const Bar3D = () => {
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