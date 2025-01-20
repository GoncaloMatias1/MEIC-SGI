import * as THREE from 'three';

class MyPowerUp extends THREE.Object3D {
    constructor(app, options = {}) {
        super();
        this.app = app;
        
        this.type = options.type || "voucher";
        this.value = options.value || 1;
        this.collected = false;
        this.pulseSpeed = 2.0;
        this.originalScale = 3.0;
        this.cooldownTime = 5.0; // Cooldown time in seconds before power-up can be collected again
        this.lastCollectTime = 0;
    
        // Create LOD (Level of Detail)
        this.lod = new THREE.LOD();
        
        const detailedModel = this.createVisuals();
        this.lod.addLevel(detailedModel, 0);
        
        const emptyModel = new THREE.Group();
        this.lod.addLevel(emptyModel, 600);
        
        this.add(this.lod);
        
        // Increase bounding sphere size to match visual size
        this.boundingSphere = new THREE.Sphere(this.position, 4);
        
        if (options.position) {
            this.position.copy(options.position);
            this.boundingSphere.center.copy(this.position);
        }
    
        this.clock = new THREE.Clock();
    }

    createVisuals() {
        const group = new THREE.Group();

        this.geometry = new THREE.OctahedronGeometry(4, 0);
        
        // Simplified and enhanced shader material
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                baseColor: { value: new THREE.Color(0x00ff00) },
                pulseSpeed: { value: this.pulseSpeed },
                pulseFactor: { value: 0.15 }  
            },
            vertexShader: `
                uniform float time;
                uniform float pulseSpeed;
                uniform float pulseFactor;
                
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                void main() {
                    vNormal = normal;
                    
                    // Simplified pulsing effect
                    float pulse = 1.0 + pulseFactor * sin(time * pulseSpeed);
                    
                    // Apply pulsing to position
                    vec3 pos = position * pulse;
                    
                    // Add rotation effect
                    float angle = time * 0.5;
                    mat3 rotationMatrix = mat3(
                        cos(angle), 0.0, sin(angle),
                        0.0, 1.0, 0.0,
                        -sin(angle), 0.0, cos(angle)
                    );
                    pos = rotationMatrix * pos;
                    
                    vPosition = pos;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 baseColor;
                uniform float time;
                
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                void main() {
                    // Create holographic effect
                    float scanline = sin(vPosition.y * 20.0 + time * 5.0) * 0.1 + 0.9;
                    
                    // Edge glow
                    vec3 viewDirection = normalize(cameraPosition - vPosition);
                    float fresnel = pow(1.0 - dot(normalize(vNormal), viewDirection), 3.0);
                    
                    // Combine effects
                    vec3 color = baseColor * scanline;
                    color += baseColor * fresnel * 0.5;
                    
                    gl_FragColor = vec4(color, 0.8);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide
        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        group.add(this.mesh);

        // Enhanced glow effect with more visible pulsing
        const glowGeometry = new THREE.OctahedronGeometry(4.2, 0);
        this.glowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                baseColor: { value: new THREE.Color(0x00ff00) },
                pulseSpeed: { value: this.pulseSpeed }
            },
            vertexShader: `
                uniform float time;
                uniform float pulseSpeed;
                
                varying vec3 vPosition;
                
                void main() {
                    vec3 pos = position;
                    // More pronounced pulsing for glow
                    float scale = 1.0 + 0.2 * sin(time * pulseSpeed);
                    pos *= scale;
                    
                    vPosition = pos;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 baseColor;
                uniform float time;
                
                varying vec3 vPosition;
                
                void main() {
                    float intensity = 0.5 + 0.3 * sin(time * 2.0);
                    vec3 glowColor = baseColor;
                    float alpha = intensity * 0.3;
                    gl_FragColor = vec4(glowColor, alpha);
                }
            `,
            transparent: true,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending
        });

        this.glowMesh = new THREE.Mesh(glowGeometry, this.glowMaterial);
        group.add(this.glowMesh);

        return group;
    }

    update() {
        this.lod.update(this.app.activeCamera);

        const time = this.clock.getElapsedTime();
        
        // Update shader uniforms
        if (this.material && this.material.uniforms) {
            this.material.uniforms.time.value = time;
        }
        
        if (this.glowMaterial && this.glowMaterial.uniforms) {
            this.glowMaterial.uniforms.time.value = time;
        }

        this.boundingSphere.center.copy(this.position);
    }

    onCollect() {
        const currentTime = this.clock.getElapsedTime();
        
        // Check if enough time has passed since last collection
        if (currentTime - this.lastCollectTime < this.cooldownTime) {
            return null;
        }
        
        this.lastCollectTime = currentTime;
        
        // Play collection animation without removing the power-up
        const duration = 0.5;
        const startScale = this.scale.x;
        const startTime = currentTime;
        
        const animateCollection = () => {
            const now = this.clock.getElapsedTime();
            const elapsed = now - startTime;
            
            if (elapsed < duration) {
                // Scale down
                const scale = startScale * (1 - (elapsed / duration));
                this.scale.set(scale, scale, scale);
                requestAnimationFrame(animateCollection);
            } else {
                // Reset scale after animation
                this.scale.set(startScale, startScale, startScale);
            }
        };
        
        animateCollection();
        
        return {
            type: this.type,
            value: this.value
        };
    }

    dispose() {
        if (this.geometry) this.geometry.dispose();
        if (this.material) this.material.dispose();
        if (this.glowMesh) {
            if (this.glowMesh.geometry) this.glowMesh.geometry.dispose();
            if (this.glowMesh.material) this.glowMesh.material.dispose();
        }
    }
}

export { MyPowerUp };