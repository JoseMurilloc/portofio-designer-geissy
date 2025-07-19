const hamburger = document.getElementById('menu-hamburger-button');

hamburger.onclick = () => {
  const drawer = document.getElementById("drawer-mobile");
  
  drawer.classList.toggle("change");
  document.body.classList.toggle('no-scroll');
};


