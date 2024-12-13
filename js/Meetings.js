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
                                        
                                        ${data.paymentMethods.map(method => {
                                            if (method.payment_type === 'credit-card') {
                                                return `<option value="card-${method.id}">Credit Card: ${method.card_number}</option>`;
                                            } else if (method.payment_type === 'paypal') {
                                                return `<option value="paypal-${method.id}">PayPal: ${method.paypal_email}</option>`;
                                            }
                                            return '';
                                        }).join('')}
                                    </select>
                                </div>
                    
                            <div class="text-end">
                                <button class="btn btn-danger cancel-payment-button"><i class="bi bi-x-circle"></i> Cancel payment</button>
                                <button class="btn btn-success confirm-payment-button"><i class="bi bi-check-circle"></i> Confirm Payment</button>
                            </div>
                        </div>
                    `;

                //dodajemy obsługe potwierdzania płatnosci dla wybranego spotkania 
                const confirmPaymentButton = paymentContainer.querySelector('.confirm-payment-button');
                confirmPaymentButton.addEventListener('click', function(){
                    const billingAddress = document.querySelector('#billingAddress').value;
                    const paymentMethod = document.querySelector('#paymentMethod').value;

                    if (!billingAddress && !paymentMethod){
                        alert('Please fill all required fields');
                        return; 
                    }

                    fetch('/confirm-payment', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ appointmentId, billingAddress, paymentMethod })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if(data.success){
                            alert('Paymeny successtully confirmed'); 
                            window.location.reload()
                        }else{
                            switch (data.message) {
                                case 'Missing required payment details':
                                    alert('Missing required payment details.');
                                    break;
                                case 'Failed to found this bookind or meeting':
                                    alert('Failed to found this bookind or meeting');
                                    break;
                                default:
                                    alert('Failed to pay for this appointment. Please try again later.');
                                    break;
                            }
                        }
                    })
                    .catch(error => {
                        console.error('Error during payment confirmation:', error);
                        alert('An error occurred during payment confirmation.');
                    });
                });


                //anulowanie płatnosci polega po prostu na przeładowaniu strony, bo w sumie po co bardziej komplikowac 
                const cancelPaymentButton = paymentContainer.querySelector('.cancel-payment-button');
                cancelPaymentButton.addEventListener('click', function(){
                    window.location.reload();
                });


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

    //wyświetlanie szczegółów spotkania - jak opłacimy to mamy przycisk details
    document.querySelectorAll('.extend-info-button').forEach(button =>{
        button.addEventListener('click', function(){
            const appointmentId = button.getAttribute('data-category');

            fetch(`/load-meeting-details?appointmentId=${appointmentId}`)
            .then(response => response.json())
            .then(data => {
                if (data && data.appointment && data.user) {
                    const detailsContainer = document.querySelector('.card-extended');

                    const duration = data.appointment.duration;
                    const [hours, minutes] = duration.split(':');
                

                detailsContainer.innerHTML = `

                    <div class="card-header bg-primary custom-header">
                        <h2><i class="bi bi-info-circle-fill me-2"></i>Meeting Details</h2>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <h5><i class="bi bi-person-fill me-2"></i>Doctor</h5>
                            <p id="Doctor" class="text-muted">${data.appointment.doctor_name}</p>
                        </div>
                        <div class="mb-3">
                            <h5><i class="bi bi-card-text me-2"></i>Description</h5>
                            <p id="MeetingDescription" class="text"> ${data.appointment.description} </p>
                        </div>
                        <div class="mb-3">
                            <h5><i class="bi bi-calendar-check-fill me-2"></i>Session Details</h5>
                            <p>
                                <strong>Date:</strong> ${data.appointment.date}<br>
                                <strong>Duration:</strong> ${parseInt(hours)} hour(s)<br>
                                <strong>Type:</strong> ${data.appointment.type}
                            </p>
                        </div>
                        <div class="mb-3">
                            <h5><i class="bi bi-envelope-fill me-2"></i>Contact Information</h5>
                            <p>For any inquiries, contact us at: <span id="doctorEmail" class="text-primary"> Terapea@info.com </span></p>
                        </div>
                        <div class="text-end">
                            <button class="btn btn-success generate-PDF-button">
                                <i class="bi bi-file-earmark-pdf"></i> Generate PDF Summary
                            </button>
                        </div>
                    </div>

            `;


            //generowanie pdf z danymi spotkania i wgl 
            const generatePdfButton = detailsContainer.querySelector('.generate-PDF-button');
            generatePdfButton.addEventListener('click', function(){

                const pdfData = {
                    user: data.user,
                    appointment: data.appointment,
                };

                fetch(`/generate-pdf`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user: data.user,
                        appointment: {
                            ...data.appointment,
                            id: appointmentId,
                        }    
                    }),
                })
                
                //sprawdzamy poprawność odpowiedzi serwera 
                .then(response => {
                    if (response.ok) return response.blob(); //server wysłał pdf jako dane binarne (obiekt blob) które teraz mozemy wyswietlic lub zapisac 
                     throw new Error('Failed to generate PDF')
                })
                //obiekt blob reprezetuje zawartosć pliku pdf 
                .then(blob =>{
                    const link = document.createElement('a'); // Tworzenie elementu <a> HTML
                    link.href = URL.createObjectURL(blob); // Generowanie URL dla danych blob
                    link.download = `Appointment_${appointmentId}_${data.user.firstName}_Details.pdf`; // Ustawienie nazwy pliku do pobrania
                    link.click(); // Automatyczne kliknięcie, które wywołuje pobieranie pliku
                    URL.revokeObjectURL(link.href); //po operacji pobrania usuwany tymczaowy link URL 
                })
                .catch(error => {
                    // Obsługa błędów w przypadku problemów podczas pobierania pliku
                    console.error('Error while generating PDF:', error);
                    alert("Failed to generate PDF. Please try again.");
                });

            });

            }
            })
            .catch(error => {
                console.error('Error while loading meeting details:', error);
                alert("An error occurred while loading meeting details.");
            });
        });
    });




    //obsługa cancelowanie meetingu 
    document.querySelectorAll('.cancel-button').forEach(button => {
        button.addEventListener('click', function(){
            const appointmentId = button.getAttribute('data-id'); 

            fetch(`/cancel-meeting`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ appointmentId }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Przeładuj stronę, aby odświeżyć listę spotkań
                    alert('Reservation cancel successfully!');
                    window.location.reload('/meetings');
                } else {
                    alert('Failed to cancel meeting.');
                }
            });
        });

    });

});

/*
//interowanie po metodach płatnosci 
${data.paymentMethods.map(method => {

    //w zaleznosci od metody platnosci do pola wyboru dodajemy dane pole 

    if (method.payment_type === 'credit-card') { 
        return `<option value="card-${method.id}">Credit Card: ${method.card_number}</option>`;
    } else if (method.payment_type === 'paypal') {
        return `<option value="paypal-${method.id}">PayPal: ${method.paypal_email}</option>`;
    }
    return ''; //jesli nie pasuje typ do niczego to wtedy nie dodajemy metody płatnosci 

}).join('')}
//map() - zwraca tabele wyników <option> dla kazdej metody 
//łączy wszystkie elementy bez separatorów aby móc wyswietlic w polu paymentMethods <select> 


*/











