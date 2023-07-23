import React, { useState, useEffect, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl"; // set backend to webgl
import Loader from "./components/loader";
import ButtonHandler from "./components/btn-handler";
import {  detectVideo , detectImage, renderFinalPromptCallback, generateASCIITable, transformPredictionToSummary} from "./utils/detect";
import "./style/App.css";
import CopyableTextArea from "./components/CopiableTextArea";
import WhatsAppShareLink from "./components/WhatAppShareLink";
import ButtonHandlerStream from "./components/ButtonHandlerStream";
import _, { isNull } from "lodash";
import labels from "./utils/labels.json";
import {findConsecutiveSimilarArrays} from "./utils/similarityWindow.js";
import AdSense from './components/AdSense';



const App = () => {
 
  const [loading, setLoading] = useState({ loading: true, progress: 0 }); // loading state
  const [model, setModel] = useState({
    net: null,
    inputShape: [1, 0, 0, 3],
  }); // init model & input shape
  const [prompt, setPrompt] = useState('');
  const [streamFood, setStreamFood] = useState([]);

  // references
  const imageRef = useRef(null);
  const cameraRef = useRef(null);
  const canvasRef = useRef(null);

  const CONSECUTIVE_DETECTION = 3;
  const CALLBACK_THROTTOL_IN_MS = 400;
  const THRESHOLD_ACCEPTANCE = 0.5;

  
  // callback for the Image
  const detectCallbackImage = (updatedPrompt) => { 
    setPrompt(renderFinalPromptCallback(updatedPrompt));
  };

  // callback for the stream 
  const detectCallbackStream = (classes_data, boxes_data, scores_data ) => {
    const threshold = THRESHOLD_ACCEPTANCE;
    // Filter objects based on the threshold
    const filteredObjects = [];
    for (let i = 0; i < scores_data.length; i++) {
      if (scores_data[i] >= threshold) {
        filteredObjects.push({
          box: boxes_data.slice(i * 4, i * 4 + 4),
          score: scores_data[i],
          class: classes_data[i],
        });
      }
    }
    
    if(filteredObjects.length> 0){

      if (streamFood.length >200)
      {
        // Update the streamFood state with the latest filteredObjects
        setStreamFood((prevStreamFood) => [...prevStreamFood.slice(50), filteredObjects]);        
      }
      else
      {
        // Update the streamFood state with the latest filteredObjects
        setStreamFood((prevStreamFood) => [...prevStreamFood, filteredObjects]);

      }

    }

  };

  // function for estimating the stream 
  const estimateObjectCountByClass = (stream) => { 
    // Create an object to store the count for each class
    const finding_first_good_result = findConsecutiveSimilarArrays(stream, CONSECUTIVE_DETECTION);
    if(_.isNull(finding_first_good_result)){
      return {}
    }
    const transformed_to_array_items = finding_first_good_result.map((obj) => obj.class )
    return transformed_to_array_items;
  };
  
  // callback for the stream 
  const detectCallbackStreamEnd = () => {
    // Update the streamFood state with the latest filteredObjects
    if (streamFood.length>0) {
      
      const ObjectIngredientCount = estimateObjectCountByClass(streamFood);
      const final_prompt = renderFinalPromptCallback(ObjectIngredientCount);
      if (ObjectIngredientCount.length === 0){
        setPrompt("");        
      }
      else {
        setPrompt(final_prompt);
      }

      // cancelling the previous stream
      setStreamFood([])

    }

  };
  

    // Apply throttle to the detectCallbackStream function to decrease its frequency
  const throttledDetectCallback = _.throttle(detectCallbackStream, CALLBACK_THROTTOL_IN_MS); // Adjust the throttle interval (e.g., 1000ms = 1 second)

  // model configsz```
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
    <div>
    <div className="App">
 
      {loading.loading && <Loader>Loading model... {(loading.progress * 100).toFixed(2)}%</Loader>}

      <AdSense client="ca-pub-7561589033942142" />

      <div className="header">
        <h1>🥗 Make me a Recipe with AI 🍝</h1>
        <p>
          Detect the food on your fridge ❄️ or dispensery 🫙 and gather ideas on what you can prepare for dinner 💡
        </p>
        <p>
          This is running YOLOv8 detection on your browser powered by <code>tensorflow.js</code>
        </p>
      </div>

      <div className="grid-container">
        <div className="content">
          <video
            autoPlay
            muted
            ref={cameraRef}
            onPlay={() => detectVideo(cameraRef.current, model, canvasRef.current, throttledDetectCallback)}
          />          
          <img
            src="#"
            ref={imageRef}
            onLoad={() => detectImage(imageRef.current, model, canvasRef.current, detectCallbackImage)}
          />
          <canvas width={model.inputShape[1]} height={model.inputShape[2]} ref={canvasRef} />
        </div>

        <div className="sidebar">
          <div>
          <ButtonHandler imageRef={imageRef}  cameraRef={cameraRef} canvasRef={canvasRef} detectCallbackImage={detectCallbackImage} />
          </div>
          <div>
          <ButtonHandlerStream cameraRef={cameraRef} canvasRef={canvasRef} detectCallbackStreamEnd={detectCallbackStreamEnd}  />
          </div>        
          <div>
            <CopyableTextArea text={prompt} />
          </div>  
          <div>
            <WhatsAppShareLink text={prompt} />
          </div>
        </div>
      </div>
    </div>
        <footer className="footer">
        <p>Made for saving 💸 by Matteo Montanari and Marco Pelletta</p>
        <p><a href="mailto:matteo.montanari25@gmail.com">Contact Us</a></p>
        <p><a href="public/PrivacyPolicy.html">Privacy Policy</a></p>
        </footer>
    </div>
  );
};

export default App;

