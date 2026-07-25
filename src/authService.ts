import api from "./apiClient";
import { setAuth, clearAuth } from "./authStorage";
import type { ExtractDocumentResponse, LoginPayload, LoginResponse, LogoutPayload, LogoutResponse, SignupPayload, SignupResponse, VerifyEmailPayload, VerifyEmailResponse, VerifyOTPPayload, VerifyResponse } from "./types/auth";
import { AxiosError } from "axios";

// -------------------- Signup: Document Upload / OCR --------------------
// Sends the uploaded business registration / TIN document to the backend,
// which OCRs it and returns the fields we can auto-fill in Step 2 of the
// signup form (tin, companyName, address, city, country).
export async function extractDocument(file: File): Promise<ExtractDocumentResponse> {
  try {
    const formData = new FormData();
    formData.append("document", file);

    const res = await api.post<ExtractDocumentResponse>("/auth/extract-document", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      skipGlobalErrorToast: true,
    });

    return { ...res.data, status: true };
  } catch (error: unknown) {
    const err = error as AxiosError<{ msg?: string; status?: boolean }>;

    if (err.response?.data) {
      return { ...err.response.data, status: false };
    }

    return {
      msg: "Could not process the document. Please try again.",
      status: false,
    };
  }
}

// -------------------- Signup: Document Upload (server-side R2 proxy) --------------------
// Uploads the verified document through the backend rather than straight
// from the browser to R2. This avoids R2 CORS configuration entirely (it's
// a server-to-server call) and keeps storage credentials off the client.
export async function uploadDocument(file: File): Promise<{ status: boolean; msg?: string; url?: string }> {
  try {
    const formData = new FormData();
    formData.append("document", file);

    const res = await api.post<{ status: boolean; msg?: string; data?: { url: string } }>(
      "/auth/upload-document",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        skipGlobalErrorToast: true,
      }
    );

    return { status: true, msg: res.data.msg, url: res.data.data?.url };
  } catch (error: unknown) {
    const err = error as AxiosError<{ msg?: string }>;

    return {
      status: false,
      msg: err.response?.data?.msg || "Could not upload the document. Please try again.",
    };
  }
}

export async function signup(payload: SignupPayload) {
  try {
    const res = await api.post<SignupResponse>("/auth/signup", payload);
    return { ...res.data, httpStatus: res.status, status: true }; // success
  } catch (error: unknown) {
    const err = error as AxiosError<{ msg?: string; status?: boolean }>;

    if (err.response?.data) {
      return {
        ...err.response.data,
        httpStatus: err.response.status,
      };
    }

    return {
      msg: err.response?.data?.msg || "Something went wrong",
      httpStatus: err.response?.status || 500,
      status: false
    };
  }
}

export async function login(payload: LoginPayload) {
  try{
    const { data } = await api.post<LoginResponse>("/auth/login", payload);
  
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
    const { data } = await api.post<LogoutResponse>("/auth/logout", payload);
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
  const { data } = await api.post<VerifyResponse>("/auth/verify-otp", payload);
  
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
    const { data } = await api.post<VerifyEmailResponse>("/auth/verify-email", payload);
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
      return err.response.data as VerifyEmailResponse;
    }

    // fallback message
    return { msg: "Something went wrong, please try again" };
  }
}

export async function resendOTP(businessEmail?:string) {
  try{
    const { data } = await api.post<{msg?:string, status?:boolean}>("/auth/resend-otp", {businessEmail});
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

export async function checkPassword(current_password: string) {
  try {
    const token = localStorage.getItem("accessToken");
    
    const { data } = await api.post(
      "/auth/check-password",
      { current_password }, // <-- send body
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return data;
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "response" in err &&
      err.response &&
      typeof err.response === "object" &&
      "data" in err.response &&
      err.response.data &&
      typeof err.response.data === "object" &&
      "msg" in err.response.data
    ) {
      return err.response.data as { msg?: string };
    }

    return { msg: "Something went wrong, please try again" };
  }
}

export async function changePassword(
  current_password: string,
  new_password: string,
  confirm_password: string
) {
  try {
    const token = localStorage.getItem("accessToken");

    const { data } = await api.post(
      "/auth/change-password", // <-- call the actual change-password endpoint
      {
        current_password,
        new_password,
        confirm_password
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return data;
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "response" in err &&
      err.response &&
      typeof err.response === "object" &&
      "data" in err.response &&
      err.response.data &&
      typeof err.response.data === "object" &&
      "message" in err.response.data
    ) {
      return err.response.data as { message?: string; status?: boolean };
    }

    return { message: "Something went wrong, please try again", status: false };
  }
}

export async function changeRole(
  _id: string,
  role: string
): Promise<{ message?: string; status?: boolean }> {
  try {
    const token = localStorage.getItem("accessToken");

    const { data } = await api.put(
      `/auth/change-role/${_id}`, // ✅ correct endpoint usage
      { role },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return data;
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "response" in err &&
      err.response &&
      typeof err.response === "object" &&
      "data" in err.response &&
      err.response.data &&
      typeof err.response.data === "object" &&
      "message" in err.response.data
    ) {
      return err.response.data as { message?: string; status?: boolean };
    }
    return { message: "Something went wrong. Please try again", status: false };
  }
}
// -------------------- Forgot Password --------------------
export async function forgotPassword(email: string) {
  try {
    const { data } = await api.post("/auth/forgot-password", { email });
    return data;
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "response" in err &&
      err.response &&
      typeof err.response === "object" &&
      "data" in err.response &&
      err.response.data &&
      typeof err.response.data === "object" &&
      "message" in err.response.data
    ) {
      return err.response.data as { message?: string; status?: boolean };
    }
    return { message: "Something went wrong. Please try again", status: false };
  }
}

// -------------------- Reset Password --------------------
export async function resetPassword(
  token: string,
  new_password: string,
  confirm_password: string
) {
  try {
    const { data } = await api.post("/auth/reset-password", {
      token,
      new_password,
      confirm_password,
    });
    return data;
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "response" in err &&
      err.response &&
      typeof err.response === "object" &&
      "data" in err.response &&
      err.response.data &&
      typeof err.response.data === "object" &&
      "message" in err.response.data
    ) {
      return err.response.data as { message?: string; status?: boolean };
    }
    return { message: "Something went wrong. Please try again", status: false };
  }
}

export async function fetchUsers() {
  try {
    const token = localStorage.getItem("accessToken");
    
    const { data } = await api.get("/auth/users", {
      headers: { Authorization: `Bearer ${token}` },
    });    
    
    return data;
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "response" in err &&
      err.response &&
      typeof err.response === "object" &&
      "data" in err.response &&
      err.response.data &&
      typeof err.response.data === "object" &&
      "msg" in err.response.data
    ) {
      return err.response.data as { msg?: string };
    }

    return { msg: "Something went wrong, please try again" };
  }
}

export async function fetchProfile() {
  try {
    const token = localStorage.getItem("accessToken");
    
    const { data } = await api.get("/auth/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });    
    
    return data;
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "response" in err &&
      err.response &&
      typeof err.response === "object" &&
      "data" in err.response &&
      err.response.data &&
      typeof err.response.data === "object" &&
      "msg" in err.response.data
    ) {
      return err.response.data as { msg?: string };
    }

    return { msg: "Something went wrong, please try again" };
  }
}


