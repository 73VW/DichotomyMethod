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

// Create readable data for Plotly and style them a little.
// Input: The list of x values and y values + the name of the line
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
// Input: list of x values and y values
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

/***********************/
/*  Points generation  */
/***********************/

// Generate the points between start and stop, according to fn.
function generatePointsToDraw(fn, start, stop) {
  var xValues = [];
  var yValues = [];
  var index = 0;
  for (let i = start; i <= stop; i+= 0.02) {
    xValues[index] = i;
    yValues[index] = fn(i);
    index++;
  }
  return [xValues, yValues];
}

/***********************/
/*  HTML interactions	 */
/***********************/

// Launch the plotting according to which function was chosen.
function solve() {
  var data = [];
  if ($('f1').checked) {
    var listPoints = generatePointsToDraw(f1, -100, 100);
    data[0] = creatingData(listPoints, "f1");
    loopDichotomy(-100, 100, f1); //BAD RANGE !!!
  } else { // f2 is plotted in three lines because of the asymptotes
    var listPoints1 = generatePointsToDraw(f2, -100, -1);
    var listPoints2 = generatePointsToDraw(f2, -1, 1);
    var listPoints3 = generatePointsToDraw(f2, 1, 100);

    data[0] = creatingData(listPoints1, '[-100, -1]');
    data[1] = creatingData(listPoints2, '[-1, 1]');
    data[2] = creatingData(listPoints3, '[1, 100]');

    let listResults = dichotomy(-101, 100, f2); //BAD RANGE !!!
    printSolution(listResults);
  }
  plot(data);
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
