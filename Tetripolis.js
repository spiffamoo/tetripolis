// implements Tetpolis on the canvas GameView, the clickable area is ClickArea and should be the exact same size as the canvas

let xOffset = 10; //TODO: find out to find the offset from the client
let yOffset = 10;
let tileSize = 32;
let gridMaxX = 32;
let gridMaxY = 24;
let viewTileWidth = 32;
let viewTileHeight = 24;
let viewPortWidth = tileSize * viewTileWidth;
let viewPortHeight = tileSize * viewTileHeight;

let DistrictNormalColor = "LightSkyBlue";
let DistrictMegaColor = "Chocolate";
let DistrictTownHallColor = "Violet"

var Canvas;
var PieceQueueCanvas;
var InspectMode = false;


var Grid = {
  tiles : [], // an array of an array of tiles
  horizontalLines : [], // an array of an array of horizontal grid lines, contains the values of the line colors
  verticalLines : [], // an array of an array of vertical grid lines
  topLeftX : 0, // the value of the X coordinate showing on the screen
  topLeftY : 0, // ditto Y
  currentHighlight : [new Tile(-10,-10,-1)], // the currently highlighted tiles
  currentDistrict : "", // the currently highlighted district
  normalColor : "#eeeeee",
  highlightColor : "Black",
  districtColor : "DarkOrange",
  noBorderColor : "White",
  invalidColor : "Crimson",
  gridXOffset : 16,
  gridYOffset : 16,
  
  init : function() {
    for (var c=0;c<gridMaxX;c++) {
      var col = [];
      var vline = [];
      for (var r=0;r<gridMaxY;r++) {
        col.push(new Tile(c,r,0));
        vline.push(Grid.normalColor)
      }
      Grid.tiles.push(col);
      Grid.verticalLines.push(vline)
    } 
    var vline = [];
    for (var r=0;r<gridMaxY;r++) {
      vline.push(Grid.normalColor)
    }
    Grid.verticalLines.push(vline)

    for (var r=0;r<=gridMaxY;r++) {
      var hline = [];
      for  (var c=0;c<gridMaxX;c++) {
        hline.push(Grid.normalColor)
      }
      Grid.horizontalLines.push(hline)
    }
  }
}



var City = {
  districts : [], // an array of districts
  pop : 0, // population of the city
  wealth : 0, // amount of wealth the city is producing
  happiness : 0, // net amount of happiness. when it reaches 0 the game is over
}

// adds a district to the City and evaluate City variables
City.addDistrict = function(dis) {
//TODO
  dis.adjacent = City.findAdjacentDistricts(dis);
  this.districts.push(dis);
  this.happiness += dis.happiness;
  //TODO pop and wealth
}

// find adjacent districts to the added district dis and returns an array
City.findAdjacentDistricts = function(dis) {
// TODO - confirm that this function is working as intended. *it should be*
  var adjArray = [];
  let adjacentTiles = getOrthogonalNeighbours(dis);
  for (var i=0;i<adjacentTiles.length;i++) {
    let x = adjacentTiles[i][0];
    let y = adjacentTiles[i][1];
    let tile = Grid.tiles[x][y];
    if (tile.isDistrict) {
      if (adjArray.indexOf(tile.belongsToDistrict) == -1) {
        tile.belongsToDistrict.adjacent.push(dis);
        adjArray.push(tile.belongsToDistrict);
      }
    }
  }
  return adjArray;
}


// gets all valid orthogonal neighbours of a tile and returns in an array of coords
function getOrthogonalNeighbours(dis) {
  var resultArray = [];
  function validateBounds(x,y) {
    if (x >= 0 && x < gridMaxX && y >= 0 && y < gridMaxY) {
      resultArray.push([x,y])
    }
  }
  // x and y are the reference tiles for the rest of the comparisons.
  let x = dis.coordArray[0][0];
  let y = dis.coordArray[0][1];
  switch (dis.shape) {
    case "square" :
      validateBounds(x,y-1);
      validateBounds(x+1,y-1);
      validateBounds(x-1,y);
      validateBounds(x+2,y);
      validateBounds(x-1,y+1);
      validateBounds(x+2,y+1);
      validateBounds(x,y+2);
      validateBounds(x+1,y+2);
      break;
    case "long" :
      switch (dis.orientation) {
        case 0:
        case 2:
          validateBounds(x-1,y)
          validateBounds(x,y-1)
          validateBounds(x,y+1)
          validateBounds(x+1,y-1)
          validateBounds(x+1,y+1)
          validateBounds(x+2,y-1)
          validateBounds(x+2,y+1)
          validateBounds(x+3,y-1)
          validateBounds(x+3,y+1)
          validateBounds(x+4,y)
          break;
        case 1:
        case 3:
          validateBounds(x,y-1)
          validateBounds(x-1,y)
          validateBounds(x+1,y)
          validateBounds(x-1,y+1)
          validateBounds(x+1,y+1)
          validateBounds(x-1,y+2)
          validateBounds(x+1,y+2)
          validateBounds(x-1,y+3)
          validateBounds(x+1,y+3)
          validateBounds(x,y+4)
          break;
      }
      break;
    case "L" :
      switch (dis.orientation) {
        case 0 :
          validateBounds(x,y-1)
          validateBounds(x-1,y)
          validateBounds(x+1,y)
          validateBounds(x-1,y+1)
          validateBounds(x+1,y+1)
          validateBounds(x-1,y+2)
          validateBounds(x+2,y+2)
          validateBounds(x,y+3)
          validateBounds(x+1,y+3)
          break;
        case 1 :
          validateBounds(x-1,y)
          validateBounds(x-1,y+1)
          validateBounds(x,y+2)
          validateBounds(x,y-1)
          validateBounds(x+1,y-1)
          validateBounds(x+1,y+1)
          validateBounds(x+2,y-1)
          validateBounds(x+2,y+1)
          validateBounds(x+3,y)
          break;
        case 2 :
          validateBounds(x-1,y)
          validateBounds(x,y-1)
          validateBounds(x+1,y-1)
          validateBounds(x+2,y)
          validateBounds(x,y+1)
          validateBounds(x+2,y+1)
          validateBounds(x,y+2)
          validateBounds(x+2,y+2)
          validateBounds(x+1,y+3)
          break;
        case 3 :
          validateBounds(x-1,y)
          validateBounds(x,y-1)
          validateBounds(x,y+1)
          validateBounds(x+1,y-1)
          validateBounds(x+1,y+1)
          validateBounds(x+2,y-2)
          validateBounds(x+2,y+1)
          validateBounds(x+3,y-1)
          validateBounds(x+3,y)
          break;
      }
      break;
    case "mirrorL" :
      switch (dis.orientation) {
        case 0 :
          validateBounds(x-1,y)
          validateBounds(x+1,y)
          validateBounds(x,y-1)
          validateBounds(x-1,y+1)
          validateBounds(x+1,y+1)
          validateBounds(x-2,y+2)
          validateBounds(x+1,y+2)
          validateBounds(x-1,y+3)
          validateBounds(x,y+3)
          break;
        case 1 :
          validateBounds(x-1,y)
          validateBounds(x+1,y)
          validateBounds(x,y-1)
          validateBounds(x-1,y+1)
          validateBounds(x,y+2)
          validateBounds(x+1,y+2)
          validateBounds(x+2,y)
          validateBounds(x+2,y+2)
          validateBounds(x+3,y+1)
          break;
        case 2 :
          validateBounds(x-1,y)
          validateBounds(x+2,y)
          validateBounds(x,y-1)
          validateBounds(x+1,y-1)
          validateBounds(x-1,y+1)
          validateBounds(x+1,y+1)
          validateBounds(x-1,y+2)
          validateBounds(x+1,y+2)
          validateBounds(x,y+3)
          break;
        case 3 :
          validateBounds(x-1,y)
          validateBounds(x,y+1)
          validateBounds(x,y-1)
          validateBounds(x+1,y-1)
          validateBounds(x+1,y+1)
          validateBounds(x+2,y-1)
          validateBounds(x+2,y+2)
          validateBounds(x+3,y)
          validateBounds(x+3,y+1)
          break;
      }
      break;
    case "S" :
      switch (dis.orientation) {
        case 0:
        case 2:
          validateBounds(x-1,y)
          validateBounds(x,y-1)
          validateBounds(x+1,y-1)
          validateBounds(x+2,y)
          validateBounds(x-2,y+1)
          validateBounds(x+1,y+1)
          validateBounds(x,y+2)
          validateBounds(x-1,y+2)
          break;
        case 1:
        case 3:
          validateBounds(x,y-1)
          validateBounds(x-1,y)
          validateBounds(x-1,y+1)
          validateBounds(x,y+2)
          validateBounds(x+1,y)
          validateBounds(x+2,y+1)
          validateBounds(x+2,y+2)
          validateBounds(x+1,y+3)
          break;
      }
      break;
    case "mirrorS" :
      switch (dis.orientation) {
        case 0:
        case 2:
          validateBounds(x-1,y)
          validateBounds(x,y-1)
          validateBounds(x+1,y-1)
          validateBounds(x+2,y)
          validateBounds(x,y+1)
          validateBounds(x+3,y+1)
          validateBounds(x+1,y+2)
          validateBounds(x+2,y+2)
          break;
        case 1:
        case 3:
          validateBounds(x,y-1)
          validateBounds(x-1,y)
          validateBounds(x-1,y+1)
          validateBounds(x,y+2)
          validateBounds(x+1,y+1)
          validateBounds(x+2,y)
          validateBounds(x+2,y-1)
          validateBounds(x+1,y-2)
          break;
      }
      break;
    case "T" :
      switch (dis.orientation) {
        case 0 :
          validateBounds(x-2,y)
          validateBounds(x-1,y-1)
          validateBounds(x-1,y+1)
          validateBounds(x,y-1)
          validateBounds(x,y+2)
          validateBounds(x+1,y-1)
          validateBounds(x+1,y+1)
          validateBounds(x+2,y)
          break;
        case 1 :
          validateBounds(x-2,y)
          validateBounds(x-1,y-1)
          validateBounds(x-1,y+1)
          validateBounds(x,y-2)
          validateBounds(x,y+2)
          validateBounds(x+1,y-1)
          validateBounds(x+1,y+1)
          validateBounds(x+1,y)
          break;
        case 2 :
          validateBounds(x-2,y)
          validateBounds(x-1,y-1)
          validateBounds(x-1,y+1)
          validateBounds(x,y-2)
          validateBounds(x,y+1)
          validateBounds(x+1,y-1)
          validateBounds(x+1,y+1)
          validateBounds(x+2,y)
          break;
        case 3 :
          validateBounds(x-1,y)
          validateBounds(x-1,y-1)
          validateBounds(x-1,y+1)
          validateBounds(x,y-2)
          validateBounds(x,y+2)
          validateBounds(x+1,y-1)
          validateBounds(x+1,y+1)
          validateBounds(x+2,y)
          break;
      }
      break;
  }
  return resultArray;
}

var SpriteManager = {
  rock : "rock",
  plains : "plains",
  fertile : "fertile",
  water : "water",
  forest : "forest",
  camp : "camp",
  mountain : "mountain",
  townhall : "townhall",
  farm : "farm",
  orchard : "fruit tree",
  pasture : "pasture",
  ranch : "ranch",
  hammer : "hammer",
  spriteWidth : 20,
  largeSpriteWidth: 48,
  spriteOffset : 6,
  largeSpriteOffset: 8,
  
  drawSprite : function(x,y, sprite,alpha) {
    let tile = Grid.tiles[x][y];
    let canvasX = tile.getCanvasX();
    let canvasY = tile.getCanvasY();
    
    Canvas.clearRect(canvasX+this.spriteOffset,canvasY+this.spriteOffset,this.spriteWidth,this.spriteWidth)
    Canvas.globalAlpha = alpha;
    if (sprite != 0) {
      Canvas.drawImage(document.getElementById(sprite), canvasX+this.spriteOffset, canvasY+this.spriteOffset,this.spriteWidth,this.spriteWidth);
    }
    
    Canvas.globalAlpha = 1.0
  },
}

// implements a Tile class
function Tile(x, y, value) {
  this.x = x;
  this.y = y;
  this.value = value; // the value of the raw resource on the tile
  this.isDistrict = false; // whether the particular tile is already part of a district
  this.belongsToDistrict = "none" // specifies which district this tile belongs to
  
  this.getCanvasX = function() {
    return this.x * tileSize + Grid.gridXOffset;
  }
  
  this.getCanvasY = function() {
    return this.y * tileSize + Grid.gridYOffset;
  }
  
}

// erases the tile located on coord x,y
function clearTile(x,y) {
  let canvasX = Grid.tiles[x][y].getCanvasX();
  let canvasY = Grid.tiles[x][y].getCanvasY();
  Canvas.clearRect(canvasX+1,canvasY+1,tileSize-2,tileSize-2);
}

// implements a DistrictOutputClass which contains the secondary outputs required for other types of districts
function DistrictOutput() {
  this.grain = 0; // output from farms
  this.meat = 0; // from pastures and ranches
  this.wool = 0; // from ranches
  this.commerce = 0;
  this.banking = 0;
  this.lumber = 0;
  this.stone = 0; // all mines will generate some amount of stone, however some mines will also generate iron
  this.oil = 0; // there is a small chance that a district with all different raw values will strike oil
  this.iron = 0; // some mines will have a small chance of generating iron
  this.labour = 0;
  this.leisure = 0; // leisure districts impacts happiness and is a prerequisite for higher lvls
  this.canned = 0; // different factory goods
  this.clothes = 0; // different factory goods
  this.furniture = 0; // diffeent factory goods
  this.steel = 0; // different factory goods
  this.innovation = 0; // 
  
}

// implements a DistrictBuildings class which contains the different possible tiles a district can have
function DistrictBuildings() {
  this.apartment = 0;
  this.factory = 0;
  this.megafarm = 0;
  this.farm = 0;
  this.megalumbermill = 0;
  this.lumbermill = 0;
  this.megamall = 0;
  this.mall = 0;
  this.megamine = 0;
  this.mine = 0;
  this.orchard = 0;
  this.pasture = 0;
  this.ranch = 0;
  this.residence = 0;
  this.shop = 0;
  this.suburb = 0;
  this.furnitureFactory = 0;
}

// adds the district outputs in an array
function sumDistrictOutputs(outputArray) {
  var sum = new DistrictOutput();
  for (var i=0;i<outputArray.length;i++) {
    sum.grain += outputArray[i].grain;
    sum.meat += outputArray[i].meat;
    sum.wool += outputArray[i].wool;
    sum.commerce += outputArray[i].commerce;
    sum.banking += outputArray[i].banking;
    sum.lumber += outputArray[i].lumber;
    sum.stone += outputArray[i].stone;
    sum.oil += outputArray[i].oil;
    sum.iron += outputArray[i].iron;
    sum.labour += outputArray[i].labour;
    sum.leisure += outputArray[i].leisure;
    sum.canned += outputArray[i].canned;
    sum.clothes += outputArray[i].clothes;
    sum.furniture += outputArray[i].furniture;
    sum.steel += outputArray[i].steel;
    sum.innovation += outputArray[i].innovation;
  }
  return sum;
}

// implements a District class
function District(coordArray, piece) {
// TODO - calculating building functions
  
  this.shape = piece.shape;
  this.orientation = piece.orientation;
  this.coordArray = coordArray.map(function(n) { return n }); // array of tiles this district is composed of.
  this.output = new DistrictOutput(); // output that this district produces used in the calculation of other districts
  this.buildings = new DistrictBuildings(); // a list of buildings in the district
  this.special = "none"; // any special buildings in the district
  this.adjacent = []; // array of adjacent districts
  this.happiness = 0; // a value that denotes the happiness of the citizens in this city
  
  for (var i=0;i<coordArray.length;i++) {
    Grid.tiles[coordArray[i][0]][coordArray[i][1]].isDistrict = true;
    Grid.tiles[coordArray[i][0]][coordArray[i][1]].belongsToDistrict = this;
  }
  
  this.setAllTiles = function(tileValue) {
    for (var i=0;i<this.coordArray.length;i++) {
      Grid.tiles[coordArray[i][0]][coordArray[i][1]].value = tileValue
    }
  }
  
  // draw the borders and remove internal grid lines
  this.drawBorders = function(color) {
    let x = this.coordArray[0][0]
    let y = this.coordArray[0][1]
    switch (this.shape) {
      case "square" :
        Grid.borderR(x,y,color,Grid.noBorderColor);
        Grid.borderMirrorR(x+1,y,color,Grid.noBorderColor);
        Grid.borderL(x,y+1,color,Grid.noBorderColor);
        Grid.borderMirrorL(x+1,y+1,color,Grid.noBorderColor);
        //Grid.borderRemoveBottomRightDot(x,y);
        break;
      case "long" :
        switch (this.orientation) {
          case 0 :
          case 2 :
            Grid.borderC(x,y,color,Grid.noBorderColor);
            Grid.borderHorizontalLines(x+1,y,color,Grid.noBorderColor);
            Grid.borderHorizontalLines(x+2,y,color,Grid.noBorderColor);
            Grid.borderMirrorC(x+3,y,color,Grid.noBorderColor);
            break;
          case 1 :
          case 3 :
            Grid.borderN(x,y,color,Grid.noBorderColor);
            Grid.borderVerticalLines(x,y+1,color,Grid.noBorderColor);
            Grid.borderVerticalLines(x,y+2,color,Grid.noBorderColor);
            Grid.borderU(x,y+3,color,Grid.noBorderColor);
            break;
        }
        break;
      case "L" :
        switch (this.orientation) {
          case 0 :
            Grid.borderN(x,y,color,Grid.noBorderColor);
            Grid.borderVerticalLines(x,y+1,color,Grid.noBorderColor);
            Grid.borderL(x,y+2,color,Grid.noBorderColor);
            Grid.borderMirrorC(x+1,y+2,color,Grid.noBorderColor);
            break;
          case 1 :
            Grid.borderR(x,y,color,Grid.noBorderColor);
            Grid.borderHorizontalLines(x+1,y,color,Grid.noBorderColor);
            Grid.borderMirrorC(x+2,y,color,Grid.noBorderColor);
            Grid.borderU(x,y+1,color,Grid.noBorderColor);
           break;
          case 2 :
            Grid.borderC(x,y,color,Grid.noBorderColor);
            Grid.borderMirrorR(x+1,y,color,Grid.noBorderColor);
            Grid.borderVerticalLines(x+1,y+1,color,Grid.noBorderColor);
            Grid.borderU(x+1,y+2,color,Grid.noBorderColor);
           break;
          case 3 :
            Grid.borderC(x,y,color,Grid.noBorderColor);
            Grid.borderHorizontalLines(x+1,y,color,Grid.noBorderColor);
            Grid.borderMirrorL(x+2,y,color,Grid.noBorderColor);
            Grid.borderN(x+2,y-1,color,Grid.noBorderColor);
           break;
        }
        break;
      case "mirrorL" :
        switch (this.orientation) {
          case 0 :
            Grid.borderN(x,y,color,Grid.noBorderColor);
            Grid.borderVerticalLines(x,y+1,color,Grid.noBorderColor);
            Grid.borderMirrorL(x,y+2,color,Grid.noBorderColor);
            Grid.borderC(x-1,y+2,color,Grid.noBorderColor);
            break;
          case 1 :
            Grid.borderN(x,y,color,Grid.noBorderColor);
            Grid.borderL(x,y+1,color,Grid.noBorderColor);
            Grid.borderHorizontalLines(x+1,y+1,color,Grid.noBorderColor);
            Grid.borderMirrorC(x+2,y+1,color,Grid.noBorderColor);
            break;
          case 2 :
            Grid.borderR(x,y,color,Grid.noBorderColor);
            Grid.borderMirrorC(x+1,y,color,Grid.noBorderColor);
            Grid.borderVerticalLines(x,y+1,color,Grid.noBorderColor);
            Grid.borderU(x,y+2,color,Grid.noBorderColor);
            break;
          case 3 :
            Grid.borderC(x,y,color,Grid.noBorderColor);
            Grid.borderHorizontalLines(x+1,y,color,Grid.noBorderColor);
            Grid.borderMirrorR(x+2,y,color,Grid.noBorderColor);
            Grid.borderU(x+2,y+1,color,Grid.noBorderColor);
            break;
        }
        break;
      case "S" :
        switch (this.orientation) {
          case 0 :
          case 2 :
            Grid.borderR(x,y,color,Grid.noBorderColor);
            Grid.borderMirrorL(x,y+1,color,Grid.noBorderColor);
            Grid.borderMirrorC(x+1,y,color,Grid.noBorderColor);
            Grid.borderC(x-1,y+1,color,Grid.noBorderColor);
            break;
          case 1 :
          case 3 :
            Grid.borderN(x,y,color,Grid.noBorderColor);
            Grid.borderL(x,y+1,color,Grid.noBorderColor);
            Grid.borderMirrorR(x+1,y+1,color,Grid.noBorderColor);
            Grid.borderU(x+1,y+2,color,Grid.noBorderColor);
            break;
        }
        break;
      case "mirrorS" :
        switch (this.orientation) {
          case 0 :
          case 2 :
            Grid.borderC(x,y,color,Grid.noBorderColor);
            Grid.borderMirrorR(x+1,y,color,Grid.noBorderColor);
            Grid.borderL(x+1,y+1,color,Grid.noBorderColor);
            Grid.borderMirrorC(x+2,y+1,color,Grid.noBorderColor);
            break;
          case 1 :
          case 3 :
            Grid.borderR(x,y,color,Grid.noBorderColor);
            Grid.borderU(x,y+1,color,Grid.noBorderColor);
            Grid.borderMirrorL(x+1,y,color,Grid.noBorderColor);
            Grid.borderN(x+1,y-1,color,Grid.noBorderColor);
            break;
        }
        break;
      case "T" :
        switch (this.orientation) {
          case 0 :
            Grid.borderTop(x,y,color,Grid.noBorderColor);
            Grid.borderC(x-1,y,color,Grid.noBorderColor);
            Grid.borderMirrorC(x+1,y,color,Grid.noBorderColor);
            Grid.borderU(x,y+1,color,Grid.noBorderColor);
            break;
          case 1 :
            Grid.borderRight(x,y,color,Grid.noBorderColor);
            Grid.borderC(x-1,y,color,Grid.noBorderColor);
            Grid.borderU(x,y+1,color,Grid.noBorderColor);
            Grid.borderN(x,y-1,color,Grid.noBorderColor);
            break;
          case 2 :
            Grid.borderBottom(x,y,color,Grid.noBorderColor);
            Grid.borderC(x-1,y,color,Grid.noBorderColor);
            Grid.borderMirrorC(x+1,y,color,Grid.noBorderColor);
            Grid.borderN(x,y-1,color,Grid.noBorderColor);
            break;
          case 3 :
            Grid.borderLeft(x,y,color,Grid.noBorderColor);
            Grid.borderMirrorC(x+1,y,color,Grid.noBorderColor);
            Grid.borderN(x,y-1,color,Grid.noBorderColor);
            Grid.borderU(x,y+1,color,Grid.noBorderColor);
            break;
        }
        break;
    }
    
  }
  
  this.drawSpecialSprite = function(tileIndex) {
    for (var i=0;i<this.coordArray.length;i++) {
      clearTile(this.coordArray[i][0], this.coordArray[i][1]);
    }
    let tile = Grid.tiles[this.coordArray[tileIndex][0]][this.coordArray[tileIndex][1]];
    canvasX = tile.getCanvasX();
    canvasY = tile.getCanvasY();
    
    Canvas.globalAlpha = 1.0;
    Canvas.drawImage(document.getElementById(this.special),canvasX+SpriteManager.largeSpriteOffset,canvasY+SpriteManager.largeSpriteOffset,
    SpriteManager.largeSpriteWidth,SpriteManager.largeSpriteWidth);
    
  }
  
  this.fillTiles = function(color) {
    // fill district squares with a fill color
    Canvas.globalAlpha = 0.35;
    Canvas.fillStyle = color;
    for (var i=0;i<this.coordArray.length;i++) {
      let x = this.coordArray[i][0];
      let y = this.coordArray[i][1];
      let tile = Grid.tiles[x][y];
      let canvasX = tile.getCanvasX();
      let canvasY = tile.getCanvasY();
      Canvas.fillRect(canvasX,canvasY,tileSize,tileSize);
      
    }
    Canvas.globalAlpha = 1;
  }
  
  this.boldSprites = function() {
    for (var i=0;i<this.coordArray.length;i++) {
      let tile = Grid.tiles[this.coordArray[i][0]][this.coordArray[i][1]];
      SpriteManager.drawSprite(tile.x,tile.y,tile.value,1)
    }
  }
  
  this.calcLvl1Buildings = function() {
  
    // set all tiles given in the array to value
    function setTiles(array,value) {
      while (array.length != 0) {
        var i = array.pop();
        var x = coordArray[i][0];
        var y = coordArray[i][1];
        Grid.tiles[x][y].value = value;
        SpriteManager.drawSprite(x,y,"hammer",0.5);
      }
    }
    
    // set the last tile given in the array to value
    function setLastTile(array,value) {
      var i = array.pop();
      var x = coordArray[i][0];
      var y = coordArray[i][1];
      Grid.tiles[x][y].value = value;
      SpriteManager.drawSprite(x,y,"hammer",0.5);
    }
    
    // read in the tile values into rawValueArray for easy comparison later
    var rawValueArray = [[],[],[],[],[],[],[]]; // array of indexes of coordArray of camp, fertile, forest, mountain, plains, rock, water tiles

    for (var i=0;i<this.coordArray.length;i++) {
      let x = coordArray[i][0];
      let y = coordArray[i][1];
      let tile = Grid.tiles[x][y];
      
      // read in the values 
      switch (tile.value) {
        case "camp" :
          rawValueArray[0].push(i);
          break;
        case "fertile" :
          rawValueArray[1].push(i);
          break;
        case "forest" :
          rawValueArray[2].push(i);
          break;
        case "mountain" :
          rawValueArray[3].push(i);
          break;
        case "plains" :
          rawValueArray[4].push(i);
          break;
        case "rock" :
          rawValueArray[5].push(i);
          break;
        case "water" :
          rawValueArray[6].push(i);
          break;
      }
    }
    
    // mega structures, all 4 the same

    if (rawValueArray[1].length == 4) {
      setTiles(rawValueArray[1],"megafarm");
      this.buildings.megafarm = 4;
      this.fillTiles(DistrictMegaColor);
      return;
    }
    
    if (rawValueArray[2].length == 4) {
      setTiles(rawValueArray[2],"megalumbermill");
      this.buildings.megalumbermill = 4;
      this.fillTiles(DistrictMegaColor);
      return;
    }
    
    if (rawValueArray[4].length == 4) {
      setTiles(rawValueArray[4],"megamall");
      this.buildings.megamall = 4;
      this.fillTiles(DistrictMegaColor);
      return;
    }
    
    if (rawValueArray[5].length == 4) {
      setTiles(rawValueArray[5],"megamine");
      this.buildings.megamine = 4;
      this.fillTiles(DistrictMegaColor);
      return;
    }
    
    // orchards
    if (rawValueArray[6].length == 2 && rawValueArray[1].length == 2) { 
      setTiles(rawValueArray[6],"orchard")
      setTiles(rawValueArray[1],"orchard")
      this.buildings.orchard = 4;
      this.fillTiles(DistrictMegaColor);
      return;
    }
    
    // ranch
    if (rawValueArray[4].length == 2 && rawValueArray[1].length == 2) { 
      setTiles(rawValueArray[4],"ranch");
      setTiles(rawValueArray[1],"ranch");
      this.buildings.ranch = 4;
      this.fillTiles(DistrictMegaColor);
      return;
    }
    
    // mall
    if (rawValueArray[4].length == 2 && rawValueArray[0].length == 2) { 
      setTiles(rawValueArray[4],"mall");
      setTiles(rawValueArray[0],"mall");
      this.buildings.mall = 4;
      this.fillTiles(DistrictMegaColor);
      return;
    }
    
    // apartment
    if (rawValueArray[0].length == 3 && rawValueArray[6].length == 1) { 
      setTiles(rawValueArray[0],"apartment");
      setTiles(rawValueArray[6],"apartment");
      this.buildings.apartment = 4;
      this.fillTiles(DistrictMegaColor);
      return;
    }
    
    // lumbermill
    if (rawValueArray[2].length >= 2) { 
      setLastTile(rawValueArray[2],"lumbermill");
      setLastTile(rawValueArray[2],"lumbermill");
      this.buildings.apartment += 2;
    }
    
    // mine
    if (rawValueArray[5].length >= 2) { 
      setLastTile(rawValueArray[5],"mine");
      setLastTile(rawValueArray[5],"mine");
      this.buildings.mine += 2;
    }
    
    // residence
    while (rawValueArray[0].length > 0 && rawValueArray[6].length > 0) { 
      setLastTile(rawValueArray[6],"residence")
      setLastTile(rawValueArray[0],"residence")
      this.buildings.residence += 2;
    }
    
    // suburb
    if (rawValueArray[0].length >= 2 && rawValueArray[6].length >= 1) { 
      setTiles(rawValueArray[0],"suburb");
      setTiles(rawValueArray[6],"suburb");
      this.buildings.suburb += 2;
    }
    
    // factory
    if (rawValueArray[2].length >= 1 && rawValueArray[5].length >= 1 && rawValueArray[6].length >= 1) { 
      setLastTile(rawValueArray[2],"factory");
      setLastTile(rawValueArray[5],"factory");
      setLastTile(rawValueArray[6],"factory");
      this.buildings.factory += 3;
    }
    
    // farms
    while (rawValueArray[6].length > 0 && rawValueArray[1].length > 0) { 
      setLastTile(rawValueArray[6],"farm")
      setLastTile(rawValueArray[1],"farm")
      this.buildings.farm += 2;
    }
    
    // pasture
    while (rawValueArray[4].length > 0 && rawValueArray[1].length > 0) { 
      setLastTile(rawValueArray[4],"pasture")
      setLastTile(rawValueArray[1],"pasture")
      this.buildings.pasture += 2;
    }
    
    
    // shop
    while (rawValueArray[0].length > 0 && rawValueArray[4].length > 0) { 
      setLastTile(rawValueArray[4],"shop")
      setLastTile(rawValueArray[0],"shop")
      this.buildings.shop += 2;
    }
    
    this.fillTiles(DistrictNormalColor);
    
  }

  this.calcLvl2Buildings = function() {
  //TODO - complete the table of buildings given the inputs
    var adjInputs = [] // contains the sum of all adjacent district output
    for (var i=0;i<adjacent.length;i++) {
      adjInputs.push(adjacent[i].output)
    }
    let districtInput = sumDistrictOutputs(adjInputs);
    // TODO - complete lvl 2 building checks
    if (districtInput.lumber > 0 && this.buildings.factory > 0) {
      // create furniture factory
      let newBuildingTile = this.getRandomTileOfType("factory");
      newBuildingTile.value = "furnitureFactory";
      this.buildings.factory -= 1;
      this.buildings.furnitureFactory += 1;
    }
  }
  
  this.updateOutput = function() {
  //TODO - complete the output cases
    // check if district contains a special building.
    if (this.special != "none") {
      switch (this.special) {
        case "townhall" : 
          this.happiness += 50;
          break;
      }
      return;
    }
    // check individual tiles
    for (var i=0;i<coordArray.length;i++) {
      let x = coordArray[i][0];
      let y = coordArray[i][1];
      let tile = Grid.tiles[x][y];
      switch (tile.value) {
        // raw tiles
        case "fertile" :
        case "forest" :
        case "water" :
        case "rock" :
        case "plains" :
          this.happiness--;
          break;
        case "camp" :
          this.happiness -= 5;
          break;
        case "mountain" :
          this.happiness += 5;
          break;
        case "farm" :
          this.output.grain += 2
          break;
        case "megafarm" :
          this.output.grain += 2
          this.output.meat += 1
          this.output.wool += 1
          break;
        case "pasture" :
          this.output.meat += 2
          break;
        case "ranch" :
          this.output.meat += 2
          this.output.wool += 1
          break;
        case "lumbermill" :
          this.output.lumber += 2;
          break;
        case "megalumbermill" :
          this.output.lumber += 3;
          break;
        case "apartment" :
          this.happiness += 3;
          this.output.labour += 3;
          break;
        case "suburb" :
          this.happiness += 2;
          this.output.labour += 2;
          break;
        case "residence" :
          this.happiness += 1;
          this.output.labour += 1;
          break;
        case "megamine" :
          break;
        case "mine" :
          this.output.stone += 2
          break;
        case "megamall" :
          break;
        case "mall" :
          break;
        case "shop" :
          break;
        case "factory" :
          break;
        // 
      }
    }
  }
  
  // returns a random tile in the district that matches <building>
  this.getRandomTileOfType = function(building) {
  // TODO - check whether this function works
    var matchArray = []
    for (var i=0;i<this.coordArray.length;i++) {
      let tile = Grid.tiles[this.coordArray[0]][this.coordArray[1]]
      if (tile.value == building) {
        matchArray.push(tile);
      }
    }
    return matchArray[rand(matchArray.length)];
  }
}

// this function checks if an unclaimed tile is part of a unclaimed area that is four tiles large and completely orthogonally surrounded by city districts
function checkIfSurroundedTetromino(x, y) {
//TODO - get this working! see getConnectedSize(tile)
  let area = getConnectedSize(x, y)
  if (area != 4) { return false }
  else { return true }
}

function getConnectedSize(tile) {
//TODO - complete
  var tileArray = [tile]
  if (!Grid.tiles[tile.x][lowerBound(tile.y-1)].isDistrict) {
    // do depth first search of unconnected tiles
  }
  // do whatever checks for connected non-district tiles

  
  return tileArray.length;
}

// draws the gridlines for the game itself
function drawGrid() {
  Canvas.strokeStyle = Grid.normalColor;
  for (var y=Grid.gridYOffset;y<=viewPortHeight;y+=tileSize) {
    Canvas.strokeRect(Grid.gridXOffset,y,viewPortWidth,tileSize);
  }
  for (var x=Grid.gridXOffset;x<=viewPortWidth;x+=tileSize) {
    Canvas.strokeRect(x,Grid.gridYOffset,tileSize,viewPortHeight);
  }
  
  Canvas.strokeRect(Grid.gridXOffset,Grid.gridYOffset,viewPortWidth,viewPortHeight);
}


// initializes the grid, generates and stores the grid as a Grid Object, and also initializes Canvas
function initializeGrid() {
  Canvas = document.getElementById("GameView").getContext("2d")
  PieceQueueCanvas = document.getElementById("PieceQueueDisplay").getContext("2d");
  Canvas.lineWidth = 2; // needed to prevent magic whiteboard funky stuff going on
  Grid.init();
  drawGrid();

}

// sets a random value of the raw resource on the tiles
Grid.initializeTiles = function() {
  for (var x=0;x<gridMaxX;x++) {
    for (var y=0;y<gridMaxY;y++) {
      let r = rand(20)
      switch (true) {
        case (r <= 0) :
          Grid.tiles[x][y].value = "mountain"
          SpriteManager.drawSprite(x,y,"mountain",0.55)
          break;
        case (r <= 2) :
          Grid.tiles[x][y].value = "rock"
          SpriteManager.drawSprite(x,y,"rock",0.55)
          break;
        case (r <= 6) :
          Grid.tiles[x][y].value = "fertile"
          SpriteManager.drawSprite(x,y,"fertile",0.55)
          break;
        case (r <= 9) :
          Grid.tiles[x][y].value = "water"
          SpriteManager.drawSprite(x,y,"water",0.55)
          break;
        case (r <= 12) :
          Grid.tiles[x][y].value = "forest"
          SpriteManager.drawSprite(x,y,"forest",0.55)
          break;
        case (r <= 15) :
          Grid.tiles[x][y].value = "camp"
          SpriteManager.drawSprite(x,y,"camp",0.55)
          break;
        default :
          Grid.tiles[x][y].value = "plains"
          SpriteManager.drawSprite(x,y,"plains",0.55)
          break;
      }
      
    }
  }
}


Grid.highlightTile = function(x, y, color) {
  // check if tile is outside viewport
  if (x < Grid.topLeftX || y < Grid.topLeftY) { return }
  if (x >= Grid.topLeftX + viewPortWidth/tileSize || y >= Grid.topLeftY + viewPortHeight/tileSize) { return }
  
  Canvas.strokeStyle = color;
  Canvas.strokeRect(Grid.tiles[x][y].getCanvasX(), Grid.tiles[x][y].getCanvasY(), tileSize, tileSize);
  
  // increase alpha of the sprites in the tile.
  SpriteManager.drawSprite(x,y,Grid.tiles[x][y].value,0.9)
}

// restore a tile's original borders, colors stored in tile
Grid.restoreTile = function(x,y) {
  // check if tile is outside viewport
  if (x < Grid.topLeftX || y < Grid.topLeftY) { return }
  if (x >= Grid.topLeftX + viewTileWidth || y >= Grid.topLeftY + viewTileHeight) { return }
  
  
  
  let tile = Grid.tiles[x][y]
  
  let canvasX = tile.getCanvasX();
  let canvasY = tile.getCanvasY();
  var n = 0;
  var alpha = 0;
  

  Grid.highlightTile(x,y,Grid.normalColor);
  Canvas.beginPath();
  n = Grid.horizontalLines[y][x] == Grid.districtColor || Grid.highlightColor ? -1 : 2;
  Canvas.moveTo(canvasX+n,canvasY);
  Canvas.strokeStyle = Grid.horizontalLines[y][x];
  Canvas.lineTo(canvasX+tileSize-n,canvasY);
  Canvas.stroke();
  Canvas.beginPath();
  n = Grid.verticalLines[x+1][y] == Grid.districtColor || Grid.highlightColor ? -1 : 2;
  Canvas.moveTo(canvasX+tileSize,canvasY+n);
  Canvas.strokeStyle = Grid.verticalLines[x+1][y]
  Canvas.lineTo(canvasX+tileSize,canvasY+tileSize-n);
  Canvas.stroke();
  Canvas.beginPath();
  n = Grid.horizontalLines[y+1][x] == Grid.districtColor || Grid.highlightColor ? -1 : 2;
  Canvas.moveTo(canvasX+tileSize-n,canvasY+tileSize);
  Canvas.strokeStyle = Grid.horizontalLines[y+1][x]
  Canvas.lineTo(canvasX+n,canvasY+tileSize);
  Canvas.stroke();
  Canvas.beginPath();
  n = Grid.verticalLines[x][y] == Grid.districtColor || Grid.highlightColor ? -1 : 2;
  Canvas.moveTo(canvasX,canvasY+tileSize-n);
  Canvas.strokeStyle = Grid.verticalLines[x][y];
  Canvas.lineTo(canvasX,canvasY+n);
  Canvas.stroke();
  
  // fill in intersections of corner highlights
  if (Grid.verticalLines[x][y-1] == Grid.districtColor || Grid.horizontalLines[y][x-1] == Grid.districtColor) {
    Canvas.beginPath();
    Canvas.strokeStyle = Grid.districtColor;
    Canvas.moveTo(canvasX+1,canvasY);
    Canvas.lineTo(canvasX,canvasY);
    Canvas.lineTo(canvasX,canvasY+1)
    Canvas.stroke();
  }
  if (Grid.verticalLines[x+1][y-1] == Grid.districtColor || Grid.horizontalLines[y][x+1] == Grid.districtColor) {
    Canvas.beginPath();
    Canvas.strokeStyle = Grid.districtColor;
    Canvas.moveTo(canvasX+tileSize-1,canvasY);
    Canvas.lineTo(canvasX+tileSize,canvasY);
    Canvas.lineTo(canvasX+tileSize,canvasY+1)
    Canvas.stroke();
  }
  if (Grid.verticalLines[x][y+1] == Grid.districtColor || Grid.horizontalLines[y+1][x-1] == Grid.districtColor) {
    Canvas.beginPath();
    Canvas.strokeStyle = Grid.districtColor;
    Canvas.moveTo(canvasX+1,canvasY+tileSize);
    Canvas.lineTo(canvasX,canvasY+tileSize);
    Canvas.lineTo(canvasX,canvasY+tileSize-1)
    Canvas.stroke();
  }
  if (Grid.verticalLines[x+1][y+1] == Grid.districtColor || Grid.horizontalLines[y+1][x+1] == Grid.districtColor) {
    Canvas.beginPath();
    Canvas.strokeStyle = Grid.districtColor;
    Canvas.moveTo(canvasX+tileSize-1,canvasY+tileSize);
    Canvas.lineTo(canvasX+tileSize,canvasY+tileSize);
    Canvas.lineTo(canvasX+tileSize,canvasY+tileSize-1)
    Canvas.stroke();
  }

  alpha = tile.isDistrict ? 0.8 : 0.55;
  SpriteManager.drawSprite(x,y,tile.value,alpha)
}

// highlight next piece outline from mouse movement
Grid.highlightTileFromMouseMove = function(ev) {
  // helper functions
  function hlTile(x, y, color) {
    if (x < Grid.topLeftX || y < Grid.topLeftY || x >= Grid.topLeftX + viewTileWidth || y >= Grid.topLeftY + viewTileHeight) { return }
    if (Grid.tiles[x][y].isDistrict == true) { 
      //FIXME - problems with restoring tile borders after highlighting a tile in a district. disabled.
      //Grid.highlightTile(x,y, Grid.invalidColor)
    }
    else {
      Grid.currentHighlight.push([x,y]);
      Grid.highlightTile(x, y, color);
    }
  }
  
  if (ev.type != "mousemove") { return }
  let mX = ev.clientX;
  let mY = ev.clientY;
  if (mX > viewPortWidth + Grid.gridXOffset || mY > viewPortHeight + Grid.gridYOffset) { return }
  let currentCoord = getGridSquareFromMouse(mX,mY);
  if (currentCoord == Grid.currentHighlight[0]) { return }
  while (Grid.currentHighlight.length > 0) {
    let coord = Grid.currentHighlight.pop();
    Grid.restoreTile(coord[0], coord[1]);
  }
  hlTile(currentCoord[0], currentCoord[1], Grid.highlightColor);
  let next = PieceQueue.queue[0]
  if (next != null) {
    for (var i=0;i<next.otherTiles.length;i++) {
      hlTile(currentCoord[0]+next.otherTiles[i][0], currentCoord[1]+next.otherTiles[i][1], Grid.highlightColor)
    }
  }
}

// highlight an already placed district the mouse cursor is hovering over
Grid.highlightDistrict = function(ev) {
//FIXME - highlighting districts is bugged and doesn't restore original borders

  if (ev.type != "mousemove") { return }
  let mX = ev.clientX;
  let mY = ev.clientY;
  if (mX > viewPortWidth + Grid.gridXOffset || mY > viewPortHeight + Grid.gridYOffset) { return }
  let currentCoord = getGridSquareFromMouse(mX,mY);
  let currentTile = Grid.tiles[currentCoord[0]][currentCoord[1]];
  if (currentTile.isDistrict) {
    let selectedDistrict = currentTile.belongsToDistrict;
    if (Grid.currentDistrict != selectedDistrict) {
      if (Grid.currentDistrict != "") {
        Grid.currentDistrict.drawBorders(Grid.districtColor);
      }
      Grid.currentDistrict = selectedDistrict;
      selectedDistrict.drawBorders(Grid.highlightColor);
    }
  }
}

Grid.getTilesFromCoords = function(coords, refTile) {
  var tileArray = []
  for (var i=0;i<coords.length;i++) {
    tileArray.push(Grid.tiles[refTile.x + coords[i][0]][refTile.y + coords[i][1]])
  }
  return tileArray
}


// collective functions for drawing borders on cell x,y with color = border color and nilColor = non-border regions
Grid.borderC = function(x,y,color,nilColor) {
  Grid.verticalLines[x][y] = color;
  Grid.verticalLines[x+1][y] = nilColor;
  Grid.horizontalLines[y][x] = color;
  Grid.horizontalLines[y+1][x] = color;
  Grid.restoreTile(x,y);
}

Grid.borderN = function(x,y,color,nilColor) {
  Grid.verticalLines[x][y] = color;
  Grid.verticalLines[x+1][y] = color;
  Grid.horizontalLines[y][x] = color;
  Grid.horizontalLines[y+1][x] = nilColor;
  Grid.restoreTile(x,y);
}

Grid.borderMirrorC = function(x,y,color,nilColor) {
  Grid.verticalLines[x][y] = nilColor;
  Grid.verticalLines[x+1][y] = color;
  Grid.horizontalLines[y][x] = color;
  Grid.horizontalLines[y+1][x] = color;
  Grid.restoreTile(x,y);
}

Grid.borderU = function(x,y,color,nilColor) {
  Grid.verticalLines[x][y] = color;
  Grid.verticalLines[x+1][y] = color;
  Grid.horizontalLines[y][x] = nilColor;
  Grid.horizontalLines[y+1][x] = color;
  Grid.restoreTile(x,y);
  /*
  Grid.tiles[x][y].topColor = nilColor;
  Grid.tiles[x][lowerBoundY(y-1)].bottomColor = nilColor;
  Grid.tiles[x][y].bottomColor = color;
  Grid.tiles[x][upperBoundY(y+1)].topColor = color;
  Grid.tiles[x][y].leftColor = color;
  Grid.tiles[lowerBoundX(x-1)][y].rightColor = color;
  Grid.tiles[x][y].rightColor = color;
  Grid.tiles[upperBoundX(x+1)][y].leftColor = color;
  */
}

Grid.borderHorizontalLines = function(x,y,color,nilColor) {
  Grid.verticalLines[x][y] = nilColor;
  Grid.verticalLines[x+1][y] = nilColor;
  Grid.horizontalLines[y][x] = color;
  Grid.horizontalLines[y+1][x] = color;
  Grid.restoreTile(x,y);
  /*
  Grid.tiles[x][y].topColor = color;
  Grid.tiles[x][lowerBoundY(y-1)].bottomColor = color;
  Grid.tiles[x][y].bottomColor = color;
  Grid.tiles[x][upperBoundY(y+1)].topColor = color;
  Grid.tiles[x][y].leftColor = nilColor;
  Grid.tiles[lowerBoundX(x-1)][y].rightColor = nilColor;
  Grid.tiles[x][y].rightColor = nilColor;
  Grid.tiles[upperBoundX(x+1)][y].leftColor = nilColor;
  Grid.restoreTile(x,y);
  */
}

Grid.borderVerticalLines = function(x,y,color,nilColor) {
  Grid.verticalLines[x][y] = color;
  Grid.verticalLines[x+1][y] = color;
  Grid.horizontalLines[y][x] = nilColor;
  Grid.horizontalLines[y+1][x] = nilColor;
  Grid.restoreTile(x,y);
  /*
  Grid.tiles[x][y].topColor = nilColor;
  Grid.tiles[x][lowerBoundY(y-1)].bottomColor = nilColor;
  Grid.tiles[x][y].bottomColor = nilColor;
  Grid.tiles[x][upperBoundY(y+1)].topColor = nilColor;
  Grid.tiles[x][y].leftColor = color;
  Grid.tiles[lowerBoundX(x-1)][y].rightColor = color;
  Grid.tiles[x][y].rightColor = color;
  Grid.tiles[upperBoundX(x+1)][y].leftColor = color;
  Grid.restoreTile(x,y);
  */
}

Grid.borderR = function(x,y,color,nilColor) {
  Grid.verticalLines[x][y] = color;
  Grid.verticalLines[x+1][y] = nilColor;
  Grid.horizontalLines[y][x] = color;
  Grid.horizontalLines[y+1][x] = nilColor;
  Grid.restoreTile(x,y);
  /*
  Grid.tiles[x][y].topColor = color;
  Grid.tiles[x][lowerBoundY(y-1)].bottomColor = color;
  Grid.tiles[x][y].bottomColor = nilColor;
  Grid.tiles[x][upperBoundY(y+1)].topColor = nilColor;
  Grid.tiles[x][y].leftColor = color;
  Grid.tiles[lowerBoundX(x-1)][y].rightColor = color;
  Grid.tiles[x][y].rightColor = nilColor;
  Grid.tiles[upperBoundX(x+1)][y].leftColor = nilColor;
  Grid.restoreTile(x,y);
  */
}

Grid.borderMirrorR = function(x,y,color,nilColor) {
  Grid.verticalLines[x][y] = nilColor;
  Grid.verticalLines[x+1][y] = color;
  Grid.horizontalLines[y][x] = color;
  Grid.horizontalLines[y+1][x] = nilColor;
  Grid.restoreTile(x,y);
  /*
  Grid.tiles[x][y].topColor = color;
  Grid.tiles[x][lowerBoundY(y-1)].bottomColor = color;
  Grid.tiles[x][y].bottomColor = nilColor;
  Grid.tiles[x][upperBoundY(y+1)].topColor = nilColor;
  Grid.tiles[x][y].leftColor = nilColor;
  Grid.tiles[lowerBoundX(x-1)][y].rightColor = nilColor;
  Grid.tiles[x][y].rightColor = color;
  Grid.tiles[upperBoundX(x+1)][y].leftColor = color;
  Grid.restoreTile(x,y);
  */
}

Grid.borderL = function(x,y,color,nilColor) {
  Grid.verticalLines[x][y] = color;
  Grid.verticalLines[x+1][y] = nilColor;
  Grid.horizontalLines[y][x] = nilColor;
  Grid.horizontalLines[y+1][x] = color;
  Grid.restoreTile(x,y);
  /*
  Grid.tiles[x][y].topColor = nilColor;
  Grid.tiles[x][lowerBoundY(y-1)].bottomColor = nilColor;
  Grid.tiles[x][y].bottomColor = color;
  Grid.tiles[x][upperBoundY(y+1)].topColor = color;
  Grid.tiles[x][y].leftColor = color;
  Grid.tiles[lowerBoundX(x-1)][y].rightColor = color;
  Grid.tiles[x][y].rightColor = nilColor;
  Grid.tiles[upperBoundX(x+1)][y].leftColor = nilColor;
  Grid.restoreTile(x,y);
  */
}

Grid.borderMirrorL = function(x,y,color,nilColor) {
  Grid.verticalLines[x][y] = nilColor;
  Grid.verticalLines[x+1][y] = color;
  Grid.horizontalLines[y][x] = nilColor;
  Grid.horizontalLines[y+1][x] = color;
  Grid.restoreTile(x,y);
  /*
  Grid.tiles[x][y].topColor = nilColor;
  Grid.tiles[x][lowerBoundY(y-1)].bottomColor = nilColor;
  Grid.tiles[x][y].bottomColor = color;
  Grid.tiles[x][upperBoundY(y+1)].topColor = color;
  Grid.tiles[x][y].leftColor = nilColor;
  Grid.tiles[lowerBoundX(x-1)][y].rightColor = nilColor;
  Grid.tiles[x][y].rightColor = color;
  Grid.tiles[upperBoundX(x+1)][y].leftColor = color;
  Grid.restoreTile(x,y);
  */
}

Grid.borderTop = function(x,y,color,nilColor) {
  Grid.verticalLines[x][y] = nilColor;
  Grid.verticalLines[x+1][y] = nilColor;
  Grid.horizontalLines[y][x] = color;
  Grid.horizontalLines[y+1][x] = nilColor;
  Grid.restoreTile(x,y);
}

Grid.borderBottom = function(x,y,color,nilColor) {
  Grid.verticalLines[x][y] = nilColor;
  Grid.verticalLines[x+1][y] = nilColor;
  Grid.horizontalLines[y][x] = nilColor;
  Grid.horizontalLines[y+1][x] = color;
  Grid.restoreTile(x,y);
}

Grid.borderLeft = function(x,y,color,nilColor) {
  Grid.verticalLines[x][y] = color;
  Grid.verticalLines[x+1][y] = nilColor;
  Grid.horizontalLines[y][x] = nilColor;
  Grid.horizontalLines[y+1][x] = nilColor;
  Grid.restoreTile(x,y);
}

Grid.borderRight = function(x,y,color,nilColor) {
  Grid.verticalLines[x][y] = nilColor;
  Grid.verticalLines[x+1][y] = color;
  Grid.horizontalLines[y][x] = nilColor;
  Grid.horizontalLines[y+1][x] = nilColor;
  Grid.restoreTile(x,y);
}

// this function returns the tile from the mouse coordinates.
function getGridSquareFromMouse(x, y) {
  var gridX = Math.floor((x-xOffset-Grid.gridXOffset)/tileSize)
  var gridY = Math.floor((y-yOffset-Grid.gridYOffset)/tileSize)
  
  gridX = gridX < 0 ? 0 : gridX;
  gridY = gridY < 0 ? 0 : gridY;

  return [gridX, gridY]
}

// for fun
function whiteboardModeErase() {
  Canvas.lineWidth = 1;
  Grid.highlightColor = "White";
  Grid.normalColor = "White";
}

function whiteboardModeDraw() {
  Canvas.lineWidth = 2;
  Grid.highlightColor = "Black"
  Grid.normalColor = "DarkGrey"
}

// PieceQueue is an object that generates and stores the pieces that appear 

var PieceQueue = {
  queue : [], // the actual queue of pieces
  limit : 5 // the size of the queue
}

// generate the next piece in the queue and return the first piece
PieceQueue.next = function() {
  this.queue.push(createPiece());
  let currentPiece = this.queue.shift();
  this.display();
  return currentPiece;
}

PieceQueue.initialize =  function() {
  while (PieceQueue.queue.length > 0) { PieceQueue.queue.pop() }
  for (var i=0;i<PieceQueue.limit;i++) {
    this.queue.push(createPiece())
  }
  PieceQueueCanvas.strokeRect(10,10,72,72);
  this.display();
}

// update the display for the queue
PieceQueue.display = function() {
  for (var i=0;i<this.queue.length;i++) {
    let name = "piece" + this.queue[i].shape;
    let pieceImage = document.getElementById(name);
    PieceQueueCanvas.drawImage(pieceImage,16,16+72*i)
  }
}

function Piece(shape) {
  // calculates the relative positions of the other tiles
  this.orientate = function() {
    switch (this.shape) {
      case "square" :
        this.otherTiles = [[1,0], [0,1], [1,1]]
        break;
      case "long" :
        switch (this.orientation) {
          case 0 :
          case 2 :
            this.otherTiles = [[1,0], [2,0], [3,0]]
            break;
          case 1 :
          case 3 :
            this.otherTiles = [[0,1], [0,2], [0,3]]
            break;
        }
        break;
      case "L" :
        switch (this.orientation) {
          case 0 :  
            this.otherTiles = [[0,1], [0,2], [1,2]]
            break;
          case 1 :  
            this.otherTiles = [[1,0], [2,0], [0,1]]
            break;
          case 2 :  
            this.otherTiles = [[1,0], [1,1], [1,2]]
            break;
          case 3 :  
            this.otherTiles = [[1,0], [2,0], [2,-1]]
            break;
        }
        break;
      case "mirrorL" :
        switch (this.orientation) {
          case 0 :  
            this.otherTiles = [[0,1], [0,2], [-1,2]]
            break;
          case 1 :  
            this.otherTiles = [[0,1], [1,1], [2,1]]
            break;
          case 2 :  
            this.otherTiles = [[1,0], [0,1], [0,2]]
            break;
          case 3 :  
            this.otherTiles = [[1,0], [2,0], [2,1]]
            break;
        }
        break;
      case "S" :
        switch (this.orientation) {
          case 0 :  
          case 2 :
            this.otherTiles = [[0,1], [1,0], [-1,1]]
            break;
          case 1 :  
          case 3 :
            this.otherTiles = [[0,1], [1,1], [1,2]]
            break;
        }
        break;
      case "mirrorS" :
        switch (this.orientation) {
          case 0 :  
          case 2 :
            this.otherTiles = [[1,0], [1,1], [2,1]]
            break;
          case 1 :  
          case 3 :
            this.otherTiles = [[0,1], [1,0], [1,-1]]
            break;
        }
        break;
      case "T" :
        switch (this.orientation) {
          case 0 :  
            this.otherTiles = [[-1,0], [1,0], [0,1]]
            break;
          case 1 :  
            this.otherTiles = [[-1,0], [0,1], [0,-1]]
            break;
          case 2 :  
            this.otherTiles = [[-1,0], [1,0], [0,-1]]
            break;
          case 3 :  
            this.otherTiles = [[1,0], [0,-1], [0,1]]
            break;
        }
        break;
    }
  }
  
  this.shape = shape;
  this.orientation = 0; // the 4 orientations of each piece are stored as numbers
  this.otherTiles; // an array containing the other tiles position relative to the reference tile.
  this.orientate();
  
  this.rotateClockwise = function() {
    this.orientation++;
    this.orientation %= 4;
    this.orientate();
  }
  
  
  
}

function createPiece() {
    let r = rand(7);
    switch (r) {
      case 0 :
        return new Piece("square")
      case 1 :
        return new Piece("long")
      case 2 :
        return new Piece("L")
      case 3 :
        return new Piece("mirrorL")
      case 4 :
        return new Piece("S")
      case 5 :
        return new Piece("mirrorS")
      case 6 :
        return new Piece("T")
    }
}


// called when user clicks the start game button. initializes PieceQueue, Grid, and places townhall
function initializeGame() {
//TODO - complete initialization and tie up loose ends
  PieceQueue.initialize();
  Grid.initializeTiles();
  
  
  
  document.onkeypress=function() {getUserKeyPress(event)};
  // hide the cursor
  document.getElementById("ClickArea").style.cursor = "none";
  document.getElementById("StartGameButton").hidden = true;
  document.getElementById("Instructions").removeAttribute("hidden") 
  let x = gridMaxX/2;
  let y = gridMaxY/2;
  let townhallPiece = new Piece("square");
  let townhall = new District([[x-1,y-1],[x-1,y],[x,y-1],[x,y]], townhallPiece)
  townhall.special = "townhall"
  townhall.setAllTiles("townhall");
  townhall.drawBorders(Grid.districtColor);
  townhall.drawSpecialSprite(0);
  townhall.fillTiles(DistrictTownHallColor);
  townhall.updateOutput();
  City.addDistrict(townhall);
  // City.districts.push(townhall);
  updateCityOverview(City.pop, City.happiness, City.wealth);
  
}

//checks if district is adjacent to any city tiles
function isAdjacentToDistrict(coordArray) {
  for (var i=0;i<coordArray.length;i++) {
    let x = coordArray[i][0];
    let y = coordArray[i][1];
    
    if (Grid.tiles[lowerBoundX(x-1)][y].isDistrict || Grid.tiles[x][lowerBoundY(y-1)].isDistrict || Grid.tiles[upperBoundX(x+1)][y].isDistrict
     || Grid.tiles[x][upperBoundY(y+1)].isDistrict) {
       return true
     }
  }
  
  return false
}

function placeDistrict() {
//TODO - ensure all district and city calculations are done properly in this function
  if (Grid.currentHighlight.length < 4) {
      displayMsg("District location blocked!")
      return
  }
  if (!isAdjacentToDistrict(Grid.currentHighlight)) {
    displayMsg("Place district next to exisiting city")
    return
  }
  let districtPiece = PieceQueue.next();
  var newDistrict = new District(Grid.currentHighlight, districtPiece);
  newDistrict.drawBorders(Grid.districtColor);
  newDistrict.calcLvl1Buildings();
  newDistrict.updateOutput();
  City.addDistrict(newDistrict);
  updateCityOverview(City.pop,City.happiness,City.wealth);
}

// get user keypresses
function getUserKeyPress(kp) {
  let key = kp.which
  console.log(key)//debug
  console.log("ok")//debug
  switch (key) {
    case 114 : // r to rotate
      PieceQueue.queue[0].rotateClockwise()
      break;
    case 110 : // debug to throw away piece
      var a = PieceQueue.next()
      break;
    case 98 : // b to place district
      placeDistrict();
      break;
    case 113 : // q to highlight all city districts DEBUG
      debugCityDistricts();
      break;
    case 115 : // s to toggle inspect mode
      toggleInspect();
      break;
  }
  return
}

// toggles inspect mode to look at districts
function toggleInspect() {
  // remove current tile highlight if any
  while (Grid.currentHighlight.length > 0) {
    let coord = Grid.currentHighlight.pop();
    Grid.restoreTile(coord[0], coord[1]);
  }
  
  InspectMode = !InspectMode;
  var clickArea = document.getElementById("ClickArea");
  console.log(clickArea.onmousemove)//debug
  if (InspectMode) {
    clickArea.style.cursor = "default";
    clickArea.onmousemove = function() { Grid.highlightDistrict(event) }
  }
  else {
    clickArea.style.cursor = "none";
    clickArea.onmousemove = function() { Grid.highlightTileFromMouseMove(event) }
  }
  
}

function debugCityDistricts() {
  for (var i=0;i<City.districts.length;i++) {
    City.districts[i].fillTiles("SlateGray")
  }
}

// display an error message that fades away over time
function displayMsg(str) {
  let a = document.getElementById("StatusMsg")
  a.innerHTML = str
  a.style.animation = "Error 3s forwards"
  var b = a.cloneNode(true)
  a.parentNode.replaceChild(b,a)
}

function updateCityOverview(pop, happiness, wealth) {
  let a = document.getElementById("CityOverview");
  a.innerHTML = "Population: " + pop + "<br>" + "Happiness: " + happiness + "<br>" + "Wealth: " + wealth + "<br>"
  
}


// misc helper functions

// returns a random number between 0 and <num>
function rand(num) {
  return Math.floor(Math.random() * num)
}

function lowerBoundX(x) {
  return x < Grid.topLeftX ? 0 : x
}

function upperBoundX(x) {
  return x > gridMaxX ? gridMaxX : x
}

function lowerBoundY(y) {
  return y < Grid.topLeftY ? 0 : y
}

function upperBoundY(y) {
  return y > gridMaxY ? gridMaxY : y
}