/**
 * Created by jk on 13/05/15.
 */

var containers = Rx.Observable.fromArray(["box", "vase", "suitcase"]);

// doesn't work
//containers.log();

//containers.map((container) = > {
//  return "this is useful " + container;
//}).log();

var c2 = containers.map(function (container) {
  return "this is useful " + container;
});

console.log(c2);

var containerTime = Rx.Observable.zip(
  Rx.Observable.interval(500),
  //c2
  containers
  ,
  function (tick, item) {
    return item;
  }
);

containerTime.filter(function (container) {
  return /e$/.test(container);
})
  .map(function (container){
    return "very handy " + container;
  });


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
  //React.renderComponent
  React.render
  (
    React.DOM.div(null, nodes.map(makeElement)),
    canvas
  );
}

renderScene([ground]);

var groundStream = Rx.Observable.interval(33).
  map(function (x) {
    return {
      id: "ground",
      baseX: -128,
      x: ((x % 64) * -8),
      y: 384
    }
  });

Rx.Observable.zipArray(groundStream)
  .subscribe(renderScene);

//15 mins