/* BG Srcset 1.0 */
var bgsrcset = function(){
  this.compat();
}

bgsrcset.prototype.init = function(target, callback){
  this.target = target;
  this.retina = window.devicePixelRatio > 1;
  this.elements = [];
  this.callback = typeof callback !== 'undefined' ? callback : function(){};
  this.curwidth = this.getWidth();
  
  var elems = this.gather();
  
  for(var i = 0, l = elems.length; i < l; i++){ this.parse(elems[i]); }

  this.set();
  this.resize();
}

/* -----------* /
   Fix compatibility issues*
   *only down to IE8
/ *----------- */

bgsrcset.prototype.compat = function(){
  var d = document;
  /* check for getElementsByClassName */
  if(typeof d.getElementsByClassName != 'function'){
    d.getElementsByClassName = function(str){
      return d.querySelectorAll('.' + str);  
    }
  }
  
  /* check for .trim() */
  if (!String.prototype.trim) {
   String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g, '');};
  }

  /*------------------------* /
    Check for Event Listener
  / *------*/
  if(!d.addEventListener){
    this.addEvent = function(elem, evName, fn){
      elem.attachEvent('on'+evName,function(e) {
        fn(e || window.event);
      });
    }
  }
  
}

/* -----------* /
   Gather elements
/ *----------- */

bgsrcset.prototype.gather = function(){
  var d = document,
      e = this.target.trim(),
      sel = e[0],
      elems = [];
  
  switch(true){
  /* class */
  case sel === '.':
    elems = d.getElementsByClassName(e.substring(1));
    break;
  /* id */
  case sel === '#':
    elems.push(d.getElementById(e.substring(1)));
    break;
  /* tag */
  case /^[a-zA-Z]+$/.test(e):
    elems = d.getElementsByTagName(e);
    break;
  /* unknown */
  default:
    elems = d.querySelectorAll(e);
  }
  
  return elems;
}

/* -----------* /
   Parse datasrc
/ *----------- */
bgsrcset.prototype.parse = function(obj){
  /* exit if no attribute */
  if(obj.getAttribute('bg-srcset') === null){ return false; }
 
  
  /* create new element object */
  this.elements.push({});
  
  /* split up sets */
  var set = obj.getAttribute('bg-srcset').split(','),
    attr = '',
    curelem = this.elements[this.elements.length - 1];
   
  
  curelem.node = obj;
  curelem.srcset = [];
  
  /* loop through sets to define breakpoints */
  for(var i = 0, l = set.length; i < l; i++){
    curelem.srcset.push({});
    attr = set[i].trim();
    var attrs = attr.split(' ');
  
    /* since we can't know the order of the values, starting another loop */
    for(var attrc = 0, attrl = attrs.length; attrc < attrl; attrc++){
      var a = attrs[attrc],
          e = curelem.srcset[i]; //current attribute

      switch(true){
      case a.trim() == "":
        //in case of extra white spaces
          continue;
      break;
      case a[a.length-1] != 'w' && a[a.length-1] != 'x':
        e.src = a;
      break;
      case a[a.length-1] === 'w':
        e.width = parseInt( a.slice( 0, -1 ) );
      break;
      case a[a.length-1] === 'x':
        e.retina = ( parseInt( a.slice( 0, -1 ) ) > 1);
      break;
      }
      if(! e.width ){ e.width = Number.POSITIVE_INFINITY; } //set to the top
      if(! e.retina ){ e.retina = false; }
    }
  }
}

/* -----------* /
   Set image
/ *----------- */
bgsrcset.prototype.set = function(){
  for(var i = 0, l = this.elements.length; i < l; i++){
    this.setSingle(i);
  }
}

bgsrcset.prototype.setSingle = function(id){
  var width = 0,
    elem = this.elements[id],
    comparray = [],
    best = 0,
    _this = this;

  width = this.getWidth(); //elem.node.offsetWidth;

  elem.srcset = elem.srcset.sort(dynamicSort("width"));

  for(var i = 0, l = elem.srcset.length; i < l; i++){
    if(elem.srcset[i].width < width){
    continue;
    }
     comparray.push( elem.srcset[i] );
  }
  if(comparray.length === 0){
    comparray.push(elem.srcset[elem.srcset.length -1]);
  }

  best = comparray[0];
  
  if(comparray.length > 1 && comparray[0].width === comparray[1].width){
    best = (comparray[0].retina != this.retina) ? comparray[1] : comparray[0];
  }
  
  if( best.src != undefined && best.src != 'null'){
     var img = new Image();
  
    img.onload = function() {
      elem.node.style.backgroundImage = "url('" + best.src + "')";
      _this.callback(elem);
    }

    img.src = best.src;
  }else{
    elem.node.style.backgroundImage = "";
  }
  
 

  
}

/* -----------* /
   Handle Resize
/ *----------- */
bgsrcset.prototype.resize = function(){
  var _this = this,
    resizeTimer = setTimeout(function(){}, 0);
  
   this.addEvent(window, 'resize',function() {
     clearTimeout(resizeTimer);
     resizeTimer = setTimeout(function(){
       var w =  _this.getWidth();
       if ( w != _this.curwidth ){
         _this.curwidth = w;
         _this.set();
       }
     }, 250);
   });
}

bgsrcset.prototype.addEvent = function(elem, evName, fn){
  elem.addEventListener(evName,fn,false);
}

bgsrcset.prototype.getWidth = function(){
  var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth;
    return x;
}

function dynamicSort(property) {
  var sortOrder = 1;
  if(property[0] === "-") {
    sortOrder = -1;
    property = property.substr(1);
  }
  return function (a,b) {
    var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
    return result * sortOrder;
  }
}

/*
usage
var bgss = new bgsrcset();
bgss.init('.bgimg' );
*/