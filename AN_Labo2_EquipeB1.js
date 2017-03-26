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

/**************************************/
/*  Plotly.js : Plot, show axis, ...  */
/**************************************/

// Generate the points between start and stop, according to f.
// Intup: function, xStart, xStop
// Output: two values array containing two arrays, respectively for x and y values
function generatePointsToDraw(f, start, stop) {
  var xValues = [];
  var yValues = [];
  var index = 0;
  for (let i = start; i <= stop; i+= 0.02) {
    xValues[index] = i;
    yValues[index] = f(i);
    index++;
  }
  return [xValues, yValues];
}

// Create readable data for Plotly and style them a little.
// Input: The list of x values and y values [x, y] and the name of the line
function creatingData(listPoints, name) {
  var data = {
    x: listPoints[0],
    y: listPoints[1],
    mode: 'lines',
    name: name,
    marker: {
      color: 'rgb(41, 128, 185)'
    },
    line: {
      width: 4
    }
  };
  return data
}

// Plot the graph according to the given points
// Input: list of points that plotly can read
function plot(data) {
  // Everything which is related to style
  var layout = {
    font: {
      family: 'Arial, sans-serif',
      size: 20
    },
    xaxis: {
      range: [-100,100],
      title: 'x',
      zeroline: true,
      zerolinewidth: 3
    },
    yaxis: {
      range: [-20,20],
      title: 'f(x)',
      zeroline: true,
      zerolinewidth: 4
    },
    title: "Dichotomy method",
  };

  Plotly.newPlot($('plotly'), data, layout);
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

// Dichotomy method. Must be performed on a continuous interval [a, b], which conatains a root.
// Input: a, b, function
// Output: two values array [result, error]
function dichotomy(f, a, b) {
  if(a == -b) {
    return null; //Don't work with symetric range
  }

  var fa = f(a);
  var mNew = a + b;
  var mOld = 2 * mNew;
  var fm;
  var n = 0; // number of steps

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
  }

  return [mNew, calculateError(a, b, n)];
}

//Equation from : https://fr.wikipedia.org/wiki/M%C3%A9thode_de_dichotomie
//Input: Continuous interval [a, b] in which the dichotomy was performed, and the number of steps.
function calculateError(a, b, n)
{
  return (b - a) / (2 * Math.pow(2, n)); //for each step the error is diminished by half
}

// Find all the valid intervals for the dichotomy method between [a, b].
function findIntervals(f, a, b) {
  var intervals = [];
  while (a < b) {
    let fa = f(a);
    let fa2 = f(a+0.5);
    // Check if the interval contains a root
    if ((fa >= 0  && fa!="Infinity" && fa2 < 0 && fa2!="-Infinity") || (fa <= 0 && fa!="-Infinity" && fa2 > 0 && fa2!="Infinity")) {
      intervals.push([a, a+0.5]);
    }
    a+=0.5;
  }

  return intervals;
}

// Find every roots with their error.
// Output: array of arrays [[result, error], [..., ...]]
function findRoots(f, a, b) {
  var intervals = findIntervals(f, a, b);
  var arrayResultsErrors = [];

  for (let i = 0; i < intervals.length; i++) {
    arrayResultsErrors.push(dichotomy(f, intervals[i][0], intervals[i][1]));
  }
  return arrayResultsErrors;
}

/***********************/
/*  HTML interactions	 */
/***********************/

// Launch the plotting according to which function was chosen.
function solve() {
  var data = [];
  var arrayResultsErrors;
  if ($('f1').checked) {
    var listPoints = generatePointsToDraw(f1, -100, 100);

    data[0] = creatingData(listPoints, "f1");

    arrayResultsErrors = (findRoots(f1, -100, 100));
  }
  else { // f2 is processed in three times because of the asymptotes
    var listPoints1 = generatePointsToDraw(f2, -100, -1);
    var listPoints2 = generatePointsToDraw(f2, -1, 1);
    var listPoints3 = generatePointsToDraw(f2, 1, 100);

    data[0] = creatingData(listPoints1, '[-100, -1[');
    data[1] = creatingData(listPoints2, ']-1, 1[');
    data[2] = creatingData(listPoints3, ']1, 100]');
    arrayResultsErrors = findRoots(f2, -100, 100);
  }
  printSolutions(arrayResultsErrors);
  plot(data);
}

function printSolutions(arrayResultsErrors) {
  var divResults = $('result');
  var divErrors = $('error');

  divResults.innerHTML = "Root(s) of the function<br/>";
  divErrors.innerHTML = "Relative error(s) approximation<br/>";

  for (let i = 0; i < arrayResultsErrors.length; i++) {
    divResults.innerHTML += arrayResultsErrors[i][0];
    divErrors.innerHTML += arrayResultsErrors[i][1];
    if (i != arrayResultsErrors.length - 1) {
      divResults.innerHTML += "<br/>";
      divErrors.innerHTML += "<br/>";
    }
  }
}
