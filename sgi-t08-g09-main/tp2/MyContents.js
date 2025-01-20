import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { MyFileReader } from './parser/MyFileReader.js';
import { GlobalsNode } from './objects/GlobalsNode.js';
import { CamerasNode } from './objects/CamerasNode.js';
import { GraphNode } from './objects/GraphNode.js';


/**
 * This is where we manage all the content in our 3D app
 */
class MyContents {

    /**
     * Sets up our content manager
     * @param {MyApp} app The main application
     */
    constructor(app) {
        this.app = app                  // Store reference to our main app
        this.axis = null                // We'll create the axis system later

        // Create a file reader and tell it what to do when it's done loading
        this.reader = new MyFileReader(this.onSceneLoaded.bind(this));
        // Load our 3D scene from this file
        this.reader.open("scenes/room/room.json");
        this.soro = null;               // We'll store a special object here later
    }

    /**
     * Gets called when we need to set up our content
     */
    init() {
        // Only create the axis once to avoid duplicates
        if (this.axis === null) {
            // Make the XYZ arrows for our scene
            this.axis = new MyAxis(this)
            // We could add the axis to the scene here if we uncomment this:
            //this.app.scene.add(this.axis)
        }
    }

    /**
     * Gets called when our scene file is done loading
     * @param {Object} data All the scene info from our file
     */
    onSceneLoaded(data) {
        console.info("YASF loaded.")    // Let us know the file loaded ok
        this.onAfterSceneLoadedAndBeforeRender(data);  // Process the scene data
    }

    // Helper function to print out our scene data nicely
    printYASF(data, indent = '') {
        for (let key in data) {
            if (typeof data[key] === 'object' && data[key] !== null) {
                console.log(`${indent}${key}:`);
                this.printYASF(data[key], indent + '\t');
            } else {
                console.log(`${indent}${key}: ${data[key]}`);
            }
        }
    }

    // Does all the setup work with our loaded scene data
    onAfterSceneLoadedAndBeforeRender(data) {
        // Uncomment this to see the data structure:
        //this.printYASF(data)
        
        // Check if our data is in the right format
        if ('yasf' in data) { data = data['yasf'] } 
        else { 
            console.log('Error parsing the json file');
            return;
        }

        // Go through all the parts of our scene
        for (let key in data) {
            switch (key) {
                case 'globals':
                    // Set up scene-wide stuff like lighting and background
                    this.globalsNode = new GlobalsNode(this.app, data[key]);
                    break;
                case 'cameras':
                    // Set up all our camera views
                    this.camerasNode = new CamerasNode(this.app, data[key]);
                    break;
                case 'graph':
                    // Create all our 3D objects and structure
                    this.graphNode = new GraphNode(this.app, data);
                    // Find our main scene object
                    const rootNode = this.graphNode.getNode(data[key].rootid);
                    if (rootNode) {
                        console.log('rootnode', rootNode);                        
                        this.app.scene.add(rootNode);  // Add everything to our scene
                    } else {
                        console.error('Root node not found.');
                    }
                    break;
                default:
                    break;
            }
        }
    }

    // Helper function to get a specific object called 'soro'
    getSoro() {
        return this.graphNode.getNode('soro');
    }

    // Helper function to get our scene's lights
    getLights() {
        const sceneNode = this.graphNode?.getNode('scene');
        if (!sceneNode) return null;

        // Find and return both types of lights
        return {
            pointLight: sceneNode.children.find(child => child.name === 'pointLight'),
            spotLight: sceneNode.children.find(child => child.name === 'spotLight')
        };
    }

    // This will run every frame if we need to update anything
    update() {
    }
}

export { MyContents };