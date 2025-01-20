import * as THREE from 'three';

class MyObstacle {
    constructor(app) {
        this.app = app;
        this.obstacles = [];
        this.boundingSpheres = [];
        this.clock = new THREE.Clock();
        
        console.log('MyObstacle constructor initialized');
        
        this.vertexShader = `
            uniform float time;
            uniform float pulseFactor;
            uniform float pulseSpeed;
            
            varying vec3 vNormal;
            varying vec2 vUv;
            
            void main() {
                vNormal = normal;
                vUv = uv;
                
                // Calculate pulsing effect
                float pulse = 1.0 + pulseFactor * sin(time * pulseSpeed);
                
                // Apply pulsing to position
                vec3 newPosition = position * pulse;
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
            }
        `;

        this.fragmentShader = `
            uniform float time;
            uniform vec3 color;
            uniform sampler2D diffuseTexture;
            
            varying vec3 vNormal;
            varying vec2 vUv;
            
            void main() {
                vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
                float intensity = dot(normalize(vNormal), lightDir) * 0.5 + 0.5;
                vec4 texColor = texture2D(diffuseTexture, vUv);
                gl_FragColor = vec4(texColor.rgb * intensity, 1.0);
            }
        `;
    }

    createShaderMaterial(color) {
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load('scene/textures/obstacle1.jpg');
        
        const uniforms = {
            time: { value: 0.0 },
            pulseFactor: { value: 0.05 },
            pulseSpeed: { value: 2.0 },
            color: { value: new THREE.Color(color) },
            diffuseTexture: { value: texture }
        };

        return new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: this.vertexShader,
            fragmentShader: this.fragmentShader,
            side: THREE.DoubleSide
        });
    }

    create(data) {
        console.log('Creating obstacles with data:', data);
        const group = new THREE.Group();

        data.forEach((obstacleData, index) => {
            const obstacle = this.createObstacle(obstacleData);
            group.add(obstacle);
            this.obstacles.push(obstacle);
            
            const boundingSphere = new THREE.Sphere(
                obstacle.position.clone(),
                obstacle.userData.size * 0.5
            );
            this.boundingSpheres.push(boundingSphere);
        });

        this.app.scene.add(group);
        return this.obstacles;
    }

    createObstacle(data) {
        const width = data.width || Math.random() * 5 + 2;
        const height = data.height || Math.random() * 20 + 10;
        const depth = data.depth || Math.random() * 5 + 2;
        
        console.log(`Creating vertical prism obstacle with dimensions ${width}x${height}x${depth}`);
        
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = this.createShaderMaterial(data.color || '#ff0000');
        const obstacle = new THREE.Mesh(geometry, material);
        
        obstacle.position.set(
            data.x,
            data.y || height / 2, 
            data.z
        );

        obstacle.rotation.y = Math.random() * Math.PI * 2;

        obstacle.userData.size = Math.max(width, height, depth);
        obstacle.castShadow = true;
        obstacle.receiveShadow = true;

        return obstacle;
    }

    update() {
        const currentTime = this.clock.getElapsedTime();
        
        this.obstacles.forEach((obstacle) => {
            if (obstacle.material.uniforms) {
                // Update time uniform for each obstacle
                obstacle.material.uniforms.time.value = currentTime;
                obstacle.material.uniformsNeedUpdate = true;
            }
        });
    }

    clear() {
        this.obstacles.forEach(obstacle => {
            if (obstacle.geometry) obstacle.geometry.dispose();
            if (obstacle.material) obstacle.material.dispose();
            this.app.scene.remove(obstacle);
        });
        this.obstacles = [];
        this.boundingSpheres = [];
    }

    checkCollision(point, radius) {
        const testSphere = new THREE.Sphere(point, radius);
        return this.boundingSpheres.some(boundingSphere => 
            boundingSphere.intersectsSphere(testSphere)
        );
    }
}

export { MyObstacle };