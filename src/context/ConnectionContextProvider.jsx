import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";
import ConnectContext from "./ConnectionContext.js";

const ConnectionContextProvider = ({ children }) => {
  // Initial state definitions
  const initialSigner = {};
  const initialUserInfo = {};

  // State management
  const [isConnect, setIsConnect] = useState(false);
  const [signer, setSigner] = useState(initialSigner);
  const [userInfo, setUserInfo] = useState(initialUserInfo);

  // Memoize context value to optimize re-renders
  const contextValue = useMemo(
    () => ({
      signer,
      setSigner,
      userInfo,
      setUserInfo,
      isConnect,
      setIsConnect,
    }),
    [signer, userInfo, isConnect]
  );

  return (
    <ConnectContext.Provider value={contextValue}>
      {children}
    </ConnectContext.Provider>
  );
};

// Prop validation
ConnectionContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ConnectionContextProvider;
