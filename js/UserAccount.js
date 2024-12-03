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

document.getElementById('paymentType').addEventListener('change', (event)=>{
    //.querySelectorAll('.payment-fields') - pobieramy wszystkie elementy o tej klasie 
    document.querySelectorAll('.payment-fields').forEach(field => {
    field.style.display = 'none'; //wszystkie pola ustawiamy na niewidoczne 
});

// Pokaż odpowiednie pole w zależności od wybranego typu
const selectedMethod = event.target.value; //pobieramy atrybut value pobrany z wybranego pola 
//wysietlanie miejsc do wpisywania danych w zaleznosci od wybranej opcji 
if (selectedMethod === 'credit-card') {
    document.getElementById('creditCardFields').style.display = 'block';
} else if (selectedMethod === 'paypal') {
    document.getElementById('paypalFields').style.display = 'block';
} else if (selectedMethod === 'bank-transfer') {
    document.getElementById('bankTransferFields').style.display = 'block';
}
});