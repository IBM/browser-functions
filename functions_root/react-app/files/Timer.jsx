import React, {useState, useEffect } from './web_modules/react.js';
import moment from './web_modules/moment.js';

const Timer = () => {
  	const momentInitial = moment();
	const [time, setTime] = React.useState(momentInitial);
	React.useEffect(() => {
		setInterval(() => {
			setTime(moment());
		}, 1000);
	}, []);
 
	return <p>{time.format()}</p>
}

export default Timer;