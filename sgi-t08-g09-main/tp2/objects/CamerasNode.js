import * as THREE from 'three';

// This class handles all the camera setup in our 3D scene
class CamerasNode {

    // When we create a new CamerasNode, we pass in our app and camera data
    constructor(app, data) {
        // Store the app reference so we can use it later
        this.app = app

        // Loop through all the camera data we received
        for (let key in data){
            switch (key) {
                case 'initial':
                    // Save which camera should be the starting camera
                    this.initialCamera = data[key];
                    break;
            
                default:
                    // Create each camera and store it in our app's camera collection
                    this.app.cameras[key] =  this.createCamera(data[key])
                    break;
            }
        }

        // Set up our starting camera using the saved initial camera info
        this.setInitialCamera(this.initialCamera, data[this.initialCamera]);

        // Let the app know we've updated the camera list
        this.app.onCameraListUpdated();
    }

    // This function sets up our starting camera and its target point
    setInitialCamera(cam, data) {
        // Check if the camera we want to use exists
        if (cam in this.app.cameras) {
            // Make this camera the active one
            this.app.setActiveCamera(cam)
            // Create a point in 3D space for the camera to look at
            const target = new THREE.Vector3(data.target.x, data.target.y, data.target.z);
            // Tell the orbit controls where to look
            this.app.controls.target.copy(target); // Set initial target for OrbitControls
            // Update the controls to apply changes
            this.app.controls.update();        
        }
    }

    // This function creates a new camera based on the settings we give it
    createCamera(data) {
        let camera;

        switch (data.type) {
            case 'perspective':
                // Create a perspective camera (this is like human eyes - things far away look smaller)
                camera = new THREE.PerspectiveCamera(
                    data.angle || 45,     // Field of view - how wide we can see
                    data.aspect || 1,     // Aspect ratio - usually screen width/height
                    data.near || 1,       // Nearest thing we can see
                    data.far || 1000      // Farthest thing we can see
                );
                break;
        
            default:
                // Create an orthographic camera (this is like an architect's view - no perspective)
                camera = new THREE.OrthographicCamera(
                    data.left,            // Left boundary of view
                    data.right,           // Right boundary of view
                    data.top,             // Top boundary of view
                    data.bottom,          // Bottom boundary of view
                    data.near || 1,       // Nearest thing we can see
                    data.far || 1000      // Farthest thing we can see
                );
                break;
        }
        
        // If we specified a location, move the camera there
        if (data.location) {
            camera.position.set(
                data.location.x,          // X position in 3D space
                data.location.y,          // Y position in 3D space
                data.location.z           // Z position in 3D space
            );
        }
        
        // Send back our newly created camera
        return camera;
    }
}

export { CamerasNode }