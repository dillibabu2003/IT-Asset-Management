import React from 'react'
import Pie3D from './Pie3D';
import Bar3D from './Bar3D';
import DashboardTable  from './DashboardTable';
const CustomVisualRender = ({element}) => {
    // console.log(IconMap.boxIcon);
    
  
    switch (element.type) {
        case "bar":
            return <Bar3D key={element.id} data={element.data}/>
        case "pie":
            return <Pie3D key={element.id} data={element.data}/>
        default:
            return <DashboardTable key={element.id} columns={element.columns} documents={element.data} />
    }
  
}

export default CustomVisualRender