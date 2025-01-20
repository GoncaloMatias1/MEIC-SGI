// objects/Candle.js
import * as THREE from 'three';

/**
    This class represents the Candle
*/ 
class Candle {

    /**
       constructs the object
       @param {MyApp} app The application object
    */ 
    constructor(app) {
        this.app = app;

        // Init texture loader
        this.textureLoader = new THREE.TextureLoader();

        // Candle Material
        this.candleTexture = this.textureLoader.load('textures/candle.jpg');
        this.candleMaterial = new THREE.MeshPhongMaterial({
            map: this.candleTexture,
            specular: 0x111111,
            shininess: 100
        });

        // Flame Material
        this.flameColor = '#FF0000';
        this.flameMaterial = new THREE.MeshPhongMaterial({
            color: this.flameColor,
            specular: 0x111111,
            shininess: 100
        });
    }

    /**
       creates the candle mesh
    */ 
    createCandle() {
        // Creates the candle mesh
        const candleGeometry = new THREE.CylinderGeometry(0.025, 0.025, 0.4, 32);
        const candleMesh = new THREE.Mesh(candleGeometry, this.candleMaterial);

        // Candle transformations
        candleMesh.position.set(0, 4, 0);

        // Enable shadow
        candleMesh.castShadow = true;

        return candleMesh;
    }

    /**
       creates the flame mesh
    */ 
    createFlame() {
        // Create the flame mesh
        const flameGeometry = new THREE.ConeGeometry(0.025, 0.1, 32);
        const flameMesh = new THREE.Mesh(flameGeometry, this.flameMaterial);

        // Flame transformations
        flameMesh.position.set(0, 4.25, 0);
        
        return flameMesh;
    }

}

export { Candle };