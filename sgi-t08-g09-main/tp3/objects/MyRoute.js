import * as THREE from 'three';

class MyRoute {
    constructor(app, data) {
        this.app = app;
        const reversedData = [...data].reverse();
        this.points = reversedData.map(point => new THREE.Vector3(point.x, 10, point.z));
    }

    get_points() {
        return this.points;
    }
}

export { MyRoute }