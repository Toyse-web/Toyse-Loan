import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";

const dirName = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(dirName, "public")));
app.use(express.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.set("views", path.join(dirName, "views"));
app.use(cookieParser());

// Routes
app.get("/", (req, res) => {
    res.render("index", {
        loanLimit: "₦50,000",
        outstanding: "₦0.00"
    });
});

// Loan-offer route
app.get("/loan-offer", (req, res) => {
    const defaultAmount = 50000;
    const defaultTenure = {days: 60, rate: 20.4}
    // Get stored coupon data
    const selectedCoupon = req.cookies.selectedCoupon ? JSON.parse(req.cookies.selectedCoupon) : null;

    const defaultCalculation = calculateInterest(defaultAmount, defaultTenure.days, defaultTenure.rate, selectedCoupon);
    
    res.render("loan-offer", {
        initialAmount: "₦50,000",
        minAmount: 2000,
        maxAmount: 50000,
        numericAmount: defaultAmount,
        tenures: [
            { days: 91, rate: "Locked", installments: 3 },
            { days: 60, rate: "20.4%", installments: 2, isDefault: true },
            { days: 30, rate: "24%", installments: 1}
        ],
        selectedCoupon,
        defaultCalculation //(defaultAmount, defaultTenure.days, defaultTenure.rate)
    });
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
})

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

// Function for coupon interest
    function calculateInterest(amount, days, rate, coupon = null) {
        const months = days / 30;
        const original = parseFloat(((amount * rate / 100) * months).toFixed(2));

        let discount = 0;

        if (coupon) {
            if (coupon.type === "percent") {
                discount = parseFloat((original * parseFloat(coupon.value / 100)).toFixed(2));
            } else if (coupon.type === "days") {
                const freeDays = 5;
                const interestPerDay = original / days;
                discount = parseFloat((interestPerDay * freeDays).toFixed(2))
            }
        }

        const final = parseFloat((original - discount).toFixed(2));

        return {
            original,
            discount,
            final
        };
    }

// Handle form submission
app.post("apply-loan", (req, res) => {
    const { amount, tenure } = req.body;
    console.log(`Loan applied: ₦${amount} for ${tenure} days`);
    res.redirect("/"); //Redirect after submission
});

app.listen(port, () => {
    console.log(`Server is listening to port ${port}`)
});