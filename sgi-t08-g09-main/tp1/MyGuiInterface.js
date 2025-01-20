import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { MyApp } from './MyApp.js';
import { MyContents } from './MyContents.js';

/**
    This class customizes the gui interface for the app
*/
class MyGuiInterface  {

    /**
     * 
     * @param {MyApp} app The application object 
     */
    constructor(app) {
        this.app = app
        this.datgui =  new GUI();
        this.contents = null
    }

    /**
     * Set the contents object
     * @param {MyContents} contents the contents objects 
     */
    setContents(contents) {
        this.contents = contents
    }

    /**
     * Initialize the gui interface
     */
    init() {

        // adds a folder to the gui interface for the camera
        const cameraFolder = this.datgui.addFolder('Camera')
        cameraFolder.add(this.app, 'activeCameraName', [ 'Perspective 1', 'Perspective 2', 'Left', 'Top', 'Front', 'Right', 'Back'] ).name("active camera");
        // note that we are using a property from the app 
        cameraFolder.add(this.app.activeCamera.position, 'x', -30, 30).name("x coord")
        cameraFolder.add(this.app.activeCamera.position, 'y', 0, 20).name("y coord")
        cameraFolder.add(this.app.activeCamera.position, 'z', -30, 30).name("z coord")
        cameraFolder.open()

        // Add toggle for all light helpers
        const helpersFolder = this.datgui.addFolder('Light Helpers');
        const allHelpers = {
            visible: false // Start disabled by default
        };

        // Function to update the visibility of all helpers
        helpersFolder.add(allHelpers, 'visible').name('Show Helpers').onChange((value) => {
            this.contents.pointLightHelper.visible = value;
            this.contents.directionalLightHelper.visible = value;
            this.contents.spotLightHelper.visible = value;
        });

        // Add controls for light intensity
        const lightsFolder = this.datgui.addFolder('Light Intensities');
        lightsFolder.add(this.contents.pointLight, 'intensity', 0, 100).name('Point Light');
        lightsFolder.add(this.contents.directionalLight, 'intensity', 0, 10).name('Directional Light');
        lightsFolder.add(this.contents.spotlight, 'intensity', 0, 10).name('Spotlight');
        lightsFolder.open();
    }
}

export { MyGuiInterface };