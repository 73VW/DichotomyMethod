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
    type: 'scattergl',
    name: name,
    marker: {
      color: 'rgb(41, 128, 185)'
    },
    line: {
      width: 2
    }
  };
  return data;
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
      zerolinewidth: 2
    },
    yaxis: {
      range: [-20,20],
      title: 'f(x)',
      zeroline: true,
      zerolinewidth: 2
    },
    title: "Dichotomy method"
  };

  Plotly.newPlot($('plotly'), data, layout);

  window.addEventListener('resize',
  () =>    { Plotly.newPlot($('plotly'), data, layout); });

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

var dichotomyIntervals = [];

// Dichotomy method. Must be performed on a continuous interval [a, b] with a < b and a != -b, which conatains a root.
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

  dichotomyIntervals.push([a, b]);

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

    dichotomyIntervals.push([a, b]);

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

// Find all the valid (= containing a root) intervals for the dichotomy method between [a, b].
// Input: function, xStart, xStop, and smallestInterval if the function is a periodic function. The smallestInterval is useful in order
// to have only one root by interval. By default, the interval in which the roots are searched is 0.5
// (small enough to find a unique root inside the interval).
function findIntervals(f, a, b, smallestInterval = 0.5) {
  var intervals = [];
  while (a < b) {
    let fa = f(a);
    let fa2 = f(a+smallestInterval);
    // Check if the interval contains a root and is not an asymptote
    if ((fa >= 0  && fa!="Infinity" && fa2 < 0 && fa2!="-Infinity") || (fa <= 0 && fa!="-Infinity" && fa2 > 0 && fa2!="Infinity")) {
      intervals.push([a, a+smallestInterval]);
    }
    a+=smallestInterval;
  }

  return intervals;
}

// Find every roots with their error.
// Output: array of arrays [[result, error], [..., ...]]
function findRoots(f, a, b, smallestInterval = 0.5) {
  var intervals = findIntervals(f, a, b, smallestInterval);
  var arrayResultsErrors = [];

  // For each interval which contains a root, we search it with the Dichotomy method
  for (let i = 0; i < intervals.length; i++) {
    arrayResultsErrors.push(dichotomy(f, intervals[i][0], intervals[i][1]));
  }
  return arrayResultsErrors;
}

/***********************/
/*  HTML interactions	 */
/***********************/

// Launch the plotting and the dochotomy method according to which function was chosen.
function solve() {
  var data = [];
  var arrayResultsErrors;

  i = 0;
  dichotomyIntervals = [];

  if ($('f1').checked) {
    var listPoints = generatePointsToDraw(f1, -100, 100);

    data[0] = creatingData(listPoints, "f1");

    arrayResultsErrors = (findRoots(f1, -100, 100));
  }
  else { // f2 is drawn in three times because of the asymptotes
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

function solveCustom() {
  var f = Function("x", "return " + $('f3').value);
  var smallestInterval = 0.5;
  var data = [];
  var listPoints = generatePointsToDraw(f, -100, 100);
  data[0] = creatingData(listPoints, "f3");

  if ($('smallestInterval').value) { // make sure the user write something in here
    smallestInterval = Number($('smallestInterval').value);
  }

  arrayResultsErrors = (findRoots(f, -100, 100, smallestInterval));

  printSolutions(arrayResultsErrors);
  plot(data);
}

// Print the roots and their error
// Input: Array of array which contains each root and its error [[root, error]]
function printSolutions(arrayResultsErrors) {
  var divResults = $('result');
  var divErrors = $('error');

  divResults.innerHTML = '<p class="resultTitle">Root(s) of the function</p>';
  divErrors.innerHTML = '<p class="resultTitle">Relative error(s) approximation</p>';

  for (let i = 0; i < arrayResultsErrors.length; i++) {
    divResults.innerHTML += arrayResultsErrors[i][0];
    divErrors.innerHTML += arrayResultsErrors[i][1];
    if (i != arrayResultsErrors.length - 1) {
      divResults.innerHTML += "<br/>";
      divErrors.innerHTML += "<br/>";
    }
  }
}

var i = 0;
function nextStep() {
  var f = $('f1').checked ? f1 : f2;
  var traceNb = $('f1').checked ? [1, 2] : [3, 4];

  if(i == 0) {
    Plotly.plot($('plotly'), [{
      x: [dichotomyIntervals[i][0], dichotomyIntervals[i][0]],
      y: [10, -10],
      mode: 'lines',
      name: 'dichotomy\'s intervals',
      line: {
        width: 4
      }
    }]);

    Plotly.plot($('plotly'), [{
      x: [dichotomyIntervals[i][1], dichotomyIntervals[i][1]],
      y: [10, -10],
      mode: 'lines',
      name: 'dichotomy\'s intervals',
      line: {
        width: 4
      }
    }]);
  }

  Plotly.animate($('plotly'), {
    data: [{x: [dichotomyIntervals[i][0], dichotomyIntervals[i][0]]}],
    traces: [traceNb[0]]
  });

  Plotly.animate($('plotly'), {
    data: [{x: [dichotomyIntervals[i][1], dichotomyIntervals[i][1]]}],
    traces: [traceNb[1]]
  });

  Plotly.animate($('plotly'), {
    layout: {
      xaxis: {range: [dichotomyIntervals[i][0]-Math.abs(dichotomyIntervals[i][0]-dichotomyIntervals[i][1]), dichotomyIntervals[i][1]+Math.abs(dichotomyIntervals[i][0]-dichotomyIntervals[i][1])]}
    }
  }, {
    transition: {
      duration: 750,
      easing: 'cubic-in-out'
    }
  });

  i++;
}
