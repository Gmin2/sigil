/* Skiper22 (web3 swap input) — vendored from Skiper UI, restyled light + Sigil
 * tokens (sBTC -> USDA). Original concept: family app / jakub.kr; rebuilt by
 * Skiper UI (@gurvinder-singh02). Animations kept: digit roll, USD per-char
 * layoutId morph, Use/Using-Max width morph, NumberFlow, insufficient shake. */
import NumberFlow from "@number-flow/react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import useMeasure from "react-use-measure";
import { Equal, ArrowDownUp, ChevronDown } from "../icons";
import { findToken, type Token } from "../tokens";
import TokenSelect from "./TokenSelect";

const MAX = 100000;

export default function SwapCard({ onAmount }: { onAmount?: (amountIn: number, amountOut: number) => void }) {
  const [value, setValue] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const [fromTok, setFromTok] = useState<Token>(() => findToken("sBTC"));
  const [toTok, setToTok] = useState<Token>(() => findToken("USDA"));

  const usdValue = value * fromTok.price;
  const receive = usdValue / toTok.price;
  const isInsufficient = value > fromTok.balance;
  const nearMax = value > fromTok.balance - 1e-9;

  useEffect(() => {
    onAmount?.(value, receive);
  }, [value, receive, onAmount]);

  const [ref, bounds] = useMeasure();
  const [ref2, bounds2] = useMeasure();

  const pickFrom = (t: Token) => {
    if (t.symbol === toTok.symbol) setToTok(fromTok);
    setFromTok(t);
    setValue(0);
    setInputValue("");
  };
  const pickTo = (t: Token) => {
    if (t.symbol === fromTok.symbol) setFromTok(toTok);
    setToTok(t);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (!/^[0-9]*\.?[0-9]*$/.test(v) && v !== "") return;
    if (v === "" || v === "." || v.startsWith(".")) {
      setValue(0);
      setInputValue(v);
      return;
    }
    const n = parseFloat(v) || 0;
    if (n > MAX) {
      setValue(MAX);
      setInputValue(MAX.toString());
    } else {
      setValue(n);
      setInputValue(v);
    }
  };

  const handleUseMax = () => {
    setValue(fromTok.balance);
    setInputValue(String(fromTok.balance));
  };

  const handleClear = () => {
    setValue(0);
    setInputValue("");
  };

  const digits = (inputValue || "0").split("");

  return (
    <MotionConfig transition={{ type: "spring", stiffness: 400, damping: 35 }}>
      <div className="flex w-full flex-col items-center gap-3 font-sans">
        {/* from card */}
        <div className="relative flex w-full flex-col items-center justify-center gap-5 rounded-3xl border border-[#e7e4f6] bg-[#f4f2fb] px-4 py-4">
          <div className="flex w-full items-start justify-between">
            <div className="flex flex-col">
              <TokenSelect token={fromTok} exclude={toTok.symbol} onSelect={pickFrom} />
              <p className="mt-0.5 pl-1 text-[13px] text-muted">
                {fmtBal(fromTok.balance)} {fromTok.symbol}
              </p>
            </div>
            <button
              onClick={handleUseMax}
              className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[14px] font-semibold text-ink transition-colors hover:bg-surface-100"
            >
              <motion.span animate={{ width: bounds.width > 0 ? bounds.width : "auto" }}>
                <span ref={ref} className="inline-flex overflow-hidden">
                  <AnimatePresence mode="popLayout">
                    {nearMax ? (
                      <motion.span key="using" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        Using{" "}
                      </motion.span>
                    ) : (
                      <motion.span key="use" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        Use{" "}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
              </motion.span>
              Max
            </button>
          </div>

          <div className="w-full border-t border-[#e7e4f6]" />

          <div className="mb-6 flex w-full flex-col items-center justify-center gap-4">
            <div className="relative w-full overflow-hidden text-center">
              <input
                ref={inputRef}
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={inputValue}
                onChange={handleInputChange}
                className={`inset-0 w-full cursor-pointer text-center text-[45px] font-semibold tracking-tight text-transparent caret-accent outline-none ${
                  inputValue === "" ? "caret-transparent" : ""
                }`}
              />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <AnimatePresence initial={false} mode="popLayout">
                  {digits.map((digit, index) => (
                    <motion.span
                      key={`${digit}-${index}`}
                      className="text-[45px] font-semibold tracking-tight text-ink"
                      initial={{ y: "100%", opacity: 0 }}
                      animate={{ y: "0%", opacity: 1 }}
                      exit={{ y: "100%", opacity: 0 }}
                    >
                      {digit}
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex w-full items-center justify-center gap-2">
              <AnimatePresence initial={false} mode="popLayout">
                {!isInsufficient ? (
                  <motion.div
                    key="usd-value"
                    style={{ transformOrigin: "top center" }}
                    initial={{ opacity: 0, y: "100%", scale: 0 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <div className="rounded-full bg-white p-1 text-muted">
                      <Equal className="size-5" />
                    </div>
                    <motion.div animate={{ width: bounds2.width }} className="flex items-center gap-2 overflow-hidden">
                      <div ref={ref2} className="flex justify-between text-[18px] font-semibold tracking-tight text-ink">
                        <span>$</span>
                        {(() => {
                          const charCount: Record<string, number> = {};
                          return usdValue
                            .toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                            .split("")
                            .map((char) => {
                              charCount[char] = (charCount[char] || 0) + 1;
                              const isDup = charCount[char] > 1;
                              const key = isDup ? `usd-${char}-dup-${charCount[char]}` : `usd-${char}`;
                              return (
                                <motion.span key={key} layoutId={key} className="inline-block">
                                  {char}
                                </motion.span>
                              );
                            });
                        })()}
                      </div>
                    </motion.div>
                    <ArrowDownUp className="size-5 text-faint" />
                  </motion.div>
                ) : (
                  <motion.p
                    key="insufficient"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: 0,
                      x: [0, -5, 5, -3, 3, 0],
                      transition: {
                        x: { delay: 0.2, times: [0, 0.2, 0.4, 0.6, 0.8, 1] },
                        type: "spring",
                        stiffness: 400,
                        damping: 35,
                      },
                    }}
                    exit={{ opacity: 0, scale: 0 }}
                    style={{ transformOrigin: "bottom center" }}
                    className="w-max text-center text-[18px] font-semibold tracking-tight text-[#d23b39]"
                  >
                    Not enough {fromTok.symbol}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="absolute -bottom-6 rounded-full border border-[#e7e4f6] bg-white p-1.5 text-faint">
            <ChevronDown className="size-5" />
          </div>
        </div>

        {/* to card */}
        <div className="flex w-full flex-col items-start justify-start gap-5 rounded-3xl border border-[#e7e4f6] bg-[#f4f2fb] px-4 py-4">
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-col">
              <TokenSelect token={toTok} exclude={fromTok.symbol} onSelect={pickTo} />
              <p className="mt-0.5 pl-1 text-[13px] text-muted">you receive</p>
            </div>
            <p className="pr-2 text-[20px] font-semibold text-ink">
              <NumberFlow value={receive} />
            </p>
          </div>
        </div>

        <button
          onClick={handleClear}
          className="w-full rounded-full bg-[#fbecec] py-3 text-[16px] text-[#b04b48] transition-colors hover:bg-[#f7e2e2]"
        >
          Clear
        </button>
      </div>
    </MotionConfig>
  );
}

function fmtBal(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: n < 1 ? 4 : 2 });
}

