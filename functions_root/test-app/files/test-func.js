async function main() {
	const val = +window.localStorage.getItem('count') || 0;
  	window.localStorage.setItem('count', val+1)
  	return val;
}