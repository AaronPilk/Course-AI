---
module: 3
position: 2
title: "LiDAR + point clouds"
objective: "Process 3D laser data."
estimated_minutes: 5
---

# LiDAR + point clouds

## LiDAR in ROS

```
/scan         sensor_msgs/LaserScan      (2D LiDAR)
/points       sensor_msgs/PointCloud2    (3D LiDAR)
```

```python
from sensor_msgs.msg import PointCloud2
import sensor_msgs_py.point_cloud2 as pc2

points = list(pc2.read_points(msg, field_names=('x','y','z'), skip_nans=True))
```

For: 3D depth data.

## Point cloud library (PCL)

```python
import open3d as o3d   # Modern Python alternative

cloud = o3d.geometry.PointCloud()
cloud.points = o3d.utility.Vector3dVector(points_array)

# Downsample
cloud_down = cloud.voxel_down_sample(voxel_size=0.05)

# Plane detection (e.g., floor)
plane_model, inliers = cloud_down.segment_plane(distance_threshold=0.01)
```

For: 3D processing.

## Ground plane removal

```python
# Fit plane via RANSAC; remove inliers
floor = cloud.select_by_index(inliers)
non_floor = cloud.select_by_index(inliers, invert=True)
```

For: isolating objects from floor.

## Clustering

```python
# DBSCAN finds object clusters in point cloud
labels = cloud_down.cluster_dbscan(eps=0.1, min_points=10)
```

For: separating multiple objects.

## Object detection in 3D

- **PointNet / PointPillars.** Deep learning on point clouds.
- **VoxelNet.** Voxelize then 3D CNN.

Used in autonomous driving for vehicle detection.

For: 3D object recognition.

## Registration (alignment)

ICP (Iterative Closest Point): align two point clouds:
```python
reg = o3d.pipelines.registration.registration_icp(
    source, target, threshold, initial_transform
)
transformation = reg.transformation
```

For: combining scans + localization.

## Octomap

3D occupancy grid:
```
Free / Unknown / Occupied per voxel
```

Standard for robot navigation in 3D.

For: scalable map representation.

## NDT (Normal Distributions Transform)

Alternative to ICP; faster on large clouds. Used in autonomous vehicles for localization.

For: efficient alignment.

## Mistakes to avoid

- **Too many points.** Downsample for speed.
- **No outlier filtering.** Sensor noise distorts processing.
- **Ignoring time stamps.** Cloud from t=1s and pose from t=0s = misaligned.

## Summary

- PointCloud2 = ROS 3D data format.
- Open3D / PCL for processing.
- Standard ops: downsample, plane detect, cluster, register (ICP).
- Octomap for occupancy mapping.

Next: sensor fusion + IMU.
