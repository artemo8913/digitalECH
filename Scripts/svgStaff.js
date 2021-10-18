const obj = document.getElementById("svgDocument");

// https://stackoverflow.com/questions/2753732/how-to-access-svg-elements-with-javascript
// It's important to add an load event listener to the object,
// as it will load the svg doc asynchronously
obj.addEventListener("load", function () {
    // get the inner DOM of alpha.svg
    var svgDoc = obj.contentDocument;
    // get the inner element by id
    // var delta = svgDoc.getElementById("Kozulka1");
    // console.log(delta);
    // // add behaviour
    // delta.addEventListener("mousedown", function () {
    //     alert('hello world!');
    // }, false);
    var node = svgDoc.getElementsByTagName("title");
    var node2 = new Array();
    
    console.log(node);
    Array.from(node).forEach(element => {
        if (element.innerHTML == "Kozulka1") {
            let parent = element.parentElement;
            Array.from(parent.children).forEach(childElement => {
                console.log(childElement);
                if(childElement.tagName == "path"){
                    console.log(childElement.getTotalLength());
                    let startPosition = childElement.getPointAtLength(0);
                    let length = childElement.getTotalLength();
                    
                }
            });
            alert("opa ");
            node2.push(element);
        }
    }
    );
    console.log(node2);
}, false);

obj.addEventListener("load", function () {
    // get the inner DOM of alpha.svg
    var svgLine = document.getElementById("line");
    // get the inner element by id
    svgLine.onclick = svgFunction;
}, false);

function svgFunction() {
    var svgLine = document.getElementById("line");
    svgLine.setAttribute("stroke", "green");
}