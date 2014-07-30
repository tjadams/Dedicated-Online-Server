/**
 * Created by Tyler Adams on 29/07/2014.
 */

var MapleSkinColor = function(){

};

var values = {
    NORMAL: 0, 
    DARK: 1, 
    BLACK: 2,
    PALE: 3, 
    BLUE: 4,
    GREEN: 5,
    WHITE: 9,
    PINK: 10
};


MapleSkinColor.getById = function(id){
    for(var value in values){
         if(values.value == id){
             return value;
         }
    }
};


module.exports = MapleSkinColor;