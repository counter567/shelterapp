declare const sa_app_data: any;
let nonce: string = "";
let root: string = "";
const getNonce = async () => {
  if (!nonce || !root) {
    if (window["sa_app_data" as any] && sa_app_data?.nonce) {
      nonce = sa_app_data?.nonce;
      root = sa_app_data?.root;
    } else {
      const result = await fetch(
        "http://localhost:8080/index.php?rest_route=/sa/v1/restData"
      );
      const data = await result.json();
      nonce = data.nonce;
      root = data.root;
    }
  }
  return { nonce, root };
};

export default getNonce;
