//content loading based on the selected meeting 
document.addEventListener("DOMContentLoaded", () => {

    fetch('/check-session') //wysyłamy zapytanie get do endpointu /check-session
        .then(response => response.json()) //serwer odpowiada w formacie json true|false w zaleznosci czy zalogowany 
        .then(data => { //data ma klucz loggedin - jesli false to przekierowanie na /login
            if (!data.loggedin) {
                // jeśli użytkownik nie jest zalogowany, przekieruj go do strony logowania
                window.location.href = '/login';
            }
        })
        // jesli wystąpi błąd w zapytaniu, także przekieruj na logowanie
        .catch(error => {
            console.error('Error while checking session:', error);
            window.location.href = '/login'; 
        });

    const exampleData = {
        AI: [
            {
                doctor: "Dr. Emily White",
                description: "A cutting-edge therapy using AI-based treatments to help individuals manage stress, anxiety, and other mental health challenges. This therapy combines modern technology with traditional therapeutic approaches to identify patterns in emotional responses and offer personalized coping strategies.",
                recipe: "recipe1.pdf",
                analysis: "analysis1.pdf",
                invoice: "invoice1.pdf",
                email: "emily.white@clinic.com"
            }
        ],
        Individual: [
            {
                doctor: "Dr. Linda Brown",
                description: "A one-on-one therapy session aimed at addressing personal challenges. During this session, the therapist will engage in a deep conversation with the client, focusing on understanding their thoughts, emotions, and behaviors. Through various techniques such as cognitive-behavioral therapy (CBT) and mindfulness, the therapist works with the client to develop personalized strategies for coping and growth.",
                recipe: "recipe2.pdf",
                analysis: "analysis2.pdf",
                invoice: "invoice2.pdf",
                email: "linda.brown@clinic.com"
            }
        ],
        Group: [
            {
                doctor: "Dr. Clara Green",
                description: "Group therapy designed for individuals facing similar issues, such as grief, addiction, or anxiety. Participants engage in facilitated discussions, share experiences, and learn from each other. This form of therapy emphasizes collective support, emotional validation, and building a sense of community while addressing personal challenges.",
                recipe: "recipe3.pdf",
                analysis: "analysis3.pdf",
                invoice: "invoice3.pdf",
                email: "clara.green@clinic.com"
            }
        ]
    };

    function loadData(category) {
        const meeting = exampleData[category][0];  // access the first (and only) object in the array for that category

        document.getElementById('Doctor').textContent = `Doctor: ${meeting.doctor}`;
        document.getElementById('MeetingDescription').textContent = `Description: ${meeting.description}`;
        document.getElementById('doctorEmail').textContent = meeting.email;

        document.getElementById('recipeLink').setAttribute('href', meeting.recipe);
        document.getElementById('analysisLink').setAttribute('href', meeting.analysis);
        document.getElementById('invoiceLink').setAttribute('href', meeting.invoice);
    }

    document.querySelectorAll('.extend-info-button').forEach(button => {
        button.addEventListener('click', () => {
            const category = button.getAttribute('data-category'); 
            loadData(category);  // load meeting details based on the category
        });
    });
});












