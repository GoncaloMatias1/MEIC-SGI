import * as THREE from 'three';

class Particle {
    constructor(position, color) {
        // Create multiple vertices for a more visible particle
        const vertices = [];
        for (let i = 0; i < 4; i++) {
            vertices.push(0, 0, 0);
        }
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        
        const material = new THREE.PointsMaterial({
            color: color,
            size: 8,  // Doubled the size
            transparent: true,
            opacity: 1,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            sizeAttenuation: false
        });

        this.mesh = new THREE.Points(geometry, material);
        this.mesh.position.copy(position);
        this.velocity = new THREE.Vector3();
        this.isExploded = false;
        this.life = 1.0;
    }

    update(deltaTime) {
        // Apply velocity
        this.mesh.position.add(this.velocity.clone().multiplyScalar(deltaTime));
        
        if (this.isExploded) {
            // Apply gravity and fade out
            this.velocity.y -= 200 * deltaTime; // Increased gravity
            this.life -= deltaTime * 1.5; // Faster fade out
            this.mesh.material.opacity = this.life;
            this.mesh.material.size = this.life * 4;
            return this.life > 0;
        }
        
        // Trail effect for launch particle
        this.mesh.material.opacity -= deltaTime * 2;
        return true;
    }
}

class Firework {
    constructor(screenWidth, screenHeight) {
        // Launch from random position at bottom
        const startX = (Math.random() - 0.5) * screenWidth * 0.8;
        this.position = new THREE.Vector3(startX, -screenHeight/2, 0);
        
        // Random color from predefined festive colors
        const colors = [
            0xFF0000, // Red
            0x00FF00, // Green
            0x0000FF, // Blue
            0xFFFF00, // Yellow
            0xFF00FF, // Magenta
            0x00FFFF, // Cyan
            0xFFFFFF  // White
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        
        this.particles = [];
        this.exploded = false;
        this.age = 0;
        
        // Create trail particles for launch
        for (let i = 0; i < 3; i++) {
            const particle = new Particle(this.position, this.color);
            particle.velocity.set(
                (Math.random() - 0.5) * 20,
                screenHeight * (0.8 + Math.random() * 0.2),
                0
            );
            this.particles.push(particle);
        }
    }

    explode() {
        const explosionParticles = 50; // More particles
        const explosionPosition = this.particles[0].mesh.position.clone();
        
        // Clear launch particles
        this.particles = [];

        // Create explosion in sphere pattern
        for (let i = 0; i < explosionParticles; i++) {
            const particle = new Particle(explosionPosition, this.color);
            
            // Create 3D sphere pattern
            const phi = Math.random() * Math.PI * 2;
            const theta = Math.random() * Math.PI;
            const velocity = new THREE.Vector3();
            
            velocity.x = Math.sin(theta) * Math.cos(phi);
            velocity.y = Math.sin(theta) * Math.sin(phi);
            velocity.z = Math.cos(theta);
            
            // Randomize speed for more natural look
            const speed = 300 + Math.random() * 200;
            velocity.multiplyScalar(speed);
            
            particle.velocity.copy(velocity);
            particle.isExploded = true;
            this.particles.push(particle);
        }
        this.exploded = true;
    }

    update(deltaTime) {
        this.age += deltaTime;

        if (!this.exploded && this.age > 0.8) { // Earlier explosion
            this.explode();
        }

        this.particles = this.particles.filter(particle => particle.update(deltaTime));
        return this.particles.length > 0;
    }
}

class MyFireworks {
    constructor(app) {
        this.app = app;
        this.fireworks = [];
        this.timer = 0;
        this.spawnInterval = 0.5; // More frequent fireworks
        
        // Create scene and camera for fireworks
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(
            -window.innerWidth/2, window.innerWidth/2,
            window.innerHeight/2, -window.innerHeight/2,
            -1000, 1000
        );
        
        // Dimensions for positioning
        this.screenWidth = window.innerWidth;
        this.screenHeight = window.innerHeight;
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.screenWidth = window.innerWidth;
            this.screenHeight = window.innerHeight;
            this.camera.left = -this.screenWidth/2;
            this.camera.right = this.screenWidth/2;
            this.camera.top = this.screenHeight/2;
            this.camera.bottom = -this.screenHeight/2;
            this.camera.updateProjectionMatrix();
        });
    }

    update(deltaTime) {
        this.timer += deltaTime;
        
        if (this.timer >= this.spawnInterval) {
            this.timer = 0;
            const firework = new Firework(this.screenWidth, this.screenHeight);
            firework.particles.forEach(particle => {
                this.scene.add(particle.mesh);
            });
            this.fireworks.push(firework);
        }

        this.fireworks = this.fireworks.filter(firework => {
            const isAlive = firework.update(deltaTime);
            
            if (!isAlive) {
                firework.particles.forEach(particle => {
                    this.scene.remove(particle.mesh);
                    particle.mesh.material.dispose();
                    particle.mesh.geometry.dispose();
                });
                return false;
            }
            
            firework.particles.forEach(particle => {
                if (!particle.mesh.parent) {
                    this.scene.add(particle.mesh);
                }
            });
            
            return true;
        });
    }

    render() {
        if (this.fireworks.length > 0) {
            const autoClear = this.app.renderer.autoClear;
            this.app.renderer.autoClear = false;
            this.app.renderer.render(this.scene, this.camera);
            this.app.renderer.autoClear = autoClear;
        }
    }

    clear() {
        this.fireworks.forEach(firework => {
            firework.particles.forEach(particle => {
                this.scene.remove(particle.mesh);
                particle.mesh.material.dispose();
                particle.mesh.geometry.dispose();
            });
        });
        this.fireworks = [];
    }
}

export { MyFireworks };