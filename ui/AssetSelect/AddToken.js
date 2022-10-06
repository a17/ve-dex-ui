import React from "react";
import classes from "./AssetSelect.module.css";

export const AddToken = (props) => {
  const { value, onClose } = props;

  const handleClick = () => {
    handleAddToMM(value);
    onClose();
  }

  const handleAddToMM = async (value) => {
    try {
      await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: value.address,
            symbol: value.symbol,
            decimals: value.decimals,
            image: value.logoURI,
          },
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className={classes.tokenPopover_button} onClick={handleClick}>
      <img src="/connectors/icn-metamask.svg" width="16" />
      <span>add to the wallet</span>
    </div>
  );
};
