type WPAppData = {
  publicUrlBase?: string;
  routerBasePath?: string;
};

declare const sa_app_data: WPAppData;

export const getPublicUrlBase = () => {
  if (
    (window as any).sa_app_data &&
    sa_app_data?.publicUrlBase
  ) {
    return sa_app_data?.publicUrlBase;
  } else {
    return '';
  }
};


export const getRouterBasePath = () => {
  if (
    (window as any).sa_app_data &&
    sa_app_data?.routerBasePath
  ) {
    return sa_app_data?.routerBasePath;
  } else {
    return '';
  }
};


