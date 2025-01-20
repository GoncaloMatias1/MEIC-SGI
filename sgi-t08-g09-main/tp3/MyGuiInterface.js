import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { MyApp } from './MyApp.js';
import { MyContents } from './MyContents.js';

// This class handles all those control panels we made for adjusting stuff
class MyGuiInterface {
    constructor(app) {
        this.app = app;                         // Keep track of our main app
        //this.datgui = new GUI();               // Create the main control panel
        this.contents = null;                   // We'll store our scene content here later
        
    }

    // Store our scene contents for later use
    setContents(contents) {
        this.contents = contents;
    }

    // Initialize all our control panels
    init() {
  
    }
    
}

export { MyGuiInterface };