// objects/Slice.js
import * as THREE from 'three';

/**
    This class represents the cake slice
*/ 
class Slice {
    /**
       constructs the object
       @param {MyApp} app The application object
    */ 
    constructor(app) {
        this.app = app;

        // Init texture loader
        this.textureLoader = new THREE.TextureLoader();

        // Slice Top Material
        this.sliceColor = '#e9c3db';
        this.sliceTopTexture = this.textureLoader.load('textures/cake_texture2.jpg')
        this.sliceTopTexture.wrapS = THREE.RepeatWrapping;
        this.sliceTopTexture.wrapT = THREE.RepeatWrapping;
        this.sliceTopMaterial = new THREE.MeshPhongMaterial({ map : this.sliceTopTexture })
    
        // Slice Material
        this.sliceTexture = this.textureLoader.load('textures/cake_texture.jpg')
        this.sliceTexture.wrapS = THREE.RepeatWrapping;
        this.sliceTexture.wrapT = THREE.RepeatWrapping;
        this.sliceTexture.repeat.set(1, 0.7);
        this.sliceMaterial = new THREE.MeshPhongMaterial({ map : this.sliceTexture })
    }

    /**
       creates and returns the cake slice mesh
    */ 
    create() {
        // Creates cake slice group
        const sliceGroup = new THREE.Group()

        // Creates cake slice top shape, geometry and mesh
        const sliceTopShape = new THREE.Shape();
        sliceTopShape.arc(0, 0, 1, 2 * Math.PI - Math.PI / 6, false);
        sliceTopShape.lineTo(0, 0);
        const sliceTopGeometry = new THREE.ExtrudeGeometry(sliceTopShape, {
            depth: 0.01,
            bevelEnabled: false
        });
        const sliceTopMesh = new THREE.Mesh(sliceTopGeometry, this.sliceTopMaterial);
        sliceTopMesh.position.set(0, 0, 0.8)
        sliceGroup.add(sliceTopMesh)

        // Creates cake slcie shape, geometry and mesh
        const sliceShape = new THREE.Shape();
        sliceShape.arc(0, 0, 1, 2 * Math.PI - Math.PI / 6, false);
        sliceShape.lineTo(0, 0);
        const extrudeSettings = {
            depth: 0.8, // Height of the slice
            bevelEnabled: false // Sharp edge
        };
        const sliceGeometry = new THREE.ExtrudeGeometry(sliceShape, extrudeSettings);
        const sliceMesh = new THREE.Mesh(sliceGeometry, this.sliceMaterial);
        sliceMesh.castShadow = true;
        sliceGroup.add(sliceMesh)
        
        // Cake Slice Transformations
        sliceGroup.rotation.z = Math.PI / 6;
        sliceGroup.position.set(2.1, 3.17, -0.3); // Position it slightly above plate
        sliceGroup.scale.set(0.8, 0.8, 0.8);
        
        return sliceGroup;
    }

}

export { Slice };