---
module: 3
position: 1
title: "Cameras + computer vision"
objective: "Use cameras for robot perception."
estimated_minutes: 5
---

# Cameras + computer vision

## Camera in ROS

```python
from sensor_msgs.msg import Image
from cv_bridge import CvBridge

bridge = CvBridge()

def callback(msg):
    cv_image = bridge.imgmsg_to_cv2(msg, "bgr8")
    # OpenCV operations
```

For: image processing.

## Detection (YOLO, Detectron2)

Run object detector per frame:
```python
from ultralytics import YOLO

model = YOLO('yolov8n.pt')
results = model(cv_image)
for box in results[0].boxes:
    cls = int(box.cls)
    conf = float(box.conf)
    xyxy = box.xyxy[0].tolist()
```

For: knowing what's in scene.

## Depth from RGB-D

Intel RealSense: aligned RGB + depth:
```python
# /camera/color/image_raw  ← RGB
# /camera/depth/image_raw  ← depth (mm or meters)
# Project 2D detection to 3D using depth + camera intrinsics
```

For: 3D object localization.

## Camera calibration

Intrinsic params: focal length, principal point, distortion. Calibrate with checkerboard:
```bash
ros2 run camera_calibration cameracalibrator --size 8x6 --square 0.108 image:=/camera/image_raw
```

For: accurate measurements.

## Extrinsic calibration

Camera relative to robot base. Use AprilTag / ArUco marker:
- Place marker at known robot pose.
- Detect marker in camera.
- Solve PnP for camera→base transform.

For: putting vision in robot frame.

## SAM, CLIP, foundation models

Modern: zero-shot:
- **SAM (Segment Anything).** Click anywhere → mask.
- **CLIP / OWL-ViT.** Text-based object search.
- **DINO / DINOv2.** Robust features.

Enables flexible robotics without per-object training.

For: scalable perception.

## Visual servoing

Control robot directly from image:
```
desired image features ← target
current image features ← camera
error → control loop → robot
```

Image-based visual servoing (IBVS): error in image plane.

For: precision manipulation.

## Mistakes to avoid

- **No calibration.** Wrong depth + pose.
- **Single frame.** Use temporal smoothing.
- **Ignoring lighting.** Performance drops.

## Summary

- cv_bridge translates ROS ↔ OpenCV.
- Detection (YOLO), depth (RGB-D), segmentation (SAM).
- Calibrate intrinsics + extrinsics.
- Foundation models (SAM, CLIP) enable zero-shot perception.

Next: LiDAR + point clouds.
