import Cookies from "js-cookie";

// Define session password

// const sessionPassword = process.env.session_password as string;
// if (!sessionPassword) throw new Error("SESSION_PASSWORD is not set");
// Define session functions
export async function getSession(): Promise<string | null> {
  const token = Cookies.get("access_token");
  if (!token) return null;
  return token;
}

export async function getRefreshToken(): Promise<string | null> {
  const token = Cookies.get("refresh_token");
  if (!token) return null;
  return token;
}

export async function setSession(token: string) {
  try {
    // Set cookie expiration time (e.g., expires in 7 days)
    const expires = new Date();
    expires.setDate(expires.getDate() + 7); // Expires in 7 days
    Cookies.set("access_token", token, {
      expires, // Set expiration time
      // sameSite: "strict",
      // httpOnly: true,
      // secure: process.env.NODE_ENV !== "development",
    });
  } catch (error) {}
}

export async function setRefreshToken(token: string) {
  try {
    // Set cookie expiration time (e.g., expires in 7 days)
    const expires = new Date();
    expires.setDate(expires.getDate() + 7); // Expires in 7 days
    Cookies.set("refresh_token", token, {
      expires, // Set expiration time
      // sameSite: "strict",
      // httpOnly: true,
      // secure: process.env.NODE_ENV !== "development",
    });
  } catch (error) {}
}

export async function removeSession() {
  Cookies.set("access_token", "", {
    // sameSite: "strict",
    // httpOnly: true,
    // secure: process.env.NODE_ENV !== "development"
  });
  Cookies.set("refresh_token", "", {
    // sameSite: "strict",
    // httpOnly: true,
    // secure: process.env.NODE_ENV !== "development"
  });
}

// Example usage of axiosInstance with token
