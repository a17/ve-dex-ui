import React, { useState, useEffect, useRef } from 'react';
import {
  Paper,
  Typography,
  Button,
  CircularProgress,
  Tooltip,
  IconButton, InputBase,
} from '@mui/material';
import { useRouter } from 'next/router';
import BigNumber from 'bignumber.js';
import moment from 'moment';
import { formatCurrency, formatInputAmount } from '../../utils';
import classes from "./ssVest.module.css";
import stores from '../../stores';
import {
  ACTIONS,
} from '../../stores/constants';

import { ArrowBackIosNew } from '@mui/icons-material';
import VestingInfo from "./vestingInfo";
import { useAppThemeContext } from '../../ui/AppThemeProvider';

export default function ssLock({govToken, veToken}) {
  const unixWeek = 604800

  const inputEl = useRef(null);
  const router = useRouter();

  const [lockLoading, setLockLoading] = useState(false);

  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState(false);
  const [selectedValue, setSelectedValue] = useState('week');
  const [selectedDate, setSelectedDate] = useState(moment.unix(Math.floor(moment().add(7, 'days').unix() / unixWeek) * unixWeek).format('YYYY-MM-DD'));
  const [selectedDateError, setSelectedDateError] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const isDateCorrect = (dateStr) => {
    const date = moment(dateStr).format('YYYY-MM-DD')
    const correctDate = moment.unix(Math.floor(moment(dateStr).add(1, 'days').unix() / unixWeek) * unixWeek).format('YYYY-MM-DD')
    return date === correctDate && moment(dateStr).unix() > moment().unix()
  }

  useEffect(() => {
    const lockReturned = () => {
      setLockLoading(false);
      router.push('/vest');
    };
    const errorReturned = () => {
      setLockLoading(false);
    };

    stores.emitter.on(ACTIONS.ERROR, errorReturned);
    stores.emitter.on(ACTIONS.CREATE_VEST_RETURNED, lockReturned);
    return () => {
      stores.emitter.removeListener(ACTIONS.ERROR, errorReturned);
      stores.emitter.removeListener(ACTIONS.CREATE_VEST_RETURNED, lockReturned);
    };
  }, []);

  window.addEventListener('resize', () => {
    setWindowWidth(window.innerWidth);
  });

  const setAmountPercent = (percent) => {
    setAmount(BigNumber(govToken.balance).times(percent).div(100).toFixed(govToken.decimals));
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
    setSelectedValue(null);
  };

  const handleChange = (value) => {
    setSelectedValue(value);

    let days = 0;
    switch (value) {
      case 'week':
        days = 7;
        break;
      case 'month':
        days = 28;
        break;
      case 'year':
        days = 364;
        break;
      case 'years':
        days = 1456;
        break;
      default:
    }
    let newDate = moment().add(days, 'days');
    // round to weeks
    newDate = moment.unix(Math.floor(newDate.unix() / unixWeek) * unixWeek)

    setSelectedDate(newDate.format('YYYY-MM-DD'));
  };

  const onLock = () => {
    setAmountError(false);

    let error = false;

    if (!amount || amount === '' || isNaN(amount)) {
      setAmountError('Amount is required');
      error = true;
    } else {
      if (!govToken.balance || isNaN(govToken.balance) || BigNumber(govToken.balance).lte(0)) {
        setAmountError('Invalid balance');
        error = true;
      } else if (BigNumber(amount).lte(0)) {
        setAmountError('Invalid amount');
        error = true;
      } else if (govToken && BigNumber(amount).gt(govToken.balance)) {
        setAmountError(`Greater than your available balance`);
        error = true;
      }
    }

    if (!error) {
      setLockLoading(true);

      const now = moment();
      const expiry = moment(selectedDate).add(1, 'days');
      const secondsToExpire = expiry.diff(now, 'seconds');

      stores.dispatcher.dispatch({type: ACTIONS.CREATE_VEST, content: {amount, unlockTime: secondsToExpire}});
    }
  };

  const focus = () => {
    inputEl.current.focus();
  };

  const onAmountChanged = (event) => {
    const value = formatInputAmount(event.target.value.replace(',', '.'))
    setAmountError(false);
    setAmount(value);
  };

  const renderMassiveDateInput = (type, amountValue, amountError, amountChanged, balance, logo) => {
    return (
      <div className={[classes.lockDateRow ,`${(amountError) && classes.error}`].join(" ")}>
        {/* <div className={classes.massiveInputAssetSelect}>
          <div className={classes.displaySelectContainerDate}>
            <div
              className={[classes.displayDualIconContainer].join(' ')}>
              <div className={[classes.displayAssetIcon].join(' ')}/>
            </div>
          </div>
        </div> */}
        <div className={classes.lockDateWrapper}>
          <Typography className={classes.smallerTextDate}>
            Set Lock Expiry Date
          </Typography>

          <InputBase
            className={classes.massiveInputAmountDate}
            inputRef={inputEl}
            id="someDate"
            type="date"
            placeholder="Set Lock Expiry Date"
            error={amountError}
            helperText={amountError}
            value={amountValue}
            onChange={amountChanged}
            disabled={lockLoading}
            inputProps={{
              className: classes.dateInput,
              min: moment().add(7, 'days').format('YYYY-MM-DD'),
              max: moment().add(1460, 'days').format('YYYY-MM-DD'),
            }}
            InputProps={{
              disableUnderline: true,
            }}
          />
        </div>
      </div>
    );
  };

  const renderMassiveInput = (type, amountValue, amountError, amountChanged, token) => {
    return (
      <div className={classes.textField}>
        <div className={`${classes.massiveInputContainer} ${(amountError) && classes.error}`}>
          <div className={classes.inputRow}>
            <div className={classes.inputColumn}>
              <Typography className={classes.inputTitleText} noWrap>
                {windowWidth > 530 ? 'Manage Lock' : 'Lock'}
              </Typography>

              <div className={classes.massiveInputAssetSelect}>
                <div className={classes.displaySelectContainer}>
                  <div className={classes.displayDualIconContainer}>
                    {token && token.logoURI &&
                      <img
                        className={classes.displayAssetIcon}
                        alt=""
                        src={token.logoURI}
                        width="60px"
                        height="60px"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `/tokens/unknown-logo--${appTheme}.svg`;
                        }}
                      />
                    }
                    {!(token && token.logoURI) &&
                      <img
                        className={classes.displayAssetIcon}
                        alt=""
                        src={`/tokens/unknown-logo--${appTheme}.svg`}
                        width="60px"
                        height="60px"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `/tokens/unknown-logo--${appTheme}.svg`;
                        }}
                      />
                    }

                    <Typography
                      className={[classes.smallerText, classes[`smallerText--${appTheme}`]].join(" ")}>
                      {token?.symbol}
                    </Typography>
                  </div>
                </div>
              </div>
            </div>

            <div className={classes.inputColumn}>
              <Typography className={classes.inputBalanceText} noWrap onClick={() => {
                setAmountPercent(100);
              }}>
                Balance: {(token && token.balance) ? ' ' + formatCurrency(token.balance) : ''}
              </Typography>

              <InputBase
                className={classes.massiveInputAmount}
                placeholder="0.00"
                error={amountError}
                helperText={amountError}
                value={amountValue}
                onChange={amountChanged}
                disabled={lockLoading}
                inputProps={{
                  className: classes.largeInput,
                }}
                InputProps={{
                  disableUnderline: true,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderVestInformation = () => {
    const now = moment();
    const expiry = moment(selectedDate);
    const dayToExpire = expiry.diff(now, 'days');

    const tmpNFT = {
      lockAmount: amount,
      lockValue: BigNumber(amount).times(parseInt(dayToExpire) + 1).div(1460).toFixed(18),
      lockEnds: expiry.unix(),
    };

    return (<VestingInfo futureNFT={tmpNFT} govToken={govToken} veToken={veToken} showVestingStructure={true}/>);
  };

  const onBack = () => {
    router.push('/vest');
  };

  const {appTheme} = useAppThemeContext();

  return (
    <>
      <Paper
        elevation={0}
        className={[classes.container3, classes['g-flex-column']].join(' ')}
      >
        <p className={classes.pageTitle}>
          <div className={classes.titleSection} onClick={onBack}>
            <Tooltip title="Back to Vest" placement="top">
              <IconButton>
                <div className={classes.backIconWrap}>
                  <ArrowBackIosNew className={classes.backIcon} />
                </div>
              </IconButton>
            </Tooltip>
            <p>Back to Vest</p>
          </div>

          <span>Create Lock</span>
        </p>

        <div className={classes.reAddPadding3}>
          {renderMassiveInput('amount', amount, amountError, onAmountChanged, govToken)}
          
          {amountError && <div
            style={{ marginTop: 20 }}
            className={[
              classes.warningContainer,
              classes[`warningContainer--${appTheme}`],
              classes.warningContainerError].join(" ")}>
            <div className={[
              classes.warningDivider,
              classes.warningDividerError
            ].join(" ")}>
            </div>
            <Typography
              className={[classes.warningError, classes[`warningText--${appTheme}`]].join(" ")}
              align="center">{amountError}</Typography>
          </div>}

          <div>
            <div className={classes.setDateRow}>
              <div className={[classes.vestPeriodToggle, 'g-flex', 'g-flex--align-center'].join(' ')}>
                <div
                  className={[classes.vestPeriodLabel, classes[`vestPeriodLabel--${selectedValue === 'week' ? 'checked' : ''}`]].join(' ')}
                  onClick={() => handleChange('week')}>
                  1 week
                </div>

                <div
                  className={[classes.vestPeriodLabel, classes[`vestPeriodLabel--${selectedValue === 'month' ? 'checked' : ''}`]].join(' ')}
                  onClick={() => handleChange('month')}>
                  1 month
                </div>

                <div
                  className={[classes.vestPeriodLabel, classes[`vestPeriodLabel--${selectedValue === 'year' ? 'checked' : ''}`]].join(' ')}
                  onClick={() => handleChange('year')}>
                  1 year
                </div>

                <div
                  className={[classes.vestPeriodLabel, classes[`vestPeriodLabel--${selectedValue === 'years' ? 'checked' : ''}`]].join(' ')}
                  onClick={() => handleChange('years')}>
                  4 years
                </div>
              </div>

              {renderMassiveDateInput('date', selectedDate, selectedDateError, handleDateChange, govToken?.balance, govToken?.logoURI)}
            </div>

            <Typography
              className={[classes.info, classes[`info--${appTheme}`]].join(" ")}
              color="textSecondary"
            >
              <img src="/images/ui/info-circle-blue.svg" />
              <span>Lock period should be multiples of 1 week (e.g. 28, 35, 42 days, etc.)</span>
            </Typography>

            {selectedDateError && <div
              style={{ marginTop: 20 }}
              className={[
                classes.warningContainer,
                classes.warningContainerError].join(" ")}>
              <div className={[
                classes.warningDivider,
                classes.warningDividerError
              ].join(" ")}>
              </div>
              <Typography className={classes.warningError} align="center">
                {selectedDateError}
              </Typography>
            </div>}
          </div>

          {renderVestInformation()}
        </div>

        <Button
          className={[
            classes.buttonOverride,
            (lockLoading ||
              amount === '' ||
              Number(amount) === 0 ||
              !isDateCorrect(selectedDate) ? classes.buttonOverrideDisabled : "")
          ].join(" ")}
          fullWidth
          variant="contained"
          size="large"
          color="primary"
          disabled={
            lockLoading ||
            amount === '' ||
            Number(amount) === 0 ||
              !isDateCorrect(selectedDate)
          }
          onClick={onLock}>
          <Typography className={classes.actionButtonText}>
            {lockLoading
              ? `Locking`
              : (lockLoading || amount === '' || Number(amount) === 0)
                ? 'Enter Lock Amount'
                : !isDateCorrect(selectedDate)
                  ? 'Wrong expiration date'
                  : `Lock Tokens & Get veCONE`
            }
          </Typography>

          {lockLoading && <CircularProgress size={10} className={classes.loadingCircle}/>}
        </Button>

        {/* {moment(selectedDate).diff(moment(), 'days') + 1} --- */}
        {/* {(moment(selectedDate).diff(moment(), 'days') + 1) % 7 === 0 ? 'nine' : 'none'}; */}
      </Paper>
    </>
  );
}
