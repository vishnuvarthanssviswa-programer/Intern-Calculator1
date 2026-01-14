import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Delete } from "lucide-react";

type Operation = "+" | "-" | "×" | "÷" | null;

const Calculator = () => {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<Operation>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputDigit = useCallback((digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === "0" ? digit : display + digit);
    }
  }, [display, waitingForOperand]);

  const inputDecimal = useCallback(() => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  }, [display, waitingForOperand]);

  const clear = useCallback(() => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  }, []);

  const backspace = useCallback(() => {
    if (waitingForOperand) return;
    setDisplay(display.length === 1 ? "0" : display.slice(0, -1));
  }, [display, waitingForOperand]);

  const toggleSign = useCallback(() => {
    const value = parseFloat(display);
    setDisplay(String(value * -1));
  }, [display]);

  const inputPercent = useCallback(() => {
    const value = parseFloat(display);
    setDisplay(String(value / 100));
  }, [display]);

  const performOperation = useCallback((nextOperation: Operation) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue;
      let result = currentValue;

      switch (operation) {
        case "+":
          result = currentValue + inputValue;
          break;
        case "-":
          result = currentValue - inputValue;
          break;
        case "×":
          result = currentValue * inputValue;
          break;
        case "÷":
          result = inputValue !== 0 ? currentValue / inputValue : 0;
          break;
      }

      setDisplay(String(result));
      setPreviousValue(result);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  }, [display, previousValue, operation]);

  const calculate = useCallback(() => {
    if (operation === null || previousValue === null) return;

    const inputValue = parseFloat(display);
    let result = previousValue;

    switch (operation) {
      case "+":
        result = previousValue + inputValue;
        break;
      case "-":
        result = previousValue - inputValue;
        break;
      case "×":
        result = previousValue * inputValue;
        break;
      case "÷":
        result = inputValue !== 0 ? previousValue / inputValue : 0;
        break;
    }

    setDisplay(String(result));
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(true);
  }, [display, previousValue, operation]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        inputDigit(e.key);
      } else if (e.key === ".") {
        inputDecimal();
      } else if (e.key === "+" || e.key === "-") {
        performOperation(e.key as Operation);
      } else if (e.key === "*") {
        performOperation("×");
      } else if (e.key === "/") {
        e.preventDefault();
        performOperation("÷");
      } else if (e.key === "Enter" || e.key === "=") {
        calculate();
      } else if (e.key === "Escape") {
        clear();
      } else if (e.key === "Backspace") {
        backspace();
      } else if (e.key === "%") {
        inputPercent();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inputDigit, inputDecimal, performOperation, calculate, clear, backspace, inputPercent]);

  const formatDisplay = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    if (value.endsWith(".")) return value;
    if (value.includes(".") && value.endsWith("0")) return value;
    
    const formatted = num.toLocaleString("en-US", {
      maximumFractionDigits: 10,
    });
    return formatted;
  };

  return (
    <div className="min-h-screen bg-calculator-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-sm bg-calculator-surface rounded-3xl p-6 shadow-calculator"
      >
        {/* Display */}
        <div className="bg-calculator-display rounded-2xl p-4 mb-4 min-h-[100px] flex flex-col justify-end items-end overflow-hidden">
          {operation && previousValue !== null && (
            <span className="text-calculator-muted text-sm mb-1">
              {previousValue} {operation}
            </span>
          )}
          <span className="text-calculator-text font-display text-4xl sm:text-5xl font-light tracking-tight break-all">
            {formatDisplay(display)}
          </span>
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-4 gap-3">
          {/* Row 1 */}
          <CalcButton variant="function" onClick={clear}>AC</CalcButton>
          <CalcButton variant="function" onClick={toggleSign}>±</CalcButton>
          <CalcButton variant="function" onClick={inputPercent}>%</CalcButton>
          <CalcButton variant="operator" onClick={() => performOperation("÷")} active={operation === "÷"}>÷</CalcButton>

          {/* Row 2 */}
          <CalcButton onClick={() => inputDigit("7")}>7</CalcButton>
          <CalcButton onClick={() => inputDigit("8")}>8</CalcButton>
          <CalcButton onClick={() => inputDigit("9")}>9</CalcButton>
          <CalcButton variant="operator" onClick={() => performOperation("×")} active={operation === "×"}>×</CalcButton>

          {/* Row 3 */}
          <CalcButton onClick={() => inputDigit("4")}>4</CalcButton>
          <CalcButton onClick={() => inputDigit("5")}>5</CalcButton>
          <CalcButton onClick={() => inputDigit("6")}>6</CalcButton>
          <CalcButton variant="operator" onClick={() => performOperation("-")} active={operation === "-"}>−</CalcButton>

          {/* Row 4 */}
          <CalcButton onClick={() => inputDigit("1")}>1</CalcButton>
          <CalcButton onClick={() => inputDigit("2")}>2</CalcButton>
          <CalcButton onClick={() => inputDigit("3")}>3</CalcButton>
          <CalcButton variant="operator" onClick={() => performOperation("+")} active={operation === "+"}>+</CalcButton>

          {/* Row 5 */}
          <CalcButton onClick={() => inputDigit("0")} className="col-span-1">0</CalcButton>
          <CalcButton onClick={backspace}>
            <Delete className="w-5 h-5" />
          </CalcButton>
          <CalcButton onClick={inputDecimal}>.</CalcButton>
          <CalcButton variant="equals" onClick={calculate}>=</CalcButton>
        </div>

        {/* Keyboard hint */}
        <p className="text-calculator-muted text-xs text-center mt-4">
          Keyboard supported
        </p>
      </motion.div>
    </div>
  );
};

interface CalcButtonProps {
  children: React.ReactNode;
  variant?: "number" | "operator" | "function" | "equals";
  onClick: () => void;
  className?: string;
  active?: boolean;
}

const CalcButton = ({ 
  children, 
  variant = "number", 
  onClick, 
  className = "",
  active = false 
}: CalcButtonProps) => {
  const baseStyles = "h-16 rounded-2xl font-medium text-xl flex items-center justify-center transition-all duration-150 select-none";
  
  const variants = {
    number: "bg-calculator-button text-calculator-text hover:bg-calculator-button-hover active:scale-95",
    operator: `${active ? "bg-calculator-accent-active text-calculator-bg" : "bg-calculator-accent text-white"} hover:brightness-110 active:scale-95`,
    function: "bg-calculator-function text-calculator-bg hover:bg-calculator-function-hover active:scale-95",
    equals: "bg-calculator-accent text-white hover:brightness-110 active:scale-95",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
};

export default Calculator;
