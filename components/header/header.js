import React, {useEffect, useState} from "react";
import {useRouter} from "next/router";
import BigNumber from 'bignumber.js';

import {Badge, Button, IconButton, Typography, Tooltip} from "@mui/material";
import {withStyles, withTheme} from "@mui/styles";

import Navigation from "../navigation";
import Unlock from "../unlock";
import TransactionQueue from "../transactionQueue";

import {ACTIONS} from "../../stores/constants";

import stores from "../../stores";
import {formatAddress} from "../../utils";

import classes from "./header.module.css";
import TopHeader from "../../ui/TopHeader";
import Logo from "../../ui/Logo";
import {useAppThemeContext} from '../../ui/AppThemeProvider';
import {WrongNetwork} from '../ssWrongNetwork/ssWrongNetwork';
import {WalletConnect} from "../WalletConnect/WalletConnect";
import {useEthers} from "@usedapp/core";

const {
  CONNECT_WALLET,
  ACCOUNT_CONFIGURED,
  ACCOUNT_CHANGED,
} = ACTIONS;

const StyledBadge = withStyles((theme) => ({
  badge: {
    position: 'absolute',
    top: 0,
    right: 2,
    background: "#4FC83A",
    // color: "#ffffff",
    width: 8,
    height: 8,
    minWidth: 8,
    padding: 0,
    transform: 'none',
    // fontSize: 8,
  },
}))(Badge);

const StatButton = () => {
  const {appTheme} = useAppThemeContext();

  return (
      <Tooltip
          title="Analytics"
          placement="bottom"
          componentsProps={{
            tooltip: {
              style: {
                padding: '12px 24px',
                fontFamily: 'Poppins',
                fontSize: 16,
                fontWeight: 400,
                lineHeight: '24px',
                border: '1px solid #779BF4',
                borderRadius: 12,
                background: '#1F2B49',
                color: '#E4E9F4',
              }
            },
          }}
      >
    <div
      className={[classes.statButton, classes[`statButton--${appTheme}`], 'g-flex', 'g-flex--align-center'].join(' ')}
      onClick={() => window.open("https://info.cone.exchange/home", "_blank")}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M22 22H2C1.59 22 1.25 21.66 1.25 21.25C1.25 20.84 1.59 20.5 2 20.5H22C22.41 20.5 22.75 20.84 22.75 21.25C22.75 21.66 22.41 22 22 22Z"
          fill="#779BF4" />
        <path d="M9.75 4V22H14.25V4C14.25 2.9 13.8 2 12.45 2H11.55C10.2 2 9.75 2.9 9.75 4Z" fill="#779BF4" />
        <path d="M3 10V22H7V10C7 8.9 6.6 8 5.4 8H4.6C3.4 8 3 8.9 3 10Z" fill="#779BF4" />
        <path d="M17 15V22H21V15C21 13.9 20.6 13 19.4 13H18.6C17.4 13 17 13.9 17 15Z" fill="#779BF4" />
      </svg>


      <span style={{display: 'flex', alignItems: 'center', marginLeft: 5}}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M14.4301 18.8201C14.2401 18.8201 14.0501 18.7501 13.9001 18.6001C13.6101 18.3101 13.6101 17.8301 13.9001 17.5401L19.4401 12.0001L13.9001 6.46012C13.6101 6.17012 13.6101 5.69012 13.9001 5.40012C14.1901 5.11012 14.6701 5.11012 14.9601 5.40012L21.0301 11.4701C21.3201 11.7601 21.3201 12.2401 21.0301 12.5301L14.9601 18.6001C14.8101 18.7501 14.6201 18.8201 14.4301 18.8201Z"
            fill="#586586" />
          <path
            d="M20.33 12.75H3.5C3.09 12.75 2.75 12.41 2.75 12C2.75 11.59 3.09 11.25 3.5 11.25H20.33C20.74 11.25 21.08 11.59 21.08 12C21.08 12.41 20.74 12.75 20.33 12.75Z"
            fill="#586586" />
        </svg>
      </span>
    </div>
      </Tooltip>
  )
}

function Header(props) {
  const accountStore = stores.accountStore.getStore("account");
  const web3ModalStore = stores.accountStore.getStore("web3modal");
  const router = useRouter();

  const [account, setAccount] = useState(accountStore);
  const [maticBalance, setMaticBalance] = useState();
  // const [darkMode, setDarkMode] = useState(props.theme.palette.mode === "dark",);
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [chainInvalid, setChainInvalid] = useState(false);
  // const [loading, setLoading] = useState(false);
  const [transactionQueueLength, setTransactionQueueLength] = useState(0);
  const [warningOpen, setWarningOpen] = useState(false);
  const {deactivate} = useEthers();

  const web = async (add) => {
    const maticbalance = await stores.accountStore.getWeb3Provider();
    let bal = await maticbalance.eth.getBalance(add);
    setMaticBalance(BigNumber(bal).div(10 ** 18).toFixed(2));

  };
  useEffect(() => {

    const accountConfigure = () => {
      const accountStore = stores.accountStore.getStore("account");
      if (accountStore) {
        web(accountStore);
      }
      setAccount(accountStore);
      closeUnlock();
    };
    const connectWallet = () => {
      disconnectWallet();
    };

    const accountChanged = () => {
      const invalid = stores.accountStore.getStore("chainInvalid");
      setChainInvalid(invalid);
      setWarningOpen(invalid);
    };

    const invalid = stores.accountStore.getStore("chainInvalid");
    setChainInvalid(invalid);
    setWarningOpen(invalid);

    stores.emitter.on(ACCOUNT_CONFIGURED, accountConfigure);
    stores.emitter.on(CONNECT_WALLET, connectWallet);
    stores.emitter.on(ACCOUNT_CHANGED, accountChanged);

    accountConfigure();
    return () => {
      stores.emitter.removeListener(ACCOUNT_CONFIGURED, accountConfigure);
      stores.emitter.removeListener(CONNECT_WALLET, connectWallet);
      stores.emitter.removeListener(ACCOUNT_CHANGED, accountChanged);
    };
  }, [maticBalance, accountStore?.chainId]);

  // const openWarning = () => {
  //   setWarningOpen(true);
  // };
  //
  // const closeWarning = () => {
  //   setWarningOpen(false);
  // };

  const disconnectWallet = () => {
    stores.accountStore.getStore("web3modal").clearCachedProvider();
    deactivate();
    setAccount(null);
    stores.accountStore.setStore({
      account: {address: null},
      web3provider: null,
      web3context: {
        library: {
          provider: null,
        },
      },
    });
    // stores.dispatcher.dispatch({
    //   type: ACTIONS.CONFIGURE_SS,
    //   content: {connected: false},
    // });
    window.localStorage.removeItem("walletconnect");
    window.localStorage.removeItem("WEB3_CONNECT_CACHED_PROVIDER");
    stores.accountStore.emitter.emit(ACTIONS.DISCONNECT_WALLET);
  };

  // const handleClickAway = () => {
  //   setAnchorEl(false);
  // };

  const closeUnlock = () => {
    setUnlockOpen(false);

    if (chainInvalid) {
      setWarningOpen(true);
    }
  };

  // useEffect(function () {
  //   const localStorageDarkMode = window.localStorage.getItem(
  //     "cone.finance-dark-mode",
  //   );
  //   // setDarkMode(localStorageDarkMode ? localStorageDarkMode === "dark" : true);
  // }, []);
  //
  // const navigate = (url) => {
  //   router.push(url);
  // };
  //
  // const callClaim = () => {
  //   setLoading(true);
  //   stores.dispatcher.dispatch({
  //     type: FIXED_FOREX_CLAIM_VECLAIM,
  //     content: {},
  //   });
  // };

  const switchChain = async () => {
    let hexChain = "0x" + Number(process.env.NEXT_PUBLIC_CHAINID).toString(16);
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{chainId: hexChain}],
      });
    } catch (switchError) {
      console.log("switch error", switchError);
    }
  };

  const setQueueLength = (length) => {
    setTransactionQueueLength(length);
  };

  const [anchorEl, setAnchorEl] = React.useState(false);

  const handleClick = () => {
    setAnchorEl(!anchorEl);
  };

  const [_visible, _setVisible] = useState(true);
  const _onModalClose = () => {
    _setVisible(false);
  }

  const {appTheme} = useAppThemeContext();

  return (
    <TopHeader>
      <div className={[classes.headerContainer, classes[`headerContainer--${appTheme}`]].join(' ')}>
        <div className={classes.logoContainer}>
          <a className={classes.logoLink} onClick={() => router.push("/home")}>
            <Logo />
          </a>
          {/*<Typography className={ classes.version}>version 0.0.30</Typography>*/}
        </div>

        <Navigation>
          <div className={classes.statButtonMobileWrapper}>
            {StatButton()}
          </div>
        </Navigation>

        <div className={classes.userBlock}>
          {/* {process.env.NEXT_PUBLIC_CHAINID == "80001" && (
            <div className={classes.testnetDisclaimer}>
              <Typography
                className={[classes.testnetDisclaimerText, classes[`testnetDisclaimerText--${appTheme}`]].join(' ')}>
                Mumbai Testnet
              </Typography>
            </div>
          )}
          {process.env.NEXT_PUBLIC_CHAINID == "137" && (
            <div className={classes.testnetDisclaimer}>
              <Typography
                className={[classes.testnetDisclaimerText, classes[`testnetDisclaimerText--${appTheme}`]].join(' ')}>
                Matic Mainnet
              </Typography>
            </div>
          )} */}

          {transactionQueueLength > 0 ? (
            <IconButton
              className={[classes.notificationsButton, classes[`notificationsButton--${appTheme}`]].join(' ')}
              variant="contained"
              color="primary"
              onClick={() => {
                stores.emitter.emit(ACTIONS.TX_OPEN);
              }}
            >
              <StyledBadge
                // badgeContent={transactionQueueLength}
                badgeContent={''}
                overlap="circular"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M19.3399 14.49L18.3399 12.83C18.1299 12.46 17.9399 11.76 17.9399 11.35V8.82C17.9399 6.47 16.5599 4.44 14.5699 3.49C14.0499 2.57 13.0899 2 11.9899 2C10.8999 2 9.91994 2.59 9.39994 3.52C7.44994 4.49 6.09994 6.5 6.09994 8.82V11.35C6.09994 11.76 5.90994 12.46 5.69994 12.82L4.68994 14.49C4.28994 15.16 4.19994 15.9 4.44994 16.58C4.68994 17.25 5.25994 17.77 5.99994 18.02C7.93994 18.68 9.97994 19 12.0199 19C14.0599 19 16.0999 18.68 18.0399 18.03C18.7399 17.8 19.2799 17.27 19.5399 16.58C19.7999 15.89 19.7299 15.13 19.3399 14.49Z" />
                  <path
                    d="M14.8301 20.01C14.4101 21.17 13.3001 22 12.0001 22C11.2101 22 10.4301 21.68 9.88005 21.11C9.56005 20.81 9.32005 20.41 9.18005 20C9.31005 20.02 9.44005 20.03 9.58005 20.05C9.81005 20.08 10.0501 20.11 10.2901 20.13C10.8601 20.18 11.4401 20.21 12.0201 20.21C12.5901 20.21 13.1601 20.18 13.7201 20.13C13.9301 20.11 14.1401 20.1 14.3401 20.07C14.5001 20.05 14.6601 20.03 14.8301 20.01Z" />
                </svg>

                {/* <NotificationsNoneOutlined
                  style={{
                    width: 20,
                    height: 20,
                    color: "#779BF4",
                    // color: appTheme === "dark" ? '#4CADE6' : '#0B5E8E',
                  }}
                  /> */}
              </StyledBadge>
            </IconButton>
          ) : (
            <IconButton
              className={[classes.notificationsButton, classes.notificationsButtonDisabled].join(' ')}
              variant="contained"
              color="primary"
            >
              <StyledBadge overlap="circular">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M19.3399 14.49L18.3399 12.83C18.1299 12.46 17.9399 11.76 17.9399 11.35V8.82C17.9399 6.47 16.5599 4.44 14.5699 3.49C14.0499 2.57 13.0899 2 11.9899 2C10.8999 2 9.91994 2.59 9.39994 3.52C7.44994 4.49 6.09994 6.5 6.09994 8.82V11.35C6.09994 11.76 5.90994 12.46 5.69994 12.82L4.68994 14.49C4.28994 15.16 4.19994 15.9 4.44994 16.58C4.68994 17.25 5.25994 17.77 5.99994 18.02C7.93994 18.68 9.97994 19 12.0199 19C14.0599 19 16.0999 18.68 18.0399 18.03C18.7399 17.8 19.2799 17.27 19.5399 16.58C19.7999 15.89 19.7299 15.13 19.3399 14.49Z" />
                  <path
                    d="M14.8301 20.01C14.4101 21.17 13.3001 22 12.0001 22C11.2101 22 10.4301 21.68 9.88005 21.11C9.56005 20.81 9.32005 20.41 9.18005 20C9.31005 20.02 9.44005 20.03 9.58005 20.05C9.81005 20.08 10.0501 20.11 10.2901 20.13C10.8601 20.18 11.4401 20.21 12.0201 20.21C12.5901 20.21 13.1601 20.18 13.7201 20.13C13.9301 20.11 14.1401 20.1 14.3401 20.07C14.5001 20.05 14.6601 20.03 14.8301 20.01Z" />
                </svg>
              </StyledBadge>
            </IconButton>
          )}

          <div className={classes.network}>
            <img src="/images/ui/network.png" />
          </div>

          {account? (
            <div className={classes.accountButtonContainer}>
              <Button
                disableElevation
                className={[
                  classes.accountButton, classes[`accountButton--${appTheme}`],
                  anchorEl ? classes.accountButtonActive : '',
                ].join(' ')}
                variant="contained"
                aria-controls="simple-menu"
                aria-haspopup="true"
                onClick={handleClick}
              >
                <div
                  className={[classes.accountButtonAddress, classes[`accountButtonAddress--${appTheme}`], 'g-flex', 'g-flex--align-center'].join(' ')}>
                  {account&& (
                    <>
                      <div
                        className={`${classes.accountIcon} ${web3ModalStore?.cachedProvider === 'walletconnect' ? 
                          classes.walletConnect : 
                          (web3ModalStore?.cachedProvider === 'walletlink' ? classes.coinbase : classes.metamask)}`}
                        style={{marginRight: 8}}>
                      </div>

                      {/* <div
                        style={{
                          marginLeft: 5,
                          marginRight: 5,
                          color: appTheme === "dark" ? '#ffffff' : '#0B5E8E',
                        }}
                      >
                        •
                      </div> */}
                    </>
                  )}
                  <Typography className={classes.headBtnTxt}>
                    <span className={classes.headBtnTxtDesktop}>
                      {account
                        ? formatAddress(account)
                        : "Connect Wallet"}
                    </span>
                    <span className={classes.headBtnTxtMobile}>
                      {account
                        ? formatAddress(account, "shortest")
                        : "Connect Wallet"}
                    </span>
                  </Typography>
                </div>

                <Typography
                  className={[classes.headBalanceTxt, classes[`headBalanceTxt--${appTheme}`], 'g-flex', 'g-flex--align-center'].join(' ')}>
                  {maticBalance ? maticBalance : 0} BNB
                </Typography>
              </Button>

              {anchorEl &&

                <div
                  className={[classes.headSwitchBtn, classes[`headSwitchBtn--${appTheme}`], 'g-flex', 'g-flex--align-center'].join(' ')}
                  onClick={disconnectWallet}>
                  <img
                    src="/images/ui/wallet.svg"
                    width={24}
                    className={classes.walletIcon}
                    style={{marginBottom: 2}}
                  />

                  <div style={{
                    marginLeft: 5,
                    marginRight: 5,
                    color: '#ffffff',
                  }}>
                    •
                  </div>

                  <div className={classes.headSwitchBtnText}>
                    Disconnect Wallet
                  </div>
                </div>
              }
            </div>
          ) : (
            <WalletConnect>
              {({connect}) => {
                return (
                  <Button
                    onClick={connect}
                    className={classes.connectButton}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M18.04 13.55C17.62 13.96 17.38 14.55 17.44 15.18C17.53 16.26 18.52 17.05 19.6 17.05H21.5V18.24C21.5 20.31 19.81 22 17.74 22H6.26C4.19 22 2.5 20.31 2.5 18.24V11.51C2.5 9.44001 4.19 7.75 6.26 7.75H17.74C19.81 7.75 21.5 9.44001 21.5 11.51V12.95H19.48C18.92 12.95 18.41 13.17 18.04 13.55Z"
                        stroke="#D3F85A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path
                        d="M2.5 12.41V7.84004C2.5 6.65004 3.23 5.59 4.34 5.17L12.28 2.17C13.52 1.7 14.85 2.62003 14.85 3.95003V7.75002"
                        stroke="#D3F85A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path
                        d="M22.5588 13.9702V16.0302C22.5588 16.5802 22.1188 17.0302 21.5588 17.0502H19.5988C18.5188 17.0502 17.5288 16.2602 17.4388 15.1802C17.3788 14.5502 17.6188 13.9602 18.0388 13.5502C18.4088 13.1702 18.9188 12.9502 19.4788 12.9502H21.5588C22.1188 12.9702 22.5588 13.4202 22.5588 13.9702Z"
                        stroke="#D3F85A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M7 12H14" stroke="#D3F85A" strokeWidth="1.5" strokeLinecap="round"
                            strokeLinejoin="round" />
                    </svg>

                    <span style={{marginLeft: 15, whiteSpace: 'nowrap',}}>Connect Wallet</span>
                  </Button>
                )
              }}
            </WalletConnect>

            // <Button
            //   style={{
            //     marginLeft: !account?.address ? 14 : 0,
            //   }}
            //   disableElevation
            //   className={[classes.accountButton, classes[`accountButton--${appTheme}`], !account?.address ? classes[`accountButtonConnect--${appTheme}`] : ''].join(' ')}
            //   variant="contained"
            //   onClick={onAddressClicked}
            // >
            //   {account && account.address && (
            //     <div
            //       className={`${classes.accountIcon} ${classes.metamask}`}
            //     ></div>
            //   )}

            //   {!account?.address && (
            //     <img src="/images/ui/icon-wallet.svg" className={classes.walletIcon}/>
            //   )}

            //   <div className={classes.walletPointContainer}>
            //     <div className={[classes.walletPoint, classes[`walletPoint--${appTheme}`]].join(' ')}>
            //     </div>
            //   </div>

            //   <Typography
            //     className={classes.headBtnTxt}>
            //     {account && account.address
            //       ? formatAddress(account.address)
            //       : "Connect Wallet"}
            //   </Typography>
            // </Button>
          )}

          <div className={classes.statButtonDesktopWrapper}>
            {StatButton()}
          </div>

          {/* <ThemeSwitcher/> */}

        </div>
        {unlockOpen && (
          <Unlock modalOpen={unlockOpen} closeModal={closeUnlock} />
        )}
        <TransactionQueue setQueueLength={setQueueLength} />
      </div>

      {warningOpen &&
        <WrongNetwork visible={_visible} onClose={_onModalClose} onSwitch={switchChain} />

        // <SSWarning
        //   close={switchChain}
        //   title={'Wrong Network:'}
        //   subTitle={'The chain you are connected is not supported!'}
        //   icon={'icon-network'}
        //   description={'Please check that your wallet is connected to Polygon Mainnet, only after you can proceed.'}
        //   btnLabel1={'Switch to Polygon Mainnet'}
        //   btnLabel2={'Switch Wallet Provider'}
        //   action2={onAddressClicked}/>
      }
    </TopHeader>
  );
}

export default withTheme(Header);
