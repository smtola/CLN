import api from "./apiClient";
import { setAuth, clearAuth } from "./authStorage";
import type { LoginPayload, LoginResponse, LogoutPayload, LogoutResponse, SignupPayload, SignupResponse, VerifyEmailPayload, VerifyEmailResponse, VerifyOTPPayload, VerifyResponse } from "./types/auth";
import { AxiosError } from "axios";

export async function signup(payload: SignupPayload) {
  try {
    const res = await api.post<SignupResponse>("/signup", payload);
    return { ...res.data, httpStatus: res.status }; // success
  } catch (error: unknown) {
    const err = error as AxiosError<{ msg?: string; status?: boolean }>;

    if (err.response?.data) {
      return {
        ...err.response.data,
        httpStatus: err.response.status,
      };
    }

    return { msg: "Something went wrong, please try again", httpStatus: 500 };
  }
}

export async function login(payload: LoginPayload) {
  try{
    const { data } = await api.post<LoginResponse>("/login", payload);
  
    if (data.access_token && data.refresh_token) {
      setAuth({ accessToken: data.access_token, refreshToken: data.refresh_token });
    }
    
    return data;
  }catch (err: unknown){
    // If API sends { msg: "Invalid credentials" }
    if (err && typeof err === 'object' && 'response' in err && 
        err.response && typeof err.response === 'object' && 'data' in err.response &&
        err.response.data && typeof err.response.data === 'object' && 'msg' in err.response.data) {
      return err.response.data as LoginResponse;
    }

    // fallback message
    return { msg: "Something went wrong, please try again" };
  }
}

export async function logout(payload?: LogoutPayload) {
  try {
    const { data } = await api.post<LogoutResponse>("/logout", payload);
    return data;
  } catch (err: unknown){
    // If API sends { msg: "Invalid credentials" }
    if (err && typeof err === 'object' && 'response' in err && 
        err.response && typeof err.response === 'object' && 'data' in err.response &&
        err.response.data && typeof err.response.data === 'object' && 'msg' in err.response.data) {
       return err.response.data as LogoutResponse;
    }

    // fallback message
    return { msg: "Something went wrong, please try again" };
  } finally {
    clearAuth();
  }
}

export async function verifyOTP(payload: VerifyOTPPayload) {
 try{
  const { data } = await api.post<VerifyResponse>("/verify-otp", payload);
  
  // Set auth after OTP verification
  if (data.access_token && data.refresh_token) {
    setAuth({ accessToken: data.access_token, refreshToken: data.refresh_token});
  }

  return data;
  }catch (err: unknown){
    // If API sends { msg: "Invalid credentials" }
    if (err && typeof err === 'object' && 'response' in err && 
        err.response && typeof err.response === 'object' && 'data' in err.response &&
        err.response.data && typeof err.response.data === 'object' && 'msg' in err.response.data) {
      return err.response.data as VerifyResponse;
    }

    // fallback message
    return { msg: "Something went wrong, please try again" };
  }
}

export async function verifyEmail(payload: VerifyEmailPayload): Promise<VerifyEmailResponse> {
  try{
    const { data } = await api.post<VerifyEmailResponse>("/verify-email", payload);
    return data;
   }catch (err: unknown){
    // If API sends { msg: "Invalid credentials" }
    if (err && typeof err === 'object' && 'response' in err && 
        err.response && typeof err.response === 'object' && 'data' in err.response &&
        err.response.data && typeof err.response.data === 'object' && 'msg' in err.response.data) {
      return err.response.data as VerifyEmailResponse;
    }

    // fallback message
    return { msg: "Something went wrong, please try again" };
  }
}

export async function resendOTP(username?: string, email?:string) {
  try{
    const { data } = await api.post<{msg?:string, status?:boolean}>("/resend-otp", { username, email });
    return data;
  }catch (err: unknown){
    // If API sends { msg: "Invalid credentials" }
    if (err && typeof err === 'object' && 'response' in err && 
        err.response && typeof err.response === 'object' && 'data' in err.response &&
        err.response.data && typeof err.response.data === 'object' && 'msg' in err.response.data) {
        return err.response.data as {msg?:string, status?:boolean};
    }

    // fallback message
    return { msg: "Something went wrong, please try again" };
  }
}


export async function fetchUsers() {
  try{
    const { data } = await api.get("/users");
    return data;
  }catch (err: unknown){
    // If API sends { msg: "Invalid credentials" }
    if (err && typeof err === 'object' && 'response' in err && 
        err.response && typeof err.response === 'object' && 'data' in err.response &&
        err.response.data && typeof err.response.data === 'object' && 'msg' in err.response.data) {
          return err.response.data as {msg?:string};
    }

    // fallback message
    return { msg: "Something went wrong, please try again" };
  }
}

