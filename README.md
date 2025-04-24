# Inventory Management System

A full-stack inventory management solution built with **Django REST Framework** and **React**. This application streamlines product tracking, barcode scanning, stock alerts, and detailed audit logging through a responsive and user-friendly interface.

---

### **Live Demo**

- **Frontend (Vercel):** [https://inventoryfrontened.vercel.app](https://inventoryfrontened.vercel.app)  
- **Backend (Render):** [https://inventory-backend-1tlk.onrender.com](https://inventory-backend-1tlk.onrender.com)

---

### **Key Features**

- **Product Management:** Add, update, and remove products with attributes like name, SKU, quantity, threshold, and barcode.
- **Barcode Scanning:** Utilize device camera to scan barcodes in real-time with `html5-qrcode`.
- **Stock Alerts:** Automatically highlight products that are low or nearly low in stock.
- **Scan Log:** Maintain a timestamped log of all barcode scans, including source context.
- **Product Log:** Track product changes, including quantity or threshold updates.
- **CSV Export:** Export logs for backups or reporting purposes.
- **Responsive Design:** Built with Tailwind CSS for modern, mobile-friendly UI.
- **Confirmation Modals:** Ensure safe deletion with stylish confirmation prompts.

---

### **Technology Stack**

| Layer       | Tools / Frameworks                              |
|-------------|--------------------------------------------------|
| Frontend    | React, React Router, Axios, Tailwind CSS         |
| Backend     | Django, Django REST Framework                    |
| Database    | PostgreSQL                                       |
| Barcode     | html5-qrcode (for camera-based barcode scanning) |

---

### **Getting Started**

#### **1. Clone the Repository**

```bash
git clone https://github.com/yourusername/inventory-management.git
cd inventory-management
```

#### **2. Backend Setup – Django**

```bash
cd inventory_project
python -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

---

### **Application Overview**

| Route         | Description                                                |
|---------------|------------------------------------------------------------|
| `/`           | Home page with full product list and stock indicators      |
| `/add`        | Add new product manually or via barcode scanner            |
| `/edit/:id`   | Edit or delete existing product                            |
| `/scan`       | Launch barcode scanner for product lookup or creation      |
| `/scan-log`   | View detailed history of barcode scans                     |
| `/product-log`| View changes to product details and stock levels           |

---

### **Product Lifecycle**

1. Scan a barcode on the **Scan** page.
2. If the product exists → Redirected to **Edit Product**.
3. If not found → Redirected to **Add Product** with barcode pre-filled.
4. After saving or updating → Changes are recorded in the logs.
5. Stock levels are continuously monitored for alerts.

---

### **Project Structure**

```
inventory-management/
├── inventory_project/       # Django backend
│   ├── inventory/           # Main Django app (logic, models, views)
│   └── manage.py
├── frontend/                # React frontend
│   ├── src/
│   │   ├── pages/           # Page-level components
│   │   ├── components/      # Reusable UI components
│   └── public/
├── README.md
```

---

### **Planned Enhancements**

- User authentication and role-based access (admin/staff)
- Advanced analytics and reporting dashboard
- Product categories and tagging system
- Improved performance and mobile UX

---

### **Contributing**

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch.
3. Make your changes.
4. Submit a pull request with a detailed description.

For feature requests or bug reports, please open an issue.

---

### **License**

This project is licensed under the **MIT License** — free to use, modify, and distribute.

---

### **Contact**

For any questions or collaboration:

- **Email:** [fathimas0207.email@example.com](mailto:fathimas0207.email@example.com)  
- **GitHub:** [github.com/miashub](https://github.com/miashub)  
- **LinkedIn:** [linkedin.com/in/mia-shajahan](https://linkedin.com/in/mia-shajahan)
