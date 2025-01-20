import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { Walls } from './objects/Walls.js';
import { Table } from './objects/Table.js';
import { Plate } from './objects/Plate.js';
import { Cake } from './objects/Cake.js';
import { Candle } from './objects/Candle.js';
import { Slice } from './objects/Slice.js';
import { Cup } from './objects/Cup.js';
import { Fork } from './objects/Fork.js';
import { Napkin } from './objects/Napkin.js';
import { Knife } from './objects/Knife.js';
import { Chair } from './objects/Chair.js';
import { Beetle } from './objects/Beetle.js';
import { Spring } from './objects/Spring.js';
import { Jar } from './objects/Jar.js';
import { Lamp } from './objects/Lamp.js';
import { Newspaper } from './objects/Newspaper.js';
import { Flower } from './objects/Flower.js';
import { Carpet } from './objects/Carpet.js';
import { Couch } from './objects/Couch.js';
import { FloorLamp } from './objects/FloorLamp.js';
import { TV } from './objects/TV.js';

/**
 *  This class contains the contents of out application
 */
class MyContents  {

    /**
       constructs the object
       @param {MyApp} app The application object
    */ 
    constructor(app) {
        this.app = app

        // init texture loader
        this.textureLoader = new THREE.TextureLoader();

        // Plane Texture
        this.planeTexture = this.textureLoader.load('textures/floor.jpg');
        this.planeTexture.wrapS = THREE.RepeatWrapping;
        this.planeTexture.wrapT = THREE.RepeatWrapping;
        // Plane Material
        this.diffusePlaneColor = "rgb(128,128,128)"
        this.specularPlaneColor = "rgb(0,0,0)"
        this.planeShininess = 0
        this.planeMaterial = new THREE.MeshLambertMaterial({ map : this.planeTexture, color: 0x55463c })

        this.walls = new Walls(this.app);
        this.table = new Table(this.app);
        this.plate = new Plate(this.app);
        this.cake = new Cake(this.app);
        this.candle = new Candle(this.app);
        this.slice = new Slice(this.app);
        this.cup = new Cup(this.app);
        this.fork = new Fork(this.app);
        this.napkin = new Napkin(this.app);
        this.knife = new Knife(this.app);
        this.chair = new Chair(this.app);
        this.beetle = new Beetle(this.add); 
        this.spring = new Spring(this.app);
        this.jar = new Jar(this.app);
        this.lamp = new Lamp(this.app);
        this.newspaper = new Newspaper(this.app);
        this.flower = new Flower(this.app);
        this.carpet = new Carpet(this.app);
        this.couch = new Couch(this.app);
        this.floorlamp = new FloorLamp(this.app);
        this.tv = new TV(this.app);
    }

    /**
     * initializes the contents
     */
    init() {
        // add a point light on top of the model
        this.pointLight = new THREE.PointLight( 0xffffff, 20, 0 );
        this.pointLight.position.set( 8, 8.2, 13);
        this.pointLight.castShadow = true;
        this.app.scene.add( this.pointLight );
        // add a point light helper for the previous point light
        const sphereSize = 0.5;
        this.pointLightHelper = new THREE.PointLightHelper( this.pointLight, sphereSize );
        this.pointLightHelper.visible = false;
        this.app.scene.add(this.pointLightHelper);

        // add a directional light on the window
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
        this.directionalLight.position.set(0, 8, -18);  // Position above and slightly outside the window
        this.directionalLight.castShadow = true;
        // Configure shadow properties of the directional light
        this.directionalLight.shadow.mapSize.width = 1024;
        this.directionalLight.shadow.mapSize.height = 1024;
        this.directionalLight.shadow.camera.near = 0.5;
        this.directionalLight.shadow.camera.far = 100;
        this.directionalLight.shadow.camera.left = -15;
        this.directionalLight.shadow.camera.right = 15;
        this.directionalLight.shadow.camera.top = 15;
        this.directionalLight.shadow.camera.bottom = -15;
        this.app.scene.add(this.directionalLight);
        // add a directional light helper
        this.directionalLightHelper = new THREE.DirectionalLightHelper( this.directionalLight, 5 );
        this.directionalLightHelper.visible = false;
        this.app.scene.add(this.directionalLightHelper);

        // add an ambient light
        this.ambientLight = new THREE.AmbientLight( 0x888888 );
        this.app.scene.add( this.ambientLight );

        // Modified the existing plane to act as the floor
        let planeSizeU = 20;
        let planeSizeV = 30;
        let planeUVRate = planeSizeV / planeSizeU;
        let planeTextureUVRate = 225 / 225; // image dimensions
        let planeTextureRepeatU = 7;
        let planeTextureRepeatV = planeTextureRepeatU * planeUVRate * planeTextureUVRate;
        this.planeTexture.repeat.set(planeTextureRepeatU, planeTextureRepeatV);
        this.planeTexture.rotation = 0;
        this.planeTexture.offset = new THREE.Vector2(0,0);
        var plane = new THREE.PlaneGeometry( planeSizeU, planeSizeV );  
        this.planeMesh = new THREE.Mesh( plane, this.planeMaterial );
        this.planeMesh.receiveShadow = true;
        this.planeMesh.rotation.x = -Math.PI / 2;  
        this.planeMesh.position.y = 0;  // Floor at ground level (y=0)
        this.app.scene.add( this.planeMesh );  // Reuse plane as floor

        // Add walls
        const walls = this.walls.create();
        walls.forEach(wall => {
            this.app.scene.add(wall);
        });

        // Add table group
        const tableGroup = this.createTableGroup();
        this.app.scene.add(tableGroup);

        // Add couch group
        const couchGroup = this.createCouchGroup();
        this.app.scene.add(couchGroup);

        // Add jar group
        const jarGroup = this.createJarGroup();        
        this.app.scene.add(jarGroup);

        // Add beetle 
        const beetleMesh = this.beetle.create()
        this.app.scene.add(beetleMesh)
        
        // Add Lamp
        const lampMesh = this.lamp.create();
        this.app.scene.add(lampMesh);

        // Add carpet
        const carpetMesh = this.carpet.create();
        this.app.scene.add(carpetMesh);

        // Add floor lamp
        const floorlampMesh = this.floorlamp.create();
        this.app.scene.add(floorlampMesh)

        // Add tv
        const tvMesh = this.tv.create();
        this.app.scene.add(tvMesh);
    }

    /**
     * creates and returns table group
     */
    createTableGroup() {
        // Create Table Group
        const tableGroup = new THREE.Group();

        // Add Table
        const tableMesh = this.table.create();
        tableMesh.castShadow = true;
        tableGroup.receiveShadow = true;
        tableGroup.add(tableMesh);

        // Add Cups
        const cupMesh1 = this.cup.create();
        tableGroup.add(cupMesh1);
        const cupMesh2 = this.cup.create();
        cupMesh2.translateZ(0.5);
        tableGroup.add(cupMesh2);
        const cupMesh3 = this.cup.create();
        cupMesh3.translateX(-0.5);
        tableGroup.add(cupMesh3);
        const cupMesh4 = this.cup.create();
        cupMesh4.translateX(-0.5);
        cupMesh4.translateZ(0.5);
        tableGroup.add(cupMesh4);

        // Add fork
        const forkMesh = this.fork.create();
        forkMesh.position.set(2.4, 3.12, -0.7); 
        tableGroup.add(forkMesh);

        // Add knife
        const knifeMesh = this.knife.create();
        knifeMesh.position.set(2.4, 3.12, -0.9);  
        knifeMesh.rotation.y = Math.PI;  
        knifeMesh.rotation.z = Math.PI/2;  
        tableGroup.add(knifeMesh);

        // Add napkin
        const napkinMesh = this.napkin.create();
        napkinMesh.position.set(2.5, 3.12, 1.2);  
        napkinMesh.rotation.x = -Math.PI / 2;  
        napkinMesh.rotation.z = Math.PI/4;  
        napkinMesh.scale.set(0.7, 0.7, 0.7);  
        tableGroup.add(napkinMesh);

        // Add Chairs
        const chairMesh1 = this.chair.create();
        chairMesh1.position.set(1.7, 0, -2);
        tableGroup.add(chairMesh1);
        const chairMesh2 = this.chair.create();
        chairMesh2.position.set(-1.7, 0, -2);
        tableGroup.add(chairMesh2);
        const chairMesh3 = this.chair.create();
        chairMesh3.position.set(1.7, 0, 2);
        chairMesh3.rotation.y = Math.PI;
        tableGroup.add(chairMesh3);
        const chairMesh4 = this.chair.create();
        chairMesh4.position.set(-1.7, 0, 2);
        chairMesh4.rotation.y = Math.PI;
        tableGroup.add(chairMesh4);

        // Add Spring
        const springMesh = this.spring.create();
        tableGroup.add(springMesh);

        // Create cake group
        const cakeGroup = this.createCakeGroup();
        tableGroup.add(cakeGroup);

        // Create Slice group
        const sliceGroup = this.createSliceGroup();
        tableGroup.add(sliceGroup);

        tableGroup.position.set(0, 0, -8)

        return tableGroup;
    }

    /**
     * creates and returns cake group
     */
    createCakeGroup() {
        // Create Cake Group
        const cakeGroup = new THREE.Group();

        // Add plate
        const plateMesh = this.plate.create();
        cakeGroup.add(plateMesh);

        // Add cake
        const cakeMesh = this.cake.create();
        cakeGroup.add(cakeMesh);

        const candleGroup = this.createCandleGroup();
        cakeGroup.add(candleGroup);

        // add a spotlight on the cake
        this.spotlight = new THREE.SpotLight(0xffffff, 4);
        this.spotlight.castShadow = false;
        this.spotlight.position.set(0, 8, 0);
        this.spotlight.angle = Math.PI / 8;
        this.spotlight.penumbra = 0.2;
        this.spotlight.decay = 0;
        this.spotlight.distance = 6;
        this.spotlight.target = cakeMesh;
        cakeGroup.add(this.spotlight)

        // add a spotlight helper
        this.spotLightHelper = new THREE.SpotLightHelper(this.spotlight);
        this.spotLightHelper.visible = false;
        this.app.scene.add(this.spotLightHelper)

        return cakeGroup;
    }

    /**
     * creates and returns candle group
     */
    createCandleGroup() {
        // Create Candle Group
        const candleGroup = new THREE.Group();

        // Add candle
        const candleMesh = this.candle.createCandle();
        candleGroup.add(candleMesh);

        // Add flame
        const flameMesh = this.candle.createFlame();
        candleGroup.add(flameMesh);

        return candleGroup;
    }

    /**
     * creates and returns slice group
     */
    createSliceGroup() {
        // Create Slice Group
        const sliceGroup = new THREE.Group();

        // Add plate for slice
        const plateMesh2 = this.plate.create();
        plateMesh2.position.set(2.5, 3.15, 0);
        plateMesh2.scale.set(0.6, 0.6, 0.6);
        sliceGroup.add(plateMesh2);

        // Add slice to second plate
        const sliceMesh = this.slice.create();
        sliceGroup.add(sliceMesh);

        return sliceGroup;
    }

    /**
     * creates and returns couch group
     */
    createCouchGroup() {
        // Create Couch Group
        const couchGroup = new THREE.Group();

        // Add Couch
        const couchMesh = this.couch.create();
        couchGroup.add(couchMesh);

        // Add Newspaper
        const newspaperMesh = this.newspaper.create();
        newspaperMesh.position.set(7, 1.6, 5);
        couchGroup.add(newspaperMesh);

        return couchGroup;
    }

    /**
     * creates and returns jar group
     */
    createJarGroup(){
        // Create Jar Group
        const jarGroup = new THREE.Group();

        // Add Jar
        const jarMesh = this.jar.create();
        jarGroup.add(jarMesh);
        jarGroup.position.set(4, -0.18, -14)

        // Add flower
        const flowerMesh = this.flower.create();
        jarGroup.add(flowerMesh);

        return jarGroup;
    }

    /**
     * updates the contents
     * this method is called from the render method of the app
     * 
     */
    update() {

    }

}

export { MyContents };