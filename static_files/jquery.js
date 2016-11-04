var $ = $;
var jQuery = jQuery;  





$.fn.extend({
    animateCss: function (animationName) {
        var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
        this.addClass('animated ' + animationName).one(animationEnd, function() {
            $(this).removeClass('animated ' + animationName);
        });
    }
});
  
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
    
    
});

