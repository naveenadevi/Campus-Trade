const PDFDocument = require('pdfkit');
const fs = require('fs');

function generateInvoice(order, filePath) {
  const doc = new PDFDocument();
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  doc.fontSize(18).text('🧾 Flipkart Clone Invoice', { align: 'center' });
  doc.moveDown();

  doc.fontSize(12).text(`Order ID: ${order._id}`);
  doc.text(`Customer Name: ${order.userDetails.name}`);
  doc.text(`Phone: ${order.userDetails.phone}`);
  doc.text(`Address: ${order.userDetails.address}`);
  doc.text(`Payment Mode: ${order.paymentMode}`);
  if (order.paymentMode === 'UPI' && order.userDetails.upiId) {
    doc.text(`UPI ID: ${order.userDetails.upiId}`);
  }

  doc.moveDown().text('🛍️ Products:', { underline: true });
  order.items.forEach(item => {
    doc.text(`- ${item.title} × ${item.quantity} = ₹${item.price * item.quantity}`);
  });

  doc.moveDown().fontSize(14).text(`💰 Total: ₹${order.totalAmount}`, { align: 'right' });

  doc.end();

  stream.on('finish', () => {
    console.log(`✅ Invoice PDF saved at ${filePath}`);
  });
}

module.exports = generateInvoice;
