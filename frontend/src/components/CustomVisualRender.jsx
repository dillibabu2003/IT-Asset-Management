import React from 'react'
import Pie3D from './Pie3D';
import Bar3D from './Bar3D';
import DashboardTable  from './DashboardTable';
import { BACKGROUND_COLORS } from '../utils/constants';
import { convertSnakeCaseToPascaleCase } from '../utils/helperFunctions';
const CustomVisualRender = ({element}) => {
    
    function formattedDataForGraphs(data) {
        let formattedData = [];
        data.forEach((element) => {
            formattedData.push({
                name: convertSnakeCaseToPascaleCase(element._id),
                y: element.count,
                color: BACKGROUND_COLORS[Math.floor(Math.random() * BACKGROUND_COLORS.length)]
            })
        });
        console.log(formattedData);
        
        return formattedData;
    }
  
    switch (element.type) {
        case "bar":
            return <Bar3D key={element._id} data={formattedDataForGraphs(element.data)}/>
        case "pie":
            return <Pie3D key={element._id} data={formattedDataForGraphs(element.data)}/>
        default:
            return <DashboardTable key={element._id} columns={element.fields} documents={element.data} />
    }
  
}

export default CustomVisualRender