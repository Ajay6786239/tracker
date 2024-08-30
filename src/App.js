import React, { useState } from 'react';
import './App.css';

const PAT = 'ba78eb86cda4468782b0173302cb07d1'; // Replace with your Personal Access Token
const USER_ID = 'clarifai';       
const APP_ID = 'main';
const MODEL_ID = 'food-item-recognition';
const MODEL_VERSION_ID = '1d5fd481e0cf4826aa72ec3ff049e044';    

function App() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // New loading state

  const handleFileChange = (event) => {
    setImage(event.target.files[0]);
  };

  const recognizeFood = async () => {
    if (!image) return;

    setLoading(true); // Set loading to true before API request
    setError(null); // Reset error state

    const base64Image = await getBase64(image);

    const raw = JSON.stringify({
      "user_app_id": {
        "user_id": USER_ID,
        "app_id": APP_ID
      },
      "inputs": [
        {
          "data": {
            "image": {
              "base64": base64Image
            }
          }
        }
      ]
    });

    const requestOptions = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Key ' + PAT,
        'Content-Type': 'application/json'
      },
      body: raw
    };

    try {
      const response = await fetch(`https://api.clarifai.com/v2/models/${MODEL_ID}/versions/${MODEL_VERSION_ID}/outputs`, requestOptions);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setResult(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error recognizing food:', err);
    } finally {
      setLoading(false); // Set loading to false after API request
    }
  };

  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const renderResult = () => {
    if (!result || !result.outputs || !result.outputs.length) return null;

    const concepts = result.outputs[0].data.concepts;

    return (
      <div className="result">
        <h2>Recognition Result</h2>
        <ul>
          {concepts.map((concept, index) => (
            <li key={index} className={index === 0 ? 'highlight' : ''}>
              <strong>{concept.name}</strong>: {Math.round(concept.value * 100)}% confidence
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="App">
      <h1>Food Recognition App</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={recognizeFood}>Recognize Food</button>
      {loading && <div className="loading">Loading...</div>} {/* Loading indicator */}
      {error && <div className="error">Error: {error}</div>}
      {renderResult()}
    </div>
  );
}

export default App;
