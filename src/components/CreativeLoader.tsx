"use client";
import React, { useEffect, useState } from "react";

const CreativeLoader = () => {
    const loadingMessages = [
        "Counting your coins... 🪙",
        "Asking friends for money... 💸",
        "Calculating who owes you a treat... 🍔",
        "Looking for lost receipts... 🧾",
        "Summoning the expense spirits... 👻",
        "Digging through the sofa for change... 🛋️",
        "Math is hard, give us a sec... 🧮",
        "Checking if money grows on trees... 🌳",
    ];
    const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);

    useEffect(() => {
        const interval = setInterval(() => {
            setLoadingMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col justify-center items-center py-20 gap-4">
            <span className="loading loading-bars loading-lg text-primary"></span>
            <p className="text-lg font-medium animate-pulse text-base-content/70">{loadingMessage}</p>
        </div>
    );
};

export default CreativeLoader;
