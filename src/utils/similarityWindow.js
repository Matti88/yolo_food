// Threshold for similarity (adjust this value based on your requirements)
const similarityThreshold = 0.001;

// Function to calculate the average of an array of numbers
const calculateAverage = (arr) => arr.reduce((sum, value) => sum + value, 0) / arr.length;

// Function to check if the last 5 values in the stream are similar
const isSimilarWindow = (streamWindow) => {
  if (streamWindow.length === 5) {
    // Calculate the average of the last 5 x-coordinates
    const xValues = streamWindow.map((box) => box[0]);
    const xAverage = calculateAverage(xValues);

    // Calculate the average of the last 5 y-coordinates
    const yValues = streamWindow.map((box) => box[1]);
    const yAverage = calculateAverage(yValues);

    // Calculate the average of the last 5 heights
    const heightValues = streamWindow.map((box) => box[2]);
    const heightAverage = calculateAverage(heightValues);

    // Calculate the average of the last 5 widths
    const widthValues = streamWindow.map((box) => box[3]);
    const widthAverage = calculateAverage(widthValues);

    // Check if the variances are below the similarity threshold
    const xVariance = xValues.reduce((sum, value) => sum + Math.pow(value - xAverage, 2), 0) / 5;
    const yVariance = yValues.reduce((sum, value) => sum + Math.pow(value - yAverage, 2), 0) / 5;
    const heightVariance = heightValues.reduce((sum, value) => sum + Math.pow(value - heightAverage, 2), 0) / 5;
    const widthVariance = widthValues.reduce((sum, value) => sum + Math.pow(value - widthAverage, 2), 0) / 5;

    // If all variances are below the threshold, return true (similar)
    return (
      xVariance < similarityThreshold &&
      yVariance < similarityThreshold &&
      heightVariance < similarityThreshold &&
      widthVariance < similarityThreshold
    );
  }
  return false; // Not enough data points in the window yet
};


// Function to check if two arrays have the same number of objects ordered with the same `class` codes
const areArraysSimilar = (array1, array2) => {
  // Check if the arrays have the same length
  if (array1.length !== array2.length) {
    return false;
  }

  // Check if the `class` codes in both arrays match in the same order
  for (let i = 0; i < array1.length; i++) {
    if (array1[i].class !== array2[i].class) {
      return false;
    }
  }

  // If all checks pass, the arrays are similar
  return true;
};


// Function to find 5 consecutive similar arrays in a long array of arrays
export const findConsecutiveSimilarArrays = (arrayOfArrays, targetCount) => {
  let consecutiveCount = 0;
  let lastArray = null;

  for (let i = 0; i < arrayOfArrays.length - 1; i++) {
    const currentArray = arrayOfArrays[i];
    const nextArray = arrayOfArrays[i + 1];

    if (areArraysSimilar(currentArray, nextArray)) {
      consecutiveCount++;

      if (consecutiveCount === targetCount) {
        lastArray = nextArray;
        break;
      }
    } else {
      consecutiveCount = 0;
    }
  }

  return lastArray;
};

// {TESTS}
// // Example arrays
// const array1 = [
//   {
//     "box": {
//       "0": 301.653076171875,
//       "1": 0.34516143798828125,
//       "2": 479.8194580078125,
//       "3": 95.55033874511719
//     },
//     "score": 0.25352904200553894,
//     "class": 3
//   },
//   // Add more objects here
// ];

// const array2 = [
//   {
//     "box": {
//       "0": 302.6748046875,
//       "1": 0.3870697021484375,
//       "2": 480.479248046875,
//       "3": 96.35755920410156
//     },
//     "score": 0.4188705384731293,
//     "class": 3
//   },
//   // Add more objects here
// ];

// // Check if the arrays are similar
// const result = areArraysSimilar(array1, array2);
// console.log(result); // Output: true or false


