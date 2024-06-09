type WPAppData = {
  paypalAdress?: string;
};

declare const sa_app_data: WPAppData;

export const getPaypalAdress = () => {
  if (
    (window as any).sa_app_data &&
    sa_app_data?.paypalAdress
  ) {
    return sa_app_data?.paypalAdress;
  } else {
    return '';
  }
};
