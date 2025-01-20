import * as THREE from 'three';

class MyBalloon extends THREE.Object3D {
    static BALLOON_MODELS = {
        DEFAULT: {
            color: 0xcccccc, // Light gray default color
            name: "Default Balloon",
            scale: 3.0,
            texture: null  // No texture by default
        },
        RED: { 
            color: 0xff0000, 
            name: "Red Balloon",
            scale: 3.0,
            texture: "scene/textures/ferrari.jpg"
        },
        BLUE: { 
            color: 0x0000ff, 
            name: "Blue Balloon",
            scale: 3.0,
            texture: "scene/textures/rb.jpg"  // Example for blue
        },
        YELLOW: { 
            color: 0xffff00, 
            name: "Yellow Balloon",
            scale: 3.0,
            texture: "scene/textures/renault.jpg"  // Example for yellow
        },
        GREEN: { 
            color: 0x00ff00, 
            name: "Green Balloon",
            scale: 3.0,
            texture: "scene/textures/aston.jpg"  // Example for green
        },
        CYAN: { 
            color: 0x00ffff, 
            name: "Cyan Balloon",
            scale: 3.0,
            texture: "scene/textures/will.jpg"  // Example for cyan
        },
        MAGENTA: { 
            color: 0xff00ff, 
            name: "Magenta Balloon",
            scale: 3.0,
            texture: "scene/textures/point.jpg"  // Example for magenta
        },
        WHITE: { 
            color: 0xffffff, 
            name: "White Balloon",
            scale: 3.0,
            texture: "scene/textures/mercedes.jpg"  // Example for white
        }
    };

    constructor(app, options = {}) {
        super();
        this.app = app;
        
        // Balloon properties
        this.isAutonomous = options.isAutonomous || false;
        this.route = options.route || null;
        this.modelType = options.model || "DEFAULT";
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.acceleration = new THREE.Vector3(0, 0, 0);
        this.targetHeight = null;  // New property for smooth height transitions
        
        // Movement parameters
        this.verticalSpeed = 0.08;         // Slightly reduced for smoother movement
        this.maxHeight = 30;               // Maximum height
        this.minHeight = 8.5;              // Minimum height
        this.damping = 0.95;               // Increased damping for smoother movement
        this.windInfluence = 1.0;          // Full wind influence
        this.heightLerpFactor = 0.1;       // Factor for smooth height transitions
        this.vouchers = 0;

        // Route-related properties
        this.routeIndex = 0;
        this.routeTime = 0;
        this.lastUpdateTime = 0;

        // Set initial position if provided
        if (options.startPosition) {
            this.position.copy(options.startPosition);
            this.targetHeight = options.startPosition.y;
        }

        // Get model configuration
        this.modelConfig = MyBalloon.BALLOON_MODELS[this.modelType] || MyBalloon.BALLOON_MODELS.RED;

        // Create LOD (Level of Detail)
        this.lod = new THREE.LOD();

        this.detailedModel = this.createDetailedModel();
        this.lod.addLevel(this.detailedModel, 0);    

        // Add simplified model
        this.simplifiedModel = this.createSimplifiedModel();
        this.lod.addLevel(this.simplifiedModel, 150); 
        
        this.add(this.lod);

        // Create shadow/marker
        this.shadow = this.createShadowMarker();
        this.add(this.shadow);

        // Bounding sphere for collision detection
        this.boundingSphere = new THREE.Sphere(this.position, 0.5 * this.modelConfig.scale);
    }


    createDetailedModel() {
        const group = new THREE.Group();

        const textureLoader = new THREE.TextureLoader();
        const balloonTexture = this.modelConfig.texture ? 
            textureLoader.load(this.modelConfig.texture) : null;

        // Balloon (sphere)
        const balloonGeometry = new THREE.SphereGeometry(2 * this.modelConfig.scale, 32, 32);
        const balloonMaterial = new THREE.MeshPhongMaterial({          
            map: balloonTexture,  
            specular: 0x444444,
            shininess: 30,
            side: THREE.DoubleSide
        });
        const balloon = new THREE.Mesh(balloonGeometry, balloonMaterial);
        balloon.position.y = 3 * this.modelConfig.scale;
        balloon.castShadow = true;
        group.add(balloon);
    
        // Basket (cube)
        const basketGeometry = new THREE.BoxGeometry(
            1 * this.modelConfig.scale, 
            1 * this.modelConfig.scale, 
            1 * this.modelConfig.scale
        );
        const basketMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x8B4513,
            specular: 0x222222,
            shininess: 20
        });
        const basket = new THREE.Mesh(basketGeometry, basketMaterial);
        basket.position.y = -2 * this.modelConfig.scale;
        basket.castShadow = true;
        group.add(basket);
    
        // Ropes
        const cornerOffsets = [
            [-0.5, -2, -0.5],
            [0.5, -2, -0.5],
            [0.5, -2, 0.5],
            [-0.5, -2, 0.5]
        ];
    
        const ropesMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
        const ropesGeometry = new THREE.BufferGeometry();
        const ropePositions = [];
    
        cornerOffsets.forEach(offset => {
            ropePositions.push(
                offset[0] * this.modelConfig.scale, 
                offset[1] * this.modelConfig.scale, 
                offset[2] * this.modelConfig.scale,
                offset[0] * this.modelConfig.scale, 
                3 * this.modelConfig.scale, 
                offset[2] * this.modelConfig.scale
            );
        });
    
        ropesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(ropePositions, 3));
        const ropes = new THREE.LineSegments(ropesGeometry, ropesMaterial);
        group.add(ropes);
    
        return group;
    }

    createSimplifiedModel() {
        const group = new THREE.Group();
    
        const geometry = new THREE.SphereGeometry(2 * this.modelConfig.scale, 16, 16);
        const material = new THREE.MeshPhongMaterial({ 
            color: this.modelConfig.color,
            specular: 0x444444,
            shininess: 30
        });
        const simpleSphere = new THREE.Mesh(geometry, material);
        simpleSphere.position.y = 3 * this.modelConfig.scale;
        
        group.add(simpleSphere);
        return group;
    }

    createShadowMarker() {
        const geometry = new THREE.CircleGeometry(1 * this.modelConfig.scale, 32);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0x000000,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide
        });
        const shadow = new THREE.Mesh(geometry, material);
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.y = 0.1;
        return shadow;
    }

    increaseAltitude() {
        const targetY = Math.min(this.position.y + 2, this.maxHeight);
        this.targetHeight = targetY;
    }

    decreaseAltitude() {
        const targetY = Math.max(this.position.y - 2, this.minHeight);
        this.targetHeight = targetY;
    }

    stopVerticalMovement() {
        // When stopping, set target to current height to maintain position
        this.targetHeight = this.position.y;
    }

    update(windLayer, clock) {
        if (this.isAutonomous) {
            this.updateAutonomous(clock);
        } else {
            this.updatePlayer(windLayer);
            
            // Make player balloon always face camera
            if (this.app.activeCamera) {
                const angle = Math.atan2(
                    this.app.activeCamera.position.x - this.position.x,
                    this.app.activeCamera.position.z - this.position.z
                );
                this.rotation.y = angle;
            }
        }
    
        // Update shadow position
        if (this.shadow) {
            this.shadow.position.copy(this.position);
            this.shadow.position.y = 0.1;
        }
    
        // Update bounding sphere
        this.boundingSphere.center.copy(this.position);
    
        // Update LOD
        if (this.lod && this.app.activeCamera) {
            this.lod.update(this.app.activeCamera);
        }
    }

    updateAutonomous(clock) {
        if (!this.route || !this.route.points || this.route.points.length < 1) return;
    
        const points = this.route.points;
        const nextPoint = points[this.routeIndex];
        
        // Move towards the target point
        const direction = new THREE.Vector3()
            .subVectors(nextPoint, this.position)
            .normalize();
        
        const speed = 1;
        this.position.x += direction.x * speed;
        this.position.z += direction.z * speed;
        this.position.y = 10;  // Keep constant height
    
        // Check if we reached the target point
        if (this.position.distanceTo(nextPoint) < 1) {
            // Move to next point
            this.routeIndex = (this.routeIndex + 1) % points.length;
        }
    }

    updatePlayer(windLayer) {
        // Apply wind force if we have wind data
        if (windLayer && windLayer.direction && windLayer.speed) {
            // Apply wind influence to velocity
            this.velocity.x = windLayer.direction.x * windLayer.speed * this.windInfluence;
            this.velocity.z = windLayer.direction.z * windLayer.speed * this.windInfluence;
        }

        // Smooth vertical movement using lerp
        if (this.targetHeight !== null) {
            this.position.y = THREE.MathUtils.lerp(
                this.position.y,
                this.targetHeight,
                this.heightLerpFactor
            );
        }

        // Update horizontal position based on wind
        this.position.x += this.velocity.x;
        this.position.z += this.velocity.z;

        // Keep within vertical bounds
        this.position.y = THREE.MathUtils.clamp(
            this.position.y,
            this.minHeight,
            this.maxHeight
        );
    }

    collidesWith(other) {
        if (!other || !other.boundingSphere) return false;
        
        // Create the offsetted bounding sphere for collision calculation
        const offsetBoundingSphere = new THREE.Sphere(this.position.clone().setY(this.position.y + 9), 2 * this.modelConfig.scale);
        
        // Check for intersection between the bounding spheres
        return offsetBoundingSphere.intersectsSphere(other.boundingSphere);
    }

    addVoucher() {
        this.vouchers++;
    }

    useVoucher() {
        if (this.vouchers > 0) {
            this.vouchers--;
            return true;
        }
        return false;
    }

    changeColor(newColor) {
        const textureLoader = new THREE.TextureLoader();
        
        // Find the model config that matches this color
        const newModelConfig = Object.values(MyBalloon.BALLOON_MODELS)
            .find(model => model.color === newColor);
        
        if (newModelConfig && newModelConfig.texture) {
            const balloonTexture = textureLoader.load(newModelConfig.texture);
            balloonTexture.colorSpace = THREE.SRGBColorSpace;
            balloonTexture.repeat.set(2, 1);
            balloonTexture.wrapS = THREE.RepeatWrapping;
            balloonTexture.mapping = THREE.SphereMapping;
    
            // Update the balloon materials with the new texture
            if (this.detailedModel) {
                this.detailedModel.traverse((child) => {
                    if (child.isMesh && child.geometry.type === 'SphereGeometry') {
                        child.material.map = balloonTexture;
                        child.material.needsUpdate = true;
                    }
                });
            }
        }
    }  
}

export { MyBalloon };