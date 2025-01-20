// objects/Napkin.js
import * as THREE from 'three';

/**
    This class represents the Napkin
*/ 
class Napkin {

    /**
       constructs the object
       @param {MyApp} app The application object
    */ 
    constructor(app) {
        this.app = app;

        // Napkin Material
        this.napkinColor = '#FFFFFF';  // White color
        this.napkinMaterial = new THREE.MeshPhongMaterial({
            color: this.napkinColor,
            side: THREE.DoubleSide,
            specular: 0x222222,
            shininess: 10
        });
    }

    /**
       creates the napkin mesh
    */
    create() {
        // Create napkin shape
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(1, 0);
        shape.lineTo(0, 1);
        shape.lineTo(0, 0);

        // Create napkin mesh
        const geometry = new THREE.ShapeGeometry(shape);
        const positions = geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1];
            positions[i + 2] = 0.05 * Math.sin(2 * Math.PI * x) * Math.sin(2 * Math.PI * y);
        }
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();
        const napkinMesh = new THREE.Mesh(geometry, this.napkinMaterial);
        
        return napkinMesh;
    }

}

export { Napkin };