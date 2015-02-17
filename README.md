#Linqr.js
Linqr.js adds the ability to include javascript files from other javascript files, in a style similar to C/C++/PHP. With linqr.js, you can dynamically include javascript files without adding the script tags to your html documents. You can include a module which includes another module which includes another module, and all three javascript files will be included in the correct order. Linqr.js is easy to use, and the basic structure of your linqr.js program will be familiar to anyone with from a C/C++/Java background.
###A Basic Linqr.js Application
```javascript
//index.html
<html>
    <head>
        <script src="linqr-x.x.js"></script>
    </head>
    ...
    <script>
        include("Module1.js");      // include the file Module1.js
       
        function main() {           // linqrJS calls main function when the window and all included files are loaded
            Module1.function1();    // caling a function from a module loaded from file Module1.js
        }
    </script>
</html>
```
###How It Works
Linqr.js asynchronously loads all the files specified in the include functions throughought your project. After the files are loaded, they are evaluated in the correct order so that each files dependencies are evaluated before the file itself. When all included files are loaded and evaluated, and the window is loaded, a user defined main function is called if there is one. This pattern is somewhat similar to C. 
###Main
All of your code that depends on the included files being loaded should go in a function called main. this main funtion can be anywhere in any included file, as long as there is a function called main in the global scope, it will be called when the page is ready. 

```javascript
//index.html
...
<script>
    include("Module1.js");
    Module1.funtion1(); // error, Module1 is undefined because the file has not been loaded
    function main() {
        Module1.function1(); // no error, main is called after everything is loaded
    }
</script>
```

###Include
The include funtion is the way in which files are linked to one another in linqr.js. If you include file B in file A, then file A depends on file B being loaded and evaluated first. Multiple files can be included from the same file resulting in identical behavior as the example above.There are ways in which the include function can be used.

 1. **The first way is:** `include("filename.js")`
    - This usage simply includes the file in global scope, as you would expect
 2. **The second way is:** `include("filename.js","ModuleName")`
    - This usage includes the module/object in the file as an object in global scope by the name specified by the second argument. 
    - *This usage accomodates the module pattern, and does not make sence to use with files that are not modules.*
    - *Note that this function will assign only the last object in the file to the specified name. Make sure the object you want to "export" is the last object in the file.*
        
###Notes
Avoid circular references. If file A includes file B, then file B can't include file A. Logically one is going to have to load before the other so they both can't depend on eachother. Bad things will happen.

-----------
* Author: Kameron Brooks
* kameron.cw.11@gmail.com
* follow @wasteland_11
* http://creation-wateland.com


    
    


