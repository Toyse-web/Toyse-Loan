import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const dirName = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;

// Middleware
app.use(express.static(path.join(dirName, "public")));
app.use(express.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.set("views", path.join(dirName, "views"));

// Routes
app.get("/", (req, res) => {
    res.render("index", {
        loanLimit: "₦50,000",
        outstanding: "₦0.00"
    });
});

app.get("/loan-offer", (req, res) => {
    const defaultAmount = 50000;
    const defaultTenure = {days: 60, rate: 20.4}
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
        defaultCalculation: calculateInterest(defaultAmount, defaultTenure.days, defaultTenure.rate)
    });
});

function calculateInterest(amount, days, rate) {
    const months = days / 30; //Convert days to months
    const interest = (amount * rate / 100).toFixed(2);
    return {
        formatted: `₦${Number(interest).toLocaleString()}`,
        numeric: interest,
        months: months
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