const [hamburger] = document.getElementsByClassName('menu-hamburger-button');
const [menu] = document.getElementsByClassName('drawer-mobile');
const [close] = document.getElementsByClassName('drawer-close');


hamburger.onclick = () => {
  hamburger.style.display = 'none';
  menu.style.display = 'flex'; 
};

close.onclick = () => {
  menu.style.display = 'none'; 
  hamburger.style.display = 'flex';
}