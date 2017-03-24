/***********************************************************/
/*  Authors : Axel Rieben, Maël Pedretti, Quentin Vaucher  */
/*  Date : 28 March 2017                                   */
/***********************************************************/

/*******************************************************/
/*  Tools : Easiest way to get element by id and name  */
/*******************************************************/

function $(id) {
  return document.getElementById(id);
}

function $name(name) {
  return document.getElementsByName(name);
}

/**********************************************************/
/*  Paint device, paint context, viewportSize, axis, ...  */
/**********************************************************/

var canvas = $('canvas');
var context = canvas.getContext('2d');
var viewportSize = [canvas.width, canvas.height];

/********************/
/*  Plot Functions  */
/********************/

// Convert a point from the world coordinates system (i.e. -100; 100) to the viewport coordinates system (i.e. canvas dimensions) and return it.
// point: A two values array [x, y] which represent the point to convert.
// windowRange: A four values array [xMin, xMax, yMin, yMax] which represent the range of the world coordinates system.
// viewportSize: A two values array [width, height] which represent the dimensions of the viewport coordinates system.
function windowToViewportConversion(point, windowRange) {
  var windowSize = [(windowRange[1] - windowRange[0]), (windowRange[3] - windowRange[2])];

  point[0] = ((viewportSize[0] / windowSize[0] * point[0]) + viewportSize[0] / 2); // x conversion
  point[1] = ((-viewportSize[1] / windowSize[1] * point[1]) + viewportSize[1] / 2); // y conversion, "-" because (0, 0) is in top left corner

  return point;
}

// Draw axis acording to the specified range.
// windowRange: A four values array [xMin, xMax, yMin, yMax] which represent the range of the world coordinates system.
function drawAxis(windowRange) {
  context.beginPath();

  // x-axis
  context.moveTo(0, canvas.height/2);
  context.lineTo(canvas.width, canvas.height/2);

  // y-axis
  context.moveTo(canvas.width/2, 0);
  context.lineTo(canvas.width/2, canvas.height);

  // Appearance
  {
    context.strokeStyle = "black";
    context.lineWidth = 5;
    context.stroke();
  }

  context.closePath();
}

// Move to the first point to draw without drawing anything.
// fn: Function to draw.
// windowRange: A four values array [xMin, xMax, yMin, yMax] which represent the range of the world coordinates system.
function moveToStartPoint(fn, windowRange) {
  var startPoint = [windowRange[0], fn(windowRange[0])];
  startPoint = windowToViewportConversion(startPoint, windowRange, viewportSize);

  context.moveTo(startPoint[0], startPoint[1]);
}

// Plot the specified function inside the specified range.
// fn: Function to draw;
// windowRange: A four values array [xMin, xMax, yMin, yMax] which represent the range of the world coordinates system.
function plot(fn, windowRange) {
  drawAxis(windowRange);
  context.beginPath();

  moveToStartPoint(fn, windowRange);

  var point;

  for (let x = windowRange[0]; x <= windowRange[1]; x+=0.02) {
    point = [x, fn(x)];
    point = windowToViewportConversion(point, windowRange);

    if (point[1] < 0 || point[1] > canvas.height) {  // Avoid ugly line between asymptotes
      context.moveTo(point[0], point[1]);
    } else {
      context.lineTo(point[0], point[1]);
    }
  }

  // Appearance
  {
    context.strokeStyle = "red";
    context.lineWidth = 5;
    context.stroke();
  }
  context.closePath();
}


/***************/
/*  Functions  */
/***************/

// Function 1
function f1(x) {
  return Math.sin(x) - (x / 13);
}

// Function 2
function f2(x) {
  return x / (1 - x*x);
}

/*************************************************************/
/*  Dichotomy functions                                      */
/*************************************************************/

//THIS CAN BE USELESS !
function loopDichotomy(a, b, f)
{
    let listResults = dichotomy(a, b, f);
    printSolution(listResults);
}

//a : range left, b : range right, f : function to solve, a < b
function dichotomy(a, b, f) {
  if(a == -b) {
      return null; //Don't work with symetric range
  }

  let fa = f(a);
  let mNew = a + b;
  let mOld = 2 * mNew;
  let fm;
  let n = 0; // number of steps

  while((mNew - mOld) != 0) {
    mOld = mNew;
    mNew = (a + b) / 2;
    fm = f(mNew);

    if(fm * fa <= 0) {
      b = mNew;
    } else {
      a = mNew;
      fa = fm;
    }

    n++;
    printError(calculateError(a, b, n));
  }

  return mNew;
}

//Equation from : https://fr.wikipedia.org/wiki/M%C3%A9thode_de_dichotomie
//a : range left, b : range right, n : number of step
function calculateError(a, b, n)
{
    return (b - a) / (2 * Math.pow(2, n)); //for each step the error is diminished by half
}

/***********************/
/*  HTML interactions	 */
/***********************/

function solve() {
  context.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

  if ($('f1').checked) {
    plot(f1, [-100, 100, -10, 10]);
    loopDichotomy(-101, 100, f1); //BAD RANGE !!!
  } else {
    plot(f2, [-10, 10, -1.4, 1.4]);
    let listResults = dichotomy(-101, 100, f2); //BAD RANGE !!!
    printSolution(listResults);
  }
}

//Print the solution
function printSolution(listResults)
{
  let div = $('result');
  div.innerHTML = "";
  div.innerHTML += "Root(s) of the function : {";
  div.innerHTML += listResults;
  /*
  for (let result of listResults)
  {
    div.innerHTML += result + "; ";
  }

  div.innerHTML = div.innerHTML.substring(0, div.innerHTML.length-2); //Remove the last ;
  */
  div.innerHTML += "}";

}

//Print error
function printError(error)
{
    let div = $('error');
    div.innerHTML = "";
    div.innerHTML = "Error approximation : " + error;
}
