import * as THREE from 'three';

/**
    This class represents the cake object
*/ 
class Cake {
    /**
       constructs the object
       @param {MyApp} app The application object
    */ 
    constructor(app) {
        this.app = app;

        // Init texture loader
        this.textureLoader = new THREE.TextureLoader();

        // Cake material
        this.cakeTexture = this.textureLoader.load('textures/cake_texture.jpg')
        this.cakeTexture.wrapS = THREE.RepeatWrapping;
        this.cakeTexture.wrapT = THREE.RepeatWrapping;
        this.cakeTexture.repeat.set(1, 0.7);
        this.cakeMaterial = new THREE.MeshPhongMaterial({ map : this.cakeTexture })

        // Cake Top Material
        this.cakeTopTexture = this.textureLoader.load('textures/cake_texture2.jpg')
        this.cakeTopTexture.wrapS = THREE.RepeatWrapping;
        this.cakeTopTexture.wrapT = THREE.RepeatWrapping;
        this.cakeTopMaterial = new THREE.MeshPhongMaterial({ map : this.cakeTopTexture })
    }

    /**
       creates and returns the cake mesh
    */ 
    create() {
        // Creates cake group
        const cakeGroup = new THREE.Group()

        // Creates cake top shape, geometry and mesh
        const cakeTopShape = new THREE.Shape();
        cakeTopShape.arc(0, 0, 1, Math.PI / 6, false);
        cakeTopShape.lineTo(0, 0);
        const cakeTopGeometry = new THREE.ExtrudeGeometry(cakeTopShape, {depth: 0.01, bevelEnabled: false})
        const cakeTopMesh = new THREE.Mesh(cakeTopGeometry, this.cakeTopMaterial)
        cakeTopMesh.position.set(0, 0, -0.01)
        cakeGroup.add(cakeTopMesh)

        // Creates cake shape, geometry and mesh
        const cakeShape = new THREE.Shape();
        cakeShape.arc(0, 0, 1, Math.PI / 6, false);
        cakeShape.lineTo(0, 0);
        const extrudeSettings = {
            depth: 1,
            bevelEnabled: false
        };
        const cakeGeometry = new THREE.ExtrudeGeometry(cakeShape, extrudeSettings);
        const cakeMesh = new THREE.Mesh(cakeGeometry, this.cakeMaterial);
        cakeMesh.castShadow = true;
        cakeGroup.add(cakeMesh)

        // Cake Transformations
        cakeGroup.rotation.x = Math.PI / 2;
        cakeGroup.rotation.z = Math.PI / 6;
        cakeGroup.position.set(0, 3.8, 0);
        cakeGroup.scale.set(0.8, 0.8, 0.8);

        return cakeGroup;
    }

}

export { Cake };