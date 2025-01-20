// objects/Knife.js
import * as THREE from 'three';

/**
    This class represents the Knife
*/ 
class Knife {
    /**
       constructs the object
       @param {MyApp} app The application object
    */ 
    constructor(app) {
        this.app = app;

        // Knife Material
        this.knifeColor = '#C0C0C0';  // Silver color
        this.knifeMaterial = new THREE.MeshPhongMaterial({
            color: this.knifeColor,
            specular: 0x111111,
            shininess: 100
        });
    }

    /**
       creates the knife mesh
    */ 
    create() {
        // Creates the knife group
        const knifeGroup = new THREE.Group();

        // Creates the Knife blade mesh
        const bladeGeometry = new THREE.BoxGeometry(0.01, 0.5, 0.05);
        const bladeMesh = new THREE.Mesh(bladeGeometry, this.knifeMaterial);
        bladeMesh.position.set(0, 0.25, 0);
        knifeGroup.add(bladeMesh);

        // Creates the knife handle mesh
        const handleGeometry = new THREE.BoxGeometry(0.03, 0.3, 0.08);
        const handleMesh = new THREE.Mesh(handleGeometry, this.knifeMaterial);
        handleMesh.position.set(0, -0.15, 0);
        knifeGroup.add(handleMesh);

        return knifeGroup;
    }

}

export { Knife };