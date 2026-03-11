import { createContext } from "react";

type MyDropdownContextType = {
  contractp: any;
  landtype: any;
  landsection: any;
  statusdate: any;
  timesliderstate: any;
  updateContractcps: any;
  updateLandtype: any;
  updateLandsection: any;
  updateStatusdate: any;
  updateTimesliderstate: any;
};

const initialState = {
  contractp: undefined,
  landtype: undefined,
  landsection: undefined,
  statusdate: undefined,
  timesliderstate: undefined,
  updateContractcps: undefined,
  updateLandtype: undefined,
  updateLandsection: undefined,
  updateStatusdate: undefined,
  updateTimesliderstate: undefined,
};

export const MyContext = createContext<MyDropdownContextType>({
  ...initialState,
});
