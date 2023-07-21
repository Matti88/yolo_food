import { useState, useRef } from "react";
import { Webcam } from "../utils/webcam";

const ButtonHandlerStream = ({ cameraRef, canvasRef, detectCallbackStreamEnd  }) => {
  const [streaming, setStreaming] = useState(null); // streaming state
  const inputcameraRef = useRef(null); // video input reference
  const inputVideoRef = useRef(null); // video input reference
  const webcam = new Webcam(); // webcam handler

  // closing image
  const closeImage = () => {
 
    const url = cameraRef.current.src;
    cameraRef.current.src = "#"; // restore image source
    URL.revokeObjectURL(url); // revoke url

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Clear the canvas by resetting its content to transparent
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    
    setStreaming(null); // set streaming to null
    inputcameraRef.current.value = ""; // reset input image
    cameraRef.current.style.display = "none"; // hide image

    detectCallbackStreamEnd();
  };


  return (
    <div >
      {/* Webcam Handler */}
      <input
        type="file"
        accept="video/*"
        style={{ display: "none" }}
        onChange={(e) => {
          if (streaming === "image") closeImage(); // closing image streaming
          const url = URL.createObjectURL(e.target.files[0]); // create blob url
          videoRef.current.src = url; // set video source
          videoRef.current.addEventListener("ended", () => closeVideo()); // add ended video listener
          videoRef.current.style.display = "block"; // show video
          setStreaming("video"); // set streaming to video
        }}
        ref={inputVideoRef}
      />
      <button
        onClick={() => {
          // if not streaming
          if (streaming === null || streaming === "image") {
            // closing image streaming
            if (streaming === "image") closeImage();
            webcam.open(cameraRef.current); // open webcam
            cameraRef.current.style.display = "block"; // show camera
            setStreaming("camera"); // set streaming to camera
          }
          // closing video streaming
          else if (streaming === "camera") {
            detectCallbackStreamEnd();
            webcam.close(cameraRef.current);
            cameraRef.current.style.display = "none";
            setStreaming(null);
          } else alert(`Can't handle more than 1 stream\nCurrently streaming : ${streaming}`); // if streaming video
        }}
      >
        {streaming === "camera" ? "Close" : "Open"} Webcam
      </button>
 
 
    </div>
  );
};

export default ButtonHandlerStream;
