import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";

import fs from "fs";
import bodyParser from "body-parser";

const dirName = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(dirName, "public")));
app.use(express.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.set("views", path.join(dirName, "views"));
app.use(cookieParser());
app.use(bodyParser.json());

// Path to loans storage file
const loansFilePath = path.join(dirName, "data", "loans.json");

// Helper functions
function loadLoans() {
    if (!fs.existsSync(loansFilePath)) return [];
    return JSON.parse(fs.readFileSync(loansFilePath)); 
}

function saveLoans(loans) {
    fs.writeFileSync(loansFilePath, JSON.stringify(loans, null, 2));
}

// Routes
app.get("/", (req, res) => {
    res.render("index", {
        loanLimit: "₦50,000",
        outstanding: "₦0"
    });
});

// Loan-offer route
app.get("/loan-offer", (req, res) => {
    const defaultAmount = 50000;
    const tenures = [
        {days: 91, rate: "Locked", installments: 3},
        {days: 60, rate: "20.4%", installments: 2, isDefault: true},
        {days: 30, rate: "24%", installments: 1}
    ];

    const defaultTenure = tenures.find(t => t.isDefault);
    // Get stored coupon data
    const selectedCoupon = req.cookies.selectedCoupon ? JSON.parse(req.cookies.selectedCoupon) : null;

    const defaultCalculation = calculateInterest(
        defaultAmount, 
        defaultTenure.days, 
        defaultTenure.rate, 
        selectedCoupon
    );
    
    res.render("loan-offer", {
        initialAmount: "₦50,000",
        minAmount: 2000,
        maxAmount: 50000,
        numericAmount: defaultAmount,
        tenures,
        defaultTenure,
        selectedCoupon,
        defaultCalculation
    });
});

// Get account page
app.get("/account", (req, res) => {
    res.render("account");
});

// Get the coupon page
app.get("/coupon", (req, res) => {
    const selectedCoupon = req.cookies.selectedCoupon ? JSON.parse(req.cookies.selectedCoupon) : null;

    // List of coupons
    const coupons = [
        {name: "5 Days Free", code: "FREEDAYS", type: "days", value: "5"},
        {name: "20% off", code: "FREE20%", type: "percent", value: "20"}
    ];

    res.render("coupon", {coupons, selectedCoupon});
});

app.get("/selecte-coupon/:code", (req, res) => {
    const code = req.params.code;
    const selectedCoupon = req.cookies.selectedCoupon ? JSON.parse(req.cookies.selectedCoupon) : null;

    // To check if user is clicking the same coupon
    if (selectedCoupon && selectedCoupon.code === code) {
        res.clearCookie("selectedCoupon");
        return res.redirect("/loan-offer");
    }

    const coupons = [
        {name: "5 Days Free", code: "FREEDAYS", type: "days", value: "5"},
        {name: "20% off", code: "FREE20%", type: "percent", value: "20"}
    ];

    const coupon = coupons.find(coup => coup.code === code);
    if (!coupon) return res.redirect("/coupon");

    res.cookie("selectedCoupon", JSON.stringify(coupon));
    res.redirect("/loan-offer");
});

// Apply coupon
app.post("/apply-coupon", (req, res) => {
    const { coupon } = req.body;
    res.cookie("selectedCoupon", JSON.stringify(coupon), { httpOnly: true });
    res.redirect("/loan-offer");
});

// Remove coupon route
app.get("/remove-coupon", (req, res) => {
    res.clearCookie("selectedCoupon");
    res.redirect("/loan-offer");
});

// Save loan record
app.post("/agree-loan", (req, res) => {
    const { amount, tenure, coupon, totalAmount, dueDates } = req.body;

    // Build loan record
    const loanRecord = {
        amount: Number(amount),
        tenure: Number(tenure),
        coupon: coupon || null,
        totalAmount: Number(totalAmount),
        dueDates: Array.isArray(dueDates) ? dueDates : [],
        status: "Pending"
    };

    // Save to file
    const loans = loadLoans();
    loans.push(loanRecord);
    saveLoans(loans);

    console.log("New loan Approved:", loanRecord);
    res.redirect("/success");

});

// Get repayment record
app.get("/repayment-record", (req, res) => {
    const loans = loadLoans();
    res.render("repayment-record", { loans });
});

// Function for coupon interest
    function calculateInterest(amount, days, rate, coupon = null) {
        const months = days / 30;
        const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
        const numericRate = typeof rate === "string" ? parseFloat(rate) : rate;

        // const original = parseFloat(((amount * rate / 100) * months).toFixed(2));

        let originalInterest = (numericAmount * numericRate * months) / 100;
        let discount = 0;

        if (coupon) {
            const { type, value } = coupon;
            if (type === "percent") {
                discount = (originalInterest * value / 100);
            } else if (type === "days") {
                const dailyInterest = originalInterest / days;
                // const freeDays = 5;
                // const interestPerDay = original / days;
                discount = dailyInterest * value;
            }
        }

        const finalInterest = originalInterest - discount;

        return {
            original: originalInterest.toFixed(2),
            discount: discount.toFixed(2),
            final: finalInterest.toFixed(2),
            numeric: finalInterest.toFixed(2)
        };
    }

// Handle form submission
app.post("apply-loan", (req, res) => {
    const { amount, tenure } = req.body;
    console.log(`Loan applied: ₦${amount} for ${tenure} days`);
    res.redirect("/"); //Redirect after submission
});

// get the loan success page
app.get("/loan-success", (req, res) => {
    res.render("partials/success");
});

app.listen(port, () => {
    console.log(`Server is listening to port ${port}`)
});