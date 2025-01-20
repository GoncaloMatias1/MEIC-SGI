# sgi-tp2-base
The starting point of the second assignment of SGI.

# Getting started

Considering a code block (for instance class A.js), to load an JSON file (in the defined structure) call:

    let reader = new MyFileReader(app, this, *this.onSceneLoaded*);
    reader.open("<path to JSON file>");	

The last argument in the MyFileReader object call is the name of the method that is to be called when the JSON file is loaded and parsed.

Hence, In the same code block (for instance class A.js) add a function method with the following signature: 

    onSceneLoaded(data) {
        // do something with the data object
    }

This method is called once the JSON file is loaded and parsed successfully. This method single input argument, *data*, is an object containing the entire scene data object.

# Version

20241105v1