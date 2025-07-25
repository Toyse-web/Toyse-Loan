const loanAmount = document.getElementById("loanAmount");
const randomAmount = document.querySelectorAll("#randomAmount");


document.addEventListener("DOMContentLoaded", () => {
    // Get elements
    const amountDisplay = document.querySelector("#received-amount");
    const interestDisplay = document.querySelector("#interest-display");
    const numericAmount = document.querySelector("#numeric-amount");
    const installmentInfo = document.querySelector("#installment-info");
    const totalAmount = document.querySelector("#total-amount");
    const couponType = document.getElementById("coupon-type")?.value;
    const couponValue = parseFloat(document.getElementById("coupon-value")?.value);

    // Initialize state
    let currentAmount = parseInt(document.getElementById("numeric-amount").value);
    let currentTenure = document.querySelector(".tenure.active");

    // Function to update all displays
    const updateDisplays = () => {
        // if (!currentTenure || currentTenure.dataset.rate === "Locked") return;

        const rate = parseFloat(currentTenure.dataset.rate);
        const days = parseInt(currentTenure.dataset.days);
        const months = days / 30;
        const installments = currentTenure.dataset.installments;
        const interest = (currentAmount * (rate / 100) * months).toFixed(2);
        const totalRepayment = Number(currentAmount) + Number(interest);

        // For amount due date
        document.querySelector(".amountDue").textContent = "₦" + (Number(currentAmount) + Number(interest));

        const couponApplied = document.querySelector(".applied-coupon");
        if (couponApplied) {
            const discountRate = 0.20;
            const dicountAmount = (interest * discountRate).toFixed(2);
            const finalInterest = (interest - dicountAmount).toFixed(2);

            interestDisplay.innerHTML = `<span style="text-decoration: line-through;">
                    ₦${Number(interest).toLocaleString()}
                </span>
                <span style="margin-left: 10px">
                    ₦${Number(finalInterest).toLocaleString()}
                </span>`;
        } else {
            interestDisplay.innerHTML = `<span> ₦${Number(interest).toLocaleString()}</span>`;
        }

        // Update all displays
        document.getElementById("loanAmount").textContent = `₦${currentAmount.toLocaleString()}`;
        document.getElementById("received-amount").textContent = `₦${currentAmount.toLocaleString()}`;
        // document.getElementById("interest-display").textContent = `₦${Number(interest).toLocaleString()}`;
        document.getElementById("total-amount").textContent = `₦${Number(totalAmount).toLocaleString()}`;

        // Update display amount
        amountDisplay.textContent = `₦${currentAmount.toLocaleString()}`;
        installmentInfo.textContent = `${installments} installment(s) for ${days} days`;
        // interestDisplay.textContent = `₦${Number(interest).toLocaleString()}`;
        totalAmount.textContent = "₦" + totalRepayment.toLocaleString();
    };

    
// Tricks that handles the buttons to add and subtract loan amounts
const subtract = document.getElementById("subtract");
const add = document.getElementById("add");
    // Subtract / add functions:
    subtract.addEventListener("click", () => {
        currentAmount = Math.max(2000, currentAmount - 2000);
        document.getElementById("numeric-amount").value = currentAmount;

        updateDisplays();
    });

    add.addEventListener("click", () => {
        // Calculate potential new amount
        const newAmount = currentAmount + 2000;

        // Update only if it won't exceed 50,000
        if (newAmount <= 50000) {
            currentAmount = newAmount;
            document.getElementById("numeric-amount").value = currentAmount;
            updateDisplays();
        } else {
            alert("Maximum loan amount exceeded");
        }
        
    });

    // For random amount buttons:
    document.querySelectorAll(".randomAmount").forEach(button => {
        button.addEventListener("click", () => {
            currentAmount = parseInt(button.dataset.amount);
            document.getElementById("numeric-amount").value = currentAmount;

            updateDisplays();
        });
    });

    // Initialize with default values
    updateDisplays();

    // Function to calculate and format due date
    function calculateDueDate(days) {
        const today = new Date();
        const dueDate = new Date(today);
        dueDate.setDate(dueDate.getDate() + days);

        return dueDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    }

    // Initialize wit default tenure's due date onpage load
    const defaultTenure = document.querySelector(".tenure.active");
    if (defaultTenure) {
        const days = parseInt(defaultTenure.dataset.days);
        const dueDate = calculateDueDate(days);
        document.querySelector(".dueDate").textContent = dueDate;
    }

    // Handle the amount buttons
    document.querySelectorAll(".randomAmount").forEach(button => {
        button.addEventListener("click", () => {
            currentAmount = parseInt(button.dataset.amount);
            numericAmount.value = currentAmount;
            updateDisplays();
        });
    });

    // Handle tenure buttons
    document.querySelectorAll(".tenure").forEach(tenure => {
        tenure.addEventListener("click", () => {
            if (tenure.dataset.rate === "Locked") return;

            const days = parseInt(tenure.dataset.days);
            const dueDate = calculateDueDate(days);

            // Due date display update
            document.querySelector(".dueDate").textContent = dueDate;

            // Update active tenure
            document.querySelectorAll(".tenure").forEach(t => t.classList.remove("active"));
            tenure.classList.add("active");
            currentTenure = tenure;

            updateDisplays();
        });
    });

});