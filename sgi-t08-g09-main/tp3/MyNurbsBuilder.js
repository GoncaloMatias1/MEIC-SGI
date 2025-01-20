import * as THREE from 'three';
import { NURBSSurface } from 'three/addons/curves/NURBSSurface.js';
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';

/**
 * This class builds NURBS surfaces - these are smooth, curved surfaces in 3D
 */

class MyNurbsBuilder  {
    /**
     * Set up our NURBS builder
     * @param {MyApp} app Reference to our main app
     */
    constructor(app) {
        this.app = app                  // Store the app reference for later
    }

    // This function creates the actual NURBS surface
    // controlPoints: the points that define our surface shape
    // degree1, degree2: how smooth the surface is in each direction
    // samples1, samples2: how detailed the surface mesh should be
    build(controlPoints, degree1, degree2, samples1, samples2) {

        const knots1 = []               // Array for first set of knots (surface parameters)
        const knots2 = []               // Array for second set of knots

        // Create the first set of knots
        // Example: for degree1 = 2, makes [0, 0, 0, 1, 1, 1]
        // These tell the surface where to start and end
        for (var i = 0; i <= degree1; i++) {
            knots1.push(0)              // Add zeros at the start
        }
        for (var i = 0; i <= degree1; i++) {
            knots1.push(1)              // Add ones at the end
        }

        // Create the second set of knots
        // Same as above but for the other direction of the surface
        for (var i = 0; i <= degree2; i++) {
            knots2.push(0)              // Add zeros at the start
        }
        for (var i = 0; i <= degree2; i++) {
            knots2.push(1)              // Add ones at the end
        }

        // Convert our control points into the right format
        let stackedPoints = []
        for (var i = 0; i < controlPoints.length; i++) {
            let row = controlPoints[i]           // Get each row of points
            let newRow = []

            for (var j = 0; j < row.length; j++) {
                let item = row[j]
                // Convert each point to a Vector4 (x, y, z, w)
                // w is the "weight" - affects how much this point pulls on the surface
                newRow.push(new THREE.Vector4(item[0],
                item[1], item[2], item[3]));
            }

            stackedPoints[i] = newRow;          // Store the converted row
        }

        // Create the NURBS surface using all our data
        const nurbsSurface = new NURBSSurface( degree1, degree2, knots1, knots2, stackedPoints );
        // Create the actual 3D geometry we can display
        const geometry = new ParametricGeometry( getSurfacePoint, samples1, samples2 );

        return geometry;                        // Return our finished surface geometry

        // Helper function that gets points on our surface at given coordinates (u,v)
        function getSurfacePoint( u, v, target ) {
            return nurbsSurface.getPoint( u, v, target );
        }
    }
}

export { MyNurbsBuilder };