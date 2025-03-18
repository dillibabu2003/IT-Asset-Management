import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import { Box } from "@mui/material";
import Highcharts3D from "highcharts/highcharts-3d";
import PropTypes from "prop-types";
Highcharts3D(Highcharts);

const Pie3D = ({ data }) => {
  const options = {
    chart: {
      type: "pie",
      options3d: {
        enabled: true,
        alpha: 45,
        beta: 0,
      },
    },
    title: {
      text: undefined,
    },
    accessibility: {
      point: {
        valueSuffix: "%",
      },
    },
    tooltip: {
      pointFormat: "<b>({point.y}) {point.percentage:.0f}%</b>",
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: "pointer",
        depth: 50, // Enhances 3D look
        dataLabels: {
          enabled: true,
          format: "{point.name}",
        },
        showInLegend: true,
      },
    },
    series: [
      {
        type: "pie",
        data: data,
      },
    ],
    credits: {
      enabled: false,
    },
  };

  return (
    <Box sx={{ width: "100%", height: 400 }}>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </Box>
  );
};
Pie3D.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      y: PropTypes.number.isRequired,
      color: PropTypes.string,
    }),
  ).isRequired,
};

export default Pie3D;
