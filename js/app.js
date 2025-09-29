// // Horizontal scrolling with vertical wheel support
// document.addEventListener('DOMContentLoaded', function() {
//     const scrollContainer = document.querySelector('.scroll-container');
//     let isScrolling = false;
    
//     // Handle vertical scroll wheel to scroll horizontally
//     scrollContainer.addEventListener('wheel', function(e) {
//         // Prevent default vertical scrolling
//         e.preventDefault();
        
//         // Convert vertical scroll to horizontal
//         const scrollAmount = e.deltaY || e.deltaX;
//         scrollContainer.scrollLeft += scrollAmount;
        
//         // Smooth scrolling effect
//         if (!isScrolling) {
//             isScrolling = true;
//             requestAnimationFrame(() => {
//                 isScrolling = false;
//             });
//         }
//     }, { passive: false });
    
//     // Handle touch scrolling for mobile
//     let startX = 0;
//     let scrollLeft = 0;
    
//     scrollContainer.addEventListener('touchstart', function(e) {
//         startX = e.touches[0].pageX - scrollContainer.offsetLeft;
//         scrollLeft = scrollContainer.scrollLeft;
//     });
    
//     scrollContainer.addEventListener('touchmove', function(e) {
//         e.preventDefault();
//         const x = e.touches[0].pageX - scrollContainer.offsetLeft;
//         const walk = (x - startX) * 2;
//         scrollContainer.scrollLeft = scrollLeft - walk;
//     });
    
//     // Keyboard navigation
//     document.addEventListener('keydown', function(e) {
//         switch(e.key) {
//             case 'ArrowLeft':
//                 e.preventDefault();
//                 scrollContainer.scrollLeft -= 100;
//                 break;
//             case 'ArrowRight':
//                 e.preventDefault();
//                 scrollContainer.scrollLeft += 100;
//                 break;
//             case 'ArrowUp':
//                 e.preventDefault();
//                 scrollContainer.scrollLeft -= 100;
//                 break;
//             case 'ArrowDown':
//                 e.preventDefault();
//                 scrollContainer.scrollLeft += 100;
//                 break;
//         }
//     });
// });