lucide.createIcons();

// States
let items = [{ name: "", quantity: 1, price: 0, type: "product" }];
let taxRate = 0;
let discountRate = 0;
let currency = "USD";
let itemMode = "product";
const exchangeRates = { USD: 1, INR: 83, EUR: 0.92 };
const currencySymbols = { USD: "$", INR: "₹", EUR: "€" };
const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
let invoiceNumber = `${today}-001`;

// the DOM Elements
const invoiceForm = document.getElementById("invoice-form");
const invoiceNumberInput = document.getElementById("invoice-number");
const invoiceDate = document.getElementById("invoice-date");
const businessName = document.getElementById("business-name");
const businessAddress = document.getElementById("business-address");
const clientName = document.getElementById("client-name");
const clientEmail = document.getElementById("client-email");
const clientAddress = document.getElementById("client-address");
const itemsList = document.getElementById("items-list");
const addItemBtn = document.getElementById("add-item");
const taxRateInput = document.getElementById("tax-rate");
const discountRateInput = document.getElementById("discount-rate");
const subtotalEl = document.getElementById("subtotal");
const taxEl = document.getElementById("tax");
const discountEl = document.getElementById("discount");
const totalEl = document.getElementById("total");
const currencySelect = document.getElementById("currency");
const productMode = document.getElementById("product-mode");
const serviceMode = document.getElementById("service-mode");
const previewInvoiceNumber = document.getElementById("preview-invoice-number");
const previewInvoiceDate = document.getElementById("preview-invoice-date");
const previewBusinessName = document.getElementById("preview-business-name");
const previewBusinessAddress = document.getElementById("preview-business-address");
const previewClientName = document.getElementById("preview-client-name");
const previewClientEmail = document.getElementById("preview-client-email");
const previewClientAddress = document.getElementById("preview-client-address");
const previewItems = document.getElementById("preview-items");
const previewSubtotal = document.getElementById("preview-subtotal");
const previewTax = document.getElementById("preview-tax");
const previewDiscount = document.getElementById("preview-discount");
const previewTotal = document.getElementById("preview-total");
const generateBtn = document.getElementById("generate-invoice");
const resetBtn = document.getElementById("reset-invoice");
const previewSaveBtn = document.getElementById("preview-save");
const previewPdfBtn = document.getElementById("preview-pdf");
const previewImageBtn = document.getElementById("preview-image");
const previewSection = document.querySelector(".preview-section");
const previewSaveSpinner = document.getElementById("preview-save-spinner");
const previewPdfSpinner = document.getElementById("preview-pdf-spinner");
const previewImageSpinner = document.getElementById("preview-image-spinner");
const themeToggle = document.getElementById("theme-toggle");

    // Scroll animations
    function handleScroll() {
    document.querySelectorAll(".hidden-scroll").forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.8) {
        el.classList.remove("hidden-scroll");
        el.classList.add(
            "visible-scroll",
            "animate__animated",
            "animate__fadeInUp"
        );
        }
    });
    }
    window.addEventListener("scroll", handleScroll);

    // Validation
    function validateInput(input, type) {
    if (
        type === "email" &&
        input.value &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)
    ) {
        input.classList.add(
        "animate__animated",
        "animate__shakeX",
        "border-red-500"
        );
        setTimeout(
        () =>
            input.classList.remove(
            "animate__animated",
            "animate__shakeX",
            "border-red-500"
            ),
        500
        );
        alert("Please enter a valid email address.");
        return false;
    }
    if (type === "number" && input.value < 0) {
        input.classList.add(
        "animate__animated",
        "animate__shakeX",
        "border-red-500"
        );
        setTimeout(
        () =>
            input.classList.remove(
            "animate__animated",
            "animate__shakeX",
            "border-red-500"
            ),
        500
        );
        alert("Value cannot be negative.");
        return false;
    }
    if (
        type === "invoiceNumber" &&
        input.value &&
        !/^\d{8}-\d{3}$/.test(input.value)
    ) {
        input.classList.add(
        "animate__animated",
        "animate__shakeX",
        "border-red-500"
        );
        setTimeout(
        () =>
            input.classList.remove(
            "animate__animated",
            "animate__shakeX",
            "border-red-500"
            ),
        500
        );
        alert(
        "Invoice number must be in the format YYYYMMDD-NNN (e.g., 20250517-001)."
        );
        return false;
    }
    input.classList.remove("border-red-500");
    return true;
    }

    // Save to file
    function saveToFile(data, filename) {
    try {
        const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    } catch (err) {
        console.error("Error saving file:", err);
        alert("Failed to save file. Please try again.");
    }
    }

    // Save state to localStorage
    function saveState() {
    const invoiceData = {
        invoiceNumber: invoiceNumberInput.value,
        invoiceDate: invoiceDate.value,
        businessName: businessName.value,
        businessAddress: businessAddress.value,
        clientName: clientName.value,
        clientEmail: clientEmail.value,
        clientAddress: clientAddress.value,
        taxRate: taxRateInput.value,
        discountRate: discountRateInput.value,
        currency,
        itemMode,
        items,
    };
    localStorage.setItem("invoice", JSON.stringify(invoiceData));
    // Set a flag in sessionStorage to indicate an active session
    sessionStorage.setItem("invoiceSessionActive", "true");
    }

    // Load saved data
    function loadSavedData() {
    // Check if this is a new session
    const isNewSession = !sessionStorage.getItem("invoiceSessionActive");

    if (isNewSession) {
        // Fresh start: Initialize with default values
        invoiceNumberInput.value = `${today}-001`;
        invoiceDate.value = "";
        businessName.value = "";
        businessAddress.value = "";
        clientName.value = "";
        clientEmail.value = "";
        clientAddress.value = "";
        taxRateInput.value = "";
        discountRateInput.value = "";
        currencySelect.value = "USD";
        productMode.checked = true;
        items = [{ name: "", quantity: 1, price: 0, type: "product" }];
        taxRate = 0;
        discountRate = 0;
        currency = "USD";
        itemMode = "product";
        invoiceNumber = invoiceNumberInput.value;
        // Clear any existing state in localStorage
        localStorage.removeItem("invoice");
    } else {
        // Load persisted state from localStorage
        const saved = localStorage.getItem("invoice");
        if (saved) {
        const data = JSON.parse(saved);
        invoiceNumberInput.value = data.invoiceNumber || `${today}-001`;
        invoiceDate.value = data.invoiceDate || "";
        businessName.value = data.businessName || "";
        businessAddress.value = data.businessAddress || "";
        clientName.value = data.clientName || "";
        clientEmail.value = data.clientEmail || "";
        clientAddress.value = data.clientAddress || "";
        taxRateInput.value = data.taxRate || "";
        discountRateInput.value = data.discountRate || "";
        currencySelect.value = data.currency || "USD";
        itemMode = data.itemMode || "product";
        productMode.checked = itemMode === "product";
        serviceMode.checked = itemMode === "service";
        items = data.items || [
            { name: "", quantity: 1, price: 0, type: "product" },
        ];
        taxRate = parseFloat(data.taxRate) || 0;
        discountRate = parseFloat(data.discountRate) || 0;
        currency = data.currency || "USD";
        invoiceNumber = invoiceNumberInput.value;
        }
    }

    updateItemLabels();
    renderItems();
    updateCalculations();
    handleScroll();
    }

    // Update item labels based on mode
    function updateItemLabels() {
    const itemLabel = document.querySelectorAll(".item-label");
    const qtyLabel = document.querySelectorAll(".qty-label");
    const priceLabel = document.querySelectorAll(".price-label");
    if (itemMode === "product") {
        itemLabel.forEach((el) => (el.textContent = "Product"));
        qtyLabel.forEach((el) => (el.textContent = "Quantity"));
        priceLabel.forEach((el) => (el.textContent = "Price"));
    } else {
        itemLabel.forEach((el) => (el.textContent = "Service"));
        qtyLabel.forEach((el) => (el.textContent = "Hours"));
        priceLabel.forEach((el) => (el.textContent = "Rate"));
    }
    }

    // Render items
    function renderItems() {
    itemsList.innerHTML = "";
    const itemPlaceholder = itemMode === "product" ? "Enter product name" : "Enter service name";
    const qtyLabel = itemMode === "product" ? "Quantity" : "Hours";
    const priceLabel = itemMode === "product" ? "Price" : "Rate";
    items.forEach((item, index) => {
    const row = document.createElement("tr");
    row.className = "transition-colors animate__animated animate__fadeIn";
    row.innerHTML = ` <td class="p-3"><input type="text" value="${item.name}" 
    placeholder="${itemPlaceholder}" class="w-full glow-input rounded-md focus:ring-2 focus:ring-[var(--accent)]" 
    aria-label="${itemPlaceholder}"></td>
    <td class="p-3"><input type="number" value="${item.quantity}" min="1" class="w-full glow-input rounded-md focus:ring-2 focus:ring-[var(--accent)]" aria-label="${qtyLabel}"></td>
    <td class="p-3"><input type="number" value="${item.price}" min="0" step="0.01" class="w-full glow-input rounded-md focus:ring-2 focus:ring-[var(--accent)]" aria-label="${priceLabel}"></td>
    <td class="p-3 font-mono text-[var(--accent)] text-base">${currencySymbols[currency]}${(item.quantity * item.price * exchangeRates[currency] || 0).toFixed(2)}</td>
    <td class="p-3"><button type="button" class="remove-item text-red-500 hover:text-red-600 ${items.length === 1 ? "opacity-50 cursor-not-allowed" : ""}" 
    ${ items.length === 1 ? "disabled" : ""} aria-label="Remove item"><i data-lucide="trash-2" class="w-5 h-5"></i></button></td>`;
    itemsList.appendChild(row);
    const inputs = row.querySelectorAll("input");
    inputs[0].focus();
    inputs[0].addEventListener("input", (e) => {
    items[index].name = e.target.value;
    updatePreview();
    saveState();
    });
    inputs[1].addEventListener("input", (e) => {
    if (validateInput(e.target, "number")) {
        items[index].quantity = parseInt(e.target.value) || 1;
        updateCalculations();
        saveState();
    }
    });
    inputs[2].addEventListener("input", (e) => {
    if (validateInput(e.target, "number")) {
        items[index].price = parseFloat(e.target.value) || 0;
        updateCalculations();
        saveState();
    }
    });
    row.querySelector(".remove-item").addEventListener("click", () => {
    if (items.length > 1) {
        row.classList.add("animate__animated", "animate__fadeOut");
        setTimeout(() => {
        items.splice(index, 1);
        renderItems();
        updateCalculations();
        saveState();
        }, 300);
    }
    });
    });
    lucide.createIcons();
    }

    // Update calculations
    function updateCalculations() {
    const subtotal = items.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
    );
    const tax = subtotal * (taxRate / 100);
    const discount = subtotal * (discountRate / 100);
    const total = (subtotal + tax - discount) * exchangeRates[currency];

    subtotalEl.textContent = `${
        currencySymbols[currency]
    }${subtotal.toFixed(2)}`;
    taxEl.textContent = `${currencySymbols[currency]}${tax.toFixed(2)}`;
    discountEl.textContent = `${
        currencySymbols[currency]
    }${discount.toFixed(2)}`;
    totalEl.textContent = `${currencySymbols[currency]}${total.toFixed(2)}`;

    totalEl.classList.add("animate__animated", "animate__pulse");
    setTimeout(
        () => totalEl.classList.remove("animate__animated", "animate__pulse"),
        300
    );

    updatePreview();
    }

    // Updating the preview 
    function updatePreview() {
    previewInvoiceNumber.textContent =
        invoiceNumberInput.value || "20250517-001";
    previewInvoiceDate.textContent = invoiceDate.value || "N/A";
    previewBusinessName.textContent = businessName.value || "Your Business";
    previewBusinessAddress.textContent = businessAddress.value || "N/A";
    previewClientName.textContent = clientName.value || "N/A";
    previewClientEmail.textContent = clientEmail.value || "N/A";
    previewClientAddress.textContent = clientAddress.value || "N/A";
    previewItems.innerHTML = items
        .map(
        (item) => `<tr class="transition-colors">
    <td class="p-3 text-base">${item.name || "N/A"}</td>
    <td class="p-3 text-base">${item.quantity}</td>
    <td class="p-3 font-mono text-base">${currencySymbols[currency]}${(
            item.price * exchangeRates[currency]
        ).toFixed(2)}</td>
    <td class="p-3 font-mono text-base">${currencySymbols[currency]}${(
            item.quantity *
            item.price *
            exchangeRates[currency]
        ).toFixed(2)}</td>
        </tr>`
        )
        .join("");
    previewSubtotal.textContent = subtotalEl.textContent;
    previewTax.textContent = taxEl.textContent;
    previewDiscount.textContent = discountEl.textContent;
    previewTotal.textContent = totalEl.textContent;
    }

    // Event listeners of the webpage
    addItemBtn.addEventListener("click", () => {
    items.push({ name: "", quantity: 1, price: 0, type: itemMode });
    renderItems();
    updateCalculations();
    saveState();
    });

    invoiceNumberInput.addEventListener("input", (e) => {
    if (validateInput(e.target, "invoiceNumber")) {
        invoiceNumber = e.target.value;
        updatePreview();
        saveState();
    }
    });

    invoiceDate.addEventListener("input", () => {
    updatePreview();
    saveState();
    });

    businessName.addEventListener("input", () => {
    updatePreview();
    saveState();
    });

    businessAddress.addEventListener("input", () => {
    updatePreview();
    saveState();
    });

    clientName.addEventListener("input", () => {
    updatePreview();
    saveState();
    });

    clientEmail.addEventListener("input", (e) => {
    if (validateInput(e.target, "email")) {
        updatePreview();
        saveState();
    }
    });

    clientAddress.addEventListener("input", () => {
    updatePreview();
    saveState();
    });

    taxRateInput.addEventListener("input", (e) => {
    if (validateInput(e.target, "number")) {
        taxRate = parseFloat(e.target.value) || 0;
        updateCalculations();
        saveState();
    }
    });

    discountRateInput.addEventListener("input", (e) => {
    if (validateInput(e.target, "number")) {
        discountRate = parseFloat(e.target.value) || 0;
        updateCalculations();
        saveState();
    }
    });

    currencySelect.addEventListener("change", (e) => {
    currency = e.target.value;
    renderItems();
    updateCalculations();
    saveState();
    });

    productMode.addEventListener("change", () => {
    itemMode = "product";
    items.forEach((item) => (item.type = "product"));
    updateItemLabels();
    renderItems();
    updatePreview();
    saveState();
    });

    serviceMode.addEventListener("change", () => {
    itemMode = "service";
    items.forEach((item) => (item.type = "service"));
    updateItemLabels();
    renderItems();
    updatePreview();
    saveState();
    });

    generateBtn.addEventListener("click", () => {
    if (clientEmail.value && !validateInput(clientEmail, "email")) {
        return;
    }
    if (!validateInput(invoiceNumberInput, "invoiceNumber")) {
        return;
    }
    if (items.length === 0 || items.every((item) => !item.name)) {
        alert("Please add at least one valid item.");
        return;
    }
    updatePreview();
    previewSection.scrollIntoView({ behavior: "smooth" });
    previewSection.classList.add("preview-highlight");
    setTimeout(
        () => previewSection.classList.remove("preview-highlight"),
        1000
    );
    });

    resetBtn.addEventListener("click", () => {
    
    
    // Clear session and local storage
    sessionStorage.removeItem("invoiceSessionActive");
    localStorage.removeItem("invoice");

    // Reset form to initial state
    invoiceNumberInput.value = `${today}-001`;
    invoiceDate.value = "";
    businessName.value = "";
    businessAddress.value = "";
    clientName.value = "";
    clientEmail.value = "";
    clientAddress.value = "";
    taxRateInput.value = "";
    discountRateInput.value = "";
    currencySelect.value = "USD";
    productMode.checked = true;
    itemMode = "product";
    items = [{ name: "", quantity: 1, price: 0, type: "product" }];
    taxRate = 0;
    discountRate = 0;
    currency = "USD";
    invoiceNumber = invoiceNumberInput.value;
    updateItemLabels();
    renderItems();
    updateCalculations();
    });

    previewSaveBtn.addEventListener("click", () => {
    if (clientEmail.value && !validateInput(clientEmail, "email")) {
        return;
    }
    if (!validateInput(invoiceNumberInput, "invoiceNumber")) {
        return;
    }
    if (items.length === 0 || items.every((item) => !item.name)) {
        alert("Please add at least one valid item.");
        return;
    }
    previewSaveSpinner.style.display = "inline-block";
    const invoiceData = {
        invoiceNumber: invoiceNumberInput.value,
        invoiceDate: invoiceDate.value,
        businessName: businessName.value,
        businessAddress: businessAddress.value,
        clientName: clientName.value,
        clientEmail: clientEmail.value,
        clientAddress: clientAddress.value,
        taxRate,
        discountRate,
        currency,
        itemMode,
        items,
        totals: {
        subtotal: subtotalEl.textContent,
        tax: taxEl.textContent,
        discount: discountEl.textContent,
        total: totalEl.textContent,
        },
    };
    saveToFile(invoiceData, `invoice-${invoiceNumberInput.value}.json`);
    const [date, num] = invoiceNumberInput.value.split("-");
    invoiceNumber = `${date}-${(parseInt(num) + 1)
        .toString()
        .padStart(3, "0")}`;
    invoiceNumberInput.value = invoiceNumber;
    // Update the saved state with the new invoice number
    saveState();
    previewSaveSpinner.style.display = "none";
    previewSaveBtn.classList.add("animate__animated", "animate__bounceIn");
    setTimeout(
        () =>
        previewSaveBtn.classList.remove(
            "animate__animated",
            "animate__bounceIn"
        ),
        300
    );
    alert("Invoice saved as JSON!");
    });

    previewPdfBtn.addEventListener("click", () => {
    if (!clientEmail.value || !validateInput(clientEmail, "email")) {
        alert("Please enter a valid client email.");
        return;
    }
    if (items.length === 0 || items.every((item) => !item.name)) {
        alert("Please add at least one valid item.");
        return;
    }
    previewPdfSpinner.style.display = "inline-block";
    const element = document.getElementById("preview-content");
    // Apply PDF rendering class to ensure proper styling
    element.classList.add("pdf-rendering");
    // Force reflow to ensure content is rendered
    element.style.display = "none";
    element.offsetHeight; // Trigger reflow
    element.style.display = "block";
    // Add a slight delay to ensure rendering
    setTimeout(() => {
        html2canvas(element, { scale: 2 })
        .then((canvas) => {
            const imgData = canvas.toDataURL("image/png");
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
            });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgProps = pdf.getImageProperties(imgData);
            const imgWidth = imgProps.width;
            const imgHeight = imgProps.height;
            // Calculate dimensions to fit within A4 with margins
            const margin = 10; // 10mm margin on all sides
            const maxWidth = pdfWidth - 2 * margin;
            const maxHeight = pdfHeight - 2 * margin;
            let width = imgWidth;
            let height = imgHeight;
            // Scale image to fit within max dimensions while maintaining aspect ratio
            const aspectRatio = imgWidth / imgHeight;
            if (width > maxWidth) {
            width = maxWidth;
            height = width / aspectRatio;
            }
            if (height > maxHeight) {
            height = maxHeight;
            width = height * aspectRatio;
            }
            // Center the image on the page
            const x = (pdfWidth - width) / 2;
            const y = (pdfHeight - height) / 2;
            pdf.addImage(imgData, "PNG", x, y, width, height);
            pdf.save(`invoice-${invoiceNumberInput.value}.pdf`);
            // Cleanup
            element.classList.remove("pdf-rendering");
            previewPdfSpinner.style.display = "none";
            previewPdfBtn.classList.add(
            "animate__animated",
            "animate__bounceIn"
            );
            setTimeout(
            () =>
                previewPdfBtn.classList.remove(
                "animate__animated",
                "animate__bounceIn"
                ),
            300
            );
        })
        .catch((err) => {
            console.error("Error generating PDF:", err);
            element.classList.remove("pdf-rendering");
            previewPdfSpinner.style.display = "none";
            alert("Failed to generate PDF. Please try again.");
        });
    }, 500); // 500ms delay to ensure rendering
    });

    previewImageBtn.addEventListener("click", () => {
    if (clientEmail.value && !validateInput(clientEmail, "email")) {
        return;
    }
    if (!validateInput(invoiceNumberInput, "invoiceNumber")) {
        return;
    }
    if (items.length === 0 || items.every((item) => !item.name)) {
        alert("Please add at least one valid item.");
        return;
    }
    previewImageSpinner.style.display = "inline-block";
    const element = document.getElementById("preview-content");
    try {
        html2canvas(element, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = imgData;
        a.download = `invoice-${invoiceNumberInput.value}.png`;
        a.click();
        previewImageSpinner.style.display = "none";
        previewImageBtn.classList.add(
            "animate__animated",
            "animate__bounceIn"
        );
        setTimeout(
            () =>
            previewImageBtn.classList.remove(
                "animate__animated",
                "animate__bounceIn"
            ),
            300
        );
        });
    } catch (err) {
        console.error("Error generating image:", err);
        previewImageSpinner.style.display = "none";
        alert("Failed to generate image. Please try again.");
    }
    });

    themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const icon = themeToggle.querySelector("i");
    const isDark = document.body.classList.contains("dark");
    icon.setAttribute("data-lucide", isDark ? "moon" : "sun");
    lucide.createIcons();
    });

    // Initialize
    loadSavedData();
