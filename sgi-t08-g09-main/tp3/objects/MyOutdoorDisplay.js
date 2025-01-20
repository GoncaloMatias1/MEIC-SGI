import * as THREE from 'three';

class MyOutdoorDisplay extends THREE.Object3D {
    constructor(app, config = {}) {
        super();
        this.app = app;

        this.width = 50;    
        this.height = 25;    

        this.canvas = document.createElement('canvas');
        this.canvas.width = 512;
        this.canvas.height = 256;
        this.context = this.canvas.getContext('2d');

        // Create texture from canvas
        this.texture = new THREE.CanvasTexture(this.canvas);
        
        this.createDisplayFrame();
        
        this.createDisplayScreen();

        // Set position and rotation from config
        if (config.position) {
            this.position.set(
                config.position.x || 0,
                config.position.y || 40,
                config.position.z || 0
            );
        }
        
        if (config.rotation) {
            this.rotation.y = config.rotation.y || 0;
        }
    }

    createDisplayFrame() {
        // Create frame geometry with significant depth
        const frameGeometry = new THREE.BoxGeometry(this.width + 8, this.height + 8, 8);
        const frameMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x444444,
            specular: 0x222222,
            shininess: 30,
            polygonOffset: true,
            polygonOffsetFactor: 1,
            polygonOffsetUnits: 1
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.z = -4; // Move frame further back
        this.add(frame);

        // Add support poles
        const poleGeometry = new THREE.CylinderGeometry(2, 2, 19);
        const poleMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x666666,
            polygonOffset: true,
            polygonOffsetFactor: 1,
            polygonOffsetUnits: 1
        });
        
        // Left pole
        const leftPole = new THREE.Mesh(poleGeometry, poleMaterial);
        leftPole.position.set(-this.width/2 - 4, -this.height/2 - 7.5, -4);
        this.add(leftPole);

        // Right pole
        const rightPole = new THREE.Mesh(poleGeometry, poleMaterial);
        rightPole.position.set(this.width/2 + 4, -this.height/2 - 7.5, -4);
        this.add(rightPole);
    }

    createDisplayScreen() {
        // Create a backing plane slightly behind the screen
        const backingGeometry = new THREE.PlaneGeometry(this.width + 2, this.height + 2);
        const backingMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: false,
            depthWrite: true,
            depthTest: true,
            polygonOffset: true,
            polygonOffsetFactor: -1,
            polygonOffsetUnits: -1
        });
        const backing = new THREE.Mesh(backingGeometry, backingMaterial);
        backing.position.z = -0.2;
        this.add(backing);

        // Create the actual screen
        const screenGeometry = new THREE.PlaneGeometry(this.width, this.height);
        const screenMaterial = new THREE.MeshBasicMaterial({
            map: this.texture,
            transparent: true,
            depthWrite: true,
            depthTest: true,
            polygonOffset: true,
            polygonOffsetFactor: -2,
            polygonOffsetUnits: -2
        });
        const screen = new THREE.Mesh(screenGeometry, screenMaterial);
        screen.position.z = 0; 
        this.add(screen);
    }

    update(gameData) {
        // Clear canvas with full opacity
        this.context.fillStyle = 'rgb(0, 0, 0)';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Set up text style with increased contrast
        this.context.font = 'bold 20px Arial';
        this.context.fillStyle = '#ffffff';
        this.context.textAlign = 'left';
        
        // Draw game information
        let y = 35;
        const lineHeight = 35;

        // Format elapsed time
        const minutes = Math.floor(gameData.elapsedTime / 60);
        const seconds = Math.floor(gameData.elapsedTime % 60);
        const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Draw each line of information with a slight offset for better readability
        this.context.fillText(`Time: ${timeStr}`, 25, y);
        y += lineHeight;
        this.context.fillText(`Laps: ${gameData.lapCount}`, 25, y);
        y += lineHeight;
        this.context.fillText(`Layer: ${gameData.currentLayer}`, 25, y);
        y += lineHeight;
        this.context.fillText(`Vouchers: ${gameData.vouchers}`, 25, y);
        y += lineHeight;

        // Draw game status with high contrast colors
        this.context.fillStyle = gameData.status === 'RUNNING' ? '#00ff00' : '#ff0000';
        this.context.fillText(`Status: ${gameData.status}`, 25, y);

        // Update texture
        this.texture.needsUpdate = true;
    }

    dispose() {
        this.texture.dispose();
        this.canvas.remove();
        this.traverse(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        });
    }
}

export { MyOutdoorDisplay };