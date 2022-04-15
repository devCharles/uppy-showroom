import "@uppy/core/dist/style.css";
import "@uppy/dashboard/dist/style.css";
import "@uppy/webcam/dist/style.css";

import { useState, useEffect } from "react";
import Uppy from "@uppy/core";
import Transloadit from "@uppy/transloadit";
import Webcam from "@uppy/webcam";
import { Dashboard } from "@uppy/react";

export default function Home() {
  const [uppy, setUppy] = useState();
  const [imageUrl, setImageUrl] = useState(
    "https://pbs.twimg.com/media/EMnMjKkX0AAw1Pz.jpg"
  );

  // Esta funcion se ejecuta al terminar de subir el archivo
  const onCompleteUploadFiles = (assembly) => {
    // aqui pueden tomar la url de la imagen para ponerla en un estado y mandarla al API
    const image = assembly.results?.compress_image[0].ssl_url;
    setImageUrl(image);
  };

  useEffect(() => {
    /**
     * Usamos este useEffect para solo cargar el dashboard de lado del cliente
     * Asi evitamos errores por intentar cargar de lado del server
     */
    const uppyInstance = new Uppy({
      restrictions: {
        maxNumberOfFiles: 1, // para que solo pueda subir una imagen
      },
    })
      .use(Transloadit, {
        params: {
          auth: { key: process.env.NEXT_PUBLIC_TRANSLOADIT_AUTH_KEY },
          template_id: process.env.NEXT_PUBLIC_TRANSLOADIT_TEMPLATE_ID,
        },
        waitForEncoding: true,
      })
      .use(Webcam, {
        modes: ["picture"], // para que solo tome fotos
      })
      .on("transloadit:complete", onCompleteUploadFiles); // callback
    setUppy(uppyInstance);
  }, []);

  return (
    <>
      <h1>Uppy + Transloadit</h1>
      <div className="container">
        <div className="plugin">
          {uppy && (
            <Dashboard
              uppy={uppy}
              plugins={["Webcam"]}
              theme="auto"
              width={"100%"}
            />
          )}
        </div>
        <div className="image">
          <img src={imageUrl} alt="image" />
        </div>
      </div>
    </>
  );
}
