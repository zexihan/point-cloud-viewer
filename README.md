# Point Cloud Annotator (in dev)

A web based annotation tool for 3D computer vision tasks. The tool is developed in the context of cashier-less convenience store research by Suning. It supports point clouds (.pcd) for the annotation task of **pose estimation**, **tracking**, and **reID**. It is a SPA developed with [React](http://reactjs.org) and [three.js](https://threejs.org/).

<img align="center" src="https://github.com/zexihan/point-cloud-annotator/blob/master/extra/Capture1.png">

For the annotation task of **detection** and **semantic segmentation**, please refer to [Semantic Segmentation Editor](https://github.com/Hitachi-Automotive-And-Industry-Lab/semantic-segmentation-editor) by Hitachi Automotive and Industry Lab.

## How to run

#### Install Node.js

Download a pre-built installer for your platform from https://nodejs.org/en/download/.

#### Download the repo

```
git clone https://github.com/zexihan/point-cloud-annotator.git
```

#### Start the application

```
cd point-cloud-annotator
npm install
npm start
```

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

## How to use

### Prepare data

```
point-cloud-annotator
├── public
│   ├── data
│   │   ├── bbox
│   │   ├── keypoints
│   │   ├── mark
│   │   ├── pcd
```

### Control

<div>
  axis helper:
  <font style="color:red">X</font>
  <font style="color:lime">Y</font>
  <font style="color:blue">Z</font>
</div>

left mouse button + move: Pan the map

right mouse button + move: Rotate the view

mouse wheel: Zoom up and down

a/d: Previous/Next frame

+/-: Increase/Decrease point size

c: Change color

f: Mark

### PCD support

 - Supported input PCD format: ASCII
 - Supported input fields: `x`, `y`, `z`, `rgb` (optional integer)