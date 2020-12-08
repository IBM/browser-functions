//import React from 'react';

export default function App() {

	return (<div><h1>Test!</h1><Timer /></div>);
}

function Timer() {
	const [time, setTime] = React.useState(0);
	React.useEffect(() => {
		setInterval(() => {
			setTime(currTime => currTime + 1);
		}, 1000);
	}, []);

	return <p>{time}</p>
}