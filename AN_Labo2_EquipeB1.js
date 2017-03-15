/*************************************************************/
/*  Auhor : Axel Rieben, Maël Pedretti, Quentin Vaucher		 */
/*	Date : 28 March 2017                                     */
/*************************************************************/

/*************************************************************/
/*  Tools : Easiest way to get element by id                 */
/*************************************************************/

function $(id) {
  return document.getElementById(id);
}

function $name(name) {
  return document.getElementsByName(name);
}

/*************************************************************/
/*  Paint device, paint context and dimensions               */
/*************************************************************/

var canvas = $('canvas');
var context = canvas.getContext('2d');
var width = canvas.width;
var height = canvas.height;

/*******************/
/*  Plot Function */
/*******************/

// Source: https://www.quora.com/What-is-the-best-math-function-plotting-library-in-JavaScript
// First arg is the function to plot
// Second arg is a 4 values array which gives the unit used for the plotting ([xLeft, xRight, yTop, yBottom])
var plot = function plot(fn, range) {
  var widthScale = (width / (range[1] - range[0]));
  var heightScale = (height / (range[3] - range[2]));

  var first = true;

  context.beginPath();

  for (var x = 0; x < width; x++) {
    var xFnVal = (x / widthScale) - range[0];
    var yGVal = (fn(xFnVal) - range[2]) * heightScale;

    yGVal = height - yGVal; // 0,0 is top-left

    if (first) {
      context.moveTo(x, yGVal); // move to the beginning of the plotting without drawing
      first = false;
    }
    else {
      context.lineTo(x, yGVal);
    }
  }

  // Appearance
  context.strokeStyle = "red";
  context.lineWidth = 3;
  context.stroke();
};

/*************************************************************/
/*  Function calls                                           */
/*************************************************************/

// Function 1
plot(function (x) {
  return Math.sin(x) -x/13;
}, [0, Math.PI * 4, -4, 4]);

// Function 2
// plot(function (x) {
//   return x / (1 - x*x);
// }, [0, Math.PI * 4, -4, 4]);

/*************************************************************/
/*  Dichotomy functions                                      */
/*************************************************************/

//a : range left, b : range right, f : function to solve, a < b
function dichotomy(a, b, f) {
	fa = f(a);
	mnew = a + b;
	mold = 2 * mnew;
	
	while((mnew - mold) != 0) {
		mold = mnew;
		mnew = (a + b) / 2;
		fm = f(mnew);
		
		if(fm * fa <= 0) {
			b = mnew;
		} else {
			a = mnew;
			fa = fm;
		}
	}
	
	return mnew;
}

/*************************************************************/
/*  User interactions	                                     */
/*************************************************************/

function solve() {
	
}
