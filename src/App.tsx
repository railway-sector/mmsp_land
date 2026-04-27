import { useState, useEffect } from "react";
import OAuthInfo from "@arcgis/core/identity/OAuthInfo";
import IdentityManager from "@arcgis/core/identity/IdentityManager";
import Portal from "@arcgis/core/portal/Portal";
import "./index.css";
import MapDisplay from "./components/MapDisplay";
import ActionPanel from "./components/ActionPanel";
import Header from "./components/Header";
import MainChart from "./components/MainChart";
import { MyContext } from "./contexts/MyContext";
import { latest_date } from "./uniqueValues";
import FeatureLayerView from "@arcgis/core/views/layers/FeatureLayerView";

export function App(): React.JSX.Element {
  const [loggedInState, setLoggedInState] = useState<boolean>(false);
  useEffect(() => {
    // Useful video: https://www.google.com/search?sca_esv=41638d9270b90df6&rlz=1C1CHBF_enPH1083PH1083&udm=7&fbs=AIIjpHxU7SXXniUZfeShr2fp4giZud1z6kQpMfoEdCJxnpm_3W-pLdZZVzNY_L9_ftx08kwv-_tUbRt8pOUS8_MjaceHuSAD6YvWZ0rfFzwmtmaBgLepZn2IJkVH-w3cPU5sPVz9l1Pp06apNShUnFfpGUJOF8p91U6HxH3ukND0OVTTVy0CGuHNdViLZqynGb0mLSRGeGVO46qnJ_2yk3F0uV6R6BW9rQ&q=apply+user+authentication+using+arcgis+maps+sdk+for+javascript+for+arcgis+enterprise&sa=X&ved=2ahUKEwjVqZbdlLKQAxUtmq8BHVQQCHcQtKgLegQIGRAB&biw=1920&bih=911&dpr=1#fpstate=ive&vld=cid:fcf356be,vid:hQH9d1vc8Gc,st:0
    // check app authentication: https://developers.arcgis.com/documentation/security-and-authentication/app-authentication/how-to-implement-app-authentication/
    const info = new OAuthInfo({
      appId: "GYpYnxk4m4HlEI34",
      popup: false,
      portalUrl: "https://gis.railway-sector.com/portal",
    });

    IdentityManager.registerOAuthInfos([info]);
    async function loginAndLoadPortal() {
      try {
        await IdentityManager.checkSignInStatus(info.portalUrl + "/sharing");
        const portal: any = new Portal({
          // access: "public",
          url: info.portalUrl,
          authMode: "no-prompt",
        });
        portal.load().then(() => {
          setLoggedInState(true);
          console.log("Logged in as: ", portal.user.username);
        });
      } catch (error) {
        console.error("Authentication error:", error);
        IdentityManager.getCredential(info.portalUrl);
      }
    }
    loginAndLoadPortal();
  }, []);

  const [contractp, setContractPackage] = useState<any>();
  const [landtype, setLandtype] = useState<any>();
  const [landsection, setLandsection] = useState<any>();
  const [statusdate, setStatusdate] = useState<any>(latest_date);
  const [timesliderstate, setTimesliderstate] = useState<FeatureLayerView>();
  const [chartPanelwidth, setChartPanelwidth] = useState<any>();
  const [backgroundcolorSwitch, setBackgroundcolorSwitch] =
    useState<boolean>(false);
  const [asofdate, setAsofdate] = useState<any>();
  const [latestasofdate, setLatestasofdate] = useState<any>();
  const [statusdatefield, setStatusdatefield] = useState<any>();
  const [datefields, setDatefields] = useState<any>();
  const [newHandedoverJVfield, setNewHandedoverJVfield] = useState<any>();
  const [newHandedoverNYfield, setNewHandedoverNYfield] = useState<any>();

  const updateContractcps = (newContractcp: any) => {
    setContractPackage(newContractcp);
  };

  const updateLandtype = (newCompany: any) => {
    setLandtype(newCompany);
  };

  const updateLandsection = (newPtLineType: any) => {
    setLandsection(newPtLineType);
  };

  const updateAsofdate = (newAsofdate: any) => {
    setAsofdate(newAsofdate);
  };

  const updateStatusdate = (newStatusDate: any) => {
    setStatusdate(newStatusDate);
  };

  const updateTimesliderstate = (newState: any) => {
    setTimesliderstate(newState);
  };

  const updateChartPanelwidth = (newWidth: any) => {
    setChartPanelwidth(newWidth);
  };

  const updateBackgroundcolorSwitch = (newColor: any) => {
    setBackgroundcolorSwitch(newColor);
  };

  const updateLatestasofdate = (newLatestasofdate: any) => {
    setLatestasofdate(newLatestasofdate);
  };

  const updateStatusdatefield = (newStatusdatefield: any) => {
    setStatusdatefield(newStatusdatefield);
  };

  const updateDatefields = (newDatefields: any) => {
    setDatefields(newDatefields);
  };

  const updateNewHandedoverJVfield = (newHandedoverJVfield: any) => {
    setNewHandedoverJVfield(newHandedoverJVfield);
  };

  const updateNewHandedoverNYfield = (newHandedoverNYfield: any) => {
    setNewHandedoverNYfield(newHandedoverNYfield);
  };

  return (
    <>
      {loggedInState && (
        <calcite-shell
          style={{ scrollbarWidth: "thin", scrollbarColor: "#888 #555" }}
        >
          <MyContext
            value={{
              contractp,
              landtype,
              landsection,
              statusdate,
              timesliderstate,
              chartPanelwidth,
              backgroundcolorSwitch,
              asofdate,
              latestasofdate,
              statusdatefield,
              datefields,
              newHandedoverJVfield,
              newHandedoverNYfield,
              updateContractcps,
              updateLandtype,
              updateLandsection,
              updateAsofdate,
              updateLatestasofdate,
              updateStatusdate,
              updateTimesliderstate,
              updateChartPanelwidth,
              updateBackgroundcolorSwitch,
              updateDatefields,
              updateStatusdatefield,
              updateNewHandedoverJVfield,
              updateNewHandedoverNYfield,
            }}
          >
            <Header />
            <ActionPanel />
            <MapDisplay />
            <MainChart />
          </MyContext>
        </calcite-shell>
      )}
    </>
  );
}

export default App;
