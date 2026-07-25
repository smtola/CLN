export interface User {
  _id: { $oid: string };
  username: string;
  email: string;
  data: {
    uai: {
      firstName: string;
      lastName: string;
      businessEmail: string;
    }
  }
  uai: {
    firstName: string;
    lastName: string;
    businessEmail: string;
  }
  role: "USER" | "ADMIN";
  profile?: string;
  is_verified: boolean;
  is_deleted: boolean;
}


export interface Profile {
  uai: {
    firstName: string;
    lastName: string;
    jobTitle?: string;
    phoneNumber?: string;
    businessEmail: string;
    userId: string;
    pwd: string;
    cpwd: string;
  };
  ci: {
    companyName?: string;
    companyRegisterNumber?: string;
    localLang?: string;
    tradeName?: string;
    SPT?: string;
    CBT?: string;
    address?: string;
    city?: string;
    country?: string;
    zipCode?: string;
    department?: string;
    trade?: string;
  };
  ai: {
    contact?: string;
    comment?: string;
  };
  role?: "USER" | "ADMIN";
  local_ip?: string;
  is_verified?: boolean;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface UserType {
  _id: { $oid: string };

  uai: {
    firstName: string;
    lastName: string;
    jobTitle: string;
    phoneNumber: string;
    businessEmail: string;
    userId: string;
    pwd: string;
    cpwd: string;
  };

  ci: {
    companyName: string;
    companyRegisterNumber: string;
    localLang: string;
    tradeName: string;
    SPT: string;
    CBT: string;
    address: string;
    city: string;
    country: string;
    zipCode: string;
    department: string;
    trade: string;
  };

  ai: {
    contact: string;
    comment: string;
  };

  role: "USER" | "ADMIN";
  requires_otp: boolean;
  is_verified: boolean;
  is_deleted: boolean;
  public_ip: string;
  local_ip: string;
  device_info: {
    browser: string;
    os: string;
    device: string;
  };
  location: {
    city: string;
    region: string;
    country: string;
    latitude: number;
    longitude: number;
  };
}

export interface SignupResponse {
  user?: User;
  is_verified?: boolean;
  access_token?:string;
  refresh_token?:string;
  msg:string;
  httpStatus?:number;
  status: true | false;
}

export interface LoginResponse{
  requiresOtp?: boolean;
  access_token?:string;
  refresh_token?:string;
  msg?: string;
  user?: User;
  businessEmail?: string;
  status?:boolean;
}

export interface VerifyResponse{
  msg?:string;
  access_token?:string;
  refresh_token?:string;
  user?: User;
  status?:boolean;
}

export interface LogoutResponse{
  msg?:string;
  access_token?:string;
  refresh_token?:string;
  user?: User;
  status?:boolean;
}

export interface ApiError {
  msg: string;
  statusCode?: number;
}

export interface LoginPayload {
  businessEmail: string;
  password: string;
  local_ip: string;
  ip?:string;
  msg?:string;
  status?:boolean;
}

export interface ExtractedDocumentFields {
  tin?: string | null;
  companyName?: string | null;
}

export interface ExtractDocumentResponse {
  status?: boolean;
  msg?: string;
  data?: ExtractedDocumentFields;
}

export interface SignupDocument {
  url?: string;
  fileName?: string;
  extracted?: ExtractedDocumentFields;
  is_ocr_verified?: boolean;
}

export interface SignupPayload {
  uai: {
    firstName: string;
    lastName: string;
    jobTitle?: string;
    phoneNumber?: string;
    businessEmail: string;
    userId: string;
    pwd: string;
    cpwd: string;
  };
  ci: {
    companyName?: string;
    companyRegisterNumber?: string;
    localLang?: string;
    tradeName?: string;
    SPT?: string;
    CBT?: string;
    address?: string;
    city?: string;
    country?: string;
    zipCode?: string;
    department?: string;
    trade?: string;
  };
  ai?: {
    contact?: string;
    comment?: string;
  };
  document?: SignupDocument;
  role?: "USER" | "ADMIN";
  local_ip?: string;
}


export interface LogoutPayload {
  msg?:string;
  access_token?:string;
  refresh_token?:string;
  user?: User;
  status?:boolean;
}

export interface VerifyEmailPayload {
  businessEmail?:string;
  username?: string;
  otp?: string;
  msg?: string;
  status?:boolean;
}

export interface VerifyOTPPayload{
  businessEmail:string;
  otp:string;
  msg?:string;
  access_token?:string;
  refresh_token?:string;
  status?:boolean;
  user?: User;
}

export interface VerifyEmailResponse {
  msg?: string;
  token?: string;
  access_token?:string;
  refresh_token?:string;
  status?:boolean;
  user?:User;
}

export interface DecodeToken{
  sub?:string;
  username: string;
  user?:User;
  email:string;
  role: "USER" | "ADMIN";
  isVerify:boolean;
}