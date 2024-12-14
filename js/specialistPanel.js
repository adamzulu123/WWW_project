document.addEventListener("DOMContentLoaded", ()=>{
    fetch('/check-session')
        .then(response => response.json())
        .then(data => {
            if (!data.loggedin) {
                // Jeśli użytkownik nie jest zalogowany, przekieruj go do strony logowania
                window.location.href = '/login';
            }
            if (data.user.account_type !== 'Specialist') {
                window.location.href = '/user-account';
                alert("You don't have permissions to access Specialist Panel!");
            }
        })
        .catch(error => {
            console.error('Error while checking session:', error);
            window.location.href = '/login'; // Jeśli wystąpi błąd w zapytaniu, także przekieruj na logowanie
        });
    
    document.querySelectorAll('.cancel-button').forEach(button => {
        button.addEventListener('click', function() {
            const appointmentId = button.getAttribute('data-id');

            // Potwierdzenie anulowania
            const confirmation = confirm('Are you sure you want to cancel this appointment?');
            if (!confirmation) return;

            fetch('/cancelMeeting', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ appointmentId})
            })
            .then(response => response.json())
            .then(data => {
                console.log('Response from server:', data);
                if (data.success) {
                    // Przeładuj stronę, aby odświeżyć listę spotkań
                    alert('Reservation cancel successfully!');
                    window.location.reload();
                } else {
                    alert('Failed to cancel meeting.');
                }
            });
        });
    });

    document.querySelectorAll('.members-button').forEach(button => {
        button.addEventListener('click', function(){
            const appointmentId = button.getAttribute('data-id');
            const membersListContainer = document.getElementById(`members-list-${appointmentId}`);

            // Jeśli lista uczestników już jest widoczna, ukryj ją
            if (membersListContainer.style.display === "block") {
                membersListContainer.style.display = "none";
                return;
            }

            fetch('/loadMembers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ appointmentId})
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const membersList = membersListContainer.querySelector('ul');
                    membersList.innerHTML = '';  // Czyszczenie listy przed dodaniem nowych danych

                    console.log(data.members);

                    if (data.members.length > 0) {
                        // Dodawanie użytkowników do listy
                        data.members.forEach(user => {
                            const listItem = document.createElement('li'); //dla kazdego pacjenta tworzymymy nowy element listy 
                            listItem.classList.add('list-group-item'); //dodajemy klase do stylizacji bootstrap
                            listItem.innerHTML = `<strong>Name:</strong> ${user.name}`; //dodajemy zawartosc (imie i nazwysko)
                            membersList.appendChild(listItem); //i dodajemy do listy 
                        });
                    } else {
                        membersList.innerHTML = '<li class="list-group-item">No members signed up yet.</li>';
                    }

                    // pokazenie kontenera bo wczesniej był niewidoczny 
                    membersListContainer.style.display = "block";
                } else {
                    alert('Failed to load members.');
                }
            })
            .catch(error => {
                console.error('Error loading members:', error);
                alert('Failed to load members.');
            });
        });


    });


    //wyswietlanie bloczka do pisania description
    document.querySelectorAll('.description-button').forEach(button => {
        button.addEventListener('click', function() {
            const appointmentId = button.getAttribute('data-id');
            const descriptionForm = document.getElementById(`description-form-${appointmentId}`);

            // Jeśli formularz jest już widoczny, ukryj go
            if (descriptionForm.style.display === "block") {
                descriptionForm.style.display = "none";
                return;
            }

            // Pokaż formularz do edycji opisu
            descriptionForm.style.display = "block";
        });
    });


    //dodawanie opisu spotkania 
    document.querySelectorAll('.description-form button').forEach(button => {
        button.addEventListener('click', function(){
            const appointmentId = button.getAttribute('id'); 
            const descriptionText = document.getElementById(`description-text-${appointmentId}`).value;
       
              fetch('/updateDescription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    appointmentId: appointmentId,
                    description: descriptionText
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("Description updated successfully!");
                    // Ukryj formularz po zapisaniu
                    document.getElementById(`description-form-${appointmentId}`).style.display = "none";
                } else {
                    alert("Failed to update description.");
                }
            })
            .catch(error => {
                console.error(error);
                alert("Error while updating the description.");
            });
        });
    });

});