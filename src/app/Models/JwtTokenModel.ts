import { TokenModel } from "./TokenModel"

export interface JwtTokenModel {
  accessToken: TokenModel;
  requiredAuthenticatorType: null;
}
  