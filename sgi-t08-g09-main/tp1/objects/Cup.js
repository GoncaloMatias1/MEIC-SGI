// objects/Cup.js

import * as THREE from 'three';

/**
    This class represents the Cup
*/ 
class Cup {
    /**
       constructs the object
       @param {MyApp} app The application object
    */ 
    constructor(app) {
        this.app = app;

        // Cup Material
        this.cupColor = '#FFFFFF'; 
        this.cupMaterial = new THREE.MeshPhongMaterial({
            color: this.cupColor,
            specular: 0x111111,
            shininess: 1,
            side: THREE.DoubleSide
        });
    }

    /**
       creates the cup mesh
    */ 
    create() {
        // Creates the cup and the cup bottom cap mesh
        const cupGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.6, 32, 1, true);
        const cupMesh = new THREE.Mesh(cupGeometry, this.cupMaterial)
        const capGeometry = new THREE.CircleGeometry(0.1, 32)
        const capMesh = new THREE.Mesh(capGeometry, this.cupMaterial)

        // Meshes Tranformations
        cupMesh.position.set(-2.5, 3.2, -1);
        capMesh.rotation.x = Math.PI / 2;
        capMesh.position.set(-2.5, 3.2, -1); 

        // Enable shadow
        cupMesh.castShadow = true;

        // Create group and add meshes
        const group = new THREE.Group();
        group.add(cupMesh);
        group.add(capMesh);

        return group;
    }

}

export { Cup };