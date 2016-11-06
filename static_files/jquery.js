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
        
        
        
        // Vote buttons!
        $(".up").click(function(){
                // first grab the data from the buttons!
                    // use var names that match our
                    //desired object keys for simplicity
            var vote = $(this).data("direction");
            var postId = $(this).data("postid");
            var userId = $(this).data("userid");
            
            $.post("/vote", {"vote": vote, "postId": postId, "userId": userId}, function(data, status){
                
               changeVotes(data, postId);  
            });
        });
        
        $(".down").click(function(){
            var vote = $(this).data("direction");
            var postId = $(this).data("postid");
            var userId = $(this).data("userid");
            
            $.post("/vote", {"vote": vote, "postId": postId, "userId": userId}, function(data, status){
                changeVotes(data, postId);
            });
        });
        
        
    // Hide and reveal url value
        // on create post form
    
    $(".url").click(function(){
        $(".url").val("https://")
    })
    
    
    
        // Suggest a title!
        $(".suggest").click(function() {
            var url = $(".url").val();
            console.log(url, "plenty of money")
            
            $(".url").before("<span>loading...</span>")
            
            $.get('/suggestTitle?url=' + url, function(data, status){
                console.log("whoohoo");
                $(".box span").hide();
                $(".title").val(data);
            });
        });
        
    
    // autocomplete a subreddit topic!
        
        
    $('#autocomplete').autocomplete({
        serviceUrl: '/autocomplete',
        onSearchComplete: function (query, suggestions) {
            console.log(suggestions.data, "morning!!");
            if(suggestions.data === undefined){
                
            }
        },
        onSelect: function (suggestion) {
            console.log(suggestion.data, "evening!");
                // negative one is the
            if(suggestion.data === -1){
                
            }
            else{
                $(".sub-hidden").attr('value', suggestion.data);
            }
        }
    });
    
        // make the drop down run fluidly with
            // the input
        $('#autocomplete').on('input', function(e){
            $(this).css("border-bottom", "none");
           
        })
            // make it reappear if anything else on the page is clicked!
        $('*:not(#autocomplete)').click(function() {
            $("#autocomplete").css("border-bottom", "4px solid lightblue");
        })
        
        
    
    
    
    // Hide empty post url!
        //if the post's url is empty
        var hrefPost = $(".post-url").attr("href")
        if(!hrefPost){
            $(".post-url").hide();
        }    
});

// changes the values of the votes on the page without refreshing
function changeVotes(data, postId){
    var voted = "." + postId
        $(voted + " .score").text("Score: " + data.voteScore).css({"color": "darkorchid"})
        $(voted + " .upV").text("Upvotes: " + data.up).css({"color": "darkcyan"})
        $(voted + " .downV").text("Downvotes: " + data.down).css({"color": "crimson"})
          
}