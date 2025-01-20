// objects/Plate.js
import * as THREE from 'three';

/**
    This class represents the Plate
*/ 
class Plate {

    /**
       constructs the object
       @param {MyApp} app The application object
    */ 
    constructor(app) {
        this.app = app;

        // Plate Material
        this.plateColor = '#FFFFFF'; 
        this.plateMaterial = new THREE.MeshPhongMaterial({
            color: this.plateColor,
            specular: 0x111111,
            shininess: 100
        });
    }

    /**
       creates the plate mesh
    */ 
    create() {
        // Creates the plate mesh
        const plateGeometry = new THREE.CylinderGeometry(1, 0.75, 0.1, 64);
        const plateMesh = new THREE.Mesh(plateGeometry, this.plateMaterial);

        // Plate transformations
        plateMesh.position.set(0, 3.15, 0);

        // Enable shadow 
        plateMesh.castShadow = true;
        plateMesh.receiveShadow = true;

        return plateMesh;
    }

}

export { Plate };