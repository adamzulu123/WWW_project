//usuwanie opcji login z header jak uzytkownik sie juz zalogował
document.addEventListener("DOMContentLoaded", ()=> {

    fetch('/check-session')
        .then(response => response.json())
        .then(data => {
            const logLink = document.querySelector('header .navbar .nav-links li a[href="LogIn.html"]'); 

            if(data.loggedin){
                if(logLink){
                    logLink.parentElement.style.display = 'none'; 
                }
            } 
        }).catch(error =>{
            console.error('Error while checking session', error);
        });
});