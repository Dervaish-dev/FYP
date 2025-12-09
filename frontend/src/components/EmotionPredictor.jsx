import React, { useState } from 'react';

const EmotionPredictor = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [backendUrl, setBackendUrl] = useState("http://localhost:8000"); // Default to FastAPI
    const [modelType, setModelType] = useState("h5"); // h5 or tflite

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
        setPrediction(null);
        setError(null);

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }
    };

    const handlePredict = async () => {
        if (!selectedFile) {
            setError("Please select an image first.");
            return;
        }

        setLoading(true);
        setError(null);
        setPrediction(null);

        try {
            const formData = new FormData();
            formData.append("image", selectedFile);

            // Construct Endpoint
            // If using Node.js backend (port 3000), TFLite might be unavailable.
            // Url structure: {base}/predict/{type}
            const endpoint = `${backendUrl}/predict/${modelType}`;

            const response = await fetch(endpoint, {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || errData.error || "Prediction failed");
            }

            const data = await response.json();
            setPrediction(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Emotion Recognition</h2>

            {/* Configuration */}
            <div className="space-y-2">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Backend URL</label>
                    <select
                        value={backendUrl}
                        onChange={(e) => setBackendUrl(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
                    >
                        <option value="http://localhost:8000">FastAPI (Python) - Port 8000</option>
                        <option value="http://localhost:3000">Express (Node.js) - Port 3000</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Model Type</label>
                    <div className="mt-1 flex space-x-4">
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                className="form-radio"
                                name="modelType"
                                value="h5"
                                checked={modelType === "h5"}
                                onChange={(e) => setModelType(e.target.value)}
                            />
                            <span className="ml-2">H5 Keras</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                className="form-radio"
                                name="modelType"
                                value="tflite"
                                checked={modelType === "tflite"}
                                onChange={(e) => setModelType(e.target.value)}
                            />
                            <span className="ml-2">TFLite</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Image Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-indigo-50 file:text-indigo-700
                        hover:file:bg-indigo-100"
                />
            </div>

            {/* Preview */}
            {preview && (
                <div className="mt-4">
                    <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-md" />
                </div>
            )}

            {/* Predict Button */}
            <button
                onClick={handlePredict}
                disabled={loading || !selectedFile}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                    ${loading || !selectedFile ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}
            >
                {loading ? 'Predicting...' : 'Predict Emotion'}
            </button>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            {/* Icon */}
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Prediction Result */}
            {prediction && (
                <div className="bg-green-50 rounded-md p-4 mt-4">
                    <h3 className="text-lg font-medium text-green-800">Result: {prediction.label}</h3>
                    <div className="mt-2 text-sm text-green-700">
                        <p>Confidence: {(prediction.confidence * 100).toFixed(2)}%</p>
                    </div>
                    {/* Optional: Raw Probabilities Debug */}
                    <details className="mt-2 text-xs text-gray-500">
                        <summary>Raw Probabilities</summary>
                        <pre>{JSON.stringify(prediction.raw, null, 2)}</pre>
                    </details>
                </div>
            )}
        </div>
    );
};

export default EmotionPredictor;
