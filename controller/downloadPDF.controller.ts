import puppeteer from "puppeteer";
import type { Request, Response } from "express";

    const transactionData = {
  reportTitle: "Transaction Report",
  generatedOn: "26 Dec 2025",
  user: {
    name: "Anjul Singh",
    email: "anjul.singh@example.com",
  },
  transactions: [
    {
      id: "TXN001",
      date: "2025-12-20",
      description: "Course Purchase",
      amount: 999,
      status: "Success",
    },
    {
      id: "TXN002",
      date: "2025-12-21",
      description: "E-book Purchase",
      amount: 299,
      status: "Success",
    },
    {
      id: "TXN003",
      date: "2025-12-22",
      description: "Refund",
      amount: -299,
      status: "Refunded",
    },
  ],
};

const sampleTemplate = (data: any) => {
  const rows = data.transactions
    .map(
      (txn: any, index: number) => `
        <tr>
          <td>${index + 1}</td>
          <td>${txn.id}</td>
          <td>${txn.date}</td>
          <td>${txn.description}</td>
          <td>₹${txn.amount}</td>
          <td>${txn.status}</td>
        </tr>
      `
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${data.reportTitle}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
      color: #333;
    }
    h1 {
      text-align: center;
      margin-bottom: 5px;
    }
    .meta {
      text-align: center;
      font-size: 14px;
      margin-bottom: 20px;
      color: #666;
    }
    .user-info {
      margin-bottom: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      font-size: 14px;
    }
    th {
      background-color: #f4f4f4;
    }
    tr:nth-child(even) {
      background-color: #fafafa;
    }
    .footer {
      margin-top: 30px;
      text-align: center;
      font-size: 12px;
      color: #777;
    }
  </style>
</head>
<body>

  <h1>${data.reportTitle}</h1>
  <div class="meta">
    Generated on: ${data.generatedOn}
  </div>

  <div class="user-info">
    <strong>User:</strong> ${data.user.name}<br />
    <strong>Email:</strong> ${data.user.email}
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Transaction ID</th>
        <th>Date</th>
        <th>Description</th>
        <th>Amount</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>

  <div class="footer">
    © 2025 Transaction System. All rights reserved.
  </div>

</body>
</html>
`;
};


const generatePDF = async (req:Request, res:Response) => {
  try {



    let templateHTML = sampleTemplate(transactionData);

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(templateHTML, {
      waitUntil: "networkidle0",
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    // ✅ CORRECT HEADERS
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice.pdf`
    );

    return res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while generating PDF",
    });
  }
};

export default generatePDF;