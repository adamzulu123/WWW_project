const { Appointment, User, UserAppointment, PaymentMethod } = require('../models');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const { moveDown } = require('pdfkit');


const generatePDF = async (req, res) => {
    try{
        const { user, appointment } = req.body;
        
        //dane płatnosci 
        const paymentMethod = await PaymentMethod.findByPk(appointment.payment_method_id);
        
        if (!paymentMethod) {
            return res.status(404).json({ success: false, message: 'Payment method not found' });
        }
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=Appointment_${appointment.id}_Details.pdf`
        );

        // Inicjalizacja nowego dokumentu PDF
        const doc = new PDFDocument();

        //kolor tła pliku pdf 
        doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f5fffa');
        
        //logo nad tytułem
        const logoPath = path.join(__dirname, 'logo.png');
        const pageWidth = doc.page.width;
        doc.image(logoPath, {
            fit: [50, 50], // Rozmiar logo (szerokość i wysokość)
            x: (pageWidth - 50) / 2, // Wyśrodkowanie obrazu
            y: doc.y // Ustawienie pozycji w osi Y poniżej poprzedniego tekstu
        });
        doc.moveDown(5);

        //tytuł
        doc.fillColor('seagreen').fontSize(30).text('Appointment Summary', { align: 'center' }); 
        
        doc.moveDown(2);

        //user details
        doc.fillColor('#023D54').fontSize(15).text('User details', { align: 'center' });
        doc.moveDown(1);
        doc.fillColor('black');
        doc.fontSize(10).text(`Name: ${user.firstName} ${user.lastName}`);
        doc.fontSize(10).text(`Email: ${user.email}`);
        doc.moveDown(2);
        
        //szczegóły przebiegu spotkania 
        doc.fillColor('#023D54').fontSize(15).text('Meetings details', { align: 'center' });
        doc.moveDown(1);
        doc.fillColor('black');
        doc.fontSize(10).text(`${appointment.type} therapy on ${appointment.date}.`);
        doc.fontSize(10).text(`Attending doctor: ${appointment.doctor_name}`);
        doc.fontSize(10).text(`Recommendations issued by a doctor with an assessment of the patient's progress and whole therapy proces: `); 
        doc.fontSize(10).text(`${appointment.description}`);
        doc.moveDown(2);

        //szczegóły płatnosci 
        doc.fillColor('#023D54').fontSize(15).text('Payment Details', { align: 'center' });
        doc.moveDown(1);
        doc.fillColor('black');
        doc.fontSize(10).text(`Price: ${appointment.price} for ${appointment.duration}h therapy`);
        doc.fontSize(10).text(`Amount paid with: `);
        // Szczegóły specyficzne dla metody płatności
        if (paymentMethod.payment_type === 'credit-card') {
            doc.fontSize(10).text(`Cardholder Name: ${paymentMethod.cardholder_name}`);
            doc.fontSize(10).text(`Card Number: **** **** **** ${paymentMethod.card_number.slice(-4)}`);
            doc.fontSize(10).text(`Expiration Date: ${paymentMethod.expiration_date}`);
        } else if (paymentMethod.payment_type === 'paypal') {
            doc.fontSize(10).text(`PayPal Full Name: ${paymentMethod.paypal_fullname}`);
            doc.fontSize(10).text(`PayPal Email: ${paymentMethod.paypal_email}`);
            doc.fontSize(10).text(`PayPal Phone: ${paymentMethod.paypal_phone || 'N/A'}`);
        }
        doc.moveDown(3);

        // Dodanie tekstu
        doc.fillColor('black').fontSize(10).text('This document was created in accordance with Terapea company regulations.', {align: 'center'});
    
        doc.pipe(res); //przesłanie pdf do odpowiedzi 
        doc.end();



    }catch(err){
        console.log(err);
        res.status(500).send('Server Error while generating PDF');
    }

};


module.exports = {generatePDF};




