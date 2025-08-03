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
    const rate = parseFloat(currentTenure.dataset.rate);
    const days = parseInt(currentTenure.dataset.days);
    const months = days / 30;
    const installments = currentTenure.dataset.installments;

    let interest = (currentAmount * (rate / 100) * months).toFixed(2);
    let discount = 0;

    const couponApplied = document.querySelector(".applied-coupon");
    const couponType = document.getElementById("coupon-type")?.value;
    const couponValue = parseFloat(document.getElementById("coupon-value")?.value);

    // Calculate discount if coupon is applied
    if (couponApplied && couponType && !isNaN(couponValue)) {
        if (couponType === "percent") {
            discount = (interest * (couponValue / 100)).toFixed(2);
        } else if (couponType === "days") {
            const interestPerDay = interest / days;
            discount = (interestPerDay * couponValue).toFixed(2); //Assuming couponValue is number of free days
        }
        interest = (interest - discount).toFixed(2);
    }

    const totalRepayment = Number(currentAmount) + Number(interest);

    // Update the interest UI
    if (couponApplied && discount > 0) {
        const originalInterest = Number(interest) + Number(discount);
        interestDisplay.innerHTML = `<span style="text-decoration: line-through;">
                ₦${Number(originalInterest).toLocaleString()}
            </span>
            <span style="margin-left: 10px">
                ₦${Number(interest).toLocaleString()}
            </span>`;
    } else {
        interestDisplay.innerHTML = `<span>₦${Number(interest).toLocaleString()}</span>`;
    }

    // Update other displays
    loanAmount.textContent = `₦${currentAmount.toLocaleString()}`;
    document.getElementById("received-amount").textContent = `₦${currentAmount.toLocaleString()}`;
    document.querySelector(".amountDue").textContent = `₦${totalRepayment.toLocaleString()}`;
    document.getElementById("total-amount").textContent = `₦${totalRepayment.toLocaleString()}`;
    amountDisplay.textContent = `₦${currentAmount.toLocaleString()}`;
    installmentInfo.textContent = `${installments} installment(s) for ${days} days`;

    const modalTotal = document.getElementById("modal-total-amount");
    const modalInstallment = document.getElementById("modal-installment");

    // To reflect the calculated value inside the repayment modal
    if (modalTotal) {
        modalTotal.textContent = `₦${parseFloat(totalRepayment).toLocaleString()}`;
    }

    // Update the modal installment
    if (modalInstallment) {
        modalInstallment.textContent = `${installments}`;
    }

    const scheduleList = document.getElementById("schedule-list");
    if (!currentTenure || !scheduleList) return;

    const amountPerInstallments = (totalRepayment / installments).toFixed(2);
    const baseDate = new Date(); //today as starting point

    scheduleList.innerHTML = ""; //Clear any one

    for (let i = 0; i < installments; i++) {
        const date = new Date(baseDate);
        date.setMonth(date.getMonth() + i);

        const scheduleItem = document.createElement("div");
        scheduleItem.className = "schedule-item";
        scheduleItem.innerHTML = `
            <div class="circle-line">
                <span class="circle filled">
                </span> <span class="line"></span>
            </div>
            <div class="details">
                <p class="date">${dateFormat(date)}</p>
                <p class="amount">₦${parseFloat(amountPerInstallments).toLocaleString()}</p>
                <p class="label">${i + 1}${getOrdinal(i + 1)} installment</p>
                <p class="label">Repay Amount</p>
            </div>`;
            scheduleList.appendChild(scheduleItem);
    }
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

    // The modal function
    const modal = document.getElementById("repayment-modal");
    const takeLoanBtn = document.getElementById("take-loan-btn");
    const overlay = document.getElementById("modal-overlay");

    takeLoanBtn?.addEventListener("click", () => {
        // Show modal
        modal.classList.add("show");
        overlay.classList.add("show");
        document.body.classList.add("modal-open");

        // Recalculate before showing modal
        updateDisplays();
    }); 

    window.closeModal = function () {
        modal.classList.remove("show");
        overlay.classList.remove("show");
        document.body.classList.remove("modal-open");
    };

    // Clicking outside modal closses the modal
    overlay.addEventListener("click", closeModal);

    function dateFormat(date) {
        const options = { day: "numeric", month: "short", year: "numeric" };
        return new Date(date).toLocaleDateString("en-GB", options).replace(/ /g, " ");
    }

    function getOrdinal(n) {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return s[(v - 20) % 10] || s[v] || s[0];
    }

});