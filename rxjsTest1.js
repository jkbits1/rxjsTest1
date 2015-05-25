/**
 * Created by jk on 13/05/15.
 */

//NOTE: this is my version of what must exist somewhere for demo to behave as it does
Rx.Observable.prototype.log = function (){
  console.log("jk custom Observable log function");

  this.subscribe(
    function (x){
      console.log("logging:", x);
    },
    function (err){
      console.log("Error:", err);
    },
    function (){
      console.log("completed:");
    }
  );
}

var containers = Rx.Observable.fromArray(["box", "vase", "suitcase"]);

Rx.Observable.fromArray(["box", "vase", "suitcase"]).log();
//var contSubscrip = containers.subscribe(
//  function (x) {
//    console.log(x);
//  }
//);



// doesn't work
//containers.log();

//containers.map((container) = > {
//  return "this is useful " + container;
//}).log();

var c2 = containers.map(function (container) {
  return "map: this is a useful " + container;
});

console.log(c2);

containers.map(function (container) {
  return "log - map: this is a useful " + container;
}).log();

//var csSubscrip = c2.subscribe(
//  function (x) {
//    console.log(x);
//  },
//  function (err){
//    console.log("error:", err);
//  },
//  function (){
//    console.log("completed");
//  }
//);

var containerTime = Rx.Observable.zip(
  Rx.Observable.interval(500),
  //c2
  containers
  ,
  function (tick, item) {
    return "(tick: " + tick + ") " + item;
  }
);

Rx.Observable.zip(
  Rx.Observable.interval(500),
  //c2
  containers
  ,
  function (tick, item) {
    return "tick: " + tick + " - " + item;
  }
).log();

//var conttimeSubscrip = containerTime.subscribe(
//  function (x){
//    console.log(x);
//  }
//);

// testing equivalent of demo log() function
/// have now put this into prototype
Rx.Observable.zip(
  Rx.Observable.interval(500),
  c2
  //containers
  ,
  function (tick, item) {
    return "tick: " + tick + " - " + item;
  }
).subscribe(
  function (x){
    console.log("zip:", x);
  }
);

var conttimeFiltered = containerTime.filter(function (container) {
  return /e$/.test(container);
})
.map(function (container){
  return "filter + map: very handy " + container;
})
;

containerTime.filter(function (container) {
    return /e$/.test(container);
  })
  .map(function (container){
    return "filter + map: very handy " + container;
  }).log();

//var conttimefilteredSubscrip = conttimeFiltered.subscribe(
//  function (x){
//    console.log("filtered:", x);
//  }
//);

console.log(containerTime);

var canvas = document.getElementById("canvas");

function hashArrayMappedTrie (target, obj){

  for (var prop in obj) {
    target[prop] = obj[prop];
  }
}

function assoc (){
  var out = {};
  for (var i=0; i < arguments.length; i++) {
    hashArrayMappedTrie(out, arguments[i])
  }

  return out;
}

function onscreen (node){
  return !(node.x < -300 || node.y < -1000 || node.y > 1000);
}

function bindKey (key){
  var sub = new Rx.Subject();

  Mousetrap.bind(key, function (){
    sub.onNext(key);
  });

  return sub;
}

//bindKey("space");


var ground = {
  baseX: -128,
  x: 0,
  y: 384,
  id: "ground"
};

function makeElement (node) {
  return React.DOM.div({
    className: node.id,
    style: {
      left: (node.x + (node.baseX || 0)) | 0   + "px",
      top: (node.y + (node.baseY || 0)) | 0 + "px"
    }
  });
}

function renderScene (nodes) {

  // NOTE: call has been renamed
  //React.renderComponent
  React.render
  (
    React.DOM.div(null, nodes.map(makeElement)),
    canvas
  );
}

//renderScene([ground]);

var groundStream = Rx.Observable.interval(33).
  map(function (x) {
    return {
      id: "ground",
      baseX: -128,
      x: ((x % 64) * -8),
      y: 384
    }
  });

// NOTE: log works, outputting an empty array if space not pressed,
//       and an array containing "space" if it has been pressed.
var tick = bindKey("space").buffer(Rx.Observable.interval(33))
    //.log()
  ;

//var range = Rx.Observable.range(0, 5);
//
//var rangeZipArray = Rx.Observable.zipArray(
//  range,
//  range.skip(1),
//  range.skip(2)
//).log();

function velocity (n){
  return assoc(n, {
    x: n.x + n.vx,
    y: n.y + n.vy
  });
}

var itemStream = tick.scan(
  {
    id: "pinkie",
    baseY: 276,
    x:0, y:0,
    vx:0, vy:0,
    gameOver: true
  },
  function (p, keys){
    p = velocity(p);

    p.vy += 0.98;

    if (p.y >= 0) {
      p.y = 0;
      p.vy = 0;
    }

    if (keys[0] === "space") {
      if (p.y >= 0) {
        p.vy -= 20;
      }
    }

    //console.log(p.y);

    return p;
  }
);

var initialTarget = {
  id: "coin",
  vx: -6, vy: 0,
  x: 1000, y: 40
};

var targetStream = itemStream.scan(initialTarget,
  function (c, item){
    c = velocity(c);

    //return c;
    return onscreen(c) ? c : initialTarget;
  }
);

Rx.Observable.zipArray(groundStream, itemStream, targetStream).subscribe(renderScene);

//15 mins

