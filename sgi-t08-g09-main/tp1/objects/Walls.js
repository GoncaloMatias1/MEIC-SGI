// objects/Walls.js
import * as THREE from 'three';
import { Painting } from './Painting.js';
import { Window } from './Window.js';
import { Door } from './Door.js';

/**
    This class represents the Walls
*/ 
class Walls {
    /**
       constructs the object
       @param {MyApp} app The application object
    */ 
    constructor(app) {
        this.app = app;

        // Init texture loader
        this.textureLoader = new THREE.TextureLoader();

        // Wall Material
        this.color = 0xcccccc;
        this.wallTexture = this.textureLoader.load('textures/wall_material.jpg');
        this.wallTexture.wrapS = THREE.RepeatWrapping;
        this.wallTexture.wrapT = THREE.RepeatWrapping;
        this.wallTexture.repeat.set(4, 3);
        this.wallMaterial = new THREE.MeshLambertMaterial({ 
            color: this.color,
            map: this.wallTexture,
        });

        // Walls Attributes
        this.walls = [];
        this.paintings = [];
        this.window = new Window(app, 12, 6);
        this.door = new Door(app);
    }

    /**
       creates the walls mesh
    */ 
    create() {
        // Create Geometry for left and right wall
        const wallGeometryLeftRight = new THREE.PlaneGeometry(30, 10);
        
        // Create Right wall
        const rightWall = new THREE.Mesh(wallGeometryLeftRight, this.wallMaterial);
        rightWall.position.set(10, 5, 0);
        rightWall.rotation.y = -Math.PI / 2;
        rightWall.receiveShadow = true;
        this.walls.push(rightWall);
    
        // Create Left wall
        const leftWall = new THREE.Mesh(wallGeometryLeftRight, this.wallMaterial);
        leftWall.position.set(-10, 5, 0);
        leftWall.rotation.y = Math.PI / 2;
        leftWall.receiveShadow = true;
        this.walls.push(leftWall);

        // Create Geometry for front and back wall
        const wallGeometryFrontBack = new THREE.PlaneGeometry(20, 10)

        // Create Back wall
        const backWall = new THREE.Mesh(wallGeometryFrontBack, this.wallMaterial);
        backWall.position.set(0, 5, -15);
        backWall.receiveShadow = true;
        this.walls.push(backWall);
    
        // Create Front wall (with window)
        const frontWall = new THREE.Mesh(wallGeometryFrontBack, this.wallMaterial);
        frontWall.position.set(0, 5, 15);
        frontWall.rotation.y = Math.PI;
        frontWall.receiveShadow = true;
        this.walls.push(frontWall);
    
        // create paintings
        const painting1 = new Painting(
            this.app,
            'textures/goncalo.jpg',
            new THREE.Vector3(10, 6.5, -4), 
            new THREE.Euler(0, -Math.PI / 2, 0) 
        );
        const painting1Mesh = painting1.create();
        this.paintings.push(painting1Mesh);
        this.walls.push(painting1Mesh);
        const painting2 = new Painting(
            this.app,
            'textures/pedro.jpg', 
            new THREE.Vector3(10, 6.5, 4), 
            new THREE.Euler(0, -Math.PI / 2, 0) 
        );
        const painting2Mesh = painting2.create();
        this.paintings.push(painting2Mesh);
        this.walls.push(painting2Mesh);

        // Create window
        const windowMesh = this.window.create();
        windowMesh.position.set(0, 6, -14.9); 
        this.walls.push(windowMesh);

        // Create door
        const doorMesh = this.door.create();
        doorMesh.position.set(-6, 0, 14.9);  
        this.walls.push(doorMesh);

        return this.walls;
    }

}

export { Walls };