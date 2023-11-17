export default {
  // codes
  SUCCESS_CODE: 200,
  CREATED_CODE: 201,
  BAD_REQUEST_CODE: 400,
  UNAUTHORIZED_CODE: 401,
  NOT_FOUND_CODE: 404,
  FORBIDDEN_CODE: 403,
  INTERNAL_SERVER_ERROR_CODE: 500,

  // messages
  SUCCESS_MSG: "Success",
  CREATED_MSG: "Created",
  BAD_REQUEST_MSG: "Bad Request",
  UNAUTHORIZED_MSG: "Unauthorized",
  NOT_FOUND_MSG: "Not Found",
  INTERNAL_SERVER_ERROR_MSG: "Something went wrong...",
  FILE_NOT_UPLOADED: "File not uploaded",
  FILE_TOO_LARGE: "File too large",
  LOGIN_SUCCESS: "Login successful",
  RESET_PASSWORD_EMAIL_SENT: "Reset password email sent",
  PASSWORD_RESET_SUCCESS: "Password reset successful",
  IMAGE_UPLOADED: "Image uploaded",
  VERIFICATION_CODE_SENT: "Verification code sent",
  PHONE_VERIFIED: "Phone verified",
  ACCOUNT_NOT_APPROVED: "Account not approved",
  DOCTOR_NOT_AVAILABLE: "Doctor not available at this time",

  // error messages
  INVALID_EMAIL: "Invalid email",
  INVALID_PASSWORD: "Invalid password",
  INVALID_CODE: "Invalid code",

  // user
  USER_NOT_FOUND: "User not found",
  USER_ALREADY_EXISTS: "User already exists",
  USER_CREATED: "User created",
  USER_DELETED: "User deleted",

  // auth
  AUTH_SUCCESS: "Authentication successful",
  AUTH_FAILED: "Authentication failed",
  AUTH_REQUIRED: "Authentication required",
  AUTH_HEADER_NAME: "X-Auth-Token",

  // email verification
  EMAIL_VERIFIED: "Email verified successfully",
  EMAIL_ALREADY_VERIFIED: "Email already verified",
  VERIFICATION_EMAIL_SENT: "Verification email sent",

  // jwt
  INVALID_TOKEN: "Invalid token",

  // document
  VALID_DOCUMENT_FILE_TYPES: ["pdf", "doc", "docx"],

  // MAX_FILE_SIZE: 2 * 1024 * 1024, // 2MB
  MAX_FILE_SIZE: 5 * 1024 * 1024,

  // cloud folders
  DOCUMENT_FOLDER: "documents",
  IMAGES_FOLDER: "images",
  REPORTS_FOLDER: "reports",

  // Twilio
  TWILIO_CHANNEL: "sms",
  COMPANY_NAME: "E-Clinic",

  // pagination
  PAGE_SIZE: 10,

  // Days of the week
  DAYS: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ],
};
