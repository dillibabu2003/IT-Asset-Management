import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts';
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

const Pie3D = () => {

    const options = {
        chart: {
            type: 'pie',
            options3d: {
                enabled: true,
                alpha: 45,
                beta: 0
            }
        },
        title: {
            text: undefined
        },
        accessibility: {
            point: {
                valueSuffix: '%'
            }
        },
        tooltip: {
            pointFormat: '<b>({point.y}) {point.percentage:.0f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                depth: 50, // Enhances 3D look
                dataLabels: {
                    enabled: true,
                    format: '{point.name}'
                },
                showInLegend: true
            }
        },
        series: [{
            
            type: 'pie',
            data: data
        }]
    };
    
  return (
    <Box sx={{ width: '100%', height: 400 }}>
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
      />
    </Box>
  )
}

export default Pie3D