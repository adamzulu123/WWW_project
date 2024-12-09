document.addEventListener("DOMContentLoaded", () => {

    fetch('/check-session') //wysyłamy zapytanie get do endpointu /check-session
        .then(response => response.json()) //serwer odpowiada w formacie json true|false w zaleznosci czy zalogowany 
        .then(data => { //data ma klucz loggedin - jesli false to przekierowanie na /login
            if (!data.loggedin) {
                // jeśli użytkownik nie jest zalogowany, przekieruj go do strony logowania
                window.location.href = '/login';
            }
        })
        // jeśli wystąpi błąd w zapytaniu, także przekieruj na logowanie
        .catch(error => {
            console.error('Error while checking session:', error);
            window.location.href = '/login'; 
        });

    document.querySelectorAll('.pay-button').forEach(link => {
        link.addEventListener('click', function() {
            const appointmentId = link.getAttribute('data-id');

            // Wysyłamy zapytanie do serwera po szczegóły płatności
            fetch(`/load-payment-details?appointmentId=${appointmentId}`)
            .then(response => response.json())
            .then(data => {
                console.log(data);  // Log the full response from the server to see its structure
                if (data && data.appointment) {
                    const paymentContainer = document.querySelector('.card-extended');

                    const duration = data.appointment.duration;
                    const [hours, minutes] = duration.split(':');
                    
                    paymentContainer.innerHTML = `
                        <div class="card-header bg-success payment-header">
                            <h2><i class="bi bi-credit-card me-2"></i>Pay for your therapy session</h2>
                        </div>
                        <div class="card-body">
                            <div class="mb-3">
                                <h5><i class="bi bi-calendar-check-fill me-2"></i>Info about the meeting</h5>
                                <p><span class="type">Date:</span> ${data.appointment.date}</p>
                                <p><span class="type">Doctor:</span> ${data.appointment.doctor_name}</p>
                                <p><span class="type">Price:</span> $${data.appointment.price}</p>
                            </div>
                            
                            <div class="mb-3">
                                <h5><i class="bi bi-cash-coin me-2"></i>Payment Details</h5>
                                <form>
                                    <div class="mb-3">
                                        <label for="sessionFee" class="form-label">Session Fee ($):</label>
                                        <input type="number" id="sessionFee" class="form-control" value="${data.appointment.price}" readonly>
                                    </div>
                                    <div class="mb-3">
                                        <label for="sessionDuration" class="form-label">Session Duration (hours):</label>
                                        <input type="number" id="sessionDuration" class="form-control" value="${parseInt(hours)}" readonly>
                                    </div>
        
                                    <div class="mb-3">
                                        <label for="FirstName" class="form-label">FirstName:</label>
                                        <input type="text" id="firstName" class="form-control" value="${data.firstName}" readonly>
                                    </div>
        
                                    <div class="mb-3">
                                        <label for="SurName" class="form-label">Surname:</label>
                                        <input type="text" id="surName" class="form-control" value="${data.lastName}" readonly>
                                    </div>
                        
                                    <div class="mb-3">
                                        <label for="billingAddress" class="form-label">Billing Address:</label>
                                        <textarea id="billingAddress" class="form-control" rows="3" placeholder="Enter your billing address" required></textarea>
                                    </div>
                                </form>
                            </div>
                            
                            <div class="mb-3">
                                <h5><i class="bi bi-wallet2 me-2"></i>Payment Method</h5>
                                <label for="paymentMethod" class="form-label">Choose your payment method:</label>
                                <select id="paymentMethod" class="form-select">
                                    <option selected disabled>Choose...</option>
                                    <option value="card">Credit Card</option>
                                    <option value="paypal">PayPal</option>
                                </select>
                            </div>
                    
                            <div class="text-end">
                                <button class="btn btn-danger"><i class="bi bi-x-circle"></i> Cancel payment</button>
                                <button class="btn btn-success"><i class="bi bi-check-circle"></i> Confirm Payment</button>
                            </div>
                        </div>
                    `;
                } else {
                    console.error('No appointment found in response:', data);
                }
            })
            .catch(error => {
                console.error('Error while loading payment details:', error);
                alert("An error occurred while loading payment details.");
            });
        
        });
    });

});











