/**
 * Converts technical database/auth errors into user-friendly messages.
 * Supports both MongoDB/Mongoose and legacy Postgres error codes.
 */
export function friendlyError(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (!error) return fallback;

  const msg = typeof error === "string"
    ? error
    : (error as { message?: string; code?: string | number; details?: string }).message || "";
  const code = String((error as { code?: string | number }).code || "");
  const name = (error as { name?: string }).name || "";

  // MongoDB duplicate key error (code 11000)
  if (code === "11000" || msg.includes("duplicate key") || msg.includes("already exists") || msg.includes("E11000")) {
    if (msg.includes("email")) return "An account with this email already exists.";
    if (msg.includes("slug")) return "This name is already taken. Please choose a different one.";
    return "This record already exists. Please check your information and try again.";
  }

  // Mongoose validation error
  if (name === "ValidationError" || msg.includes("validation failed")) {
    return "Please fill in all required fields before submitting.";
  }

  // Mongoose cast error (invalid ObjectId etc.)
  if (name === "CastError" || msg.includes("Cast to ObjectId failed")) {
    return "Invalid record reference. The item may have been deleted.";
  }

  // Legacy Postgres constraint errors (kept for transition)
  if (code === "23505") {
    return "This record already exists. Please check your information and try again.";
  }
  if (code === "23503" || msg.includes("foreign key") || msg.includes("violates foreign key")) {
    return "A required related record is missing. Please complete all steps in order.";
  }
  if (code === "23502" || msg.includes("not-null") || msg.includes("null value")) {
    return "Please fill in all required fields before submitting.";
  }
  if (code === "23514" || msg.includes("check constraint")) {
    return "Some of the values you entered are not valid. Please review and try again.";
  }

  // Auth errors
  if (msg.includes("Invalid login credentials") || msg.includes("invalid_credentials") || msg.includes("Incorrect email or password")) {
    return "Incorrect email or password. Please try again.";
  }

  if (msg.includes("Email not confirmed")) {
    return "Please verify your email address before signing in. Check your inbox.";
  }

  if (msg.includes("User already registered") || msg.includes("already been registered")) {
    return "An account with this email already exists. Try signing in instead.";
  }

  if (msg.includes("Password should be at least") || msg.includes("password must be")) {
    return "Password must be at least 6 characters long.";
  }

  if (msg.includes("rate limit") || msg.includes("too many requests") || code === "429") {
    return "Too many attempts. Please wait a moment and try again.";
  }

  if (msg.includes("JWT") || msg.includes("token") || msg.includes("session") || msg.includes("jwt")) {
    return "Your session has expired. Please sign in again.";
  }

  // Storage errors
  if (msg.includes("Payload too large") || msg.includes("file size")) {
    return "The file is too large. Please upload a smaller file.";
  }

  if (msg.includes("mime") || msg.includes("file type") || msg.includes("not allowed")) {
    return "This file type is not supported. Please upload a PDF or image.";
  }

  // Network errors
  if (msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("ERR_NETWORK")) {
    return "Unable to connect. Please check your internet connection and try again.";
  }

  // Permission errors
  if (code === "42501" || msg.includes("permission denied") || msg.includes("Unauthorized") || msg.includes("not authorized")) {
    return "You don't have permission to perform this action.";
  }

  // MongoDB connection errors
  if (msg.includes("ECONNREFUSED") || msg.includes("MongoServerError") || msg.includes("topology")) {
    return fallback;
  }

  // If the message looks technical, hide it
  if (msg.match(/\b(relation|column|constraint|schema|table|index|query|sql|pg_|mongo|mongoose|ObjectId)\b/i)) {
    return fallback;
  }

  // Otherwise return the original message if it seems user-readable
  if (msg && msg.length < 200 && !msg.includes("ERROR:")) {
    return msg;
  }

  return fallback;
}
