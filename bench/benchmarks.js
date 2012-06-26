// if(old_blam.version != blam.version) {
//   benchmark('Old Blam vs New Blam', function(b){
//     var tmpl= function() {
//             return article(section.main('content'), aside('sidebar'));
//           },
//         tmpl_b= blam.compile(tmpl),
//         tmpl_k= old_blam.compile(tmpl);
    
//     b.add('New Blam', function() {
//       tmpl_b()
//     })
//     .add('Old Blam', function() {
//       tmpl_k()
//     })

//   })  
// }


// benchmark('Blam vs Blam.fancy()', function(b){
//   var tmplA= function() {
//           return article(section({ 'class':'main' }, 'content'), aside('sidebar'));
//         },
//       tmplB= function() {
//           return article(section.main('content'), aside('sidebar'));
//         };
//     blam.fancy(true);
//     var ft= blam.compile(tmplB);
//     blam.fancy(false)
//     var pt= blam.compile(tmplA);
//     blam.fancy(true)
  
//   b.add('Blam.fancy()', function() {
//     ft()
//   })
//   .add('Blam plain', function() {
//     pt()
//   })
// })

benchmark('Settee vs Blam', function(b){

  var st= settee('(html (head (title "Hello " :name'),
      bt= blam.compile(function(name){ return html( head( title("Hello ", name)))});

  b.add('settee compiled', function(){
    st({ name:'Matt' })
  })

  b.add('blam compiled', function(){
    bt('Matt');
  })

})


benchmark('Settee vs Jade', function(b){

  var jt= jade.compile('html\n  head\n    title= name'),
      st= settee('(html (head (title :name');

  b.add('settee compiled', function(){
    st({ name:'Matt' });
  })

  b.add('jade compiled', function(){
    jt({ name:'Matt' })
  })

})

benchmark('Settee vs Blam vs Jade ', function(b){

  var jt= jade.compile('html\n  head\n    title= name'),
      st= settee('(html (head (title "Hello " :name'),
      bt= blam.compile(function(name){ return html( head( title("Hello ", name)))});

  b.add('settee compiled', function(){
    st({ name:'Matt' })
  })

  b.add('blam compiled', function(){
    bt('Matt');
  })
  
  b.add('jade compiled', function(){
    jt({ name:'Matt' })
  })  

})
