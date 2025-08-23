import nodemailer from 'nodemailer';
import { jsPDF } from 'jspdf';

export async function POST({ request }) {
  try {
    const data = await request.json();

    // Generate PDF
    const pdf = new jsPDF();
    pdf.setFontSize(18);
    pdf.text('Scope 1 & 2 Emissions Report', 20, 20);
    pdf.setFontSize(12);
    pdf.text(`Fuel Type: ${data.fuelType}`, 20, 35);
    pdf.text(`Fuel Consumed: ${data.fuel}`, 20, 42);
    pdf.text(`Fleet Distance: ${data.fleet}`, 20, 49);
    pdf.text(`Region: ${data.region}`, 20, 56);
    pdf.text(`Electricity: ${data.electricity} kWh`, 20, 63);
    pdf.text(`Heating: ${data.heating} kWh`, 20, 70);
    pdf.text(`Scope 1 Emissions: ${data.scope1} t CO₂e`, 20, 77);
    pdf.text(`Scope 2 Emissions: ${data.scope2} t CO₂e`, 20, 84);
    pdf.text(`Total Emissions: ${data.total} t CO₂e`, 20, 91);

    // Add chart image
    pdf.addImage(data.chartImg, 'PNG', 20, 100, 170, 80);
    const pdfBytes = pdf.output('arraybuffer');

    // Send email via SMTP (example with Gmail)
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: data.email || process.env.EMAIL_USER, // recipient email
      subject: 'Scope 1 & 2 Emissions Report',
      text: 'Attached is your automated Scope 1 & 2 emissions report.',
      attachments: [{ filename: 'emissions_report.pdf', content: Buffer.from(pdfBytes) }]
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}yes