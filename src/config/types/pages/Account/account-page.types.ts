import { AccountHomePageConfigV1 } from "./account-home-page.types";
import { AccountLoginPageConfigV1 } from "./login-page.types";
import { AccountRegisterPageConfigV1 } from "./register-page.types";

export type AccountPageConfigV1 = {
  version: 1;

  pages?: {
    login?: AccountLoginPageConfigV1;
    register?: AccountRegisterPageConfigV1;
    account?: AccountHomePageConfigV1; // for later (main account page)
  };
};
