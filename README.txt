* BASIC MECHANICS OF THE LINQER.JS LIBRARY
    - linqr-x.x(.min).js must be included in the head of the HTML page via script tag
        (ex.) <script src="linqr-1.1.js"></script>

    - Including files is as simple as, include("filename.js");
        (USAGE 1) include("filename.js");
            This includes the module anonymously, this is best for files that do not have a module structure and just contain functions and global variables,
            or have modules that already have a name and do not need to be assigned one.

        (USAGE 2) include("filename.js","ModuleName");
            This includes the last specified module/object in the file as a global object by the name of the speceified name, in this case that would be "ModuleName",
            Note that this usage does not make sense if the file is not a in the Module Pattern.

            Things that work with this usage:

                    (function(){
                        var bar="bar"
                        function foo() {

                        }
                         return {
                            foo: foo,
                            bar: bar
                        }
                    })();
            OR,

                    var Module = (function(){
                        var bar="bar"
                        function foo() {

                        }
                         return {
                            foo: foo,
                            bar: bar
                        }
                    })();

                    Module.prototype.foobar = function() {
                        alert("foo bar!");
                    }

                    Module; //very important that the module to include is the last thing in the file

    - IMPORTANT NOTES:
        - Global Variables in included files must NOT have "var" in front (Very Important)
        - In an included file any functions declared in "global" scope must be defined like:
            (ex.) functionName = function() {

            };
        instead of:
            (ex.) function functionName() {

            }
        - You can include files from included files

* HOW IT WORKS
        Basically, the the include function in this file is similar to the C/C++ #include directive. You can use the
    include function to load javascript files that your script depends on. This function makes sure that all the
    files are loaded in the proper order. For example, if my main script depends on a module in the file "foo.js"
    and the module in "foo.js" requires a function in a module in "bar.js", I can include "foo.js" from my main
    script which incudes "bar.js" and everything will work fine.
        Using the usual pattern, you would have to place three script tags in my html file:
            <script src="bar.js"></script>
            <script src="foo.js"></script>
            <script src="mainscript.js"></script>


        They would have to be in order of dependency, mainscript depends on foo depends on bar so, bar <- foo <- mainscript
    With linqr.js the process is simplified, in each file just include the files that that file depends on.

    -------------------------------------------------
    foo.js source:
        include("bar.js");

        FOO = (function() {
            ....
        })();

    -------------------------------------------------
    mainscript.js source:
        include("foo.js");

        Module = (function() {
            ....
        })();
    -------------------------------------------------
    index.html source:

        <html>
        ...
        <script>
            include("mainscript.js");

        </script>
        ...
        </html>
    -------------------------------------------------

