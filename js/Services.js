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

        let events = []; //inicajlizacja tabelki events 

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
                            <td>${appointment.duration}</td>
                            <td>
                                <button class="btn confirm-button"
                                    data-appointment-id="${appointment.id}" 
                                    onclick="bookAppointment(this)">
                                    Book
                                </button>
                            </td>
                        `;
                        tableBody.appendChild(row);

                        //ładowanie elementów do kalendarza!
                        events.push({
                            title: `${appointment.type} with ${appointment.doctor_name}`,
                            start: `${appointment.date}T${appointment.time}`, 
                            extendedProps: {
                                duration: appointment.duration, 
                                doctor_name: appointment.doctor_name, 
                                address: appointment.address
                            }
                        });
                    }
                });
                // Załaduj kalendarz
                renderCalendar(events);
                } else {
                    tableBody.innerHTML = "<tr><td colspan='7'>No appointments available for this category.</td></tr>";
                    renderCalendar([]); //jak cos to pusty 
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
            //odpowiedni komunikat w zaleznosci od błedu rezerwacji 
            switch (data.message) {
                case 'Appointment not found':
                    alert('The appointment you are trying to book does not exist.');
                    break;
                case 'No available spots':
                    alert('No available spots for this appointment.');
                    break;
                case 'You have already booked this meeting!':
                    alert('You have already booked this appointment.');
                    break;
                default:
                    alert('Failed to book the appointment. Please try again later.');
                    break;
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}


function renderCalendar(events) {
    const calendarEl = document.getElementById('calendar');

    if (!calendarEl) {
        console.error('Nie znaleziono elementu #calendar');
        return;
    }


    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        
        eventDidMount: function(info) {
            const event = info.event;
            const tooltipContent = `
                <div>
                    <p><b>Doctor:</b> ${event.extendedProps.doctor_name}</p>
                    <p><b>Address:</b> ${event.extendedProps.address}</p>
                    <p><b>Duration:</b> ${event.extendedProps.duration}</p>
                </div>
            `;

            // Ustawienie Tooltips z opóźnieniem, aby upewnić się, że element jest renderowany
            new bootstrap.Tooltip(info.el, {
                title: tooltipContent,
                html: true, // Ważne, żeby tooltip obsługiwał HTML
                placement: 'top', // Możesz zmienić pozycję, jeśli chcesz
                trigger: 'hover',
                container: 'body'
            });
            
        },

        events: events || [], // Przekaż pustą tablicę, jeśli brak wydarzeń
        eventTimeFormat: {
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short'
        }
    });

    calendar.render();
}


