import React, { useState } from "react";
import Image from "next/image";
import Payment, { PaymentType } from "./Payment";
import Profile from "./Profile";
import ProfilePlaceholder from "./ProfilePlaceholder";
import { ProfileSearch } from "./ProfileSearch";
import { Button, HStack, Input } from "@chakra-ui/react";
import { FaDollarSign, FaShareAlt } from "react-icons/fa";
import { formatEther, parseEther } from "viem";
import { useAccount, useSendTransaction, useWriteContract } from "wagmi";
import { Toaster, toaster } from "~~/components/ui/toaster";
import { useDeployedContractInfo, useTransactor, useWatchBalance } from "~~/hooks/scaffold-eth";
import { useCryptoPrice } from "~~/hooks/scaffold-eth/useCryptoPrice";

export default function Transfer() {
  const [totalNativeValue, setTotalNativeValue] = useState("");
  const [totalDollarValue, setTotalDollarValue] = useState("");
  const [isDollar, setIsDollar] = useState(false); // Toggle USD/LYX
  const [isSending, setIsSending] = useState(false);

  const [payments, setPayments] = useState<PaymentType[]>([]);

  const account = useAccount();
  const { data: balance } = useWatchBalance({ address: account.address });
  const {
    price: nativeCurrencyPrice,
    loading: isFetchingNativeCurrency,
    fetchPrice: fetchNativeCurrency,
  } = useCryptoPrice();

  const formattedBalance = balance ? Number(formatEther(balance.value)) : 0;

  const errorStyle = { color: "red" };

  const switchCurrency = () => {
    if (!nativeCurrencyPrice) {
      toaster.create({
        title: "Loading exchange rate",
        type: "warning",
      });

      if (!isFetchingNativeCurrency) {
        fetchNativeCurrency();
      }

      return;
    }

    setIsDollar(prev => !prev);
  };

  // Handle input conversion & enforce numeric values
  const handleInput = (input: string) => {
    if (input.trim() === "") {
      setTotalNativeValue("");
      setTotalDollarValue("");
      return;
    }

    // Ensure only valid floating numbers are parsed
    const numericValue = input.replace(/[^0-9.]/g, ""); // Remove non-numeric characters except `.`
    if (!/^\d*\.?\d*$/.test(numericValue) || numericValue == "") return; // Ensure valid decimal format

    if (!nativeCurrencyPrice) {
      setTotalNativeValue(numericValue);
      return;
    }

    if (isDollar) {
      setTotalDollarValue(numericValue);
      setTotalNativeValue((parseFloat(numericValue) / nativeCurrencyPrice).toString());
    } else {
      setTotalNativeValue(numericValue);
      setTotalDollarValue((parseFloat(numericValue) * nativeCurrencyPrice).toFixed(2));
    }
  };

  const displayTotalValue = isDollar ? totalDollarValue : totalNativeValue;
  const displayConversion = isDollar ? totalNativeValue : totalDollarValue;
  const isBalanceInsufficient = Number(totalNativeValue) > formattedBalance;

  const handleRecipientSelection = (recipient: `0x${string}`): boolean => {
    // Check if the recipient is already in the list
    if (payments.some(payment => payment.recipient.toLowerCase() === recipient.toLowerCase())) {
      toaster.create({
        title: "Recipient already added",
        type: "error",
      });
      return false;
    }

    // Add recipient with an initial amount of 0
    // @ts-ignore
    setPayments(prevPayments => [...prevPayments, { recipient, amount: "" }]);

    return true;
  };

  const removePayment = (recipient: `0x${string}`) => {
    setPayments(prevPayments =>
      prevPayments.filter(payment => payment.recipient.toLowerCase() !== recipient.toLowerCase()),
    );
  };

  const addRecipientAmount = (recipient: `0x${string}`, amount: string) => {
    const payment = payments.find(payment => payment.recipient.toLowerCase() === recipient.toLowerCase());

    if (!payment) return;
    // add the difference between the old and new amount
    const newTotal = (parseEther(totalNativeValue) || 0n) + parseEther(amount) - parseEther(payment.amount);

    setTotalNativeValue(formatEther(newTotal));
    if (nativeCurrencyPrice) {
      setTotalDollarValue((parseFloat(formatEther(newTotal)) * nativeCurrencyPrice).toFixed(2));
    }
    // update amount
    setPayments(prevPayments =>
      prevPayments.map(payment =>
        payment.recipient.toLowerCase() === recipient.toLowerCase() ? { ...payment, amount } : payment,
      ),
    );
  };

  const sumPayments = (): bigint => payments.reduce((sum, p) => sum + (parseEther(p.amount) || -1n), 0n);

  const isSharedEqually = (): boolean =>
    totalNativeValue === "" || payments.length === 0 || parseEther(totalNativeValue) === sumPayments();

  const shareEqually = () => {
    if (payments.length === 0 || Number(totalNativeValue) === 0 || isSharedEqually()) return;

    const total = parseEther(totalNativeValue);
    const share = total / BigInt(payments.length);

    setPayments(prevPayments =>
      prevPayments.map(payment => ({
        ...payment,
        amount: formatEther(share),
      })),
    );

    const newTotal = share * BigInt(payments.length);

    setTotalNativeValue(formatEther(newTotal));

    if (nativeCurrencyPrice) {
      setTotalDollarValue((Number(formatEther(newTotal)) * nativeCurrencyPrice).toFixed(2));
    }

    if (total !== newTotal) {
      toaster.create({
        title: "Total amount has been adjusted for precision",
        type: "warning",
      });
    }
  };

  const { data: dispas } = useDeployedContractInfo("Dispas");
  const { writeContractAsync } = useWriteContract();
  const { sendTransactionAsync } = useSendTransaction();
  const writeTx = useTransactor();

  const send = async () => {
    if (totalNativeValue === "" || Number(totalNativeValue) === 0) {
      toaster.create({
        title: "Please input a valid total amount!",
        type: "error",
      });
      return;
    }

    // Ensure all payments have valid amounts
    const hasInvalidPayment = payments.some(payment => !payment.amount || Number(payment.amount) <= 0);
    if (hasInvalidPayment) {
      toaster.create({
        title: "All recipients must have a valid amount greater than zero!",
        type: "error",
      });
      return;
    }

    // Ensure total of payments matches the inputted amount
    if (!isSharedEqually()) {
      toaster.create({
        title: "Total amount does not match sum of payments!",
        type: "error",
      });
      return;
    }

    try {
      setIsSending(true);

      const _payments = payments.map(payment => ({ ...payment, amount: parseEther(payment.amount) }));

      let tx;
      if (_payments.length === 1) {
        tx = () =>
          sendTransactionAsync({
            to: _payments[0].recipient,
            value: _payments[0].amount,
          });
      } else {
        if (!dispas) {
          toaster.create({
            title: "Loading resources...",
            type: "error",
          });
          return;
        }
        tx = () =>
          writeContractAsync({
            abi: dispas.abi,
            address: dispas.address,
            functionName: "distributeFunds",
            args: [_payments],
            value: sumPayments(),
          });
      }

      const txHash = await writeTx(tx);

      console.log("Transaction Hash: ", txHash);

      toaster.create({
        title: "Transfer successful! 🚀",
        type: "success",
      });

      setTotalNativeValue("");
      setTotalDollarValue("");
      setPayments([]);
    } catch (error) {
      console.error("Failed to send: ", error);
      toaster.create({
        title: "Transfer failed. Check logs to see more details!",
        type: "error",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="shadow-[0_3px_10px_rgb(0,0,0,0.2)] w-full max-w-[450px] mx-4 rounded-3xl flex flex-col">
      <div className="flex flex-1 flex-col justify-center items-center border-b rounded-t-3xl py-4">
        {account.isConnected && account.address ? (
          <Profile address={account.address as `0x${string}`} />
        ) : (
          <ProfilePlaceholder />
        )}

        <div className="flex justify-center items-center text-3xl w-full max-w-[90%] overflow-hidden text-ellipsis text-black whitespace-nowrap">
          {isDollar && totalNativeValue && <span className="text-2xl mr-[-5px]">$</span>}
          <Input
            placeholder="0"
            className="h-16 text-center outline-none"
            value={displayTotalValue}
            onChange={e => handleInput(e.target.value)}
            required
            width={`${Math.max(displayTotalValue.length, 1)}ch`}
          />
          {!isDollar && totalNativeValue && <span className="text-2xl">LYX</span>}
        </div>

        <strong
          className="text-md font-semibold italic text-gray-500 mt-[-10px]"
          style={
            isBalanceInsufficient
              ? errorStyle
              : {
                  opacity: totalNativeValue && totalDollarValue ? 1 : 0,
                }
          }
        >
          ~{!isDollar && "$"}
          {displayConversion} {isDollar && "LYX"}
        </strong>

        <HStack className="mt-4">
          <Button
            onClick={switchCurrency}
            className="border border-gray-300 w-10 aspect-square flex justify-center items-center rounded-full p-2 transition-transform duration-200 ease-in-out group hover:scale-110"
          >
            {isDollar ? (
              <FaDollarSign className="text-green-400 group-hover:scale-110 transition-transform duration-200 ease-in-out" />
            ) : (
              <div className="relative w-6 aspect-square group-hover:scale-110 transition-transform duration-200 ease-in-out">
                <Image src="/images/lukso_logo.png" alt="LYX" fill className="rounded-full" />
              </div>
            )}
          </Button>

          <Button
            onClick={shareEqually}
            className="cursor-pointer bg-gray-500 text-white hover:bg-white hover:text-gray-500 border hover:border-gray-500 w-10 aspect-square flex justify-center items-center rounded-full p-2 duration-200"
            disabled={isSharedEqually()}
          >
            <FaShareAlt />
          </Button>
        </HStack>
      </div>

      <div className="flex-1 flex flex-col items-center py-4 bg-gray-100 shadow-inner rounded-b-3xl">
        <div
          id="payments"
          className="flex flex-1 max-w-full items-center overflow-x-auto space-x-2 py-4 px-2 no-scrollbar"
        >
          {payments.length === 0 ? (
            <ProfilePlaceholder />
          ) : (
            payments.map(payment => (
              <Payment
                key={payment.recipient}
                payment={payment}
                nativeCurrencyPrice={nativeCurrencyPrice}
                isFetchingNativeCurrency={isFetchingNativeCurrency}
                onClose={removePayment}
                onChange={addRecipientAmount}
                fetchNativeCurrency={fetchNativeCurrency}
              />
            ))
          )}
        </div>

        <ProfileSearch onSelectAddress={handleRecipientSelection} />

        <button
          onClick={send}
          className="bg-gray-500 text-white hover:bg-white px-8 py-2 hover:text-gray-500 border hover:border-gray-500 rounded-xl font-light duration-200 mt-4 text-sm h-12 w-[85%] flex justify-center items-center"
          disabled={isSending}
        >
          {isSending ? (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin"></div>
          ) : (
            <span className="font-extrabold">{payments.length > 1 ? "Distribute" : "Send"}</span>
          )}
        </button>
      </div>

      <Toaster />
    </div>
  );
}
