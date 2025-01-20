import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { MyApp } from './MyApp.js';
import { MyContents } from './MyContents.js';

// This class handles all those control panels we made for adjusting stuff
class MyGuiInterface {
    constructor(app) {
        this.app = app;                         // Keep track of our main app
        this.datgui = new GUI();               // Create the main control panel
        this.contents = null;                   // We'll store our scene content here later
        
        // Make different sections (folders) for organizing our controls
        this.cameraFolder = this.datgui.addFolder('Cameras');
        this.wireframeFolder = this.datgui.addFolder('Wireframe');
    }

    // Store our scene contents for later use
    setContents(contents) {
        this.contents = contents;
    }


    // Initialize all our control panels
    init() {
        this.initCameraControls();
        this.initWireframeControls();    
    }

    // Set up the wireframe toggle - makes objects see-through
    initWireframeControls() {
        const groupController = { wireframe: false };
    
        this.wireframeFolder.add(groupController, 'wireframe')
            .name('Toggle Wireframe')
            .onChange((value) => {
                // Apply wireframe to all mesh objects in our scene
                this.contents.getSoro().traverse((child) => {
                    if (child.isMesh && child.material) {
                        child.material.wireframe = value;
                    }
                });
            });
    }
    
    // Set up all the camera controls
    initCameraControls() {
        // This function updates the camera dropdown and position sliders
        const updateCameraSelection = () => {
            const cameraNames = Object.keys(this.app.cameras);
            const cameraController = {
                activeCamera: this.app.activeCameraName
            };
    
            // Clear out old controls if they exist
            if (this.cameraFolder) {
                this.cameraFolder.destroy();
            }
    
            // Make a new section for camera stuff
            this.cameraFolder = this.datgui.addFolder('Camera Controls');
    
            // Add dropdown to pick which camera to use
            this.cameraFolder.add(cameraController, 'activeCamera', cameraNames)
                .name('Current Camera')
                .onChange((value) => {
                    this.app.setActiveCamera(value);        // Switch cameras
                    updateCameraPositionControls();         // Update the position sliders
                });
    
            // This updates the position controls when we switch cameras
            const updateCameraPositionControls = () => {
                const activeCamera = this.app.activeCamera;
    
                if (!activeCamera) {
                    console.error("Active camera is not set.");
                    return;
                }
    
                // Remove old position controls
                if (this.cameraPosition) {
                    this.cameraPosition.destroy();
                }
    
                // Add sliders for moving the camera around
                this.cameraPosition = this.cameraFolder.addFolder('Camera Position');
                this.cameraPosition.add(activeCamera.position, 'x', -50, 50)
                    .name('Position X')
                    .onChange(() => this.app.controls.update());
                this.cameraPosition.add(activeCamera.position, 'y', -50, 50)
                    .name('Position Y')
                    .onChange(() => this.app.controls.update());
                this.cameraPosition.add(activeCamera.position, 'z', -50, 50)
                    .name('Position Z')
                    .onChange(() => this.app.controls.update());
            };
    
            // Set up initial position controls
            updateCameraPositionControls();
        };
    
        // Do the initial camera setup
        updateCameraSelection();
    
        // Update controls if cameras change later
        this.app.onCameraListUpdated = () => {
            updateCameraSelection();
        };
    }
    
}

export { MyGuiInterface };