var input=document.querySelector('.search');
var images=document.querySelectorAll('#image_container > .card > img');
var card=document.querySelectorAll('#image_container > .card');

input.addEventListener('keydown',function(){
  for(var i=0; i<images.length;i++)
  {
      var lower=images[i].alt.toLowerCase();
      var upper=images[i].alt.toUpperCase();
      var original=images[i].alt;
      if(new RegExp(this.value).test(lower)||new RegExp(this.value).test(upper)||new RegExp(this.value).test(original))
      {      
        card[i].style.display ="block";
      }
      else
      {
        card[i].style.display ="none";
      }
      console.log(images[i].alt)
  }
  
});