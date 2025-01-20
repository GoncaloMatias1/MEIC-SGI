import * as THREE from 'three';

// This class handles all the global stuff in our 3D scene - like lighting, background, and atmosphere
class GlobalsNode {

    // When we create this class, we pass in our app and some setup data
    constructor(app, data) {
        // Keep track of our app so we can use it later
        this.app = app;

        // Go through all the settings we got
        for (let key in data){
            switch (key) {
                case 'background':
                    // Set up the scene's background color
                    this.parseBackground(data[key]);
                    break;
        
                case 'ambient':
                    // Add general lighting to the whole scene
                    this.parseAmbientLight(data[key]);
                    break;

                case 'fog':
                    // Add some atmosphere with fog effects
                    this.parseFog(data[key]);
                    break;

                case 'skybox':
                    // Create a cool skybox (the background images that make it look like there's a sky)
                    this.parseSkybox(data[key]);
                    break;

                default:
                    break;
            }
        }
    }

    // Sets up the background color of our scene
    parseBackground(data) {
        // Create a new color using RGB values (red, green, blue)
        const backgroundColor = new THREE.Color(
            data.r,
            data.g,
            data.b
        )

        // Apply this color to our scene's background
        this.app.scene.background = backgroundColor; 
    }

    // Adds ambient light - this is like the general brightness in the scene
    parseAmbientLight(data) {
        // Create a color for our ambient light
        const ambientLightColor = new THREE.Color(
            data.r,
            data.g,
            data.b
        );

        // Make a new ambient light with our color and intensity (brightness)
        // If no intensity is given, we use 1 as default
        const ambientLight = new THREE.AmbientLight(ambientLightColor, data.intensity || 1);        
        this.app.scene.add(ambientLight);
    }  

    // Adds fog to our scene for a more realistic look
    parseFog(data) {
        // Set up the fog color (defaults to white if no color given)
        const fogColor = new THREE.Color(
            data.color.r || 1,
            data.color.g || 1,
            data.color.b || 1
        );

        // Create fog with our color and how far you can see through it
        const fog = new THREE.Fog(fogColor, data.near|| 1.0, data.far || 100.0);
        this.app.scene.fog = fog;
    }

    // Creates a skybox - like a big box around everything with pictures of the sky
    parseSkybox(data) {
        // Make a box shape for our skybox
        const geometry = new THREE.BoxGeometry(data.size.x, data.size.y, data.size.z);

        // Get ready to load our skybox images
        const loader = new THREE.TextureLoader();
        // Create materials for each side of the box using our images
        // BackSide means we're looking at the inside of the box
        const materials = [
            new THREE.MeshStandardMaterial({ map: loader.load(data.right), side: THREE.BackSide }),  // Right side
            new THREE.MeshStandardMaterial({ map: loader.load(data.left), side: THREE.BackSide }),   // Left side
            new THREE.MeshStandardMaterial({ map: loader.load(data.up), side: THREE.BackSide }),     // Top
            new THREE.MeshStandardMaterial({ map: loader.load(data.down), side: THREE.BackSide }),   // Bottom
            new THREE.MeshStandardMaterial({ map: loader.load(data.front), side: THREE.BackSide }),  // Front
            new THREE.MeshStandardMaterial({ map: loader.load(data.back), side: THREE.BackSide })    // Back
        ];

        // Create our skybox using the box shape and materials
        const skybox = new THREE.Mesh(geometry, materials);

        // Put the skybox in the right place
        skybox.position.set(data.center.x, data.center.y, data.center.z);

        // Set up how the skybox glows (emissive properties)
        const emissiveColor = new THREE.Color(data.emissive.r, data.emissive.g, data.emissive.b);
        materials.forEach(material => {
            material.emissive = emissiveColor;
            material.emissiveIntensity = data.intensity;
        });

        // Add our finished skybox to the scene
        this.app.scene.add(skybox);
    }
}

export { GlobalsNode }