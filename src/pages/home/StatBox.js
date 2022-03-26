import React from "react";


const StatBox = ({ statName, statNumber, gradient }) => {

  return (
    <div className={`box ${gradient}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', height: '100%', 'paddingTop': '10px', flexDirection: 'column', width: '100%', paddingLeft: '10px' }}>
        <h6 className="box-text" style={{ fontWeight: 'bold' }}>{statName}</h6>
        <h4 className="box-text" style={{ fontWeight: 'bold' }}>{statNumber}</h4>
      </div>
    </div>
  )
}

export default StatBox;
