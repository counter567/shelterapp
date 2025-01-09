type WPAppData = {
  root?: string;
};

declare const sa_app_data: WPAppData;

const REST_URL = "http://localhost:8080/index.php?rest_route=/sa/v1/restData";
let root: string = "";

const getRoot = async () => {
  if (!root) {
    if (
      (window as any).sa_app_data &&
      sa_app_data?.root
    ) {
      root = sa_app_data?.root.slice(0, -1);
    } else {
      try {
        const result = await fetch(REST_URL);
        const data = await result.json();
        root = data.root.slice(0, -1);
      } catch (error) {
        console.error("Fehler beim Abrufen der Daten:", error);
        throw error;
      }
    }
  }
  return root;
};

export default getRoot;
