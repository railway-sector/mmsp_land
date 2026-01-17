import { createContext } from "react";

type MyDropdownContextType = {
  contractp: any;
  landtype: any;
  landsection: any;
  updateContractcps: any;
  updateLandtype: any;
  updateLandsection: any;
};

const initialState = {
  contractp: undefined,
  landtype: undefined,
  landsection: undefined,
  updateContractcps: undefined,
  updateLandtype: undefined,
  updateLandsection: undefined,
};

export const MyContext = createContext<MyDropdownContextType>({
  ...initialState,
});
