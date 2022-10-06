import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router'
import {
  TextField,
  Typography,
  CircularProgress,
  InputBase,
} from "@mui/material";
import { withTheme } from "@mui/styles";
import {
  formatCurrency,
  formatInputAmount,
} from "../../utils";
import classes from "./ssSwap.module.css";
import stores from "../../stores";
import {
    ACTIONS,
    CONTRACTS,
    DEFAULT_ASSET_FROM,
    DEFAULT_ASSET_TO,
} from "../../stores/constants";
import BigNumber from "bignumber.js";
import { useAppThemeContext } from "../../ui/AppThemeProvider";
import BtnSwap from "../../ui/BtnSwap";
import Hint from "../hint/hint";
import AssetSelect from "../../ui/AssetSelect";

function Setup() {
  const [, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);

  const [loading, setLoading] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [approvalLoading, setApprovalLoading] = useState(false);

  const [fromAmountValue, setFromAmountValue] = useState("");
  const [fromAmountError, setFromAmountError] = useState(false);
  const [fromAssetValue, setFromAssetValue] = useState(null);
  const [fromAssetError, setFromAssetError] = useState(false);
  const [fromAssetOptions, setFromAssetOptions] = useState([]);

  const [toAmountValue, setToAmountValue] = useState("");
  const [toAmountError, setToAmountError] = useState(false);
  const [toAssetValue, setToAssetValue] = useState(null);
  const [toAssetError, setToAssetError] = useState(false);
  const [toAssetOptions, setToAssetOptions] = useState([]);

  const [slippage, setSlippage] = useState("2");
  const [slippageError, setSlippageError] = useState(false);

  const [quoteError, setQuoteError] = useState(null);
  const [quote, setQuote] = useState(null);
  const [hidequote, sethidequote] = useState(false);
  const [hintAnchor, setHintAnchor] = React.useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const { appTheme } = useAppThemeContext();

  const router = useRouter()

  const handleClickPopover = (event) => {
    setHintAnchor(event.currentTarget);
  };

  const handleClosePopover = () => {
    setHintAnchor(null);
  };

  const openHint = Boolean(hintAnchor);

  window.addEventListener("resize", () => {
    setWindowWidth(window.innerWidth);
  });

  useEffect(
      function () {
        const errorReturned = () => {
          setLoading(false);
          setApprovalLoading(false);
          setQuoteLoading(false);
        };

        const quoteReturned = (val) => {
          if (!val) {
            setQuoteLoading(false);
            setQuote(null);
            setToAmountValue("");
            setQuoteError(
                "Insufficient liquidity or no route available to complete swap"
            );
          }
          if (
              val &&
              val.inputs &&
              val.inputs.fromAmount === fromAmountValue &&
              val.inputs.fromAsset.address === fromAssetValue.address &&
              val.inputs.toAsset.address === toAssetValue.address
          ) {
            setQuoteLoading(false);
            if (BigNumber(val.output.finalValue).eq(0)) {
              setQuote(null);
              setToAmountValue("");
              setQuoteError(
                  "Insufficient liquidity or no route available to complete swap"
              );
              return;
            }

            setToAmountValue(BigNumber(val.output.finalValue).toFixed(8));
            setQuote(val);
          }
        };

        const ssUpdated = () => {
          const baseAsset = stores.stableSwapStore.getStore("baseAssets");

          setToAssetOptions(baseAsset);
          setFromAssetOptions(baseAsset);

          if (baseAsset.length > 0 && (toAssetValue == null || toAssetValue.chainId === "not_inited")) {
              let toIndex
              if (router.query.to) {
                  const index = baseAsset.findIndex((token) => {
                      return token.address?.toLowerCase() === router.query.to.toLowerCase();
                  });
                  if (index !== -1) {
                      toIndex = index
                  }
              }
              if (!toIndex) {
                  toIndex = baseAsset.findIndex((token) => {
                      return token.address?.toLowerCase() === DEFAULT_ASSET_TO.toLowerCase();
                  });
              }

              setToAssetValue(baseAsset[toIndex]);
          }

          if (baseAsset.length > 0 && (fromAssetValue == null || fromAssetValue.chainId === "not_inited")) {
              let fromIndex;

              if (router.query.from) {
                  const index = baseAsset.findIndex((token) => {
                      return token.address?.toLowerCase() === router.query.from.toLowerCase();
                  });
                  if (index !== -1) {
                      fromIndex = index
                  }
              }

              if (!fromIndex) {
                  fromIndex = baseAsset.findIndex((token) => {
                      return token.address.toLowerCase() === DEFAULT_ASSET_FROM.toLowerCase();
                  });
              }

              setFromAssetValue(baseAsset[fromIndex]);
          }
          forceUpdate();
        };

        const assetsUpdated = () => {
          const baseAsset = stores.stableSwapStore.getStore("baseAssets");

          setToAssetOptions(baseAsset);
          setFromAssetOptions(baseAsset);
        };

        const swapReturned = (event) => {
          setLoading(false);
          setFromAmountValue("");
          setToAmountValue("");
          if (
              !(
                  (fromAssetValue?.symbol == CONTRACTS.FTM_SYMBOL ||
                      fromAssetValue?.symbol == CONTRACTS.WFTM_SYMBOL) &&
                  (toAssetValue?.symbol == CONTRACTS.WFTM_SYMBOL ||
                      toAssetValue?.symbol == CONTRACTS.FTM_SYMBOL)
              )
          ) {
              sethidequote(false);
              calculateReceiveAmount(0, fromAssetValue, toAssetValue);
          }
          else {
            sethidequote(true);
            setToAmountValue(0);
          }
          setQuote(null);
          setQuoteLoading(false);
        };
        const wrapReturned = () => {
          setLoading(false);
        };

        stores.emitter.on(ACTIONS.ERROR, errorReturned);
        stores.emitter.on(ACTIONS.UPDATED, ssUpdated);
        stores.emitter.on(ACTIONS.WRAP_RETURNED, wrapReturned);
        stores.emitter.on(ACTIONS.UNWRAP_RETURNED, wrapReturned);
        stores.emitter.on(ACTIONS.SWAP_RETURNED, swapReturned);
        stores.emitter.on(ACTIONS.QUOTE_SWAP_RETURNED, quoteReturned);
        stores.emitter.on(ACTIONS.BASE_ASSETS_UPDATED, assetsUpdated);

        ssUpdated();

        return () => {
          stores.emitter.removeListener(ACTIONS.ERROR, errorReturned);
          stores.emitter.removeListener(ACTIONS.UPDATED, ssUpdated);
          stores.emitter.removeListener(ACTIONS.SWAP_RETURNED, swapReturned);
          stores.emitter.removeListener(
              ACTIONS.QUOTE_SWAP_RETURNED,
              quoteReturned
          );
          stores.emitter.removeListener(
              ACTIONS.BASE_ASSETS_UPDATED,
              assetsUpdated
          );
        };
      },
      [fromAmountValue, fromAssetValue, toAssetValue]
  );

  const onAssetSelect = (type, value) => {
      let from, to;
    if (type === "From") {
      if (value.address === toAssetValue.address) {
          to = fromAssetValue.address
          from = toAssetValue.address
        setToAssetValue(fromAssetValue);
        setFromAssetValue(toAssetValue);
          if (
              !(
                  (fromAssetValue?.symbol == CONTRACTS.FTM_SYMBOL ||
                      fromAssetValue?.symbol == CONTRACTS.WFTM_SYMBOL) &&
                  (toAssetValue?.symbol == CONTRACTS.WFTM_SYMBOL ||
                      toAssetValue?.symbol == CONTRACTS.FTM_SYMBOL)
              )
          ) {
              sethidequote(false);
              calculateReceiveAmount(fromAmountValue, toAssetValue, fromAssetValue);
          }
          else {
              sethidequote(true);
              setToAmountValue(fromAmountValue);
          }
      } else {
          from = value.address
          to = toAssetValue.address
        setFromAssetValue(value);
          if (
              !(
                  (value?.symbol == CONTRACTS.FTM_SYMBOL || value?.symbol == CONTRACTS.WFTM_SYMBOL) &&
                  (toAssetValue?.symbol == CONTRACTS.WFTM_SYMBOL ||
                      toAssetValue?.symbol == CONTRACTS.FTM_SYMBOL)
              )
          ) {
              sethidequote(false);
              calculateReceiveAmount(fromAmountValue, value, toAssetValue);
          }
          else {
              sethidequote(true);
              setToAmountValue(fromAmountValue);
          }
      }
    } else {
      if (value.address === fromAssetValue.address) {
          to = fromAssetValue.address
          from = toAssetValue.address
        setFromAssetValue(toAssetValue);
        setToAssetValue(fromAssetValue);
          if (
              !(
                  (fromAssetValue?.symbol == CONTRACTS.FTM_SYMBOL ||
                      fromAssetValue?.symbol == CONTRACTS.WFTM_SYMBOL) &&
                  (toAssetValue?.symbol == CONTRACTS.WFTM_SYMBOL ||
                      toAssetValue?.symbol == CONTRACTS.FTM_SYMBOL)
              )
          ) {
              sethidequote(false);
              calculateReceiveAmount(fromAmountValue, toAssetValue, fromAssetValue);
          }
          else {
              sethidequote(true);
              setToAmountValue(fromAmountValue);
          }
      } else {
          from = fromAssetValue.address
          to = value.address
        setToAssetValue(value);
          if (
              !(
                  (fromAssetValue?.symbol == CONTRACTS.FTM_SYMBOL ||
                      fromAssetValue?.symbol == CONTRACTS.WFTM_SYMBOL) &&
                  (value?.symbol == CONTRACTS.WFTM_SYMBOL || value?.symbol == CONTRACTS.FTM_SYMBOL)
              )
          ) {
              sethidequote(false);
              calculateReceiveAmount(fromAmountValue, fromAssetValue, value);
          }
          else {
              sethidequote(true);
              setToAmountValue(fromAmountValue);
          }
      }
    }

    router.push(`/swap?from=${from}&to=${to}`, undefined, { shallow: true })

    forceUpdate();
  };

  const fromAmountChanged = (event) => {
    const value = formatInputAmount(event.target.value.replace(",", "."));

    setFromAmountError(false);
    setFromAmountValue(value);
    if (value == "" || Number(value) === 0) {
      setToAmountValue("");
      setQuote(null);
    } else {
        if (
            !(
                (fromAssetValue?.symbol == CONTRACTS.FTM_SYMBOL ||
                    fromAssetValue?.symbol == CONTRACTS.WFTM_SYMBOL) &&
                (toAssetValue?.symbol == CONTRACTS.WFTM_SYMBOL || toAssetValue?.symbol == CONTRACTS.FTM_SYMBOL)
            )
        ) {
            sethidequote(false);
            calculateReceiveAmount(value, fromAssetValue, toAssetValue);
        }
        else {
            sethidequote(true);
            setToAmountValue(value);
        }
    }
  };

  const toAmountChanged = (event) => {};

  const onSlippageChanged = (event) => {
    if (event.target.value == "" || !isNaN(event.target.value)) {
      setSlippage(event.target.value);
    }
  };

  const calculateReceiveAmount = (amount, from, to) => {
    if (amount !== "" && !isNaN(amount) && to != null) {
      setQuoteLoading(true);
      setQuoteError(false);

      stores.dispatcher.dispatch({
        type: ACTIONS.QUOTE_SWAP,
        content: {
          fromAsset: from,
          toAsset: to,
          fromAmount: amount,
        },
      });
    }
  };

  const onSwap = () => {
    if (
        !fromAmountValue ||
        fromAmountValue > Number(fromAssetValue.balance) ||
        Number(fromAmountValue) <= 0
    ) {
      return;
    }

    setFromAmountError(false);
    setFromAssetError(false);
    setToAssetError(false);

    let error = false;

    if (!fromAmountValue || fromAmountValue === "" || isNaN(fromAmountValue)) {
      setFromAmountError("From amount is required");
      error = true;
    } else {
      if (
          !fromAssetValue.balance ||
          isNaN(fromAssetValue.balance) ||
          BigNumber(fromAssetValue.balance).lte(0)
      ) {
        setFromAmountError("Invalid balance");
        error = true;
      } else if (BigNumber(fromAmountValue).lt(0)) {
        setFromAmountError("Invalid amount");
        error = true;
      } else if (
          fromAssetValue &&
          BigNumber(fromAmountValue).gt(fromAssetValue.balance)
      ) {
        setFromAmountError(`Greater than your available balance`);
        error = true;
      }
    }

    if (!fromAssetValue || fromAssetValue === null) {
      setFromAssetError("From asset is required");
      error = true;
    }

    if (!toAssetValue || toAssetValue === null) {
      setFromAssetError("To asset is required");
      error = true;
    }

    if (!error) {
      setLoading(true);

      stores.dispatcher.dispatch({
        type: ACTIONS.SWAP,
        content: {
          fromAsset: fromAssetValue,
          toAsset: toAssetValue,
          fromAmount: fromAmountValue,
          toAmount: toAmountValue,
          quote: quote,
          slippage: slippage,
        },
      });
    }
  };

    const onWrap = () => {
        if (
            !fromAmountValue ||
            fromAmountValue > Number(fromAssetValue.balance) ||
            Number(fromAmountValue) <= 0
        ) {
            return;
        }

        setFromAmountError(false);
        setFromAssetError(false);
        setToAssetError(false);

        let error = false;

        if (!fromAmountValue || fromAmountValue === "" || isNaN(fromAmountValue)) {
            setFromAmountError("From amount is required");
            error = true;
        } else {
            if (
                !fromAssetValue.balance ||
                isNaN(fromAssetValue.balance) ||
                BigNumber(fromAssetValue.balance).lte(0)
            ) {
                setFromAmountError("Invalid balance");
                error = true;
            } else if (BigNumber(fromAmountValue).lt(0)) {
                setFromAmountError("Invalid amount");
                error = true;
            } else if (
                fromAssetValue &&
                BigNumber(fromAmountValue).gt(fromAssetValue.balance)
            ) {
                setFromAmountError(`Greater than your available balance`);
                error = true;
            }
        }

        if (!fromAssetValue || fromAssetValue === null) {
            setFromAssetError("From asset is required");
            error = true;
        }

        if (!toAssetValue || toAssetValue === null) {
            setFromAssetError("To asset is required");
            error = true;
        }

        if (!error) {
            setLoading(true);

            stores.dispatcher.dispatch({
                type: ACTIONS.WRAP,
                content: {
                    fromAsset: fromAssetValue,
                    toAsset: toAssetValue,
                    fromAmount: fromAmountValue,
                    toAmount: toAmountValue,
                    quote: quote,
                    slippage: slippage,
                },
            });
        }
    };
    const onUnwrap = () => {
        if (
            !fromAmountValue ||
            fromAmountValue > Number(fromAssetValue.balance) ||
            Number(fromAmountValue) <= 0
        ) {
            return;
        }

        setFromAmountError(false);
        setFromAssetError(false);
        setToAssetError(false);

        let error = false;

        if (!fromAmountValue || fromAmountValue === "" || isNaN(fromAmountValue)) {
            setFromAmountError("From amount is required");
            error = true;
        } else {
            if (
                !fromAssetValue.balance ||
                isNaN(fromAssetValue.balance) ||
                BigNumber(fromAssetValue.balance).lte(0)
            ) {
                setFromAmountError("Invalid balance");
                error = true;
            } else if (BigNumber(fromAmountValue).lt(0)) {
                setFromAmountError("Invalid amount");
                error = true;
            } else if (
                fromAssetValue &&
                BigNumber(fromAmountValue).gt(fromAssetValue.balance)
            ) {
                setFromAmountError(`Greater than your available balance`);
                error = true;
            }
        }

        if (!fromAssetValue || fromAssetValue === null) {
            setFromAssetError("From asset is required");
            error = true;
        }

        if (!toAssetValue || toAssetValue === null) {
            setFromAssetError("To asset is required");
            error = true;
        }

        if (!error) {
            setLoading(true);

            stores.dispatcher.dispatch({
                type: ACTIONS.UNWRAP,
                content: {
                    fromAsset: fromAssetValue,
                    toAsset: toAssetValue,
                    fromAmount: fromAmountValue,
                    toAmount: toAmountValue,
                    quote: quote,
                    slippage: slippage,
                },
            });
        }
    };

  const setBalance100 = () => {
    setFromAmountValue(fromAssetValue.balance);
      if (
          !(
              (fromAssetValue?.symbol == CONTRACTS.FTM_SYMBOL ||
                  fromAssetValue?.symbol == CONTRACTS.WFTM_SYMBOL) &&
              (toAssetValue?.symbol == CONTRACTS.WFTM_SYMBOL || toAssetValue?.symbol == CONTRACTS.FTM_SYMBOL)
          )
      ) {
          sethidequote(false);
          calculateReceiveAmount(
              fromAssetValue.balance,
              fromAssetValue,
              toAssetValue
          );
      }
      else {
          sethidequote(true);
          setToAmountValue(fromAssetValue.balance);
      }
  };

  const swapAssets = () => {
    const fa = fromAssetValue;
    const ta = toAssetValue;
    setFromAssetValue(ta);
    setToAssetValue(fa);

    router.push(`/swap?from=${ta.address}&to=${fa.address}`, undefined, { shallow: true })

    const toAmount = toAmountValue

      if (
          !(
              (fromAssetValue?.symbol == CONTRACTS.FTM_SYMBOL ||
                  fromAssetValue?.symbol == CONTRACTS.WFTM_SYMBOL) &&
              (toAssetValue?.symbol == CONTRACTS.WFTM_SYMBOL || toAssetValue?.symbol == CONTRACTS.FTM_SYMBOL)
          )
      ) {
          sethidequote(false);
          setFromAmountValue(toAmount)
          setToAmountValue("");
          setQuote(null);
          calculateReceiveAmount(toAmountValue, ta, fa);
      }
      else {
          sethidequote(true);
          setToAmountValue(fromAmountValue);
      }
  };

  const renderSwapInformation = () => {
    if (!quoteError && !quoteLoading && quote) {
      return (
          <div className={classes.controlsInfo}>
            <div className={classes.depositInfoContainer}>
              {quote && (
                  <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        width: "100%",
                      }}
                  >
                    { (
                        <div
                          className={[
                            classes.priceImpactWrapper,
                            classes[`warningContainer--${appTheme}`],
                            BigNumber(quote.priceImpact).gt(5)
                              ? classes.priceImpactWrapperError
                              : classes.priceImpactWrapperWarning,
                          ].join(" ")}
                        >
                          <Typography
                            className={[
                              classes.priceImpactRow,
                              BigNumber(quote.priceImpact).gt(5)
                                ? classes.warningError
                                : classes.warningWarning,
                              classes[`warningText--${appTheme}`],
                            ].join(" ")}
                            align="center"
                          >
                            <span className={classes.priceImpactTitle}>
                              Price impact
                            </span>{" "}
                            <span
                              className={[classes.priceImpactValue,
                                BigNumber(quote.priceImpact).gt(5) || BigNumber(quote.priceImpact).lt(0)
                                  ? classes.priceImpactValueError
                                  : classes.priceImpactValueWarning,
                                ].join(" ")}>
                        {quote.priceImpact > 0 ? formatCurrency(quote.priceImpact) : "Unknown"}%
                      </span>
                          </Typography>
                        </div>
                    )}
                  </div>
              )}
            </div>
          </div>
      );
    }

    return (
        <div className={classes.controlsInfo}>
          <div className={classes.depositInfoContainer}>
            <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                }}
            >
              <div
                  className={[
                    classes.warningContainer,
                    classes[`warningContainer--${appTheme}`],
                  ].join(" ")}
              >
                <Typography
                    className={[
                      classes.priceImpactRow,
                      classes[`warningText--${appTheme}`],
                    ].join(" ")}
                    align="center"
                >
                  <span className={classes.priceImpactTitle}>
                    Price impact
                  </span>{" "}
                  <span className={[classes.priceImpactValue,
                  ].join(" ")}>
                    0.00%
                  </span>
                </Typography>
              </div>
            </div>
          </div>
        </div>
    );
  };

  const renderBalanceIsBellowError = () => {
    if (!quoteError && !quoteLoading && quote && fromAmountValue > Number(fromAssetValue.balance)) {
      return (
          <div
              style={{ marginBottom: 20 }}
              className={[
                classes.warningContainer,
                classes[`warningContainer--${appTheme}`],
                classes.warningContainerError
              ].join(" ")}
          >
            <img src="/images/ui/info-circle-red.svg" width="24px" style={{ marginRight: 8 }} />

            <Typography
                className={classes.warningError}
                align="center"
            >
              Insufficient funds {fromAssetValue?.symbol}
            </Typography>
          </div>
      )
    }

    return null;
  }

  const renderRoute = () => {
    if (!quoteError && !quoteLoading && quote) {
      return (
          <div style={{ marginTop: 0, marginBottom: 20 }}>
            <div
                className={[classes.route, classes[`route--${appTheme}`]].join(" ")}
            >
              <div className={classes.routeIconWrap}>
                <img
                    className={[
                      classes.routeIcon,
                      classes[`routeIcon--${appTheme}`],
                    ].join(" ")}
                    alt=""
                    src={fromAssetValue ? `${fromAssetValue.logoURI}` : ""}
                    width="30px"
                    height="30px"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `/tokens/unknown-logo--${appTheme}.svg`;
                    }}
                />
              </div>

              <div className={classes.line}>
                {!quote?.output?.routeAsset && (
                    <div
                        className={[
                          classes.routeLinesLeft,
                          classes[`routeLinesLeft--${appTheme}`],
                        ].join(" ")}
                    >
                      <div className={classes.routeLinesLeftArrow} />
                    </div>
                )}

                {quote?.output?.routeAsset && (
                    <>
                      <div
                          className={[
                            classes.routeLinesLeftPart1,
                            classes[`routeLinesLeft--${appTheme}`],
                          ].join(" ")}
                      >
                        <div className={classes.routeLinesLeftPart1Arrow} />
                      </div>
                      <div
                          className={[
                            classes.routeLinesLeftText,
                            classes[`routeLinesLeftText--${appTheme}`],
                          ].join(" ")}
                      >
                        {quote.output.routes[0].stable ? "Stable" : "Volatile"}
                      </div>
                      <div
                          className={[
                            classes.routeLinesLeftPart2,
                            classes[`routeLinesLeft--${appTheme}`],
                          ].join(" ")}
                      >
                        <div className={classes.routeLinesLeftPart2Arrow} />
                      </div>

                      <div className={classes.routeIconWrap}>
                        <img
                            className={[
                              classes.routeIcon,
                              classes[`routeIcon--${appTheme}`],
                            ].join(" ")}
                            alt=""
                            src={
                              quote.output.routeAsset
                                  ? `${quote.output.routeAsset.logoURI}`
                                  : ""
                            }
                            height="40px"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `/tokens/unknown-logo--${appTheme}.svg`;
                            }}
                        />
                      </div>

                      <div
                          className={[
                            classes.routeLinesRightPart1,
                            classes[`routeLinesLeft--${appTheme}`],
                          ].join(" ")}
                      >
                        <div className={classes.routeLinesRightPart1Arrow} />
                      </div>
                      <div
                          className={[
                            classes.routeLinesRightText,
                            classes[`routeLinesRightText--${appTheme}`],
                          ].join(" ")}
                      >
                        {quote.output.routes[1].stable ? "Stable" : "Volatile"}
                      </div>
                      <div
                          className={[
                            classes.routeLinesRightPart2,
                            classes[`routeLinesLeft--${appTheme}`],
                          ].join(" ")}
                      >
                        <div className={classes.routeLinesRightPart2Arrow} />
                      </div>
                    </>
                )}

                {!quote?.output?.routeAsset && (
                    <div
                        className={[
                          classes.routeArrow,
                          classes[`routeArrow--${appTheme}`],
                        ].join(" ")}
                    >
                      {quote.output.routes[0].stable ? "Stable" : "Volatile"}
                    </div>
                )}

                {!quote?.output?.routeAsset && (
                    <div
                        className={[
                          classes.routeLinesRight,
                          classes[`routeLinesRight--${appTheme}`],
                        ].join(" ")}
                    >
                      <div className={classes.routeLinesRightArrow} />
                    </div>
                )}
              </div>

              <div className={classes.routeIconWrap}>
                <img
                    className={[
                      classes.routeIcon,
                      classes[`routeIcon--${appTheme}`],
                    ].join(" ")}
                    alt=""
                    src={toAssetValue ? `${toAssetValue.logoURI}` : ""}
                    width="30px"
                    height="30px"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `/tokens/unknown-logo--${appTheme}.svg`;
                    }}
                />
              </div>
            </div>
          </div>
      )
    }

    return null;
  }

  const renderSmallInput = (type, amountValue, amountError, amountChanged) => {
    return (
        <div className={classes.slippage}>
          <div
              className={[
                "g-flex",
                "g-flex--align-center",
                classes.slippageLabel,
              ].join(" ")}
          >
            <Typography
                className={[
                  classes.inputBalanceSlippage,
                  classes[`inputBalanceSlippage--${appTheme}`],
                ].join(" ")}
                noWrap
            >
              Slippage
            </Typography>

            <div className={classes.inputBalanceSlippageHelp}>
              <Hint
                  hintText={
                    "Slippage is the price difference between the submission of a transaction and the confirmation of the transaction on the blockchain."
                  }
                  open={openHint}
                  anchor={hintAnchor}
                  handleClick={handleClickPopover}
                  handleClose={handleClosePopover}
                  vertical={46}
              />
            </div>
          </div>

          <TextField
              placeholder="0.00"
              error={amountError}
              value={amountValue}
              onChange={amountChanged}
              disabled={loading}
              autoComplete="off"
              InputProps={{
                classes: {
                  root: [
                    classes.inputBalanceSlippageText,
                    classes[`inputBalanceSlippageText--${appTheme}`],
                  ].join(" "),
                  inputAdornedStart: [
                    classes.inputBalanceSlippageText,
                    classes[`inputBalanceSlippageText--${appTheme}`],
                  ].join(" "),
                },
              }}
              inputProps={{
                size: amountValue?.length || 4,
                style: {
                  padding: 0,
                  borderRadius: 0,
                  border: "none",
                  color: "#E4E9F4",
                  paddingRight: amountValue?.length >= 8 ? 10 : 0,
                },
              }}
          />
        </div>
    );
  };

  const renderMassiveInput = (
      type,
      amountValue,
      amountError,
      amountChanged,
      assetValue,
      assetError,
      assetOptions,
      onAssetSelect,
      priceCompareText
  ) => {
    return (
        <div
            className={[
              classes.textField,
              classes[`textField--${type}-${appTheme}`],
            ].join(" ")}
        >
          <div className={classes.inputRow}>
            <div className={classes.inputColumn}>
              <div className={classes.massiveInputTitle}>
                <Typography className={classes.inputTitleText} noWrap>
                  {type === "From" ? "From" : "To"}

                  <span>{priceCompareText}</span>
                </Typography>
              </div>

              <div className={classes.massiveInputAssetSelect}>
                <AssetSelect
                    type={type}
                    value={assetValue}
                    assetOptions={assetOptions}
                    onSelect={onAssetSelect}
                />
              </div>
            </div>

            <div className={classes.inputColumn}>
              <div className={classes.massiveInputTitle}>
                <div
                    className={[
                      classes.inputBalanceTextContainer,
                      "g-flex",
                      "g-flex--align-center",
                    ].join(" ")}
                >
                  <img
                      src="/images/ui/icon-wallet.svg"
                      className={classes.walletIcon}
                  />

                  <Typography
                      className={[classes.inputBalanceText, "g-flex__item"].join(
                          " "
                      )}
                      noWrap
                      onClick={() => setBalance100()}
                  >
                  <span>
                    {assetValue && assetValue.balance
                        ? " " + formatCurrency(assetValue.balance)
                        : ""}
                  </span>
                  </Typography>

                  {assetValue?.balance &&
                  Number(assetValue?.balance) > 0 &&
                  type === "From" && (
                      <div
                          className={classes.max}
                          onClick={() => setBalance100()}
                      >
                        MAX
                      </div>
                  )}
                </div>
              </div>

              <InputBase
                  className={[
                    classes.massiveInputAmount,
                    type === "From" && fromAmountValue > Number(fromAssetValue?.balance) ? classes.massiveInputAmountError : ''
                  ].join(" ")}
                  placeholder="0.00"
                  error={amountError}
                  value={amountValue}
                  onChange={amountChanged}
                  disabled={loading || type === "To"}
                  inputMode={"decimal"}
                  inputProps={{
                    className: [
                      classes.largeInput,
                      classes[`largeInput--${appTheme}`],
                    ].join(" "),
                  }}
              />
            </div>
          </div>
          {/* <div
          className={`${classes.massiveInputContainer} ${
            (amountError || assetError) && classes.error
          }`}
        >
        </div> */}
        </div>
    );
  };

  const [swapIconBgColor, setSwapIconBgColor] = useState(null);
  const [swapIconBorderColor, setSwapIconBorderColor] = useState(null);
  const [swapIconArrowColor, setSwapIconArrowColor] = useState(null);

  const swapIconHover = () => {
    setSwapIconBgColor(appTheme === "dark" ? "#2D3741" : "#9BC9E4");
    setSwapIconBorderColor(appTheme === "dark" ? "#4CADE6" : "#0B5E8E");
    setSwapIconArrowColor(appTheme === "dark" ? "#4CADE6" : "#0B5E8E");
  };

  const swapIconClick = () => {
    setSwapIconBgColor(appTheme === "dark" ? "#5F7285" : "#86B9D6");
    setSwapIconBorderColor(appTheme === "dark" ? "#4CADE6" : "#0B5E8E");
    setSwapIconArrowColor(appTheme === "dark" ? "#4CADE6" : "#0B5E8E");
  };

  const swapIconDefault = () => {
    setSwapIconBgColor(null);
    setSwapIconBorderColor(null);
    setSwapIconArrowColor(null);
  };

  return (
      <div className={classes.swapInputs}>
        <div className={classes.swapInputsHeader}>
          <Typography className={classes.swapInputsHeader}>Swap</Typography>

          {renderSmallInput(
              "slippage",
              slippage,
              slippageError,
              onSlippageChanged
          )}
        </div>

        {renderMassiveInput(
            "From",
            fromAmountValue,
            fromAmountError,
            fromAmountChanged,
            fromAssetValue,
            fromAssetError,
            fromAssetOptions,
            onAssetSelect,
            quote &&
            `1 ${fromAssetValue?.symbol} =
        ${!hidequote ? formatCurrency(
                BigNumber(quote.output.finalValue)
                    .div(quote.inputs.fromAmount)
                    .toFixed(18)
            ) : 1}
        ${toAssetValue?.symbol}`
        )}

        {fromAssetError && (
            <div
                style={{ marginTop: 20 }}
                className={[
                  classes.warningContainer,
                  classes[`warningContainer--${appTheme}`],
                  classes.warningContainerError,
                ].join(" ")}
            >
              <div
                  className={[
                    classes.warningDivider,
                    classes.warningDividerError,
                  ].join(" ")}
              ></div>
              <Typography
                  className={[
                    classes.warningError,
                    classes[`warningText--${appTheme}`],
                  ].join(" ")}
                  align="center"
              >
                {fromAssetError}
              </Typography>
            </div>
        )}

        <div className={classes.swapIconContainerOuter}>
          <div className={classes.inputRow}>
            <div className={classes.inputColumn}>
              <div
                  className={[
                    classes.swapIconContainer,
                    classes[`swapIconContainer--${appTheme}`],
                  ].join(" ")}
                  onMouseOver={swapIconHover}
                  onMouseOut={swapIconDefault}
                  onMouseDown={swapIconClick}
                  onMouseUp={swapIconDefault}
                  onTouchStart={swapIconClick}
                  onTouchEnd={swapIconDefault}
                  onClick={swapAssets}
              >
                <img src="/images/ui/arrow-down.png" />
                {/* {windowWidth > 470 && (
                <svg
                  width="80"
                  height="80"
                  viewBox="0 0 80 80"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="40"
                    cy="40"
                    r="39.5"
                    fill={appTheme === "dark" ? "#151718" : "#DBE6EC"}
                    stroke={appTheme === "dark" ? "#5F7285" : "#86B9D6"}
                  />

                  <rect
                    y="30"
                    width="4"
                    height="20"
                    fill={appTheme === "dark" ? "#151718" : "#DBE6EC"}
                  />

                  <rect
                    x="76"
                    y="30"
                    width="4"
                    height="20"
                    fill={appTheme === "dark" ? "#151718" : "#DBE6EC"}
                  />

                  <circle
                    cx="40"
                    cy="40"
                    r="29.5"
                    fill={
                      swapIconBgColor || (appTheme === "dark" ? "#24292D" : "#B9DFF5")
                    }
                    stroke={
                      swapIconBorderColor ||
                      (appTheme === "dark" ? "#5F7285" : "#86B9D6")
                    }
                  />

                  <path
                    d="M41.0002 44.172L46.3642 38.808L47.7782 40.222L40.0002 48L32.2222 40.222L33.6362 38.808L39.0002 44.172V32H41.0002V44.172Z"
                    fill={
                      swapIconArrowColor ||
                      (appTheme === "dark" ? "#4CADE6" : "#0B5E8E")
                    }
                  />
                </svg>
              )}

              {windowWidth <= 470 && (
                <svg
                  width="50"
                  height="50"
                  viewBox="0 0 50 50"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="25"
                    cy="25"
                    r="24.5"
                    fill={appTheme === "dark" ? "#151718" : "#DBE6EC"}
                    stroke={appTheme === "dark" ? "#5F7285" : "#86B9D6"}
                  />

                  <rect
                    y="20"
                    width="3"
                    height="10"
                    fill={appTheme === "dark" ? "#151718" : "#DBE6EC"}
                  />

                  <rect
                    x="48"
                    y="20"
                    width="2"
                    height="10"
                    fill={appTheme === "dark" ? "#151718" : "#DBE6EC"}
                  />

                  <circle
                    cx="25"
                    cy="25"
                    r="18.5"
                    fill={
                      swapIconBgColor || (appTheme === "dark" ? "#24292D" : "#B9DFF5")
                    }
                    stroke={
                      swapIconBorderColor ||
                      (appTheme === "dark" ? "#5F7285" : "#86B9D6")
                    }
                  />

                  <path
                    d="M25.8336 28.4773L30.3036 24.0073L31.4819 25.1857L25.0002 31.6673L18.5186 25.1857L19.6969 24.0073L24.1669 28.4773V18.334H25.8336V28.4773Z"
                    fill={
                      swapIconArrowColor ||
                      (appTheme === "dark" ? "#ffffff" : "#ffffff")
                    }
                  />
                </svg>
              )} */}
              </div>
            </div>
          </div>
        </div>

        {renderMassiveInput(
            "To",
            toAmountValue,
            toAmountError,
            toAmountChanged,
            toAssetValue,
            toAssetError,
            toAssetOptions,
            onAssetSelect,
            quote &&
            `1 ${toAssetValue?.symbol} = 
        ${!hidequote ? formatCurrency(
                BigNumber(quote.inputs.fromAmount)
                    .div(quote.output.finalValue)
                    .toFixed(18)
            ) : 1}
        ${fromAssetValue?.symbol}`
        )}

        <div style={{ marginBottom: 20}} />

        {toAssetError && (
            <div
                style={{ marginTop: 20, marginBottom: 20 }}
                className={[
                  classes.warningContainer,
                  classes[`warningContainer--${appTheme}`],
                  classes.warningContainerError,
                ].join(" ")}
            >
              <div
                  className={[
                    classes.warningDivider,
                    classes.warningDividerError,
                  ].join(" ")}
              ></div>
              <Typography
                  className={[
                    classes.warningError,
                    classes[`warningText--${appTheme}`],
                  ].join(" ")}
                  align="center"
              >
                {toAssetError}
              </Typography>
            </div>
        )}

        {slippageError && (
            <div
                style={{ marginTop: 20, marginBottom: 20 }}
                className={[
                  classes.warningContainer,
                  classes[`warningContainer--${appTheme}`],
                  classes.warningContainerError,
                ].join(" ")}
            >
              <div
                  className={[
                    classes.warningDivider,
                    classes.warningDividerError,
                  ].join(" ")}
              ></div>
              <Typography
                  className={[
                    classes.warningError,
                    classes[`warningText--${appTheme}`],
                  ].join(" ")}
                  align="center"
              >
                {slippageError}
              </Typography>
            </div>
        )}

        {quoteError && (
            <div
                className={[classes.quoteLoader, classes.quoteLoaderError].join(" ")}
            >
              <div
                  className={[classes.quoteLoaderIcon, classes.quoteLoaderIconError].join(
                      " "
                  )}
              >
                <img src="/images/ui/info-circle-red.svg" width="24px" />
              </div>
              {/* <div
            className={[
              classes.quoteLoaderDivider,
              classes.quoteLoaderDividerError,
            ].join(" ")}
          ></div> */}
              <Typography className={classes.quoteError}>{quoteError}</Typography>
            </div>
        )}

        {renderBalanceIsBellowError()}

        {quoteLoading && (
            <div
                className={[classes.quoteLoader, classes.quoteLoaderLoading].join(
                    " "
                )}
            >
              <CircularProgress size={20} className={classes.loadingCircle} />
            </div>
        )}

        {!hidequote ? renderRoute() : ''}

        <div className={classes.controls}>
            {!hidequote ? renderSwapInformation() : null}

          <div className={classes.controlsBtn}>
            <BtnSwap
                onClick={(fromAssetValue?.symbol == CONTRACTS.FTM_SYMBOL && toAssetValue?.symbol == CONTRACTS.WFTM_SYMBOL)
                    ? onWrap
                    : (fromAssetValue?.symbol == CONTRACTS.WFTM_SYMBOL && toAssetValue?.symbol == CONTRACTS.FTM_SYMBOL)
                        ? onUnwrap
                        : onSwap}
                className={classes.btnSwap}
                labelClassName={[
                  !fromAmountValue ||
                  fromAmountValue > Number(fromAssetValue.balance) ||
                  Number(fromAmountValue) <= 0
                      ? classes["actionButtonText--disabled"]
                      : classes.actionButtonText,
                  quote
                      ? BigNumber(quote.priceImpact).gt(5)
                          ? classes.actionButtonTextError
                          : classes.actionButtonTextErrorWarning
                      : "",
                ].join(" ")}
                isDisabled={
                  !fromAmountValue ||
                  fromAmountValue > Number(fromAssetValue.balance) ||
                  Number(fromAmountValue) <= 0
                }
                loading={loading}
                label={
                    loading && fromAssetValue?.symbol == CONTRACTS.FTM_SYMBOL && toAssetValue?.symbol == CONTRACTS.WFTM_SYMBOL
                        ? "Wrapping"
                        : loading && fromAssetValue?.symbol == CONTRACTS.WFTM_SYMBOL && toAssetValue?.symbol == CONTRACTS.FTM_SYMBOL
                            ? "Unwrapping"
                            : loading &&
                            !(
                                (fromAssetValue?.symbol == CONTRACTS.FTM_SYMBOL ||
                                    fromAssetValue?.symbol == CONTRACTS.WFTM_SYMBOL) &&
                                (toAssetValue?.symbol == CONTRACTS.WFTM_SYMBOL ||
                                    toAssetValue?.symbol == CONTRACTS.FTM_SYMBOL)
                            )
                                ? "Swapping"
                                : !fromAmountValue || Number(fromAmountValue) <= 0
                                    ? "Enter Amount"
                                    : (fromAssetValue?.symbol == CONTRACTS.FTM_SYMBOL && toAssetValue?.symbol == CONTRACTS.WFTM_SYMBOL)
                                        ? "Wrap"
                                        : (fromAssetValue?.symbol == CONTRACTS.WFTM_SYMBOL && toAssetValue?.symbol == CONTRACTS.FTM_SYMBOL)
                                            ? "Unwrap"
                                            : quote && BigNumber(quote.priceImpact).gt(5) ? "SWAP | ARE YOU SURE?" : "SWAP"
                }
            ></BtnSwap>
          </div>
        </div>
      </div>
  );
}

export default withTheme(Setup);
