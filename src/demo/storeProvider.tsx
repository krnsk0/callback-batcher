import {
  ModelAutoTypeCheckingMode,
  registerRootStore,
  setGlobalConfig,
} from 'mobx-keystone';
import { Root } from './store';
import React from 'react';

setGlobalConfig({
  modelAutoTypeChecking: ModelAutoTypeCheckingMode.AlwaysOn,
  showDuplicateModelNameWarnings: true,
});

const root = new Root({});
registerRootStore(root);

const StoreContext = React.createContext<Root>(root);

export const useStore = () => {
  const store = React.useContext(StoreContext);
  return store;
};

export const StoreProvider = ({
  children,
}: React.PropsWithChildren<Record<string, unknown>>) => {
  return <StoreContext.Provider value={root}>{children}</StoreContext.Provider>;
};
