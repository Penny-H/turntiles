
// NOTE: in the variable names I'm using the word 'turn' to mean turning a tile over to reveal the other side,
// and 'go' to mean a player's turn i.e. player 1 goes first, then player 2

// variables

// ones that are set when user changes mode/options
var numberOfTiles;
var playerMode;
var botProb;

// ones that need to be reset before each new game
var turnCount = 0;
var pairCount = 0;
var tryCount = 0;
var currentPlayer = 1;
var score1 = 0;
var score2 = 0;
var tilesSeenArray = [];
var tilesPairArray = [];
var tilesRemaining = [];
var botNextTile = -1;
var totalTurnCountForBotsGo = 0;

// ones that are used in the processing of each game and that are set during processing
var numberOfPairs;
var currentTileId, previousTileId;
var currentTilePosition, previousTilePosition;
var currentImg;
var turnBackTimeout;
var turnBackNeeded;
var clearMatchTimeout;
var clearMatchNeeded;
var player1LastTile, player1SecondLastTile;

// images
var imageArray = ['images/nature/pic1.jpg',
                  'images/nature/pic2.jpg',
                  'images/nature/pic3.jpg',
                  'images/nature/pic4.jpg',
                  'images/nature/pic5.jpg',
                  'images/nature/pic6.jpg',
                  'images/nature/pic7.jpg',
                  'images/nature/pic8.jpg',
                  'images/nature/pic9.jpg',
                  'images/nature/pic10.jpg',
                  'images/nature/pic11.jpg',
                  'images/nature/pic12.jpg',
                  'images/nature/pic13.jpg',
                  'images/nature/pic14.jpg',
                  'images/nature/pic15.jpg',
                  'images/nature/pic16.jpg',
                  'images/nature/pic17.jpg',
                  'images/nature/pic18.jpg',
                  'images/nature/pic19.jpg',
                  'images/nature/pic20.jpg',
                  'images/nature/pic21.jpg',
                  'images/nature/pic22.jpg',
                  'images/nature/pic23.jpg',
                  'images/nature/pic24.jpg',
                  'images/nature/pic25.jpg',
                  'images/nature/pic26.jpg',
                  'images/nature/pic27.jpg',
                  'images/nature/pic28.jpg',
                  'images/nature/pic29.jpg',
                  'images/nature/pic30.jpg'];


// event listeners

// click to select one player mode
$('#btnOne').click(function(){
  $(this).addClass('btnModeActive');
  $(this).attr('title', 'Current game mode is One Player');
  $('#btnBot').removeClass('btnModeActive');
  $('#btnBot').attr('title', 'Set game mode to Bot');
  playerMode = 'one';
  reset();
  newLayout();  
  $('#tries').show();
  $('#scores').hide();
});

// click to select 'play the bot'
$('#btnBot').click(function(){
  $(this).addClass('btnModeActive');
  $(this).attr('title', 'Current game mode is Bot');
  $('#btnOne').removeClass('btnModeActive');
  $('#btnOne').attr('title', 'Set game mode to One Player');
  playerMode = 'bot';
  reset();
  newLayout();
  $('#tries').hide();
  $('#scores').show();  
});

// click on new game button
$('#btnNewGame').click(function(){
  reset();
  newLayout();  
});

// click on options button
$('#btnOptions').click(function(){
  if (numberOfTiles == 8) {
    $('#eight').prop('checked', true);
  } else if (numberOfTiles == 16) {
    $('#sixteen').prop('checked', true);
  } else if (numberOfTiles == 36) {
    $('#thirtysix').prop('checked', true);
  }
  $('#optionsModal').modal('toggle'); 
});  

// click on done button from options
$('#btnDone').click(function(){
  if ($('#eight').prop('checked')) {
    numberOfTiles = 8;
    botProb = 0.5; 
    $('#layout08').show(); 
    $('#layout16').hide();
    $('#layout36').hide(); 
  } else if ($('#sixteen').prop('checked')) {
    numberOfTiles = 16;
    botProb = 0.5; 
    $('#layout08').hide(); 
    $('#layout16').show();
    $('#layout36').hide(); 
  } else if($('#thirtysix').prop('checked')) {
    numberOfTiles = 36;
    botProb = 0.4; //bot a little less clever to make it easier for opponent
    $('#layout08').hide(); 
    $('#layout16').hide();
    $('#layout36').show();    
  }

  reset();
  newLayout();

  $('#optionsModal').modal('toggle');
});

// click on a tile
$('.tile').click(function(){
  if ((playerMode != 'bot') || (playerMode == 'bot' && currentPlayer == 1)) {
    turnTile(this);
  }
});


// functions

//do all processing associated with turning a tile
function turnTile(tileClicked) {
        
  //clear match classes and turn back any unmatched cards immediately rather than wait for the timeouts to finish
  clearTimeouts();
  
  //get the tile id
  currentTileId = $(tileClicked).attr('id');

  //get the number of the tile's position in the grid. 
  //currentTileId stores the tile's id, which is in the form 'tile'+numberOfTiles+'-'+x e.g. 'tile08-1' or 'tile16-12'
  currentTilePosition = parseInt(currentTileId.substr(7));
  
  //check the tile is in the array of tiles still remaining unturned
  if (tilesRemaining.indexOf(currentTilePosition) != -1) {
      
    //TURN THE TILE! 

    //by toggling which image to display
    $('img',tileClicked).toggle();

    //remove the tile from the tilesRemaining array
    var index = tilesRemaining.indexOf(currentTilePosition);
    tilesRemaining.splice(index, 1);
    
    //if playing the bot: 
    if (playerMode == 'bot') {
        
      if (currentPlayer == 2) { //bot
        totalTurnCountForBotsGo++;
      }
      
      //BOT MODE: PROCESSING TO REMEMBER TILE AND FIND PAIR
      
      //remember the image position and if the tile has a pair that has already been seen

      //get the path/name of the image
      currentImg = $('#'+currentTileId).find('.pic').attr('src');

      //if the tile has not previously been matched
      if (tilesPairArray[currentTilePosition] == -1) { 

        //check if the image is already in the array of seen images 
        var matchPosition = tilesSeenArray.indexOf(currentImg);
        
        //if image has been seen before, i.e. it is in the array
        if (matchPosition != -1) { 
            
          //check if it's previously been seen in a different position, i.e. not turned the same card again
          if (matchPosition != currentTilePosition) { 

            //add the pair to the pair array: each item holds the other of the pair's index in it's value
            tilesPairArray[currentTilePosition] = matchPosition;
            tilesPairArray[matchPosition] = currentTilePosition;
          }   
        }
      }

      //add the image to the array of images that have been seen
      tilesSeenArray[currentTilePosition] = currentImg; 
      
      //BOT MODE: END PROCESSING TO REMEMBER TILE AND FIND PAIR
    }
    
    
    //increment turn count
    turnCount++;

    //if it's the first tile turned, note the id and position so can compare with next tile turned
    if (turnCount==1) {
      previousTileId = currentTileId; //preparation for next turn
      previousTilePosition = currentTilePosition; //preparation for next turn
    } 

    //if it's the second tile turned 
    if (turnCount==2) { 

      //check if second tile matches first
      if (isMatch(previousTileId, currentTileId)) { 

        //IT'S A MATCH!
        
        //show up the grid in a nice colour for a little while to indicate a match
        $('.layout').toggleClass('matchColor');
        clearMatchNeeded = true;
        clearMatchTimeout = setTimeout(function() {
          $('.layout').toggleClass('matchColor');
          clearMatchNeeded = false;
        },1000);

        //increment pair count
        pairCount++;
        
        if (playerMode == 'bot') { //bot
            
          //BOT MODE: MATCH
          
          //increment current player's score
          if (currentPlayer == 1) {
            score1++;
            $('#score1').html(score1);
          } else {
            score2++; 
            $('#score2').html(score2);
          }

          //if all tiles matched, declare the winner!
          if (pairCount == numberOfPairs) {
            if (score1 > score2) { 
              // you win
              $('#go').html('You Win!');
              $('#go').removeClass('go2');
              $('#go').addClass('go1');
              $('#player2').removeClass('player2Go');
              $('#player1').addClass('player1Go');
            } else if (score2 > score1) { 
              // bot wins
              $('#go').html('Bot Wins!');
              $('#go').removeClass('go1');
              $('#go').addClass('go2');
              $('#player1').removeClass('player1Go'); 
              $('#player2').addClass('player2Go');
            } else {
              // a tie
              $('#go').html("It's a Tie!"); 
              $('#go').removeClass('go1');
              $('#go').removeClass('go2');
              $('#go').addClass('tie');
              $('#player1').addClass('player1Go');
              $('#player2').addClass('player2Go');  
            }    
          }
          
          //END BOT MODE: MATCH
        }
        
        //END MATCH
          
      } else { //tiles don't match
          
        //NO MATCH!

        //add tiles back to the tilesRemaining array
        tilesRemaining.push(previousTilePosition);
        tilesRemaining.push(currentTilePosition); 
        
        //turn cards back after a delay
        turnBackNeeded = true;
        turnBackTimeout = setTimeout(function() {
          $('img','#'+previousTileId).toggle();
          $('img','#'+currentTileId).toggle(); 
          turnBackNeeded = false;
        },1000);
        
        if(playerMode == 'bot') { 
            
          //BOT MODE: NO MATCH
          
          //other player's go now, so make necessary changes etc 
          if (currentPlayer == 1) {
            //change current player to BOT
            currentPlayer = 2;
            $('#go').html("Bot's Turn");
            
            //remember player 1's last two tiles turned so the bot can use it against them!
            player1SecondLastTile = previousTilePosition;  
            player1LastTile = currentTilePosition;  
            //reset next tile var
            botNextTile = -1;
          } else {
            //change current player to you
            currentPlayer = 1;
            $('#go').html('Your Turn');
            
            //reset the bot's total turn count for the next go
            totalTurnCountForBotsGo = 0;
          }
          //toggle classes relating to different players
          toggleGoClasses();
          
          //END BOT MODE: NO MATCH
        }
        
        //END NO MATCH
      }
      
      //reset turn count
      turnCount = 0; 

      //increment total number of tries (guesses) for this game
      if (playerMode == 'one') { 
          
        //ONE PLAYER MODE: KEEP TRACK OF NUMBER OF TRIES
        
        tryCount++;
        if (pairCount == numberOfPairs) {
          //end of game
          $('#tries').toggleClass('triesColor');
          $('#tries').toggleClass('triesColorDone');
          $('#tries').html('Done in '+tryCount+' tries!');    
        }else{
          $('#tryCount').html(tryCount);   
        }
      }
    }
  }
  //END OF PROCESSING FOR CURRENT TURNED TILE

  //if it's bot mode, 
  //and the bot's go, 
  //and the game isn't over yet... 
  //start the bot's go by finding a tile for it to turn and do the turning
  if((playerMode == 'bot') && (currentPlayer == 2) && (pairCount < numberOfPairs)) {

    //BOT MODE: BOT's GO 
    
    var tileToTurn;
    
    if (botNextTile != -1) {

      if (Math.random() <= botProb) {
        tileToTurn = botNextTile;
      } else {
        if (totalTurnCountForBotsGo == 1) { //make sure the bot doesn't accidentally play the exact same move the other player did
          tileToTurn = getRandTileNotLastPlayers(); 
        } else {
          tileToTurn = getRandomAvailableTile(); 
        }
      }
      botNextTile = -1;

    } else if (totalTurnCountForBotsGo == 0) { //about to do very first turn of the bot's go
      tileToTurn = botStrategy1();
      if (tileToTurn == -1) {
        tileToTurn = botStrategy2();
        if (tileToTurn == -1) {
          tileToTurn = botStrategy3();
          if (tileToTurn == -1) {
            //just get a random tile, 
            //but not one of the ones the other player has just turned cause we've just seen they don't match
            tileToTurn = getRandTileNotLastPlayers(); 
          }
        }
      }
        
    } else if (totalTurnCountForBotsGo == 1) { //about to do second turn of the bot's go
      //none of the above strategies resulted in a pair (we know because botNextTile == -1)
      //look if there's pair that's previously been seen for the tile that was just randomly turned 
      tileToTurn = getPair(currentTilePosition);
      if (tileToTurn == -1) {
        //no pair found, so just get a random tile, 
        //but not one of the ones the other player has just turned cause we've just seen they don't match
        tileToTurn = getRandTileNotLastPlayers(); 
      }
        
    } else if (turnCount == 0) {
      //find a tile that is part of a pair
      tileToTurn = botStrategy3();
      if (tileToTurn == -1) {
        //if no pairs have been seen, just get a random tile
        tileToTurn = getRandomAvailableTile();
      }
        
    } else if (turnCount == 1) {
      //look if there's pair that's previously been seen for the tile that was just randomly turned 
      tileToTurn = getPair(currentTilePosition);
      if (tileToTurn != -1){ //found pair
        if (Math.random() < (botProb + 0.1)) { //make bot reasonably good at finding a pair, but it doesn't always get it right
          tileToTurn = getRandomAvailableTile();   
        }
      } else {
        tileToTurn = getRandomAvailableTile();  
      }        
        
    } else {
      //don't think it'll ever get here??
      //just get a random tile
      tileToTurn = getRandomAvailableTile();   
    }

    //the bot now has a tile to turn...
    //wait a bit before turning the tile so the player can see what's happening
    if (turnCount == 0) {
      //if it's the first turn, wait a bit longer
      setTimeout(function(){turnTile($('#tile'+pad(numberOfTiles,2)+'-'+tileToTurn));},1100);
    }else{
      setTimeout(function(){turnTile($('#tile'+pad(numberOfTiles,2)+'-'+tileToTurn));},500);
    }
  }
}

// one strategy for deciding the bot's next move
function botStrategy1() {
  //bot remembers the other player's last tile, 
  //and if it has seen a pair for it, then it turns that pair, 
  //otherwise it returns -1 and another strategy needs to be used
  var tile = -1;
  if ((tilesPairArray[player1LastTile] != -1) && (tilesRemaining.indexOf(player1LastTile) != -1)){
    tile = player1LastTile; 
    botNextTile = tilesPairArray[player1LastTile]; 
  }
  return tile;
}

// another strategy for deciding the bot's next move
function botStrategy2() {
  //bot remembers the other player's second last tile,
  //and if it has seen a pair for it, then it turns that pair, 
  //otherwise it returns -1 and another strategy needs to be used
  var tile = -1;
  if ((tilesPairArray[player1SecondLastTile] != -1) && (tilesRemaining.indexOf(player1SecondLastTile) != -1)){  
    tile = player1SecondLastTile;
    botNextTile = tilesPairArray[player1SecondLastTile];
  }
  return tile;
}
  
// another strategy for deciding the bot's next move
function botStrategy3() {
  //find a tile that is part of a pair
  var tile = -1;
  for (i=0; i<numberOfTiles; i++) {
    if ((tilesPairArray[i] != -1) && (tilesRemaining.indexOf(i) != -1)) {
      tile = i;
      botNextTile = tilesPairArray[i];
      break;
    }
  }
  return tile;
}
  
// get the pair for a tile if it has been seen during the course of the game so far
function getPair(tile) {
  var pair;
  pair = tilesPairArray[tile];
  if (pair == -1) {
    return -1;  
  } else {
    return pair;   
  } 
}
  
// get a random tile that has not yet been matched
function getRandomAvailableTile() {
  var indexRand;

  //get a random index within the tiles remaining array
  indexRand = Math.floor(Math.random() * tilesRemaining.length); //random number from 0 to tilesRemaining.length-1

  //return the tile position contained in that random element 
  return tilesRemaining[indexRand];

}  
  
// get a random tile that has not yet been matched, but not one that the other player has just turned (and not made a match)
function getRandTileNotLastPlayers() {
  var indexRand, tileRand;

  do {
    //get a random index within the tiles remaining array
    indexRand = Math.floor(Math.random() * tilesRemaining.length); //random number from 0 to tilesRemaining.length-1

    //get the tile position contained in that random element 
    tileRand = tilesRemaining[indexRand];

  } while ((tileRand == player1LastTile) || (tileRand == player1SecondLastTile));  
  //while the tile you generate is one of the ones the other player just turned (and therefore didn't make a match), 
  //keep generating another random tile  

  return tileRand;
} 

// clear any remaining timeouts
function clearTimeouts() {
  //if any match classes need to be cleared, do so immediately rather than wait for timeout
  clearTimeout(clearMatchTimeout);
  if (clearMatchNeeded){
    $('.layout').toggleClass('matchColor');
    clearMatchNeeded = false;
  }
  
  //if any unmatched cards still need to be turned back, do so immediately rather than wait for timeout
  clearTimeout(turnBackTimeout);
  if (turnBackNeeded){
    $('img','#'+previousTileId).toggle();
    $('img','#'+currentTileId).toggle(); 
    turnBackNeeded = false;
  }    
}
  
// check if two tiles match
function isMatch(tile1, tile2) {
  //use the tile ids to find the src of the images (class 'pic') and check if they are the same
  if ($('#'+tile1).find('.pic').attr('src') == $('#'+tile2).find('.pic').attr('src')){
    return true;    
  }else{
    return false;
  }     
} 
  
// show different colors in score grid depending on if player1's go or player2's go (player or bot)
function toggleGoClasses() {
  $('#go').toggleClass('go1');
  $('#go').toggleClass('go2');
  $('#player1').toggleClass('player1Go');
  $('#player2').toggleClass('player2Go');   
}

// shuffle the elements of an array. the function changes the array itself
function shuffle(array) {
  var currentIndex = array.length; 
  var randomIndex;
  var temp;

  // while there are remaining elements in the unshuffled part of the array...
  while (currentIndex) {
  
    // start at last element of unshuffled part of array
    currentIndex--; 
    // pick a random element from the remaining elements
    randomIndex = Math.floor(Math.random() * currentIndex); // random number from 0 to currentIndex-1

    // swap the random element with the current element
    temp = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temp;
  }

  // return array; //passed by reference
}

// pad a number (treated as a string) with leading zeros up to the length specified
function pad(number, length) {
  var str = '' + number;
  while (str.length < length) {
      str = '0' + str;
  }
  return str;
}

// reset variables and classes, clear timeouts, and turn all tiles face down again before start of new game
function reset() {
  turnCount = 0;
  pairCount = 0;
  tryCount = 0;
  currentPlayer = 1;
  score1 = 0;
  score2 = 0;
  tilesSeenArray = [];
  tilesPairArray = [];
  tilesRemaining = [];
  botNextTile = -1;
  totalTurnCountForBotsGo = 0;

  $('#tries').html('Tries: <span id="tryCount">0</span>');  
  $('#tries').removeClass('triesColorDone');
  $('#tries').addClass('triesColor');
  
  $('#go').html('Your Turn'); 
  $('#go').removeClass('tie');
  $('#go').removeClass('go2');
  $('#go').addClass('go1');
  $('#player2').removeClass('player2Go'); 
  $('#player1').addClass('player1Go');
  $('#score1').html('0'); 
  $('#score2').html('0'); 

  clearTimeouts();

  for(i=0; i<numberOfTiles; i++){
    $('#tile'+pad(numberOfTiles,2)+'-'+i).find('.back').show();
    $('#tile'+pad(numberOfTiles,2)+'-'+i).find('.pic').hide();
  }
}

// create a new layout according to the users chosen number of tiles
function newLayout() {

  numberOfPairs = numberOfTiles/2;
  
  for(i=0; i<numberOfTiles; i++){     
      tilesSeenArray[i] = -1; 
      tilesPairArray[i] = -1;
      tilesRemaining[i] = i;
  }
    
  shuffle(imageArray);
    
  //populate the tile array with numberOfTiles/2 pictures from the shuffled image array
   var tileArray = imageArray.slice(0, (numberOfTiles/2));

  //append the same set of pictures again to the tile array so it now contains numberOfTiles/2 pairs of the same image
  tileArray = tileArray.concat(tileArray) 
    
  shuffle(tileArray);

  //set the src for picture side of the tiles to the shuffled images
  for (i=0; i<numberOfTiles; i++) {
    $('#tile'+pad(numberOfTiles,2)+'-'+i).find('.pic').attr('src', tileArray[i]);
  }
}

// when document is ready, create a new layout for a game
$(document).ready(function() { 

  numberOfTiles = 16;
  playerMode = 'one';
  botProb = 0.5;
  newLayout();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/turntiles/sw.js")
      .then(serviceWorker => {
        console.log("Service Worker registered: ", serviceWorker);
      })
      .catch(error => {
        console.error("Error registering the Service Worker: ", error);
      });
  }

});


// PWA

let deferredPrompt; // Allows to show the install prompt

window.addEventListener("beforeinstallprompt", e => {
  console.log("beforeinstallprompt fired");
  // Prevent Chrome 76 and earlier from automatically showing a prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Show the install button
  const installButton = document.getElementById("btnInstall");
  installButton.hidden = false;
  installButton.addEventListener("click", installApp);
});


function installApp() {
  // Show the prompt
  deferredPrompt.prompt();
  installButton.disabled = true;

  // Wait for the user to respond to the prompt
  deferredPrompt.userChoice.then(choiceResult => {
    if (choiceResult.outcome === "accepted") {
      console.log("PWA setup accepted");
      installButton.hidden = true;
    } else {
      console.log("PWA setup rejected");
    }
    installButton.disabled = false;
    deferredPrompt = null;
  });
}