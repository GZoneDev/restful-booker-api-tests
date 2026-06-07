export interface EnvironmentConfig {
  baseUrl: string;
}

export enum Environment {
  dev = "dev",
  qa = "qa",
  stage = "stage",
  prod = "prod",
}

export const environmentConfig: {
  [key in Environment | string]: EnvironmentConfig;
} = {
  dev: {
    baseUrl: "",
  },
  qa: {
    baseUrl: "",
  },
  stage: {
    baseUrl: "",
  },
  prod: {
    baseUrl: "https://restful-booker.herokuapp.com",
  },
};

export const authConfig = {
  credentials: {
    login: process.env.LOGIN || "",
    password: process.env.PASSWORD || "",
  },
};
