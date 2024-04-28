type WPAppData = {
  publicUrlBase?: string;
};

declare const sa_app_data: WPAppData;

const getPublicUrlBase = () => {
  if (
    (window as any).sa_app_data &&
    sa_app_data?.publicUrlBase
  ) {
    return sa_app_data?.publicUrlBase;
  } else {
    return '';
  }
};

export default getPublicUrlBase;
