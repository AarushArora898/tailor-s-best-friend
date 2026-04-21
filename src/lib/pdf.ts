import jsPDF from "jspdf";
import type { Customer } from "@/types/customer";

export function generatePDF(customer: Customer, shopName: string) {
  const doc = new jsPDF();
  const w = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(shopName, w / 2, y, { align: "center" });
  y += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Customer Measurement Sheet", w / 2, y, { align: "center" });
  y += 10;

  // Line
  doc.setDrawColor(200);
  doc.line(15, y, w - 15, y);
  y += 8;

  // Customer info
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(customer.name, 15, y);
  y += 6;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Phone: ${customer.phone}`, 15, y);
  if (customer.email) { y += 5; doc.text(`Email: ${customer.email}`, 15, y); }
  if (customer.address) { y += 5; doc.text(`Address: ${customer.address}`, 15, y); }
  y += 5;
  doc.text(`Date: ${new Date(customer.createdAt).toLocaleDateString()}`, 15, y);
  y += 10;

  function addSection(title: string, data: Record<string, string>, labels: Record<string, string>) {
    if (y > 250) { doc.addPage(); y = 20; }
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(title, 15, y);
    y += 7;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    const entries = Object.entries(labels);
    entries.forEach(([key, label]) => {
      if (key === "notes") return;
      const val = data[key] || "—";
      doc.text(`${label}: ${val}`, 20, y);
      y += 5;
      if (y > 275) { doc.addPage(); y = 20; }
    });

    if (data.notes) {
      doc.text(`Notes: ${data.notes}`, 20, y);
      y += 5;
    }
    y += 5;
  }

  addSection("Shirt Measurements", customer.shirt as any, {
    chest: "Chest", waist: "Waist", shoulder: "Shoulder", sleeveLength: "Sleeve Length",
    neck: "Neck", shirtLength: "Shirt Length", bicep: "Bicep", wrist: "Wrist", notes: "Notes",
  });

  addSection("Pant Measurements", customer.pant as any, {
    waist: "Waist", hip: "Hip", thigh: "Thigh", knee: "Knee",
    bottom: "Bottom", inseam: "Inseam", outseam: "Outseam", length: "Length", notes: "Notes",
  });

  addSection("Blazer Measurements", customer.blazer as any, {
    chest: "Chest", waist: "Waist", shoulder: "Shoulder", sleeve: "Sleeve",
    length: "Length", neck: "Neck", armhole: "Armhole", notes: "Notes",
  });

  doc.save(`${customer.name.replace(/\s+/g, "_")}_measurements.pdf`);
}
