const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

exports.enviarComprobanteMarcacion = async (marcacion, usuario) => {
  const html = `
    <h2>Comprobante de Marcación</h2>
    <p><strong>Tipo:</strong> ${marcacion.tipo_marcacion}</p>
    <p><strong>Fecha:</strong> ${marcacion.fecha}</p>
    <p><strong>Hora:</strong> ${marcacion.hora}</p>
    <p><strong>Hash:</strong> ${marcacion.hash}</p>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: usuario.email,
    subject: 'Comprobante de Marcación',
    html: html
  });
};