var $ = $;
var jQuery = jQuery;  




    // enables me to use animateCss method
$.fn.extend({
    animateCss: function (animationName) {
        var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
        this.addClass('animated ' + animationName).one(animationEnd, function() {
            $(this).removeClass('animated ' + animationName);
        });
    }
});
  
  
//   Ya'll ready for this?
$(document).ready(function(){
    
    // window scrolls
    $(window).scroll(function(){
        
    });
        
        // bounce button
        $("#title").after("<div class='bounce-btn'></div>")
        
        $(".bounce-btn").append("<button class='stop'>STOP</button>")
        $(".bounce-btn").append("<button class='start'>Bounce!</button>");
        
        $(".stop").hide();
        
       
            
       
        var intervalId = null;
        
        $('.start').click(function(){
            $("#title").animateCss("bounce");
                // bounce immediately on click
            intervalId = setInterval(function(){
                $("#title").animateCss("bounce");
            }, 3000);
                // run our repeat Bounce function
                
            $(".stop").show();
            $(".start").hide();
        })
        
        $(".stop").click(function(){
           clearInterval(intervalId);
            $('.stop').hide();
            $('.start').show();
            
        });
    
    // hide page buttons on homepage and last page
        var pUrl = $(".prev a").attr("href");
            // the negative value signifies that it is
                //either the beginning or the end
 
        var nUrl = $(".next a").attr("href");
        
        
        
        if(!nUrl || !pUrl){
            console.log("no buttons")
        }
        else{
            if(nUrl.includes("page=-1")){
                $(".next").hide();
            }
            else if(pUrl.includes("page=-1")){
                $(".prev").hide();
            }
        }
        
});

