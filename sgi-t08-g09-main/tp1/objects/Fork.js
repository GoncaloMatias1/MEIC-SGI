import * as THREE from 'three';

/**
    This class represents the Fork
*/ 
class Fork {
    /**
       constructs the object
       @param {MyApp} app The application object
    */ 
    constructor(app) {
        this.app = app;

        // Fork Material
        this.forkColor = '#C0C0C0';  // Silver color
        this.forkMaterial = new THREE.MeshPhongMaterial({
            color: this.forkColor,
            specular: 0x111111,
            shininess: 100
        });
    }

    /**
       creates the candle mesh
    */ 
    create() {
        // Create the fork group
        const forkGroup = new THREE.Group();

        // Create Fork handle
        const handleGeometry = new THREE.BoxGeometry(0.05, 0.5, 0.02);
        const handleMesh = new THREE.Mesh(handleGeometry, this.forkMaterial);
        handleMesh.position.set(0, -0.25, 0);
        forkGroup.add(handleMesh);

        // Create Fork prongs
        for (let i = 0; i < 4; i++) {
            const prongGeometry = new THREE.BoxGeometry(0.01, 0.2, 0.01);
            const prongMesh = new THREE.Mesh(prongGeometry, this.forkMaterial);
            prongMesh.position.set((i - 1.5) * 0.02, 0.1, 0);
            forkGroup.add(prongMesh);
        }

        // Group transformations
        forkGroup.rotation.x = Math.PI / 2; // Rotate 90 degrees around X-axis
        forkGroup.rotation.z = Math.PI / 2; // Rotate 90 degrees around Z-axis

        return forkGroup;
    }

}

export { Fork };