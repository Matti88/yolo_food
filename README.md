# Recipe Detector
## Object Detection using YOLOv8 and Tensorflow.js to create recipe prompts for ChatGPT


---

Object Detection application right in your browser. Serving YOLOv8 in browser using tensorflow.js
with `webgl` backend.


## How it works
The steps are the following:
- First you select an Image to upload 📸
- The AI model will generate a prompt for you 🧠
- You can check, modify and copy to clipboard the prompt for ChatGPT for obtaining a custom recipies 🍱
- Last Step: prepare, enjoy and dont' waste food! ♻️


![How it works](public/HowITworks.png)



**Setup**

```bash
git clone https://github.com/Matti88/yolo_food.git
cd yolo_food
yarn install #Install dependencies
```

**Scripts**

```bash
yarn start --host # Start dev server
yarn build        # Build for productions
```

## Model

YOLOv8n model converted to tensorflow.js.

```
used model : yolov8n
size       : 13 Mb
```

**Use another model**

Use another YOLOv8 model.

1. Export YOLOv8 model to tfjs format. Read more on the [official documentation](https://docs.ultralytics.com/tasks/detection/#export)

   ```python
   from ultralytics import YOLO

   # Load a model
   model = YOLO("yolov8n.pt")  # load an official model

   # Export the model
   model.export(format="tfjs")
   ```

2. Copy `yolov8*_web_model` to `./public`
3. Update `modelName` in `App.jsx` to new model name
   ```jsx
   ...
   // model configs
   const modelName = "yolov8*"; // change to new model name
   ...
   ```
4. Done! 😊

**Note: Custom Trained YOLOv8 Models**

Please update `src/utils/labels.json` with your new classes.

## Reference

- https://github.com/ultralytics/ultralytics
- https://github.com/Hyuto/yolov8-onnxruntime-web
