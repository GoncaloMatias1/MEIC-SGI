import * as THREE from 'three';

class MyWindDisplay {
    constructor(app) {
        this.app = app;
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);
        this.init();
    }

    init() {
        this.minimapGroup = new THREE.Group();
        // Adjusted position to bottom-right
        this.minimapGroup.position.set(0.8, -0.8, 0);

        // Create smaller circular background with gradient effect
        const bgGeometry = new THREE.CircleGeometry(0.08, 32);
        const bgMaterial = new THREE.MeshBasicMaterial({
            color: 0x1a1a2e, // Dark blue background
            transparent: true,
            opacity: 0.0, // Fully transparent
            depthTest: false
        });
        this.background = new THREE.Mesh(bgGeometry, bgMaterial);
        this.background.renderOrder = 999;
        this.minimapGroup.add(this.background);

        // Create inner circle for depth effect
        const innerBgGeometry = new THREE.CircleGeometry(0.07, 32);
        const innerBgMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000, // Red
            transparent: true,
            opacity: 0.0, // Fully transparent
            depthTest: false
        });
        const innerBackground = new THREE.Mesh(innerBgGeometry, innerBgMaterial);
        innerBackground.renderOrder = 1000;
        this.minimapGroup.add(innerBackground);

        // Create a more stylized arrow
        const arrowShape = new THREE.Shape();
        // More streamlined arrow design
        arrowShape.moveTo(0, 0.05);     // Top point
        arrowShape.lineTo(0.025, -0.01); // Right wing
        arrowShape.lineTo(0.01, -0.01);  // Right indent
        arrowShape.lineTo(0, -0.03);     // Bottom point
        arrowShape.lineTo(-0.01, -0.01); // Left indent
        arrowShape.lineTo(-0.025, -0.01);// Left wing
        arrowShape.lineTo(0, 0.05);      // Back to top

        const arrowGeometry = new THREE.ShapeGeometry(arrowShape);
        const arrowMaterial = new THREE.MeshBasicMaterial({
            color: 0x4da6ff, // Light blue
            depthTest: false,
            side: THREE.DoubleSide
        });
        this.arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
        this.arrow.renderOrder = 1001;
        this.minimapGroup.add(this.arrow);

        // Create subtle outer glow effect
        const glowGeometry = new THREE.CircleGeometry(0.085, 32);
        const glowMaterial = new THREE.LineBasicMaterial({
            color: 0x4da6ff, // Match arrow color
            transparent: true,
            opacity: 0.5,
            depthTest: false
        });
        const glow = new THREE.LineLoop(glowGeometry, glowMaterial);
        glow.renderOrder = 998;
        this.minimapGroup.add(glow);

        this.scene.add(this.minimapGroup);
    }

    update(balloon, windLayer) {
        if (!balloon || !windLayer) return;

        // Calculate angle from wind direction
        const angle = Math.atan2(windLayer.direction.x, windLayer.direction.z);
        this.arrow.rotation.z = -angle;

        // Dynamic color based on wind speed
        const speed = windLayer.speed;
        const hue = 0.6; // Base blue hue
        const saturation = 0.7;
        const lightness = Math.min(0.4 + speed * 0.3, 0.8); // Brighter with speed
        this.arrow.material.color.setHSL(hue, saturation, lightness);
    }

    render() {
        const autoClear = this.app.renderer.autoClear;
        this.app.renderer.autoClear = false;
        this.app.renderer.clearDepth();
        this.app.renderer.render(this.scene, this.camera);
        this.app.renderer.autoClear = autoClear;
    }
}

export { MyWindDisplay };