import * as THREE from 'three';

class MyTrack {

    constructor(app) {
        this.app = app;
        this.trackWidth = 90;
        this.curve = null;
        this.startPoint = null;
    }

    create(data) {
        const group = new THREE.Group();

        const trackPoints = data.track.map(point => new THREE.Vector3(point.x, 0, point.z));
        this.startPoint = trackPoints[0];
        this.curve = new THREE.CatmullRomCurve3(trackPoints, true);
        const shape = new THREE.Shape([
            new THREE.Vector2(0.1, -this.trackWidth / 2),
            new THREE.Vector2(0.1, this.trackWidth / 2),
            new THREE.Vector2(0.1, this.trackWidth / 2),
            new THREE.Vector2(0.1, -this.trackWidth / 2)
        ]);

        const extrudeSettings = {
            steps: 100,
            extrudePath: this.curve,
            bevelEnabled: false
        };
        const trackGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

        // Grass ground
        const groundGeometry = new THREE.PlaneGeometry(5000, 5000);
        const textureLoader = new THREE.TextureLoader();
        const grassTexture = textureLoader.load('scene/textures/grass.jpg');
        grassTexture.wrapS = THREE.RepeatWrapping;
        grassTexture.wrapT = THREE.RepeatWrapping;
        grassTexture.repeat.set(20, 20); 

        const groundMaterial = new THREE.MeshStandardMaterial({ 
            map: grassTexture,
            color: 0x88aa88, 
            roughness: 0.8,
            metalness: 0.1
        }); 
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        group.add(ground);

        const trackMaterial = new THREE.MeshStandardMaterial({
            color: 0x505050,
            roughness: 0.8,
            metalness: 0.1
        });
        const trackMesh = new THREE.Mesh(trackGeometry, trackMaterial);
        trackMesh.translateY(0.9);
        group.add(trackMesh);

        // Mountains
        if (data.mountains) {
            const mountainTexture = textureLoader.load('scene/textures/mountains.jpg');
            
            mountainTexture.wrapS = THREE.RepeatWrapping;
            mountainTexture.wrapT = THREE.RepeatWrapping;
            mountainTexture.repeat.set(2, 2);

            data.mountains.forEach(mountain => {
                const mountainGeometry = new THREE.ConeGeometry(
                    mountain.radius || 200,
                    mountain.height || 500,
                    32  // increased segments for better texture mapping
                );
                const mountainMaterial = new THREE.MeshStandardMaterial({ 
                    map: mountainTexture,
                    roughness: 0.8,
                    metalness: 0.2,
                    displacementMap: mountainTexture,
                    displacementScale: 50
                });
                
                const mountainMesh = new THREE.Mesh(mountainGeometry, mountainMaterial);
                mountainMesh.position.set(
                    mountain.x,
                    (mountain.height || 500) / 2 - 20,
                    mountain.z
                );
                group.add(mountainMesh);
            });
        }

        // Trees
        if (data.trees) {
            const treeTexture = textureLoader.load('scene/textures/tree1.jpg');
            
            data.trees.forEach(tree => {
                // Create tree trunk
                const trunkGeometry = new THREE.CylinderGeometry(
                    tree.radius * 0.2,
                    tree.radius * 0.3,
                    tree.height * 0.4,
                    8
                );
                const trunkMaterial = new THREE.MeshStandardMaterial({ 
                    map: treeTexture,
                    color: 0x4A2B0F
                });
                const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
                trunk.position.set(tree.x, (tree.height * 0.4) / 2, tree.z);

                // Create tree foliage
                const foliageGeometry = new THREE.ConeGeometry(
                    tree.radius,
                    tree.height * 0.8,
                    8
                );
                const foliageMaterial = new THREE.MeshStandardMaterial({ 
                    map: treeTexture,
                    color: 0x2D5A27
                });
                
                const foliageHeights = [0.3, 0.5, 0.7];
                foliageHeights.forEach((heightFactor) => {
                    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
                    foliage.position.set(
                        tree.x,
                        tree.height * heightFactor,
                        tree.z
                    );
                    foliage.scale.set(
                        1 - (heightFactor * 0.3),
                        1,
                        1 - (heightFactor * 0.3)
                    );
                    group.add(foliage);
                });

                group.add(trunk);
            });
        }

        this.app.scene.add(group);
    }

    // Gets starting points A and B
    getStartPoints() {
        if (!this.startPoint) return null;

        // Get direction at start point
        const tangent = this.curve.getTangentAt(0);
        // Get perpendicular vector
        const perpendicular = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

        // Create A and B points on either side of track
        return {
            A: this.startPoint.clone().add(perpendicular.multiplyScalar(this.trackWidth/4)),
            B: this.startPoint.clone().add(perpendicular.multiplyScalar(-this.trackWidth/4))
        };
    }

    // Get center point when off track (for penalty)
    getNearestCenterPoint(position) {
        if (!this.curve) return null;
        const divisions = 200;
        const points = this.curve.getPoints(divisions);
        let minDistance = Infinity;
        let nearestPoint = null;

        points.forEach(point => {
            const distance = position.distanceTo(point);
            if (distance < minDistance) {
                minDistance = distance;
                nearestPoint = point;
            }
        });

        return nearestPoint;
    }

    isOnTrack(position) {
        if (!this.curve) return false;
        const divisions = 200;
        const points = this.curve.getPoints(divisions);
        let minDistance = Infinity;
        let closestPoint = null;
        let closestIndex = 0;
    
        points.forEach((point, index) => {
            const distance = position.distanceTo(point);
            if (distance < minDistance) {
                minDistance = distance;
                closestPoint = point;
                closestIndex = index;
            }
        });
    
        // Get tangent at closest point
        const tangent = this.curve.getTangentAt(closestIndex / divisions);
        
        // Calculate distance from position to flight track axis line
        const toPosition = position.clone().sub(closestPoint);
        const projection = toPosition.projectOnPlane(tangent);
        const distanceToAxis = projection.length();
    
        return distanceToAxis <= this.trackWidth/2;
    }

    setTrackWidth(width) {
        this.trackWidth = width;
    }

    // Get starting point of track
    getStartPoint() {
        return this.startPoint;
    }
}

export { MyTrack };