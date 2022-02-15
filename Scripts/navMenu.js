const navList = Array.from(document.querySelectorAll(".navigation__station-submenu > li"));
console.log(navList);
function navigationInitial(svgSchemeDesc) {
    navList.forEach(navBtn => {
        svgSchemeDesc.forEach(desc => {
            if (desc.innerHTML.split("Станция ")[1] === navBtn.innerHTML){
                console.log(desc.innerHTML);
                navBtn.addEventListener("click", ()=>navigateTo(desc.parentElement));
                return { element: desc.parentElement, link: navBtn };
            }
        });
    });
}

/**
 * Передвигает камеру на определнное место
 * @param {HTMLElement} element
 */
function navigateTo(element) {
    element.scrollIntoView({ block: "start", inline: "center", behavior: "smooth" });
}