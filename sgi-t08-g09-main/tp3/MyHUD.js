import * as THREE from 'three';
import { MySpriteText } from './components/MySpriteText.js';

class MyHUD {
    constructor(app) {
        this.app = app;
        this.spriteText = new MySpriteText(app);
        
        // Create the HUD scene and camera
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);

        // Initialize text elements with tracking of last text
        this.timeText = { group: new THREE.Group(), lastText: "" };
        this.layerText = { group: new THREE.Group(), lastText: "" };
        this.voucherText = { group: new THREE.Group(), lastText: "" };
        this.statusText = { group: new THREE.Group(), lastText: "" };
        this.lapText = { group: new THREE.Group(), lastText: "" };

        this.initializeHUD();
    }

    initializeHUD() {
        // Position text elements based on new layout
        // Status at top center
        this.updateTextElement(this.statusText, "STATUS: WAITING", 0, 0.8);
        
        // Time and layer on top left
        this.updateTextElement(this.timeText, "TIME: 0:00", -0.9, 0.8);
        this.updateTextElement(this.layerText, "LAYER: 0", -0.9, 0.7);
        
        // Lap and vouchers on top right
        this.updateTextElement(this.lapText, "LAP: 0/1", 0.6, 0.8);
        this.updateTextElement(this.voucherText, "VOUCHERS: 0", 0.5, 0.7);

        // Add all elements to the scene
        this.scene.add(this.timeText.group);
        this.scene.add(this.layerText.group);
        this.scene.add(this.voucherText.group);
        this.scene.add(this.statusText.group);
        this.scene.add(this.lapText.group);
    }

    updateTextElement(element, newText, x, y) {
        // Only update if the text has actually changed
        if (element.lastText === newText) {
            return;
        }

        // Store new text
        element.lastText = newText;

        // Clean up existing meshes
        while(element.group.children.length > 0) {
            const child = element.group.children[0];
            element.group.remove(child);
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        }

        // Create new text with adjusted size
        const textMesh = this.spriteText.createText(newText, 0.05);
        
        textMesh.rotation.y = 0;
        
        // Position the text
        textMesh.position.set(x, y, 0);
        
        // Ensure the material renders on top
        textMesh.children.forEach(child => {
            if (child.material) {
                child.material.depthTest = false;
                child.material.depthWrite = false;
                child.renderOrder = 999;
            }
        });
        
        // Add to group
        element.group.add(textMesh);
    }

    update(gameData) {
        if (!gameData) return;

        // Format time as MM:SS
        const minutes = Math.floor(gameData.elapsedTime / 60);
        const seconds = Math.floor(gameData.elapsedTime % 60);
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        // Update all text elements with new positions
        // Status in top center
        this.updateTextElement(this.statusText, `STATUS: ${gameData.status}`, -0.9, 0.6);
        
        // Time and layer on top left
        this.updateTextElement(this.timeText, `TIME: ${timeString}`, -0.9, 0.8);
        this.updateTextElement(this.layerText, `LAYER: ${gameData.currentLayer}`, -0.9, 0.7);
        
        // Lap and vouchers on top right
        this.updateTextElement(this.lapText, `LAP: ${gameData.lapCount}/1`, 0.6, 0.8);
        this.updateTextElement(this.voucherText, `VOUCHERS: ${gameData.vouchers}`, 0.5, 0.7);
    }

    render() {
        const autoClear = this.app.renderer.autoClear;
        this.app.renderer.autoClear = false;
        this.app.renderer.clearDepth();
        this.app.renderer.render(this.scene, this.camera);
        this.app.renderer.autoClear = autoClear;
    }
}

export { MyHUD };