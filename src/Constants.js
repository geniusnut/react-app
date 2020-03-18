export const APP_NAME = "IMNut Web";

export const PHOTO_SIZE = 320;
export const PHOTO_THUMBNAIL_SIZE = 90;
export const PHOTO_DISPLAY_SIZE = 420;


export const SCROLL_PRECISION = 200;

export const ANIMATION_DURATION_100MS = 100;
export const ANIMATION_DURATION_200MS = 200;
export const ANIMATION_DURATION_300MS = 300;
export const ANIMATION_DURATION_500MS = 500;


export const WS_URL = process.env.NODE_ENV === "production" ? "wss://imweb.bapi.app/chat" : "wss://203.195.155.183:444";
const BASE_URL_PRODUCTION = 'https://sdk.b.app';
const BASE_URL_TEST = 'http://sdk.wdrange.com.cn';
const BASE_URL = process.env.NODE_ENV === "production" ? BASE_URL_PRODUCTION : BASE_URL_TEST;
export const AUTH_URL = BASE_URL + "/api/third/im/auth";
export const AUTH_INFO_URL = BASE_URL + "/api/third/im/authInfo";
export const CLIENT_PROFILE_URL = BASE_URL + "/api/im/userProfile";
export const CLIENT_UPLOAD_URL = BASE_URL + "/aapi/upload";

export const KEY_AUTH_STATE = 'auth';