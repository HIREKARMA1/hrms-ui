
window.onload = function() {
  // Build a system
  let options = {
  "swaggerDoc": {
    "openapi": "3.0.0",
    "paths": {
      "/api/v1": {
        "get": {
          "operationId": "AppController_getHello",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "summary": "API welcome message",
          "tags": [
            "app"
          ]
        }
      },
      "/api/v1/auth/login": {
        "post": {
          "description": "Validates credentials, issues a short-lived access JWT and a durable refresh token (SHA-256 hashed at rest). A new login revokes prior refresh tokens and invalidates previously issued access JWTs for that user. Rate-limited per client IP.",
          "operationId": "AuthController_login",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "email": {
                      "type": "string"
                    },
                    "password": {
                      "type": "string",
                      "minLength": 1
                    }
                  },
                  "required": [
                    "email",
                    "password"
                  ]
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Access and refresh tokens issued",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "success": true,
                      "message": "Login successful",
                      "data": {
                        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                        "refreshToken": "base64url-refresh-token",
                        "tokenType": "Bearer",
                        "expiresIn": "15m",
                        "user": {
                          "id": "user-id",
                          "email": "user@example.com",
                          "role": "SUPER_ADMIN",
                          "roles": [
                            "SUPER_ADMIN"
                          ],
                          "permissions": [
                            "users:read",
                            "users:create"
                          ],
                          "isActive": true
                        }
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Invalid credentials or inactive account"
            },
            "429": {
              "description": "Login rate limit exceeded for this client IP"
            }
          },
          "summary": "Authenticate with email and password",
          "tags": [
            "auth"
          ]
        }
      },
      "/api/v1/auth/refresh": {
        "post": {
          "description": "Accepts a refresh token (no access JWT required). Consumes the presented refresh token, persists a replacement, and returns a new access token pair. Concurrent use of the same refresh token is rejected. Rate-limited per client IP.",
          "operationId": "AuthController_refresh",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "refreshToken": {
                      "type": "string",
                      "minLength": 1
                    }
                  },
                  "required": [
                    "refreshToken"
                  ]
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "New access and refresh tokens issued",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "success": true,
                      "message": "Token refreshed",
                      "data": {
                        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                        "refreshToken": "base64url-refresh-token",
                        "tokenType": "Bearer",
                        "expiresIn": "15m",
                        "user": {
                          "id": "user-id",
                          "email": "user@example.com",
                          "role": "SUPER_ADMIN",
                          "roles": [
                            "SUPER_ADMIN"
                          ],
                          "permissions": [
                            "users:read",
                            "users:create"
                          ],
                          "isActive": true
                        }
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Invalid, expired, revoked, or reused refresh token"
            },
            "429": {
              "description": "Refresh rate limit exceeded for this client IP"
            }
          },
          "summary": "Rotate refresh token and issue a new access JWT",
          "tags": [
            "auth"
          ]
        }
      },
      "/api/v1/auth/logout": {
        "post": {
          "description": "Requires a valid access JWT. Revokes the presented refresh token only when it belongs to the authenticated user. Already-issued access JWTs remain valid until they expire.",
          "operationId": "AuthController_logout",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "refreshToken": {
                      "type": "string",
                      "minLength": 1
                    }
                  },
                  "required": [
                    "refreshToken"
                  ]
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Refresh token revoked for this session",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "success": true,
                      "message": "Logged out",
                      "data": null
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing/invalid access token, or refresh token invalid/expired/revoked/mismatched"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Log out the current session",
          "tags": [
            "auth"
          ]
        }
      },
      "/api/v1/auth/logout-all": {
        "post": {
          "description": "Requires a valid access JWT. Revokes every active refresh token for the caller (user id from the access token, never from the body). Already-issued access JWTs remain valid until they expire.",
          "operationId": "AuthController_logoutAll",
          "parameters": [],
          "responses": {
            "200": {
              "description": "All active refresh tokens for the user revoked",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "success": true,
                      "message": "Logged out from all sessions",
                      "data": {
                        "revokedCount": 2
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid access token"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Log out all sessions for the authenticated user",
          "tags": [
            "auth"
          ]
        }
      },
      "/api/v1/auth/forgot-password": {
        "post": {
          "description": "Always returns the same generic success response whether or not the email exists. When an active account matches, a short-lived reset token is stored as a SHA-256 hash and handed to the email delivery port (dev logs the link; production requires a real mail provider). Rate-limited per client IP (does not reveal whether an email exists).",
          "operationId": "AuthController_forgotPassword",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "email": {
                      "type": "string"
                    }
                  },
                  "required": [
                    "email"
                  ]
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Generic acknowledgement (no email enumeration)",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "success": true,
                      "message": "If an account exists for that email, password reset instructions have been sent.",
                      "data": null
                    }
                  }
                }
              }
            },
            "429": {
              "description": "Forgot-password rate limit exceeded for this client IP"
            }
          },
          "summary": "Request a password reset email",
          "tags": [
            "auth"
          ]
        }
      },
      "/api/v1/auth/reset-password": {
        "post": {
          "description": "Consumes a valid reset token, updates the Argon2id password hash, and revokes all refresh tokens for that user. Tokens cannot be reused. Rate-limited per client IP.",
          "operationId": "AuthController_resetPassword",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "token": {
                      "type": "string",
                      "minLength": 1
                    },
                    "newPassword": {
                      "type": "string",
                      "minLength": 8,
                      "maxLength": 128
                    }
                  },
                  "required": [
                    "token",
                    "newPassword"
                  ]
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Password updated",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "success": true,
                      "message": "Password reset successful",
                      "data": null
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Invalid, expired, or already used reset token"
            },
            "429": {
              "description": "Reset-password rate limit exceeded for this client IP"
            }
          },
          "summary": "Reset password with a one-time token",
          "tags": [
            "auth"
          ]
        }
      },
      "/api/v1/auth/change-password": {
        "post": {
          "description": "Requires a valid access JWT. Verifies the current password, stores a new Argon2id hash, and revokes all refresh tokens for the caller. User id is taken from the access token only. Already-issued access JWTs remain valid until they expire.",
          "operationId": "AuthController_changePassword",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "currentPassword": {
                      "type": "string",
                      "minLength": 1
                    },
                    "newPassword": {
                      "type": "string",
                      "minLength": 8,
                      "maxLength": 128
                    }
                  },
                  "required": [
                    "currentPassword",
                    "newPassword"
                  ]
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Password updated and sessions revoked",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "success": true,
                      "message": "Password changed successfully",
                      "data": null
                    }
                  }
                }
              }
            },
            "400": {
              "description": "New password is identical to the current password"
            },
            "401": {
              "description": "Missing/invalid access token or incorrect current password"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Change the authenticated user password",
          "tags": [
            "auth"
          ]
        }
      },
      "/api/v1/auth/me": {
        "get": {
          "description": "Loads the principal from the access JWT subject, then returns the latest database-backed roles and permissions (inactive roles excluded). Does not embed authorization data in the JWT.",
          "operationId": "AuthController_me",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Authenticated principal with current roles and permissions"
            },
            "401": {
              "description": "Missing or invalid access token"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Return the authenticated user with current roles and permissions",
          "tags": [
            "auth"
          ]
        }
      },
      "/api/v1/auth/admin-flow/validate": {
        "post": {
          "description": "Server-side smoke test for the complete admin flow. Uses BOOTSTRAP_SUPER_ADMIN_EMAIL / BOOTSTRAP_SUPER_ADMIN_PASSWORD from the environment (never accepts a password in the request body). Checks: credentials present → user exists → password hash → active → legacy SUPER_ADMIN → dynamic role assignment → full permission set. Disabled unless ALLOW_ADMIN_FLOW_VALIDATION=true (default on in development). Never returns tokens or the password. Test object id: admin-flow-validation.",
          "operationId": "AdminFlowController_validate",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Structured pass/fail checklist for the admin flow",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "success": true,
                      "message": "Admin flow validation passed",
                      "data": {
                        "testObjectId": "admin-flow-validation",
                        "email": "admin@hirekarma.in",
                        "userId": "clxxxxxxxx",
                        "steps": [
                          {
                            "step": "validation_enabled",
                            "passed": true,
                            "detail": "ok"
                          },
                          {
                            "step": "credentials_present",
                            "passed": true,
                            "detail": "ok"
                          },
                          {
                            "step": "user_exists",
                            "passed": true,
                            "detail": "ok"
                          },
                          {
                            "step": "password_valid",
                            "passed": true,
                            "detail": "ok"
                          },
                          {
                            "step": "user_active",
                            "passed": true,
                            "detail": "ok"
                          },
                          {
                            "step": "legacy_role_super_admin",
                            "passed": true,
                            "detail": "ok"
                          },
                          {
                            "step": "dynamic_role_assigned",
                            "passed": true,
                            "detail": "ok"
                          },
                          {
                            "step": "permissions_complete",
                            "passed": true,
                            "detail": "ok"
                          }
                        ],
                        "roles": [
                          "SUPER_ADMIN"
                        ],
                        "permissions": [
                          "users:read",
                          "roles:read"
                        ],
                        "missingPermissions": []
                      }
                    }
                  }
                }
              }
            },
            "403": {
              "description": "Validation endpoint disabled by configuration"
            },
            "429": {
              "description": "Validation rate limit exceeded for this client IP"
            },
            "503": {
              "description": "RBAC catalog not seeded (SUPER_ADMIN permissions missing)"
            }
          },
          "summary": "Validate Super Admin bootstrap credentials and RBAC readiness",
          "tags": [
            "auth"
          ]
        }
      },
      "/api/v1/health": {
        "get": {
          "operationId": "HealthController_check",
          "parameters": [],
          "responses": {
            "200": {
              "description": "The Health Check is successful",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "status": {
                        "type": "string",
                        "enum": [
                          "ok",
                          "degraded"
                        ],
                        "example": "ok"
                      },
                      "info": {
                        "type": "object",
                        "example": {
                          "database": {
                            "status": "up",
                            "responseTime": 12
                          }
                        },
                        "additionalProperties": {
                          "type": "object",
                          "required": [
                            "status"
                          ],
                          "properties": {
                            "status": {
                              "type": "string",
                              "enum": [
                                "up",
                                "degraded",
                                "down"
                              ]
                            },
                            "responseTime": {
                              "type": "number",
                              "description": "Time the health indicator took to respond, in ms"
                            }
                          },
                          "additionalProperties": true
                        },
                        "nullable": true
                      },
                      "error": {
                        "type": "object",
                        "example": {},
                        "additionalProperties": {
                          "type": "object",
                          "required": [
                            "status"
                          ],
                          "properties": {
                            "status": {
                              "type": "string",
                              "enum": [
                                "up",
                                "degraded",
                                "down"
                              ]
                            },
                            "responseTime": {
                              "type": "number",
                              "description": "Time the health indicator took to respond, in ms"
                            }
                          },
                          "additionalProperties": true
                        },
                        "nullable": true
                      },
                      "details": {
                        "type": "object",
                        "example": {
                          "database": {
                            "status": "up",
                            "responseTime": 12
                          }
                        },
                        "additionalProperties": {
                          "type": "object",
                          "required": [
                            "status"
                          ],
                          "properties": {
                            "status": {
                              "type": "string",
                              "enum": [
                                "up",
                                "degraded",
                                "down"
                              ]
                            },
                            "responseTime": {
                              "type": "number",
                              "description": "Time the health indicator took to respond, in ms"
                            }
                          },
                          "additionalProperties": true
                        }
                      }
                    }
                  }
                }
              }
            },
            "503": {
              "description": "The Health Check is not successful",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "status": {
                        "type": "string",
                        "enum": [
                          "error",
                          "shutting_down"
                        ],
                        "example": "error"
                      },
                      "info": {
                        "type": "object",
                        "example": {
                          "database": {
                            "status": "up",
                            "responseTime": 12
                          }
                        },
                        "additionalProperties": {
                          "type": "object",
                          "required": [
                            "status"
                          ],
                          "properties": {
                            "status": {
                              "type": "string",
                              "enum": [
                                "up",
                                "degraded",
                                "down"
                              ]
                            },
                            "responseTime": {
                              "type": "number",
                              "description": "Time the health indicator took to respond, in ms"
                            }
                          },
                          "additionalProperties": true
                        },
                        "nullable": true
                      },
                      "error": {
                        "type": "object",
                        "example": {
                          "redis": {
                            "status": "down",
                            "message": "Could not connect",
                            "responseTime": 3005
                          }
                        },
                        "additionalProperties": {
                          "type": "object",
                          "required": [
                            "status"
                          ],
                          "properties": {
                            "status": {
                              "type": "string",
                              "enum": [
                                "up",
                                "degraded",
                                "down"
                              ]
                            },
                            "responseTime": {
                              "type": "number",
                              "description": "Time the health indicator took to respond, in ms"
                            }
                          },
                          "additionalProperties": true
                        },
                        "nullable": true
                      },
                      "details": {
                        "type": "object",
                        "example": {
                          "database": {
                            "status": "up",
                            "responseTime": 12
                          },
                          "redis": {
                            "status": "down",
                            "message": "Could not connect",
                            "responseTime": 3005
                          }
                        },
                        "additionalProperties": {
                          "type": "object",
                          "required": [
                            "status"
                          ],
                          "properties": {
                            "status": {
                              "type": "string",
                              "enum": [
                                "up",
                                "degraded",
                                "down"
                              ]
                            },
                            "responseTime": {
                              "type": "number",
                              "description": "Time the health indicator took to respond, in ms"
                            }
                          },
                          "additionalProperties": true
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "summary": "Application and database health check",
          "tags": [
            "health"
          ]
        }
      },
      "/api/v1/attendance/biometric/devices": {
        "post": {
          "description": "`deviceCode` is the TimeWatch device id (machine serial number, e.g. `TW1KDW0010250461`; see `GET /attendance/biometric/devices/timewatch`). Returns the generated HRMS device `id`. Employees reference the device by `deviceId` = `deviceCode`.",
          "operationId": "BiometricController_registerDevice",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "deviceCode": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 128,
                      "pattern": "^[A-Za-z0-9._:-]+$"
                    },
                    "deviceName": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 200
                    },
                    "location": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 200
                    },
                    "isActive": {
                      "default": true,
                      "type": "boolean"
                    }
                  },
                  "required": [
                    "deviceCode",
                    "deviceName"
                  ],
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "409": {
              "description": "deviceCode already registered"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Onboard a TimeWatch device",
          "tags": [
            "biometric"
          ]
        },
        "get": {
          "operationId": "BiometricController_listDevices",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "integer",
                "minimum": 1,
                "maximum": 9007199254740991
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "default": 20,
                "type": "integer",
                "minimum": 1,
                "maximum": 100
              }
            },
            {
              "name": "isActive",
              "required": false,
              "in": "query",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "name": "q",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "maxLength": 128
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "List onboarded biometric devices with their sync cursor",
          "tags": [
            "biometric"
          ]
        }
      },
      "/api/v1/attendance/biometric/devices/timewatch": {
        "get": {
          "description": "Helps pick the `deviceCode` to onboard.",
          "operationId": "BiometricController_listTimeWatchDevices",
          "parameters": [],
          "responses": {
            "503": {
              "description": "TimeWatch gateway unreachable"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "List devices known to TimeWatch (read-only, via the gateway)",
          "tags": [
            "biometric"
          ]
        }
      },
      "/api/v1/attendance/biometric/connection-test": {
        "get": {
          "description": "Read-only diagnostic for deployments. Checks, in order: gateway configured, gateway reachable and able to connect to the TimeWatch SQL Server, API key accepted and a query runs, punch data can be read, and every active HRMS device exists in TimeWatch. Always answers 200; `ok` is true only when every step passed, otherwise see `steps[].detail` for the failing hop. Writes nothing.",
          "operationId": "BiometricController_connectionTest",
          "parameters": [],
          "responses": {
            "200": {
              "description": "`{ ok, steps[], timewatchDevices[], registeredDevices[], sample }`"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Test the HRMS -> gateway -> TimeWatch database connection",
          "tags": [
            "biometric"
          ]
        }
      },
      "/api/v1/attendance/biometric/devices/{id}": {
        "patch": {
          "operationId": "BiometricController_updateDevice",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1,
                "maxLength": 100
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "deviceName": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 200
                    },
                    "location": {
                      "nullable": true,
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 200
                    },
                    "isActive": {
                      "type": "boolean"
                    }
                  },
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "404": {
              "description": "Unknown device id"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Update or activate/deactivate an onboarded device",
          "tags": [
            "biometric"
          ]
        },
        "delete": {
          "description": "Removes the device row from HRMS. TimeWatch hardware data is not changed. Fails with 409 if any employee still references this deviceCode.",
          "operationId": "BiometricController_deleteDevice",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1,
                "maxLength": 100
              }
            }
          ],
          "responses": {
            "403": {
              "description": "Caller is not SUPER_ADMIN"
            },
            "404": {
              "description": "Unknown device id"
            },
            "409": {
              "description": "Employees are still linked to this deviceCode"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Delete an onboarded biometric device (SUPER_ADMIN only)",
          "tags": [
            "biometric"
          ]
        }
      },
      "/api/v1/attendance/biometric/sync": {
        "post": {
          "description": "Pulls new TimeWatch punches (by TimeWatch row id) for every active onboarded device, or only `deviceCode`. The first run copies the full device history. Idempotent; safe to call repeatedly or on a schedule. Each call copies at most 20 000 rows per device; call again while `fetched` is at that limit.",
          "operationId": "BiometricController_sync",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "deviceCode": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 128,
                      "pattern": "^[A-Za-z0-9._:-]+$"
                    }
                  },
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Per-device sync result (a device can fail while others succeed)"
            },
            "404": {
              "description": "deviceCode is not registered"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Copy TimeWatch punches into the HRMS database",
          "tags": [
            "biometric"
          ]
        }
      },
      "/api/v1/attendance/biometric/employees/{employeeId}/attendance": {
        "get": {
          "description": "Punch in / punch out of the employee from TimeWatch, joined with the HRMS employee via `deviceId` + `deviceUserId`. Includes punches from before the employee was created in HRMS. `source=auto` (default) reads TimeWatch live through the read-only gateway and falls back to records copied by `POST /attendance/biometric/sync` when the gateway is unreachable; `live` and `stored` force one source. Callers without `biometric:read_all_attendance` only see employees of their own department. Max range 31 days.",
          "operationId": "BiometricController_attendanceByEmployeeId",
          "parameters": [
            {
              "name": "employeeId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1,
                "maxLength": 100
              }
            },
            {
              "name": "fromDate",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
              }
            },
            {
              "name": "toDate",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
              }
            },
            {
              "name": "source",
              "required": false,
              "in": "query",
              "schema": {
                "default": "auto",
                "type": "string",
                "enum": [
                  "auto",
                  "live",
                  "stored"
                ]
              }
            }
          ],
          "responses": {
            "403": {
              "description": "Employee outside caller department scope"
            },
            "404": {
              "description": "Employee not found"
            },
            "409": {
              "description": "Employee has no deviceId / deviceUserId"
            },
            "502": {
              "description": "Gateway rejected the request (API key / allow-list)"
            },
            "503": {
              "description": "source=live and the gateway is unreachable"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Attendance by HRMS employee id",
          "tags": [
            "biometric"
          ]
        }
      },
      "/api/v1/attendance/biometric/employees/by-code/{employeeCode}/attendance": {
        "get": {
          "description": "Punch in / punch out of the employee from TimeWatch, joined with the HRMS employee via `deviceId` + `deviceUserId`. Includes punches from before the employee was created in HRMS. `source=auto` (default) reads TimeWatch live through the read-only gateway and falls back to records copied by `POST /attendance/biometric/sync` when the gateway is unreachable; `live` and `stored` force one source. Callers without `biometric:read_all_attendance` only see employees of their own department. Max range 31 days.",
          "operationId": "BiometricController_attendanceByEmployeeCode",
          "parameters": [
            {
              "name": "employeeCode",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1,
                "maxLength": 100
              }
            },
            {
              "name": "fromDate",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
              }
            },
            {
              "name": "toDate",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
              }
            },
            {
              "name": "source",
              "required": false,
              "in": "query",
              "schema": {
                "default": "auto",
                "type": "string",
                "enum": [
                  "auto",
                  "live",
                  "stored"
                ]
              }
            }
          ],
          "responses": {
            "403": {
              "description": "Employee outside caller department scope"
            },
            "404": {
              "description": "Employee not found"
            },
            "409": {
              "description": "Employee has no deviceId / deviceUserId"
            },
            "502": {
              "description": "Gateway rejected the request (API key / allow-list)"
            },
            "503": {
              "description": "source=live and the gateway is unreachable"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Attendance by HRMS employee code",
          "tags": [
            "biometric"
          ]
        }
      },
      "/api/v1/attendance/me": {
        "get": {
          "description": "Attendance evaluated against the office policy (`ATTENDANCE_*` env variables): per-day status (PRESENT, LATE, HALF_DAY, EARLY_LEAVE, ABSENT, ON_LEAVE, HOLIDAY, WEEKLY_OFF, ...), late / lunch / tea / overtime minutes, HRMS holidays, weekly offs and approved leaves, and HR regularisations (`displayState` RED -> GREEN). Send `date`, or `fromDate` + `toDate` (max 31 days). `source=auto` (default) reads TimeWatch live and falls back to stored punches. The raw punch endpoints under `/attendance/biometric/employees/...` are unchanged. Returns the employee linked to the signed-in user.",
          "operationId": "AttendanceReportController_myAttendance",
          "parameters": [
            {
              "name": "date",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
              }
            },
            {
              "name": "fromDate",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
              }
            },
            {
              "name": "toDate",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
              }
            },
            {
              "name": "source",
              "required": false,
              "in": "query",
              "schema": {
                "default": "auto",
                "type": "string",
                "enum": [
                  "auto",
                  "live",
                  "stored"
                ]
              }
            }
          ],
          "responses": {
            "404": {
              "description": "Account is not linked to an employee"
            },
            "409": {
              "description": "Employee has no deviceId / deviceUserId"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "My attendance report",
          "tags": [
            "attendance"
          ]
        }
      },
      "/api/v1/attendance/me/date/{date}": {
        "get": {
          "description": "Attendance evaluated against the office policy (`ATTENDANCE_*` env variables): per-day status (PRESENT, LATE, HALF_DAY, EARLY_LEAVE, ABSENT, ON_LEAVE, HOLIDAY, WEEKLY_OFF, ...), late / lunch / tea / overtime minutes, HRMS holidays, weekly offs and approved leaves, and HR regularisations (`displayState` RED -> GREEN). Send `date`, or `fromDate` + `toDate` (max 31 days). `source=auto` (default) reads TimeWatch live and falls back to stored punches. The raw punch endpoints under `/attendance/biometric/employees/...` are unchanged.",
          "operationId": "AttendanceReportController_myAttendanceForDate",
          "parameters": [
            {
              "name": "date",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
              }
            },
            {
              "name": "source",
              "required": false,
              "in": "query",
              "schema": {
                "default": "auto",
                "type": "string",
                "enum": [
                  "auto",
                  "live",
                  "stored"
                ]
              }
            }
          ],
          "responses": {
            "404": {
              "description": "Account is not linked to an employee"
            },
            "409": {
              "description": "Employee has no deviceId / deviceUserId"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "My attendance for one date",
          "tags": [
            "attendance"
          ]
        }
      },
      "/api/v1/attendance/employees/by-code/{employeeCode}": {
        "get": {
          "description": "Attendance evaluated against the office policy (`ATTENDANCE_*` env variables): per-day status (PRESENT, LATE, HALF_DAY, EARLY_LEAVE, ABSENT, ON_LEAVE, HOLIDAY, WEEKLY_OFF, ...), late / lunch / tea / overtime minutes, HRMS holidays, weekly offs and approved leaves, and HR regularisations (`displayState` RED -> GREEN). Send `date`, or `fromDate` + `toDate` (max 31 days). `source=auto` (default) reads TimeWatch live and falls back to stored punches. The raw punch endpoints under `/attendance/biometric/employees/...` are unchanged. Callers without `biometric:read_all_attendance` only see employees of their own department.",
          "operationId": "AttendanceReportController_byEmployeeCode",
          "parameters": [
            {
              "name": "employeeCode",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1,
                "maxLength": 100
              }
            },
            {
              "name": "date",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
              }
            },
            {
              "name": "fromDate",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
              }
            },
            {
              "name": "toDate",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
              }
            },
            {
              "name": "source",
              "required": false,
              "in": "query",
              "schema": {
                "default": "auto",
                "type": "string",
                "enum": [
                  "auto",
                  "live",
                  "stored"
                ]
              }
            }
          ],
          "responses": {
            "403": {
              "description": "Employee outside caller department scope"
            },
            "404": {
              "description": "Employee not found"
            },
            "409": {
              "description": "Employee has no deviceId / deviceUserId"
            },
            "502": {
              "description": "Gateway rejected the request"
            },
            "503": {
              "description": "source=live and the gateway is unreachable"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Attendance report by employee code",
          "tags": [
            "attendance"
          ]
        }
      },
      "/api/v1/attendance/employees/by-code/{employeeCode}/date/{date}": {
        "get": {
          "description": "Attendance evaluated against the office policy (`ATTENDANCE_*` env variables): per-day status (PRESENT, LATE, HALF_DAY, EARLY_LEAVE, ABSENT, ON_LEAVE, HOLIDAY, WEEKLY_OFF, ...), late / lunch / tea / overtime minutes, HRMS holidays, weekly offs and approved leaves, and HR regularisations (`displayState` RED -> GREEN). Send `date`, or `fromDate` + `toDate` (max 31 days). `source=auto` (default) reads TimeWatch live and falls back to stored punches. The raw punch endpoints under `/attendance/biometric/employees/...` are unchanged. Callers without `biometric:read_all_attendance` only see employees of their own department.",
          "operationId": "AttendanceReportController_byEmployeeCodeForDate",
          "parameters": [
            {
              "name": "employeeCode",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1,
                "maxLength": 100
              }
            },
            {
              "name": "date",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
              }
            },
            {
              "name": "source",
              "required": false,
              "in": "query",
              "schema": {
                "default": "auto",
                "type": "string",
                "enum": [
                  "auto",
                  "live",
                  "stored"
                ]
              }
            }
          ],
          "responses": {
            "403": {
              "description": "Employee outside caller department scope"
            },
            "404": {
              "description": "Employee not found"
            },
            "409": {
              "description": "Employee has no deviceId / deviceUserId"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Attendance for one date by employee code",
          "tags": [
            "attendance"
          ]
        }
      },
      "/api/v1/attendance/employees/{employeeId}": {
        "get": {
          "description": "Attendance evaluated against the office policy (`ATTENDANCE_*` env variables): per-day status (PRESENT, LATE, HALF_DAY, EARLY_LEAVE, ABSENT, ON_LEAVE, HOLIDAY, WEEKLY_OFF, ...), late / lunch / tea / overtime minutes, HRMS holidays, weekly offs and approved leaves, and HR regularisations (`displayState` RED -> GREEN). Send `date`, or `fromDate` + `toDate` (max 31 days). `source=auto` (default) reads TimeWatch live and falls back to stored punches. The raw punch endpoints under `/attendance/biometric/employees/...` are unchanged. Callers without `biometric:read_all_attendance` only see employees of their own department.",
          "operationId": "AttendanceReportController_byEmployeeId",
          "parameters": [
            {
              "name": "employeeId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1,
                "maxLength": 100
              }
            },
            {
              "name": "date",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
              }
            },
            {
              "name": "fromDate",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
              }
            },
            {
              "name": "toDate",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
              }
            },
            {
              "name": "source",
              "required": false,
              "in": "query",
              "schema": {
                "default": "auto",
                "type": "string",
                "enum": [
                  "auto",
                  "live",
                  "stored"
                ]
              }
            }
          ],
          "responses": {
            "403": {
              "description": "Employee outside caller department scope"
            },
            "404": {
              "description": "Employee not found"
            },
            "409": {
              "description": "Employee has no deviceId / deviceUserId"
            },
            "502": {
              "description": "Gateway rejected the request"
            },
            "503": {
              "description": "source=live and the gateway is unreachable"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Attendance report by HRMS employee id",
          "tags": [
            "attendance"
          ]
        }
      },
      "/api/v1/attendance/employees/{employeeId}/date/{date}": {
        "get": {
          "description": "Attendance evaluated against the office policy (`ATTENDANCE_*` env variables): per-day status (PRESENT, LATE, HALF_DAY, EARLY_LEAVE, ABSENT, ON_LEAVE, HOLIDAY, WEEKLY_OFF, ...), late / lunch / tea / overtime minutes, HRMS holidays, weekly offs and approved leaves, and HR regularisations (`displayState` RED -> GREEN). Send `date`, or `fromDate` + `toDate` (max 31 days). `source=auto` (default) reads TimeWatch live and falls back to stored punches. The raw punch endpoints under `/attendance/biometric/employees/...` are unchanged. Callers without `biometric:read_all_attendance` only see employees of their own department.",
          "operationId": "AttendanceReportController_byEmployeeIdForDate",
          "parameters": [
            {
              "name": "employeeId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1,
                "maxLength": 100
              }
            },
            {
              "name": "date",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
              }
            },
            {
              "name": "source",
              "required": false,
              "in": "query",
              "schema": {
                "default": "auto",
                "type": "string",
                "enum": [
                  "auto",
                  "live",
                  "stored"
                ]
              }
            }
          ],
          "responses": {
            "403": {
              "description": "Employee outside caller department scope"
            },
            "404": {
              "description": "Employee not found"
            },
            "409": {
              "description": "Employee has no deviceId / deviceUserId"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Attendance for one date by HRMS employee id",
          "tags": [
            "attendance"
          ]
        }
      },
      "/api/v1/attendance/employees/{employeeId}/regularizations": {
        "post": {
          "description": "HR approves LATE_ARRIVAL or TEA_BREAK_EXCEEDED for one or more dates. The punches are not modified; the matching violation turns from `VIOLATION` (red) to `REGULARISED` (green) in the attendance report. All dates are validated first, then stored together. You cannot regularise your own attendance.",
          "operationId": "AttendanceRegularizationController_regularize",
          "parameters": [
            {
              "name": "employeeId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1,
                "maxLength": 100
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "type": {
                      "type": "string",
                      "enum": [
                        "LATE_ARRIVAL",
                        "TEA_BREAK_EXCEEDED"
                      ]
                    },
                    "dates": {
                      "minItems": 1,
                      "maxItems": 31,
                      "type": "array",
                      "items": {
                        "type": "string",
                        "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
                      }
                    },
                    "reason": {
                      "type": "string",
                      "minLength": 3,
                      "maxLength": 500
                    }
                  },
                  "required": [
                    "type",
                    "dates",
                    "reason"
                  ],
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "400": {
              "description": "Future date, date before joining, or window > 31 days"
            },
            "403": {
              "description": "Self-regularisation is not allowed"
            },
            "404": {
              "description": "Employee not found"
            },
            "409": {
              "description": "No such violation on a date, or already regularised"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Regularise late arrivals / tea-break overruns",
          "tags": [
            "attendance"
          ]
        }
      },
      "/api/v1/attendance/regularizations": {
        "get": {
          "description": "Newest first. Revoked rows are excluded unless `includeRevoked=true`.",
          "operationId": "AttendanceRegularizationController_list",
          "parameters": [
            {
              "name": "employeeId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1,
                "maxLength": 100
              }
            },
            {
              "name": "fromDate",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
              }
            },
            {
              "name": "toDate",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
              }
            },
            {
              "name": "type",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "enum": [
                  "LATE_ARRIVAL",
                  "TEA_BREAK_EXCEEDED"
                ]
              }
            },
            {
              "name": "includeRevoked",
              "required": false,
              "in": "query",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "integer",
                "minimum": 1,
                "maximum": 9007199254740991
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "default": 20,
                "type": "integer",
                "minimum": 1,
                "maximum": 100
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "List attendance regularisations (audit trail)",
          "tags": [
            "attendance"
          ]
        }
      },
      "/api/v1/attendance/regularizations/{id}": {
        "delete": {
          "description": "Marks the regularisation revoked (kept for audit); the violation shows as red again.",
          "operationId": "AttendanceRegularizationController_revoke",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1,
                "maxLength": 100
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "reason": {
                      "type": "string",
                      "minLength": 3,
                      "maxLength": 500
                    }
                  },
                  "required": [
                    "reason"
                  ],
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "404": {
              "description": "Regularisation not found"
            },
            "409": {
              "description": "Already revoked"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Revoke a regularisation",
          "tags": [
            "attendance"
          ]
        }
      },
      "/api/v1/employees": {
        "post": {
          "description": "Requires employees:create (SUPER_ADMIN, HR_ADMIN). Creates the employee in PostgreSQL only; nothing is written to TimeWatch. `deviceId` must be the deviceCode of an onboarded active biometric device; `deviceUserId` is the TimeWatch UserID of this person on that device (unique per device) and links attendance, including punches from before this onboarding. Pass photoUrl as a string link (e.g. future S3 URL).",
          "operationId": "EmployeesController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "employeeCode": {
                      "type": "string",
                      "minLength": 1
                    },
                    "firstName": {
                      "type": "string",
                      "minLength": 1
                    },
                    "lastName": {
                      "type": "string",
                      "minLength": 1
                    },
                    "designation": {
                      "type": "string",
                      "minLength": 1
                    },
                    "employmentStatus": {
                      "type": "string",
                      "enum": [
                        "ACTIVE",
                        "ON_LEAVE",
                        "PROBATION",
                        "TERMINATED"
                      ]
                    },
                    "role": {
                      "type": "string",
                      "enum": [
                        "EMPLOYEE",
                        "HR_ADMIN",
                        "MANAGER",
                        "SUPER_ADMIN"
                      ]
                    },
                    "email": {
                      "type": "string",
                      "format": "email",
                      "pattern": "^(?:[A-Za-z0-9_'+\\-]+\\.)*[A-Za-z0-9_'+\\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\\-]*\\.)+[A-Za-z]{2,}$"
                    },
                    "phone": {
                      "type": "string",
                      "minLength": 8
                    },
                    "aadhaar": {
                      "type": "string",
                      "pattern": "^\\d{12}$"
                    },
                    "pan": {
                      "type": "string",
                      "pattern": "^[A-Z]{5}[0-9]{4}[A-Z]$"
                    },
                    "bloodGroup": {
                      "type": "string",
                      "minLength": 1
                    },
                    "photoUrl": {
                      "type": "string",
                      "minLength": 1,
                      "format": "uri"
                    },
                    "dateOfJoining": {
                      "type": "string",
                      "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
                    },
                    "dateOfBirth": {
                      "type": "string",
                      "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
                    },
                    "gender": {
                      "type": "string",
                      "minLength": 1
                    },
                    "maritalStatus": {
                      "type": "string",
                      "minLength": 1
                    },
                    "nationality": {
                      "type": "string",
                      "minLength": 1
                    },
                    "noticePeriod": {
                      "type": "string",
                      "minLength": 1
                    },
                    "uanNumber": {
                      "type": "string",
                      "minLength": 1
                    },
                    "departmentId": {
                      "type": "string",
                      "minLength": 1
                    },
                    "deviceId": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 128
                    },
                    "deviceUserId": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 50
                    },
                    "permanentAddress": {
                      "type": "object",
                      "properties": {
                        "line1": {
                          "type": "string",
                          "minLength": 1
                        },
                        "line2": {
                          "type": "string"
                        },
                        "city": {
                          "type": "string",
                          "minLength": 1
                        },
                        "state": {
                          "type": "string",
                          "minLength": 1
                        },
                        "pincode": {
                          "type": "string",
                          "minLength": 4
                        },
                        "country": {
                          "default": "India",
                          "type": "string",
                          "minLength": 1
                        }
                      },
                      "required": [
                        "line1",
                        "city",
                        "state",
                        "pincode"
                      ]
                    },
                    "currentAddress": {
                      "type": "object",
                      "properties": {
                        "line1": {
                          "type": "string",
                          "minLength": 1
                        },
                        "line2": {
                          "type": "string"
                        },
                        "city": {
                          "type": "string",
                          "minLength": 1
                        },
                        "state": {
                          "type": "string",
                          "minLength": 1
                        },
                        "pincode": {
                          "type": "string",
                          "minLength": 4
                        },
                        "country": {
                          "default": "India",
                          "type": "string",
                          "minLength": 1
                        }
                      },
                      "required": [
                        "line1",
                        "city",
                        "state",
                        "pincode"
                      ]
                    },
                    "bankDetail": {
                      "type": "object",
                      "properties": {
                        "accountHolderName": {
                          "type": "string",
                          "minLength": 1
                        },
                        "accountNumber": {
                          "type": "string",
                          "minLength": 5
                        },
                        "ifsc": {
                          "type": "string",
                          "pattern": "^[A-Z]{4}0[A-Z0-9]{6}$"
                        },
                        "bankName": {
                          "type": "string",
                          "minLength": 1
                        },
                        "branch": {
                          "type": "string"
                        }
                      },
                      "required": [
                        "accountHolderName",
                        "accountNumber",
                        "ifsc",
                        "bankName"
                      ]
                    }
                  },
                  "required": [
                    "employeeCode",
                    "firstName",
                    "lastName",
                    "designation",
                    "employmentStatus",
                    "role",
                    "email",
                    "phone",
                    "aadhaar",
                    "pan",
                    "bloodGroup",
                    "photoUrl",
                    "dateOfJoining",
                    "deviceId",
                    "permanentAddress",
                    "bankDetail"
                  ]
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient role/permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Onboard employee (HRMS DB only)",
          "tags": [
            "employees"
          ]
        },
        "get": {
          "description": "Requires employees:read (SUPER_ADMIN, HR_ADMIN, MANAGER).",
          "operationId": "EmployeesController_findAll",
          "parameters": [
            {
              "name": "skip",
              "required": false,
              "in": "query",
              "schema": {
                "default": 0,
                "type": "integer",
                "minimum": 0,
                "maximum": 9007199254740991
              }
            },
            {
              "name": "take",
              "required": false,
              "in": "query",
              "schema": {
                "default": 50,
                "type": "integer",
                "minimum": 1,
                "maximum": 100
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient role/permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "List all employees (HRMS DB only)",
          "tags": [
            "employees"
          ]
        }
      },
      "/api/v1/employees/search": {
        "get": {
          "description": "Requires employees:read (SUPER_ADMIN, HR_ADMIN, MANAGER). HRMS DB only.",
          "operationId": "EmployeesController_search",
          "parameters": [
            {
              "name": "q",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            },
            {
              "name": "id",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            },
            {
              "name": "name",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            },
            {
              "name": "userId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            },
            {
              "name": "employeeCode",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            },
            {
              "name": "skip",
              "required": false,
              "in": "query",
              "schema": {
                "default": 0,
                "type": "integer",
                "minimum": 0,
                "maximum": 9007199254740991
              }
            },
            {
              "name": "take",
              "required": false,
              "in": "query",
              "schema": {
                "default": 50,
                "type": "integer",
                "minimum": 1,
                "maximum": 100
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient role/permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Search employees by id, name, userId, or employeeCode",
          "tags": [
            "employees"
          ]
        }
      },
      "/api/v1/employees/{id}/personal-info": {
        "get": {
          "description": "Requires employees:read (SUPER_ADMIN, HR_ADMIN, MANAGER). Returns personal profile fields: identity, contact, KYC, addresses, and bank details. Excludes device sync and document files.",
          "operationId": "EmployeesController_findPersonalInfo",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient role/permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Get employee personal info by id",
          "tags": [
            "employees"
          ]
        }
      },
      "/api/v1/employees/{id}/attendance": {
        "get": {
          "description": "Requires employees:read (SUPER_ADMIN, HR_ADMIN, MANAGER). Reads punches of employee.deviceUserId on employee.deviceId from the TimeWatch database through the read-only gateway and joins them with the HRMS employee (includes punches from before HRMS onboarding). source=auto (default) falls back to records copied by POST /attendance/biometric/sync when the gateway is unreachable. Max range 31 days.",
          "operationId": "EmployeesController_getAttendance",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "fromDate",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$",
                "example": "2026-11-16"
              }
            },
            {
              "name": "toDate",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$",
                "example": "2026-11-19"
              }
            },
            {
              "name": "source",
              "required": false,
              "in": "query",
              "schema": {
                "enum": [
                  "auto",
                  "live",
                  "stored"
                ],
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient role/permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Get employee attendance by id (punch in / punch out)",
          "tags": [
            "employees"
          ]
        }
      },
      "/api/v1/employees/{id}": {
        "get": {
          "description": "Requires employees:read (SUPER_ADMIN, HR_ADMIN, MANAGER).",
          "operationId": "EmployeesController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient role/permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Get employee by id (HRMS DB only)",
          "tags": [
            "employees"
          ]
        },
        "patch": {
          "description": "Requires employees:update (SUPER_ADMIN, HR_ADMIN). Partial update of HRMS fields only (TimeWatch is not changed). Set deviceId/deviceUserId to link the employee to their TimeWatch device user; deviceUserId=null unlinks.",
          "operationId": "EmployeesController_update",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "employeeCode": {
                      "type": "string",
                      "minLength": 1
                    },
                    "firstName": {
                      "type": "string",
                      "minLength": 1
                    },
                    "lastName": {
                      "type": "string",
                      "minLength": 1
                    },
                    "email": {
                      "type": "string",
                      "format": "email",
                      "pattern": "^(?:[A-Za-z0-9_'+\\-]+\\.)*[A-Za-z0-9_'+\\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\\-]*\\.)+[A-Za-z]{2,}$"
                    },
                    "phone": {
                      "type": "string",
                      "minLength": 8
                    },
                    "aadhaar": {
                      "type": "string",
                      "pattern": "^\\d{12}$"
                    },
                    "pan": {
                      "type": "string",
                      "pattern": "^[A-Z]{5}[0-9]{4}[A-Z]$"
                    },
                    "bloodGroup": {
                      "type": "string",
                      "minLength": 1
                    },
                    "employmentStatus": {
                      "type": "string",
                      "enum": [
                        "ACTIVE",
                        "ON_LEAVE",
                        "PROBATION",
                        "TERMINATED"
                      ]
                    },
                    "photoUrl": {
                      "type": "string",
                      "format": "uri"
                    },
                    "dateOfBirth": {
                      "type": "string",
                      "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
                    },
                    "dateOfJoining": {
                      "type": "string",
                      "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
                    },
                    "gender": {
                      "type": "string",
                      "minLength": 1
                    },
                    "maritalStatus": {
                      "type": "string",
                      "minLength": 1
                    },
                    "nationality": {
                      "type": "string",
                      "minLength": 1
                    },
                    "noticePeriod": {
                      "type": "string",
                      "minLength": 1
                    },
                    "deviceId": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 128
                    },
                    "deviceUserId": {
                      "nullable": true,
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 50
                    },
                    "permanentAddress": {
                      "type": "object",
                      "properties": {
                        "line1": {
                          "type": "string",
                          "minLength": 1
                        },
                        "line2": {
                          "type": "string"
                        },
                        "city": {
                          "type": "string",
                          "minLength": 1
                        },
                        "state": {
                          "type": "string",
                          "minLength": 1
                        },
                        "pincode": {
                          "type": "string",
                          "minLength": 4
                        },
                        "country": {
                          "default": "India",
                          "type": "string",
                          "minLength": 1
                        }
                      },
                      "required": [
                        "line1",
                        "city",
                        "state",
                        "pincode"
                      ]
                    },
                    "currentAddress": {
                      "type": "object",
                      "properties": {
                        "line1": {
                          "type": "string",
                          "minLength": 1
                        },
                        "line2": {
                          "type": "string"
                        },
                        "city": {
                          "type": "string",
                          "minLength": 1
                        },
                        "state": {
                          "type": "string",
                          "minLength": 1
                        },
                        "pincode": {
                          "type": "string",
                          "minLength": 4
                        },
                        "country": {
                          "default": "India",
                          "type": "string",
                          "minLength": 1
                        }
                      },
                      "required": [
                        "line1",
                        "city",
                        "state",
                        "pincode"
                      ]
                    },
                    "bankDetail": {
                      "type": "object",
                      "properties": {
                        "accountHolderName": {
                          "type": "string",
                          "minLength": 1
                        },
                        "accountNumber": {
                          "type": "string",
                          "minLength": 5
                        },
                        "ifsc": {
                          "type": "string",
                          "pattern": "^[A-Z]{4}0[A-Z0-9]{6}$"
                        },
                        "bankName": {
                          "type": "string",
                          "minLength": 1
                        },
                        "branch": {
                          "type": "string"
                        }
                      },
                      "required": [
                        "accountHolderName",
                        "accountNumber",
                        "ifsc",
                        "bankName"
                      ]
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient role/permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Update employee by id (allowed fields only)",
          "tags": [
            "employees"
          ]
        },
        "delete": {
          "description": "Requires employees:delete (SUPER_ADMIN, HR_ADMIN). Deletes the employee from PostgreSQL only; the TimeWatch device user and punches are not changed.",
          "operationId": "EmployeesController_remove",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient role/permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Delete employee (HRMS DB only)",
          "tags": [
            "employees"
          ]
        }
      },
      "/api/v1/departments": {
        "post": {
          "description": "Creates a department. `code` (2–32 chars, A–Z/0–9/_/-, stored uppercase) and `name` (case-insensitive) must be unique. `description` and `isActive` (default true) are optional. Parent and department-head fields are not supported by the current schema and are rejected.",
          "operationId": "DepartmentsController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "code": {
                      "type": "string",
                      "pattern": "^[A-Z0-9][A-Z0-9_-]{1,31}$"
                    },
                    "name": {
                      "type": "string"
                    },
                    "description": {
                      "type": "string",
                      "maxLength": 500
                    },
                    "isActive": {
                      "default": true,
                      "type": "boolean"
                    }
                  },
                  "required": [
                    "code",
                    "name"
                  ],
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Department created",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "success": true,
                      "message": "Department created",
                      "data": {
                        "id": "cm3dept0001",
                        "code": "ENG",
                        "name": "Engineering",
                        "description": "Product engineering",
                        "isActive": true,
                        "createdAt": "2026-11-19T11:00:00.000Z",
                        "updatedAt": "2026-11-19T11:00:00.000Z",
                        "employeeCount": 0
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Validation failed (missing/invalid fields or unknown keys)"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing departments:manage"
            },
            "409": {
              "description": "Department code or name already exists"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Create a department",
          "tags": [
            "departments"
          ]
        },
        "get": {
          "description": "Paginated department list with employee counts. Supports `search` (name or code, case-insensitive), `isActive` filter, and sorting by name, code, createdAt or updatedAt (default: name asc). `limit` is 1–100 (default 20).",
          "operationId": "DepartmentsController_findAll",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "integer",
                "minimum": 1,
                "maximum": 9007199254740991
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "default": 20,
                "type": "integer",
                "minimum": 1,
                "maximum": 100
              }
            },
            {
              "name": "search",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1,
                "maxLength": 120
              }
            },
            {
              "name": "isActive",
              "required": false,
              "in": "query",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "name": "sortBy",
              "required": false,
              "in": "query",
              "schema": {
                "default": "name",
                "type": "string",
                "enum": [
                  "name",
                  "code",
                  "createdAt",
                  "updatedAt"
                ]
              }
            },
            {
              "name": "sortOrder",
              "required": false,
              "in": "query",
              "schema": {
                "default": "asc",
                "type": "string",
                "enum": [
                  "asc",
                  "desc"
                ]
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Departments retrieved (items is empty when nothing matches)",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "success": true,
                      "message": "Departments retrieved",
                      "data": {
                        "items": [
                          {
                            "id": "cm3dept0001",
                            "code": "ENG",
                            "name": "Engineering",
                            "description": "Product engineering",
                            "isActive": true,
                            "createdAt": "2026-11-19T11:00:00.000Z",
                            "updatedAt": "2026-11-19T11:00:00.000Z",
                            "employeeCount": 12
                          }
                        ],
                        "pagination": {
                          "page": 1,
                          "limit": 20,
                          "total": 1,
                          "totalPages": 1
                        }
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Invalid query parameters"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing departments:manage"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "List departments",
          "tags": [
            "departments"
          ]
        }
      },
      "/api/v1/departments/{id}/employees": {
        "get": {
          "description": "Paginated employees assigned to the department via `Employee.departmentId`. Supports `search` (employee code, first name, last name or email, case-insensitive), optional `employmentStatus` (ACTIVE, ON_LEAVE, PROBATION, TERMINATED), and sorting by employeeCode, firstName, lastName, email, designation, employmentStatus or dateOfJoining (default: firstName asc). `limit` is 1–100 (default 20). Returns 404 if the department does not exist; an empty assignment set returns `items: []` with `total: 0`.",
          "operationId": "DepartmentsController_findEmployees",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "Department id (cuid)",
              "schema": {
                "type": "string",
                "pattern": "^[A-Za-z0-9_-]{1,64}$"
              }
            },
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "integer",
                "minimum": 1,
                "maximum": 9007199254740991
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "default": 20,
                "type": "integer",
                "minimum": 1,
                "maximum": 100
              }
            },
            {
              "name": "search",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1,
                "maxLength": 120
              }
            },
            {
              "name": "employmentStatus",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "enum": [
                  "ACTIVE",
                  "ON_LEAVE",
                  "PROBATION",
                  "TERMINATED"
                ]
              }
            },
            {
              "name": "sortBy",
              "required": false,
              "in": "query",
              "schema": {
                "default": "firstName",
                "type": "string",
                "enum": [
                  "employeeCode",
                  "firstName",
                  "lastName",
                  "email",
                  "designation",
                  "employmentStatus",
                  "dateOfJoining"
                ]
              }
            },
            {
              "name": "sortOrder",
              "required": false,
              "in": "query",
              "schema": {
                "default": "asc",
                "type": "string",
                "enum": [
                  "asc",
                  "desc"
                ]
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Department employees retrieved (items is empty when none match)",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "success": true,
                      "message": "Department employees retrieved",
                      "data": {
                        "items": [
                          {
                            "id": "cm3emp0001",
                            "employeeCode": "EMP-001",
                            "firstName": "Asha",
                            "lastName": "Rao",
                            "email": "asha.rao@example.com",
                            "designation": "Engineering Manager",
                            "employmentStatus": "ACTIVE",
                            "dateOfJoining": "2024-03-15"
                          }
                        ],
                        "pagination": {
                          "page": 1,
                          "limit": 20,
                          "total": 1,
                          "totalPages": 1
                        }
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Invalid department id or query parameters"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing departments:manage"
            },
            "404": {
              "description": "Department not found"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "List employees in a department",
          "tags": [
            "departments"
          ]
        }
      },
      "/api/v1/departments/{id}": {
        "get": {
          "description": "Returns one department with `employeeCount` (true total) and the assigned employees as basic, non-sensitive summaries (id, employeeCode, firstName, lastName, name), ordered by name and capped at 100 entries.",
          "operationId": "DepartmentsController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "Department id (cuid)",
              "schema": {
                "type": "string",
                "pattern": "^[A-Za-z0-9_-]{1,64}$"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Department retrieved",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "success": true,
                      "message": "Department retrieved",
                      "data": {
                        "id": "cm3dept0001",
                        "code": "ENG",
                        "name": "Engineering",
                        "description": "Product engineering",
                        "isActive": true,
                        "createdAt": "2026-11-19T11:00:00.000Z",
                        "updatedAt": "2026-11-19T11:00:00.000Z",
                        "employeeCount": 1,
                        "employees": [
                          {
                            "id": "cm3emp0001",
                            "employeeCode": "EMP-001",
                            "firstName": "Asha",
                            "lastName": "Rao",
                            "name": "Asha Rao"
                          }
                        ]
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Invalid department id"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing departments:manage"
            },
            "404": {
              "description": "Department not found"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Get a department by ID",
          "tags": [
            "departments"
          ]
        },
        "patch": {
          "description": "Partially updates `code`, `name`, `description` and/or `isActive`; only supplied fields change and at least one is required. `code` is stored uppercase and `code`/`name` (case-insensitive) must stay unique, ignoring the department being edited. Sending `description: null` or a blank string clears it. `updatedAt` is refreshed only when a value actually changes. Returns the updated department with `employeeCount`; employee assignments are untouched.",
          "operationId": "DepartmentsController_update",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "Department id (cuid)",
              "schema": {
                "type": "string",
                "pattern": "^[A-Za-z0-9_-]{1,64}$"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "code": {
                      "type": "string",
                      "pattern": "^[A-Z0-9][A-Z0-9_-]{1,31}$"
                    },
                    "name": {
                      "type": "string"
                    },
                    "description": {
                      "nullable": true,
                      "type": "string",
                      "maxLength": 500
                    },
                    "isActive": {
                      "type": "boolean"
                    }
                  },
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Department updated",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "success": true,
                      "message": "Department updated",
                      "data": {
                        "id": "cm3dept0001",
                        "code": "ENG",
                        "name": "Platform Engineering",
                        "description": "Platform and infrastructure",
                        "isActive": true,
                        "createdAt": "2026-11-19T11:00:00.000Z",
                        "updatedAt": "2026-11-19T14:30:00.000Z",
                        "employeeCount": 12
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Invalid id or body (invalid values, unknown keys, or no fields supplied)"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing departments:manage"
            },
            "404": {
              "description": "Department not found"
            },
            "409": {
              "description": "Department code or name already exists"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Update a department",
          "tags": [
            "departments"
          ]
        },
        "delete": {
          "description": "Permanently deletes a department that has no employees assigned. Employees are never deleted, orphaned or reassigned: if any are assigned the request fails with 409 until they are moved to another department. Also returns 409 if the department is still referenced by holidays, leave approval workflows, job postings, offers or calendar events.",
          "operationId": "DepartmentsController_remove",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "Department id (cuid)",
              "schema": {
                "type": "string",
                "pattern": "^[A-Za-z0-9_-]{1,64}$"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Department deleted",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "success": true,
                      "message": "Department deleted",
                      "data": null
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Invalid department id"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing departments:manage"
            },
            "404": {
              "description": "Department not found"
            },
            "409": {
              "description": "Employees are still assigned (reassign them first), the department is referenced by other records, or a concurrent change occurred",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "statusCode": 409,
                      "message": "Department cannot be deleted while 3 employees are assigned to it. Reassign the employees to another department first.",
                      "error": "Conflict"
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Delete a department",
          "tags": [
            "departments"
          ]
        }
      },
      "/api/v1/organisation-onboarding/accounts": {
        "post": {
          "description": "Requires onboarding:create (SUPER_ADMIN, HR_ADMIN, MANAGER). Creates a temp User (active, no RBAC roles) and an INCOMPLETE form. Password is FirstName@YYYY from DOB and is returned once. Sends a congratulations email with ONBOARDING_FORM_URL, temporary email, and password. Account expires after 7 working days.",
          "operationId": "OrganisationOnboardingController_createAccount",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "employeeCode": {
                      "type": "string",
                      "minLength": 1
                    },
                    "firstName": {
                      "type": "string",
                      "minLength": 1
                    },
                    "dateOfBirth": {
                      "type": "string",
                      "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
                    },
                    "email": {
                      "type": "string",
                      "format": "email",
                      "pattern": "^(?:[A-Za-z0-9_'+\\-]+\\.)*[A-Za-z0-9_'+\\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\\-]*\\.)+[A-Za-z]{2,}$"
                    }
                  },
                  "required": [
                    "employeeCode",
                    "firstName",
                    "dateOfBirth",
                    "email"
                  ]
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient role/permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Create temporary organisation onboarding account",
          "tags": [
            "organisation-onboarding"
          ]
        }
      },
      "/api/v1/organisation-onboarding/forms/{onboardingId}/login": {
        "post": {
          "description": "Public. Checks temp email + password for this onboarding id so the candidate can unlock the form. Does not issue a JWT.",
          "operationId": "OrganisationOnboardingController_loginForm",
          "parameters": [
            {
              "name": "onboardingId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "email": {
                      "type": "string",
                      "format": "email",
                      "pattern": "^(?:[A-Za-z0-9_'+\\-]+\\.)*[A-Za-z0-9_'+\\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\\-]*\\.)+[A-Za-z]{2,}$"
                    },
                    "password": {
                      "type": "string",
                      "minLength": 1
                    }
                  },
                  "required": [
                    "email",
                    "password"
                  ]
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient role/permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Validate temporary onboarding credentials (candidate)",
          "tags": [
            "organisation-onboarding"
          ]
        }
      },
      "/api/v1/organisation-onboarding/forms/{onboardingId}": {
        "post": {
          "description": "Public. Candidate authenticates with the temp email + generated password in the body, then submits personal/KYC/address/bank details. Optional: uanNumber, salarySlipUrls[], relievingLetterUrl. Marks the form FILLED.",
          "operationId": "OrganisationOnboardingController_submitForm",
          "parameters": [
            {
              "name": "onboardingId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "email": {
                      "type": "string",
                      "format": "email",
                      "pattern": "^(?:[A-Za-z0-9_'+\\-]+\\.)*[A-Za-z0-9_'+\\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\\-]*\\.)+[A-Za-z]{2,}$"
                    },
                    "password": {
                      "type": "string",
                      "minLength": 1
                    },
                    "firstName": {
                      "type": "string",
                      "minLength": 1
                    },
                    "lastName": {
                      "type": "string",
                      "minLength": 1
                    },
                    "professionalIdentity": {
                      "type": "string",
                      "minLength": 1
                    },
                    "phone": {
                      "type": "string",
                      "minLength": 8
                    },
                    "aadhaar": {
                      "type": "string",
                      "pattern": "^\\d{12}$"
                    },
                    "pan": {
                      "type": "string",
                      "pattern": "^[A-Z]{5}[0-9]{4}[A-Z]$"
                    },
                    "bloodGroup": {
                      "type": "string",
                      "minLength": 1
                    },
                    "photoUrl": {
                      "type": "string",
                      "format": "uri"
                    },
                    "uanNumber": {
                      "type": "string",
                      "minLength": 1
                    },
                    "salarySlipUrls": {
                      "maxItems": 20,
                      "type": "array",
                      "items": {
                        "type": "string",
                        "format": "uri"
                      }
                    },
                    "salarySlipUrl": {
                      "type": "string",
                      "format": "uri"
                    },
                    "relievingLetterUrl": {
                      "type": "string",
                      "format": "uri"
                    },
                    "permanentAddress": {
                      "type": "object",
                      "properties": {
                        "line1": {
                          "type": "string",
                          "minLength": 1
                        },
                        "line2": {
                          "type": "string"
                        },
                        "city": {
                          "type": "string",
                          "minLength": 1
                        },
                        "state": {
                          "type": "string",
                          "minLength": 1
                        },
                        "pincode": {
                          "type": "string",
                          "minLength": 4
                        },
                        "country": {
                          "default": "India",
                          "type": "string",
                          "minLength": 1
                        }
                      },
                      "required": [
                        "line1",
                        "city",
                        "state",
                        "pincode"
                      ]
                    },
                    "currentAddress": {
                      "type": "object",
                      "properties": {
                        "line1": {
                          "type": "string",
                          "minLength": 1
                        },
                        "line2": {
                          "type": "string"
                        },
                        "city": {
                          "type": "string",
                          "minLength": 1
                        },
                        "state": {
                          "type": "string",
                          "minLength": 1
                        },
                        "pincode": {
                          "type": "string",
                          "minLength": 4
                        },
                        "country": {
                          "default": "India",
                          "type": "string",
                          "minLength": 1
                        }
                      },
                      "required": [
                        "line1",
                        "city",
                        "state",
                        "pincode"
                      ]
                    },
                    "bankDetail": {
                      "type": "object",
                      "properties": {
                        "accountHolderName": {
                          "type": "string",
                          "minLength": 1
                        },
                        "accountNumber": {
                          "type": "string",
                          "minLength": 5
                        },
                        "ifsc": {
                          "type": "string",
                          "pattern": "^[A-Z]{4}0[A-Z0-9]{6}$"
                        },
                        "bankName": {
                          "type": "string",
                          "minLength": 1
                        },
                        "branch": {
                          "type": "string"
                        }
                      },
                      "required": [
                        "accountHolderName",
                        "accountNumber",
                        "ifsc",
                        "bankName"
                      ]
                    }
                  },
                  "required": [
                    "email",
                    "password",
                    "firstName",
                    "lastName",
                    "professionalIdentity",
                    "phone",
                    "aadhaar",
                    "pan",
                    "bloodGroup",
                    "photoUrl",
                    "permanentAddress",
                    "bankDetail"
                  ]
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient role/permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Submit organisation onboarding form (candidate)",
          "tags": [
            "organisation-onboarding"
          ]
        }
      },
      "/api/v1/organisation-onboarding/forms/{onboardingId}/uploads": {
        "post": {
          "description": "Public. Authenticates with temp email + password (multipart fields). Stores the file and returns an asset URL for photoUrl / salarySlipUrl / relievingLetterUrl.",
          "operationId": "OrganisationOnboardingController_uploadFormFile",
          "parameters": [
            {
              "name": "onboardingId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "required": [
                    "file",
                    "email",
                    "password"
                  ],
                  "properties": {
                    "file": {
                      "type": "string",
                      "format": "binary"
                    },
                    "email": {
                      "type": "string",
                      "format": "email"
                    },
                    "password": {
                      "type": "string"
                    },
                    "folder": {
                      "type": "string",
                      "example": "photos",
                      "description": "Optional subfolder under onboarding/{id}/"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient role/permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Upload a file for organisation onboarding (candidate)",
          "tags": [
            "organisation-onboarding"
          ]
        }
      },
      "/api/v1/organisation-onboarding": {
        "get": {
          "description": "Requires onboarding:read (SUPER_ADMIN, HR_ADMIN, MANAGER). Filter by status INCOMPLETE|FILLED|VERIFIED.",
          "operationId": "OrganisationOnboardingController_list",
          "parameters": [
            {
              "name": "status",
              "required": false,
              "in": "query",
              "schema": {
                "enum": [
                  "INCOMPLETE",
                  "FILLED",
                  "VERIFIED"
                ],
                "type": "string"
              }
            },
            {
              "name": "skip",
              "required": false,
              "in": "query",
              "schema": {
                "default": 0,
                "type": "integer",
                "minimum": 0,
                "maximum": 9007199254740991
              }
            },
            {
              "name": "take",
              "required": false,
              "in": "query",
              "schema": {
                "default": 50,
                "type": "integer",
                "minimum": 1,
                "maximum": 100
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient role/permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "List organisation onboardings",
          "tags": [
            "organisation-onboarding"
          ]
        }
      },
      "/api/v1/organisation-onboarding/{id}/verify": {
        "post": {
          "description": "Requires onboarding:verify (SUPER_ADMIN, HR_ADMIN). Creates Employee + EmployeeDocuments from the FILLED form, claims the temp user, and sets status VERIFIED.",
          "operationId": "OrganisationOnboardingController_verify",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "designation": {
                      "type": "string",
                      "minLength": 1
                    },
                    "dateOfJoining": {
                      "type": "string",
                      "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
                    },
                    "employmentStatus": {
                      "type": "string",
                      "enum": [
                        "ACTIVE",
                        "ON_LEAVE",
                        "PROBATION",
                        "TERMINATED"
                      ]
                    },
                    "deviceId": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 128
                    },
                    "departmentId": {
                      "type": "string",
                      "minLength": 1
                    },
                    "deviceUserId": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 50
                    },
                    "role": {
                      "default": "EMPLOYEE",
                      "type": "string",
                      "enum": [
                        "EMPLOYEE",
                        "HR_ADMIN",
                        "MANAGER",
                        "SUPER_ADMIN"
                      ]
                    }
                  },
                  "required": [
                    "designation",
                    "dateOfJoining",
                    "employmentStatus",
                    "deviceId"
                  ]
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient role/permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Verify organisation onboarding and promote to employee",
          "tags": [
            "organisation-onboarding"
          ]
        }
      },
      "/api/v1/organisation-onboarding/{id}": {
        "get": {
          "description": "Requires onboarding:read (SUPER_ADMIN, HR_ADMIN, MANAGER). Returns seed identity and filled form fields when available.",
          "operationId": "OrganisationOnboardingController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient role/permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Get organisation onboarding by id",
          "tags": [
            "organisation-onboarding"
          ]
        }
      },
      "/api/v1/uploads": {
        "post": {
          "description": "Requires a valid access JWT. Any active role can upload (SUPER_ADMIN, HR_ADMIN, MANAGER, EMPLOYEE, and temporary onboarding users). Multipart fields: file (any format, max 10MB) + folder (e.g. onboarding/photos). Returns a public asset URL under the configured S3 bucket.",
          "operationId": "UploadsController_upload",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "$ref": "#/components/schemas/UploadFileDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Upload a file to S3 and return the asset URL",
          "tags": [
            "uploads"
          ]
        }
      },
      "/api/v1/leads": {
        "post": {
          "operationId": "LeadsController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "fullName": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 200
                    },
                    "email": {
                      "type": "string",
                      "format": "email",
                      "pattern": "^(?:[A-Za-z0-9_'+\\-]+\\.)*[A-Za-z0-9_'+\\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\\-]*\\.)+[A-Za-z]{2,}$"
                    },
                    "phone": {
                      "type": "string",
                      "minLength": 5,
                      "maxLength": 30
                    },
                    "companyName": {
                      "type": "string",
                      "maxLength": 200
                    },
                    "sourceId": {
                      "type": "string",
                      "minLength": 1
                    },
                    "categoryId": {
                      "type": "string",
                      "minLength": 1
                    },
                    "priority": {
                      "default": "MEDIUM",
                      "type": "string",
                      "enum": [
                        "LOW",
                        "MEDIUM",
                        "HIGH"
                      ]
                    },
                    "estimatedValue": {
                      "type": "integer",
                      "minimum": 0,
                      "maximum": 9007199254740991
                    },
                    "attachmentUrl": {
                      "type": "string",
                      "format": "uri"
                    },
                    "remarks": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 5000
                    }
                  },
                  "required": [
                    "email",
                    "phone",
                    "sourceId"
                  ],
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Create a lead",
          "tags": [
            "leads"
          ]
        },
        "get": {
          "operationId": "LeadsController_findAll",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "integer",
                "minimum": 1,
                "maximum": 9007199254740991
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "default": 20,
                "type": "integer",
                "minimum": 1,
                "maximum": 100
              }
            },
            {
              "name": "status",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "enum": [
                  "NEW",
                  "CONTACTED",
                  "QUALIFIED",
                  "PROPOSAL",
                  "NEGOTIATION",
                  "WON",
                  "LOST"
                ]
              }
            },
            {
              "name": "priority",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "enum": [
                  "LOW",
                  "MEDIUM",
                  "HIGH"
                ]
              }
            },
            {
              "name": "sourceId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            },
            {
              "name": "categoryId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            },
            {
              "name": "assignedEmployeeId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            },
            {
              "name": "search",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1,
                "maxLength": 200
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "List leads (all authenticated readers)",
          "tags": [
            "leads"
          ]
        }
      },
      "/api/v1/leads/duplicate-check": {
        "post": {
          "operationId": "LeadsController_duplicateCheck",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "email": {
                      "type": "string",
                      "format": "email",
                      "pattern": "^(?:[A-Za-z0-9_'+\\-]+\\.)*[A-Za-z0-9_'+\\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\\-]*\\.)+[A-Za-z]{2,}$"
                    },
                    "phone": {
                      "type": "string",
                      "minLength": 5,
                      "maxLength": 30
                    }
                  },
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Check for duplicate leads by email/phone",
          "tags": [
            "leads"
          ]
        }
      },
      "/api/v1/leads/analytics": {
        "get": {
          "operationId": "LeadsController_analytics",
          "parameters": [
            {
              "name": "fromDate",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
              }
            },
            {
              "name": "toDate",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Lead analytics by status and priority",
          "tags": [
            "leads"
          ]
        }
      },
      "/api/v1/leads/{id}": {
        "get": {
          "operationId": "LeadsController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Get lead by id (includes notes)",
          "tags": [
            "leads"
          ]
        },
        "patch": {
          "description": "Does not change status, priority, or assignee — use dedicated endpoints.",
          "operationId": "LeadsController_update",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "fullName": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 200
                    },
                    "email": {
                      "type": "string",
                      "format": "email",
                      "pattern": "^(?:[A-Za-z0-9_'+\\-]+\\.)*[A-Za-z0-9_'+\\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\\-]*\\.)+[A-Za-z]{2,}$"
                    },
                    "phone": {
                      "type": "string",
                      "minLength": 5,
                      "maxLength": 30
                    },
                    "companyName": {
                      "nullable": true,
                      "type": "string",
                      "maxLength": 200
                    },
                    "sourceId": {
                      "type": "string",
                      "minLength": 1
                    },
                    "categoryId": {
                      "nullable": true,
                      "type": "string",
                      "minLength": 1
                    },
                    "estimatedValue": {
                      "nullable": true,
                      "type": "integer",
                      "minimum": 0,
                      "maximum": 9007199254740991
                    },
                    "attachmentUrl": {
                      "nullable": true,
                      "type": "string",
                      "format": "uri"
                    }
                  },
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Update lead contact/value fields",
          "tags": [
            "leads"
          ]
        },
        "delete": {
          "operationId": "LeadsController_remove",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Delete a lead",
          "tags": [
            "leads"
          ]
        }
      },
      "/api/v1/leads/{id}/assign": {
        "patch": {
          "operationId": "LeadsController_assign",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "employeeId": {
                      "type": "string",
                      "minLength": 1
                    }
                  },
                  "required": [
                    "employeeId"
                  ],
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Assign lead to an employee",
          "tags": [
            "leads"
          ]
        }
      },
      "/api/v1/leads/{id}/status": {
        "patch": {
          "operationId": "LeadsController_updateStatus",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "status": {
                      "type": "string",
                      "enum": [
                        "NEW",
                        "CONTACTED",
                        "QUALIFIED",
                        "PROPOSAL",
                        "NEGOTIATION",
                        "WON",
                        "LOST"
                      ]
                    }
                  },
                  "required": [
                    "status"
                  ],
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Update lead status",
          "tags": [
            "leads"
          ]
        }
      },
      "/api/v1/leads/{id}/priority": {
        "patch": {
          "operationId": "LeadsController_updatePriority",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "priority": {
                      "type": "string",
                      "enum": [
                        "LOW",
                        "MEDIUM",
                        "HIGH"
                      ]
                    }
                  },
                  "required": [
                    "priority"
                  ],
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Update lead priority",
          "tags": [
            "leads"
          ]
        }
      },
      "/api/v1/leads/{id}/notes": {
        "post": {
          "operationId": "LeadsController_addNote",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "body": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 5000
                    }
                  },
                  "required": [
                    "body"
                  ],
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Add a remark/note on a lead",
          "tags": [
            "leads"
          ]
        }
      },
      "/api/v1/lead-sources": {
        "post": {
          "operationId": "LeadSourcesController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "code": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 50
                    },
                    "name": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 200
                    },
                    "description": {
                      "type": "string",
                      "maxLength": 2000
                    },
                    "isActive": {
                      "default": true,
                      "type": "boolean"
                    }
                  },
                  "required": [
                    "code",
                    "name"
                  ],
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Create a lead source",
          "tags": [
            "lead-sources"
          ]
        },
        "get": {
          "operationId": "LeadSourcesController_findAll",
          "parameters": [
            {
              "name": "isActive",
              "required": false,
              "in": "query",
              "schema": {
                "type": "boolean"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "List lead sources",
          "tags": [
            "lead-sources"
          ]
        }
      },
      "/api/v1/lead-categories": {
        "post": {
          "operationId": "LeadCategoriesController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "code": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 50
                    },
                    "name": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 200
                    },
                    "description": {
                      "type": "string",
                      "maxLength": 2000
                    },
                    "isActive": {
                      "default": true,
                      "type": "boolean"
                    }
                  },
                  "required": [
                    "code",
                    "name"
                  ],
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Create a lead category",
          "tags": [
            "lead-categories"
          ]
        },
        "get": {
          "operationId": "LeadCategoriesController_findAll",
          "parameters": [
            {
              "name": "isActive",
              "required": false,
              "in": "query",
              "schema": {
                "type": "boolean"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "List lead categories",
          "tags": [
            "lead-categories"
          ]
        }
      },
      "/api/v1/recruitment/jobs": {
        "post": {
          "description": "Creates a recruitment job with title, optional department, employment type, location, work mode, openings, experience, salary, description, requirements, skills, deadline and status. Writes an immutable history entry.",
          "operationId": "JobsController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "title": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 200
                    },
                    "departmentId": {
                      "type": "string",
                      "minLength": 1
                    },
                    "employmentType": {
                      "type": "string",
                      "enum": [
                        "FULL_TIME",
                        "PART_TIME",
                        "CONTRACT",
                        "INTERN",
                        "TEMPORARY"
                      ]
                    },
                    "location": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 200
                    },
                    "workMode": {
                      "type": "string",
                      "enum": [
                        "ONSITE",
                        "REMOTE",
                        "HYBRID"
                      ]
                    },
                    "openings": {
                      "default": 1,
                      "type": "integer",
                      "minimum": 1,
                      "maximum": 9999
                    },
                    "minExperienceYears": {
                      "type": "number",
                      "minimum": 0,
                      "maximum": 50
                    },
                    "maxExperienceYears": {
                      "type": "number",
                      "minimum": 0,
                      "maximum": 50
                    },
                    "salaryMin": {
                      "type": "number",
                      "minimum": 0
                    },
                    "salaryMax": {
                      "type": "number",
                      "minimum": 0
                    },
                    "salaryCurrency": {
                      "type": "string",
                      "minLength": 3,
                      "maxLength": 3
                    },
                    "description": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 20000
                    },
                    "requirements": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 20000
                    },
                    "skills": {
                      "maxItems": 50,
                      "type": "array",
                      "items": {
                        "type": "string",
                        "minLength": 1,
                        "maxLength": 100
                      }
                    },
                    "applicationDeadline": {
                      "type": "string",
                      "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
                    },
                    "status": {
                      "default": "DRAFT",
                      "type": "string",
                      "enum": [
                        "DRAFT",
                        "PUBLISHED",
                        "CLOSED",
                        "CANCELLED"
                      ]
                    }
                  },
                  "required": [
                    "title",
                    "employmentType",
                    "location",
                    "workMode",
                    "description"
                  ],
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Create a job posting",
          "tags": [
            "recruitment-jobs"
          ]
        },
        "get": {
          "description": "Paginated list with search (title/location/description/requirements), filters (status, departmentId, employmentType, workMode, isActive), and sorting.",
          "operationId": "JobsController_findAll",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "integer",
                "minimum": 1,
                "maximum": 9007199254740991
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "default": 20,
                "type": "integer",
                "minimum": 1,
                "maximum": 100
              }
            },
            {
              "name": "search",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1,
                "maxLength": 200
              }
            },
            {
              "name": "status",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "enum": [
                  "DRAFT",
                  "PUBLISHED",
                  "CLOSED",
                  "CANCELLED"
                ]
              }
            },
            {
              "name": "departmentId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            },
            {
              "name": "employmentType",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "enum": [
                  "FULL_TIME",
                  "PART_TIME",
                  "CONTRACT",
                  "INTERN",
                  "TEMPORARY"
                ]
              }
            },
            {
              "name": "workMode",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "enum": [
                  "ONSITE",
                  "REMOTE",
                  "HYBRID"
                ]
              }
            },
            {
              "name": "isActive",
              "required": false,
              "in": "query",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "name": "sortBy",
              "required": false,
              "in": "query",
              "schema": {
                "default": "createdAt",
                "type": "string",
                "enum": [
                  "createdAt",
                  "updatedAt",
                  "title",
                  "applicationDeadline",
                  "status",
                  "openings"
                ]
              }
            },
            {
              "name": "sortOrder",
              "required": false,
              "in": "query",
              "schema": {
                "default": "desc",
                "type": "string",
                "enum": [
                  "asc",
                  "desc"
                ]
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "List job postings",
          "tags": [
            "recruitment-jobs"
          ]
        }
      },
      "/api/v1/recruitment/jobs/{id}": {
        "get": {
          "description": "Includes skills, application count, and recent history.",
          "operationId": "JobsController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Get job posting details",
          "tags": [
            "recruitment-jobs"
          ]
        },
        "patch": {
          "description": "Updates job fields except description (use PATCH /:id/description). Records history; status changes are logged separately.",
          "operationId": "JobsController_update",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "title": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 200
                    },
                    "departmentId": {
                      "nullable": true,
                      "type": "string",
                      "minLength": 1
                    },
                    "employmentType": {
                      "type": "string",
                      "enum": [
                        "FULL_TIME",
                        "PART_TIME",
                        "CONTRACT",
                        "INTERN",
                        "TEMPORARY"
                      ]
                    },
                    "location": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 200
                    },
                    "workMode": {
                      "type": "string",
                      "enum": [
                        "ONSITE",
                        "REMOTE",
                        "HYBRID"
                      ]
                    },
                    "openings": {
                      "type": "integer",
                      "minimum": 1,
                      "maximum": 9999
                    },
                    "minExperienceYears": {
                      "nullable": true,
                      "type": "number",
                      "minimum": 0,
                      "maximum": 50
                    },
                    "maxExperienceYears": {
                      "nullable": true,
                      "type": "number",
                      "minimum": 0,
                      "maximum": 50
                    },
                    "salaryMin": {
                      "nullable": true,
                      "type": "number",
                      "minimum": 0
                    },
                    "salaryMax": {
                      "nullable": true,
                      "type": "number",
                      "minimum": 0
                    },
                    "salaryCurrency": {
                      "type": "string",
                      "minLength": 3,
                      "maxLength": 3
                    },
                    "requirements": {
                      "nullable": true,
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 20000
                    },
                    "skills": {
                      "maxItems": 50,
                      "type": "array",
                      "items": {
                        "type": "string",
                        "minLength": 1,
                        "maxLength": 100
                      }
                    },
                    "applicationDeadline": {
                      "nullable": true,
                      "type": "string",
                      "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
                    },
                    "status": {
                      "type": "string",
                      "enum": [
                        "DRAFT",
                        "PUBLISHED",
                        "CLOSED",
                        "CANCELLED"
                      ]
                    }
                  },
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Update a job posting",
          "tags": [
            "recruitment-jobs"
          ]
        },
        "delete": {
          "description": "Always soft-deactivates (isActive=false). Hard delete is never performed when applications exist; history is preserved.",
          "operationId": "JobsController_remove",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Soft-delete / deactivate a job posting",
          "tags": [
            "recruitment-jobs"
          ]
        }
      },
      "/api/v1/recruitment/jobs/{id}/description": {
        "patch": {
          "description": "Dedicated description update that writes a DESCRIPTION_UPDATED history entry.",
          "operationId": "JobsController_updateDescription",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "description": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 20000
                    }
                  },
                  "required": [
                    "description"
                  ],
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Update job description",
          "tags": [
            "recruitment-jobs"
          ]
        }
      },
      "/api/v1/recruitment/candidates": {
        "post": {
          "description": "Creates a candidate profile. Email and phone must be unique in the candidate pool.",
          "operationId": "CandidatesController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "fullName": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 200
                    },
                    "email": {
                      "type": "string",
                      "format": "email",
                      "pattern": "^(?:[A-Za-z0-9_'+\\-]+\\.)*[A-Za-z0-9_'+\\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\\-]*\\.)+[A-Za-z]{2,}$"
                    },
                    "phone": {
                      "type": "string",
                      "minLength": 5,
                      "maxLength": 30
                    },
                    "location": {
                      "type": "string",
                      "maxLength": 200
                    },
                    "experienceYears": {
                      "type": "number",
                      "minimum": 0,
                      "maximum": 50
                    },
                    "currentCompany": {
                      "type": "string",
                      "maxLength": 200
                    },
                    "currentDesignation": {
                      "type": "string",
                      "maxLength": 200
                    },
                    "skills": {
                      "maxItems": 50,
                      "type": "array",
                      "items": {
                        "type": "string",
                        "minLength": 1,
                        "maxLength": 100
                      }
                    },
                    "source": {
                      "default": "OTHER",
                      "type": "string",
                      "enum": [
                        "CAREER_PAGE",
                        "REFERRAL",
                        "LINKEDIN",
                        "JOB_PORTAL",
                        "AGENCY",
                        "WALK_IN",
                        "OTHER"
                      ]
                    }
                  },
                  "required": [
                    "fullName",
                    "email",
                    "phone"
                  ],
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Register a candidate",
          "tags": [
            "recruitment-candidates"
          ]
        },
        "get": {
          "description": "Paginated list with search/filters (source, isActive, skill) and sorting.",
          "operationId": "CandidatesController_findAll",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "integer",
                "minimum": 1,
                "maximum": 9007199254740991
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "default": 20,
                "type": "integer",
                "minimum": 1,
                "maximum": 100
              }
            },
            {
              "name": "search",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1,
                "maxLength": 200
              }
            },
            {
              "name": "source",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "enum": [
                  "CAREER_PAGE",
                  "REFERRAL",
                  "LINKEDIN",
                  "JOB_PORTAL",
                  "AGENCY",
                  "WALK_IN",
                  "OTHER"
                ]
              }
            },
            {
              "name": "isActive",
              "required": false,
              "in": "query",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "name": "skill",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1,
                "maxLength": 100
              }
            },
            {
              "name": "sortBy",
              "required": false,
              "in": "query",
              "schema": {
                "default": "createdAt",
                "type": "string",
                "enum": [
                  "createdAt",
                  "updatedAt",
                  "fullName",
                  "experienceYears"
                ]
              }
            },
            {
              "name": "sortOrder",
              "required": false,
              "in": "query",
              "schema": {
                "default": "desc",
                "type": "string",
                "enum": [
                  "asc",
                  "desc"
                ]
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "List candidates",
          "tags": [
            "recruitment-candidates"
          ]
        }
      },
      "/api/v1/recruitment/candidates/me": {
        "get": {
          "description": "Looks up an active candidate whose email matches the authenticated user. Used by the internal job board so employees/managers can apply without candidates:read over the full ATS pool.",
          "operationId": "CandidatesController_findMine",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Get candidate profile for the signed-in user",
          "tags": [
            "recruitment-candidates"
          ]
        }
      },
      "/api/v1/recruitment/candidates/search": {
        "get": {
          "description": "Full-text style search across name, email, phone, location, company, designation and skills.",
          "operationId": "CandidatesController_search",
          "parameters": [
            {
              "name": "q",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1,
                "maxLength": 200
              }
            },
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "integer",
                "minimum": 1,
                "maximum": 9007199254740991
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "default": 20,
                "type": "integer",
                "minimum": 1,
                "maximum": 100
              }
            },
            {
              "name": "source",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "enum": [
                  "CAREER_PAGE",
                  "REFERRAL",
                  "LINKEDIN",
                  "JOB_PORTAL",
                  "AGENCY",
                  "WALK_IN",
                  "OTHER"
                ]
              }
            },
            {
              "name": "isActive",
              "required": false,
              "in": "query",
              "schema": {
                "type": "boolean"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Search candidate database",
          "tags": [
            "recruitment-candidates"
          ]
        }
      },
      "/api/v1/recruitment/candidates/{id}/status": {
        "get": {
          "description": "Returns all applications for the candidate with current pipeline status, job info, and a status summary.",
          "operationId": "CandidatesController_applicationStatus",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Get candidate application-wise status",
          "tags": [
            "recruitment-candidates"
          ]
        }
      },
      "/api/v1/recruitment/candidates/{id}": {
        "get": {
          "description": "Includes skills and all resume versions.",
          "operationId": "CandidatesController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Get candidate details",
          "tags": [
            "recruitment-candidates"
          ]
        },
        "patch": {
          "description": "Apply reviewed profile changes (including fields taken from resume parse). Does not auto-apply parse results.",
          "operationId": "CandidatesController_update",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "fullName": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 200
                    },
                    "email": {
                      "type": "string",
                      "format": "email",
                      "pattern": "^(?:[A-Za-z0-9_'+\\-]+\\.)*[A-Za-z0-9_'+\\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\\-]*\\.)+[A-Za-z]{2,}$"
                    },
                    "phone": {
                      "type": "string",
                      "minLength": 5,
                      "maxLength": 30
                    },
                    "location": {
                      "nullable": true,
                      "type": "string",
                      "maxLength": 200
                    },
                    "experienceYears": {
                      "nullable": true,
                      "type": "number",
                      "minimum": 0,
                      "maximum": 50
                    },
                    "currentCompany": {
                      "nullable": true,
                      "type": "string",
                      "maxLength": 200
                    },
                    "currentDesignation": {
                      "nullable": true,
                      "type": "string",
                      "maxLength": 200
                    },
                    "skills": {
                      "maxItems": 50,
                      "type": "array",
                      "items": {
                        "type": "string",
                        "minLength": 1,
                        "maxLength": 100
                      }
                    },
                    "source": {
                      "type": "string",
                      "enum": [
                        "CAREER_PAGE",
                        "REFERRAL",
                        "LINKEDIN",
                        "JOB_PORTAL",
                        "AGENCY",
                        "WALK_IN",
                        "OTHER"
                      ]
                    },
                    "isActive": {
                      "type": "boolean"
                    }
                  },
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Update candidate",
          "tags": [
            "recruitment-candidates"
          ]
        }
      },
      "/api/v1/recruitment/candidates/{id}/resume": {
        "post": {
          "description": "Accepts PDF or DOCX (max 5MB) via existing storage disk. Previous resumes are preserved as older versions. Parsed fields are returned for HR review and are not auto-applied.",
          "operationId": "CandidatesController_uploadResume",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "required": [
                    "file"
                  ],
                  "properties": {
                    "file": {
                      "type": "string",
                      "format": "binary"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Upload candidate resume",
          "tags": [
            "recruitment-candidates"
          ]
        }
      },
      "/api/v1/recruitment/resume/parse": {
        "post": {
          "description": "Extracts contact info, skills, experience, education and previous companies from a PDF/DOCX resume. Results are for HR review only and do not update candidate records until PATCH /recruitment/candidates/:id.",
          "operationId": "ResumeController_parse",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "required": [
                    "file"
                  ],
                  "properties": {
                    "file": {
                      "type": "string",
                      "format": "binary"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Parse a resume",
          "tags": [
            "recruitment-resume"
          ]
        }
      },
      "/api/v1/recruitment/applications": {
        "post": {
          "description": "Creates an application linked to an existing candidate and job posting. Blocks duplicate active applications for the same pair. Writes an initial APPLIED history entry.",
          "operationId": "ApplicationsController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "jobPostingId": {
                      "type": "string",
                      "minLength": 1
                    },
                    "candidateId": {
                      "type": "string",
                      "minLength": 1
                    },
                    "source": {
                      "default": "OTHER",
                      "type": "string",
                      "enum": [
                        "CAREER_PAGE",
                        "REFERRAL",
                        "LINKEDIN",
                        "JOB_PORTAL",
                        "AGENCY",
                        "WALK_IN",
                        "OTHER"
                      ]
                    },
                    "coverLetter": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 10000
                    },
                    "appliedAt": {
                      "type": "string",
                      "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
                    }
                  },
                  "required": [
                    "jobPostingId",
                    "candidateId"
                  ],
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Apply candidate to a job",
          "tags": [
            "recruitment-applications"
          ]
        },
        "get": {
          "description": "Paginated applications with filters: jobPostingId, candidateId, status, departmentId, source, fromDate, toDate.",
          "operationId": "ApplicationsController_findAll",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "integer",
                "minimum": 1,
                "maximum": 9007199254740991
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "default": 20,
                "type": "integer",
                "minimum": 1,
                "maximum": 100
              }
            },
            {
              "name": "jobPostingId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            },
            {
              "name": "candidateId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            },
            {
              "name": "status",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "enum": [
                  "APPLIED",
                  "SCREENING",
                  "SHORTLISTED",
                  "INTERVIEW",
                  "SELECTED",
                  "OFFER_RELEASED",
                  "JOINED",
                  "REJECTED",
                  "WITHDRAWN"
                ]
              }
            },
            {
              "name": "departmentId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            },
            {
              "name": "source",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "enum": [
                  "CAREER_PAGE",
                  "REFERRAL",
                  "LINKEDIN",
                  "JOB_PORTAL",
                  "AGENCY",
                  "WALK_IN",
                  "OTHER"
                ]
              }
            },
            {
              "name": "fromDate",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
              }
            },
            {
              "name": "toDate",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
              }
            },
            {
              "name": "sortBy",
              "required": false,
              "in": "query",
              "schema": {
                "default": "appliedAt",
                "type": "string",
                "enum": [
                  "appliedAt",
                  "createdAt",
                  "updatedAt",
                  "status"
                ]
              }
            },
            {
              "name": "sortOrder",
              "required": false,
              "in": "query",
              "schema": {
                "default": "desc",
                "type": "string",
                "enum": [
                  "asc",
                  "desc"
                ]
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "List applications",
          "tags": [
            "recruitment-applications"
          ]
        }
      },
      "/api/v1/recruitment/applications/me": {
        "get": {
          "description": "Returns applications for the active candidate whose email matches the authenticated user. Used by the employee/manager internal job board without granting applications:read over the full ATS pipeline.",
          "operationId": "ApplicationsController_findMine",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "integer",
                "minimum": 1,
                "maximum": 9007199254740991
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "default": 20,
                "type": "integer",
                "minimum": 1,
                "maximum": 100
              }
            },
            {
              "name": "jobPostingId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            },
            {
              "name": "candidateId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            },
            {
              "name": "status",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "enum": [
                  "APPLIED",
                  "SCREENING",
                  "SHORTLISTED",
                  "INTERVIEW",
                  "SELECTED",
                  "OFFER_RELEASED",
                  "JOINED",
                  "REJECTED",
                  "WITHDRAWN"
                ]
              }
            },
            {
              "name": "departmentId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            },
            {
              "name": "source",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "enum": [
                  "CAREER_PAGE",
                  "REFERRAL",
                  "LINKEDIN",
                  "JOB_PORTAL",
                  "AGENCY",
                  "WALK_IN",
                  "OTHER"
                ]
              }
            },
            {
              "name": "fromDate",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
              }
            },
            {
              "name": "toDate",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
              }
            },
            {
              "name": "sortBy",
              "required": false,
              "in": "query",
              "schema": {
                "default": "appliedAt",
                "type": "string",
                "enum": [
                  "appliedAt",
                  "createdAt",
                  "updatedAt",
                  "status"
                ]
              }
            },
            {
              "name": "sortOrder",
              "required": false,
              "in": "query",
              "schema": {
                "default": "desc",
                "type": "string",
                "enum": [
                  "asc",
                  "desc"
                ]
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "List applications for the signed-in user",
          "tags": [
            "recruitment-applications"
          ]
        }
      },
      "/api/v1/recruitment/applications/{id}": {
        "get": {
          "description": "Includes job, candidate, and immutable status history.",
          "operationId": "ApplicationsController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Get application details",
          "tags": [
            "recruitment-applications"
          ]
        }
      },
      "/api/v1/recruitment/applications/{id}/status": {
        "patch": {
          "description": "Validates allowed pipeline transitions and appends an immutable status history row (previous status, new status, actor, timestamp).",
          "operationId": "ApplicationsController_updateStatus",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "status": {
                      "type": "string",
                      "enum": [
                        "APPLIED",
                        "SCREENING",
                        "SHORTLISTED",
                        "INTERVIEW",
                        "SELECTED",
                        "OFFER_RELEASED",
                        "JOINED",
                        "REJECTED",
                        "WITHDRAWN"
                      ]
                    },
                    "note": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 2000
                    }
                  },
                  "required": [
                    "status"
                  ],
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Update application status",
          "tags": [
            "recruitment-applications"
          ]
        }
      },
      "/api/v1/recruitment/interviews": {
        "post": {
          "description": "Schedules a round against an application in SCREENING, SHORTLISTED or INTERVIEW. Supports type, ONLINE/ONSITE mode (meetingLink / location required respectively), ISO date-time with timezone, and 15–480 minute duration. Optional interviewerEmployeeIds are checked for calendar conflicts. Does not change the application status.",
          "operationId": "InterviewsController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "applicationId": {
                      "type": "string",
                      "minLength": 1
                    },
                    "roundNumber": {
                      "type": "integer",
                      "minimum": 1,
                      "maximum": 20
                    },
                    "type": {
                      "default": "TECHNICAL",
                      "type": "string",
                      "enum": [
                        "HR",
                        "TECHNICAL",
                        "MANAGERIAL",
                        "CULTURAL_FIT",
                        "OTHER"
                      ]
                    },
                    "mode": {
                      "type": "string",
                      "enum": [
                        "ONLINE",
                        "ONSITE"
                      ]
                    },
                    "scheduledAt": {
                      "type": "string",
                      "format": "date-time",
                      "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d(?:\\.\\d+)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                    },
                    "durationMinutes": {
                      "default": 60,
                      "type": "integer",
                      "minimum": 15,
                      "maximum": 480
                    },
                    "meetingLink": {
                      "type": "string",
                      "maxLength": 2000,
                      "format": "uri"
                    },
                    "location": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 300
                    },
                    "notes": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 5000
                    },
                    "interviewerEmployeeIds": {
                      "maxItems": 10,
                      "type": "array",
                      "items": {
                        "type": "string",
                        "minLength": 1
                      }
                    }
                  },
                  "required": [
                    "applicationId",
                    "mode",
                    "scheduledAt"
                  ],
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Schedule an interview",
          "tags": [
            "recruitment-interviews"
          ]
        },
        "get": {
          "description": "Paginated list with filters (applicationId, candidateId, jobPostingId, interviewerEmployeeId, status, mode, type, fromDate, toDate) and sorting. Users with only interviews:read_assigned see just interviews they are assigned to.",
          "operationId": "InterviewsController_findAll",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "integer",
                "minimum": 1,
                "maximum": 9007199254740991
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "default": 20,
                "type": "integer",
                "minimum": 1,
                "maximum": 100
              }
            },
            {
              "name": "applicationId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            },
            {
              "name": "candidateId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            },
            {
              "name": "jobPostingId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            },
            {
              "name": "interviewerEmployeeId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            },
            {
              "name": "status",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "enum": [
                  "SCHEDULED",
                  "COMPLETED",
                  "CANCELLED",
                  "RESCHEDULED"
                ]
              }
            },
            {
              "name": "mode",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "enum": [
                  "ONLINE",
                  "ONSITE"
                ]
              }
            },
            {
              "name": "type",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "enum": [
                  "HR",
                  "TECHNICAL",
                  "MANAGERIAL",
                  "CULTURAL_FIT",
                  "OTHER"
                ]
              }
            },
            {
              "name": "fromDate",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
              }
            },
            {
              "name": "toDate",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
              }
            },
            {
              "name": "sortBy",
              "required": false,
              "in": "query",
              "schema": {
                "default": "scheduledAt",
                "type": "string",
                "enum": [
                  "scheduledAt",
                  "createdAt",
                  "roundNumber",
                  "status"
                ]
              }
            },
            {
              "name": "sortOrder",
              "required": false,
              "in": "query",
              "schema": {
                "default": "desc",
                "type": "string",
                "enum": [
                  "asc",
                  "desc"
                ]
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "List interviews",
          "tags": [
            "recruitment-interviews"
          ]
        }
      },
      "/api/v1/recruitment/interviews/{id}": {
        "get": {
          "description": "Includes application/candidate/job, interviewers and immutable history. Users with only interviews:read_assigned may open interviews assigned to them.",
          "operationId": "InterviewsController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Get interview details",
          "tags": [
            "recruitment-interviews"
          ]
        },
        "patch": {
          "description": "Changing scheduledAt reschedules (status RESCHEDULED, conflicts re-checked, must be in the future). status may be set to COMPLETED (only once started), CANCELLED or RESCHEDULED. COMPLETED and CANCELLED are terminal. Every change appends a history row.",
          "operationId": "InterviewsController_update",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "type": {
                      "type": "string",
                      "enum": [
                        "HR",
                        "TECHNICAL",
                        "MANAGERIAL",
                        "CULTURAL_FIT",
                        "OTHER"
                      ]
                    },
                    "mode": {
                      "type": "string",
                      "enum": [
                        "ONLINE",
                        "ONSITE"
                      ]
                    },
                    "scheduledAt": {
                      "type": "string",
                      "format": "date-time",
                      "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d(?:\\.\\d+)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                    },
                    "durationMinutes": {
                      "type": "integer",
                      "minimum": 15,
                      "maximum": 480
                    },
                    "meetingLink": {
                      "nullable": true,
                      "type": "string",
                      "maxLength": 2000,
                      "format": "uri"
                    },
                    "location": {
                      "nullable": true,
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 300
                    },
                    "notes": {
                      "nullable": true,
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 5000
                    },
                    "status": {
                      "type": "string",
                      "enum": [
                        "SCHEDULED",
                        "COMPLETED",
                        "CANCELLED",
                        "RESCHEDULED"
                      ]
                    },
                    "reason": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 1000
                    }
                  },
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Reschedule or update an interview",
          "tags": [
            "recruitment-interviews"
          ]
        }
      },
      "/api/v1/recruitment/interviews/{id}/interviewers": {
        "post": {
          "description": "Adds existing, non-terminated employees as interviewers (max 10 per interview). Rejects employees who already have an overlapping interview.",
          "operationId": "InterviewsController_assignInterviewers",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "employeeIds": {
                      "maxItems": 10,
                      "type": "array",
                      "items": {
                        "type": "string",
                        "minLength": 1
                      }
                    }
                  },
                  "required": [
                    "employeeIds"
                  ],
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Assign interviewers",
          "tags": [
            "recruitment-interviews"
          ]
        }
      },
      "/api/v1/recruitment/interviews/{id}/feedback": {
        "post": {
          "description": "Only an assigned interviewer (the caller’s linked employee) can submit, once, after the interview has started and if it is not cancelled. Ratings are 1–5; recommendation is PASS, FAIL or HOLD. Feedback is immutable.",
          "operationId": "InterviewsController_submitFeedback",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "overallRating": {
                      "type": "integer",
                      "minimum": 1,
                      "maximum": 5
                    },
                    "technicalRating": {
                      "type": "integer",
                      "minimum": 1,
                      "maximum": 5
                    },
                    "communicationRating": {
                      "type": "integer",
                      "minimum": 1,
                      "maximum": 5
                    },
                    "problemSolvingRating": {
                      "type": "integer",
                      "minimum": 1,
                      "maximum": 5
                    },
                    "cultureFitRating": {
                      "type": "integer",
                      "minimum": 1,
                      "maximum": 5
                    },
                    "strengths": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 5000
                    },
                    "weaknesses": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 5000
                    },
                    "comments": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 5000
                    },
                    "recommendation": {
                      "type": "string",
                      "enum": [
                        "PASS",
                        "FAIL",
                        "HOLD"
                      ]
                    }
                  },
                  "required": [
                    "overallRating",
                    "strengths",
                    "weaknesses",
                    "recommendation"
                  ],
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Submit interview feedback",
          "tags": [
            "recruitment-interviews"
          ]
        },
        "get": {
          "description": "Users with interviews:read_feedback see all feedback plus a summary. Assigned interviewers with only interviews:submit_feedback see just their own.",
          "operationId": "InterviewsController_getFeedback",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Get interview feedback",
          "tags": [
            "recruitment-interviews"
          ]
        }
      },
      "/api/v1/recruitment/offers": {
        "post": {
          "description": "Creates a DRAFT offer for a SELECTED application whose interviews are complete (at least one COMPLETED interview and none pending). Department, employment type and currency default from the job posting. Only one active (DRAFT/RELEASED/ACCEPTED) offer is allowed per application. validUntil must be on or before joiningDate; both must not be in the past. The application status is not changed until the offer is released.",
          "operationId": "OffersController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "applicationId": {
                      "type": "string",
                      "minLength": 1
                    },
                    "designation": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 200
                    },
                    "departmentId": {
                      "type": "string",
                      "minLength": 1
                    },
                    "employmentType": {
                      "type": "string",
                      "enum": [
                        "FULL_TIME",
                        "PART_TIME",
                        "CONTRACT",
                        "INTERN",
                        "TEMPORARY"
                      ]
                    },
                    "annualCtc": {
                      "type": "number",
                      "minimum": 0,
                      "exclusiveMinimum": true,
                      "maximum": 999999999999.99
                    },
                    "fixedAnnual": {
                      "type": "number",
                      "minimum": 0,
                      "maximum": 999999999999.99
                    },
                    "variableAnnual": {
                      "type": "number",
                      "minimum": 0,
                      "maximum": 999999999999.99
                    },
                    "joiningBonus": {
                      "type": "number",
                      "minimum": 0,
                      "maximum": 999999999999.99
                    },
                    "currency": {
                      "type": "string",
                      "minLength": 3,
                      "maxLength": 3
                    },
                    "joiningDate": {
                      "type": "string",
                      "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
                    },
                    "validUntil": {
                      "type": "string",
                      "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
                    },
                    "probationMonths": {
                      "type": "integer",
                      "minimum": 0,
                      "maximum": 24
                    },
                    "reportingManagerEmployeeId": {
                      "type": "string",
                      "minLength": 1
                    },
                    "terms": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 20000
                    }
                  },
                  "required": [
                    "applicationId",
                    "designation",
                    "annualCtc",
                    "joiningDate",
                    "validUntil",
                    "terms"
                  ],
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Create an offer",
          "tags": [
            "recruitment-offers"
          ]
        },
        "get": {
          "description": "Paginated list with search (candidate name/email, job title, designation), filters (status, application, candidate, job, department, employment type, joining date range, created date range) and sorting. Released offers past validUntil are expired before listing.",
          "operationId": "OffersController_findAll",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "integer",
                "minimum": 1,
                "maximum": 9007199254740991
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "default": 20,
                "type": "integer",
                "minimum": 1,
                "maximum": 100
              }
            },
            {
              "name": "search",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1,
                "maxLength": 200
              }
            },
            {
              "name": "status",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "enum": [
                  "DRAFT",
                  "RELEASED",
                  "ACCEPTED",
                  "REJECTED",
                  "EXPIRED",
                  "WITHDRAWN"
                ]
              }
            },
            {
              "name": "applicationId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            },
            {
              "name": "candidateId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            },
            {
              "name": "jobPostingId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            },
            {
              "name": "departmentId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            },
            {
              "name": "employmentType",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "enum": [
                  "FULL_TIME",
                  "PART_TIME",
                  "CONTRACT",
                  "INTERN",
                  "TEMPORARY"
                ]
              }
            },
            {
              "name": "joiningFrom",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
              }
            },
            {
              "name": "joiningTo",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
              }
            },
            {
              "name": "fromDate",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
              }
            },
            {
              "name": "toDate",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
              }
            },
            {
              "name": "sortBy",
              "required": false,
              "in": "query",
              "schema": {
                "default": "createdAt",
                "type": "string",
                "enum": [
                  "createdAt",
                  "joiningDate",
                  "validUntil",
                  "annualCtc",
                  "status"
                ]
              }
            },
            {
              "name": "sortOrder",
              "required": false,
              "in": "query",
              "schema": {
                "default": "desc",
                "type": "string",
                "enum": [
                  "asc",
                  "desc"
                ]
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "List offers",
          "tags": [
            "recruitment-offers"
          ]
        }
      },
      "/api/v1/recruitment/offers/{id}": {
        "get": {
          "description": "Includes application, candidate, job, compensation, offer letter and the immutable status history (newest first).",
          "operationId": "OffersController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Get offer details",
          "tags": [
            "recruitment-offers"
          ]
        }
      },
      "/api/v1/recruitment/offers/{id}/status": {
        "patch": {
          "description": "RELEASED and WITHDRAWN require offers:release; ACCEPTED and REJECTED require offers:respond. Transitions: DRAFT→RELEASED|WITHDRAWN, RELEASED→ACCEPTED|REJECTED|WITHDRAWN, ACCEPTED→WITHDRAWN. EXPIRED is applied automatically after validUntil. Releasing moves the application from SELECTED to OFFER_RELEASED; no other status change touches the application, and accepting an offer does not mark the candidate JOINED. REJECTED and WITHDRAWN require a reason.",
          "operationId": "OffersController_updateStatus",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "status": {
                      "type": "string",
                      "enum": [
                        "RELEASED",
                        "ACCEPTED",
                        "REJECTED",
                        "WITHDRAWN"
                      ]
                    },
                    "reason": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 2000
                    }
                  },
                  "required": [
                    "status"
                  ],
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Release, accept, reject or withdraw an offer",
          "tags": [
            "recruitment-offers"
          ]
        }
      },
      "/api/v1/recruitment/offers/{id}/letter": {
        "post": {
          "description": "Attaches a PDF or DOCX offer letter (max 5MB) to a DRAFT offer using the existing storage disk. Replacing a letter keeps the earlier file in storage and records the change in history.",
          "operationId": "OffersController_uploadLetter",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "required": [
                    "file"
                  ],
                  "properties": {
                    "file": {
                      "type": "string",
                      "format": "binary"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Upload the offer letter",
          "tags": [
            "recruitment-offers"
          ]
        }
      },
      "/api/v1/recruitment/analytics": {
        "get": {
          "description": "Aggregated from live data. Filters: fromDate, toDate (inclusive UTC days, default last 12 months, max 1830 days), departmentId, jobPostingId. Returns totals (jobs, applications, candidates, interviews, offers, hires), monthly application and hiring trends (zero-filled), offer-vs-joined statistics and candidate source distribution. Each metric filters on its own date: jobs.createdAt, applications.appliedAt, interviews.scheduledAt, offers.createdAt (offerStats: releasedAt), hires = JOINED history date. The exact rules are echoed in `dateSemantics`. Candidates and hires are de-duplicated: a candidate with several applications counts once. Callers with recruitment_analytics:read see all departments. Callers with only recruitment_analytics:read_department are limited to the department of their linked employee (403 for another department).",
          "operationId": "RecruitmentAnalyticsController_getAnalytics",
          "parameters": [
            {
              "name": "fromDate",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
              }
            },
            {
              "name": "toDate",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
              }
            },
            {
              "name": "departmentId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            },
            {
              "name": "jobPostingId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission or department"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Recruitment KPIs and analytics",
          "tags": [
            "recruitment-analytics"
          ]
        }
      },
      "/api/v1/recruitment/pipeline": {
        "get": {
          "description": "Returns one entry per application status (APPLIED … WITHDRAWN, zero-filled) with application count, distinct candidate count and percentage of total. Each application is counted once in its current status. Optional fromDate/toDate filter by appliedAt (omit both for an all-time snapshot); departmentId and jobPostingId are optional. Same department-level access rules as GET /recruitment/analytics.",
          "operationId": "RecruitmentAnalyticsController_getPipeline",
          "parameters": [
            {
              "name": "fromDate",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
              }
            },
            {
              "name": "toDate",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
              }
            },
            {
              "name": "departmentId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            },
            {
              "name": "jobPostingId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission or department"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Candidate pipeline counts by stage",
          "tags": [
            "recruitment-analytics"
          ]
        }
      },
      "/api/v1/recruitment/dashboard/overview": {
        "get": {
          "description": "Reuses the Phase 6 analytics calculations. Filters: fromDate, toDate (inclusive UTC days, default last 12 months), departmentId, jobPostingId. kpis: jobs, candidates, applications, interviews, offers, hires – each with the value, the previous-period value (same length, immediately before the range), changePercent (null when the previous value is 0) and direction (up/down/flat). charts: applicationTrend and hiringTrend (zero-filled monthly points), pipelineDistribution (applications in the range by current status) and sourceDistribution. Every chart has an `empty` flag for empty states. Callers with recruitment_analytics:read see all departments. Callers with only recruitment_analytics:read_department are limited to the department of their linked employee (403 for another department or an unlinked account).",
          "operationId": "RecruitmentDashboardController_getOverview",
          "parameters": [
            {
              "name": "fromDate",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
              }
            },
            {
              "name": "toDate",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
              }
            },
            {
              "name": "departmentId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            },
            {
              "name": "jobPostingId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "success": true,
                      "message": "Recruitment dashboard overview retrieved",
                      "data": {
                        "generatedAt": "2026-11-18T10:00:00.000Z",
                        "empty": false,
                        "comparison": {
                          "fromDate": "2025-11-19",
                          "toDate": "2025-11-30"
                        },
                        "kpis": [
                          {
                            "key": "applications",
                            "label": "Total Applications",
                            "value": 42,
                            "previousValue": 30,
                            "changePercent": 40,
                            "direction": "up",
                            "details": {
                              "active": 31
                            }
                          }
                        ],
                        "charts": {
                          "applicationTrend": {
                            "empty": false,
                            "points": [
                              {
                                "month": "2026-11",
                                "applications": 12
                              }
                            ]
                          },
                          "hiringTrend": {
                            "empty": false,
                            "points": [
                              {
                                "month": "2026-11",
                                "hires": 2
                              }
                            ]
                          },
                          "pipelineDistribution": {
                            "empty": false,
                            "stages": [
                              {
                                "status": "APPLIED",
                                "applications": 10,
                                "candidates": 10,
                                "percentage": 23.81
                              }
                            ],
                            "totals": {
                              "applications": 42,
                              "candidates": 40
                            }
                          },
                          "sourceDistribution": {
                            "empty": false,
                            "items": [
                              {
                                "source": "LINKEDIN",
                                "candidates": 20,
                                "percentage": 50
                              }
                            ]
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission or department"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Dashboard KPI cards and chart datasets",
          "tags": [
            "recruitment-dashboard"
          ]
        }
      },
      "/api/v1/recruitment/dashboard/recent-applications": {
        "get": {
          "description": "Newest first (by appliedAt). Paginated with page/limit (limit max 50). Optional filters: fromDate, toDate (appliedAt), departmentId, jobPostingId, status. Callers with recruitment_analytics:read see all departments. Callers with only recruitment_analytics:read_department are limited to the department of their linked employee (403 for another department or an unlinked account).",
          "operationId": "RecruitmentDashboardController_getRecentApplications",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "integer",
                "minimum": 1,
                "maximum": 9007199254740991
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "default": 10,
                "type": "integer",
                "minimum": 1,
                "maximum": 50
              }
            },
            {
              "name": "fromDate",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
              }
            },
            {
              "name": "toDate",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
              }
            },
            {
              "name": "departmentId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            },
            {
              "name": "jobPostingId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            },
            {
              "name": "status",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "enum": [
                  "APPLIED",
                  "SCREENING",
                  "SHORTLISTED",
                  "INTERVIEW",
                  "SELECTED",
                  "OFFER_RELEASED",
                  "JOINED",
                  "REJECTED",
                  "WITHDRAWN"
                ]
              }
            }
          ],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "success": true,
                      "message": "Recent applications retrieved",
                      "data": {
                        "empty": false,
                        "items": [
                          {
                            "applicationId": "clx1",
                            "candidate": {
                              "id": "cand1",
                              "fullName": "Asha Rao",
                              "email": "asha@example.com"
                            },
                            "job": {
                              "id": "job1",
                              "title": "Backend Engineer",
                              "department": {
                                "id": "dep1",
                                "name": "Engineering"
                              }
                            },
                            "appliedAt": "2026-11-17T09:30:00.000Z",
                            "status": "SCREENING",
                            "source": "LINKEDIN"
                          }
                        ],
                        "pagination": {
                          "page": 1,
                          "limit": 10,
                          "total": 1,
                          "totalPages": 1
                        }
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission or department"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Most recent candidate applications",
          "tags": [
            "recruitment-dashboard"
          ]
        }
      },
      "/api/v1/recruitment/dashboard/upcoming-interviews": {
        "get": {
          "description": "Interviews that are SCHEDULED or RESCHEDULED between now and now + daysAhead (default 14, max 90), soonest first, limited to `limit` (default 10, max 50). `total`/`hasMore` tell whether more exist in the window. Optional filters: departmentId, jobPostingId. Callers with recruitment_analytics:read see all departments. Callers with only recruitment_analytics:read_department are limited to the department of their linked employee (403 for another department or an unlinked account).",
          "operationId": "RecruitmentDashboardController_getUpcomingInterviews",
          "parameters": [
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "default": 10,
                "type": "integer",
                "minimum": 1,
                "maximum": 50
              }
            },
            {
              "name": "daysAhead",
              "required": false,
              "in": "query",
              "schema": {
                "default": 14,
                "type": "integer",
                "minimum": 1,
                "maximum": 90
              }
            },
            {
              "name": "departmentId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            },
            {
              "name": "jobPostingId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "success": true,
                      "message": "Upcoming interviews retrieved",
                      "data": {
                        "empty": false,
                        "window": {
                          "from": "2026-11-18T10:00:00.000Z",
                          "to": "2026-12-02T10:00:00.000Z"
                        },
                        "total": 1,
                        "hasMore": false,
                        "items": [
                          {
                            "interviewId": "int1",
                            "applicationId": "clx1",
                            "candidate": {
                              "id": "cand1",
                              "fullName": "Asha Rao",
                              "email": "asha@example.com"
                            },
                            "job": {
                              "id": "job1",
                              "title": "Backend Engineer",
                              "department": {
                                "id": "dep1",
                                "name": "Engineering"
                              }
                            },
                            "roundNumber": 1,
                            "type": "TECHNICAL",
                            "mode": "ONLINE",
                            "status": "SCHEDULED",
                            "scheduledAt": "2026-11-20T09:00:00.000Z",
                            "endsAt": "2026-11-20T10:00:00.000Z",
                            "durationMinutes": 60,
                            "meetingLink": "https://meet.example.com/abc",
                            "location": null,
                            "interviewers": [
                              {
                                "id": "emp1",
                                "employeeCode": "EMP001",
                                "fullName": "Ravi Kumar"
                              }
                            ]
                          }
                        ]
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission or department"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Upcoming scheduled interviews",
          "tags": [
            "recruitment-dashboard"
          ]
        }
      },
      "/api/v1/recruitment/dashboard/activities": {
        "get": {
          "description": "Unified, newest-first feed built from the existing immutable history tables: job posting history (created, updated, status changed, deactivated), application status history (submitted, status changes), interview history (scheduled, rescheduled, interviewers assigned, feedback submitted, completed, cancelled) and offer history (created, released, accepted, rejected, expired, withdrawn, letter uploaded). Paginated with page/limit (limit max 50). Optional filters: fromDate, toDate (event time), departmentId, jobPostingId, entity (JOB, APPLICATION, INTERVIEW, OFFER). `actor` is null for system actions such as automatic offer expiry. Callers with recruitment_analytics:read see all departments. Callers with only recruitment_analytics:read_department are limited to the department of their linked employee (403 for another department or an unlinked account).",
          "operationId": "RecruitmentDashboardController_getActivities",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "integer",
                "minimum": 1,
                "maximum": 9007199254740991
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "default": 20,
                "type": "integer",
                "minimum": 1,
                "maximum": 50
              }
            },
            {
              "name": "fromDate",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
              }
            },
            {
              "name": "toDate",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
              }
            },
            {
              "name": "departmentId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            },
            {
              "name": "jobPostingId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            },
            {
              "name": "entity",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "enum": [
                  "JOB",
                  "APPLICATION",
                  "INTERVIEW",
                  "OFFER"
                ]
              }
            }
          ],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "success": true,
                      "message": "Recruitment activities retrieved",
                      "data": {
                        "empty": false,
                        "items": [
                          {
                            "id": "OFFER:clh1",
                            "entity": "OFFER",
                            "type": "OFFER_RELEASED",
                            "occurredAt": "2026-11-17T12:00:00.000Z",
                            "message": "Offer released for Asha Rao (Backend Engineer)",
                            "details": null,
                            "actor": {
                              "id": "usr1",
                              "email": "hr@example.com"
                            },
                            "candidate": {
                              "id": "cand1",
                              "fullName": "Asha Rao"
                            },
                            "job": {
                              "id": "job1",
                              "title": "Backend Engineer"
                            },
                            "references": {
                              "jobPostingId": "job1",
                              "applicationId": "clx1",
                              "interviewId": null,
                              "offerId": "off1"
                            },
                            "change": {
                              "previousStatus": "DRAFT",
                              "newStatus": "RELEASED"
                            }
                          }
                        ],
                        "pagination": {
                          "page": 1,
                          "limit": 20,
                          "total": 1,
                          "totalPages": 1
                        }
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Insufficient permission or department"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Recent recruitment activities",
          "tags": [
            "recruitment-dashboard"
          ]
        }
      },
      "/api/v1/dashboard/summary": {
        "get": {
          "description": "Returns employee counts for the HRMS database using Prisma aggregation. `activeEmployees` maps to EmploymentStatus.ACTIVE; `inactiveEmployees` maps to TERMINATED. `onLeaveEmployees` and `probationEmployees` are included because the schema has four statuses — totalEmployees equals the sum of all four buckets. Requires JWT and `employees:read`.",
          "operationId": "DashboardController_getSummary",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Dashboard summary fetched successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Dashboard summary fetched successfully"
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "totalEmployees": {
                            "type": "number",
                            "example": 150
                          },
                          "activeEmployees": {
                            "type": "number",
                            "example": 120
                          },
                          "inactiveEmployees": {
                            "type": "number",
                            "example": 30
                          },
                          "onLeaveEmployees": {
                            "type": "number",
                            "example": 0
                          },
                          "probationEmployees": {
                            "type": "number",
                            "example": 0
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing employees:read permission"
            },
            "500": {
              "description": "Database error while aggregating employee counts"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Get dashboard employee summary",
          "tags": [
            "dashboard"
          ]
        }
      },
      "/api/v1/dashboard/employees/total": {
        "get": {
          "description": "Returns the total number of employee records via Prisma `count()`. The Employee model is single-tenant (no organization column) and has no soft-delete field, so every persisted employee row is counted. Requires JWT and `employees:read`.",
          "operationId": "DashboardController_getTotalEmployees",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Total employees fetched successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Total employees fetched successfully"
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "totalEmployees": {
                            "type": "number",
                            "example": 150
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing employees:read permission"
            },
            "500": {
              "description": "Database error while counting employees"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Get total employee count",
          "tags": [
            "dashboard"
          ]
        }
      },
      "/api/v1/dashboard/employees/active": {
        "get": {
          "description": "Returns the count of employees with `employmentStatus = ACTIVE` via Prisma `count()`. ON_LEAVE and PROBATION are not treated as inactive, but they are also not ACTIVE, so they are excluded. TERMINATED is excluded. Single-tenant schema (no organization or soft-delete fields). Requires JWT and `employees:read`.",
          "operationId": "DashboardController_getActiveEmployees",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Active employees fetched successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Active employees fetched successfully"
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "activeEmployees": {
                            "type": "number",
                            "example": 120
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing employees:read permission"
            },
            "500": {
              "description": "Database error while counting active employees"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Get active employee count",
          "tags": [
            "dashboard"
          ]
        }
      },
      "/api/v1/dashboard/employees/inactive": {
        "get": {
          "description": "Returns the count of employees with `employmentStatus = TERMINATED` via Prisma `count()`. TERMINATED is the schema inactive classification (no RESIGNED status exists). ACTIVE, ON_LEAVE, and PROBATION are excluded — on leave does not count as inactive. Single-tenant schema (no organization or soft-delete fields). Requires JWT and `employees:read`.",
          "operationId": "DashboardController_getInactiveEmployees",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Inactive employees fetched successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Inactive employees fetched successfully"
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "inactiveEmployees": {
                            "type": "number",
                            "example": 30
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing employees:read permission"
            },
            "500": {
              "description": "Database error while counting inactive employees"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Get inactive employee count",
          "tags": [
            "dashboard"
          ]
        }
      },
      "/api/v1/dashboard/attendance/present-today": {
        "get": {
          "description": "Returns a paginated list of employees marked present today. Attendance comes from the biometric device (read through the TimeWatch gateway) — the HRMS database has no attendance table. An employee is PRESENT when the device has at least one punch on today's date, evaluated in the application timezone (CALENDAR_DEFAULT_TIMEZONE, default UTC). Returns a paginated list of employees marked present today. Attendance comes from the TimeWatch gateway (live punches) — an employee is PRESENT when the device has at least one punch on today's date, evaluated in the application timezone (CALENDAR_DEFAULT_TIMEZONE, default UTC). checkInTime is the earliest punch and checkOutTime the latest (null when there is only one punch); times are device wall-clock HH:mm:ss. Covers non-TERMINATED employees linked to the device (deviceUserId), ordered by employeeCode. `skippedEmployees` counts employees whose device lookup failed. The schema is single-tenant with no company or branch column, so access is controlled by `employees:read` (SUPER_ADMIN, HR_ADMIN, MANAGER) like the other dashboard endpoints. A page past the last page returns an empty `items` array with the real total. Results are reused for 30 seconds across pages.",
          "operationId": "DashboardAttendanceController_getPresentToday",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "integer",
                "minimum": 1,
                "maximum": 9007199254740991,
                "example": 1
              },
              "description": "Page number, minimum 1 (default 1)"
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "default": 20,
                "type": "integer",
                "minimum": 1,
                "maximum": 100,
                "example": 20
              },
              "description": "Page size, 1–100 (default 20)"
            }
          ],
          "responses": {
            "200": {
              "description": "Today's present employees fetched successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Today's present employees fetched successfully"
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "date": {
                            "type": "string",
                            "example": "2026-11-19"
                          },
                          "timezone": {
                            "type": "string",
                            "example": "Asia/Kolkata"
                          },
                          "empty": {
                            "type": "boolean",
                            "example": false
                          },
                          "items": {
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "employeeId": {
                                  "type": "string",
                                  "example": "clx1employee"
                                },
                                "employeeCode": {
                                  "type": "string",
                                  "example": "EMP001"
                                },
                                "employeeName": {
                                  "type": "string",
                                  "example": "Asha Rao"
                                },
                                "department": {
                                  "type": "object",
                                  "nullable": true,
                                  "properties": {
                                    "id": {
                                      "type": "string",
                                      "example": "clx1dept"
                                    },
                                    "code": {
                                      "type": "string",
                                      "example": "ENG"
                                    },
                                    "name": {
                                      "type": "string",
                                      "example": "Engineering"
                                    }
                                  }
                                },
                                "attendanceDate": {
                                  "type": "string",
                                  "example": "2026-11-19"
                                },
                                "checkInTime": {
                                  "type": "string",
                                  "nullable": true,
                                  "example": "09:02:11"
                                },
                                "checkOutTime": {
                                  "type": "string",
                                  "nullable": true,
                                  "example": "18:15:40"
                                },
                                "status": {
                                  "type": "string",
                                  "example": "PRESENT"
                                },
                                "punchCount": {
                                  "type": "number",
                                  "example": 2
                                }
                              }
                            }
                          },
                          "pagination": {
                            "type": "object",
                            "properties": {
                              "page": {
                                "type": "number",
                                "example": 1
                              },
                              "limit": {
                                "type": "number",
                                "example": 20
                              },
                              "total": {
                                "type": "number",
                                "example": 85
                              },
                              "totalPages": {
                                "type": "number",
                                "example": 5
                              }
                            }
                          },
                          "skippedEmployees": {
                            "type": "number",
                            "example": 0
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Invalid page or limit"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing employees:read permission"
            },
            "500": {
              "description": "Database error while loading employees"
            },
            "503": {
              "description": "Attendance device is not configured or unreachable"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "List today's present employees",
          "tags": [
            "dashboard"
          ]
        }
      },
      "/api/v1/dashboard/analytics/attendance": {
        "get": {
          "description": "Org-wide attendance analytics computed from synced biometric punches (`BiometricAttendanceRecord`) with the existing attendance engine (shift/grace, holidays, weekly offs, approved leave, regularisations). There is no persisted daily attendance-status table; statuses are calculated per employee-day. Optional startDate/endDate (YYYY-MM-DD) default to today in CALENDAR_DEFAULT_TIMEZONE; max range 31 days; future dates are rejected. Optional departmentId limits the employee set. Employees without a device link are skipped. Access is controlled by `employees:read`, like the other attendance dashboard endpoints.",
          "operationId": "DashboardAttendanceAnalyticsController_getAttendanceAnalytics",
          "parameters": [
            {
              "name": "startDate",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$",
                "example": "2026-11-01"
              },
              "description": "Inclusive start date (YYYY-MM-DD); defaults to today"
            },
            {
              "name": "endDate",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$",
                "example": "2026-11-07"
              },
              "description": "Inclusive end date (YYYY-MM-DD); defaults to today"
            },
            {
              "name": "departmentId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1,
                "maxLength": 64,
                "example": "clx1dept"
              },
              "description": "Only include employees in this department (max 64 characters)"
            }
          ],
          "responses": {
            "200": {
              "description": "Attendance analytics fetched successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Attendance analytics fetched successfully"
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "startDate": {
                            "type": "string",
                            "example": "2026-11-01"
                          },
                          "endDate": {
                            "type": "string",
                            "example": "2026-11-07"
                          },
                          "timezone": {
                            "type": "string",
                            "example": "Asia/Kolkata"
                          },
                          "source": {
                            "type": "string",
                            "example": "stored"
                          },
                          "departmentId": {
                            "type": "string",
                            "nullable": true,
                            "example": null
                          },
                          "empty": {
                            "type": "boolean",
                            "example": false
                          },
                          "eligibleEmployees": {
                            "type": "number",
                            "example": 42
                          },
                          "skippedEmployees": {
                            "type": "number",
                            "example": 3
                          },
                          "summary": {
                            "type": "object",
                            "properties": {
                              "totalAttendanceRecords": {
                                "type": "number",
                                "example": 180
                              },
                              "present": {
                                "type": "number",
                                "example": 120
                              },
                              "onTime": {
                                "type": "number",
                                "example": 100
                              },
                              "late": {
                                "type": "number",
                                "example": 20
                              },
                              "absent": {
                                "type": "number",
                                "example": 10
                              },
                              "onLeave": {
                                "type": "number",
                                "example": 5
                              },
                              "halfDay": {
                                "type": "number",
                                "example": 2
                              },
                              "missedPunch": {
                                "type": "number",
                                "example": 1
                              },
                              "holiday": {
                                "type": "number",
                                "example": 8
                              },
                              "weeklyOff": {
                                "type": "number",
                                "example": 14
                              },
                              "attendancePercentage": {
                                "type": "number",
                                "nullable": true,
                                "example": 90.2
                              }
                            }
                          },
                          "series": {
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "date": {
                                  "type": "string",
                                  "example": "2026-11-03"
                                },
                                "present": {
                                  "type": "number",
                                  "example": 38
                                },
                                "onTime": {
                                  "type": "number",
                                  "example": 32
                                },
                                "late": {
                                  "type": "number",
                                  "example": 6
                                },
                                "absent": {
                                  "type": "number",
                                  "example": 2
                                },
                                "onLeave": {
                                  "type": "number",
                                  "example": 1
                                },
                                "halfDay": {
                                  "type": "number",
                                  "example": 0
                                },
                                "missedPunch": {
                                  "type": "number",
                                  "example": 0
                                },
                                "totalAttendanceRecords": {
                                  "type": "number",
                                  "example": 76
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Invalid dates, range too large, future dates, or unsupported parameter"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing employees:read permission"
            },
            "500": {
              "description": "Database or attendance engine error"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Attendance analytics",
          "tags": [
            "dashboard"
          ]
        }
      },
      "/api/v1/dashboard/attendance/absent-today": {
        "get": {
          "description": "Returns a paginated list of employees marked absent today. \"Today\" is the date in the application timezone (CALENDAR_DEFAULT_TIMEZONE, default UTC). Absent means: ACTIVE or PROBATION, already joined, linked to the biometric device (deviceUserId), with no device punch today (same rule as present-today) and no APPROVED leave request covering today (full or half day). On a weekly off (stored weekly-off policy) or a company holiday (active NATIONAL / COMPANY / FESTIVAL holidays, including recurring ones) nobody is absent: the response is empty with `workingDay: false` and `nonWorkingDay` set. OPTIONAL holidays are not non-working days. ON_LEAVE and TERMINATED employees are never listed. If device lookups fail for any employee the endpoint returns 503 instead of guessing. The schema is single-tenant with no company or branch column, so access is controlled by `employees:read` (SUPER_ADMIN, HR_ADMIN, MANAGER) like the other dashboard endpoints. Ordered by employeeCode.",
          "operationId": "DashboardAbsenceController_getAbsentToday",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "integer",
                "minimum": 1,
                "maximum": 9007199254740991,
                "example": 1
              },
              "description": "Page number, minimum 1 (default 1)"
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "default": 20,
                "type": "integer",
                "minimum": 1,
                "maximum": 100,
                "example": 20
              },
              "description": "Page size, 1–100 (default 20)"
            }
          ],
          "responses": {
            "200": {
              "description": "Today's absent employees fetched successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Today's absent employees fetched successfully"
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "date": {
                            "type": "string",
                            "example": "2026-11-19"
                          },
                          "timezone": {
                            "type": "string",
                            "example": "Asia/Kolkata"
                          },
                          "workingDay": {
                            "type": "boolean",
                            "example": true
                          },
                          "nonWorkingDay": {
                            "type": "object",
                            "nullable": true,
                            "properties": {
                              "type": {
                                "type": "string",
                                "enum": [
                                  "WEEKLY_OFF",
                                  "HOLIDAY"
                                ],
                                "example": "HOLIDAY"
                              },
                              "description": {
                                "type": "string",
                                "example": "Diwali"
                              }
                            }
                          },
                          "empty": {
                            "type": "boolean",
                            "example": false
                          },
                          "items": {
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "employeeId": {
                                  "type": "string",
                                  "example": "clx1employee"
                                },
                                "employeeCode": {
                                  "type": "string",
                                  "example": "EMP002"
                                },
                                "employeeName": {
                                  "type": "string",
                                  "example": "Ravi Kumar"
                                },
                                "department": {
                                  "type": "object",
                                  "nullable": true,
                                  "properties": {
                                    "id": {
                                      "type": "string",
                                      "example": "clx1dept"
                                    },
                                    "code": {
                                      "type": "string",
                                      "example": "ENG"
                                    },
                                    "name": {
                                      "type": "string",
                                      "example": "Engineering"
                                    }
                                  }
                                },
                                "attendanceDate": {
                                  "type": "string",
                                  "example": "2026-11-19"
                                },
                                "status": {
                                  "type": "string",
                                  "example": "ABSENT"
                                }
                              }
                            }
                          },
                          "pagination": {
                            "type": "object",
                            "properties": {
                              "page": {
                                "type": "number",
                                "example": 1
                              },
                              "limit": {
                                "type": "number",
                                "example": 20
                              },
                              "total": {
                                "type": "number",
                                "example": 7
                              },
                              "totalPages": {
                                "type": "number",
                                "example": 1
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Invalid page or limit"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing employees:read permission"
            },
            "500": {
              "description": "Database error while loading employees"
            },
            "503": {
              "description": "Attendance device is not configured, unreachable, or returned incomplete data"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "List today's absent employees",
          "tags": [
            "dashboard"
          ]
        }
      },
      "/api/v1/dashboard/leaves/on-leave": {
        "get": {
          "description": "Returns a paginated list of employees with an APPROVED leave request covering today (startDate <= today <= endDate, so multi-day leave is included). \"Today\" is the date in the application timezone (CALENDAR_DEFAULT_TIMEZONE, default UTC). PENDING, REJECTED and CANCELLED requests are excluded (cancelling an approved leave sets CANCELLED; there is no separate revoked status). Multi-level approval requests appear only after final approval. Leave of TERMINATED employees is ignored. Visibility follows the leave module: callers with leaves:create_on_behalf (HR/Admin) see all employees; callers with leaves:approve (managers) see the department of their linked employee; other callers get 403. The schema is single-tenant with no company or branch column, so there is no branch field. Ordered by startDate then employeeCode.",
          "operationId": "DashboardLeaveController_getOnLeaveToday",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "integer",
                "minimum": 1,
                "maximum": 9007199254740991,
                "example": 1
              },
              "description": "Page number, minimum 1 (default 1)"
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "default": 20,
                "type": "integer",
                "minimum": 1,
                "maximum": 100,
                "example": 20
              },
              "description": "Page size, 1–100 (default 20)"
            }
          ],
          "responses": {
            "200": {
              "description": "Today's employees on leave fetched successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Today's employees on leave fetched successfully"
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "date": {
                            "type": "string",
                            "example": "2026-11-19"
                          },
                          "timezone": {
                            "type": "string",
                            "example": "Asia/Kolkata"
                          },
                          "empty": {
                            "type": "boolean",
                            "example": false
                          },
                          "items": {
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "leaveRequestId": {
                                  "type": "string",
                                  "example": "clx1leave"
                                },
                                "employeeId": {
                                  "type": "string",
                                  "example": "clx1employee"
                                },
                                "employeeCode": {
                                  "type": "string",
                                  "example": "EMP003"
                                },
                                "employeeName": {
                                  "type": "string",
                                  "example": "Meera Nair"
                                },
                                "department": {
                                  "type": "object",
                                  "nullable": true,
                                  "properties": {
                                    "id": {
                                      "type": "string",
                                      "example": "clx1dept"
                                    },
                                    "code": {
                                      "type": "string",
                                      "example": "ENG"
                                    },
                                    "name": {
                                      "type": "string",
                                      "example": "Engineering"
                                    }
                                  }
                                },
                                "leaveType": {
                                  "type": "object",
                                  "properties": {
                                    "id": {
                                      "type": "string",
                                      "example": "clx1type"
                                    },
                                    "code": {
                                      "type": "string",
                                      "example": "CL"
                                    },
                                    "name": {
                                      "type": "string",
                                      "example": "Casual Leave"
                                    },
                                    "isPaid": {
                                      "type": "boolean",
                                      "example": true
                                    }
                                  }
                                },
                                "startDate": {
                                  "type": "string",
                                  "example": "2026-11-18"
                                },
                                "endDate": {
                                  "type": "string",
                                  "example": "2026-11-20"
                                },
                                "dayPortion": {
                                  "type": "string",
                                  "enum": [
                                    "FULL_DAY",
                                    "FIRST_HALF",
                                    "SECOND_HALF"
                                  ],
                                  "example": "FULL_DAY"
                                },
                                "durationDays": {
                                  "type": "number",
                                  "example": 3
                                },
                                "status": {
                                  "type": "string",
                                  "example": "APPROVED"
                                },
                                "reason": {
                                  "type": "string",
                                  "nullable": true,
                                  "example": "Family function"
                                }
                              }
                            }
                          },
                          "pagination": {
                            "type": "object",
                            "properties": {
                              "page": {
                                "type": "number",
                                "example": 1
                              },
                              "limit": {
                                "type": "number",
                                "example": 20
                              },
                              "total": {
                                "type": "number",
                                "example": 4
                              },
                              "totalPages": {
                                "type": "number",
                                "example": 1
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Invalid page or limit"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing leaves:read, or neither leaves:approve nor leaves:create_on_behalf"
            },
            "500": {
              "description": "Database error while loading leave requests"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "List employees on approved leave today",
          "tags": [
            "dashboard"
          ]
        }
      },
      "/api/v1/dashboard/analytics/leaves": {
        "get": {
          "description": "Org-wide leave analytics from stored LeaveRequest rows that overlap the date range. Summary counts every LeaveRequestStatus (PENDING, APPROVED, REJECTED, CANCELLED). totalApprovedLeaveDays recounts only APPROVED requests for the overlapping window using the apply-leave inclusive calendar / half-day rules (holidays and weekly offs are not subtracted). REJECTED and CANCELLED never contribute approved leave days. series is a date-wise trend; byLeaveType distributes by existing LeaveType rows. Defaults to the current calendar month in CALENDAR_DEFAULT_TIMEZONE when dates are omitted. Max range 366 days; future dates are rejected. Optional departmentId filters by Employee.departmentId. TERMINATED employees are excluded. Access is controlled by `leaves:read`, like the on-leave dashboard.",
          "operationId": "DashboardLeaveAnalyticsController_getLeaveAnalytics",
          "parameters": [
            {
              "name": "startDate",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$",
                "example": "2026-11-01"
              },
              "description": "Inclusive start date (YYYY-MM-DD); defaults with endDate to the current calendar month"
            },
            {
              "name": "endDate",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$",
                "example": "2026-11-30"
              },
              "description": "Inclusive end date (YYYY-MM-DD); defaults with startDate to the current calendar month"
            },
            {
              "name": "departmentId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1,
                "maxLength": 64,
                "example": "clx1dept"
              },
              "description": "Only include leave of employees in this department (max 64 characters)"
            }
          ],
          "responses": {
            "200": {
              "description": "Leave analytics fetched successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Leave analytics fetched successfully"
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "startDate": {
                            "type": "string",
                            "example": "2026-11-01"
                          },
                          "endDate": {
                            "type": "string",
                            "example": "2026-11-30"
                          },
                          "timezone": {
                            "type": "string",
                            "example": "Asia/Kolkata"
                          },
                          "departmentId": {
                            "type": "string",
                            "nullable": true,
                            "example": null
                          },
                          "empty": {
                            "type": "boolean",
                            "example": false
                          },
                          "summary": {
                            "type": "object",
                            "properties": {
                              "totalLeaveRequests": {
                                "type": "number",
                                "example": 20
                              },
                              "approved": {
                                "type": "number",
                                "example": 12
                              },
                              "pending": {
                                "type": "number",
                                "example": 4
                              },
                              "rejected": {
                                "type": "number",
                                "example": 2
                              },
                              "cancelled": {
                                "type": "number",
                                "example": 2
                              },
                              "totalApprovedLeaveDays": {
                                "type": "number",
                                "example": 18.5
                              }
                            }
                          },
                          "series": {
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "date": {
                                  "type": "string",
                                  "example": "2026-11-03"
                                },
                                "totalLeaveRequests": {
                                  "type": "number",
                                  "example": 3
                                },
                                "approved": {
                                  "type": "number",
                                  "example": 2
                                },
                                "pending": {
                                  "type": "number",
                                  "example": 1
                                },
                                "rejected": {
                                  "type": "number",
                                  "example": 0
                                },
                                "cancelled": {
                                  "type": "number",
                                  "example": 0
                                },
                                "approvedLeaveDays": {
                                  "type": "number",
                                  "example": 1.5
                                }
                              }
                            }
                          },
                          "byLeaveType": {
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "leaveTypeId": {
                                  "type": "string",
                                  "example": "lt-1"
                                },
                                "leaveTypeCode": {
                                  "type": "string",
                                  "example": "CL"
                                },
                                "leaveTypeName": {
                                  "type": "string",
                                  "example": "Casual Leave"
                                },
                                "isPaid": {
                                  "type": "boolean",
                                  "example": true
                                },
                                "requestCount": {
                                  "type": "number",
                                  "example": 8
                                },
                                "approved": {
                                  "type": "number",
                                  "example": 5
                                },
                                "pending": {
                                  "type": "number",
                                  "example": 2
                                },
                                "rejected": {
                                  "type": "number",
                                  "example": 1
                                },
                                "cancelled": {
                                  "type": "number",
                                  "example": 0
                                },
                                "approvedLeaveDays": {
                                  "type": "number",
                                  "example": 7.5
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Invalid dates, range too large, future dates, or unsupported parameter"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing leaves:read permission"
            },
            "500": {
              "description": "Database error while loading leave analytics"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Leave analytics",
          "tags": [
            "dashboard"
          ]
        }
      },
      "/api/v1/dashboard/attendance/late-arrivals": {
        "get": {
          "description": "Returns a paginated list of employees whose earliest device punch on the date is after the permitted reporting time. The company runs one permanent shift (ATTENDANCE_SHIFT_START 10:15, ATTENDANCE_SHIFT_END 19:15 by default). Check-in up to shift start + ATTENDANCE_GRACE_MINUTES (default 15, so 10:30:00) is on time. Anything later is LATE and counts as a half day (`halfDay: true`). lateMinutes = minutes from the cut-off (shift start + grace, 10:30:00 by default) to check-in, rounded up; it is 0 for on-time check-ins. Employees without a punch on the date are not listed. Weekly offs and company holidays are non-working days: the response is empty with `workingDay: false` and `nonWorkingDay` set, and the device is not queried. `date` defaults to today in the application timezone (CALENDAR_DEFAULT_TIMEZONE, default UTC); future dates are rejected. Branch and shift filters are not supported because the schema has no branch or shift data. If the device is unreachable for every employee the endpoint returns 503. Failed lookups for some employees are counted in `skippedEmployees`. Access is controlled by `employees:read` (SUPER_ADMIN, HR_ADMIN, MANAGER), like the other attendance dashboards.",
          "operationId": "DashboardLateArrivalsController_getLateArrivals",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "integer",
                "minimum": 1,
                "maximum": 9007199254740991,
                "example": 1
              },
              "description": "Page number, minimum 1 (default 1)"
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "default": 20,
                "type": "integer",
                "minimum": 1,
                "maximum": 100,
                "example": 20
              },
              "description": "Page size, 1–100 (default 20)"
            },
            {
              "name": "date",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$",
                "example": "2026-11-19"
              },
              "description": "Attendance date YYYY-MM-DD (default: today in the application timezone). Not in the future."
            },
            {
              "name": "departmentId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1,
                "maxLength": 64,
                "example": "clx1dept"
              },
              "description": "Only employees in this department"
            }
          ],
          "responses": {
            "200": {
              "description": "Late arrivals fetched successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Late arrivals fetched successfully"
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "date": {
                            "type": "string",
                            "example": "2026-11-19"
                          },
                          "timezone": {
                            "type": "string",
                            "example": "Asia/Kolkata"
                          },
                          "shift": {
                            "type": "object",
                            "properties": {
                              "name": {
                                "type": "string",
                                "example": "General Shift"
                              },
                              "startTime": {
                                "type": "string",
                                "example": "10:15"
                              },
                              "endTime": {
                                "type": "string",
                                "example": "19:15"
                              },
                              "graceMinutes": {
                                "type": "number",
                                "example": 15
                              },
                              "latestOnTimeCheckIn": {
                                "type": "string",
                                "example": "10:30:00"
                              }
                            }
                          },
                          "workingDay": {
                            "type": "boolean",
                            "example": true
                          },
                          "nonWorkingDay": {
                            "type": "object",
                            "nullable": true,
                            "properties": {
                              "type": {
                                "type": "string",
                                "enum": [
                                  "WEEKLY_OFF",
                                  "HOLIDAY"
                                ],
                                "example": "WEEKLY_OFF"
                              },
                              "description": {
                                "type": "string",
                                "example": "Every Sunday"
                              }
                            }
                          },
                          "empty": {
                            "type": "boolean",
                            "example": false
                          },
                          "items": {
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "employeeId": {
                                  "type": "string",
                                  "example": "clx1employee"
                                },
                                "employeeCode": {
                                  "type": "string",
                                  "example": "EMP002"
                                },
                                "employeeName": {
                                  "type": "string",
                                  "example": "Ravi Kumar"
                                },
                                "department": {
                                  "type": "object",
                                  "nullable": true,
                                  "properties": {
                                    "id": {
                                      "type": "string",
                                      "example": "clx1dept"
                                    },
                                    "code": {
                                      "type": "string",
                                      "example": "ENG"
                                    },
                                    "name": {
                                      "type": "string",
                                      "example": "Engineering"
                                    }
                                  }
                                },
                                "attendanceDate": {
                                  "type": "string",
                                  "example": "2026-11-19"
                                },
                                "shiftName": {
                                  "type": "string",
                                  "example": "General Shift"
                                },
                                "shiftStartTime": {
                                  "type": "string",
                                  "example": "10:15"
                                },
                                "checkInTime": {
                                  "type": "string",
                                  "example": "10:45:00"
                                },
                                "lateMinutes": {
                                  "type": "number",
                                  "example": 15
                                },
                                "status": {
                                  "type": "string",
                                  "example": "LATE"
                                },
                                "halfDay": {
                                  "type": "boolean",
                                  "example": true
                                }
                              }
                            }
                          },
                          "pagination": {
                            "type": "object",
                            "properties": {
                              "page": {
                                "type": "number",
                                "example": 1
                              },
                              "limit": {
                                "type": "number",
                                "example": 20
                              },
                              "total": {
                                "type": "number",
                                "example": 2
                              },
                              "totalPages": {
                                "type": "number",
                                "example": 1
                              }
                            }
                          },
                          "skippedEmployees": {
                            "type": "number",
                            "example": 0
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Invalid page, limit, date (format, calendar date or future), or unsupported parameter (for example branch or shiftName)"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing employees:read permission"
            },
            "500": {
              "description": "Database error while loading employees"
            },
            "503": {
              "description": "Attendance device is not configured or unreachable"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "List late arrivals for a date",
          "tags": [
            "dashboard"
          ]
        }
      },
      "/api/v1/dashboard/employees/upcoming-birthdays": {
        "get": {
          "description": "Returns a paginated list of employees whose birthday falls from today through today + `days` (inclusive), nearest first (ties by employeeCode). \"Today\" is the date in the application timezone (CALENDAR_DEFAULT_TIMEZONE, default UTC). The birthday is computed from the month and day of `Employee.dateOfBirth`; the birth year is ignored. A birthday today has `daysUntil: 0`; a birthday that has already passed this year is returned in the next calendar year, so late-December requests include January birthdays. Rule for 29 February: in a non-leap year the birthday is observed on 28 February; in a leap year it is 29 February. `dateOfBirth` always shows the stored date. Employees without a date of birth and TERMINATED employees are excluded (ACTIVE, PROBATION and ON_LEAVE are included). `search` matches employee code, first name or last name (case-insensitive; several words must all match). The schema is single-tenant with no company or branch column, so there is no branch field or filter; access is controlled by `employees:read` (SUPER_ADMIN, HR_ADMIN, MANAGER), like the other dashboard endpoints.",
          "operationId": "DashboardBirthdaysController_getUpcomingBirthdays",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "integer",
                "minimum": 1,
                "maximum": 9007199254740991,
                "example": 1
              },
              "description": "Page number, minimum 1 (default 1)"
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "default": 20,
                "type": "integer",
                "minimum": 1,
                "maximum": 100,
                "example": 20
              },
              "description": "Page size, 1–100 (default 20)"
            },
            {
              "name": "days",
              "required": false,
              "in": "query",
              "schema": {
                "type": "integer",
                "minimum": 0,
                "maximum": 366,
                "example": 30
              },
              "description": "Look-ahead window in days, 0–366 (default 30; 0 = today only)"
            },
            {
              "name": "search",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1,
                "maxLength": 100,
                "example": "meera"
              },
              "description": "Employee code, first name or last name (max 100 characters)"
            },
            {
              "name": "departmentId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1,
                "maxLength": 64,
                "example": "clx1dept"
              },
              "description": "Only employees in this department"
            }
          ],
          "responses": {
            "200": {
              "description": "Upcoming birthdays fetched successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Upcoming birthdays fetched successfully"
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "date": {
                            "type": "string",
                            "example": "2026-11-20"
                          },
                          "timezone": {
                            "type": "string",
                            "example": "Asia/Kolkata"
                          },
                          "days": {
                            "type": "number",
                            "example": 30
                          },
                          "windowEnd": {
                            "type": "string",
                            "example": "2026-12-20"
                          },
                          "empty": {
                            "type": "boolean",
                            "example": false
                          },
                          "items": {
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "employeeId": {
                                  "type": "string",
                                  "example": "clx1employee"
                                },
                                "employeeCode": {
                                  "type": "string",
                                  "example": "EMP003"
                                },
                                "employeeName": {
                                  "type": "string",
                                  "example": "Meera Nair"
                                },
                                "department": {
                                  "type": "object",
                                  "nullable": true,
                                  "properties": {
                                    "id": {
                                      "type": "string",
                                      "example": "clx1dept"
                                    },
                                    "code": {
                                      "type": "string",
                                      "example": "ENG"
                                    },
                                    "name": {
                                      "type": "string",
                                      "example": "Engineering"
                                    }
                                  }
                                },
                                "dateOfBirth": {
                                  "type": "string",
                                  "example": "1994-11-25"
                                },
                                "upcomingBirthday": {
                                  "type": "string",
                                  "example": "2026-11-25"
                                },
                                "daysUntil": {
                                  "type": "number",
                                  "example": 5
                                }
                              }
                            }
                          },
                          "pagination": {
                            "type": "object",
                            "properties": {
                              "page": {
                                "type": "number",
                                "example": 1
                              },
                              "limit": {
                                "type": "number",
                                "example": 20
                              },
                              "total": {
                                "type": "number",
                                "example": 4
                              },
                              "totalPages": {
                                "type": "number",
                                "example": 1
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Invalid days (outside 0–366), page, limit, search or an unsupported parameter"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing employees:read permission"
            },
            "500": {
              "description": "Database error while loading employees"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "List upcoming employee birthdays",
          "tags": [
            "dashboard"
          ]
        }
      },
      "/api/v1/dashboard/employees/upcoming-anniversaries": {
        "get": {
          "description": "Returns a paginated list of employees whose work anniversary falls from today through today + `days` (inclusive), nearest first (ties by employeeCode). \"Today\" is the date in the application timezone (CALENDAR_DEFAULT_TIMEZONE, default UTC). The anniversary date comes from the month and day of `Employee.dateOfJoining`. The joining date itself is not an anniversary: the first anniversary is exactly one year after joining, so an employee with less than a year of service appears only with `yearsOfService: 1` on their first anniversary. `yearsOfService` is the number of completed years on the anniversary date. An anniversary today has `daysUntil: 0`; one that has already passed this year is returned in the next calendar year, so late-December requests include January anniversaries. Rule for 29 February joining dates (same as upcoming birthdays): in a non-leap year the anniversary is observed on 28 February; in a leap year it is 29 February. `joiningDate` always shows the stored date. TERMINATED employees and employees whose joining date is after today are excluded (ACTIVE, PROBATION and ON_LEAVE are included). `dateOfJoining` is a required column, so there are no employees with a missing joining date. `search` matches employee code, first name or last name (case-insensitive; several words must all match). The schema is single-tenant with no company or branch column, so there is no branch field or filter; access is controlled by `employees:read` (SUPER_ADMIN, HR_ADMIN, MANAGER), like the other dashboard endpoints.",
          "operationId": "DashboardAnniversariesController_getUpcomingAnniversaries",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "integer",
                "minimum": 1,
                "maximum": 9007199254740991,
                "example": 1
              },
              "description": "Page number, minimum 1 (default 1)"
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "default": 20,
                "type": "integer",
                "minimum": 1,
                "maximum": 100,
                "example": 20
              },
              "description": "Page size, 1–100 (default 20)"
            },
            {
              "name": "days",
              "required": false,
              "in": "query",
              "schema": {
                "type": "integer",
                "minimum": 0,
                "maximum": 366,
                "example": 30
              },
              "description": "Look-ahead window in days, 0–366 (default 30; 0 = today only)"
            },
            {
              "name": "search",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1,
                "maxLength": 100,
                "example": "meera"
              },
              "description": "Employee code, first name or last name (max 100 characters)"
            },
            {
              "name": "departmentId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1,
                "maxLength": 64,
                "example": "clx1dept"
              },
              "description": "Only employees in this department"
            }
          ],
          "responses": {
            "200": {
              "description": "Upcoming work anniversaries fetched successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Upcoming work anniversaries fetched successfully"
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "date": {
                            "type": "string",
                            "example": "2026-11-20"
                          },
                          "timezone": {
                            "type": "string",
                            "example": "Asia/Kolkata"
                          },
                          "days": {
                            "type": "number",
                            "example": 30
                          },
                          "windowEnd": {
                            "type": "string",
                            "example": "2026-12-20"
                          },
                          "empty": {
                            "type": "boolean",
                            "example": false
                          },
                          "items": {
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "employeeId": {
                                  "type": "string",
                                  "example": "clx1employee"
                                },
                                "employeeCode": {
                                  "type": "string",
                                  "example": "EMP003"
                                },
                                "employeeName": {
                                  "type": "string",
                                  "example": "Meera Nair"
                                },
                                "department": {
                                  "type": "object",
                                  "nullable": true,
                                  "properties": {
                                    "id": {
                                      "type": "string",
                                      "example": "clx1dept"
                                    },
                                    "code": {
                                      "type": "string",
                                      "example": "ENG"
                                    },
                                    "name": {
                                      "type": "string",
                                      "example": "Engineering"
                                    }
                                  }
                                },
                                "joiningDate": {
                                  "type": "string",
                                  "example": "2021-11-25"
                                },
                                "upcomingAnniversary": {
                                  "type": "string",
                                  "example": "2026-11-25"
                                },
                                "daysUntil": {
                                  "type": "number",
                                  "example": 5
                                },
                                "yearsOfService": {
                                  "type": "number",
                                  "example": 5
                                }
                              }
                            }
                          },
                          "pagination": {
                            "type": "object",
                            "properties": {
                              "page": {
                                "type": "number",
                                "example": 1
                              },
                              "limit": {
                                "type": "number",
                                "example": 20
                              },
                              "total": {
                                "type": "number",
                                "example": 4
                              },
                              "totalPages": {
                                "type": "number",
                                "example": 1
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Invalid days (outside 0–366), page, limit, search or an unsupported parameter"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing employees:read permission"
            },
            "500": {
              "description": "Database error while loading employees"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "List upcoming work anniversaries",
          "tags": [
            "dashboard"
          ]
        }
      },
      "/api/v1/dashboard/employees/new-joiners": {
        "get": {
          "description": "Returns a paginated list of employees whose `dateOfJoining` falls in a calendar month, most recent joiners first (ties by employeeCode). The month defaults to the current month and year in the application timezone (CALENDAR_DEFAULT_TIMEZONE, default UTC); `year` and `month` can be supplied together or separately, and an omitted one uses the current value. The whole month is included, so in the current month a joining date later than today is listed too. Past and future months are allowed. All employment statuses are returned (ACTIVE, PROBATION, ON_LEAVE, TERMINATED) and the status is included in each item. `search` matches employee code, first name or last name (case-insensitive; several words must all match). The schema is single-tenant with no company or branch column, so there is no branch field or filter; access is controlled by `employees:read` (SUPER_ADMIN, HR_ADMIN, MANAGER), like the other dashboard endpoints.",
          "operationId": "DashboardNewJoinersController_getNewJoiners",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "integer",
                "minimum": 1,
                "maximum": 9007199254740991,
                "example": 1
              },
              "description": "Page number, minimum 1 (default 1)"
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "default": 20,
                "type": "integer",
                "minimum": 1,
                "maximum": 100,
                "example": 20
              },
              "description": "Page size, 1–100 (default 20)"
            },
            {
              "name": "year",
              "required": false,
              "in": "query",
              "schema": {
                "type": "integer",
                "minimum": 2000,
                "maximum": 2100,
                "example": 2026
              },
              "description": "Year 2000–2100 (default: current year in the app timezone)"
            },
            {
              "name": "month",
              "required": false,
              "in": "query",
              "schema": {
                "type": "integer",
                "minimum": 1,
                "maximum": 12,
                "example": 11
              },
              "description": "Month 1–12 (default: current month in the app timezone)"
            },
            {
              "name": "search",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1,
                "maxLength": 100,
                "example": "meera"
              },
              "description": "Employee code, first name or last name (max 100 characters)"
            },
            {
              "name": "departmentId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1,
                "maxLength": 64,
                "example": "clx1dept"
              },
              "description": "Only employees in this department"
            }
          ],
          "responses": {
            "200": {
              "description": "New joiners fetched successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "New joiners fetched successfully"
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "date": {
                            "type": "string",
                            "example": "2026-11-20"
                          },
                          "timezone": {
                            "type": "string",
                            "example": "Asia/Kolkata"
                          },
                          "year": {
                            "type": "number",
                            "example": 2026
                          },
                          "month": {
                            "type": "number",
                            "example": 11
                          },
                          "periodStart": {
                            "type": "string",
                            "example": "2026-11-01"
                          },
                          "periodEnd": {
                            "type": "string",
                            "example": "2026-11-30"
                          },
                          "empty": {
                            "type": "boolean",
                            "example": false
                          },
                          "items": {
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "employeeId": {
                                  "type": "string",
                                  "example": "clx1employee"
                                },
                                "employeeCode": {
                                  "type": "string",
                                  "example": "EMP042"
                                },
                                "employeeName": {
                                  "type": "string",
                                  "example": "Meera Nair"
                                },
                                "department": {
                                  "type": "object",
                                  "nullable": true,
                                  "properties": {
                                    "id": {
                                      "type": "string",
                                      "example": "clx1dept"
                                    },
                                    "code": {
                                      "type": "string",
                                      "example": "ENG"
                                    },
                                    "name": {
                                      "type": "string",
                                      "example": "Engineering"
                                    }
                                  }
                                },
                                "designation": {
                                  "type": "string",
                                  "example": "Software Engineer"
                                },
                                "dateOfJoining": {
                                  "type": "string",
                                  "example": "2026-11-17"
                                },
                                "employmentStatus": {
                                  "type": "string",
                                  "enum": [
                                    "ACTIVE",
                                    "ON_LEAVE",
                                    "PROBATION",
                                    "TERMINATED"
                                  ],
                                  "example": "PROBATION"
                                }
                              }
                            }
                          },
                          "pagination": {
                            "type": "object",
                            "properties": {
                              "page": {
                                "type": "number",
                                "example": 1
                              },
                              "limit": {
                                "type": "number",
                                "example": 20
                              },
                              "total": {
                                "type": "number",
                                "example": 4
                              },
                              "totalPages": {
                                "type": "number",
                                "example": 1
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Invalid year (outside 2000–2100), month (outside 1–12), page, limit, search or an unsupported parameter"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing employees:read permission"
            },
            "500": {
              "description": "Database error while loading employees"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "List new joiners for a month",
          "tags": [
            "dashboard"
          ]
        }
      },
      "/api/v1/dashboard/employees/on-probation": {
        "get": {
          "description": "Returns a paginated list of employees whose current `employmentStatus` is PROBATION, newest joiners first (ties by employeeCode). No probation start or end dates are returned: the employee schema does not store them (`probationMonths` exists only on recruitment offers, which are not linked to employees). No date filter is applied, so an employee with status PROBATION is listed even if the joining date is in the future. `search` matches employee code, first name or last name (case-insensitive; several words must all match). The schema is single-tenant with no company or branch column, so there is no branch field or filter; access is controlled by `employees:read` (SUPER_ADMIN, HR_ADMIN, MANAGER), like the other dashboard endpoints.",
          "operationId": "DashboardProbationController_getOnProbation",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "integer",
                "minimum": 1,
                "maximum": 9007199254740991,
                "example": 1
              },
              "description": "Page number, minimum 1 (default 1)"
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "default": 20,
                "type": "integer",
                "minimum": 1,
                "maximum": 100,
                "example": 20
              },
              "description": "Page size, 1–100 (default 20)"
            },
            {
              "name": "search",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1,
                "maxLength": 100,
                "example": "meera"
              },
              "description": "Employee code, first name or last name (max 100 characters)"
            },
            {
              "name": "departmentId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1,
                "maxLength": 64,
                "example": "clx1dept"
              },
              "description": "Only employees in this department"
            }
          ],
          "responses": {
            "200": {
              "description": "Employees on probation fetched successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Employees on probation fetched successfully"
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "empty": {
                            "type": "boolean",
                            "example": false
                          },
                          "items": {
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "employeeId": {
                                  "type": "string",
                                  "example": "clx1employee"
                                },
                                "employeeCode": {
                                  "type": "string",
                                  "example": "EMP042"
                                },
                                "employeeName": {
                                  "type": "string",
                                  "example": "Meera Nair"
                                },
                                "department": {
                                  "type": "object",
                                  "nullable": true,
                                  "properties": {
                                    "id": {
                                      "type": "string",
                                      "example": "clx1dept"
                                    },
                                    "code": {
                                      "type": "string",
                                      "example": "ENG"
                                    },
                                    "name": {
                                      "type": "string",
                                      "example": "Engineering"
                                    }
                                  }
                                },
                                "designation": {
                                  "type": "string",
                                  "example": "Software Engineer"
                                },
                                "dateOfJoining": {
                                  "type": "string",
                                  "example": "2026-11-17"
                                },
                                "employmentStatus": {
                                  "type": "string",
                                  "example": "PROBATION"
                                }
                              }
                            }
                          },
                          "pagination": {
                            "type": "object",
                            "properties": {
                              "page": {
                                "type": "number",
                                "example": 1
                              },
                              "limit": {
                                "type": "number",
                                "example": 20
                              },
                              "total": {
                                "type": "number",
                                "example": 4
                              },
                              "totalPages": {
                                "type": "number",
                                "example": 1
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Invalid page, limit, search or an unsupported parameter"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing employees:read permission"
            },
            "500": {
              "description": "Database error while loading employees"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "List employees on probation",
          "tags": [
            "dashboard"
          ]
        }
      },
      "/api/v1/dashboard/employees/terminated": {
        "get": {
          "description": "Returns a paginated list of employees whose current `employmentStatus` is TERMINATED, most recently updated first (ties by employeeCode). TERMINATED is the schema's broad inactive classification (same bucket as `GET /dashboard/employees/inactive`). There is no RESIGNED status and no resignation/exit dates or reasons on the employee record, so this is not a resignation report and those fields are not returned. `search` matches employee code, first name or last name (case-insensitive; several words must all match). The schema is single-tenant with no company or branch column, so there is no branch field or filter; access is controlled by `employees:read` (SUPER_ADMIN, HR_ADMIN, MANAGER), like the other dashboard endpoints.",
          "operationId": "DashboardTerminatedController_getTerminated",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "integer",
                "minimum": 1,
                "maximum": 9007199254740991,
                "example": 1
              },
              "description": "Page number, minimum 1 (default 1)"
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "default": 20,
                "type": "integer",
                "minimum": 1,
                "maximum": 100,
                "example": 20
              },
              "description": "Page size, 1–100 (default 20)"
            },
            {
              "name": "search",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1,
                "maxLength": 100,
                "example": "meera"
              },
              "description": "Employee code, first name or last name (max 100 characters)"
            },
            {
              "name": "departmentId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1,
                "maxLength": 64,
                "example": "clx1dept"
              },
              "description": "Only employees in this department"
            }
          ],
          "responses": {
            "200": {
              "description": "Terminated employees fetched successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Terminated employees fetched successfully"
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "empty": {
                            "type": "boolean",
                            "example": false
                          },
                          "items": {
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "employeeId": {
                                  "type": "string",
                                  "example": "clx1employee"
                                },
                                "employeeCode": {
                                  "type": "string",
                                  "example": "EMP042"
                                },
                                "employeeName": {
                                  "type": "string",
                                  "example": "Meera Nair"
                                },
                                "department": {
                                  "type": "object",
                                  "nullable": true,
                                  "properties": {
                                    "id": {
                                      "type": "string",
                                      "example": "clx1dept"
                                    },
                                    "code": {
                                      "type": "string",
                                      "example": "ENG"
                                    },
                                    "name": {
                                      "type": "string",
                                      "example": "Engineering"
                                    }
                                  }
                                },
                                "designation": {
                                  "type": "string",
                                  "example": "Software Engineer"
                                },
                                "dateOfJoining": {
                                  "type": "string",
                                  "example": "2024-03-15"
                                },
                                "employmentStatus": {
                                  "type": "string",
                                  "example": "TERMINATED"
                                }
                              }
                            }
                          },
                          "pagination": {
                            "type": "object",
                            "properties": {
                              "page": {
                                "type": "number",
                                "example": 1
                              },
                              "limit": {
                                "type": "number",
                                "example": 20
                              },
                              "total": {
                                "type": "number",
                                "example": 4
                              },
                              "totalPages": {
                                "type": "number",
                                "example": 1
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Invalid page, limit, search or an unsupported parameter"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing employees:read permission"
            },
            "500": {
              "description": "Database error while loading employees"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "List terminated employees",
          "tags": [
            "dashboard"
          ]
        }
      },
      "/api/v1/dashboard/employees/recently-added": {
        "get": {
          "description": "Returns a paginated list of employees whose record was created within the last N calendar days (`Employee.createdAt`), newest first (ties by employeeCode). This is distinct from New Joiners, which filters on `dateOfJoining`. \"Today\" and the lookback window use the application timezone (CALENDAR_DEFAULT_TIMEZONE, default UTC): `days = 1` is today only; the default `days = 30` is the last 30 calendar days including today (max 365). All employment statuses are returned and included on each item. `search` matches employee code, first name or last name (case-insensitive; several words must all match). The schema is single-tenant with no company or branch column, so there is no branch field or filter; access is controlled by `employees:read` (SUPER_ADMIN, HR_ADMIN, MANAGER), like the other dashboard endpoints.",
          "operationId": "DashboardRecentlyAddedController_getRecentlyAdded",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "integer",
                "minimum": 1,
                "maximum": 9007199254740991,
                "example": 1
              },
              "description": "Page number, minimum 1 (default 1)"
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "default": 20,
                "type": "integer",
                "minimum": 1,
                "maximum": 100,
                "example": 20
              },
              "description": "Page size, 1–100 (default 20)"
            },
            {
              "name": "days",
              "required": false,
              "in": "query",
              "schema": {
                "type": "integer",
                "minimum": 1,
                "maximum": 365,
                "example": 30
              },
              "description": "Lookback window in calendar days, 1–365 (default 30; 1 = today only)"
            },
            {
              "name": "search",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1,
                "maxLength": 100,
                "example": "meera"
              },
              "description": "Employee code, first name or last name (max 100 characters)"
            },
            {
              "name": "departmentId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1,
                "maxLength": 64,
                "example": "clx1dept"
              },
              "description": "Only employees in this department"
            }
          ],
          "responses": {
            "200": {
              "description": "Recently added employees fetched successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Recently added employees fetched successfully"
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "date": {
                            "type": "string",
                            "example": "2026-11-21"
                          },
                          "timezone": {
                            "type": "string",
                            "example": "Asia/Kolkata"
                          },
                          "days": {
                            "type": "number",
                            "example": 30
                          },
                          "periodStart": {
                            "type": "string",
                            "example": "2026-10-23"
                          },
                          "periodEnd": {
                            "type": "string",
                            "example": "2026-11-21"
                          },
                          "empty": {
                            "type": "boolean",
                            "example": false
                          },
                          "items": {
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "employeeId": {
                                  "type": "string",
                                  "example": "clx1employee"
                                },
                                "employeeCode": {
                                  "type": "string",
                                  "example": "EMP042"
                                },
                                "employeeName": {
                                  "type": "string",
                                  "example": "Meera Nair"
                                },
                                "department": {
                                  "type": "object",
                                  "nullable": true,
                                  "properties": {
                                    "id": {
                                      "type": "string",
                                      "example": "clx1dept"
                                    },
                                    "code": {
                                      "type": "string",
                                      "example": "ENG"
                                    },
                                    "name": {
                                      "type": "string",
                                      "example": "Engineering"
                                    }
                                  }
                                },
                                "designation": {
                                  "type": "string",
                                  "example": "Software Engineer"
                                },
                                "dateOfJoining": {
                                  "type": "string",
                                  "example": "2026-11-17"
                                },
                                "employmentStatus": {
                                  "type": "string",
                                  "enum": [
                                    "ACTIVE",
                                    "ON_LEAVE",
                                    "PROBATION",
                                    "TERMINATED"
                                  ],
                                  "example": "PROBATION"
                                },
                                "createdAt": {
                                  "type": "string",
                                  "example": "2026-11-17T08:30:00.000Z"
                                }
                              }
                            }
                          },
                          "pagination": {
                            "type": "object",
                            "properties": {
                              "page": {
                                "type": "number",
                                "example": 1
                              },
                              "limit": {
                                "type": "number",
                                "example": 20
                              },
                              "total": {
                                "type": "number",
                                "example": 4
                              },
                              "totalPages": {
                                "type": "number",
                                "example": 1
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Invalid days (outside 1–365), page, limit, search or an unsupported parameter"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing employees:read permission"
            },
            "500": {
              "description": "Database error while loading employees"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "List recently added employees",
          "tags": [
            "dashboard"
          ]
        }
      },
      "/api/v1/dashboard/employees/by-department": {
        "get": {
          "description": "Returns employee headcounts grouped by department, largest groups first (ties by department name). Employees with no `departmentId` appear in a synthetic Unassigned group (`departmentId: null`, `departmentCode: UNASSIGNED`, `departmentName: Unassigned`). Departments with zero matching employees are omitted. Optional `employmentStatus` must be one of ACTIVE, ON_LEAVE, PROBATION, TERMINATED. Optional `search` keeps groups whose department name or code contains the term (case-insensitive), including Unassigned when it matches. The schema is single-tenant with no company or branch column, so there is no branch field or filter; access is controlled by `employees:read` (SUPER_ADMIN, HR_ADMIN, MANAGER), like the other dashboard endpoints.",
          "operationId": "DashboardByDepartmentController_getByDepartment",
          "parameters": [
            {
              "name": "employmentStatus",
              "required": false,
              "in": "query",
              "schema": {
                "enum": [
                  "ACTIVE",
                  "ON_LEAVE",
                  "PROBATION",
                  "TERMINATED"
                ],
                "type": "string"
              },
              "description": "Only count employees with this employment status"
            },
            {
              "name": "search",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1,
                "maxLength": 100,
                "example": "eng"
              },
              "description": "Department name or code (max 100 characters; also matches Unassigned)"
            }
          ],
          "responses": {
            "200": {
              "description": "Department-wise employee distribution fetched successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Department-wise employee distribution fetched successfully"
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "employmentStatus": {
                            "type": "string",
                            "nullable": true,
                            "example": null
                          },
                          "totalEmployees": {
                            "type": "number",
                            "example": 42
                          },
                          "empty": {
                            "type": "boolean",
                            "example": false
                          },
                          "items": {
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "departmentId": {
                                  "type": "string",
                                  "nullable": true,
                                  "example": "clx1dept"
                                },
                                "departmentCode": {
                                  "type": "string",
                                  "example": "ENG"
                                },
                                "departmentName": {
                                  "type": "string",
                                  "example": "Engineering"
                                },
                                "employeeCount": {
                                  "type": "number",
                                  "example": 18
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Invalid employmentStatus, search or an unsupported parameter"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing employees:read permission"
            },
            "500": {
              "description": "Database error while loading employees"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Department-wise employee distribution",
          "tags": [
            "dashboard"
          ]
        }
      },
      "/api/v1/dashboard/employees/by-status": {
        "get": {
          "description": "Returns employee headcounts grouped by employment status (ACTIVE, ON_LEAVE, PROBATION, TERMINATED). Every valid status is included even when its count is zero. Sorted by employee count descending, then status name. Optional `departmentId` limits counts to employees in that department. The schema is single-tenant with no company or branch column, so there is no branch field or filter; access is controlled by `employees:read` (SUPER_ADMIN, HR_ADMIN, MANAGER), like the other dashboard endpoints.",
          "operationId": "DashboardByStatusController_getByStatus",
          "parameters": [
            {
              "name": "departmentId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1,
                "maxLength": 64,
                "example": "clx1dept"
              },
              "description": "Only count employees in this department (max 64 characters)"
            }
          ],
          "responses": {
            "200": {
              "description": "Employment status distribution fetched successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Employment status distribution fetched successfully"
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "departmentId": {
                            "type": "string",
                            "nullable": true,
                            "example": null
                          },
                          "totalEmployees": {
                            "type": "number",
                            "example": 42
                          },
                          "empty": {
                            "type": "boolean",
                            "example": false
                          },
                          "items": {
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "employmentStatus": {
                                  "type": "string",
                                  "enum": [
                                    "ACTIVE",
                                    "ON_LEAVE",
                                    "PROBATION",
                                    "TERMINATED"
                                  ],
                                  "example": "ACTIVE"
                                },
                                "employeeCount": {
                                  "type": "number",
                                  "example": 18
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Invalid departmentId or an unsupported parameter"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing employees:read permission"
            },
            "500": {
              "description": "Database error while loading employees"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Employment status distribution",
          "tags": [
            "dashboard"
          ]
        }
      },
      "/api/v1/calendar/events": {
        "post": {
          "description": "Creates an event with title, type, start/end (ISO-8601 with offset), location, organizer, attendees (existing employee ids), visibility and optional attachments (keys returned by POST /uploads). `visibility`: PRIVATE (default; organizer, creator and attendees only), DEPARTMENT (requires `departmentId`; members of that department plus organizer/attendees) or PUBLIC (everyone; requires calendar:manage). Non-managers may only create department events for their own department and can only name themselves as organizer (default). endAt must be after startAt (all-day events may have endAt equal to startAt).",
          "operationId": "CalendarController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "title": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 200
                    },
                    "description": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 5000
                    },
                    "eventType": {
                      "type": "string",
                      "enum": [
                        "MEETING",
                        "TRAINING",
                        "WORKSHOP",
                        "CELEBRATION",
                        "ANNOUNCEMENT",
                        "COMPANY_EVENT",
                        "REMINDER",
                        "OTHER"
                      ]
                    },
                    "visibility": {
                      "default": "PRIVATE",
                      "type": "string",
                      "enum": [
                        "PUBLIC",
                        "PRIVATE",
                        "DEPARTMENT"
                      ]
                    },
                    "startAt": {
                      "type": "string",
                      "format": "date-time",
                      "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d(?:\\.\\d+)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                    },
                    "endAt": {
                      "type": "string",
                      "format": "date-time",
                      "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d(?:\\.\\d+)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                    },
                    "isAllDay": {
                      "default": false,
                      "type": "boolean"
                    },
                    "location": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 300
                    },
                    "meetingLink": {
                      "type": "string",
                      "maxLength": 2000,
                      "format": "uri"
                    },
                    "departmentId": {
                      "type": "string",
                      "minLength": 1
                    },
                    "organizerEmployeeId": {
                      "type": "string",
                      "minLength": 1
                    },
                    "attendeeEmployeeIds": {
                      "maxItems": 200,
                      "type": "array",
                      "items": {
                        "type": "string",
                        "minLength": 1
                      }
                    },
                    "attachments": {
                      "default": [],
                      "maxItems": 10,
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "key": {
                            "type": "string",
                            "minLength": 1,
                            "maxLength": 500
                          },
                          "originalName": {
                            "type": "string",
                            "minLength": 1,
                            "maxLength": 255
                          },
                          "contentType": {
                            "type": "string",
                            "minLength": 1,
                            "maxLength": 200
                          },
                          "size": {
                            "type": "integer",
                            "minimum": 0,
                            "maximum": 10485760
                          }
                        },
                        "required": [
                          "key",
                          "originalName",
                          "contentType",
                          "size"
                        ],
                        "additionalProperties": false
                      }
                    }
                  },
                  "required": [
                    "title",
                    "eventType",
                    "startAt",
                    "endAt"
                  ],
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Event created"
            },
            "400": {
              "description": "Validation failed (dates, attendee ids, department scope)"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing permission or not the owner"
            },
            "404": {
              "description": "Department not found"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Create a calendar event",
          "tags": [
            "calendar"
          ]
        },
        "get": {
          "description": "Paginated events the caller is authorised to see. Filters: eventType, visibility, departmentId, organizerEmployeeId and a from/to range (events overlapping the range; date-time with offset or YYYY-MM-DD in UTC). Sorting: sortBy (startAt, endAt, title, eventType, createdAt) and sortOrder (asc, desc).",
          "operationId": "CalendarController_findAll",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "integer",
                "minimum": 1,
                "maximum": 9007199254740991
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "default": 20,
                "type": "integer",
                "minimum": 1,
                "maximum": 100
              }
            },
            {
              "name": "eventType",
              "required": false,
              "in": "query",
              "schema": {
                "minItems": 1,
                "type": "array",
                "items": {
                  "type": "string",
                  "enum": [
                    "MEETING",
                    "TRAINING",
                    "WORKSHOP",
                    "CELEBRATION",
                    "ANNOUNCEMENT",
                    "COMPANY_EVENT",
                    "REMINDER",
                    "OTHER"
                  ]
                },
                "example": "MEETING,TRAINING"
              },
              "description": "Filter by event type. Comma-separated for several: MEETING, TRAINING, WORKSHOP, CELEBRATION, ANNOUNCEMENT, COMPANY_EVENT, REMINDER, OTHER."
            },
            {
              "name": "visibility",
              "required": false,
              "in": "query",
              "schema": {
                "minItems": 1,
                "type": "array",
                "items": {
                  "type": "string",
                  "enum": [
                    "PUBLIC",
                    "PRIVATE",
                    "DEPARTMENT"
                  ]
                },
                "example": "PUBLIC"
              },
              "description": "Filter by visibility. Comma-separated for several: PUBLIC, PRIVATE, DEPARTMENT."
            },
            {
              "name": "from",
              "required": false,
              "in": "query",
              "schema": {
                "anyOf": [
                  {
                    "type": "string",
                    "format": "date-time",
                    "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d(?:\\.\\d+)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                  },
                  {
                    "type": "string",
                    "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
                  }
                ]
              }
            },
            {
              "name": "to",
              "required": false,
              "in": "query",
              "schema": {
                "anyOf": [
                  {
                    "type": "string",
                    "format": "date-time",
                    "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d(?:\\.\\d+)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                  },
                  {
                    "type": "string",
                    "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
                  }
                ]
              }
            },
            {
              "name": "departmentId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            },
            {
              "name": "organizerEmployeeId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            },
            {
              "name": "sortBy",
              "required": false,
              "in": "query",
              "schema": {
                "default": "startAt",
                "type": "string",
                "enum": [
                  "startAt",
                  "endAt",
                  "title",
                  "eventType",
                  "createdAt"
                ]
              }
            },
            {
              "name": "sortOrder",
              "required": false,
              "in": "query",
              "schema": {
                "default": "asc",
                "type": "string",
                "enum": [
                  "asc",
                  "desc"
                ]
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Events retrieved"
            },
            "400": {
              "description": "Invalid query parameters"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing permission or not the owner"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "List calendar events",
          "tags": [
            "calendar"
          ]
        }
      },
      "/api/v1/calendar/events/{id}": {
        "get": {
          "description": "Returns 404 when the event does not exist, was deleted or is not visible to the caller.",
          "operationId": "CalendarController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Event retrieved"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing permission or not the owner"
            },
            "404": {
              "description": "Event not found"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Get a calendar event",
          "tags": [
            "calendar"
          ]
        },
        "patch": {
          "description": "Only the creator, the organizer or a calendar manager may update. `attendeeEmployeeIds` and `attachments`, when sent, replace the existing lists. The merged start/end must remain valid.",
          "operationId": "CalendarController_update",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "title": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 200
                    },
                    "description": {
                      "nullable": true,
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 5000
                    },
                    "eventType": {
                      "type": "string",
                      "enum": [
                        "MEETING",
                        "TRAINING",
                        "WORKSHOP",
                        "CELEBRATION",
                        "ANNOUNCEMENT",
                        "COMPANY_EVENT",
                        "REMINDER",
                        "OTHER"
                      ]
                    },
                    "visibility": {
                      "type": "string",
                      "enum": [
                        "PUBLIC",
                        "PRIVATE",
                        "DEPARTMENT"
                      ]
                    },
                    "startAt": {
                      "type": "string",
                      "format": "date-time",
                      "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d(?:\\.\\d+)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                    },
                    "endAt": {
                      "type": "string",
                      "format": "date-time",
                      "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d(?:\\.\\d+)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                    },
                    "isAllDay": {
                      "type": "boolean"
                    },
                    "location": {
                      "nullable": true,
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 300
                    },
                    "meetingLink": {
                      "nullable": true,
                      "type": "string",
                      "maxLength": 2000,
                      "format": "uri"
                    },
                    "departmentId": {
                      "nullable": true,
                      "type": "string",
                      "minLength": 1
                    },
                    "organizerEmployeeId": {
                      "nullable": true,
                      "type": "string",
                      "minLength": 1
                    },
                    "attendeeEmployeeIds": {
                      "maxItems": 200,
                      "type": "array",
                      "items": {
                        "type": "string",
                        "minLength": 1
                      }
                    },
                    "attachments": {
                      "maxItems": 10,
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "key": {
                            "type": "string",
                            "minLength": 1,
                            "maxLength": 500
                          },
                          "originalName": {
                            "type": "string",
                            "minLength": 1,
                            "maxLength": 255
                          },
                          "contentType": {
                            "type": "string",
                            "minLength": 1,
                            "maxLength": 200
                          },
                          "size": {
                            "type": "integer",
                            "minimum": 0,
                            "maximum": 10485760
                          }
                        },
                        "required": [
                          "key",
                          "originalName",
                          "contentType",
                          "size"
                        ],
                        "additionalProperties": false
                      }
                    }
                  },
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Event updated"
            },
            "400": {
              "description": "Validation failed"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing permission or not the owner"
            },
            "404": {
              "description": "Event not found"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Update a calendar event",
          "tags": [
            "calendar"
          ]
        },
        "delete": {
          "description": "Soft delete (deletedAt / deletedByUserId); the event disappears from every read API. Only the creator, the organizer or a calendar manager may delete.",
          "operationId": "CalendarController_remove",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Event deleted"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing permission or not the owner"
            },
            "404": {
              "description": "Event not found"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Delete a calendar event",
          "tags": [
            "calendar"
          ]
        }
      },
      "/api/v1/calendar/upcoming": {
        "get": {
          "description": "Visible events that are ongoing or start within the next `days` (default 30, max 365), ordered by start time and paginated.",
          "operationId": "CalendarController_upcoming",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "integer",
                "minimum": 1,
                "maximum": 9007199254740991
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "default": 20,
                "type": "integer",
                "minimum": 1,
                "maximum": 100
              }
            },
            {
              "name": "eventType",
              "required": false,
              "in": "query",
              "schema": {
                "minItems": 1,
                "type": "array",
                "items": {
                  "type": "string",
                  "enum": [
                    "MEETING",
                    "TRAINING",
                    "WORKSHOP",
                    "CELEBRATION",
                    "ANNOUNCEMENT",
                    "COMPANY_EVENT",
                    "REMINDER",
                    "OTHER"
                  ]
                },
                "example": "MEETING,TRAINING"
              },
              "description": "Filter by event type. Comma-separated for several: MEETING, TRAINING, WORKSHOP, CELEBRATION, ANNOUNCEMENT, COMPANY_EVENT, REMINDER, OTHER."
            },
            {
              "name": "visibility",
              "required": false,
              "in": "query",
              "schema": {
                "minItems": 1,
                "type": "array",
                "items": {
                  "type": "string",
                  "enum": [
                    "PUBLIC",
                    "PRIVATE",
                    "DEPARTMENT"
                  ]
                },
                "example": "PUBLIC"
              },
              "description": "Filter by visibility. Comma-separated for several: PUBLIC, PRIVATE, DEPARTMENT."
            },
            {
              "name": "days",
              "required": false,
              "in": "query",
              "schema": {
                "default": 30,
                "type": "integer",
                "minimum": 1,
                "maximum": 365
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Upcoming activities retrieved"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing permission or not the owner"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "List upcoming activities",
          "tags": [
            "calendar"
          ]
        }
      },
      "/api/v1/calendar/today": {
        "get": {
          "description": "Visible events overlapping the given day (default: today) in `timezone` (IANA, default CALENDAR_DEFAULT_TIMEZONE or UTC). All-day events are listed first.",
          "operationId": "CalendarController_today",
          "parameters": [
            {
              "name": "date",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
              }
            },
            {
              "name": "timezone",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "maxLength": 64
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Today's schedule retrieved"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing permission or not the owner"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Today's schedule",
          "tags": [
            "calendar"
          ]
        }
      },
      "/api/v1/calendar/widget/upcoming": {
        "get": {
          "description": "Compact list (id, title, type, times, location) of the next `limit` (default 5, max 20) visible events within `days`, plus the total count.",
          "operationId": "CalendarController_widgetUpcoming",
          "parameters": [
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "default": 5,
                "type": "integer",
                "minimum": 1,
                "maximum": 20
              }
            },
            {
              "name": "days",
              "required": false,
              "in": "query",
              "schema": {
                "default": 30,
                "type": "integer",
                "minimum": 1,
                "maximum": 365
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Widget data retrieved"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing permission or not the owner"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Upcoming events widget",
          "tags": [
            "calendar"
          ]
        }
      },
      "/api/v1/calendar/search": {
        "get": {
          "description": "Case-insensitive search of title, description and location (`q`, required) among visible events. Supports the same filters, range, sorting and pagination as the list API.",
          "operationId": "CalendarController_search",
          "parameters": [
            {
              "name": "q",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1,
                "maxLength": 100
              },
              "description": "Search text"
            },
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "integer",
                "minimum": 1,
                "maximum": 9007199254740991
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "default": 20,
                "type": "integer",
                "minimum": 1,
                "maximum": 100
              }
            },
            {
              "name": "eventType",
              "required": false,
              "in": "query",
              "schema": {
                "minItems": 1,
                "type": "array",
                "items": {
                  "type": "string",
                  "enum": [
                    "MEETING",
                    "TRAINING",
                    "WORKSHOP",
                    "CELEBRATION",
                    "ANNOUNCEMENT",
                    "COMPANY_EVENT",
                    "REMINDER",
                    "OTHER"
                  ]
                },
                "example": "MEETING,TRAINING"
              },
              "description": "Filter by event type. Comma-separated for several: MEETING, TRAINING, WORKSHOP, CELEBRATION, ANNOUNCEMENT, COMPANY_EVENT, REMINDER, OTHER."
            },
            {
              "name": "visibility",
              "required": false,
              "in": "query",
              "schema": {
                "minItems": 1,
                "type": "array",
                "items": {
                  "type": "string",
                  "enum": [
                    "PUBLIC",
                    "PRIVATE",
                    "DEPARTMENT"
                  ]
                },
                "example": "PUBLIC"
              },
              "description": "Filter by visibility. Comma-separated for several: PUBLIC, PRIVATE, DEPARTMENT."
            },
            {
              "name": "from",
              "required": false,
              "in": "query",
              "schema": {
                "anyOf": [
                  {
                    "type": "string",
                    "format": "date-time",
                    "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d(?:\\.\\d+)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                  },
                  {
                    "type": "string",
                    "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
                  }
                ]
              }
            },
            {
              "name": "to",
              "required": false,
              "in": "query",
              "schema": {
                "anyOf": [
                  {
                    "type": "string",
                    "format": "date-time",
                    "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d(?:\\.\\d+)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                  },
                  {
                    "type": "string",
                    "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
                  }
                ]
              }
            },
            {
              "name": "sortBy",
              "required": false,
              "in": "query",
              "schema": {
                "default": "startAt",
                "type": "string",
                "enum": [
                  "startAt",
                  "endAt",
                  "title",
                  "eventType",
                  "createdAt"
                ]
              }
            },
            {
              "name": "sortOrder",
              "required": false,
              "in": "query",
              "schema": {
                "default": "asc",
                "type": "string",
                "enum": [
                  "asc",
                  "desc"
                ]
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Matching events retrieved"
            },
            "400": {
              "description": "q is missing or invalid"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing permission or not the owner"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Search calendar events",
          "tags": [
            "calendar"
          ]
        }
      },
      "/api/v1/calendar/view/monthly": {
        "get": {
          "description": "Every date of the month with the events occupying it (multi-day events appear on each date), plus month metadata (monthName, daysInMonth, firstWeekday), UTC range instants (`rangeEnd` exclusive), `today` and previous/next navigation. Only events visible to the caller are returned. Pass `year` and `month` together; both default to the current month in `timezone`. Capped at 2000 events (`truncated` reports it). Each day carries `isWeeklyOff` / `weeklyOffRule` from the stored weekly-off policy (see /calendar/weekly-offs), plus a `weeklyOffCount`.",
          "operationId": "CalendarViewsController_monthly",
          "parameters": [
            {
              "name": "timezone",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "maxLength": 64
              },
              "description": "IANA time zone used for day boundaries (e.g. Asia/Kolkata). Defaults to CALENDAR_DEFAULT_TIMEZONE, then UTC."
            },
            {
              "name": "eventType",
              "required": false,
              "in": "query",
              "schema": {
                "minItems": 1,
                "type": "array",
                "items": {
                  "type": "string",
                  "enum": [
                    "MEETING",
                    "TRAINING",
                    "WORKSHOP",
                    "CELEBRATION",
                    "ANNOUNCEMENT",
                    "COMPANY_EVENT",
                    "REMINDER",
                    "OTHER"
                  ]
                }
              },
              "description": "Comma-separated filter, e.g. MEETING,TRAINING / PUBLIC,PRIVATE."
            },
            {
              "name": "visibility",
              "required": false,
              "in": "query",
              "schema": {
                "minItems": 1,
                "type": "array",
                "items": {
                  "type": "string",
                  "enum": [
                    "PUBLIC",
                    "PRIVATE",
                    "DEPARTMENT"
                  ]
                }
              },
              "description": "Comma-separated filter, e.g. MEETING,TRAINING / PUBLIC,PRIVATE."
            },
            {
              "name": "year",
              "required": false,
              "in": "query",
              "schema": {
                "type": "integer",
                "minimum": 1970,
                "maximum": 2100,
                "example": 2026
              }
            },
            {
              "name": "month",
              "required": false,
              "in": "query",
              "schema": {
                "type": "integer",
                "minimum": 1,
                "maximum": 12,
                "example": 12
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Monthly view retrieved"
            },
            "400": {
              "description": "Invalid query parameters"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing calendar:read"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Monthly calendar view",
          "tags": [
            "calendar-views"
          ]
        }
      },
      "/api/v1/calendar/view/weekly": {
        "get": {
          "description": "Seven dates (ISO week, Monday to Sunday) with their events. Select the week with `date` (any date inside it) or with `year` + `week` (ISO-8601 week number); omit both for the current week in `timezone`. Capped at 1000 events. Each day carries `isWeeklyOff` / `weeklyOffRule` from the stored weekly-off policy, plus a `weeklyOffCount`.",
          "operationId": "CalendarViewsController_weekly",
          "parameters": [
            {
              "name": "timezone",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "maxLength": 64
              },
              "description": "IANA time zone used for day boundaries (e.g. Asia/Kolkata). Defaults to CALENDAR_DEFAULT_TIMEZONE, then UTC."
            },
            {
              "name": "eventType",
              "required": false,
              "in": "query",
              "schema": {
                "minItems": 1,
                "type": "array",
                "items": {
                  "type": "string",
                  "enum": [
                    "MEETING",
                    "TRAINING",
                    "WORKSHOP",
                    "CELEBRATION",
                    "ANNOUNCEMENT",
                    "COMPANY_EVENT",
                    "REMINDER",
                    "OTHER"
                  ]
                }
              },
              "description": "Comma-separated filter, e.g. MEETING,TRAINING / PUBLIC,PRIVATE."
            },
            {
              "name": "visibility",
              "required": false,
              "in": "query",
              "schema": {
                "minItems": 1,
                "type": "array",
                "items": {
                  "type": "string",
                  "enum": [
                    "PUBLIC",
                    "PRIVATE",
                    "DEPARTMENT"
                  ]
                }
              },
              "description": "Comma-separated filter, e.g. MEETING,TRAINING / PUBLIC,PRIVATE."
            },
            {
              "name": "date",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$",
                "example": "2026-12-01"
              }
            },
            {
              "name": "year",
              "required": false,
              "in": "query",
              "schema": {
                "type": "integer",
                "minimum": 1970,
                "maximum": 2100,
                "example": 2026
              }
            },
            {
              "name": "week",
              "required": false,
              "in": "query",
              "schema": {
                "type": "integer",
                "minimum": 1,
                "maximum": 53,
                "example": 49
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Weekly view retrieved"
            },
            "400": {
              "description": "Invalid query parameters"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing calendar:read"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Weekly calendar view",
          "tags": [
            "calendar-views"
          ]
        }
      },
      "/api/v1/calendar/view/daily": {
        "get": {
          "description": "One date (default today in `timezone`) with its events split into `allDayEvents` and `timedEvents` (ordered by start time), plus weekday/ISO-week metadata and previous/next dates. Capped at 500 events. Includes `isWeeklyOff` / `weeklyOffRule` from the stored weekly-off policy.",
          "operationId": "CalendarViewsController_daily",
          "parameters": [
            {
              "name": "timezone",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "maxLength": 64
              },
              "description": "IANA time zone used for day boundaries (e.g. Asia/Kolkata). Defaults to CALENDAR_DEFAULT_TIMEZONE, then UTC."
            },
            {
              "name": "eventType",
              "required": false,
              "in": "query",
              "schema": {
                "minItems": 1,
                "type": "array",
                "items": {
                  "type": "string",
                  "enum": [
                    "MEETING",
                    "TRAINING",
                    "WORKSHOP",
                    "CELEBRATION",
                    "ANNOUNCEMENT",
                    "COMPANY_EVENT",
                    "REMINDER",
                    "OTHER"
                  ]
                }
              },
              "description": "Comma-separated filter, e.g. MEETING,TRAINING / PUBLIC,PRIVATE."
            },
            {
              "name": "visibility",
              "required": false,
              "in": "query",
              "schema": {
                "minItems": 1,
                "type": "array",
                "items": {
                  "type": "string",
                  "enum": [
                    "PUBLIC",
                    "PRIVATE",
                    "DEPARTMENT"
                  ]
                }
              },
              "description": "Comma-separated filter, e.g. MEETING,TRAINING / PUBLIC,PRIVATE."
            },
            {
              "name": "date",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$",
                "example": "2026-12-01"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Daily view retrieved"
            },
            "400": {
              "description": "Invalid query parameters"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing calendar:read"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Daily calendar view",
          "tags": [
            "calendar-views"
          ]
        }
      },
      "/api/v1/calendar/view/yearly": {
        "get": {
          "description": "Year overview: `months` (12 summaries with distinct event counts and active days) plus `days`, which lists only dates that have events. `days` is paginated (`page`, `limit` event-dates per page) and each day returns at most `maxEventsPerDay` events (`eventCount` and `hasMore` give the full picture). Capped at 5000 events (`truncated` reports it). Month summaries also carry `weeklyOffCount` and `weeklyOffDates` from the stored weekly-off policy, and event days carry `isWeeklyOff`.",
          "operationId": "CalendarViewsController_yearly",
          "parameters": [
            {
              "name": "timezone",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "maxLength": 64
              },
              "description": "IANA time zone used for day boundaries (e.g. Asia/Kolkata). Defaults to CALENDAR_DEFAULT_TIMEZONE, then UTC."
            },
            {
              "name": "eventType",
              "required": false,
              "in": "query",
              "schema": {
                "minItems": 1,
                "type": "array",
                "items": {
                  "type": "string",
                  "enum": [
                    "MEETING",
                    "TRAINING",
                    "WORKSHOP",
                    "CELEBRATION",
                    "ANNOUNCEMENT",
                    "COMPANY_EVENT",
                    "REMINDER",
                    "OTHER"
                  ]
                }
              },
              "description": "Comma-separated filter, e.g. MEETING,TRAINING / PUBLIC,PRIVATE."
            },
            {
              "name": "visibility",
              "required": false,
              "in": "query",
              "schema": {
                "minItems": 1,
                "type": "array",
                "items": {
                  "type": "string",
                  "enum": [
                    "PUBLIC",
                    "PRIVATE",
                    "DEPARTMENT"
                  ]
                }
              },
              "description": "Comma-separated filter, e.g. MEETING,TRAINING / PUBLIC,PRIVATE."
            },
            {
              "name": "year",
              "required": false,
              "in": "query",
              "schema": {
                "type": "integer",
                "minimum": 1970,
                "maximum": 2100,
                "example": 2026
              }
            },
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "integer",
                "minimum": 1,
                "maximum": 9007199254740991,
                "example": 1
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "default": 50,
                "type": "integer",
                "minimum": 1,
                "maximum": 366,
                "example": 50
              }
            },
            {
              "name": "maxEventsPerDay",
              "required": false,
              "in": "query",
              "schema": {
                "default": 5,
                "type": "integer",
                "minimum": 1,
                "maximum": 20,
                "example": 5
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Yearly view retrieved"
            },
            "400": {
              "description": "Invalid query parameters"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing calendar:read"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Yearly calendar view",
          "tags": [
            "calendar-views"
          ]
        }
      },
      "/api/v1/calendar/export": {
        "get": {
          "description": "Downloads the calendar events visible to the caller (same visibility rules as the other calendar APIs; private events are only exported to their creator, organizer and attendees) as a PDF or an Excel (.xlsx) file. Columns: date, start time, end date, end time, title, description, event type, visibility and location, with headings that state the date range, time zone and applied filters. Events overlapping the range are included, ordered by start time. Date-only `from`/`to` values are interpreted in `timezone`. Results are read in batches and streamed; at most 20000 events are exported (the `X-Export-Truncated` header and a notice in the file report when more matched). An empty result still returns a valid file with a \"no events\" message.",
          "operationId": "CalendarExportController_export",
          "parameters": [
            {
              "name": "format",
              "required": true,
              "in": "query",
              "schema": {
                "enum": [
                  "pdf",
                  "xlsx"
                ],
                "type": "string"
              },
              "description": "Output format."
            },
            {
              "name": "from",
              "required": false,
              "in": "query",
              "schema": {
                "anyOf": [
                  {
                    "type": "string",
                    "format": "date-time",
                    "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d(?:\\.\\d+)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                  },
                  {
                    "type": "string",
                    "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
                  }
                ],
                "example": "2026-12-01"
              },
              "description": "Range start: YYYY-MM-DD (start of that day in `timezone`) or ISO date-time with offset."
            },
            {
              "name": "to",
              "required": false,
              "in": "query",
              "schema": {
                "anyOf": [
                  {
                    "type": "string",
                    "format": "date-time",
                    "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d(?:\\.\\d+)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                  },
                  {
                    "type": "string",
                    "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
                  }
                ],
                "example": "2026-12-31"
              },
              "description": "Range end: YYYY-MM-DD (end of that day in `timezone`) or ISO date-time with offset. Must not be before `from`."
            },
            {
              "name": "eventType",
              "required": false,
              "in": "query",
              "schema": {
                "minItems": 1,
                "type": "array",
                "items": {
                  "type": "string",
                  "enum": [
                    "MEETING",
                    "TRAINING",
                    "WORKSHOP",
                    "CELEBRATION",
                    "ANNOUNCEMENT",
                    "COMPANY_EVENT",
                    "REMINDER",
                    "OTHER"
                  ]
                }
              },
              "description": "Comma-separated: MEETING, TRAINING, WORKSHOP, CELEBRATION, ANNOUNCEMENT, COMPANY_EVENT, REMINDER, OTHER."
            },
            {
              "name": "visibility",
              "required": false,
              "in": "query",
              "schema": {
                "minItems": 1,
                "type": "array",
                "items": {
                  "type": "string",
                  "enum": [
                    "PUBLIC",
                    "PRIVATE",
                    "DEPARTMENT"
                  ]
                }
              },
              "description": "Comma-separated: PUBLIC, PRIVATE, DEPARTMENT."
            },
            {
              "name": "timezone",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "maxLength": 64,
                "example": "Asia/Kolkata"
              },
              "description": "IANA time zone for dates and times in the file. Defaults to CALENDAR_DEFAULT_TIMEZONE, then UTC."
            }
          ],
          "responses": {
            "200": {
              "description": "The file. Headers: Content-Disposition (filename), X-Total-Events, X-Exported-Events, X-Export-Truncated.",
              "content": {
                "application/pdf": {
                  "schema": {
                    "type": "string",
                    "format": "binary"
                  }
                },
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
                  "schema": {
                    "type": "string",
                    "format": "binary"
                  }
                }
              }
            },
            "400": {
              "description": "Invalid format, filters, time zone or date range"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing calendar:read or calendar:export"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Export calendar events as PDF or Excel",
          "tags": [
            "calendar-export"
          ]
        }
      },
      "/api/v1/calendar/weekly-offs": {
        "get": {
          "description": "Returns the configured company weekly-off rules. Each rule is a weekday plus an optional occurrence: no occurrence (`WEEKLY`) means every such weekday, 1-5 (`MONTHLY`) means only the nth such weekday of each month. The default policy is every Sunday plus the 2nd and 4th Saturday of every month.",
          "operationId": "WeeklyOffController_getPolicy",
          "parameters": [
            {
              "name": "timezone",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "maxLength": 64
              },
              "description": "IANA time zone used for \"today\" and the default year (e.g. Asia/Kolkata). Defaults to CALENDAR_DEFAULT_TIMEZONE, then UTC."
            }
          ],
          "responses": {
            "200": {
              "description": "Weekly-off policy retrieved"
            },
            "400": {
              "description": "Invalid query parameters"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing calendar:read"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Get the weekly-off policy",
          "tags": [
            "calendar-weekly-offs"
          ]
        },
        "post": {
          "description": "Replaces the company weekly-off policy with the given rules (atomically). Rules are recurring and company-wide: `weekday` plus an optional `occurrence` (1-5); omit it for every such weekday. Duplicate rules, and nth-occurrence rules made redundant by an \"every\" rule for the same weekday, are rejected. Sending an empty list removes all weekly offs. Holiday and event records are never modified.",
          "operationId": "WeeklyOffController_configure",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "rules": {
                      "maxItems": 35,
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "weekday": {
                            "type": "string",
                            "enum": [
                              "MONDAY",
                              "TUESDAY",
                              "WEDNESDAY",
                              "THURSDAY",
                              "FRIDAY",
                              "SATURDAY",
                              "SUNDAY"
                            ]
                          },
                          "occurrence": {
                            "nullable": true,
                            "type": "integer",
                            "minimum": 1,
                            "maximum": 5
                          }
                        },
                        "required": [
                          "weekday"
                        ],
                        "additionalProperties": false
                      }
                    }
                  },
                  "required": [
                    "rules"
                  ],
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Weekly-off policy configured"
            },
            "400": {
              "description": "Validation failed (invalid weekday/occurrence or duplicates)"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing calendar:configure"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Configure weekly-off rules",
          "tags": [
            "calendar-weekly-offs"
          ]
        }
      },
      "/api/v1/calendar/weekly-offs/dates": {
        "get": {
          "description": "Calculates the weekly-off dates from the stored rules for any month (`year` + `month`) or whole year (`year` only). The nth weekday is derived from the calendar, so months with four or five Saturdays and leap years are handled. Weekly offs are separate from holidays and are not stored per date. `year` defaults to the current year in `timezone`.",
          "operationId": "WeeklyOffController_dates",
          "parameters": [
            {
              "name": "year",
              "required": false,
              "in": "query",
              "schema": {
                "type": "integer",
                "minimum": 1970,
                "maximum": 2100,
                "example": 2026
              }
            },
            {
              "name": "month",
              "required": false,
              "in": "query",
              "schema": {
                "type": "integer",
                "minimum": 1,
                "maximum": 12,
                "example": 12
              },
              "description": "Omit for the whole year."
            },
            {
              "name": "timezone",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "maxLength": 64
              },
              "description": "IANA time zone used for \"today\" and the default year (e.g. Asia/Kolkata). Defaults to CALENDAR_DEFAULT_TIMEZONE, then UTC."
            }
          ],
          "responses": {
            "200": {
              "description": "Weekly-off dates generated"
            },
            "400": {
              "description": "Invalid query parameters"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing calendar:read"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Generate weekly-off dates for a month or year",
          "tags": [
            "calendar-weekly-offs"
          ]
        }
      },
      "/api/v1/calendar/holidays/{id}/notify": {
        "post": {
          "description": "Emails all current (non-terminated) employees about the holiday: name, date, category and description. Uses the existing SMTP configuration (MAIL_*). The attempt is recorded with its status (`SENT`, `PARTIAL` or `FAILED`), recipient / sent / failed counts and timestamp. A holiday that was already notified for the same date returns 409 unless `resend: true` is sent. If no email could be delivered the response is 502 and the failed attempt is still recorded. A recurring holiday is announced for its next occurrence. Notifications are never sent automatically when a holiday is created. Company-wide only: department-specific and legacy optional holidays are rejected.",
          "operationId": "HolidayNotificationController_notify",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "pattern": "^[A-Za-z0-9_-]{1,64}$"
              }
            }
          ],
          "requestBody": {
            "required": false,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "resend": {
                      "default": false,
                      "type": "boolean"
                    }
                  },
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Notification sent (`SENT`) or partially delivered (`PARTIAL`); data holds status, counts and timestamps"
            },
            "400": {
              "description": "Invalid holiday id or body, inactive / department-specific / uncategorised holiday, or no employee emails"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing holidays:notify"
            },
            "404": {
              "description": "Holiday not found"
            },
            "409": {
              "description": "Already notified for this date (use resend) or another notification is in progress"
            },
            "502": {
              "description": "Email delivery failed for every recipient; attempt recorded"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Notify employees about a holiday",
          "tags": [
            "calendar-holidays"
          ]
        }
      },
      "/api/v1/calendar/holidays/download": {
        "get": {
          "description": "Downloads the active company-wide NATIONAL, COMPANY and FESTIVAL holidays of `year`, sorted by date, as a PDF or an Excel (.xlsx) file headed \"Holiday Calendar <year>\". Recurring national holidays configured in earlier years are included on their date in the requested year (same logic as listing holidays with the `year` filter). Columns: Holiday Name, Holiday Date, Category, Description, Is Recurring (the Excel file uses the import template headers). An empty year still returns a valid file. Filenames: holiday-calendar-<year>.pdf / .xlsx.",
          "operationId": "HolidayCalendarController_download",
          "parameters": [
            {
              "name": "year",
              "required": false,
              "in": "query",
              "schema": {
                "type": "integer",
                "minimum": 2000,
                "maximum": 2100,
                "example": 2027
              },
              "description": "Calendar year (2000-2100). Defaults to the current year in CALENDAR_DEFAULT_TIMEZONE."
            },
            {
              "name": "format",
              "required": true,
              "in": "query",
              "schema": {
                "enum": [
                  "pdf",
                  "xlsx"
                ],
                "type": "string"
              },
              "description": "Output format."
            }
          ],
          "responses": {
            "200": {
              "description": "The file. Headers: Content-Disposition (filename), X-Total-Holidays.",
              "content": {
                "application/pdf": {
                  "schema": {
                    "type": "string",
                    "format": "binary"
                  }
                },
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
                  "schema": {
                    "type": "string",
                    "format": "binary"
                  }
                }
              }
            },
            "400": {
              "description": "Invalid year or format"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing holidays:read"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Download the holiday calendar of a year (PDF or Excel)",
          "tags": [
            "calendar-holidays"
          ]
        }
      },
      "/api/v1/calendar/holidays/import": {
        "post": {
          "description": "Creates company-wide holidays from an .xlsx file (multipart field `file`, max 2MB, at most 1000 rows). Columns (header row, in any order): **Holiday Name**, **Holiday Date** (YYYY-MM-DD or an Excel date), **Category** (NATIONAL, COMPANY or FESTIVAL, case-insensitive), Description, Is Recurring (Yes/No or TRUE/FALSE, blank = No; NATIONAL only). Rows use the same validation as POST /holidays. Invalid rows and duplicates (same category and date, inside the file or already stored) are reported with their Excel row numbers; the remaining valid rows are imported in one atomic write, so the response is 201 with `status: PARTIAL` when some rows were skipped, 201 with `COMPLETED` when all were imported, and 422 with the same report when nothing could be imported. A wrong file type, empty file, unreadable workbook or wrong columns is rejected with 400 and imports nothing. Optional, department-specific, branch, state and regional holidays are not supported. No notifications are sent.",
          "operationId": "HolidayCalendarController_import",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "required": [
                    "file"
                  ],
                  "properties": {
                    "file": {
                      "type": "string",
                      "format": "binary"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Imported (`COMPLETED` or `PARTIAL`). data.summary: totalRows, imported, failed, duplicates; data.rows: one entry per failed / duplicate row with its Excel row number and errors."
            },
            "400": {
              "description": "Missing, empty, oversized, non-.xlsx or unreadable file, or wrong columns"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing holidays:create"
            },
            "413": {
              "description": "File exceeds the size limit"
            },
            "422": {
              "description": "No row could be imported; body contains the row report"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Import holidays from an Excel file",
          "tags": [
            "calendar-holidays"
          ]
        }
      },
      "/api/v1/holidays": {
        "post": {
          "description": "Creates a company-wide holiday of a category: NATIONAL, COMPANY or FESTIVAL. `year` is derived from `holidayDate` (if sent it must match). `isRecurring` repeats a NATIONAL holiday on the same month/day every later year. One holiday per category and date: a duplicate returns 409 (a national holiday and a festival may share a date). Legacy requests that send only `type` (PUBLIC -> NATIONAL, COMPANY -> COMPANY) still work; categorised holidays do not accept `departmentId`.",
          "operationId": "HolidaysController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "name": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 200
                    },
                    "holidayDate": {
                      "type": "string",
                      "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
                    },
                    "year": {
                      "type": "integer",
                      "minimum": 2000,
                      "maximum": 2100
                    },
                    "description": {
                      "type": "string",
                      "maxLength": 2000
                    },
                    "category": {
                      "type": "string",
                      "enum": [
                        "NATIONAL",
                        "COMPANY",
                        "FESTIVAL"
                      ]
                    },
                    "type": {
                      "type": "string",
                      "enum": [
                        "PUBLIC",
                        "OPTIONAL",
                        "COMPANY"
                      ]
                    },
                    "isRecurring": {
                      "default": false,
                      "type": "boolean"
                    },
                    "departmentId": {
                      "type": "string",
                      "minLength": 1
                    },
                    "isActive": {
                      "default": true,
                      "type": "boolean"
                    }
                  },
                  "required": [
                    "name",
                    "holidayDate"
                  ],
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Holiday created"
            },
            "400": {
              "description": "Validation failed"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing holidays:create"
            },
            "404": {
              "description": "Department not found"
            },
            "409": {
              "description": "Duplicate holiday for date and scope"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Create a holiday",
          "tags": [
            "holidays"
          ]
        },
        "get": {
          "description": "Paginated holidays with filters: category (NATIONAL | COMPANY | FESTIVAL), year, holidayDate, type, isRecurring, isActive, companyWide, departmentId. With `year`, recurring NATIONAL holidays from earlier years are included, projected onto that year (`isProjected: true`) unless the year has its own record for that day.",
          "operationId": "HolidaysController_findAll",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "integer",
                "minimum": 1,
                "maximum": 9007199254740991
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "default": 20,
                "type": "integer",
                "minimum": 1,
                "maximum": 100
              }
            },
            {
              "name": "year",
              "required": false,
              "in": "query",
              "schema": {
                "type": "integer",
                "minimum": 2000,
                "maximum": 2100,
                "example": 2026
              }
            },
            {
              "name": "holidayDate",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$",
                "example": "2026-01-26"
              }
            },
            {
              "name": "category",
              "required": false,
              "in": "query",
              "schema": {
                "enum": [
                  "NATIONAL",
                  "COMPANY",
                  "FESTIVAL"
                ],
                "type": "string"
              }
            },
            {
              "name": "type",
              "required": false,
              "in": "query",
              "schema": {
                "enum": [
                  "PUBLIC",
                  "COMPANY",
                  "OPTIONAL"
                ],
                "type": "string"
              },
              "description": "Legacy filter"
            },
            {
              "name": "departmentId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            },
            {
              "name": "companyWide",
              "required": false,
              "in": "query",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "name": "isRecurring",
              "required": false,
              "in": "query",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "name": "isActive",
              "required": false,
              "in": "query",
              "schema": {
                "type": "boolean"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Holidays retrieved"
            },
            "400": {
              "description": "Invalid query parameters"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing holidays:read"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "List holidays",
          "tags": [
            "holidays"
          ]
        }
      },
      "/api/v1/holidays/{id}": {
        "get": {
          "operationId": "HolidaysController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Holiday retrieved"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing holidays:read"
            },
            "404": {
              "description": "Holiday not found"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Get holiday details",
          "tags": [
            "holidays"
          ]
        },
        "patch": {
          "description": "Partial update. May change category (NATIONAL | COMPANY | FESTIVAL), date (year follows the date), description and recurrence. Changing the category or date re-checks the one-holiday-per-category-and-date rule.",
          "operationId": "HolidaysController_update",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "name": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 200
                    },
                    "holidayDate": {
                      "type": "string",
                      "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
                    },
                    "year": {
                      "type": "integer",
                      "minimum": 2000,
                      "maximum": 2100
                    },
                    "description": {
                      "nullable": true,
                      "type": "string",
                      "maxLength": 2000
                    },
                    "category": {
                      "type": "string",
                      "enum": [
                        "NATIONAL",
                        "COMPANY",
                        "FESTIVAL"
                      ]
                    },
                    "type": {
                      "type": "string",
                      "enum": [
                        "PUBLIC",
                        "OPTIONAL",
                        "COMPANY"
                      ]
                    },
                    "isRecurring": {
                      "type": "boolean"
                    },
                    "departmentId": {
                      "nullable": true,
                      "type": "string",
                      "minLength": 1
                    },
                    "isActive": {
                      "type": "boolean"
                    }
                  },
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Holiday updated"
            },
            "400": {
              "description": "Validation failed"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing holidays:update"
            },
            "404": {
              "description": "Holiday or department not found"
            },
            "409": {
              "description": "Duplicate holiday for date and scope"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Update a holiday",
          "tags": [
            "holidays"
          ]
        },
        "delete": {
          "description": "Hard-deletes the holiday (not referenced by leave records).",
          "operationId": "HolidaysController_remove",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Holiday deleted"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing holidays:delete"
            },
            "404": {
              "description": "Holiday not found"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Delete a holiday",
          "tags": [
            "holidays"
          ]
        }
      },
      "/api/v1/leaves": {
        "post": {
          "description": "Creates a PENDING leave request keyed by `employeeId`. Employees may only apply for their own linked employeeId (`leaves:create`). HR/Admin with `leaves:create_on_behalf` may apply for another employee. Target employee must exist and not be TERMINATED. Overlapping PENDING/APPROVED ranges are rejected.",
          "operationId": "LeavesController_apply",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "employeeId": {
                      "type": "string",
                      "minLength": 1
                    },
                    "leaveTypeId": {
                      "type": "string",
                      "minLength": 1
                    },
                    "startDate": {
                      "type": "string",
                      "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
                    },
                    "endDate": {
                      "type": "string",
                      "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
                    },
                    "dayPortion": {
                      "default": "FULL_DAY",
                      "type": "string",
                      "enum": [
                        "FULL_DAY",
                        "FIRST_HALF",
                        "SECOND_HALF"
                      ]
                    },
                    "reason": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 1000
                    }
                  },
                  "required": [
                    "employeeId",
                    "leaveTypeId",
                    "startDate",
                    "endDate"
                  ],
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Leave request submitted"
            },
            "400": {
              "description": "Validation failed or employee ineligible / leave type inactive"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing leaves:create or leaves:create_on_behalf"
            },
            "404": {
              "description": "Employee or leave type not found"
            },
            "409": {
              "description": "Overlapping leave request exists"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Apply for leave",
          "tags": [
            "leaves"
          ]
        },
        "get": {
          "description": "Paginated leave requests. Non-elevated callers are scoped to their linked employeeId. Callers with `leaves:approve` or `leaves:create_on_behalf` may filter any employeeId.",
          "operationId": "LeavesController_findAll",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "integer",
                "minimum": 1,
                "maximum": 9007199254740991
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "default": 20,
                "type": "integer",
                "minimum": 1,
                "maximum": 100
              }
            },
            {
              "name": "employeeId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            },
            {
              "name": "status",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "enum": [
                  "PENDING",
                  "APPROVED",
                  "REJECTED",
                  "CANCELLED"
                ]
              }
            },
            {
              "name": "leaveTypeId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Leave requests retrieved"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing leaves:read permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "List leave requests",
          "tags": [
            "leaves"
          ]
        }
      },
      "/api/v1/leaves/balance/{employeeId}": {
        "get": {
          "description": "Returns year-specific EmployeeLeaveBalance rows. Used = sum of APPROVED paidDays; pending = PENDING totalDays; available = entitled + carriedForward − reserved paidDays (APPROVED+PENDING). LOP days do not reduce leave balance. Empty list when no balance rows exist.",
          "operationId": "LeavesController_getBalance",
          "parameters": [
            {
              "name": "employeeId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            },
            {
              "name": "leaveTypeId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            },
            {
              "name": "year",
              "required": false,
              "in": "query",
              "schema": {
                "type": "integer",
                "minimum": 2000,
                "maximum": 2100
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Leave balances retrieved"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Not authorized for this employeeId"
            },
            "404": {
              "description": "Employee not found"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Get leave balances for an employee",
          "tags": [
            "leaves"
          ]
        }
      },
      "/api/v1/leaves/history/{employeeId}": {
        "get": {
          "description": "Paginated leave requests for one employeeId with leave type, dates, status, reason, and reviewer details. Supports status, leaveTypeId, startDate, endDate, and year filters.",
          "operationId": "LeavesController_getHistory",
          "parameters": [
            {
              "name": "employeeId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            },
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "integer",
                "minimum": 1,
                "maximum": 9007199254740991
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "default": 20,
                "type": "integer",
                "minimum": 1,
                "maximum": 100
              }
            },
            {
              "name": "status",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "enum": [
                  "PENDING",
                  "APPROVED",
                  "REJECTED",
                  "CANCELLED"
                ]
              }
            },
            {
              "name": "leaveTypeId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            },
            {
              "name": "startDate",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
              }
            },
            {
              "name": "endDate",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
              }
            },
            {
              "name": "year",
              "required": false,
              "in": "query",
              "schema": {
                "type": "integer",
                "minimum": 2000,
                "maximum": 2100
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Leave history retrieved"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Not authorized for this employeeId"
            },
            "404": {
              "description": "Employee not found"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Get leave history for an employee",
          "tags": [
            "leaves"
          ]
        }
      },
      "/api/v1/leaves/calendar/team": {
        "get": {
          "description": "Approved leaves for the manager department team (same departmentId as the actor employee). HR/Admin with `leaves:create_on_behalf` sees organization-wide approved leaves. Supports month/year or custom date range.",
          "operationId": "LeavesController_getTeamCalendar",
          "parameters": [
            {
              "name": "year",
              "required": false,
              "in": "query",
              "schema": {
                "type": "integer",
                "minimum": 2000,
                "maximum": 2100
              }
            },
            {
              "name": "month",
              "required": false,
              "in": "query",
              "schema": {
                "type": "integer",
                "minimum": 1,
                "maximum": 12
              }
            },
            {
              "name": "startDate",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
              }
            },
            {
              "name": "endDate",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Team leave calendar retrieved"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing team calendar permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Get team leave calendar (approved only)",
          "tags": [
            "leaves"
          ]
        }
      },
      "/api/v1/leaves/calendar": {
        "get": {
          "description": "Approved leave requests in a date range. Employees see own leaves; managers see department team; HR/Admin with create_on_behalf see all. Pending/rejected/cancelled are excluded.",
          "operationId": "LeavesController_getCalendar",
          "parameters": [
            {
              "name": "year",
              "required": false,
              "in": "query",
              "schema": {
                "type": "integer",
                "minimum": 2000,
                "maximum": 2100
              }
            },
            {
              "name": "month",
              "required": false,
              "in": "query",
              "schema": {
                "type": "integer",
                "minimum": 1,
                "maximum": 12
              }
            },
            {
              "name": "startDate",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
              }
            },
            {
              "name": "endDate",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Leave calendar retrieved"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing leaves:read permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Get leave calendar (approved only)",
          "tags": [
            "leaves"
          ]
        }
      },
      "/api/v1/leaves/{id}": {
        "get": {
          "description": "Returns one leave request. Non-elevated callers may only read their own employeeId requests.",
          "operationId": "LeavesController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Leave request retrieved"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing permission or not own request"
            },
            "404": {
              "description": "Leave request not found"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Get leave request by id",
          "tags": [
            "leaves"
          ]
        }
      },
      "/api/v1/leaves/{id}/approve": {
        "post": {
          "description": "Sets status to APPROVED. Only PENDING requests can be approved.",
          "operationId": "LeavesController_approve",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "note": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 1000
                    }
                  },
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Leave request approved"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing leaves:approve permission"
            },
            "404": {
              "description": "Leave request not found"
            },
            "409": {
              "description": "Request is not PENDING"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Approve a pending leave request",
          "tags": [
            "leaves"
          ]
        }
      },
      "/api/v1/leaves/{id}/reject": {
        "post": {
          "description": "Sets status to REJECTED. Only PENDING requests can be rejected.",
          "operationId": "LeavesController_reject",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "note": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 1000
                    }
                  },
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Leave request rejected"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing leaves:approve permission"
            },
            "404": {
              "description": "Leave request not found"
            },
            "409": {
              "description": "Request is not PENDING"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Reject a pending leave request",
          "tags": [
            "leaves"
          ]
        }
      },
      "/api/v1/leaves/{id}/cancel": {
        "post": {
          "description": "Cancels PENDING or APPROVED requests. Employees may cancel their own; callers with `leaves:approve` may cancel any.",
          "operationId": "LeavesController_cancel",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "reason": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 1000
                    }
                  },
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Leave request cancelled"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing leaves:cancel or not own request"
            },
            "404": {
              "description": "Leave request not found"
            },
            "409": {
              "description": "Request cannot be cancelled"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Cancel a leave request",
          "tags": [
            "leaves"
          ]
        }
      },
      "/api/v1/leave-approval/workflows": {
        "post": {
          "description": "HR configures multi-level approval. Assignees are EXPLICIT_EMPLOYEES, DEPARTMENT (no manager hierarchy — Employee has no reporting-manager field), or ANY_PROCESSOR (leave_approval:process holders).",
          "operationId": "LeaveApprovalController_createWorkflow",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "name": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 200
                    },
                    "description": {
                      "type": "string",
                      "maxLength": 2000
                    },
                    "departmentId": {
                      "type": "string",
                      "minLength": 1
                    },
                    "leaveTypeIds": {
                      "minItems": 1,
                      "type": "array",
                      "items": {
                        "type": "string",
                        "minLength": 1
                      }
                    },
                    "levels": {
                      "minItems": 1,
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "levelNumber": {
                            "type": "integer",
                            "minimum": 1,
                            "maximum": 20
                          },
                          "name": {
                            "type": "string",
                            "minLength": 1,
                            "maxLength": 120
                          },
                          "assigneeType": {
                            "type": "string",
                            "enum": [
                              "EXPLICIT_EMPLOYEES",
                              "DEPARTMENT",
                              "ANY_PROCESSOR"
                            ]
                          },
                          "departmentId": {
                            "type": "string",
                            "minLength": 1
                          },
                          "assigneeEmployeeIds": {
                            "default": [],
                            "type": "array",
                            "items": {
                              "type": "string",
                              "minLength": 1
                            }
                          }
                        },
                        "required": [
                          "levelNumber",
                          "assigneeType"
                        ],
                        "additionalProperties": false
                      }
                    },
                    "isActive": {
                      "default": true,
                      "type": "boolean"
                    }
                  },
                  "required": [
                    "name",
                    "leaveTypeIds",
                    "levels"
                  ],
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Workflow created"
            },
            "400": {
              "description": "Validation failed"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing leave_approval:workflow_create"
            },
            "404": {
              "description": "Department, leave type, or employee not found"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Create a leave approval workflow",
          "tags": [
            "leave-approval"
          ]
        },
        "get": {
          "operationId": "LeaveApprovalController_listWorkflows",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "integer",
                "minimum": 1,
                "maximum": 9007199254740991
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "default": 20,
                "type": "integer",
                "minimum": 1,
                "maximum": 100
              }
            },
            {
              "name": "departmentId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            },
            {
              "name": "leaveTypeId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            },
            {
              "name": "isActive",
              "required": false,
              "in": "query",
              "schema": {
                "type": "boolean"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Workflows retrieved"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing leave_approval:workflow_read"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "List leave approval workflows",
          "tags": [
            "leave-approval"
          ]
        }
      },
      "/api/v1/leave-approval/workflows/{id}": {
        "get": {
          "operationId": "LeaveApprovalController_getWorkflow",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Workflow retrieved"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing leave_approval:workflow_read"
            },
            "404": {
              "description": "Workflow not found"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Get leave approval workflow",
          "tags": [
            "leave-approval"
          ]
        },
        "patch": {
          "operationId": "LeaveApprovalController_updateWorkflow",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "name": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 200
                    },
                    "description": {
                      "nullable": true,
                      "type": "string",
                      "maxLength": 2000
                    },
                    "departmentId": {
                      "nullable": true,
                      "type": "string",
                      "minLength": 1
                    },
                    "leaveTypeIds": {
                      "minItems": 1,
                      "type": "array",
                      "items": {
                        "type": "string",
                        "minLength": 1
                      }
                    },
                    "levels": {
                      "minItems": 1,
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "levelNumber": {
                            "type": "integer",
                            "minimum": 1,
                            "maximum": 20
                          },
                          "name": {
                            "type": "string",
                            "minLength": 1,
                            "maxLength": 120
                          },
                          "assigneeType": {
                            "type": "string",
                            "enum": [
                              "EXPLICIT_EMPLOYEES",
                              "DEPARTMENT",
                              "ANY_PROCESSOR"
                            ]
                          },
                          "departmentId": {
                            "type": "string",
                            "minLength": 1
                          },
                          "assigneeEmployeeIds": {
                            "default": [],
                            "type": "array",
                            "items": {
                              "type": "string",
                              "minLength": 1
                            }
                          }
                        },
                        "required": [
                          "levelNumber",
                          "assigneeType"
                        ],
                        "additionalProperties": false
                      }
                    },
                    "isActive": {
                      "type": "boolean"
                    }
                  },
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Workflow updated"
            },
            "400": {
              "description": "Validation failed"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing leave_approval:workflow_update"
            },
            "404": {
              "description": "Workflow not found"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Update leave approval workflow",
          "tags": [
            "leave-approval"
          ]
        },
        "delete": {
          "description": "Soft-deactivates (isActive=false). Existing in-flight requests keep their attached workflowId.",
          "operationId": "LeaveApprovalController_deactivateWorkflow",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Workflow deactivated"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing leave_approval:workflow_delete"
            },
            "404": {
              "description": "Workflow not found"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Deactivate leave approval workflow",
          "tags": [
            "leave-approval"
          ]
        }
      },
      "/api/v1/leave-approval/pending": {
        "get": {
          "description": "Returns PENDING leave requests where the actor is assigned to the current level only.",
          "operationId": "LeaveApprovalController_listPending",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "integer",
                "minimum": 1,
                "maximum": 9007199254740991
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "default": 20,
                "type": "integer",
                "minimum": 1,
                "maximum": 100
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Pending approvals retrieved"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing leave_approval:process"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "List pending approvals for the current approver",
          "tags": [
            "leave-approval"
          ]
        }
      },
      "/api/v1/leave-approval/history/{leaveRequestId}": {
        "get": {
          "description": "Employees see own history. Processors/HR see any. Records are never overwritten.",
          "operationId": "LeaveApprovalController_getHistory",
          "parameters": [
            {
              "name": "leaveRequestId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Approval history retrieved"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Not authorized for this request"
            },
            "404": {
              "description": "Leave request not found"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Get immutable approval history for a leave request",
          "tags": [
            "leave-approval"
          ]
        }
      },
      "/api/v1/leave-approval/{leaveRequestId}/approve": {
        "post": {
          "description": "Only the assigned approver for currentLevel may approve. Advances to next level or final APPROVED. Uses Prisma transactions and optimistic currentLevel checks.",
          "operationId": "LeaveApprovalController_approve",
          "parameters": [
            {
              "name": "leaveRequestId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "comments": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 1000
                    }
                  },
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Level approved"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Not assigned to current level"
            },
            "404": {
              "description": "Leave request not found"
            },
            "409": {
              "description": "Already processed / concurrent conflict / cancelled"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Approve current workflow level",
          "tags": [
            "leave-approval"
          ]
        }
      },
      "/api/v1/leave-approval/{leaveRequestId}/reject": {
        "post": {
          "description": "Terminates the workflow (LeaveRequest → REJECTED) and appends immutable history.",
          "operationId": "LeaveApprovalController_reject",
          "parameters": [
            {
              "name": "leaveRequestId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "comments": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 1000
                    }
                  },
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Request rejected"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Not assigned to current level"
            },
            "404": {
              "description": "Leave request not found"
            },
            "409": {
              "description": "Already processed / concurrent conflict"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Reject at current workflow level",
          "tags": [
            "leave-approval"
          ]
        }
      },
      "/api/v1/employee-leave-policies/defaults": {
        "get": {
          "description": "Configurable defaults (e.g. Paid Leave 14/1.5, Sick 6 annual). Not hardcoded in calculation services.",
          "operationId": "EmployeeLeavePoliciesController_listDefaults",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Defaults retrieved"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "List company leave policy defaults",
          "tags": [
            "employee-leave-policies"
          ]
        }
      },
      "/api/v1/employee-leave-policies/hr-overview": {
        "get": {
          "operationId": "EmployeeLeavePoliciesController_hrOverview",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "integer",
                "minimum": 1,
                "maximum": 9007199254740991
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "default": 20,
                "type": "integer",
                "minimum": 1,
                "maximum": 100
              }
            },
            {
              "name": "year",
              "required": false,
              "in": "query",
              "schema": {
                "type": "integer",
                "minimum": 2000,
                "maximum": 2100
              }
            },
            {
              "name": "departmentId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            },
            {
              "name": "search",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1,
                "maxLength": 100
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Overview retrieved"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "HR overview of employee leave balances",
          "tags": [
            "employee-leave-policies"
          ]
        }
      },
      "/api/v1/employee-leave-policies": {
        "get": {
          "operationId": "EmployeeLeavePoliciesController_list",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "integer",
                "minimum": 1,
                "maximum": 9007199254740991
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "default": 20,
                "type": "integer",
                "minimum": 1,
                "maximum": 100
              }
            },
            {
              "name": "employeeId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            },
            {
              "name": "leaveTypeId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            },
            {
              "name": "year",
              "required": false,
              "in": "query",
              "schema": {
                "type": "integer",
                "minimum": 2000,
                "maximum": 2100
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Policies retrieved"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "List employee leave policies",
          "tags": [
            "employee-leave-policies"
          ]
        },
        "post": {
          "description": "Upserts per-employee entitlement for a leave type/year. Historical accrual transactions are never rewritten.",
          "operationId": "EmployeeLeavePoliciesController_assign",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "employeeId": {
                      "type": "string",
                      "minLength": 1
                    },
                    "leaveTypeId": {
                      "type": "string",
                      "minLength": 1
                    },
                    "year": {
                      "type": "integer",
                      "minimum": 2000,
                      "maximum": 2100
                    },
                    "annualEntitlement": {
                      "type": "number",
                      "minimum": 0,
                      "maximum": 365
                    },
                    "monthlyAccrualAmount": {
                      "type": "number",
                      "minimum": 0,
                      "maximum": 31
                    },
                    "grantMode": {
                      "type": "string",
                      "enum": [
                        "MONTHLY_ACCRUAL",
                        "ANNUAL_GRANT"
                      ]
                    },
                    "effectiveFrom": {
                      "type": "string",
                      "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
                    },
                    "effectiveTo": {
                      "type": "string",
                      "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
                    },
                    "notes": {
                      "type": "string",
                      "maxLength": 2000
                    },
                    "isActive": {
                      "default": true,
                      "type": "boolean"
                    },
                    "useCompanyDefaults": {
                      "default": false,
                      "type": "boolean"
                    }
                  },
                  "required": [
                    "employeeId",
                    "leaveTypeId",
                    "year",
                    "effectiveFrom"
                  ],
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Policy saved"
            },
            "401": {
              "description": "Missing or invalid access token"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Assign or update an employee leave policy",
          "tags": [
            "employee-leave-policies"
          ]
        }
      },
      "/api/v1/employee-leave-policies/{employeeId}/dashboard": {
        "get": {
          "description": "Cards, per-type breakdown, accrual history, applications, and LOP history for a leave year.",
          "operationId": "EmployeeLeavePoliciesController_dashboard",
          "parameters": [
            {
              "name": "employeeId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            },
            {
              "name": "year",
              "required": false,
              "in": "query",
              "schema": {
                "type": "integer",
                "minimum": 2000,
                "maximum": 2100
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Dashboard retrieved"
            },
            "403": {
              "description": "Not allowed to view this employee"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Employee leave balance dashboard",
          "tags": [
            "employee-leave-policies"
          ]
        }
      },
      "/api/v1/employee-leave-policies/assign-defaults": {
        "post": {
          "operationId": "EmployeeLeavePoliciesController_assignDefaults",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "employeeId": {
                      "type": "string",
                      "minLength": 1
                    },
                    "year": {
                      "type": "integer",
                      "minimum": 2000,
                      "maximum": 2100
                    },
                    "effectiveFrom": {
                      "type": "string",
                      "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
                    }
                  },
                  "required": [
                    "employeeId"
                  ],
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Defaults assigned"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Assign all active company defaults to an employee",
          "tags": [
            "employee-leave-policies"
          ]
        }
      },
      "/api/v1/employee-leave-policies/adjustments": {
        "post": {
          "description": "Writes LeaveAdjustment + LeaveAccrualTransaction(ADJUSTMENT) and updates entitledDays. Marks balance as manually adjusted.",
          "operationId": "EmployeeLeavePoliciesController_adjust",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "employeeId": {
                      "type": "string",
                      "minLength": 1
                    },
                    "leaveTypeId": {
                      "type": "string",
                      "minLength": 1
                    },
                    "year": {
                      "type": "integer",
                      "minimum": 2000,
                      "maximum": 2100
                    },
                    "amount": {
                      "type": "number"
                    },
                    "reason": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 1000
                    }
                  },
                  "required": [
                    "employeeId",
                    "leaveTypeId",
                    "year",
                    "amount",
                    "reason"
                  ],
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Adjustment applied"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Add a manual leave credit/debit",
          "tags": [
            "employee-leave-policies"
          ]
        }
      },
      "/api/v1/leave-types": {
        "post": {
          "description": "Creates a leave type with unique UPPER_SNAKE_CASE code. Defaults: isPaid=true, isActive=true, requiresApproval=true.",
          "operationId": "LeaveTypesController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "code": {
                      "type": "string",
                      "pattern": "^[A-Z][A-Z0-9_]{1,63}$"
                    },
                    "name": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 120
                    },
                    "description": {
                      "type": "string",
                      "maxLength": 500
                    },
                    "isPaid": {
                      "default": true,
                      "type": "boolean"
                    },
                    "isActive": {
                      "default": true,
                      "type": "boolean"
                    },
                    "maxAllowedDays": {
                      "type": "integer",
                      "minimum": 1,
                      "maximum": 365
                    }
                  },
                  "required": [
                    "code",
                    "name"
                  ],
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Leave type created"
            },
            "400": {
              "description": "Validation failed"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing leave_types:create"
            },
            "409": {
              "description": "Leave type code already exists"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Create a leave type",
          "tags": [
            "leave-types"
          ]
        },
        "get": {
          "description": "Paginated catalog with search (name/code), isActive, isPaid filters, and sorting.",
          "operationId": "LeaveTypesController_findAll",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "integer",
                "minimum": 1,
                "maximum": 9007199254740991
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "default": 20,
                "type": "integer",
                "minimum": 1,
                "maximum": 100
              }
            },
            {
              "name": "search",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1,
                "maxLength": 120
              }
            },
            {
              "name": "isActive",
              "required": false,
              "in": "query",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "name": "isPaid",
              "required": false,
              "in": "query",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "name": "sortBy",
              "required": false,
              "in": "query",
              "schema": {
                "default": "code",
                "type": "string",
                "enum": [
                  "code",
                  "name",
                  "createdAt"
                ]
              }
            },
            {
              "name": "sortOrder",
              "required": false,
              "in": "query",
              "schema": {
                "default": "asc",
                "type": "string",
                "enum": [
                  "asc",
                  "desc"
                ]
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Leave types retrieved"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing leave_types:read"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "List leave types",
          "tags": [
            "leave-types"
          ]
        }
      },
      "/api/v1/leave-types/{id}": {
        "patch": {
          "description": "Updates name, description, isPaid, isActive, and/or maxAllowedDays. Code is immutable to protect existing leave request relationships.",
          "operationId": "LeaveTypesController_update",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "name": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 120
                    },
                    "description": {
                      "nullable": true,
                      "type": "string",
                      "maxLength": 500
                    },
                    "isPaid": {
                      "type": "boolean"
                    },
                    "isActive": {
                      "type": "boolean"
                    },
                    "maxAllowedDays": {
                      "nullable": true,
                      "type": "integer",
                      "minimum": 1,
                      "maximum": 365
                    }
                  },
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Leave type updated"
            },
            "400": {
              "description": "Validation failed"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing leave_types:update"
            },
            "404": {
              "description": "Leave type not found"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Update a leave type",
          "tags": [
            "leave-types"
          ]
        },
        "delete": {
          "description": "Hard-deletes when unused. If leave requests or balances reference the type, sets isActive=false instead — historical leave records are never cascade-deleted.",
          "operationId": "LeaveTypesController_remove",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Leave type deleted or deactivated"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing leave_types:delete"
            },
            "404": {
              "description": "Leave type not found"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Delete or deactivate a leave type",
          "tags": [
            "leave-types"
          ]
        }
      },
      "/api/v1/leave-policies/accrual": {
        "post": {
          "description": "HR/Admin configures accrual for a leave type (MONTHLY/YEARLY amount, annual/max caps, effective dates). Overlapping active policies for the same leave type + frequency are rejected.",
          "operationId": "LeavePoliciesController_createAccrual",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "leaveTypeId": {
                      "type": "string",
                      "minLength": 1
                    },
                    "frequency": {
                      "type": "string",
                      "enum": [
                        "MONTHLY",
                        "YEARLY"
                      ]
                    },
                    "accrualAmount": {
                      "type": "number",
                      "minimum": 0,
                      "exclusiveMinimum": true,
                      "maximum": 365
                    },
                    "annualAllocationLimit": {
                      "type": "number",
                      "minimum": 0,
                      "exclusiveMinimum": true,
                      "maximum": 365
                    },
                    "maxAccumulatedBalance": {
                      "type": "number",
                      "minimum": 0,
                      "exclusiveMinimum": true,
                      "maximum": 999
                    },
                    "effectiveFrom": {
                      "type": "string",
                      "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
                    },
                    "effectiveTo": {
                      "type": "string",
                      "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
                    },
                    "isActive": {
                      "default": true,
                      "type": "boolean"
                    }
                  },
                  "required": [
                    "leaveTypeId",
                    "frequency",
                    "accrualAmount",
                    "effectiveFrom"
                  ],
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Accrual policy created"
            },
            "400": {
              "description": "Validation failed or inactive leave type"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing leave_policies:create"
            },
            "404": {
              "description": "Leave type not found"
            },
            "409": {
              "description": "Overlapping accrual policy exists"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Create an accrual policy",
          "tags": [
            "leave-policies"
          ]
        },
        "get": {
          "description": "Paginated listing with filters: leaveTypeId, frequency, isActive.",
          "operationId": "LeavePoliciesController_listAccrual",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "integer",
                "minimum": 1,
                "maximum": 9007199254740991
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "default": 20,
                "type": "integer",
                "minimum": 1,
                "maximum": 100
              }
            },
            {
              "name": "leaveTypeId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            },
            {
              "name": "frequency",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "enum": [
                  "MONTHLY",
                  "YEARLY"
                ]
              }
            },
            {
              "name": "isActive",
              "required": false,
              "in": "query",
              "schema": {
                "type": "boolean"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Accrual policies retrieved"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing leave_policies:read"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "List accrual policies",
          "tags": [
            "leave-policies"
          ]
        }
      },
      "/api/v1/leave-policies/accrual/run": {
        "post": {
          "description": "Applies active accrual policies as of a date for eligible employees (ACTIVE/ON_LEAVE/PROBATION with dateOfJoining on or before asOfDate). Skips manually adjusted balances and duplicate periodKeys. Writes immutable ledger rows.",
          "operationId": "LeavePoliciesController_runAccrual",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "asOfDate": {
                      "type": "string",
                      "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
                    },
                    "leaveTypeId": {
                      "type": "string",
                      "minLength": 1
                    },
                    "employeeId": {
                      "type": "string",
                      "minLength": 1
                    }
                  },
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Accrual run completed"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing leave_policies:run"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Run leave accrual",
          "tags": [
            "leave-policies"
          ]
        }
      },
      "/api/v1/leave-policies/carry-forward": {
        "post": {
          "description": "HR/Admin configures year-scoped carry-forward for a leave type (enabled flag, max days, optional expiry months). Unique per leave type + effective year.",
          "operationId": "LeavePoliciesController_createCarryForward",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "leaveTypeId": {
                      "type": "string",
                      "minLength": 1
                    },
                    "enabled": {
                      "default": true,
                      "type": "boolean"
                    },
                    "maxCarryForwardDays": {
                      "type": "number",
                      "minimum": 0,
                      "maximum": 365
                    },
                    "expiryMonths": {
                      "type": "integer",
                      "minimum": 1,
                      "maximum": 24
                    },
                    "effectiveYear": {
                      "type": "integer",
                      "minimum": 2000,
                      "maximum": 2100
                    },
                    "isActive": {
                      "default": true,
                      "type": "boolean"
                    }
                  },
                  "required": [
                    "leaveTypeId",
                    "maxCarryForwardDays",
                    "effectiveYear"
                  ],
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Carry-forward policy created"
            },
            "400": {
              "description": "Validation failed or inactive leave type"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing leave_policies:create"
            },
            "404": {
              "description": "Leave type not found"
            },
            "409": {
              "description": "Policy already exists for leave type and year"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Create a carry-forward policy",
          "tags": [
            "leave-policies"
          ]
        },
        "get": {
          "description": "Paginated listing with filters: leaveTypeId, effectiveYear, isActive.",
          "operationId": "LeavePoliciesController_listCarryForward",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "integer",
                "minimum": 1,
                "maximum": 9007199254740991
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "default": 20,
                "type": "integer",
                "minimum": 1,
                "maximum": 100
              }
            },
            {
              "name": "leaveTypeId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            },
            {
              "name": "effectiveYear",
              "required": false,
              "in": "query",
              "schema": {
                "type": "integer",
                "minimum": 2000,
                "maximum": 2100
              }
            },
            {
              "name": "isActive",
              "required": false,
              "in": "query",
              "schema": {
                "type": "boolean"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Carry-forward policies retrieved"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing leave_policies:read"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "List carry-forward policies",
          "tags": [
            "leave-policies"
          ]
        }
      },
      "/api/v1/leave-policies/carry-forward/run": {
        "post": {
          "description": "Moves remaining leave into the next year up to maxCarryForwardDays. Policies with enabled=false are skipped. Manually adjusted target balances are not overwritten. Duplicate period keys are ignored.",
          "operationId": "LeavePoliciesController_runCarryForward",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "fromYear": {
                      "type": "integer",
                      "minimum": 2000,
                      "maximum": 2100
                    },
                    "toYear": {
                      "type": "integer",
                      "minimum": 2000,
                      "maximum": 2100
                    },
                    "leaveTypeId": {
                      "type": "string",
                      "minLength": 1
                    }
                  },
                  "required": [
                    "fromYear"
                  ],
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Carry-forward run completed"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing leave_policies:run"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Run year-end carry-forward",
          "tags": [
            "leave-policies"
          ]
        }
      },
      "/api/v1/leave-policies/carry-forward/expire": {
        "post": {
          "description": "Zeros unused carriedForwardDays after the policy expiryMonths window. Manually adjusted balances are skipped. Ledger rows use CARRY_FORWARD_EXPIRY.",
          "operationId": "LeavePoliciesController_expireCarryForward",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "year": {
                      "type": "integer",
                      "minimum": 2000,
                      "maximum": 2100
                    },
                    "asOfDate": {
                      "type": "string",
                      "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
                    },
                    "leaveTypeId": {
                      "type": "string",
                      "minLength": 1
                    }
                  },
                  "required": [
                    "year"
                  ],
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Carry-forward expiry run completed"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing leave_policies:run"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Expire carried-forward leave",
          "tags": [
            "leave-policies"
          ]
        }
      },
      "/api/v1/leave-encashments/policies": {
        "post": {
          "description": "HR configures which leave types can be encashed and the explicit ratePerDay. Employee salary/payroll fields do not exist in the schema — amount = days × ratePerDay.",
          "operationId": "LeaveEncashmentsController_createPolicy",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "leaveTypeId": {
                      "type": "string",
                      "minLength": 1
                    },
                    "ratePerDay": {
                      "type": "number",
                      "minimum": 0,
                      "exclusiveMinimum": true,
                      "maximum": 1000000
                    },
                    "currency": {
                      "default": "INR",
                      "type": "string",
                      "minLength": 3,
                      "maxLength": 3
                    },
                    "minDays": {
                      "default": 1,
                      "type": "number",
                      "minimum": 0,
                      "exclusiveMinimum": true,
                      "maximum": 365
                    },
                    "maxDaysPerRequest": {
                      "type": "number",
                      "minimum": 0,
                      "exclusiveMinimum": true,
                      "maximum": 365
                    },
                    "maxDaysPerYear": {
                      "type": "number",
                      "minimum": 0,
                      "exclusiveMinimum": true,
                      "maximum": 365
                    },
                    "effectiveFrom": {
                      "type": "string",
                      "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
                    },
                    "effectiveTo": {
                      "type": "string",
                      "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
                    },
                    "isActive": {
                      "default": true,
                      "type": "boolean"
                    }
                  },
                  "required": [
                    "leaveTypeId",
                    "ratePerDay",
                    "maxDaysPerRequest",
                    "effectiveFrom"
                  ],
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Encashment policy created"
            },
            "400": {
              "description": "Validation failed or unpaid leave type"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing leave_encashments:approve"
            },
            "404": {
              "description": "Leave type not found"
            },
            "409": {
              "description": "Overlapping policy exists"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Create an encashment policy",
          "tags": [
            "leave-encashments"
          ]
        },
        "get": {
          "operationId": "LeaveEncashmentsController_listPolicies",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "integer",
                "minimum": 1,
                "maximum": 9007199254740991
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "default": 20,
                "type": "integer",
                "minimum": 1,
                "maximum": 100
              }
            },
            {
              "name": "leaveTypeId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            },
            {
              "name": "isActive",
              "required": false,
              "in": "query",
              "schema": {
                "type": "boolean"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Encashment policies retrieved"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing leave_encashments:approve"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "List encashment policies",
          "tags": [
            "leave-encashments"
          ]
        }
      },
      "/api/v1/leave-encashments": {
        "post": {
          "description": "Keyed by employeeId. Requires an active LeaveEncashmentPolicy. Validates available balance (entitled + CF − approved/pending leave − pending/approved encashment). Amount is snapshot of days × policy.ratePerDay.",
          "operationId": "LeaveEncashmentsController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "employeeId": {
                      "type": "string",
                      "minLength": 1
                    },
                    "leaveTypeId": {
                      "type": "string",
                      "minLength": 1
                    },
                    "days": {
                      "type": "number",
                      "minimum": 0,
                      "exclusiveMinimum": true,
                      "maximum": 365
                    },
                    "year": {
                      "type": "integer",
                      "minimum": 2000,
                      "maximum": 2100
                    },
                    "reason": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 1000
                    }
                  },
                  "required": [
                    "employeeId",
                    "leaveTypeId",
                    "days"
                  ],
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Encashment request submitted"
            },
            "400": {
              "description": "Insufficient balance, no policy, or ineligible employee/type"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing leave_encashments:create"
            },
            "404": {
              "description": "Employee or leave type not found"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Submit a leave encashment request",
          "tags": [
            "leave-encashments"
          ]
        },
        "get": {
          "description": "Employees see own requests. Managers with leaves:approve see department team. HR with leave_encashments:approve see all.",
          "operationId": "LeaveEncashmentsController_findAll",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "integer",
                "minimum": 1,
                "maximum": 9007199254740991
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "default": 20,
                "type": "integer",
                "minimum": 1,
                "maximum": 100
              }
            },
            {
              "name": "employeeId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            },
            {
              "name": "leaveTypeId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            },
            {
              "name": "status",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "enum": [
                  "PENDING",
                  "APPROVED",
                  "REJECTED",
                  "CANCELLED"
                ]
              }
            },
            {
              "name": "year",
              "required": false,
              "in": "query",
              "schema": {
                "type": "integer",
                "minimum": 2000,
                "maximum": 2100
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Encashment requests retrieved"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing leave_encashments:read"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "List leave encashment requests",
          "tags": [
            "leave-encashments"
          ]
        }
      },
      "/api/v1/leave-encashments/{id}": {
        "get": {
          "operationId": "LeaveEncashmentsController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Encashment request retrieved"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing leave_encashments:read"
            },
            "404": {
              "description": "Request not found"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Get encashment request details",
          "tags": [
            "leave-encashments"
          ]
        }
      },
      "/api/v1/leave-encashments/{id}/approve": {
        "post": {
          "description": "Prisma transaction: re-validates available balance, increments EmployeeLeaveBalance.usedDays once, writes LeaveEncashmentTransaction, sets balanceDeducted=true. Concurrent double-approve is rejected.",
          "operationId": "LeaveEncashmentsController_approve",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "note": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 1000
                    }
                  },
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Encashment approved"
            },
            "400": {
              "description": "Insufficient balance"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing leave_encashments:approve"
            },
            "404": {
              "description": "Request not found"
            },
            "409": {
              "description": "Not pending or already deducted"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Approve encashment request",
          "tags": [
            "leave-encashments"
          ]
        }
      },
      "/api/v1/leave-encashments/{id}/reject": {
        "post": {
          "operationId": "LeaveEncashmentsController_reject",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "note": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 1000
                    }
                  },
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Encashment rejected"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing leave_encashments:reject"
            },
            "404": {
              "description": "Request not found"
            },
            "409": {
              "description": "Not pending"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Reject encashment request",
          "tags": [
            "leave-encashments"
          ]
        }
      },
      "/api/v1/leave-encashments/{id}/cancel": {
        "post": {
          "description": "Only PENDING requests. Own employeeId, department team (managers), or HR.",
          "operationId": "LeaveEncashmentsController_cancel",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "reason": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 1000
                    }
                  },
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Encashment cancelled"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing leave_encashments:cancel"
            },
            "404": {
              "description": "Request not found"
            },
            "409": {
              "description": "Not pending or already deducted"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Cancel encashment request",
          "tags": [
            "leave-encashments"
          ]
        }
      },
      "/api/v1/contact-requests": {
        "post": {
          "description": "Creates an OPEN contact request for the authenticated user's linked employee. employeeId, name, and email are never taken from the request body.",
          "operationId": "ContactRequestsController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "subject": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 200
                    },
                    "category": {
                      "type": "string",
                      "enum": [
                        "GENERAL",
                        "LEAVE",
                        "ATTENDANCE",
                        "PAYROLL",
                        "TECHNICAL",
                        "OTHER"
                      ]
                    },
                    "message": {
                      "type": "string",
                      "minLength": 1
                    }
                  },
                  "required": [
                    "subject",
                    "category",
                    "message"
                  ],
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Contact request created"
            },
            "400": {
              "description": "Validation failed or authenticated user is not linked to an employee"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing contact_requests:create"
            },
            "404": {
              "description": "Employee record not found"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Submit a contact request to administrators",
          "tags": [
            "contact-requests"
          ]
        },
        "get": {
          "description": "Paginated contact requests across all employees. Supports search by employee name/email, status, category, assignee, and sorting. Managers and employees without read_all cannot access this endpoint.",
          "operationId": "ContactRequestsController_findAll",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "type": "integer",
                "minimum": 1,
                "default": 1
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "type": "integer",
                "minimum": 1,
                "maximum": 100,
                "default": 10
              }
            },
            {
              "name": "search",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1,
                "maxLength": 200
              }
            },
            {
              "name": "status",
              "required": false,
              "in": "query",
              "schema": {
                "enum": [
                  "OPEN",
                  "IN_PROGRESS",
                  "RESOLVED",
                  "CLOSED"
                ],
                "type": "string"
              }
            },
            {
              "name": "category",
              "required": false,
              "in": "query",
              "schema": {
                "enum": [
                  "GENERAL",
                  "LEAVE",
                  "ATTENDANCE",
                  "PAYROLL",
                  "TECHNICAL",
                  "OTHER"
                ],
                "type": "string"
              }
            },
            {
              "name": "assignedToUserId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            },
            {
              "name": "sortBy",
              "required": false,
              "in": "query",
              "schema": {
                "enum": [
                  "createdAt",
                  "updatedAt"
                ],
                "type": "string"
              }
            },
            {
              "name": "sortOrder",
              "required": false,
              "in": "query",
              "schema": {
                "enum": [
                  "ASC",
                  "DESC"
                ],
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "All contact requests retrieved",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "success": true,
                      "message": "Contact requests retrieved",
                      "data": {
                        "requests": [
                          {
                            "id": "clx...",
                            "employeeId": "clx...",
                            "subject": "Leave Management",
                            "category": "GENERAL",
                            "status": "OPEN",
                            "createdAt": "2026-11-27T05:30:00.000Z",
                            "employee": {
                              "id": "clx...",
                              "firstName": "Ada",
                              "lastName": "Lovelace",
                              "email": "ada@example.com"
                            },
                            "assignedToUser": {
                              "id": "clx...",
                              "email": "hr@example.com",
                              "name": "Grace Hopper"
                            }
                          }
                        ],
                        "totalRecords": 1,
                        "currentPage": 1,
                        "totalPages": 1
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing contact_requests:read_all"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "List all contact requests (HR/Admin)",
          "tags": [
            "contact-requests"
          ]
        }
      },
      "/api/v1/contact-requests/my": {
        "get": {
          "description": "Returns paginated contact requests belonging only to the authenticated user's linked employee. Sorted by createdAt descending.",
          "operationId": "ContactRequestsController_findMine",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "type": "integer",
                "minimum": 1,
                "default": 1
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "type": "integer",
                "minimum": 1,
                "maximum": 100,
                "default": 10
              }
            },
            {
              "name": "status",
              "required": false,
              "in": "query",
              "schema": {
                "enum": [
                  "OPEN",
                  "IN_PROGRESS",
                  "RESOLVED",
                  "CLOSED"
                ],
                "type": "string"
              }
            },
            {
              "name": "category",
              "required": false,
              "in": "query",
              "schema": {
                "enum": [
                  "GENERAL",
                  "LEAVE",
                  "ATTENDANCE",
                  "PAYROLL",
                  "TECHNICAL",
                  "OTHER"
                ],
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Own contact requests retrieved"
            },
            "400": {
              "description": "Invalid query params or authenticated user is not linked to an employee"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing contact_requests:read"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "List my contact requests",
          "tags": [
            "contact-requests"
          ]
        }
      },
      "/api/v1/contact-requests/{id}": {
        "get": {
          "description": "HR/Admin with read_all may view any request. Employees may view only their own. Includes employee, assignee, and replies in chronological order.",
          "operationId": "ContactRequestsController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Contact request retrieved"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing permission or attempting to view another employee request"
            },
            "404": {
              "description": "Contact request not found"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Get contact request details",
          "tags": [
            "contact-requests"
          ]
        }
      },
      "/api/v1/contact-requests/{id}/replies": {
        "get": {
          "description": "Returns all replies for a request in chronological order (oldest first). HR/Admin with read_all may view any request; employees and managers may view only their own.",
          "operationId": "ContactRequestsController_listReplies",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Reply history retrieved",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "success": true,
                      "message": "Contact request replies retrieved",
                      "data": [
                        {
                          "id": "clx...",
                          "contactRequestId": "clx...",
                          "senderId": "clx...",
                          "message": "Your leave balance has been checked. Please refresh your dashboard.",
                          "createdAt": "2026-11-27T06:00:00.000Z",
                          "sender": {
                            "id": "clx...",
                            "email": "hr@example.com",
                            "name": "Grace Hopper",
                            "role": "HR_ADMIN",
                            "roles": [
                              "HR_ADMIN"
                            ]
                          }
                        }
                      ]
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing permission or attempting to view another employee conversation"
            },
            "404": {
              "description": "Contact request not found"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "List contact request replies",
          "tags": [
            "contact-requests"
          ]
        },
        "post": {
          "description": "Creates a ContactRequestReply. senderId is taken from the authenticated user and never from the request body. Employees and managers cannot create replies.",
          "operationId": "ContactRequestsController_createReply",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 5000
                    }
                  },
                  "required": [
                    "message"
                  ],
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Reply created",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "success": true,
                      "message": "Contact request reply created",
                      "data": {
                        "id": "clx...",
                        "contactRequestId": "clx...",
                        "senderId": "clx...",
                        "message": "Your leave balance has been checked. Please refresh your dashboard.",
                        "createdAt": "2026-11-27T06:00:00.000Z",
                        "sender": {
                          "id": "clx...",
                          "email": "hr@example.com",
                          "name": "Grace Hopper",
                          "role": "HR_ADMIN",
                          "roles": [
                            "HR_ADMIN"
                          ]
                        }
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Validation failed (empty or oversized message)"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing contact_requests:reply"
            },
            "404": {
              "description": "Contact request not found"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Add an HR/Admin reply to a contact request",
          "tags": [
            "contact-requests"
          ]
        }
      },
      "/api/v1/contact-requests/{id}/status": {
        "patch": {
          "description": "Updates status and optionally assigns an HR/Admin user. Assignment requires contact_requests:assign. resolvedAt is set when entering RESOLVED and cleared when leaving it.",
          "operationId": "ContactRequestsController_updateStatus",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "status": {
                      "type": "string",
                      "enum": [
                        "OPEN",
                        "IN_PROGRESS",
                        "RESOLVED",
                        "CLOSED"
                      ]
                    },
                    "assignedToUserId": {
                      "nullable": true,
                      "type": "string",
                      "minLength": 1
                    }
                  },
                  "required": [
                    "status"
                  ],
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Contact request status updated"
            },
            "400": {
              "description": "Validation failed or assignee is not an HR/Admin user"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing contact_requests:update or contact_requests:assign"
            },
            "404": {
              "description": "Contact request not found"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Update contact request status (HR/Admin)",
          "tags": [
            "contact-requests"
          ]
        }
      },
      "/api/v1/roles": {
        "get": {
          "description": "Paginated role list with optional search (name/code) and isActive/isSystem filters. Includes user and permission counts.",
          "operationId": "RolesController_findAll",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "integer",
                "minimum": 1,
                "maximum": 9007199254740991
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "default": 20,
                "type": "integer",
                "minimum": 1,
                "maximum": 100
              }
            },
            {
              "name": "search",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1,
                "maxLength": 120
              }
            },
            {
              "name": "isActive",
              "required": false,
              "in": "query",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "name": "isSystem",
              "required": false,
              "in": "query",
              "schema": {
                "type": "boolean"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Roles retrieved"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing roles:read permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "List roles",
          "tags": [
            "roles"
          ]
        },
        "post": {
          "description": "Creates a non-system role (`isSystem` is always false). Role codes must be unique UPPER_SNAKE_CASE values.",
          "operationId": "RolesController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "code": {
                      "type": "string",
                      "pattern": "^[A-Z][A-Z0-9_]{1,63}$"
                    },
                    "name": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 120
                    },
                    "description": {
                      "type": "string",
                      "maxLength": 500
                    },
                    "isActive": {
                      "default": true,
                      "type": "boolean"
                    }
                  },
                  "required": [
                    "code",
                    "name"
                  ],
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Role created"
            },
            "400": {
              "description": "Validation failed"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing roles:create permission"
            },
            "409": {
              "description": "Role code already exists"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Create a custom role",
          "tags": [
            "roles"
          ]
        }
      },
      "/api/v1/roles/{id}": {
        "patch": {
          "description": "Updates name, description, and/or isActive. Role `code` and `isSystem` are immutable via API. System roles cannot be deactivated.",
          "operationId": "RolesController_update",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "name": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 120
                    },
                    "description": {
                      "nullable": true,
                      "type": "string",
                      "maxLength": 500
                    },
                    "isActive": {
                      "type": "boolean"
                    }
                  },
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Role updated"
            },
            "400": {
              "description": "Validation failed or system role deactivation blocked"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing roles:update permission"
            },
            "404": {
              "description": "Role not found"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Update a role",
          "tags": [
            "roles"
          ]
        },
        "delete": {
          "description": "Deletes a non-system role that has no user assignments. System roles and assigned roles are protected.",
          "operationId": "RolesController_remove",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Role deleted"
            },
            "400": {
              "description": "System roles cannot be deleted"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing roles:delete permission"
            },
            "404": {
              "description": "Role not found"
            },
            "409": {
              "description": "Role still has user assignments or related references"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Delete a custom role",
          "tags": [
            "roles"
          ]
        }
      },
      "/api/v1/roles/{id}/permissions": {
        "post": {
          "description": "Sets the role permission list to exactly the provided unique permission IDs (replace-set, transactional, idempotent). SUPER_ADMIN mappings cannot be modified. Non-SUPER_ADMIN actors may only assign permissions they currently hold.",
          "operationId": "RolesController_assignPermissions",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "permissionIds": {
                      "maxItems": 500,
                      "type": "array",
                      "items": {
                        "type": "string",
                        "minLength": 1
                      }
                    }
                  },
                  "required": [
                    "permissionIds"
                  ],
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Role permissions updated"
            },
            "400": {
              "description": "Validation failed, missing permission IDs, or SUPER_ADMIN protection"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing roles:assign_permissions permission or privilege escalation blocked"
            },
            "404": {
              "description": "Role not found"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Replace role permissions",
          "tags": [
            "roles"
          ]
        }
      },
      "/api/v1/permissions": {
        "get": {
          "description": "Paginated permission catalog. Search matches `code` and `description` (Permission has no name field). Filter by `module`. Includes role usage count and related role codes.",
          "operationId": "PermissionsController_findAll",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "integer",
                "minimum": 1,
                "maximum": 9007199254740991
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "default": 20,
                "type": "integer",
                "minimum": 1,
                "maximum": 100
              }
            },
            {
              "name": "search",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1,
                "maxLength": 120
              }
            },
            {
              "name": "module",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1,
                "maxLength": 64
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Permissions retrieved"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing permissions:read permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "List permissions",
          "tags": [
            "permissions"
          ]
        }
      },
      "/api/v1/users": {
        "post": {
          "description": "Creates an active user with Argon2id password hashing. Legacy role and dynamic assignment default to EMPLOYEE. Role assignment is not accepted on this endpoint.",
          "operationId": "UsersController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "email": {
                      "type": "string"
                    },
                    "password": {
                      "type": "string",
                      "minLength": 8,
                      "maxLength": 128
                    },
                    "employeeId": {
                      "type": "string",
                      "minLength": 1
                    }
                  },
                  "required": [
                    "email",
                    "password"
                  ],
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "User created"
            },
            "400": {
              "description": "Validation failed or employee missing"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing users:create permission"
            },
            "409": {
              "description": "Email or employee link conflict"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Create a user account",
          "tags": [
            "users"
          ]
        },
        "get": {
          "description": "Paginated users with search by email and filters for legacy role, isActive, and dynamic roleCode. Never returns password hashes or token data.",
          "operationId": "UsersController_findAll",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "integer",
                "minimum": 1,
                "maximum": 9007199254740991
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "default": 20,
                "type": "integer",
                "minimum": 1,
                "maximum": 100
              }
            },
            {
              "name": "search",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "minLength": 1,
                "maxLength": 254
              }
            },
            {
              "name": "role",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "enum": [
                  "SUPER_ADMIN",
                  "HR_ADMIN",
                  "MANAGER",
                  "EMPLOYEE"
                ]
              }
            },
            {
              "name": "isActive",
              "required": false,
              "in": "query",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "name": "roleCode",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string",
                "pattern": "^[A-Z][A-Z0-9_]{1,63}$"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Users retrieved"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing users:read permission"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "List users",
          "tags": [
            "users"
          ]
        }
      },
      "/api/v1/users/{id}": {
        "get": {
          "description": "Returns user profile with dynamic role assignments and linked employee summary.",
          "operationId": "UsersController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "responses": {
            "200": {
              "description": "User retrieved"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing users:read permission"
            },
            "404": {
              "description": "User not found"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Get a user by id",
          "tags": [
            "users"
          ]
        },
        "patch": {
          "description": "Updates email and/or employee link only. Legacy role, isActive, password, and role assignments cannot be changed here.",
          "operationId": "UsersController_update",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "email": {
                      "type": "string"
                    },
                    "employeeId": {
                      "nullable": true,
                      "type": "string",
                      "minLength": 1
                    }
                  },
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "User updated"
            },
            "400": {
              "description": "Validation failed or employee missing"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing users:update permission"
            },
            "404": {
              "description": "User not found"
            },
            "409": {
              "description": "Email or employee link conflict"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Update a user",
          "tags": [
            "users"
          ]
        }
      },
      "/api/v1/users/{id}/deactivate": {
        "patch": {
          "description": "Sets isActive=false and revokes all active refresh tokens in one transaction. Idempotent if already inactive. Does not delete user or employee records.",
          "operationId": "UsersController_deactivate",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "responses": {
            "200": {
              "description": "User deactivated"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing users:deactivate permission"
            },
            "404": {
              "description": "User not found"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Deactivate a user",
          "tags": [
            "users"
          ]
        }
      },
      "/api/v1/users/{id}/roles": {
        "post": {
          "description": "Additive assignment of one or more active roles. Duplicate IDs are ignored. Actors cannot self-assign, cannot grant SUPER_ADMIN unless they are SUPER_ADMIN, and cannot grant roles with permissions they do not hold.",
          "operationId": "UsersController_assignRoles",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "roleIds": {
                      "minItems": 1,
                      "maxItems": 50,
                      "type": "array",
                      "items": {
                        "type": "string",
                        "minLength": 1
                      }
                    }
                  },
                  "required": [
                    "roleIds"
                  ],
                  "additionalProperties": false
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Roles assigned"
            },
            "400": {
              "description": "Validation failed, missing roles, or inactive roles"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing permission or privilege-escalation blocked"
            },
            "404": {
              "description": "User not found"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Assign roles to a user",
          "tags": [
            "users"
          ]
        }
      },
      "/api/v1/users/{id}/roles/{roleId}": {
        "delete": {
          "description": "Removes one role assignment. SUPER_ADMIN removals require a SUPER_ADMIN actor and cannot leave the system without an active SUPER_ADMIN.",
          "operationId": "UsersController_removeRole",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            },
            {
              "name": "roleId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string",
                "minLength": 1
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Role removed"
            },
            "401": {
              "description": "Missing or invalid access token"
            },
            "403": {
              "description": "Missing permission or SUPER_ADMIN removal blocked"
            },
            "404": {
              "description": "User or role assignment not found"
            },
            "409": {
              "description": "Would remove the last active SUPER_ADMIN assignment"
            }
          },
          "security": [
            {
              "access-token": []
            }
          ],
          "summary": "Remove a role from a user",
          "tags": [
            "users"
          ]
        }
      }
    },
    "info": {
      "title": "HireKarma HRMS",
      "description": "Backend API for HireKarma Private Limited HRMS — employees, departments, and workforce operations.",
      "version": "0.1.0",
      "contact": {}
    },
    "tags": [
      {
        "name": "health",
        "description": "Liveness and readiness checks"
      },
      {
        "name": "app",
        "description": "Application root"
      },
      {
        "name": "auth",
        "description": "Authentication"
      },
      {
        "name": "users",
        "description": "User management"
      },
      {
        "name": "roles",
        "description": "Role management"
      },
      {
        "name": "permissions",
        "description": "Permission catalog"
      },
      {
        "name": "employees",
        "description": "Employee onboarding (HRMS database)"
      },
      {
        "name": "dashboard",
        "description": "HR dashboard summary metrics"
      },
      {
        "name": "leaves",
        "description": "Leave applications and approvals"
      },
      {
        "name": "leave-types",
        "description": "Leave type catalog management"
      },
      {
        "name": "leave-policies",
        "description": "Leave accrual and carry-forward policies"
      },
      {
        "name": "holidays",
        "description": "Holiday calendar management"
      },
      {
        "name": "calendar",
        "description": "Office calendar and event management"
      },
      {
        "name": "calendar-views",
        "description": "Monthly, weekly, daily and yearly calendar views"
      },
      {
        "name": "calendar-export",
        "description": "Calendar PDF and Excel export"
      },
      {
        "name": "calendar-weekly-offs",
        "description": "Company weekly-off configuration"
      },
      {
        "name": "calendar-holidays",
        "description": "Holiday notifications"
      },
      {
        "name": "leave-encashments",
        "description": "Leave encashment requests and policies"
      },
      {
        "name": "contact-requests",
        "description": "Contact-administrator requests (employee submit/list own; HR/Admin manage)"
      },
      {
        "name": "leave-approval",
        "description": "Multi-level leave approval workflows"
      },
      {
        "name": "employee-leave-policies",
        "description": "Per-employee leave entitlements, dashboard, and LOP"
      },
      {
        "name": "biometric",
        "description": "TimeWatch biometric devices, punch sync into HRMS, and employee attendance (read-only)"
      },
      {
        "name": "uploads",
        "description": "S3 file uploads and asset URLs"
      },
      {
        "name": "organisation-onboarding",
        "description": "Temporary candidate onboarding accounts and forms"
      },
      {
        "name": "leads",
        "description": "Lead generation and pipeline"
      },
      {
        "name": "lead-sources",
        "description": "Lead source catalog"
      },
      {
        "name": "lead-categories",
        "description": "Lead category catalog"
      },
      {
        "name": "recruitment-jobs",
        "description": "Recruitment job posting management"
      },
      {
        "name": "recruitment-candidates",
        "description": "Recruitment candidate management"
      },
      {
        "name": "recruitment-resume",
        "description": "Recruitment resume parsing"
      },
      {
        "name": "recruitment-applications",
        "description": "Recruitment application pipeline"
      },
      {
        "name": "recruitment-interviews",
        "description": "Recruitment interview scheduling and feedback"
      },
      {
        "name": "recruitment-offers",
        "description": "Recruitment offer management"
      },
      {
        "name": "recruitment-analytics",
        "description": "Recruitment KPIs, trends and pipeline"
      },
      {
        "name": "recruitment-dashboard",
        "description": "Recruitment dashboard overview, recent applications, upcoming interviews and activity feed"
      }
    ],
    "servers": [],
    "components": {
      "securitySchemes": {
        "access-token": {
          "scheme": "bearer",
          "bearerFormat": "JWT",
          "type": "http",
          "description": "Short-lived access JWT from login/refresh. Send as `Authorization: Bearer <token>`. Logout and password changes revoke refresh tokens only; access JWTs remain valid until expiry."
        }
      },
      "schemas": {
        "UploadFileDto": {
          "type": "object",
          "properties": {
            "file": {
              "type": "string",
              "format": "binary",
              "description": "Any file format, max 10MB"
            },
            "folder": {
              "type": "string",
              "example": "onboarding/photos",
              "description": "Destination folder inside the bucket (letters, numbers, _ -; up to 3 segments)"
            }
          },
          "required": [
            "file",
            "folder"
          ]
        }
      }
    }
  },
  "customOptions": {}
};
  let url = options.swaggerUrl || window.location.origin
  let urls = options.swaggerUrls
  let customOptions = options.customOptions
  let spec1 = options.swaggerDoc
  let swaggerOptions = {
    spec: spec1,
    url: url,
    urls: urls,
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    plugins: [
      SwaggerUIBundle.plugins.DownloadUrl
    ],
    layout: "StandaloneLayout"
  }
  for (let attrname in customOptions) {
    swaggerOptions[attrname] = customOptions[attrname];
  }
  let ui = SwaggerUIBundle(swaggerOptions)

  if (customOptions.initOAuth) {
    ui.initOAuth(customOptions.initOAuth)
  }

  if (customOptions.authAction) {
    ui.authActions.authorize(customOptions.authAction)
  }
  
  window.ui = ui
}
