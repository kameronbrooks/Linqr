/*
 * Copyright (c) 2015 Kameron Brooks
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy,
 * modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software
 * is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
 * IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */


var linqrJS = (function() {

    var linkerList = [];    // list of linked file nodes
    var loadCount = 0;      // count of files currently being loaded
    var verbose = true;     // output compilation status to the console?
    var documentReady = 0;  // incremented by compilation completion and window.onload

    /* Is the document ready? */
    function isReady() {
        return documentReady >= 2;
    }
    /* Attempt to call main if window is loaded and compilation is complete */
    function callMain() {
        console.log(documentReady);
        if(documentReady>=1) {

            window.main && window.main();
        } else {
            documentReady+=1;
        }

    }
    window.addEventListener('load',callMain); // bind load event to alert linqrJS when window is loaded

    /* Scan the compilation unit for additional includes within the file */
    function findUnitInternalIncludes(unit) {
        if(!unit || !unit.source)return;
        var regexp = /include\((.+)\)/mg;

        var match;;
        while((match = regexp.exec(unit.source)) !== null) {
            match.splice(0,1);
            var args = (match[0]).split(/,/g);
            var name = (1,eval)(args[1] || undefined);
            var filename = (1,eval)(args[0]);
            var existingUnit = findUnit(filename);
            if(existingUnit) {
                unit.children.push(existingUnit);
            } else {
                unit.children.push(addUnit(name, filename));
            }
        }

    }
    /* find compilation unit from filename */
    function findUnit(file) {
        var i, l=linkerList.length;
        for(i=0;i<l;i+=1) {
            if(linkerList[i].file === file) return linkerList[i];
        }
        return null;
    }
    function incrementLoadCount() {
        loadCount+= arguments[0] || 1;
    }
    function decrementLoadCount() {
        loadCount-= arguments[0] || 1;
        if(loadCount<=0) {
            compile();
        }
    }
    function compileUnit(unit) {
        var i, childCount = unit.children.length;
        var success = true;
        if(unit.compiled) {
            return true;
        } else {
            for(i=0;i<childCount;i+=1) {
                success &= compileUnit(unit.children[i]);
            }
            if(success) {
                if(verbose)console.log("compiling unit: "+unit.file);
                try {
                    if(unit.name) {
                        window[unit.name] = (1,eval)(unit.source);
                    } else {
                        (1,eval)(unit.source);
                    }
                } catch ( ex ) {
                    console.log("Compilation Error: ["+unit.file+"]: "+ex.message);
                }

                unit.compiled = true;
            } else {

            }

            return success;
        }

    }
    function compile() {
        var i, l=linkerList.length;
        var success = true;
        for(i=0;i<l;i+=1) {
            success &= compileUnit(linkerList[i]);
        }
        if(success) {
            callMain();
        } else {
            console.log("Compilation Error: Failed to compile units, main function not called");
        }


    }

    function addUnit(name,file) {
        var unit = {name: name, file: file, source: null, children:[], loaded:false, compiled:false};
        if(verbose)console.log("adding unit: "+file);
        linkerList.push(unit);
        incrementLoadCount(1);

        var request = new XMLHttpRequest();
        var resp = null;

        request.open('GET',file,true);
        request.onload = function() {
            if(request.status >= 200 && request.status < 400) {
                resp = request.responseText;
                unit.source = resp;
                unit.loaded = true;
                if(verbose)console.log("unit source loaded: "+file);
                findUnitInternalIncludes(unit);
                decrementLoadCount(1);
            } else {
                console.log("Warning: the specified module in file ["+file+"] could not be loaded");
            }
        };
        request.send(null);
        return unit;
    }
    return {
        addUnit: addUnit,
        compile: compile,
        findUnit: findUnit,
        isReady: isReady
    }
})();

function include(filename,name) {
    if(linqrJS.findUnit(filename) !== null) {

    } else {
        linqrJS.addUnit(name, filename);
    }
}