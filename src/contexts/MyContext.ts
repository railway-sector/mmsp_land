import { createContext } from "react";

type MyDropdownContextType = {
  contractp: any;
  landtype: any;
  landsection: any;
  statusdate: any;
  timesliderstate: any;
  chartPanelwidth: any;
  backgroundcolorSwitch: any;
  asofdate: any;
  latestasofdate: any;
  datefields: any;
  statusdatefield: any;
  newHandedoverJVfield: any;
  newHandedoverNYfield: any;
  updateContractcps: any;
  updateLandtype: any;
  updateLandsection: any;
  updateAsofdate: any;
  updateLatestasofdate: any;
  updateStatusdate: any;
  updateTimesliderstate: any;
  updateChartPanelwidth: any;
  updateBackgroundcolorSwitch: any;
  updateDatefields: any;
  updateStatusdatefield: any;
  updateNewHandedoverJVfield: any;
  updateNewHandedoverNYfield: any;
};

const initialState = {
  contractp: undefined,
  landtype: undefined,
  landsection: undefined,
  statusdate: undefined,
  timesliderstate: undefined,
  chartPanelwidth: undefined,
  backgroundcolorSwitch: undefined,
  asofdate: undefined,
  latestasofdate: undefined,
  datefields: undefined,
  statusdatefield: undefined,
  newHandedoverJVfield: undefined,
  newHandedoverNYfield: undefined,
  updateContractcps: undefined,
  updateLandtype: undefined,
  updateLandsection: undefined,
  updateLatestasofdate: undefined,
  updateStatusdate: undefined,
  updateTimesliderstate: undefined,
  updateChartPanelwidth: undefined,
  updateBackgroundcolorSwitch: undefined,
  updateAsofdate: undefined,
  updateDatefields: undefined,
  updateStatusdatefield: undefined,
  updateNewHandedoverJVfield: undefined,
  updateNewHandedoverNYfield: undefined,
};

export const MyContext = createContext<MyDropdownContextType>({
  ...initialState,
});
