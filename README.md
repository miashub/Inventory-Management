# Inventory Management System

A full-stack inventory management system built with **Django REST Framework** and **React**. Designed to simplify product tracking, stock level monitoring, and audit logging, this solution includes integrated barcode scanning for fast and accurate product handling.

🌐 **Live Demo**  
- 🔗 Frontend (Vercel): [https://inventory-management-two-zeta.vercel.app](https://inventory-management-two-zeta.vercel.app)  
- 🔗 Backend (Render): [https://inventory-backend-a6hg.onrender.com](https://inventory-backend-a6hg.onrender.com)

---

## 📌 Key Features

- **Product Management**: Create, update, and delete products with essential details (name, SKU, quantity, threshold, barcode).
- **Barcode Scanning**: Real-time barcode scanning using the device camera (`html5-qrcode`).
- **Stock Alerts**: Automatic low stock indicators based on customizable alert thresholds.
- **Scan Log**: View timestamped logs of all barcode scan activity.
- **Product Log**: Track changes to products including additions, edits, and quantity/threshold modifications.
- **CSV Export**: Export scan and product logs for reporting and backups.
- **Confirmation Modals**: Modern, styled confirmation prompts for safe actions like product deletion.
- **Clean UI**: Fully responsive frontend built with Tailwind CSS.

---

## 🖥️ Technology Stack

| Layer        | Tools / Frameworks                             |
|--------------|-------------------------------------------------|
| Frontend     | React, React Router, Axios, Tailwind CSS        |
| Backend      | Django, Django REST Framework                   |
| Database     | SQLite (default, can be replaced with PostgreSQL) |
| Barcode Scan | `html5-qrcode` (camera-based barcode detection) |

---

## 🚀 Getting Started

📁 1. Clone the Repository

```bash
git clone https://github.com/yourusername/inventory-management.git
cd inventory-management

----------------------------------------------------------------------------------------------------

⚙️ 2. Backend Setup – Django

cd inventory_project
python -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Migrate database
python manage.py migrate

# Start the development server
python manage.py runserver

----------------------------------------------------------------------------------------------------


🧭 Application Overview

Route             	Description
/	              	Homepage listing products with stock indicators
/add             	Add a new product manually or via barcode scanner
/edit/:id           Edit existing product details or delete
/scan             	Open camera scanner to locate or register products
/scan-log           View all barcode scans with timestamp and context
/product-log	    View all product modifications and quantity changes

----------------------------------------------------------------------------------------------------

🔄 Product Lifecycle Flow
Scan a barcode from the Scan page.

If product exists → redirected to Edit Product.

If not found → redirected to Add Product, with the scanned barcode pre-filled.

Save or update product → change is logged automatically.

Logs available in Scan Log and Product Log pages.

Products with quantity ≤ threshold are flagged on the dashboard.

----------------------------------------------------------------------------------------------------

📂 Folder Structure

inventory-management/
├── inventory_project/     # Django backend (API, models, views, logs)
│   ├── inventory/         # Main app: Product + Scan + Log logic
│   └── manage.py
├── frontend/              # React frontend (UI)
│   ├── src/
│   │   ├── pages/         # Page components (Scan, Add, Edit, Logs)
│   │   ├── components/    # Reusable components (ProductForm, Navbar)
│   └── public/
├── README.md

----------------------------------------------------------------------------------------------------

🔮 Future Enhancements
User authentication and role-based access (admin/staff)

Advanced analytics dashboard

Product categorization and tagging

Enhanced mobile optimization

----------------------------------------------------------------------------------------------------

🤝 Contributing
Contributions are welcome! Fork the repository, make your changes, and open a pull request with a detailed explanation. For bugs or feature suggestions, please open an issue.

----------------------------------------------------------------------------------------------------

📄 License
This project is licensed under the MIT License – open to use, modify, and distribute.

----------------------------------------------------------------------------------------------------

📬 Contact
For questions or collaboration opportunities:

📧 Email: fathimas0207.email@example.com

💻 GitHub: github.com/miashub

🔗 LinkedIn: linkedin.com/in/mia-shajahan
