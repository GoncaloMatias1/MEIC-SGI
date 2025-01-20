import * as THREE from 'three';

/**
    This class represents the Carpet
*/ 
class Carpet {
    /**
       constructs the object
       @param {MyApp} app The application object
    */ 
    constructor(app) {
        this.app = app;

        // Init texture loader
        this.textureLoader = new THREE.TextureLoader();

        // Carpet Material
        this.carpetTexture = this.textureLoader.load('textures/carpet.jpg');
        this.carpetMaterial = new THREE.MeshLambertMaterial({
            color: 0xFFFFFF,
            map: this.carpetTexture
        });

    }

    /**
       creates the carpet mesh
    */ 
    create() {
        // Creates the carpet mesh
        const carpet = new THREE.BoxGeometry(11, 0.08, 9);
        const carpetMesh = new THREE.Mesh(carpet, this.carpetMaterial);

        // Carpet Transformations
        carpetMesh.position.set(0, 0, 6);

        // Enable shadow projection
        carpetMesh.receiveShadow = true;

        return carpetMesh;
    }

}

export { Carpet };
