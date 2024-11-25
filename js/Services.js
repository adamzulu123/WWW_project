document.addEventListener("DOMContentLoaded", ()=> {
    //created for static presentation. 
    const exampleAppointments ={
        AI: [
            { doctor: "Dr. Emily White", date: "2024-11-28", address: "Online", time: "10:00 AM", type: "Virtual", spots: 8 },
            { doctor: "Dr. James Black", date: "2024-11-29", address: "Online", time: "2:00 PM", type: "Virtual", spots: 6 },
        ],
        PTSD: [
            { doctor: "Dr. Sarah Williams", date: "2024-11-26", address: "123 Recovery St", time: "9:00 AM", type: "In-Person", spots: 5 },
            { doctor: "Dr. Michael Johnson", date: "2024-11-27", address: "456 Healing Ave", time: "1:00 PM", type: "Virtual", spots: 3 },
        ],
        
        GROUP: [
            { doctor: "Dr. Clara Green", date: "2024-11-30", address: "789 Maple Ave", time: "11:00 AM", type: "Group", spots: 12 },
            { doctor: "Dr. Daniel Blue", date: "2024-12-01", address: "101 Oak Dr", time: "3:00 PM", type: "Group", spots: 8 },
        ],
        INDIVIDUAL: [
            { doctor: "Dr. Linda Brown", date: "2024-12-02", address: "321 Pine St", time: "9:30 AM", type: "In-Person", spots: 1 },
            { doctor: "Dr. Robert Clark", date: "2024-12-03", address: "654 Birch Rd", time: "2:30 PM", type: "In-Person", spots: 1 },
        ],
        COUPLES: [
            { doctor: "Dr. Olivia Gray", date: "2024-12-04", address: "234 Cedar Blvd", time: "10:00 AM", type: "In-Person", spots: 5 },
            { doctor: "Dr. William Harris", date: "2024-12-05", address: "987 Willow Ln", time: "1:30 PM", type: "In-Person", spots: 2 },
        ],
    };

    function loadAppointments(category){
        const tableBody = document.querySelector("#appointmentsTable tbody");
        const tableTitle = document.getElementById('categoryTitle')

        tableBody.innerHTML = ""; //clearing table 

        tableTitle.textContent = `Appointments for ${category} therapy: `; //setting a title

        let appointment = exampleAppointments[category];

        appointment.forEach(appointment => {
            const row = document.createElement("tr");
            // ` this symbol is used to create tamplates strings (template literals)
            row.innerHTML = `
            <td>${appointment.doctor}</td>
            <td>${appointment.date}</td>
            <td>${appointment.address}</td>
            <td>${appointment.time}</td>
            <td>${appointment.type}</td>
            <td>${appointment.spots}</td>
            <td><button class="confirm-button">Book</button></td>

        `;
        tableBody.appendChild(row); 
        });
    }

    /*
    document.querySelectorAll('.category-link') - searching for every html element which have category-link class
    then we are interating through node list and assign function for click action
    adding EventListiner: e - is the event object - contains info about it. 
    */
    document.querySelectorAll('.category-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = link.getAttribute('data-category'); //retrieve data-category value from pressed link
            loadAppointments(category); //call load appointment function which is loading available meetting for particular category. 
        });
    });
}
);