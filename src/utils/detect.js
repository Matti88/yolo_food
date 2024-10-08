import * as tf from "@tensorflow/tfjs";
import {
  renderBoxes
} from "./renderBox";
import labels from "./labels.json";

const numClass = labels.length;
const ACCEPTANCE_DETECTION = 0.5;

/**
 * Render into an ASCII Table the data collected
 * @param {Array} indexes  data classs in an array array
 */
export function generateASCIITable(data) {
  // Check if the input is an object
  if (typeof data !== "object" || data === null) {
    throw new Error("Input must be an object.");
  }

  // Calculate the maximum width of each column
  const columnWidths = {
    Ingredient: "Ingredient".length,
    Count: "Count".length,
  };

  Object.entries(data).forEach(([className, count]) => {
    columnWidths.Ingredient = Math.max(columnWidths.Ingredient, className.length);
    columnWidths.Count = Math.max(columnWidths.Count, String(count).length);
  });

  // Create the header row
  const headerRow = `| ${"Ingredient".padEnd(columnWidths.Ingredient)} | ${"Count".padEnd(columnWidths.Count)} |\n`;

  // Create the separator row
  const separatorRow = `|${"-".repeat(columnWidths.Ingredient + 2)}|${"-".repeat(columnWidths.Count + 2)}|\n`;

  // Create the data rows
  const dataRows = Object.entries(data).map(([className, count]) => {
    const classNameCell = className.padEnd(columnWidths.Ingredient);
    const countCell = String(count).padEnd(columnWidths.Count);
    return `| ${classNameCell} | ${countCell} |\n`;
  }).join("");

  // Create the bottom line
  const bottomLine = `|${"-".repeat(columnWidths.Ingredient + 2)}|${"-".repeat(columnWidths.Count + 2)}|\n`;

  // Combine all rows to form the table
  const asciiTable = bottomLine + headerRow + separatorRow + dataRows + bottomLine;

  return asciiTable;
};

/**
 * Render the prompt of the prediction
 * @param {Array} classes_data class array
 */
export const renderPrompt = (classes_data) => {
  let chatGPTprompt = "Make a recipe with the following ingredients";
  chatGPTprompt += `\n`;
  chatGPTprompt += "```\n" + classes_data + "```";
  return chatGPTprompt;
};

/**
 * Transform the data structure of the prediction into a dictionary
 * @param {Array} classes_data class array
 */
export const transformPredictionToSummary = (classes_data) => {
  // an oject with all the inventory of ingredients
  const classes_to_count = {};
  for (const code of classes_data) {
    const name = labels[code];
    classes_to_count[name] = (classes_to_count[name] || 0) + 1;
  }
  return classes_to_count;
};

/**
 * Getting the an array of classe of data and transforming them into a final prompt
 * @param {Array} 
 */
export const renderFinalPromptCallback = (classesOfData) => {
  
  if (classesOfData.length > 0) {
    const first_level = transformPredictionToSummary(classesOfData);
    const second_level = generateASCIITable(first_level);
    const third_level = renderPrompt(second_level);
    return third_level;
  } else {

    return "";
  }

};

/**
 * Preprocess image / frame before forwarded into the model
 * @param {HTMLVideoElement|HTMLImageElement} source
 * @param {Number} modelWidth
 * @param {Number} modelHeight
 * @returns input tensor, xRatio and yRatio
 */
const preprocess = (source, modelWidth, modelHeight) => {
  let xRatio, yRatio; // ratios for boxes

  const input = tf.tidy(() => {
    const img = tf.browser.fromPixels(source);

    // padding image to square => [n, m] to [n, n], n > m
    const [h, w] = img.shape.slice(0, 2); // get source width and height
    const maxSize = Math.max(w, h); // get max size
    const imgPadded = img.pad([
      [0, maxSize - h], // padding y [bottom only]
      [0, maxSize - w], // padding x [right only]
      [0, 0],
    ]);

    xRatio = maxSize / w; // update xRatio
    yRatio = maxSize / h; // update yRatio

    return tf.image
      .resizeBilinear(imgPadded, [modelWidth, modelHeight]) // resize frame
      .div(255.0) // normalize
      .expandDims(0); // add batch
  });

  return [input, xRatio, yRatio];
};

/**
 * Function run inference and do detection from source.
 * @param {HTMLImageElement|HTMLVideoElement} source
 * @param {tf.GraphModel} model loaded YOLOv8 tensorflow.js model
 * @param {HTMLCanvasElement} canvasRef canvas reference
 * @param {Array} an array of callback functions to run after detection process
 */
export const detect = async (source, model, canvasRef, callbacks = []) => {

  const [modelWidth, modelHeight] = model.inputShape.slice(1, 3); // get model width and height

  tf.engine().startScope(); // start scoping tf engine
  const [input, xRatio, yRatio] = preprocess(source, modelWidth, modelHeight); // preprocess image

  const res = model.net.execute(input); // inference model
  const transRes = res.transpose([0, 2, 1]); // transpose result [b, det, n] => [b, n, det]
  const boxes = tf.tidy(() => {
    const w = transRes.slice([0, 0, 2], [-1, -1, 1]); // get width
    const h = transRes.slice([0, 0, 3], [-1, -1, 1]); // get height
    const x1 = tf.sub(transRes.slice([0, 0, 0], [-1, -1, 1]), tf.div(w, 2)); // x1
    const y1 = tf.sub(transRes.slice([0, 0, 1], [-1, -1, 1]), tf.div(h, 2)); // y1
    return tf
      .concat(
        [
          y1,
          x1,
          tf.add(y1, h), //y2
          tf.add(x1, w), //x2
        ],
        2
      )
      .squeeze();
  }); // process boxes [y1, x1, y2, x2]

  const [scores, classes] = tf.tidy(() => {
    const rawScores = transRes.slice([0, 0, 4], [-1, -1, numClass]).squeeze(); // class scores
    return [rawScores.max(1), rawScores.argMax(1)];
  }); // get max scores and classes index



  const nms = await tf.image.nonMaxSuppressionAsync(boxes, scores, 500, 0.45, ACCEPTANCE_DETECTION); // NMS to filter boxes

  const boxes_data = boxes.gather(nms, 0).dataSync(); // indexing boxes by nms index
  const scores_data = scores.gather(nms, 0).dataSync(); // indexing scores by nms index
  const classes_data = classes.gather(nms, 0).dataSync(); // indexing classes by nms index

  renderBoxes(canvasRef, boxes_data, scores_data, classes_data, [xRatio, yRatio]); // render boxes


  // Execute all the callbacks with the filtered objects
  callbacks.forEach((callback) => callback(classes_data, boxes_data, scores_data));

  tf.dispose([res, transRes, boxes, scores, classes, nms]); // clear memory
  tf.engine().endScope(); // end of scoping
};

/**
 * Function to detect video from every source.
 * @param {HTMLVideoElement} vidSource video source
 * @param {tf.GraphModel} model loaded YOLOv8 tensorflow.js model
 * @param {HTMLCanvasElement} canvasRef canvas reference
 * @param {VoidFunction} callback function to run after detection process
 */
export const detectVideo = (vidSource, model, canvasRef, callback = () => {}) => {


  /**
   * Function to detect every frame from video
   */
  const detectFrame = async () => {
    if (vidSource.videoWidth === 0 && vidSource.srcObject === null) {
      const ctx = canvasRef.getContext("2d");
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // clean canvas
      return; // handle if source is closed
    }

    detect(vidSource, model, canvasRef, [
      () => {
        requestAnimationFrame(detectFrame)
      },
      callback
    ]);
  };

  detectFrame(); // initialize to detect every frame
};


/**
 * Function run inference and do detection from source.
 * @param {HTMLImageElement|HTMLVideoElement} source
 * @param {tf.GraphModel} model loaded YOLOv8 tensorflow.js model
 * @param {HTMLCanvasElement} canvasRef canvas reference
 * @param {VoidFunction} callback function to run after detection process
 */
export const detectImage = async (source, model, canvasRef, callback = () => {}) => {

  detect(source, model, canvasRef, [callback]);

};