import { useState, useRef } from "react";

const ButtonHandler = ({ imageRef, canvasRef, detectCallbackImage  }) => {
  const [streaming, setStreaming] = useState(null); // streaming state
  const inputImageRef = useRef(null); // video input reference

  // closing image
  const closeImage = () => {
    detectCallbackImage("");
    const url = imageRef.current.src;
    imageRef.current.src = "#"; // restore image source
    URL.revokeObjectURL(url); // revoke url

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Clear the canvas by resetting its content to transparent
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    
    setStreaming(null); // set streaming to null
    inputImageRef.current.value = ""; // reset input image
    imageRef.current.style.display = "none"; // hide image
  };


  return (
    <div >
      {/* Image Handler */}
      <input
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const url = URL.createObjectURL(e.target.files[0]); // create blob url
          imageRef.current.src = url; // set video source
          imageRef.current.style.display = "block"; // show video
          setStreaming("image"); // set streaming to video
        }}
        ref={inputImageRef}
      />
      <button
        className="btn-container"

        onClick={() => {
          // if not streaming
          if (streaming === null) inputImageRef.current.click();
          // closing image streaming
          else if (streaming === "image") closeImage();
          else alert(`Can't handle more than 1 stream\nCurrently streaming : ${streaming}`); // if streaming video or webcam
        }}
      >
        {streaming === "image" ? "Reset" : "Load"} Image
      </button>
 
 
    </div>
  );
};

export default ButtonHandler;
