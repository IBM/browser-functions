import {useState, useEffect} from 'react';

const PackagesPage = () => {
  const [dependencies, setDependencies] = useState({});
  const [devDependencies, setDevDependencies] = useState({});
  const [packageNames, setPackageNames] = useState('');
  const [isDevPackage, setIsDevPackage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const getDependencyData = async () => {
      try {
        const dependencyDataRaw = await fetch('/dependencies' + window.location.search);
        if (dependencyDataRaw.ok) {
          const dependencyData = await dependencyDataRaw.json();
          setDependencies(dependencyData.dependencies);
          setDevDependencies(dependencyData.devDependencies);
          setErrorMessage('');
        } else { // not ok response, currently sending back strings
          const text = await dependencyDataRaw.text();
          setErrorMessage(text);
        }
        
      } catch(err) {
        console.log(err);
        setErrorMessage("An error occured, see console");
      }
    }
    getDependencyData();
  }, []);

  const onDependencyAdd = async (event) => {
    event.preventDefault();
    let url = "/dependencies/add" + window.location.search

    const jsonData = {
      "pack-names": packageNames,
      "dev-check": isDevPackage
    };

    try {
      const dependencyDataRaw = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(jsonData),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      if (dependencyDataRaw.ok) {
        const dependencyData = await dependencyDataRaw.json();
        setDependencies(dependencyData.dependencies);
        setDevDependencies(dependencyData.devDependencies);
        setErrorMessage('');
      } else { // not ok response, currently sending back strings
        const text = await dependencyDataRaw.text();
        setErrorMessage(text);
      }
      
    } catch(err) {
      console.log(err);
      setErrorMessage("An error occured, see console");
      // set error text
    }
  };

  const dependenciesList = Object.entries(dependencies).map((dep, i) => <li key={i}>{dep}</li>)
  const devDependenciesList = Object.entries(devDependencies).map((dep, i) => <li key={i}>{dep}</li>)

  return (
    <>
      <h1>Package Manager</h1>
      <form onSubmit={onDependencyAdd}>
        <label>Package Names:</label>
        <input type="text" value={packageNames} onChange={(e) => setPackageNames(e.target.value)}/> <br/><br/>
        <label>Is Dev:</label>
        <input type="checkbox" checked={isDevPackage} onChange={(e) => setIsDevPackage(e.target.checked)}/> <br/><br/>
        <button>Add Package</button>
      </form>
      { errorMessage && <p>{errorMessage}</p> }
      <div>
        <h3>Dependencies</h3>
        <ul>{dependenciesList}</ul>
        <h3>Dev Dependencies</h3>
        <ul>{devDependenciesList}</ul>
      </div>
    </>
  );
  
}

export default PackagesPage;