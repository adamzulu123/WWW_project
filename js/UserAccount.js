document.addEventListener("DOMContentLoaded", ()=>{
    fetch('/check-session')
        .then(response => response.json())
        .then(data => {
            if (!data.loggedin) {
                // Jeśli użytkownik nie jest zalogowany, przekieruj go do strony logowania
                window.location.href = '/login';
            }
        })
        .catch(error => {
            console.error('Error while checking session:', error);
            window.location.href = '/login'; // Jeśli wystąpi błąd w zapytaniu, także przekieruj na logowanie
        });
})  