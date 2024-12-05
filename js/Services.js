//const { response } = require("express");

document.addEventListener("DOMContentLoaded", ()=> {
    console.log('DOM content loaded'); // Czy event DOMContentLoaded działa?


    //ten fragment odpowiada za dostępność tej zakładki tylko dla zalogowanych uytkowników 
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


    /*
    document.querySelectorAll('.category-link') - searching for every html element which have category-link class
    then we are interating through node list and assign function for click action
    adding EventListiner: e - is the event object - contains info about it. 
    */
   
    document.querySelectorAll('.category-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = link.getAttribute('data-category'); // retrieve data-category value from clicked link
            loadAppointments(category); // call loadAppointments function to load the appointments for the selected category
        });
    });
    
    function loadAppointments(category){
        const tableBody = document.querySelector("#appointmentsTable tbody");
        const tableTitle = document.getElementById('categoryTitle')

        tableBody.innerHTML = "";

        tableTitle.textContent = `Appointments for ${category} therapy: `;

        fetch(`/services/${category}`)
            .then(response => {
                console.log("Response status:", response.status);
                return response.json()
            })
            .then(data => {
                if (data.length > 0) {
                    data.forEach(appointment => {
                        if (appointment.available_spots > 0){ //jeśli liczba miejsc jest większa niz 0 tylko wtedy wyswietlamy 
                        const row = document.createElement("tr");
                        row.innerHTML = `
                            <td>${appointment.doctor_name}</td>
                            <td>${appointment.date}</td>
                            <td>${appointment.address}</td>
                            <td>${appointment.time}</td>
                            <td>${appointment.type}</td>
                            <td>${appointment.available_spots}</td>
                            <td>
                                <button class="btn confirm-button"
                                    data-appointment-id="${appointment.id}" 
                                    onclick="bookAppointment(this)">
                                    Book
                                </button>
                            </td>
                        `;
                        tableBody.appendChild(row);
                        }
                    });
                } else {
                    tableBody.innerHTML = "<tr><td colspan='7'>No appointments available for this category.</td></tr>";
                }
            })
            .catch(error => {
                console.error('Error loading appointments:', error);
            });
    }
}
);


function bookAppointment(button){
    const appointmentId = button.getAttribute('data-appointment-id');

    console.log('Appointment ID:', appointmentId);  // Dodajemy logowanie

    if (!appointmentId) {
        alert('Appointment ID is missing!');
        return;
    }

    fetch('/book-appointment', 
    { //ten framgent słuzy wysłaniu do servera ządania POST informujac w formacie json jakie spotkanie chce uzytkownik zarezerwować
        method: 'POST', 
        headers:  {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({appointmentId})
    })
    .then(response => response.json())
    .then(data => {
        if(data.success){
            alert('Appointment booked successfully!');
            location.reload();
        }else{
            alert('Failed to book appointment!');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
