const navList = Array.from(document.querySelectorAll(".navigation__station-submenu > li"));
const navElements = {};
function navigationInitial(svgSchemeDesc) {
    navList.forEach(navBtn => {
        svgSchemeDesc.forEach(desc => {
            if (desc.innerHTML.split("Станция ")[1] === navBtn.innerHTML){
                navBtn.addEventListener("click", () => navigateTo(desc.parentElement));
                navElements[navBtn.innerHTML] = desc.parentElement;
                return { element: desc.parentElement, link: navBtn };
            }
        });
    });
    navigateTo(navElements["Малиногорка"]);
}

/**
 * Передвигает камеру на определнное место
 * @param {HTMLElement} element
 */
function navigateTo(element) {
    element.scrollIntoView({ block: "start", inline: "center", behavior: "smooth" });
}