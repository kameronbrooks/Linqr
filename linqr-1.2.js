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

    var linkerList = [];
    var loadCount = 0;
    var isTreeDirty = false;
    var verbose = false;

    function findUnitInternalIncludes(unit) {
        if(!unit || !unit.source)return;

        var regexp = /include\((.+),(.+)\)/g;
        var matches = regexp.exec(unit.source);
        if(matches && matches.length>2) {
            matches.splice(0,1);
            var i=0;l=matches.length;
            for(i=0;i<l;i+=2) {

                var name = eval(matches[i+1]);
                var filename = eval(matches[i]);
                var existingUnit = findUnit(filename);
                if(existingUnit) {
                    unit.children.push(existingUnit);
                } else {
                    unit.children.push(addUnit(name, filename));
                }
            }
        }
        loadCount-=1;
    }
    function findUnit(file) {
        var i= 0, l=linkerList.length;
        for(i=0;i<l;i+=1) {
            if(linkerList[i].file === file) return linkerList[i];
        }
        return null;
    }

    function buildLinkerTree() {
        if(isTreeDirty){
            var i= 0, l=linkerList.length;
            for(i=0;i<l;i+=1) {
                var unit = linkerList[i];
            }
            if(verbose)console.log(linkerList);
            isTreeDirty = false;
        }
    }

    function updateLoadCount() {
        if(loadCount===0) {
            buildLinkerTree();
            compile();
        }
    }
    function compileUnit(unit) {
        var childCount = unit.children.length;

        if(unit.compiled) {
            return true;
        } else {
            for(i=0;i<childCount;i+=1) {
                compileUnit(unit.children[i]);
            }
            if(verbose)console.log("compiling unit: "+unit.name);
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
            return true;
        }

    }
    function compile() {
        var i= 0, l=linkerList.length;
        for(i=0;i<l;i+=1) {
            compileUnit(linkerList[i]);
        }
    }

    function addUnit(name,file) {
        var unit = {name: name, file: file, source: null, children:[], loaded:false, compiled:false};
        if(verbose)console.log("adding unit: "+name);
        linkerList.push(unit);
        loadCount+=1;
        isTreeDirty = true;
        var request = new XMLHttpRequest();
        var resp = null;

        request.open('GET',file,true);
        //request.overrideMimeType("text/plain; charset=x-user-defined");
        request.onload = function() {
            if(request.status >= 200 && request.status < 400) {
                resp = request.responseText;
                unit.source = resp;
                unit.loaded = true;

                if(verbose)console.log("unit source loaded: "+name);
                findUnitInternalIncludes(unit);
                updateLoadCount();
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
        findUnit: findUnit
    }
})();

function include(filename,name) {
    if(linqrJS.findUnit(filename) !== null) {

    } else {
        linqrJS.addUnit(name, filename);
    }
}