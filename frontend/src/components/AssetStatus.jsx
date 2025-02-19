import React from 'react';
import { Box } from '@mui/material';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const data = [
  { name: 'Available', y: 1189, color: '#2e7d32' },
  { name: 'Checked Out', y: 793, color: '#ed6c02' },
  { name: 'Maintenance', y: 396, color: '#d32f2f' },
  { name: 'Other', y: 265, color: '#757575' },
];

function AssetStatus() {
  const options = {
    chart: {
      type: 'pie',
      height: 300,
      backgroundColor: 'transparent'
    },
    title: {
      text: undefined
    },
    plotOptions: {
      pie: {
        innerSize: '0%',
        borderWidth: 0,
        borderRadius: 4,
        dataLabels: {
          enabled: false
        },
        states: {
          hover: {
            brightness: 0.1
          }
        },
        showInLegend: true
      }
    },
    tooltip: {
      pointFormat: '{point.name}: <b>{point.percentage:.1f}%</b>'
    },
    series: [{
      type: 'pie',
      data: data
    }],
    credits: {
      enabled: false
    },
    legend: {
      align: 'right',
      verticalAlign: 'middle',
      layout: 'vertical',
      itemStyle: {
        fontWeight: 'normal'
      }
    }
  };

  return (
    <Box sx={{ width: '100%', height: 300 }}>
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
      />
    </Box>
  );
}

export default AssetStatus;