import React, { useState, useEffect, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl"; // set backend to webgl
import Loader from "./components/loader";
import ButtonHandler from "./components/btn-handler";
import { detect } from "./utils/detect";
import "./style/App.css";
import CopyableTextArea from "./components/CopiableTextArea"

const App = () => {
  const [loading, setLoading] = useState({ loading: true, progress: 0 }); // loading state
  const [model, setModel] = useState({
    net: null,
    inputShape: [1, 0, 0, 3],
  }); // init model & input shape
  const [prompt, setPrompt] = useState('');

  // references
  const imageRef = useRef(null);
  const cameraRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const promptRef = useRef(null);

  // callback
  const detectCallback = (updatedPrompt) => {
    setPrompt(updatedPrompt);
  };

  // model configs
  const modelName = "yolov8n";

  useEffect(() => {
    tf.ready().then(async () => {
      const yolov8 = await tf.loadGraphModel(
        `${window.location.href}/${modelName}_web_model/model.json`,
        {
          onProgress: (fractions) => {
            setLoading({ loading: true, progress: fractions }); // set loading fractions
          },
        }
      ); // load model

      // warming up model
      const dummyInput = tf.ones(yolov8.inputs[0].shape);
      const warmupResults = yolov8.execute(dummyInput);

      setLoading({ loading: false, progress: 1 });
      setModel({
        net: yolov8,
        inputShape: yolov8.inputs[0].shape,
      }); // set model & input shape

      tf.dispose([warmupResults, dummyInput]); // cleanup memory
    });
  }, []);

  return (
    <div className="App">
      {loading.loading && <Loader>Loading model... {(loading.progress * 100).toFixed(2)}%</Loader>}

      <div className="header">
        <h1>🥗 Make ma a Recipe with AI 🍝</h1>
        <p>
          Detect the food on your fridge ❄️ or dispensery 🫙 and gather ideas on what you can prepare for dinner 💡
        </p>
        <p>
            This is running YOLOv8 detection on your browser powered by <code>tensorflow.js</code>
        </p>
      </div>

      <div className="content">
        <img
          src="#"
          ref={imageRef}
          onLoad={() => detect(imageRef.current, model, canvasRef.current, detectCallback)}
        />
        <canvas width={model.inputShape[1]} height={model.inputShape[2]} ref={canvasRef} />
      </div>
      <ButtonHandler imageRef={imageRef} cameraRef={cameraRef} videoRef={videoRef} detectCallback={detectCallback} />
      <div>
        <p>
        {prompt}
        </p>
      </div>
      <div>
      <CopyableTextArea text={prompt} />
      </div>
    </div>
  );
};

export default App;
